import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { generateAccessToken, verifyRefreshToken } from '@/lib/auth-server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('refreshToken')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Refresh token required' }, { status: 401 });
        }

        const decoded = verifyRefreshToken(token);
        const storedSnap = await db.ref(`refreshTokens/${decoded.uid}`).once('value');

        if (!storedSnap.exists() || storedSnap.val().token !== token) {
            return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
        }

        const userSnap = await db.ref(`users/${decoded.uid}`).once('value');
        if (!userSnap.exists()) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const userData = userSnap.val();
        const tokenPayload = { uid: decoded.uid, email: userData.email, role: userData.role };
        const accessToken = generateAccessToken(tokenPayload);

        const isProd = process.env.NODE_ENV === 'production';
        cookieStore.set('accessToken', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60 // 15 mins
        });

        return NextResponse.json({ message: 'Token refreshed' });
    } catch (error) {
        console.error('Refresh API error:', error);
        return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }
}
