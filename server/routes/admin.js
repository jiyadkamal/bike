const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(verifyToken, requireRole('admin'));

// GET /api/admin/stats — Dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const usersSnap = await db.ref('users').once('value');
        const orgsSnap = await db.ref('organizations').once('value');

        let totalUsers = 0, pendingUsers = 0, approvedUsers = 0, admins = 0;
        usersSnap.forEach(child => {
            const u = child.val();
            totalUsers++;
            if (u.role === 'admin') admins++;
            if (u.status === 'pending') pendingUsers++;
            if (u.status === 'approved' || !u.status) approvedUsers++;
        });

        let totalOrgs = 0;
        orgsSnap.forEach(() => totalOrgs++);

        res.json({
            stats: {
                totalUsers,
                pendingUsers,
                approvedUsers,
                admins,
                totalOrgs
            }
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/users — List all users
router.get('/users', async (req, res) => {
    try {
        const snap = await db.ref('users').once('value');
        const users = [];
        snap.forEach(child => {
            const u = child.val();
            users.push({
                uid: child.key,
                name: u.name,
                email: u.email,
                role: u.role || 'user',
                state: u.state || '',
                status: u.status || 'approved',
                createdAt: u.createdAt
            });
        });
        // Sort newest first
        users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        res.json({ users });
    } catch (error) {
        console.error('Admin list users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/admin/users — Create a new user (admin-created)
router.post('/users', async (req, res) => {
    try {
        const { name, email, password, role, state } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required' });
        }

        // Check duplicate
        const existing = await db.ref('users').orderByChild('email').equalTo(email).once('value');
        if (existing.exists()) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const uid = db.ref('users').push().key;

        await db.ref(`users/${uid}`).set({
            name,
            email,
            passwordHash,
            role: role || 'user',
            state: state || '',
            status: 'approved', // Admin-created users are auto-approved
            createdAt: Date.now()
        });

        res.status(201).json({
            message: 'User created',
            user: { uid, name, email, role: role || 'user', state: state || '', status: 'approved' }
        });
    } catch (error) {
        console.error('Admin create user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/admin/users/:uid — Edit user
router.put('/users/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const { name, role, state, status } = req.body;

        const userSnap = await db.ref(`users/${uid}`).once('value');
        if (!userSnap.exists()) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (role !== undefined) updates.role = role;
        if (state !== undefined) updates.state = state;
        if (status !== undefined) updates.status = status;

        await db.ref(`users/${uid}`).update(updates);
        res.json({ message: 'User updated' });
    } catch (error) {
        console.error('Admin edit user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/admin/users/:uid — Delete user
router.delete('/users/:uid', async (req, res) => {
    try {
        const { uid } = req.params;

        // Prevent self-delete
        if (uid === req.user.uid) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const userSnap = await db.ref(`users/${uid}`).once('value');
        if (!userSnap.exists()) {
            return res.status(404).json({ error: 'User not found' });
        }

        await db.ref(`users/${uid}`).remove();
        await db.ref(`refreshTokens/${uid}`).remove();
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/applications — Get pending applications
router.get('/applications', async (req, res) => {
    try {
        const snap = await db.ref('users').orderByChild('status').equalTo('pending').once('value');
        const applications = [];
        snap.forEach(child => {
            const u = child.val();
            applications.push({
                uid: child.key,
                name: u.name,
                email: u.email,
                state: u.state || '',
                createdAt: u.createdAt
            });
        });
        applications.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        res.json({ applications });
    } catch (error) {
        console.error('Admin applications error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/admin/applications/:uid/approve
router.post('/applications/:uid/approve', async (req, res) => {
    try {
        const { uid } = req.params;
        const userSnap = await db.ref(`users/${uid}`).once('value');
        if (!userSnap.exists()) {
            return res.status(404).json({ error: 'User not found' });
        }
        await db.ref(`users/${uid}`).update({ status: 'approved' });
        res.json({ message: 'Application approved' });
    } catch (error) {
        console.error('Admin approve error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/admin/applications/:uid/reject
router.post('/applications/:uid/reject', async (req, res) => {
    try {
        const { uid } = req.params;
        const userSnap = await db.ref(`users/${uid}`).once('value');
        if (!userSnap.exists()) {
            return res.status(404).json({ error: 'User not found' });
        }
        await db.ref(`users/${uid}`).update({ status: 'rejected' });
        res.json({ message: 'Application rejected' });
    } catch (error) {
        console.error('Admin reject error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
