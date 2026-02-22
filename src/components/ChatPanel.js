'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Send, Shield, User } from 'lucide-react';

export default function ChatPanel({ orgId }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const pollInterval = useRef(null);

    useEffect(() => {
        if (orgId) {
            fetchMessages();
            // Poll every 3 seconds for new messages
            pollInterval.current = setInterval(fetchMessages, 3000);
            return () => clearInterval(pollInterval.current);
        }
    }, [orgId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    async function fetchMessages() {
        if (!orgId) return;
        try {
            const res = await api.get(`/api/messages/${orgId}?limit=50`);
            setMessages(res.data.messages || []);
        } catch (e) {
            // silently fail for polling
        }
    }

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    async function handleSend(e) {
        e.preventDefault();
        if (!newMessage.trim() || !orgId) return;

        setLoading(true);
        try {
            await api.post(`/api/messages/${orgId}`, { text: newMessage });
            setNewMessage('');
            await fetchMessages();
        } catch (err) {
            console.error('Send failed:', err);
        } finally {
            setLoading(false);
        }
    }

    function formatTime(ts) {
        return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    if (!orgId) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-[#e5e7eb]/50 text-center"
            >
                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-[#ff6b00]" />
                </div>
                <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">Group Chat</h3>
                <p className="text-sm text-[#6b7280]">Join an organization to start chatting with members.</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb]/50 flex flex-col h-[420px]"
        >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#e5e7eb]">
                <h3 className="font-bold text-[#1a1a2e] text-lg">Group Chat</h3>
                <p className="text-xs text-[#9ca3af] mt-0.5">{messages.length} messages</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-[#9ca3af] text-sm">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isOwn = msg.senderId === user?.uid;
                        const isAdmin = msg.senderRole === 'admin';
                        return (
                            <div
                                key={msg.id || i}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-slide-in`}
                            >
                                <div className={`max-w-[75%] ${isOwn ? 'order-2' : ''}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-semibold ${isOwn ? 'text-[#ff6b00]' : 'text-[#6b7280]'}`}>
                                            {isOwn ? 'You' : msg.senderName}
                                        </span>
                                        {isAdmin && (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-50 text-[#ff6b00] text-[10px] font-bold rounded-md">
                                                <Shield className="w-2.5 h-2.5" />
                                                ADMIN
                                            </span>
                                        )}
                                        <span className="text-[10px] text-[#9ca3af]">{formatTime(msg.timestamp)}</span>
                                    </div>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn
                                            ? 'bg-[#ff6b00] text-white rounded-br-md'
                                            : 'bg-[#f5f6fa] text-[#1a1a2e] rounded-bl-md'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="px-5 py-3 border-t border-[#e5e7eb] flex items-center gap-3">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-[#f5f6fa] rounded-xl text-sm border border-transparent focus:border-[#ff6b00] focus:bg-white transition-smooth outline-none"
                />
                <button
                    type="submit"
                    disabled={loading || !newMessage.trim()}
                    className="w-10 h-10 rounded-xl orange-gradient flex items-center justify-center text-white shadow-md hover:shadow-lg transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </motion.div>
    );
}
