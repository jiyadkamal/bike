'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Shield, MessageSquare, Zap, Activity, Clock, User, Users, ChevronRight } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-white/10 border-t-accent rounded-full animate-spin" />
            <p className="text-text-muted font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Establishing Uplink</p>
        </div>
    );

    if (allOrgs.length === 0) return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-8 glass-effect rounded-[32px] border border-white/10 max-w-2xl mx-auto mt-12"
        >
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <MessageSquare className="w-10 h-10 text-text-muted" />
            </div>
            <h3 className="text-3xl font-black text-white heading-pro tracking-tighter mb-4 uppercase">NO CHANNELS FOUND</h3>
            <p className="text-text-secondary leading-relaxed mb-10 italic">
                You are not currently assigned to any communication sectors. Join an organization to initialize tactical comms.
            </p>
            <Link href="/dashboard/explore" className="btn-pro inline-flex items-center gap-2">
                Scan Available Nodes
            </Link>
        </motion.div>
    );

    const selectedOrg = allOrgs.find(o => o.id === selectedOrgId);

    return (
        <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-160px)] pb-12">
            {/* Sector Selector Sidebar */}
            <div className="w-full lg:w-80 flex-shrink-0 flex flex-col space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-60">Tactical Sectors</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-widest">Active Links</span>
                    </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-2 no-scrollbar">
                    {allOrgs.map(o => (
                        <div
                            key={o.id}
                            onClick={() => setSelectedOrgId(o.id)}
                            className={`
                                group p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden
                                ${selectedOrgId === o.id
                                    ? 'glass-effect border-accent/50 bg-accent/5'
                                    : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'}
                            `}
                        >
                            {selectedOrgId === o.id && (
                                <motion.div
                                    layoutId="active-chat-signal"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full shadow-[0_0_10px_#ff6b00]"
                                />
                            )}
                            <div className="relative z-10">
                                <p className={`text-sm font-black uppercase tracking-widest ${selectedOrgId === o.id ? 'text-accent' : 'text-white group-hover:text-white/90'}`}>{o.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Activity className="w-3 h-3 text-text-muted group-hover:text-accent transition-colors" />
                                    <p className="text-[10px] text-text-muted font-bold italic">{o.state}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tactical Comms Area */}
            <div className="flex-1 flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-white heading-pro tracking-tighter uppercase">{selectedOrg?.name || 'INITIALIZING...'}</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                                <Users className="w-3 h-3 text-accent" />
                                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{selectedOrg?.members?.length || 0} Operatives</span>
                            </div>
                            <span className="text-[10px] text-text-secondary italic font-medium opacity-60">Sector link established. Comms secured.</span>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Network Speed</p>
                            <p className="text-xs font-bold text-white">480 TB/S</p>
                        </div>
                        <Zap className="w-5 h-5 text-accent animate-pulse" />
                    </div>
                </div>

                <div className="pro-card flex-1 flex flex-col p-0 overflow-hidden border-white/10 relative">
                    {/* Immersive background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
                    <div className="absolute top-0 right-0 p-12 text-white/5 pointer-events-none">
                        <Shield size={320} strokeWidth={1} />
                    </div>

                    {/* Messages Window */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar relative z-10">
                        <AnimatePresence initial={false}>
                            {messages.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-full space-y-4 opacity-30"
                                >
                                    <MessageSquare size={64} className="text-accent" />
                                    <p className="text-xs font-black uppercase tracking-[0.4em] text-white">Signal Silence</p>
                                    <p className="text-[10px] italic text-text-muted">Broadcast your first message to this sector.</p>
                                </motion.div>
                            ) : (
                                messages.map((msg, i) => {
                                    const isOwn = msg.senderId === user?.uid;
                                    const isAdmin = msg.senderRole === 'admin';
                                    const showDate = i === 0 || formatDate(msg.timestamp) !== formatDate(messages[i - 1]?.timestamp);

                                    return (
                                        <motion.div
                                            key={msg.id || i}
                                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className="space-y-4"
                                        >
                                            {showDate && (
                                                <div className="flex items-center gap-6 py-4">
                                                    <div className="h-px flex-1 bg-white/5" />
                                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] italic">{formatDate(msg.timestamp)}</span>
                                                    <div className="h-px flex-1 bg-white/5" />
                                                </div>
                                            )}

                                            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group/msg`}>
                                                <div className={`max-w-[80%] flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} gap-4 items-end`}>
                                                    {/* Avatar / Designation Initials */}
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-lg transition-transform group-hover/msg:scale-110 ${isOwn ? 'orange-gradient text-white ml-2' : 'bg-white/5 border border-white/10 text-white/60 mr-2'}`}>
                                                        {msg.senderName?.charAt(0)?.toUpperCase()}
                                                    </div>

                                                    <div className={`space-y-1.5 ${isOwn ? 'text-right' : 'text-left'}`}>
                                                        <div className={`flex items-center gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{isOwn ? 'OPERATIVE (YOU)' : msg.senderName}</span>
                                                            {isAdmin && (
                                                                <span className="flex items-center gap-1 text-[8px] font-black bg-accent/20 text-accent border border-accent/30 px-1.5 py-0.5 rounded shadow-[0_0_8px_#ff6b0033]">
                                                                    <Shield className="w-2 h-2" /> SECTOR AUTH
                                                                </span>
                                                            )}
                                                            <div className="flex items-center gap-1.5 opacity-40">
                                                                <Clock className="w-2.5 h-2.5" />
                                                                <span className="text-[9px] font-bold">{formatTime(msg.timestamp)}</span>
                                                            </div>
                                                        </div>

                                                        <div className={`
                                                            p-4 rounded-2xl text-sm leading-relaxed border transition-all
                                                            ${isOwn
                                                                ? 'bg-accent/5 border-accent/40 text-white rounded-tr-none'
                                                                : 'glass-effect border-white/10 text-text-secondary rounded-tl-none group-hover/msg:border-white/20'}
                                                        `}>
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

                    {/* Tactical Input Terminal */}
                    <form onSubmit={handleSend} className="p-6 bg-black/40 border-t border-white/5 relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                        <div className="relative group/input">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Transmit data to sector..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-20 text-white font-medium placeholder:text-white/20 focus:border-accent/50 outline-none transition-all focus:bg-white/[0.07]"
                                onFocus={e => e.target.placeholder = "Awaiting input command..."}
                                onBlur={e => e.target.placeholder = "Transmit data to sector..."}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <button
                                    type="submit"
                                    disabled={sending || !newMessage.trim()}
                                    className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90
                                        ${(sending || !newMessage.trim())
                                            ? 'bg-white/5 text-white/20 cursor-not-allowed'
                                            : 'orange-gradient text-white shadow-lg shadow-accent/20 hover:scale-105'}
                                    `}
                                >
                                    <Send size={18} className={sending ? 'animate-pulse' : ''} />
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-4 px-2">
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Ready to broadcast</span>
                            </div>
                            <div className="h-px flex-1 bg-white/5" />
                            <p className="text-[8px] font-bold text-text-muted italic">Encryption active (AES-256-GCM)</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// Sub-component for Link to avoid import error if Link is not imported (assuming it is available or needs import)
import Link from 'next/link';
