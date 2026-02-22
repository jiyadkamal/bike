'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Settings, User, Mail, MapPin, Save, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [state, setState] = useState(user?.state || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (user) { setName(user.name || ''); setEmail(user.email || ''); setState(user.state || ''); }
    }, [user]);

    async function handleSave(e) {
        e.preventDefault(); setSaving(true);
        try { await api.put('/api/auth/profile', { name, state }); setSaved(true); setTimeout(() => setSaved(false), 3000); }
        catch (e) { console.error(e); }
        finally { setSaving(false); }
    }

    const inputStyle = {
        width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
        background: '#f5f6fa', borderRadius: 12, fontSize: 14, border: '2px solid transparent',
        outline: 'none', color: '#1a1a2e', transition: 'all 0.2s',
    };
    const iconStyle = { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#9ca3af' };

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>Settings</h2>
                <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Manage your account and preferences</p>
            </div>

            <div style={{ maxWidth: 560 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid rgba(229,231,235,0.5)' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #ff6b00, #ff8533)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 22, boxShadow: '0 4px 12px rgba(255,107,0,0.25)' }}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e' }}>{user?.name || 'User'}</h3>
                            <p style={{ fontSize: 13, color: '#9ca3af' }}>{user?.email}</p>
                        </div>
                    </div>

                    {saved && (
                        <div style={{ marginBottom: 20, padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontSize: 14 }}>
                            <CheckCircle style={{ width: 18, height: 18 }} /> Profile updated successfully!
                        </div>
                    )}

                    <form onSubmit={handleSave}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 8 }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User style={iconStyle} />
                                <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle}
                                    onFocus={e => { e.target.style.borderColor = '#ff6b00'; e.target.style.background = '#fff'; }}
                                    onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#f5f6fa'; }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 8 }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={iconStyle} />
                                <input type="email" value={email} disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
                            </div>
                            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Email cannot be changed</p>
                        </div>

                        <div style={{ marginBottom: 28 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 8 }}>State</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin style={iconStyle} />
                                <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="Maharashtra" style={inputStyle}
                                    onFocus={e => { e.target.style.borderColor = '#ff6b00'; e.target.style.background = '#fff'; }}
                                    onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#f5f6fa'; }} />
                            </div>
                        </div>

                        <button type="submit" disabled={saving}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 14, background: 'linear-gradient(135deg, #ff6b00, #ff8533)', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px rgba(255,107,0,0.3)', opacity: saving ? 0.6 : 1 }}>
                            <Save style={{ width: 18, height: 18 }} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
