import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-server';

// Generate a random 6-char joining code
function generateJoiningCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// GET /api/organizations — list all orgs
export async function GET() {
    try {
        await getSessionUser(); // Require auth
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
        return NextResponse.json({ organizations: orgs });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}

// POST /api/organizations — create org
export async function POST(req) {
    try {
        const user = await getSessionUser();
        const { name, state } = await req.json();

        if (!name) return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });

        const orgId = db.ref('organizations').push().key;
        const joiningCode = generateJoiningCode();

        const orgData = {
            name,
            state: state || '',
            joiningCode,
            createdBy: user.uid,
            createdAt: Date.now(),
            members: { [user.uid]: true },
            pendingRequests: {}
        };

        await db.ref(`organizations/${orgId}`).set(orgData);

        // Only update primary org if user doesn't have one
        const userSnap = await db.ref(`users/${user.uid}`).once('value');
        if (!userSnap.val()?.organizationId) {
            await db.ref(`users/${user.uid}/organizationId`).set(orgId);
            await db.ref(`users/${user.uid}/orgRole`).set('admin');
        }

        return NextResponse.json({ message: 'Organization created', orgId, joiningCode, organization: orgData }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}
