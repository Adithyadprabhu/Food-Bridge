const admin = require('firebase-admin');
require('dotenv').config();

// To use Firebase Admin locally, download your serviceAccountKey.json from Firebase Console
// Project Settings > Service Accounts > Generate New Private Key
// Save it inside the backend folder as 'serviceAccountKey.json'
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin Initialized Successfully");
} catch (error) {
  console.warn("⚠️  serviceAccountKey.json not found! Please add it to the backend folder to connect to Firestore.");
  // Default app init in case it's deployed to GCP later
  if (!admin.apps.length) {
    admin.initializeApp();
  }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
