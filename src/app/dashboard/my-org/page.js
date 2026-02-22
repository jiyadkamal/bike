'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Building2, MapPin, Copy, Check, Edit3, Save } from 'lucide-react';

export default function MyOrgPage() {
    const { user } = useAuth();
    const [allOrgs, setAllOrgs] = useState([]);
    const [selectedOrgId, setSelectedOrgId] = useState(null);
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editState, setEditState] = useState('');

    useEffect(() => { fetchAllMyOrgs(); }, []);

    // When an org is selected, fetch its detail
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
            const orgData = detail.data.organization;
            setOrg(orgData);
            setEditName(orgData.name);
            setEditState(orgData.state);
            setEditing(false);
        } catch (err) { console.error(err); }
    }

    async function handleSave() {
        try {
            await api.put(`/api/organizations/${org.id}`, { name: editName, state: editState });
            setEditing(false);
            // Update the local list as well
            setAllOrgs(prev => prev.map(o => o.id === org.id ? { ...o, name: editName, state: editState } : o));
            fetchOrgDetail(org.id);
        }
        catch (err) { console.error(err); }
    }

    function copyCode() {
        navigator.clipboard.writeText(org?.joiningCode || '');
        setCopied(true); setTimeout(() => setCopied(false), 2000);
    }

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #e5e7eb', borderTop: '4px solid #ff6b00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (allOrgs.length === 0) return (
        <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', borderRadius: 20, border: '1px solid #e5e7eb' }}>
            <Building2 style={{ width: 56, height: 56, color: '#e5e7eb', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>No Organization</h3>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>You haven&apos;t joined any organization yet.</p>
            <a href="/dashboard/explore" style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #ff6b00, #ff8533)', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 12px rgba(255,107,0,0.25)' }}>Explore Organizations</a>
        </div>
    );

    const isAdmin = org?.createdBy === user?.uid;
    const inputStyle = { width: '100%', marginTop: 4, padding: '10px 14px', background: '#f5f6fa', borderRadius: 10, fontSize: 14, border: '2px solid transparent', outline: 'none', color: '#1a1a2e' };

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', gap: 24 }}>
            {/* Sidebar List */}
            <div style={{ width: 280, flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>My Organizations</h3>
                    <a href="/dashboard/create-org" style={{ fontSize: 12, color: '#ff6b00', fontWeight: 600, textDecoration: 'none' }}>+ Create</a>
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
                {org && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div>
                                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>Organization Details</h2>
                                <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Manage and view settings for {org.name}</p>
                            </div>
                            {isAdmin && (
                                <button onClick={() => editing ? handleSave() : setEditing(true)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(135deg, #ff6b00, #ff8533)', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,107,0,0.25)' }}>
                                    {editing ? <><Save style={{ width: 16, height: 16 }} /> Save</> : <><Edit3 style={{ width: 16, height: 16 }} /> Edit</>}
                                </button>
                            )}
                        </div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={org.id}
                            style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid rgba(229,231,235,0.5)', marginBottom: 20 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
                                <div>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Organization Name</label>
                                        {editing ? <input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = '#ff6b00'} onBlur={e => e.target.style.borderColor = 'transparent'} />
                                            : <p style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginTop: 4 }}>{org.name}</p>}
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>State</label>
                                        {editing ? <input value={editState} onChange={e => setEditState(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = '#ff6b00'} onBlur={e => e.target.style.borderColor = 'transparent'} />
                                            : <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}><MapPin style={{ width: 16, height: 16, color: '#ff6b00' }} /> {org.state || 'Not set'}</p>}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Joining Code</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                            <span style={{ fontSize: 22, fontWeight: 700, color: '#ff6b00', letterSpacing: '0.15em' }}>{org.joiningCode}</span>
                                            <button onClick={copyCode} style={{ padding: 6, borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f5f6fa'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                                                {copied ? <Check style={{ width: 16, height: 16, color: '#10b981' }} /> : <Copy style={{ width: 16, height: 16, color: '#9ca3af' }} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div style={{ padding: 14, background: '#f5f6fa', borderRadius: 14 }}>
                                            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Members</p>
                                            <p style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>{org.members?.length || 0}</p>
                                        </div>
                                        <div style={{ padding: 14, background: '#f5f6fa', borderRadius: 14 }}>
                                            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Pending</p>
                                            <p style={{ fontSize: 22, fontWeight: 700, color: '#ff6b00' }}>{org.pendingRequests?.length || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {isAdmin && org.pendingRequests?.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid rgba(229,231,235,0.5)' }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>Pending Requests</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {org.pendingRequests.map((req, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: '#f5f6fa', borderRadius: 14 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, #ff6b00, #ff8533)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>{req.name?.charAt(0)?.toUpperCase()}</div>
                                                <div>
                                                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{req.name}</p>
                                                    <p style={{ fontSize: 12, color: '#9ca3af' }}>{req.email}</p>
                                                </div>
                                            </div>
                                            <button onClick={async () => { await api.post(`/api/organizations/${org.id}/approve/${req.uid}`); fetchOrgDetail(org.id); }}
                                                style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #ff6b00, #ff8533)', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                                Approve
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
