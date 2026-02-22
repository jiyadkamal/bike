import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const user = await getSessionUser();
        const cookieStore = await cookies();

        await db.ref(`refreshTokens/${user.uid}`).remove();

        const isProd = process.env.NODE_ENV === 'production';
        const COOKIE_OPTIONS = {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/'
        };

        cookieStore.delete('accessToken', COOKIE_OPTIONS);
        cookieStore.delete('refreshToken', COOKIE_OPTIONS);

        return NextResponse.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout API error:', error);
        // Even if auth fails, we clear cookies to be safe
        const cookieStore = await cookies();
        cookieStore.delete('accessToken');
        cookieStore.delete('refreshToken');
        return NextResponse.json({ message: 'Logged out' });
    }
}
