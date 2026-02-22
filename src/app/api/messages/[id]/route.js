import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { getSessionUser } from '@/lib/auth-server';

export async function GET(req, { params }) {
    try {
        const user = await getSessionUser();
        const { id: orgId } = await params;

        // Verify user is a member of the org
        const orgSnap = await db.ref(`organizations/${orgId}/members/${user.uid}`).once('value');
        if (!orgSnap.exists()) {
            return NextResponse.json({ error: 'You are not a member of this organization' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit')) || 50;

        const snap = await db.ref(`messages/${orgId}`)
            .orderByChild('timestamp')
            .limitToLast(limit)
            .once('value');

        const messages = [];
        snap.forEach(child => {
            messages.push({ id: child.key, ...child.val() });
        });

        return NextResponse.json({ messages });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const user = await getSessionUser();
        const { id: orgId } = await params;
        const { text } = await req.json();

        if (!text || !text.trim()) {
            return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
        }

        // Verify user is a member of the org
        const orgSnap = await db.ref(`organizations/${orgId}/members/${user.uid}`).once('value');
        if (!orgSnap.exists()) {
            return NextResponse.json({ error: 'You are not a member of this organization' }, { status: 403 });
        }

        const messageId = db.ref(`messages/${orgId}`).push().key;
        const messageData = {
            senderId: user.uid,
            senderName: user.name,
            senderRole: user.role,
            text: text.trim(),
            timestamp: Date.now()
        };

        await db.ref(`messages/${orgId}/${messageId}`).set(messageData);

        return NextResponse.json({ message: 'Message sent', messageId, data: messageData }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: error.message === 'Authentication required' ? 401 : 500 });
    }
}
