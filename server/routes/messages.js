const express = require('express');
const { db } = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/messages/:orgId — send message
router.post('/:orgId', verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Message text is required' });
        }

        // Verify user is a member of the org
        const orgSnap = await db.ref(`organizations/${req.params.orgId}/members/${req.user.uid}`).once('value');
        if (!orgSnap.exists()) {
            return res.status(403).json({ error: 'You are not a member of this organization' });
        }

        const messageId = db.ref(`messages/${req.params.orgId}`).push().key;
        const messageData = {
            senderId: req.user.uid,
            senderName: req.user.name,
            senderRole: req.user.role,
            text: text.trim(),
            timestamp: Date.now()
        };

        await db.ref(`messages/${req.params.orgId}/${messageId}`).set(messageData);

        res.status(201).json({ message: 'Message sent', messageId, data: messageData });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/messages/:orgId — get messages
router.get('/:orgId', verifyToken, async (req, res) => {
    try {
        // Verify user is a member of the org
        const orgSnap = await db.ref(`organizations/${req.params.orgId}/members/${req.user.uid}`).once('value');
        if (!orgSnap.exists()) {
            return res.status(403).json({ error: 'You are not a member of this organization' });
        }

        const limit = parseInt(req.query.limit) || 50;
        const snap = await db.ref(`messages/${req.params.orgId}`)
            .orderByChild('timestamp')
            .limitToLast(limit)
            .once('value');

        const messages = [];
        snap.forEach(child => {
            messages.push({ id: child.key, ...child.val() });
        });

        res.json({ messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
