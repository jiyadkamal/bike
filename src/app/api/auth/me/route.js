import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-server';

export async function GET() {
    try {
        const user = await getSessionUser();
        return NextResponse.json({ user });
    } catch (error) {
        if (error.code === 'TOKEN_EXPIRED') {
            return NextResponse.json({ error: 'Token expired', code: 'TOKEN_EXPIRED' }, { status: 401 });
        }
        return NextResponse.json({ error: error.message || 'Authentication required' }, { status: 401 });
    }
}
