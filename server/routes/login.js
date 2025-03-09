// routes/login.js

const express = require('express');
const router = express.Router();
const { Country, State, City } = require("country-state-city");
const passport = require('passport')
const jwt = require("jsonwebtoken");
const Bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

// Example route: GET /auth/getCountryCodes
router.get("/getCountryCodes", async (req, res) => {
  try {
    const countries = Country.getAllCountries().map((ele) => {
      return {
        name: ele.name,
        phoneNumberCode: ele.phonecode,
        isoCode: ele.isoCode,
      };
    });
    return res.status(200).json({ status: true, data: countries });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
});

// Export the router so server.js can mount it
module.exports = router;