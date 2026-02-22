import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-server';

export async function POST(req, { params }) {
    try {
        const user = await getSessionUser();
        const { id } = await params;
        const { joiningCode } = await req.json();

        const orgSnap = await db.ref(`organizations/${id}`).once('value');
        if (!orgSnap.exists()) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

        const org = orgSnap.val();
        if (joiningCode && joiningCode !== org.joiningCode) {
            return NextResponse.json({ error: 'Invalid joining code' }, { status: 400 });
        }

        // Check if already a member
        if (org.members && org.members[user.uid]) {
            return NextResponse.json({ error: 'Already a member' }, { status: 400 });
        }

        // Add to pending requests
        await db.ref(`organizations/${id}/pendingRequests/${user.uid}`).set(true);
        return NextResponse.json({ message: 'Join request sent' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}
