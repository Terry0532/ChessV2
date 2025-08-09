require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = require(process.env.KEY_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

module.exports = admin;
