'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Search, Users, MapPin, ArrowRight } from 'lucide-react';

export default function ExplorePage() {
    const { user } = useAuth();
    const [organizations, setOrganizations] = useState([]);
    const [search, setSearch] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [joinOrgId, setJoinOrgId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => { fetchOrganizations(); }, []);

    async function fetchOrganizations() {
        try {
            const res = await api.get('/api/organizations');
            setOrganizations(res.data.organizations || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }

    async function handleJoin(orgId) {
        try {
            await api.post(`/api/organizations/${orgId}/join`, { joiningCode: joinCode });
            setMessage('Join request sent successfully!');
            setJoinOrgId(null); setJoinCode('');
        } catch (err) { setMessage(err.response?.data?.error || 'Join failed'); }
    }

    const filtered = organizations.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>Explore Organizations</h2>
                <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Find and join biker communities near you</p>
            </div>

            <div style={{ position: 'relative', maxWidth: 400, marginBottom: 24 }}>
                <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#9ca3af' }} />
                <input
                    type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search organizations..."
                    style={{ width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12, background: '#fff', borderRadius: 14, fontSize: 14, border: '1px solid #e5e7eb', outline: 'none', color: '#1a1a2e' }}
                    onFocus={e => { e.target.style.borderColor = '#ff6b00'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,0,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                />
            </div>

            {message && (
                <div style={{ marginBottom: 16, padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, color: '#059669', fontSize: 14 }}>
                    {message}
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                    <div style={{ width: 40, height: 40, border: '4px solid #e5e7eb', borderTop: '4px solid #ff6b00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb' }}>
                    <Search style={{ width: 48, height: 48, color: '#e5e7eb', margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>No organizations found</h3>
                    <p style={{ fontSize: 14, color: '#6b7280' }}>Try a different search or create your own.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                    {filtered.map((org, i) => (
                        <motion.div key={org.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            style={{ background: '#fff', borderRadius: 18, padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid rgba(229,231,235,0.5)', transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #ff6b00, #ff8533)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20 }}>
                                    {org.name.charAt(0)}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280' }}>
                                    <Users style={{ width: 16, height: 16 }} /> {org.memberCount}
                                </div>
                            </div>

                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>{org.name}</h3>
                            {org.state && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>
                                    <MapPin style={{ width: 14, height: 14 }} /> {org.state}
                                </div>
                            )}

                            {joinOrgId === org.id ? (
                                <div>
                                    <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="Enter joining code"
                                        style={{ width: '100%', padding: '10px 14px', background: '#f5f6fa', borderRadius: 10, fontSize: 13, border: '2px solid transparent', outline: 'none', color: '#1a1a2e', marginBottom: 8 }}
                                        onFocus={e => e.target.style.borderColor = '#ff6b00'} onBlur={e => e.target.style.borderColor = 'transparent'}
                                    />
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => handleJoin(org.id)} style={{ flex: 1, padding: 10, background: 'linear-gradient(135deg, #ff6b00, #ff8533)', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Confirm</button>
                                        <button onClick={() => { setJoinOrgId(null); setJoinCode(''); }} style={{ padding: '10px 16px', background: '#f5f6fa', borderRadius: 10, color: '#6b7280', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer' }}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setJoinOrgId(org.id)}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 11, background: '#fff7ed', color: '#ff6b00', borderRadius: 12, fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#ffedd5'} onMouseLeave={e => e.currentTarget.style.background = '#fff7ed'}
                                >
                                    Request to Join <ArrowRight style={{ width: 16, height: 16 }} />
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
