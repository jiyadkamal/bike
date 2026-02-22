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

        // Check if already a member
        if (org.members && org.members[user.uid]) {
            return NextResponse.json({ error: 'Already a member' }, { status: 400 });
        }

        if (joiningCode) {
            // Path A: Joining with code (Direct Join)
            if (joiningCode !== org.joiningCode) {
                return NextResponse.json({ error: 'Invalid joining code' }, { status: 400 });
            }

            // Add user to members immediately
            await db.ref(`organizations/${id}/members/${user.uid}`).set(true);

            // Remove from pending if they were there
            if (org.pendingRequests && org.pendingRequests[user.uid]) {
                await db.ref(`organizations/${id}/pendingRequests/${user.uid}`).remove();
            }

            return NextResponse.json({ message: 'Joined organization successfully', direct: true });
        } else {
            // Path B: Joining without code (Request Access)
            await db.ref(`organizations/${id}/pendingRequests/${user.uid}`).set(true);
            return NextResponse.json({ message: 'Join request sent', direct: false });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}
