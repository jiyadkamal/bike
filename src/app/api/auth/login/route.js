import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { generateAccessToken, generateRefreshToken, comparePassword } from '@/lib/auth-server';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const usersSnap = await db.ref('users').orderByChild('email').equalTo(email).once('value');
        if (!usersSnap.exists()) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        let uid, userData;
        usersSnap.forEach(child => {
            uid = child.key;
            userData = child.val();
        });

        const isMatch = await comparePassword(password, userData.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Check account status (admins bypass this)
        if (userData.role !== 'admin') {
            if (userData.status === 'pending') {
                return NextResponse.json({ error: 'Your account is pending admin approval.' }, { status: 403 });
            }
            if (userData.status === 'rejected') {
                return NextResponse.json({ error: 'Your application has been rejected.' }, { status: 403 });
            }
        }

        const tokenPayload = { uid, email, role: userData.role };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

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
            message: 'Login successful',
            user: { uid, name: userData.name, email, role: userData.role, state: userData.state, status: userData.status || 'approved' }
        });
    } catch (error) {
        console.error('Login API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
