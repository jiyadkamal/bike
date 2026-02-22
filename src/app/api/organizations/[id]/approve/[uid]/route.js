import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-server';

export async function POST(req, { params }) {
    try {
        const user = await getSessionUser();
        const { id, uid } = await params;

        const orgSnap = await db.ref(`organizations/${id}`).once('value');
        if (!orgSnap.exists()) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

        const org = orgSnap.val();
        if (org.createdBy !== user.uid) {
            return NextResponse.json({ error: 'Only admin can approve requests' }, { status: 403 });
        }

        // Move from pending to members
        await db.ref(`organizations/${id}/pendingRequests/${uid}`).remove();
        await db.ref(`organizations/${id}/members/${uid}`).set(true);
        await db.ref(`users/${uid}/organizationId`).set(id);
        await db.ref(`users/${uid}/orgRole`).set('user');

        return NextResponse.json({ message: 'Member approved' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}
