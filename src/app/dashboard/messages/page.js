'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Clock, Users } from 'lucide-react';
import Link from 'next/link';

export default function MessagesPage() {
    const { user } = useAuth();
    const [allOrgs, setAllOrgs] = useState([]);
    const [selectedOrgId, setSelectedOrgId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const pollRef = useRef(null);

    useEffect(() => {
        fetchAllMyOrgs();
        return () => clearInterval(pollRef.current);
    }, []);

    useEffect(() => {
        if (selectedOrgId) {
            setMessages([]);
            fetchMessages(selectedOrgId);
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = setInterval(() => fetchMessages(selectedOrgId), 3000);
        }
        return () => { if (pollRef.current) clearInterval(pollRef.current); }
    }, [selectedOrgId]);

    async function fetchAllMyOrgs() {
        try {
            const res = await api.get('/api/organizations/my');
            const myOrgs = res.data.organizations || [];
            setAllOrgs(myOrgs);
            if (myOrgs.length > 0 && !selectedOrgId) {
                setSelectedOrgId(myOrgs[0].id);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    async function fetchMessages(id) {
        try {
            const res = await api.get(`/api/messages/${id}?limit=100`);
            setMessages(res.data.messages || []);
        } catch (e) { }
    }

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    async function handleSend(e) {
        e.preventDefault();
        if (!newMessage.trim() || !selectedOrgId) return;
        setSending(true);
        try {
            await api.post(`/api/messages/${selectedOrgId}`, { text: newMessage });
            setNewMessage('');
            await fetchMessages(selectedOrgId);
        }
        catch (e) { console.error(e); }
        finally { setSending(false); }
    }

    function formatTime(ts) { return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); }
    function formatDate(ts) { return new Date(ts).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }); }

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <div style={{ width: 40, height: 40, border: '4px solid #e5e7eb', borderTop: '4px solid #ff6b00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (allOrgs.length === 0) return (
        <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb' }}>
            <MessageSquare style={{ width: 56, height: 56, color: '#e5e7eb', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>No Messages Yet</h3>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Join an organization to start messaging.</p>
            <Link href="/dashboard/explore" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 22px', background: 'linear-gradient(135deg, #ff6b00, #ff8533)',
                color: '#fff', borderRadius: 12, fontWeight: 600, fontSize: 14, textDecoration: 'none',
            }}>
                Explore Organizations
            </Link>
        </div>
    );

    const selectedOrg = allOrgs.find(o => o.id === selectedOrgId);

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', gap: 24, height: 'calc(100vh - 130px)' }}>
            {/* Sidebar: Org Selector */}
            <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conversations</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
                    {allOrgs.map(o => (
                        <div
                            key={o.id}
                            onClick={() => setSelectedOrgId(o.id)}
                            style={{
                                padding: '14px 16px',
                                background: selectedOrgId === o.id ? '#fff' : 'transparent',
                                borderRadius: 12,
                                border: selectedOrgId === o.id ? '1px solid #eee' : '1px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: selectedOrgId === o.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                position: 'relative',
                            }}
                            onMouseEnter={e => { if (selectedOrgId !== o.id) e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
                            onMouseLeave={e => { if (selectedOrgId !== o.id) e.currentTarget.style.background = 'transparent'; }}
                        >
                            {selectedOrgId === o.id && (
                                <div style={{
                                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                                    width: 3, height: 24, background: '#ff6b00', borderRadius: '0 4px 4px 0',
                                }} />
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 12,
                                    background: selectedOrgId === o.id ? 'linear-gradient(135deg, #ff6b00, #ff8533)' : '#f0f0f0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: selectedOrgId === o.id ? '#fff' : '#9ca3af', fontWeight: 700, fontSize: 16,
                                    transition: 'all 0.2s',
                                }}>
                                    {o.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: selectedOrgId === o.id ? 700 : 500, color: selectedOrgId === o.id ? '#1a1a2e' : '#6b7280' }}>{o.name}</p>
                                    <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{o.state}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Chat Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: '#fff', borderRadius: '20px 20px 0 0', padding: '18px 24px',
                        border: '1px solid rgba(229,231,235,0.5)', borderBottom: 'none',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                >
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>{selectedOrg?.name || 'Select a Conversation'}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <Users style={{ width: 14, height: 14, color: '#9ca3af' }} />
                            <span style={{ fontSize: 13, color: '#9ca3af' }}>{selectedOrg?.memberCount || 0} members</span>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', background: '#ecfdf5', borderRadius: 20,
                    }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>Active</span>
                    </div>
                </motion.div>

                {/* Messages Area */}
                <div style={{
                    flex: 1, background: '#fff', overflowY: 'auto', padding: '24px 24px 16px',
                    borderLeft: '1px solid rgba(229,231,235,0.5)', borderRight: '1px solid rgba(229,231,235,0.5)',
                }}>
                    <AnimatePresence initial={false}>
                        {messages.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}
                            >
                                <MessageSquare style={{ width: 56, height: 56, color: '#e5e7eb', marginBottom: 16 }} />
                                <p style={{ fontSize: 16, fontWeight: 600, color: '#9ca3af', marginBottom: 4 }}>No messages yet</p>
                                <p style={{ fontSize: 13, color: '#d1d5db' }}>Be the first to send a message!</p>
                            </motion.div>
                        ) : (
                            messages.map((msg, i) => {
                                const isOwn = msg.senderId === user?.uid;
                                const isAdmin = msg.senderRole === 'admin';
                                const showDate = i === 0 || formatDate(msg.timestamp) !== formatDate(messages[i - 1]?.timestamp);

                                return (
                                    <motion.div
                                        key={msg.id || i}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{ marginBottom: 20 }}
                                    >
                                        {showDate && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0' }}>
                                                <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
                                                <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{formatDate(msg.timestamp)}</span>
                                                <div style={{ flex: 1, height: 1, background: '#f0f0f0' }} />
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                                            <div style={{ maxWidth: '70%', display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row', gap: 12, alignItems: 'flex-end' }}>
                                                {/* Avatar */}
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                                    background: isOwn ? 'linear-gradient(135deg, #ff6b00, #ff8533)' : '#f0f0f0',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: isOwn ? '#fff' : '#9ca3af', fontWeight: 700, fontSize: 13,
                                                }}>
                                                    {msg.senderName?.charAt(0)?.toUpperCase()}
                                                </div>

                                                <div>
                                                    {/* Name + Time */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexDirection: isOwn ? 'row-reverse' : 'row' }}>
                                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e' }}>
                                                            {isOwn ? 'You' : msg.senderName}
                                                        </span>
                                                        {isAdmin && (
                                                            <span style={{
                                                                fontSize: 10, fontWeight: 700, padding: '2px 6px',
                                                                background: '#fff7ed', color: '#ff6b00', borderRadius: 6,
                                                            }}>Admin</span>
                                                        )}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <Clock style={{ width: 11, height: 11, color: '#d1d5db' }} />
                                                            <span style={{ fontSize: 11, color: '#d1d5db' }}>{formatTime(msg.timestamp)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Message Bubble */}
                                                    <div style={{
                                                        padding: '10px 16px',
                                                        borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                        background: isOwn ? 'linear-gradient(135deg, #ff6b00, #ff8533)' : '#f5f6fa',
                                                        color: isOwn ? '#fff' : '#374151',
                                                        fontSize: 14, lineHeight: 1.6,
                                                        boxShadow: isOwn ? '0 2px 8px rgba(255,107,0,0.2)' : 'none',
                                                    }}>
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} style={{
                    background: '#fff', padding: '16px 24px',
                    borderRadius: '0 0 20px 20px',
                    border: '1px solid rgba(229,231,235,0.5)', borderTop: '1px solid #f0f0f0',
                }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            style={{
                                flex: 1, padding: '14px 18px', background: '#f5f6fa',
                                borderRadius: 14, fontSize: 14, border: '2px solid transparent',
                                outline: 'none', color: '#1a1a2e', transition: 'all 0.2s',
                            }}
                            onFocus={e => { e.target.style.borderColor = '#ff6b00'; e.target.style.background = '#fff'; }}
                            onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#f5f6fa'; }}
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            style={{
                                width: 48, height: 48, borderRadius: 14, border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s',
                                background: (sending || !newMessage.trim()) ? '#f0f0f0' : 'linear-gradient(135deg, #ff6b00, #ff8533)',
                                color: (sending || !newMessage.trim()) ? '#d1d5db' : '#fff',
                                boxShadow: (sending || !newMessage.trim()) ? 'none' : '0 4px 12px rgba(255,107,0,0.25)',
                            }}
                        >
                            <Send style={{ width: 18, height: 18 }} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
