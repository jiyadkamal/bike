const express = require('express');
const { db } = require('../config/firebase');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Debug middleware for organizations
router.use((req, res, next) => {
    console.log(`[Org API] ${req.method} ${req.path}`);
    next();
});

// GET /api/organizations/my — get only orgs user belongs to (OPTIMIZED)
router.get('/my', verifyToken, async (req, res) => {
    console.log(`[Org API] Fetching "my" orgs for user: ${req.user.uid}`);
    try {
        const snap = await db.ref('organizations').once('value');
        const myOrgs = [];
        const userId = req.user.uid;

        snap.forEach(child => {
            const data = child.val();
            if (data.members && data.members[userId]) {
                myOrgs.push({
                    id: child.key,
                    name: data.name,
                    state: data.state,
                    joiningCode: data.joiningCode,
                    createdBy: data.createdBy,
                    createdAt: data.createdAt,
                    memberCount: Object.keys(data.members).length,
                    pendingCount: data.pendingRequests ? Object.keys(data.pendingRequests).length : 0
                });
            }
        });
        console.log(`[Org API] Found ${myOrgs.length} orgs for user`);
        res.json({ organizations: myOrgs });
    } catch (error) {
        console.error('List my orgs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/organizations — create org
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name, state } = req.body;
        if (!name) return res.status(400).json({ error: 'Organization name is required' });

        const orgId = db.ref('organizations').push().key;
        const joiningCode = generateJoiningCode();

        const orgData = {
            name,
            state: state || '',
            joiningCode,
            createdBy: req.user.uid,
            createdAt: Date.now(),
            members: { [req.user.uid]: true },
            pendingRequests: {}
        };

        await db.ref(`organizations/${orgId}`).set(orgData);

        // Only update primary org if user doesn't have one
        const userSnap = await db.ref(`users/${req.user.uid}`).once('value');
        if (!userSnap.val()?.organizationId) {
            await db.ref(`users/${req.user.uid}/organizationId`).set(orgId);
            await db.ref(`users/${req.user.uid}/orgRole`).set('admin');
        }

        res.status(201).json({ message: 'Organization created', orgId, joiningCode, organization: orgData });
    } catch (error) {
        console.error('Create org error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/organizations — list all orgs
router.get('/', verifyToken, async (req, res) => {
    try {
        const snap = await db.ref('organizations').once('value');
        const orgs = [];
        snap.forEach(child => {
            const data = child.val();
            orgs.push({
                id: child.key,
                name: data.name,
                state: data.state,
                memberCount: data.members ? Object.keys(data.members).length : 0,
                createdAt: data.createdAt
            });
        });
        res.json({ organizations: orgs });
    } catch (error) {
        console.error('List orgs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Generate a random 6-char joining code
function generateJoiningCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// GET /api/organizations/:id — get org detail
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const snap = await db.ref(`organizations/${req.params.id}`).once('value');
        if (!snap.exists()) return res.status(404).json({ error: 'Organization not found' });

        const data = snap.val();

        // Get member details in parallel
        const memberIds = data.members ? Object.keys(data.members) : [];
        const memberPromises = memberIds.map(async (uid) => {
            const userSnap = await db.ref(`users/${uid}`).once('value');
            if (userSnap.exists()) {
                const u = userSnap.val();
                return { uid, name: u.name, email: u.email, role: u.orgRole || 'user' };
            }
            return null;
        });

        // Get pending requests details in parallel
        const pendingIds = data.pendingRequests ? Object.keys(data.pendingRequests) : [];
        const pendingPromises = pendingIds.map(async (uid) => {
            const userSnap = await db.ref(`users/${uid}`).once('value');
            if (userSnap.exists()) {
                const u = userSnap.val();
                return { uid, name: u.name, email: u.email };
            }
            return null;
        });

        const [members, pendingRequests] = await Promise.all([
            Promise.all(memberPromises),
            Promise.all(pendingPromises)
        ]);

        res.json({
            organization: {
                id: req.params.id,
                name: data.name,
                state: data.state,
                joiningCode: data.joiningCode,
                createdBy: data.createdBy,
                createdAt: data.createdAt,
                members: members.filter(m => m !== null),
                pendingRequests: pendingRequests.filter(m => m !== null)
            }
        });
    } catch (error) {
        console.error('Get org error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/organizations/:id/join — request to join
router.post('/:id/join', verifyToken, async (req, res) => {
    try {
        const { joiningCode } = req.body;
        const orgSnap = await db.ref(`organizations/${req.params.id}`).once('value');
        if (!orgSnap.exists()) return res.status(404).json({ error: 'Organization not found' });

        const org = orgSnap.val();
        if (joiningCode && joiningCode !== org.joiningCode) {
            return res.status(400).json({ error: 'Invalid joining code' });
        }

        // Check if already a member
        if (org.members && org.members[req.user.uid]) {
            return res.status(400).json({ error: 'Already a member' });
        }

        // Add to pending requests
        await db.ref(`organizations/${req.params.id}/pendingRequests/${req.user.uid}`).set(true);
        res.json({ message: 'Join request sent' });
    } catch (error) {
        console.error('Join org error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/organizations/:id/approve/:uid — admin approves
router.post('/:id/approve/:uid', verifyToken, async (req, res) => {
    try {
        const orgSnap = await db.ref(`organizations/${req.params.id}`).once('value');
        if (!orgSnap.exists()) return res.status(404).json({ error: 'Organization not found' });

        const org = orgSnap.val();
        if (org.createdBy !== req.user.uid) {
            return res.status(403).json({ error: 'Only admin can approve requests' });
        }

        // Move from pending to members
        await db.ref(`organizations/${req.params.id}/pendingRequests/${req.params.uid}`).remove();
        await db.ref(`organizations/${req.params.id}/members/${req.params.uid}`).set(true);
        await db.ref(`users/${req.params.uid}/organizationId`).set(req.params.id);
        await db.ref(`users/${req.params.uid}/orgRole`).set('user');

        res.json({ message: 'Member approved' });
    } catch (error) {
        console.error('Approve error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/organizations/:id/members/:uid — admin removes member
router.delete('/:id/members/:uid', verifyToken, async (req, res) => {
    try {
        const orgSnap = await db.ref(`organizations/${req.params.id}`).once('value');
        if (!orgSnap.exists()) return res.status(404).json({ error: 'Organization not found' });

        const org = orgSnap.val();
        if (org.createdBy !== req.user.uid) {
            return res.status(403).json({ error: 'Only admin can remove members' });
        }

        await db.ref(`organizations/${req.params.id}/members/${req.params.uid}`).remove();
        await db.ref(`users/${req.params.uid}/organizationId`).remove();
        await db.ref(`users/${req.params.uid}/orgRole`).remove();

        res.json({ message: 'Member removed' });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/organizations/:id — admin edits org
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const orgSnap = await db.ref(`organizations/${req.params.id}`).once('value');
        if (!orgSnap.exists()) return res.status(404).json({ error: 'Organization not found' });

        const org = orgSnap.val();
        if (org.createdBy !== req.user.uid) {
            return res.status(403).json({ error: 'Only admin can edit organization' });
        }

        const updates = {};
        if (req.body.name) updates.name = req.body.name;
        if (req.body.state) updates.state = req.body.state;

        await db.ref(`organizations/${req.params.id}`).update(updates);
        res.json({ message: 'Organization updated' });
    } catch (error) {
        console.error('Update org error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Catch-all for organization routes
router.use((req, res) => {
    console.log(`[Org API] 404 - Unmatched route: ${req.method} ${req.path}`);
    res.status(404).json({ error: `Route not found in Organization API: ${req.method} ${req.path}` });
});

module.exports = router;
