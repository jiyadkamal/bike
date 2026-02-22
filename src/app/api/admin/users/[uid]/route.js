import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-server';

export async function PUT(req, { params }) {
    try {
        const adminUser = await getSessionUser();
        if (adminUser.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { uid } = await params;
        const { name, role, state, status } = await req.json();

        const userSnap = await db.ref(`users/${uid}`).once('value');
        if (!userSnap.exists()) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (role !== undefined) updates.role = role;
        if (state !== undefined) updates.state = state;
        if (status !== undefined) updates.status = status;

        await db.ref(`users/${uid}`).update(updates);
        return NextResponse.json({ message: 'User updated' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const adminUser = await getSessionUser();
        if (adminUser.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { uid } = await params;

        // Prevent self-delete
        if (uid === adminUser.uid) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        const userSnap = await db.ref(`users/${uid}`).once('value');
        if (!userSnap.exists()) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await db.ref(`users/${uid}`).remove();
        await db.ref(`refreshTokens/${uid}`).remove();
        return NextResponse.json({ message: 'User deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}
