'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Users, Crown, Trash2, Mail } from 'lucide-react';

export default function MembersPage() {
    const { user } = useAuth();
    const [allOrgs, setAllOrgs] = useState([]);
    const [selectedOrgId, setSelectedOrgId] = useState(null);
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllMyOrgs();
    }, []);

    // When an org is selected, fetch its members
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
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    async function fetchOrgDetail(id) {
        try {
            const detail = await api.get(`/api/organizations/${id}`);
            setOrg(detail.data.organization);
        } catch (err) { console.error(err); }
    }

    async function removeMember(uid) {
        if (!confirm('Remove this member?')) return;
        try {
            await api.delete(`/api/organizations/${org.id}/members/${uid}`);
            fetchOrgDetail(org.id);
        }
        catch (e) { console.error(e); }
    }

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #e5e7eb', borderTop: '4px solid #ff6b00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (allOrgs.length === 0) return (
        <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb' }}>
            <Users style={{ width: 56, height: 56, color: '#e5e7eb', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>No Organization</h3>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Join an organization to see members.</p>
        </div>
    );

    const isAdmin = org?.createdBy === user?.uid;

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', gap: 24 }}>
            {/* Sidebar List */}
            <div style={{ width: 280, flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>My Organizations</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                            }}
                            onMouseEnter={e => { if (selectedOrgId !== o.id) e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
                            onMouseLeave={e => { if (selectedOrgId !== o.id) e.currentTarget.style.background = 'transparent'; }}
                        >
                            <p style={{ fontSize: 15, fontWeight: selectedOrgId === o.id ? 700 : 500, color: selectedOrgId === o.id ? '#1a1a2e' : '#6b7280' }}>{o.name}</p>
                            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{o.state}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>Members</h2>
                        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
                            {org?.members?.length || 0} members in {org?.name || 'Organization'}
                        </p>
                    </div>
                </div>

                {org && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={org.id}
                        style={{ background: '#fff', borderRadius: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid rgba(229,231,235,0.5)', overflow: 'hidden' }}>

                        {/* Header */}
                        <div style={{ display: 'grid', gridTemplateColumns: '5fr 3fr 2fr 2fr', gap: 16, padding: '14px 24px', background: '#f9fafb', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <div>Member</div><div>Email</div><div>Role</div><div style={{ textAlign: 'right' }}>Actions</div>
                        </div>

                        {/* Rows */}
                        {org.members?.map((member, i) => (
                            <div key={i}
                                style={{ display: 'grid', gridTemplateColumns: '5fr 3fr 2fr 2fr', gap: 16, padding: '16px 24px', alignItems: 'center', borderTop: '1px solid #f0f0f0', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#fafafa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #ff6b00, #ff8533)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                                        {member.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{member.name}</p>
                                        <p style={{ fontSize: 12, color: '#9ca3af' }}>UID: {member.uid?.slice(0, 8)}...</p>
                                    </div>
                                </div>

                                <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Mail style={{ width: 14, height: 14 }} /> {member.email}
                                </div>

                                <div>
                                    {member.role === 'admin' ? (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#fff7ed', color: '#ff6b00', fontSize: 12, fontWeight: 700, borderRadius: 8 }}>
                                            <Crown style={{ width: 12, height: 12 }} /> Admin
                                        </span>
                                    ) : (
                                        <span style={{ display: 'inline-flex', padding: '4px 10px', background: '#f5f6fa', color: '#6b7280', fontSize: 12, fontWeight: 500, borderRadius: 8 }}>Member</span>
                                    )}
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    {isAdmin && member.uid !== user?.uid && (
                                        <button onClick={() => removeMember(member.uid)} title="Remove member"
                                            style={{ padding: 8, borderRadius: 8, background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', transition: 'all 0.15s' }}
                                            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.background = 'none'; }}>
                                            <Trash2 style={{ width: 16, height: 16 }} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
