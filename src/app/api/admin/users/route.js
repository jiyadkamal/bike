import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getSessionUser, hashPassword } from '@/lib/auth-server';

export async function GET() {
    try {
        const user = await getSessionUser();
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const snap = await db.ref('users').once('value');
        const users = [];
        snap.forEach(child => {
            const u = child.val();
            users.push({
                uid: child.key,
                name: u.name,
                email: u.email,
                role: u.role || 'user',
                state: u.state || '',
                status: u.status || 'approved',
                createdAt: u.createdAt
            });
        });
        // Sort newest first
        users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        return NextResponse.json({ users });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}

export async function POST(req) {
    try {
        const user = await getSessionUser();
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { name, email, password, role, state } = await req.json();
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
        }

        // Check duplicate
        const existing = await db.ref('users').orderByChild('email').equalTo(email).once('value');
        if (existing.exists()) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        const passwordHash = await hashPassword(password);
        const uid = db.ref('users').push().key;

        await db.ref(`users/${uid}`).set({
            name,
            email,
            passwordHash,
            role: role || 'user',
            state: state || '',
            status: 'approved', // Admin-created users are auto-approved
            createdAt: Date.now()
        });

        return NextResponse.json({
            message: 'User created',
            user: { uid, name, email, role: role || 'user', state: state || '', status: 'approved' }
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}
