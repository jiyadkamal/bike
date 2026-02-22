import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
        if (!serviceAccountRaw) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
        }

        // Fix for bad control characters and literal newlines in env var strings
        const serviceAccount = JSON.parse(serviceAccountRaw.replace(/\\n/g, "\\\\n").replace(/\n/g, "\\n"));
        // One more pass to turn \\n into actual \n for the cert function
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
        });
        console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
        console.error('❌ Firebase Admin init error:', error);
    }
}

const db = admin.database();
export { admin, db };
