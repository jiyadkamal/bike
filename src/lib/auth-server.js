import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './firebase-admin';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'biker-os-super-secret-key-2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'biker-os-refresh-secret-key-2024';

export function generateAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(payload) {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

export function verifyRefreshToken(token) {
    return jwt.verify(token, JWT_REFRESH_SECRET);
}

export async function hashPassword(password) {
    return await bcrypt.hash(password, 12);
}

export async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

/**
 * Server-side auth checker for Next.js API Routes (App Router)
 * Returns user object if valid, throws if not.
 */
export async function getSessionUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
        throw new Error('Authentication required');
    }

    try {
        const decoded = verifyAccessToken(token);
        const userSnap = await db.ref(`users/${decoded.uid}`).once('value');

        if (!userSnap.exists()) {
            throw new Error('User not found');
        }

        const userData = userSnap.val();
        return {
            uid: decoded.uid,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            state: userData.state
        };
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            const expiredError = new Error('Token expired');
            expiredError.code = 'TOKEN_EXPIRED';
            throw expiredError;
        }
        throw new Error('Invalid token');
    }
}
