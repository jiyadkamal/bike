import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-server';

export async function POST(req, { params }) {
    try {
        const user = await getSessionUser();
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { uid } = await params;
        const userSnap = await db.ref(`users/${uid}`).once('value');
        if (!userSnap.exists()) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        await db.ref(`users/${uid}`).update({ status: 'approved' });
        return NextResponse.json({ message: 'Application approved' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}
