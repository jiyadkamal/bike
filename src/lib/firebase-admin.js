import admin from 'firebase-admin';

let db;

if (!admin.apps.length) {
    try {
        let serviceAccount;
        const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (serviceAccountRaw) {
            // Support for the legacy JSON blob
            serviceAccount = JSON.parse(serviceAccountRaw.replace(/\\n/g, "\\\\n").replace(/\n/g, "\\n"));
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        } else {
            console.log('🔍 Checking granular Firebase environment variables...');

            // Extract and clean variables (stripping potential external quotes from .env loaders)
            const projectId = process.env.FIREBASE_PROJECT_ID?.trim().replace(/^["'](.+)["']$/, '$1');
            const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim().replace(/^["'](.+)["']$/, '$1');
            let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/^["'](.+)["']$/, '$1');

            if (privateKey) {
                // Important: handle the escaped newlines in the private key string
                privateKey = privateKey.replace(/\\n/g, '\n');
            }

            console.log('FIREBASE_PROJECT_ID:', projectId ? 'SET' : 'MISSING');
            console.log('FIREBASE_CLIENT_EMAIL:', clientEmail ? 'SET' : 'MISSING');
            console.log('FIREBASE_PRIVATE_KEY:', privateKey ? 'SET' : 'MISSING');

            serviceAccount = {
                project_id: projectId,
                client_email: clientEmail,
                private_key: privateKey
            };

            const missing = [];
            if (!serviceAccount.project_id) missing.push('FIREBASE_PROJECT_ID');
            if (!serviceAccount.client_email) missing.push('FIREBASE_CLIENT_EMAIL');
            if (!serviceAccount.private_key) missing.push('FIREBASE_PRIVATE_KEY');

            if (missing.length > 0) {
                throw new Error(`Firebase credentials incomplete. Missing: ${missing.join(', ')}`);
            }
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
        });
        console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
        console.error('❌ Firebase Admin init error:', error.message);
    }
}

// Fail-safe database reference
try {
    db = admin.apps.length ? admin.database() : null;
} catch (e) {
    console.error('❌ Failed to bridge Firebase Database reference');
}

export { admin, db };
