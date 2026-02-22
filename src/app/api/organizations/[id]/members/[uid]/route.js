import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-server';

export async function DELETE(req, { params }) {
    try {
        const user = await getSessionUser();
        const { id, uid } = await params;

        const orgSnap = await db.ref(`organizations/${id}`).once('value');
        if (!orgSnap.exists()) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

        const org = orgSnap.val();
        if (org.createdBy !== user.uid) {
            return NextResponse.json({ error: 'Only admin can remove members' }, { status: 403 });
        }

        await db.ref(`organizations/${id}/members/${uid}`).remove();
        await db.ref(`users/${uid}/organizationId`).remove();
        await db.ref(`users/${uid}/orgRole`).remove();

        return NextResponse.json({ message: 'Member removed' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}
