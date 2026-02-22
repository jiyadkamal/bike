const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

async function addAdmin(email, password) {
    if (!email || !password) {
        console.error('Usage: node add-admin.js <email> <password>');
        process.exit(1);
    }

    try {
        console.log(`🔍 Checking if user ${email} exists...`);
        const snap = await db.ref('users').orderByChild('email').equalTo(email).once('value');

        if (snap.exists()) {
            console.log('⚠️  User already exists. Updating role to admin...');
            const userId = Object.keys(snap.val())[0];
            await db.ref(`users/${userId}/role`).set('admin');
            await db.ref(`users/${userId}/status`).set('approved');
            console.log('✅ User updated to ADMIN status.');
        } else {
            console.log('✨ Creating new Admin user...');
            const passwordHash = await bcrypt.hash(password, 12);
            const uid = db.ref('users').push().key;
            await db.ref(`users/${uid}`).set({
                name: 'Admin User',
                email: email,
                passwordHash,
                role: 'admin',
                state: '',
                status: 'approved',
                createdAt: Date.now()
            });
            console.log(`✅ New Admin created: ${email}`);
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creating/updating admin:', err);
        process.exit(1);
    }
}

const args = process.argv.slice(2);
addAdmin(args[0], args[1]);
