/* 
   Firebase Cloud Functions + Firestore + Express example
   ------------------------------------------------------
   Demonstrates:

   1. /auth/getCountryCodes  -> returns an array of codes
   2. /auth/request-otp      -> create & send OTP to phone
   3. /auth/verify-otp       -> verify OTP & create user
   4. /tables                -> create new table
   5. /tables/hosted         -> list tables for the host
   6. /tables?public=true    -> list public tables (for listing)
   7. /tables/:tableId       -> get single table details
   8. DELETE /tables/:tableId-> remove a hosted table
   9. POST /tables/:id/bids  -> user inquires/joins table
   10. GET /tables/:id/bids  -> host sees bids
   11. PATCH /tables/:id/bids/:bidId -> host approves/denies
   12. GET /bids?mine=true   -> user sees own inquiries
   13. DELETE /bids/:bidId   -> user cancels a pending inquiry

   This code uses Firestore as the DB. 
   For phone OTP, we do a simplified approach storing OTP in Firestore. 
   In real production, you'd likely integrate Twilio or Firebase Phone Auth.
*/

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
// For OTP generation, we can use crypto or a simpler approach
const crypto = require('crypto');

// Initialize the Firebase admin SDK
admin.initializeApp();

const db = admin.firestore();

// Create Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

/** ──────────────────────────────────────────────────────────────────────────
 *  1. GET /auth/getCountryCodes
 *  Returns an array of { name, phoneNumberCode, isoCode }
 *  In a real app, you might store these in Firestore or just a local array
 *  for demonstration. We'll return a short sample.
 *  ──────────────────────────────────────────────────────────────────────────
 */
app.get('/auth/getCountryCodes', async (req, res) => {
  // Example subset only:
  const countries = [
    { name: 'United States', phoneNumberCode: '1', isoCode: 'US' },
    { name: 'Canada', phoneNumberCode: '1', isoCode: 'CA' },
    { name: 'United Kingdom', phoneNumberCode: '44', isoCode: 'GB' },
    { name: 'India', phoneNumberCode: '91', isoCode: 'IN' },
    // ...
  ];
  return res.json({ status: true, data: countries });
});

/** ──────────────────────────────────────────────────────────────────────────
 *  2. POST /auth/request-otp
 *  Body: { phoneNumber: "+15551234567" }
 *  We'll store an OTP in Firestore, in a collection "phoneOtps".
 *  In a real scenario, you'd send an SMS via Twilio or similar.
 *  ──────────────────────────────────────────────────────────────────────────
 */
app.post('/auth/request-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Missing phoneNumber' });
    }

    // Generate a random 6-digit OTP
    const otp = (Math.floor(Math.random() * 900000) + 100000).toString();

    // Alternatively, you could store a hashed version, but we'll store plain
    await db.collection('phoneOtps').doc(phoneNumber).set({
      otp,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // TODO: send this OTP via Twilio or other SMS provider
    functions.logger.info(`OTP for ${phoneNumber}: ${otp}`);

    return res.json({ success: true, message: 'OTP generated & (pretend) sent.' });
  } catch (error) {
    functions.logger.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/** ──────────────────────────────────────────────────────────────────────────
 *  3. POST /auth/verify-otp
 *  Body: { phoneNumber, otp }
 *  If correct, create a user doc in "users" collection (if not exist).
 *  Return a simple "sessionToken" (not secure) for demonstration.
 *  ──────────────────────────────────────────────────────────────────────────
 */
app.post('/auth/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: 'Missing phoneNumber or otp' });
    }

    const docRef = db.collection('phoneOtps').doc(phoneNumber);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(400).json({ error: 'No OTP requested for this phone' });
    }

    const data = docSnap.data();
    if (data.otp !== otp) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // If OTP matches, create or update user in "users" collection
    await db.collection('users').doc(phoneNumber).set(
      {
        phoneNumber,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // For demonstration, create a naive session token
    const sessionToken = crypto.randomBytes(16).toString('hex');

    // Store the sessionToken in user doc (or a separate store)
    await db.collection('users').doc(phoneNumber).update({
      sessionToken,
    });

    // Clean up the phoneOtps doc
    await docRef.delete();

    return res.json({
      success: true,
      sessionToken,
      phoneNumber,
    });
  } catch (error) {
    functions.logger.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/** 
 * Helper: Check session token from request headers, 
 * find user in DB, and attach user info to req.user.
*/
async function authenticate(req, res, next) {
  try {
    const token = req.headers['x-auth-token'];
    if (!token) {
      return res.status(401).json({ error: 'No x-auth-token provided' });
    }
    // Find user with this sessionToken
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('sessionToken', '==', token).limit(1).get();
    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid sessionToken' });
    }
    const userDoc = snapshot.docs[0];
    req.user = userDoc.data(); // e.g. { phoneNumber, sessionToken, ... }
    req.user.id = userDoc.id;  // phoneNumber as doc ID
    return next();
  } catch (err) {
    functions.logger.error(err);
    return res.status(500).json({ error: err.message });
  }
}

/** ──────────────────────────────────────────────────────────────────────────
 *  4. POST /tables
 *  Body: the table form. The logged-in user is the "host" in practice.
 *  We'll store in "tables" collection with doc ID auto-generated.
 *  ──────────────────────────────────────────────────────────────────────────
 */
app.post('/tables', authenticate, async (req, res) => {
  try {
    // For brevity, no advanced validation
    const tableData = req.body;
    // The host is the authenticated user:
    tableData.hostId = req.user.id;  // e.g. phoneNumber
    tableData.createdAt = admin.firestore.FieldValue.serverTimestamp();

    const newDocRef = await db.collection('tables').add(tableData);

    return res.json({ success: true, tableId: newDocRef.id });
  } catch (error) {
    functions.logger.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/** ──────────────────────────────────────────────────────────────────────────
 *  5. GET /tables/hosted
 *  Return all tables where hostId == current user’s ID
 *  ──────────────────────────────────────────────────────────────────────────
 */
app.get('/tables/hosted', authenticate, async (req, res) => {
  try {
    const snapshot = await db
      .collection('tables')
      .where('hostId', '==', req.user.id)
      .get();

    const results = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.json({ success: true, data: results });
  } catch (error) {
    functions.logger.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/** ──────────────────────────────────────────────────────────────────────────
 *  6. GET /tables (maybe with ?public=true)
 *  We'll assume all are "public" for demonstration. 
 *  You might have a field "isPublic: true" in your table doc.
 *  ──────────────────────────────────────────────────────────────────────────
 */
app.get('/tables', async (req, res) => {
  try {
    // If you have a "public" field, do:
    // const isPublic = req.query.public === 'true';
    // let query = db.collection('tables');
    // if (isPublic) query = query.where('isPublic', '==', true);

    const snapshot = await db.collection('tables').get();
    const results = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.json({ success: true, data: results });
  } catch (error) {
    functions.logger.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/** ──────────────────────────────────────────────────────────────────────────
 *  7. GET /tables/:tableId
 *  Return a single table’s details
 *  ──────────────────────────────────────────────────────────────────────────
 */
app.get('/tables/:tableId', async (req, res) => {
  try {
    const docRef = db.collection('tables').doc(req.params.tableId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Table not found' });
    }
    return res.json({ success: true, data: { id: docSnap.id, ...docSnap.data() } });
  } catch (error) {
    functions.logger.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/** ──────────────────────────────────────────────────────────────────────────
 *  8. DELETE /tables/:tableId
 *  Host can remove a table if it belongs to them
 *  ──────────────────────────────────────────────────────────────────────────
 */
app.delete('/tables/:tableId', authenticate, async (req, res) => {
  try {
    const docRef = db.collection('tables').doc(req.params.tableId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Table not found' });
    }
    const tableData = docSnap.data();
    if (tableData.hostId !== req.user.id) {
      return res.status(403).json({ error: 'Not your table' });
    }

    await docRef.delete();
    return res.json({ success: true, message: 'Table removed' });
  } catch (error) {
    functions.logger.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/** ──────────────────────────────────────────────────────────────────────────
 *  9. POST /tables/:tableId/bids
 *  A user inquires/joins => create a "bid" doc in a "bids" collection
 *  We'll store status="pending"
 *  ──────────────────────────────────────────────────────────────────────────
 */
app.post('/tables/:tableId/bids', authenticate, async (req, res) => {
  try {
    const { tableId } = req.params;
    const body = req.body; // { creditCard, bidAmount, ... }

    // Create a new doc in "bids" subcollection or a top-level "bids" with references
    // We'll do top-level "bids" for simplicity
    const newBid = {
      tableId,
      userId: req.user.id, // who is placing the bid
      status: 'pending',
      ...body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('bids').add(newBid);
    return res.json({ success: true, bidId: docRef.id });
  } catch (error) {
    functions.logger.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/** ──────────────────────────────────────────────────────────────────────────
 *  10. GET /tables/:tableId/bids
 *  Host fetches all bids for that table
 *  We'll check if user is the host first
 *  ──────────────────────────────────────────────────────────────────────────
 */
app.get('/tables/:tableId/bids', authenticate, async (req, res) => {
  try {
    const { tableId } = req.params;
    // Check if the table belongs to user
    const tableDoc = await db.collection('tables').doc(tableId).get();
    if (!tableDoc.exists) {
      return res.status(404).json({ error: 'Table not found' });
    }
    const tableData = tableDoc.data();
    if (tableData.hostId !== req.user.id) {
      return res.status(403).json({ error: 'Not your table' });
    }

    // Fetch bids for that table
    const snapshot = await db
      .collection('bids')
      .where('tableId', '==', tableId)
      .get();

    const bids = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({ success: true, data: bids });
  } catch (error) {
    functions.logger.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/** ──────────────────────────────────────────────────────────────────────────
 *  11. PATCH /tables/:tableId/bids/:bidId
 *  Host approves/denies a bid => { status: "approved" | "denied" }
 *  ──────────────────────────────────────────────────────────────────────────
 */
app.patch('/tables/:tableId/bids/:bidId', authenticate, async (req, res) => {
  try {
    const { tableId, bidId } = req.params;
    const { status } = req.body; // "approved" or "denied"

    // Check if the table belongs to user
    const tableDoc = await db.collection('tables').doc(tableId).get();
    if (!tableDoc.exists) {
      return res.status(404).json({ error: 'Table not found' });
    }
    const tableData = tableDoc.data();
    if (tableData.hostId !== req.user.id) {
      return res.status(403).json({ error: 'Not your table' });
    }

    // Update the bid
    const bidRef = db.collection('bids').doc(bidId);
    const bidSnap = await bidRef.get();
    if (!bidSnap.exists) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    if (!['approved', 'denied'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await bidRef.update({ status });
    return res.json({ success: true, message: `Bid ${status}` });
  } catch (error) {
    functions.logger.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/** ──────────────────────────────────────────────────────────────────────────
 *  12. GET /bids?mine=true
 *  Return the user’s own bids (pending or accepted).
 *  ──────────────────────────────────────────────────────────────────────────
 */
app.get('/bids', authenticate, async (req, res) => {
  try {
    // If ?mine=true, filter by userId
    const mine = req.query.mine === 'true';
    if (!mine) {
      // or handle other query logic
      return res.status(400).json({ error: 'Missing or invalid query param' });
    }

    const snapshot = await db
      .collection('bids')
      .where('userId', '==', req.user.id)
      .get();

    const results = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.json({ success: true, data: results });
  } catch (error) {
    functions.logger.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/** ──────────────────────────────────────────────────────────────────────────
 *  13. DELETE /bids/:bidId
 *  A user can cancel a pending bid if they are the owner
 *  ──────────────────────────────────────────────────────────────────────────
 */
app.delete('/bids/:bidId', authenticate, async (req, res) => {
  try {
    const { bidId } = req.params;
    const bidRef = db.collection('bids').doc(bidId);
    const bidSnap = await bidRef.get();
    if (!bidSnap.exists) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    const bidData = bidSnap.data();
    if (bidData.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not your bid' });
    }
    if (bidData.status !== 'pending') {
      return res
        .status(400)
        .json({ error: 'Cannot remove a bid that is not pending' });
    }

    await bidRef.delete();
    return res.json({ success: true, message: 'Bid removed' });
  } catch (error) {
    functions.logger.error(error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Finally, export the express app as a Firebase Cloud Function
 */
exports.api = functions.https.onRequest(app);