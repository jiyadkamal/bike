const { verifyAccessToken } = require('../utils/jwt');
const { db } = require('../config/firebase');

async function verifyToken(req, res, next) {
    try {
        const token = req.cookies?.accessToken;
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        const decoded = verifyAccessToken(token);
        const userSnap = await db.ref(`users/${decoded.uid}`).once('value');

        if (!userSnap.exists()) {
            return res.status(401).json({ error: 'User not found' });
        }

        const userData = userSnap.val();
        req.user = {
            uid: decoded.uid,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            state: userData.state
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ error: 'Invalid token' });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
}

module.exports = { verifyToken, requireRole };
