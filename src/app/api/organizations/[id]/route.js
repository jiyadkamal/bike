import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-server';

export async function GET(req, { params }) {
    try {
        await getSessionUser(); // Require auth
        const { id } = await params;
        const snap = await db.ref(`organizations/${id}`).once('value');
        if (!snap.exists()) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

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

        return NextResponse.json({
            organization: {
                id,
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
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const user = await getSessionUser();
        const { id } = await params;
        const orgSnap = await db.ref(`organizations/${id}`).once('value');
        if (!orgSnap.exists()) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

        const org = orgSnap.val();
        if (org.createdBy !== user.uid) {
            return NextResponse.json({ error: 'Only admin can edit organization' }, { status: 403 });
        }

        const updates = {};
        const body = await req.json();
        if (body.name) updates.name = body.name;
        if (body.state) updates.state = body.state;

        await db.ref(`organizations/${id}`).update(updates);
        return NextResponse.json({ message: 'Organization updated' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}
