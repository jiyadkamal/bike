import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-server';

export async function GET() {
    try {
        const user = await getSessionUser();
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const usersSnap = await db.ref('users').once('value');
        const orgsSnap = await db.ref('organizations').once('value');

        let totalUsers = 0, pendingUsers = 0, approvedUsers = 0, admins = 0;
        usersSnap.forEach(child => {
            const u = child.val();
            totalUsers++;
            if (u.role === 'admin') admins++;
            if (u.status === 'pending') pendingUsers++;
            if (u.status === 'approved' || !u.status) approvedUsers++;
        });

        let totalOrgs = 0;
        orgsSnap.forEach(() => totalOrgs++);

        return NextResponse.json({
            stats: {
                totalUsers,
                pendingUsers,
                approvedUsers,
                admins,
                totalOrgs
            }
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}
