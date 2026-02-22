import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-server';

export async function GET() {
    try {
        const user = await getSessionUser();
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const snap = await db.ref('users').orderByChild('status').equalTo('pending').once('value');
        const applications = [];
        snap.forEach(child => {
            const u = child.val();
            applications.push({
                uid: child.key,
                name: u.name,
                email: u.email,
                state: u.state || '',
                createdAt: u.createdAt
            });
        });
        applications.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        return NextResponse.json({ applications });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}
