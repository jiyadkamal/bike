const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
// Fix for bad control characters and literal newlines
const serviceAccount = JSON.parse(serviceAccountRaw.replace(/\\n/g, "\\\\n").replace(/\n/g, "\\n"));
// One more pass to turn \\n into actual \n for the cert function
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
});

const db = admin.database();

module.exports = { admin, db };
