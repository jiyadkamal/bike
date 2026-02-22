'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Shield, Calendar, Building2, TrendingUp, Activity, Award } from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuth();
    const [allOrgs, setAllOrgs] = useState([]);
    const [selectedOrgId, setSelectedOrgId] = useState(null);
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllMyOrgs();
    }, []);

    useEffect(() => {
        if (selectedOrgId) fetchOrgDetail(selectedOrgId);
    }, [selectedOrgId]);

    async function fetchAllMyOrgs() {
        try {
            const res = await api.get('/api/organizations/my');
            const myOrgs = res.data.organizations || [];
            setAllOrgs(myOrgs);
            if (myOrgs.length > 0 && !selectedOrgId) {
                setSelectedOrgId(myOrgs[0].id);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function fetchOrgDetail(id) {
        try {
            const detail = await api.get(`/api/organizations/${id}`);
            setOrg(detail.data.organization);
        } catch (e) {
            console.error(e);
        }
    }

    const stats = [
        { label: 'Members', value: org?.members?.length || 0, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
        { label: 'Messages', value: '—', icon: MessageSquare, color: '#10b981', bg: '#ecfdf5' },
        { label: 'Pending', value: org?.pendingRequests?.length || 0, icon: Shield, color: '#f59e0b', bg: '#fffbeb' },
        { label: 'Active', value: org?.members?.length || 0, icon: Activity, color: '#8b5cf6', bg: '#f5f3ff' },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <div style={{
                    width: 40, height: 40, border: '4px solid #e5e7eb',
                    borderTop: '4px solid #ff6b00', borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Header with Switcher */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>Dashboard</h2>
                {allOrgs.length > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>Switch Organization:</label>
                        <select
                            value={selectedOrgId || ''}
                            onChange={(e) => setSelectedOrgId(e.target.value)}
                            style={{
                                padding: '8px 16px', borderRadius: 10, border: '1px solid #e5e7eb',
                                background: '#fff', fontSize: 14, fontWeight: 500, color: '#1a1a2e',
                                outline: 'none', cursor: 'pointer'
                            }}
                        >
                            {allOrgs.map(o => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Organization Overview Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: '#fff',
                    borderRadius: 20,
                    padding: 28,
                    marginBottom: 24,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(229,231,235,0.5)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                    background: 'linear-gradient(180deg, #ff6b00 0%, #ff8533 100%)',
                    borderRadius: '20px 0 0 20px',
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 14,
                                background: 'linear-gradient(135deg, #ff6b00, #ff8533)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(255,107,0,0.25)',
                            }}>
                                <Building2 style={{ width: 24, height: 24, color: '#fff' }} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>
                                    {org?.name || 'No Organization'}
                                </h3>
                                <p style={{ fontSize: 13, color: '#9ca3af' }}>
                                    {org?.state || 'Join or create an organization to get started'}
                                </p>
                            </div>
                        </div>
                        {org && (
                            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                                <div>
                                    <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4 }}>Members</p>
                                    <p style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>{org.members?.length || 0}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4 }}>Join Code</p>
                                    <p style={{ fontSize: 20, fontWeight: 700, color: '#ff6b00', letterSpacing: '0.1em' }}>{org.joiningCode}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4 }}>Your Role</p>
                                    <p style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', textTransform: 'capitalize' }}>{org.createdBy === user?.uid ? 'Admin' : 'Member'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 24 }}>
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            style={{
                                background: '#fff',
                                borderRadius: 16,
                                padding: '22px 20px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                border: '1px solid rgba(229,231,235,0.5)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: 12,
                                    background: stat.bg,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon style={{ width: 20, height: 20, color: stat.color }} />
                                </div>
                            </div>
                            <p style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>{stat.value}</p>
                            <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>{stat.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                    background: '#fff',
                    borderRadius: 20,
                    padding: 28,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(229,231,235,0.5)',
                }}
            >
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                        { label: 'Explore Organizations', href: '/dashboard/explore', icon: '🔍' },
                        { label: 'Create Organization', href: '/dashboard/create-org', icon: '➕' },
                        { label: 'Open Messages', href: '/dashboard/messages', icon: '💬' },
                    ].map((action, i) => (
                        <a key={i} href={action.href} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '16px 18px', borderRadius: 14,
                            background: '#f5f6fa', textDecoration: 'none',
                            transition: 'all 0.15s', cursor: 'pointer',
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#eef0f4'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f6fa'; e.currentTarget.style.transform = 'translateX(0)'; }}
                        >
                            <span style={{ fontSize: 22 }}>{action.icon}</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{action.label}</span>
                        </a>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
