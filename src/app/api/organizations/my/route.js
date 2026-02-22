import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-server';

export async function GET() {
    try {
        const user = await getSessionUser();
        const snap = await db.ref('organizations').once('value');
        const myOrgs = [];

        snap.forEach(child => {
            const data = child.val();
            if (data.members && data.members[user.uid]) {
                myOrgs.push({
                    id: child.key,
                    name: data.name,
                    state: data.state,
                    joiningCode: data.joiningCode,
                    createdBy: data.createdBy,
                    createdAt: data.createdAt,
                    memberCount: Object.keys(data.members).length,
                    pendingCount: data.pendingRequests ? Object.keys(data.pendingRequests).length : 0
                });
            }
        });

        return NextResponse.json({ organizations: myOrgs });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}
