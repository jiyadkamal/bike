import admin from 'firebase-admin';

let db;

if (!admin.apps.length) {
    try {
        let serviceAccount;
        const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (serviceAccountRaw && serviceAccountRaw.trim().startsWith('{')) {
            // Support for the legacy JSON blob
            serviceAccount = JSON.parse(serviceAccountRaw.replace(/\\n/g, "\\\\n").replace(/\n/g, "\\n"));
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        } else {
            console.log('🔍 Checking granular Firebase environment variables...');

            if (privateKey) {
                // SURGICAL DIAGNOSTICS
                console.log('FB_RAW_PK_PREFIX:', privateKey.substring(0, 30));
                console.log('FB_RAW_PK_SUFFIX:', privateKey.substring(privateKey.length - 30));

                // ULTIMATE PEM NORMALIZATION
                // 1. Extract raw base64 data regardless of how it's escaped or quoted
                let base64Only = privateKey
                    .replace(/-----\s*BEGIN[^-]*PRIVATE KEY\s*-----/i, '')
                    .replace(/-----\s*END[^-]*PRIVATE KEY\s*-----/i, '')
                    .replace(/\\n/g, '')  // Remove literal \n
                    .replace(/\n/g, '')    // Remove real newlines
                    .replace(/\s/g, '')    // Remove all whitespace
                    .replace(/["']/g, '')   // Remove all quotes
                    .trim();

                // 2. Reconstruct from scratch
                const chunks = base64Only.match(/.{1,64}/g) || [];
                privateKey = `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----\n`;
            }

            console.log('FB_PROJECT:', projectId ? 'SET' : 'MISSING');
            console.log('FB_EMAIL:', clientEmail ? 'SET' : 'MISSING');
            console.log('FB_PK_LEN:', privateKey ? privateKey.length : '0');
            console.log('FB_PK_BOUND:', privateKey?.startsWith('-----BEGIN') ? 'TRUE' : 'FALSE');

            // Provide BOTH snake_case and camelCase to satisfy all SDK versions
            serviceAccount = {
                project_id: projectId,
                client_email: clientEmail,
                private_key: privateKey,
                // camelCase fallbacks
                projectId: projectId,
                clientEmail: clientEmail,
                privateKey: privateKey
            };

            const missing = [];
            if (!serviceAccount.projectId && !serviceAccount.project_id) missing.push('FIREBASE_PROJECT_ID');
            if (!serviceAccount.clientEmail && !serviceAccount.client_email) missing.push('FIREBASE_CLIENT_EMAIL');
            if (!serviceAccount.privateKey && !serviceAccount.private_key) missing.push('FIREBASE_PRIVATE_KEY');

            if (missing.length > 0) {
                throw new Error(`Firebase credentials incomplete. Missing: ${missing.join(', ')}`);
            }
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || `https://${serviceAccount.projectId}-default-rtdb.firebaseio.com`
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
