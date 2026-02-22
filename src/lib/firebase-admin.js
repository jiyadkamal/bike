import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        let serviceAccount;
        const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (serviceAccountRaw) {
            // Support for the legacy JSON blob
            serviceAccount = JSON.parse(serviceAccountRaw.replace(/\\n/g, "\\\\n").replace(/\n/g, "\\n"));
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        } else {
            // Support for granular Netlify-friendly variables
            serviceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Handle the private key newline escaping specifically
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            };

            if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
                throw new Error('Firebase credentials are incomplete. Set FIREBASE_SERVICE_ACCOUNT or individual FIREBASE_* variables.');
            }
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${serviceAccount.projectId || serviceAccount.project_id}-default-rtdb.firebaseio.com`
        });
        console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
        console.error('❌ Firebase Admin init error:', error);
    }
}

const db = admin.database();
export { admin, db };
