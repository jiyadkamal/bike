import admin from 'firebase-admin';

let db;

if (!admin.apps.length) {
    try {
        let serviceAccount;
        const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (serviceAccountRaw && serviceAccountRaw.trim().startsWith('{')) {
            // Support for the legacy JSON blob
            serviceAccount = JSON.parse(serviceAccountRaw);
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }
        } else {
            console.log('🔍 Checking granular Firebase environment variables...');

            // Priority: FIREBASE_ADMIN_* keys; Fallback: FIREBASE_* keys
            const projectId = (process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || '').trim().replace(/^["']|["']$/g, '');
            const clientEmail = (process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL || '').trim().replace(/^["']|["']$/g, '');
            let privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY || '').trim();

            if (privateKey) {
                // WHITELIST-BASED PEM CLEANER
                // Instead of trying to remove bad chars, ONLY KEEP valid base64 characters
                let base64Only = privateKey
                    .replace(/-----[^-]+-----/g, '')  // Remove all PEM boundaries
                    .replace(/[^A-Za-z0-9+/=]/g, ''); // ONLY keep valid base64 chars

                console.log('FB_BASE64_LEN:', base64Only.length);

                // Reconstruct perfect PEM with 64-char lines
                const chunks = base64Only.match(/.{1,64}/g) || [];
                privateKey = '-----BEGIN PRIVATE KEY-----\n' + chunks.join('\n') + '\n-----END PRIVATE KEY-----\n';
            }

            console.log('FB_PROJECT:', projectId ? 'SET' : 'MISSING');
            console.log('FB_EMAIL:', clientEmail ? 'SET' : 'MISSING');

            serviceAccount = {
                project_id: projectId,
                client_email: clientEmail,
                private_key: privateKey,
                projectId: projectId,
                clientEmail: clientEmail,
                privateKey: privateKey
            };

            const missing = [];
            if (!projectId) missing.push('FIREBASE_PROJECT_ID');
            if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
            if (!privateKey) missing.push('FIREBASE_PRIVATE_KEY');

            if (missing.length > 0) {
                throw new Error(`Firebase credentials incomplete. Missing: ${missing.join(', ')}`);
            }
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || `https://${serviceAccount.projectId || serviceAccount.project_id}-default-rtdb.firebaseio.com`
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
    console.error('❌ Failed to get Firebase Database reference');
}

export { admin, db };
