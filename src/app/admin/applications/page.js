'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { FileCheck, CheckCircle, XCircle, Clock, Mail, MapPin, Calendar } from 'lucide-react';

export default function AdminApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);

    useEffect(() => { fetchApplications(); }, []);

    async function fetchApplications() {
        try { const res = await api.get('/api/admin/applications'); setApplications(res.data.applications || []); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    async function handleAction(uid, action) {
        setProcessing(uid);
        try {
            await api.post(`/api/admin/applications/${uid}/${action}`);
            fetchApplications();
        } catch (e) { alert(e.response?.data?.error || `${action} failed`); }
        finally { setProcessing(null); }
    }

    function formatDate(ts) {
        return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: 40, height: 40, border: '4px solid #1e293b', borderTop: '4px solid #ff6b00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>Pending Applications</h2>
                <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{applications.length} applications awaiting review</p>
            </div>

            {applications.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', padding: '80px 0', background: '#1e293b', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <CheckCircle style={{ width: 56, height: 56, color: '#10b981', margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>All Caught Up!</h3>
                    <p style={{ fontSize: 14, color: '#64748b' }}>No pending applications to review.</p>
                </motion.div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {applications.map((app, i) => (
                        <motion.div key={app.uid} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            style={{
                                background: '#1e293b', borderRadius: 18, padding: '22px 24px',
                                border: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{
                                    width: 50, height: 50, borderRadius: 14,
                                    background: '#334155',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#94a3b8', fontWeight: 700, fontSize: 20, flexShrink: 0,
                                }}>
                                    {app.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>{app.name}</h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                                            <Mail style={{ width: 14, height: 14 }} /> {app.email}
                                        </div>
                                        {app.state && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                                                <MapPin style={{ width: 14, height: 14 }} /> {app.state}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b' }}>
                                            <Calendar style={{ width: 14, height: 14 }} /> {formatDate(app.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                                <button onClick={() => handleAction(app.uid, 'approve')} disabled={processing === app.uid}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '10px 20px', borderRadius: 12,
                                        background: 'rgba(16,185,129,0.15)', color: '#10b981',
                                        border: '1px solid rgba(16,185,129,0.3)',
                                        fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.25)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.15)'; }}
                                >
                                    <CheckCircle style={{ width: 16, height: 16 }} /> Approve
                                </button>
                                <button onClick={() => handleAction(app.uid, 'reject')} disabled={processing === app.uid}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '10px 20px', borderRadius: 12,
                                        background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                                        border: '1px solid rgba(239,68,68,0.2)',
                                        fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                >
                                    <XCircle style={{ width: 16, height: 16 }} /> Reject
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
