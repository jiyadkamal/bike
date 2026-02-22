'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Users, Building2, FileCheck, TrendingUp, Shield } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchStats(); }, []);

    async function fetchStats() {
        try {
            const res = await api.get('/api/admin/stats');
            setStats(res.data.stats);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #1e293b', borderTop: '4px solid #ff6b00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const cards = [
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
        { label: 'Pending Applications', value: stats?.pendingUsers || 0, icon: FileCheck, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        { label: 'Approved Users', value: stats?.approvedUsers || 0, icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        { label: 'Organizations', value: stats?.totalOrgs || 0, icon: Building2, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
        { label: 'Admins', value: stats?.admins || 0, icon: Shield, color: '#ff6b00', bg: 'rgba(255,107,0,0.1)' },
    ];

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>System Overview</h2>
                <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Monitor and manage the Biker OS platform</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 }}>
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                            style={{
                                background: '#1e293b', borderRadius: 16, padding: '22px 18px',
                                border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s', cursor: 'pointer',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                        >
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                                <Icon style={{ width: 20, height: 20, color: card.color }} />
                            </div>
                            <p style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{card.value}</p>
                            <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{card.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ background: '#1e293b', borderRadius: 20, padding: 28, border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                        { label: 'Manage Users', href: '/admin/users', icon: '👤' },
                        { label: 'Review Applications', href: '/admin/applications', icon: '📋' },
                        { label: 'User Dashboard', href: '/dashboard', icon: '🏍️' },
                    ].map((action, i) => (
                        <a key={i} href={action.href} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '16px 18px', borderRadius: 14,
                            background: 'rgba(255,255,255,0.03)', textDecoration: 'none',
                            border: '1px solid rgba(255,255,255,0.06)',
                            transition: 'all 0.15s', cursor: 'pointer',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                        >
                            <span style={{ fontSize: 22 }}>{action.icon}</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{action.label}</span>
                        </a>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
