'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Users, Plus, Edit3, Trash2, X, Save, Search, Mail, MapPin, Shield } from 'lucide-react';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', state: '' });
    const [error, setError] = useState('');

    useEffect(() => { fetchUsers(); }, []);

    async function fetchUsers() {
        try { const res = await api.get('/api/admin/users'); setUsers(res.data.users || []); }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    async function handleAdd(e) {
        e.preventDefault(); setError('');
        try {
            await api.post('/api/admin/users', form);
            setShowAddModal(false); setForm({ name: '', email: '', password: '', role: 'user', state: '' }); fetchUsers();
        } catch (err) { setError(err.response?.data?.error || 'Failed to create'); }
    }

    async function handleEdit(e) {
        e.preventDefault(); setError('');
        try {
            await api.put(`/api/admin/users/${editingUser.uid}`, { name: form.name, role: form.role, state: form.state, status: form.status });
            setEditingUser(null); fetchUsers();
        } catch (err) { setError(err.response?.data?.error || 'Failed to update'); }
    }

    async function handleDelete(uid) {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try { await api.delete(`/api/admin/users/${uid}`); fetchUsers(); }
        catch (e) { alert(e.response?.data?.error || 'Delete failed'); }
    }

    function openEdit(user) {
        setEditingUser(user);
        setForm({ name: user.name, email: user.email, password: '', role: user.role, state: user.state, status: user.status });
        setError('');
    }

    const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

    const inputStyle = { width: '100%', padding: '12px 16px', background: 'rgba(15,23,42,0.6)', borderRadius: 12, fontSize: 14, border: '2px solid rgba(255,255,255,0.06)', outline: 'none', color: '#e2e8f0', transition: 'all 0.2s' };
    const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 };

    const statusColors = { approved: { bg: 'rgba(16,185,129,0.1)', color: '#10b981' }, pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' }, rejected: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' } };

    // Modal component
    function Modal({ title, onClose, onSubmit, children }) {
        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    style={{ width: '100%', maxWidth: 480, background: '#1e293b', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', padding: 0, boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{title}</h3>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}><X style={{ width: 20, height: 20 }} /></button>
                    </div>
                    <form onSubmit={onSubmit} style={{ padding: 24 }}>
                        {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 10, color: '#fca5a5', fontSize: 13 }}>{error}</div>}
                        {children}
                        <button type="submit" style={{ width: '100%', padding: 13, background: 'linear-gradient(135deg, #ff6b00, #ff8533)', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', marginTop: 8, boxShadow: '0 4px 16px rgba(255,107,0,0.3)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Save style={{ width: 16, height: 16 }} /> Save</span>
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>User Management</h2>
                    <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{users.length} users registered</p>
                </div>
                <button onClick={() => { setShowAddModal(true); setError(''); setForm({ name: '', email: '', password: '', role: 'user', state: '' }); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'linear-gradient(135deg, #ff6b00, #ff8533)', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,107,0,0.3)' }}>
                    <Plus style={{ width: 18, height: 18 }} /> Add User
                </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 360, marginBottom: 20 }}>
                <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#475569' }} />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
                    style={{ ...inputStyle, paddingLeft: 44 }}
                    onFocus={e => e.target.style.borderColor = '#ff6b00'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'}
                />
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                    <div style={{ width: 40, height: 40, border: '4px solid #1e293b', borderTop: '4px solid #ff6b00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: '#1e293b', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>

                    {/* Table header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '4fr 3fr 2fr 2fr 2fr', gap: 16, padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <div>User</div><div>Email</div><div>Role</div><div>Status</div><div style={{ textAlign: 'right' }}>Actions</div>
                    </div>

                    {filtered.map((user, i) => {
                        const sc = statusColors[user.status] || statusColors.approved;
                        return (
                            <div key={user.uid}
                                style={{ display: 'grid', gridTemplateColumns: '4fr 3fr 2fr 2fr 2fr', gap: 16, padding: '14px 24px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: user.role === 'admin' ? 'linear-gradient(135deg, #ff6b00, #ff8533)' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{user.name}</p>
                                        <p style={{ fontSize: 11, color: '#475569' }}>{user.state || 'No location'}</p>
                                    </div>
                                </div>

                                <div style={{ fontSize: 13, color: '#94a3b8' }}>{user.email}</div>

                                <div>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: user.role === 'admin' ? 'rgba(255,107,0,0.1)' : 'rgba(59,130,246,0.1)', color: user.role === 'admin' ? '#ff6b00' : '#3b82f6' }}>
                                        {user.role === 'admin' && <Shield style={{ width: 12, height: 12 }} />} {user.role}
                                    </span>
                                </div>

                                <div>
                                    <span style={{ padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: sc.bg, color: sc.color }}>
                                        {user.status}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                                    <button onClick={() => openEdit(user)} style={{ padding: 8, borderRadius: 8, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s' }}
                                        onMouseEnter={e => { e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'none'; }}>
                                        <Edit3 style={{ width: 16, height: 16 }} />
                                    </button>
                                    <button onClick={() => handleDelete(user.uid)} style={{ padding: 8, borderRadius: 8, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s' }}
                                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'none'; }}>
                                        <Trash2 style={{ width: 16, height: 16 }} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            )}

            {/* Add User Modal */}
            {showAddModal && (
                <Modal title="Add New User" onClose={() => setShowAddModal(false)} onSubmit={handleAdd}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
                        <div><label style={labelStyle}>Full Name</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inputStyle} onFocus={e => e.target.style.borderColor = '#ff6b00'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'} /></div>
                        <div><label style={labelStyle}>Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={inputStyle} onFocus={e => e.target.style.borderColor = '#ff6b00'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'} /></div>
                        <div><label style={labelStyle}>Password</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={inputStyle} onFocus={e => e.target.style.borderColor = '#ff6b00'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={labelStyle}>Role</label>
                                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option value="user">User</option><option value="admin">Admin</option>
                                </select>
                            </div>
                            <div><label style={labelStyle}>State</label><input type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor = '#ff6b00'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'} /></div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <Modal title={`Edit: ${editingUser.name}`} onClose={() => setEditingUser(null)} onSubmit={handleEdit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
                        <div><label style={labelStyle}>Full Name</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor = '#ff6b00'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={labelStyle}>Role</label>
                                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option value="user">User</option><option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Status</label>
                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option value="approved">Approved</option><option value="pending">Pending</option><option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                        <div><label style={labelStyle}>State</label><input type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor = '#ff6b00'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.06)'} /></div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
