import admin from 'firebase-admin';

let db;

if (!admin.apps.length) {
    try {
        let serviceAccount;
        const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (serviceAccountRaw && serviceAccountRaw.trim().startsWith('{')) {
            // Path A: Full JSON service account blob
            serviceAccount = JSON.parse(serviceAccountRaw);
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }
        } else {
            // Path B: Granular environment variables
            const projectId = (process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || '').trim().replace(/^["']|["']$/g, '');
            const clientEmail = (process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL || '').trim().replace(/^["']|["']$/g, '');
            const rawKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY || '').trim();

            let privateKey = '';

            if (rawKey) {
                // STEP 1: Convert ALL escape sequences to real characters FIRST
                // This is critical for Netlify/Vercel where \n is stored as literal text
                const normalized = rawKey
                    .replace(/\\n/g, '\n')
                    .replace(/\\r/g, '')
                    .replace(/^["']|["']$/g, '');

                // STEP 2: Extract ONLY valid base64 characters (whitelist approach)
                // This eliminates invisible Unicode chars, stray quotes, newlines, etc.
                const base64Only = normalized
                    .replace(/-----[^-]+-----/g, '')
                    .replace(/[^A-Za-z0-9+/=]/g, '');

                // STEP 3: Reconstruct a perfect PEM structure from clean base64
                const lines = base64Only.match(/.{1,64}/g) || [];
                privateKey = [
                    '-----BEGIN PRIVATE KEY-----',
                    ...lines,
                    '-----END PRIVATE KEY-----',
                    ''
                ].join('\n');
            }

            serviceAccount = {
                project_id: projectId,
                client_email: clientEmail,
                private_key: privateKey,
            };

            const missing = [];
            if (!projectId) missing.push('project_id');
            if (!clientEmail) missing.push('client_email');
            if (!privateKey) missing.push('private_key');
            if (missing.length > 0) {
                throw new Error(`Firebase credentials incomplete: ${missing.join(', ')}`);
            }
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
                || `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`,
        });
        console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
        console.error('❌ Firebase Admin init error:', error.message);
    }
}

try {
    db = admin.apps.length ? admin.database() : null;
} catch (e) {
    console.error('❌ Database ref error:', e.message);
}

export { admin, db };
