/**
 * Firebase Cloud Functions + Firestore + Express example
 * ------------------------------------------------------
 * Demonstrates the following routes (1-14):
 *
 *   1.  GET /auth/getCountryCodes
 *   2.  POST /auth/request-otp
 *   3.  POST /auth/verify-otp
 *   4.  POST /tables               (Create new table)
 *   5.  GET /tables/hosted         (List tables for host)
 *   6.  GET /tables                (List public tables, simplified)
 *   7.  GET /tables/:tableId       (Get single table details)
 *   8.  DELETE /tables/:tableId    (Remove a hosted table)
 *   9.  POST /tables/:tableId/bids (User inquires/joins => create bid)
 *   10. GET /tables/:tableId/bids  (Host sees bids)
 *   11. PATCH /tables/:tid/bids/:bidId (Host approves/denies a bid)
 *   12. GET /bids?mine=true        (User sees own inquiries)
 *   13. DELETE /bids/:bidId        (User cancels a pending inquiry)
 *   14. DELETE /tables/:tid/members/:userId (Host removes an accepted member)
 *
 * Each table is stored in "tables" collection.
 * Each bid is stored in "bids" collection, referencing a tableId & userId.
 *
 * For phone-OTP, we store ephemeral data in "phoneOtps" collection.
 * In production, you'd use a more robust approach (Firebase Auth, Twilio, etc.).
 */

 const functions = require('firebase-functions');
 const admin = require('firebase-admin');
 const express = require('express');
 const cors = require('cors');
 const crypto = require('crypto'); // For session token generation
 
 admin.initializeApp();
 const db = admin.firestore();
 
 const app = express();
 app.use(cors({ origin: true }));
 app.use(express.json());
 
 /** ──────────────────────────────────────────────────────────────────────────
  *  1. GET /auth/getCountryCodes
  *     Returns an array of { name, phoneNumberCode, isoCode }
  *     For demonstration, returning a short sample subset.
  *  ──────────────────────────────────────────────────────────────────────────
  */
 app.get('/auth/getCountryCodes', async (req, res) => {
   const countries = [
     { name: 'United States', phoneNumberCode: '1', isoCode: 'US' },
     { name: 'Canada', phoneNumberCode: '1', isoCode: 'CA' },
     { name: 'United Kingdom', phoneNumberCode: '44', isoCode: 'GB' },
     { name: 'India', phoneNumberCode: '91', isoCode: 'IN' },
     // Add more as needed...
   ];
   return res.json({ status: true, data: countries });
 });
 
 /** ──────────────────────────────────────────────────────────────────────────
  *  2. POST /auth/request-otp
  *     Body: { phoneNumber: "+15551234567" }
  *     Generates a 6-digit OTP, stores in "phoneOtps" doc with ID=phoneNumber.
  *     Real-world usage: send OTP via Twilio or Firebase Auth phone sign-in.
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
 
     await db.collection('phoneOtps').doc(phoneNumber).set({
       otp,
       createdAt: admin.firestore.FieldValue.serverTimestamp(),
     });
 
     // In production, you'd send this OTP via Twilio or other SMS service
     functions.logger.info(`OTP for ${phoneNumber}: ${otp}`);
 
     return res.json({ success: true, message: 'OTP generated & (pretend) sent.' });
   } catch (error) {
     functions.logger.error(error);
     return res.status(500).json({ error: error.message });
   }
 });
 
 /** ──────────────────────────────────────────────────────────────────────────
  *  3. POST /auth/verify-otp
  *     Body: { phoneNumber, otp }
  *     If valid, create/update a user doc in "users", generate a sessionToken.
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
 
     // If OTP matches, create/update user doc
     await db.collection('users').doc(phoneNumber).set(
       {
         phoneNumber,
         updatedAt: admin.firestore.FieldValue.serverTimestamp(),
       },
       { merge: true }
     );
 
     // Generate a naive session token
     const sessionToken = crypto.randomBytes(16).toString('hex');
 
     // Store sessionToken in user doc
     await db.collection('users').doc(phoneNumber).update({
       sessionToken,
     });
 
     // Clean up the OTP doc
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
  * Middleware to authenticate via a naive session token in the header x-auth-token
  * Attaches user info to req.user if valid.
  */
 async function authenticate(req, res, next) {
   try {
     const token = req.headers['x-auth-token'];
     if (!token) {
       return res.status(401).json({ error: 'No x-auth-token provided' });
     }
 
     const usersRef = db.collection('users');
     const snapshot = await usersRef.where('sessionToken', '==', token).limit(1).get();
     if (snapshot.empty) {
       return res.status(401).json({ error: 'Invalid sessionToken' });
     }
 
     const userDoc = snapshot.docs[0];
     req.user = userDoc.data();
     req.user.id = userDoc.id; // phoneNumber as doc ID
     return next();
   } catch (err) {
     functions.logger.error(err);
     return res.status(500).json({ error: err.message });
   }
 }
 
 /** ──────────────────────────────────────────────────────────────────────────
  *  4. POST /tables
  *     Body: table form data (tableName, clubName, minJoiningFee, etc.)
  *     The host is the current user.
  *  ──────────────────────────────────────────────────────────────────────────
  */
 app.post('/tables', authenticate, async (req, res) => {
   try {
     const tableData = req.body;
     tableData.hostId = req.user.id; // phoneNumber
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
  *     Lists all tables where hostId == current user’s ID
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
  *  6. GET /tables
  *     Lists all tables (or you can filter by public if you have that logic).
  *  ──────────────────────────────────────────────────────────────────────────
  */
 app.get('/tables', async (req, res) => {
   try {
     // For demonstration, we just return all:
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
  *     Return a single table’s details
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
  *     Host can remove a table if it belongs to them
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
  *     A user inquires/joins => create a "bid" doc with status="pending"
  *  ──────────────────────────────────────────────────────────────────────────
  */
 app.post('/tables/:tableId/bids', authenticate, async (req, res) => {
   try {
     const { tableId } = req.params;
     const body = req.body; // e.g. { creditCard, bidAmount, phoneNumber, ... }
 
     const newBid = {
       tableId,
       userId: req.user.id,
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
  * 10. GET /tables/:tableId/bids
  *     Host sees all bids for that table
  *  ──────────────────────────────────────────────────────────────────────────
  */
 app.get('/tables/:tableId/bids', authenticate, async (req, res) => {
   try {
     const { tableId } = req.params;
 
     // Check ownership
     const tableDoc = await db.collection('tables').doc(tableId).get();
     if (!tableDoc.exists) {
       return res.status(404).json({ error: 'Table not found' });
     }
     const tableData = tableDoc.data();
     if (tableData.hostId !== req.user.id) {
       return res.status(403).json({ error: 'Not your table' });
     }
 
     // Fetch bids
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
  * 11. PATCH /tables/:tableId/bids/:bidId
  *     Host approves/denies a bid => { status: "approved" | "denied" }
  *  ──────────────────────────────────────────────────────────────────────────
  */
 app.patch('/tables/:tableId/bids/:bidId', authenticate, async (req, res) => {
   try {
     const { tableId, bidId } = req.params;
     const { status } = req.body; // "approved" or "denied"
 
     // Check table ownership
     const tableDoc = await db.collection('tables').doc(tableId).get();
     if (!tableDoc.exists) {
       return res.status(404).json({ error: 'Table not found' });
     }
     const tableData = tableDoc.data();
     if (tableData.hostId !== req.user.id) {
       return res.status(403).json({ error: 'Not your table' });
     }
 
     // Validate status
     if (!['approved', 'denied'].includes(status)) {
       return res.status(400).json({ error: 'Invalid status' });
     }
 
     // Update the bid
     const bidRef = db.collection('bids').doc(bidId);
     const bidSnap = await bidRef.get();
     if (!bidSnap.exists) {
       return res.status(404).json({ error: 'Bid not found' });
     }
 
     await bidRef.update({ status });
     return res.json({ success: true, message: `Bid marked as ${status}` });
   } catch (error) {
     functions.logger.error(error);
     return res.status(500).json({ error: error.message });
   }
 });
 
 /** ──────────────────────────────────────────────────────────────────────────
  * 12. GET /bids?mine=true
  *     The user sees their own bids
  *  ──────────────────────────────────────────────────────────────────────────
  */
 app.get('/bids', authenticate, async (req, res) => {
   try {
     const mine = req.query.mine === 'true';
     if (!mine) {
       return res.status(400).json({ error: 'Missing or invalid query param ?mine=true' });
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
  * 13. DELETE /bids/:bidId
  *     The user can cancel a pending bid if they own it
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
       return res.status(400).json({ error: 'Cannot remove a bid that is not pending' });
     }
 
     await bidRef.delete();
     return res.json({ success: true, message: 'Bid removed' });
   } catch (error) {
     functions.logger.error(error);
     return res.status(500).json({ error: error.message });
   }
 });
 
 /** ──────────────────────────────────────────────────────────────────────────
  * 14. DELETE /tables/:tableId/members/:userId
  *     The host forcibly removes an already accepted member from the table.
  *     We'll interpret "accepted" as a bid doc with status="approved" 
  *     for that user on this table. We'll delete that bid doc. 
  *  ──────────────────────────────────────────────────────────────────────────
  */
 app.delete('/tables/:tableId/members/:userId', authenticate, async (req, res) => {
   try {
     const { tableId, userId } = req.params;
 
     // 1) Verify that the table belongs to the authenticated user
     const tableDoc = await db.collection('tables').doc(tableId).get();
     if (!tableDoc.exists) {
       return res.status(404).json({ error: 'Table not found' });
     }
     const tableData = tableDoc.data();
     if (tableData.hostId !== req.user.id) {
       return res.status(403).json({ error: 'Not your table' });
     }
 
     // 2) Find a bid doc with tableId == tableId, userId == userId, status="approved"
     const snapshot = await db
       .collection('bids')
       .where('tableId', '==', tableId)
       .where('userId', '==', userId)
       .where('status', '==', 'approved')
       .limit(1)
       .get();
 
     if (snapshot.empty) {
       return res
         .status(404)
         .json({ error: 'No approved/accepted bid found for that user on this table' });
     }
 
     // 3) We'll remove that doc, effectively removing them from the table
     const bidDoc = snapshot.docs[0];
     await bidDoc.ref.delete();
 
     return res.json({ success: true, message: 'Member removed from the table' });
   } catch (error) {
     functions.logger.error(error);
     return res.status(500).json({ error: error.message });
   }
 });
 
 /**
  * Finally, export the Express app as a Firebase Cloud Function
  */
 exports.api = functions.https.onRequest(app);