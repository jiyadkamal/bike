import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { generateAccessToken, generateRefreshToken, hashPassword } from '@/lib/auth-server';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        const { name, email, password, state } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
        }

        // Check if email already exists
        const usersSnap = await db.ref('users').orderByChild('email').equalTo(email).once('value');
        if (usersSnap.exists()) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        const passwordHash = await hashPassword(password);
        const uid = db.ref('users').push().key;

        const userData = {
            name,
            email,
            passwordHash,
            role: 'user',
            state: state || '',
            status: 'pending',
            createdAt: Date.now()
        };

        await db.ref(`users/${uid}`).set(userData);

        const tokenPayload = { uid, email, role: 'user' };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Store refresh token
        await db.ref(`refreshTokens/${uid}`).set({ token: refreshToken, createdAt: Date.now() });

        const isProd = process.env.NODE_ENV === 'production';
        const cookieStore = await cookies();

        cookieStore.set('accessToken', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60 // 15 mins
        });

        cookieStore.set('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return NextResponse.json({
            message: 'Registration successful. Your account is pending admin approval.',
            user: { uid, name, email, role: 'user', state: state || '', status: 'pending' },
            pending: true
        }, { status: 201 });
    } catch (error) {
        console.error('Register API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
