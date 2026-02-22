const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, state } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        // Check if email already exists
        const usersSnap = await db.ref('users').orderByChild('email').equalTo(email).once('value');
        if (usersSnap.exists()) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const uid = db.ref('users').push().key;

        const userData = {
            name,
            email,
            passwordHash,
            role: 'user',
            state: state || '',
            status: 'pending',
            createdAt: Date.now()
        };

        await db.ref(`users/${uid}`).set(userData);

        const tokenPayload = { uid, email, role: 'user' };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Store refresh token
        await db.ref(`refreshTokens/${uid}`).set({ token: refreshToken, createdAt: Date.now() });

        res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.status(201).json({
            message: 'Registration successful. Your account is pending admin approval.',
            user: { uid, name, email, role: 'user', state: state || '', status: 'pending' },
            pending: true
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const usersSnap = await db.ref('users').orderByChild('email').equalTo(email).once('value');
        if (!usersSnap.exists()) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        let uid, userData;
        usersSnap.forEach(child => {
            uid = child.key;
            userData = child.val();
        });

        const isMatch = await bcrypt.compare(password, userData.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check account status (admins bypass this)
        if (userData.role !== 'admin') {
            if (userData.status === 'pending') {
                return res.status(403).json({ error: 'Your account is pending admin approval.' });
            }
            if (userData.status === 'rejected') {
                return res.status(403).json({ error: 'Your application has been rejected.' });
            }
        }

        const tokenPayload = { uid, email, role: userData.role };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        await db.ref(`refreshTokens/${uid}`).set({ token: refreshToken, createdAt: Date.now() });

        res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.json({
            message: 'Login successful',
            user: { uid, name: userData.name, email, role: userData.role, state: userData.state, status: userData.status || 'approved' }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            return res.status(401).json({ error: 'Refresh token required' });
        }

        const decoded = verifyRefreshToken(token);
        const storedSnap = await db.ref(`refreshTokens/${decoded.uid}`).once('value');

        if (!storedSnap.exists() || storedSnap.val().token !== token) {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        const userSnap = await db.ref(`users/${decoded.uid}`).once('value');
        if (!userSnap.exists()) {
            return res.status(401).json({ error: 'User not found' });
        }

        const userData = userSnap.val();
        const tokenPayload = { uid: decoded.uid, email: userData.email, role: userData.role };
        const accessToken = generateAccessToken(tokenPayload);

        res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });

        res.json({ message: 'Token refreshed' });
    } catch (error) {
        console.error('Refresh error:', error);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});

// POST /api/auth/logout
router.post('/logout', verifyToken, async (req, res) => {
    try {
        await db.ref(`refreshTokens/${req.user.uid}`).remove();
        res.clearCookie('accessToken', COOKIE_OPTIONS);
        res.clearCookie('refreshToken', COOKIE_OPTIONS);
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/auth/me
router.get('/me', verifyToken, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
