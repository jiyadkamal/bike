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

            // Priority: FIREBASE_ADMIN_* keys; Fallback: FIREBASE_* keys
            const projectId = (process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID)?.trim().replace(/^["']|["']$/g, '');
            const clientEmail = (process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL)?.trim().replace(/^["']|["']$/g, '');
            let privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY)?.trim();

            if (privateKey) {
                // INDUSTRIAL STRENGTH PEM CLEANER
                // 1. Purge all artifacts (quotes, escaped \n, boundaries, and whitespace)
                let base64Core = privateKey
                    .replace(/^["']|["']$/g, '')                                 // Strip wrapping quotes
                    .replace(/\\n/g, '\n')                                       // Convert literal \n to newlines
                    .replace(/-----\s*BEGIN[^-]*PRIVATE KEY\s*-----/i, '')       // Flex-remove prefix
                    .replace(/-----\s*END[^-]*PRIVATE KEY\s*-----/i, '')         // Flex-remove suffix
                    .replace(/\s/g, '');                                         // Purge ALL internal whitespace

                // 2. Re-wrap into standard 64-character segments
                const segments = base64Core.match(/.{1,64}/g) || [];

                // 3. Re-assemble perfect PEM structure
                privateKey = `-----BEGIN PRIVATE KEY-----\n${segments.join('\n')}\n-----END PRIVATE KEY-----\n`;
            }

            console.log('FIREBASE_PROJECT_ID:', projectId ? 'SET' : 'MISSING');
            console.log('FIREBASE_PRIVATE_KEY Length:', privateKey ? privateKey.length : '0');
            console.log('FIREBASE_PRIVATE_KEY Valid Bound:', privateKey?.startsWith('-----BEGIN') ? 'TRUE' : 'FALSE');

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
