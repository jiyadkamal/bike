'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Building2, MapPin, Bike } from 'lucide-react';

export default function CreateOrgPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [state, setState] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleCreate(e) {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true); setError('');
        try {
            await api.post('/api/organizations', { name, state });
            router.push('/dashboard/my-org');
        } catch (err) { setError(err.response?.data?.error || 'Failed to create'); }
        finally { setLoading(false); }
    }

    const inputStyle = {
        width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
        background: '#f5f6fa', borderRadius: 12, fontSize: 14, border: '2px solid transparent',
        outline: 'none', color: '#1a1a2e', transition: 'all 0.2s',
    };

    return (
        <div style={{ maxWidth: 480, margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid rgba(229,231,235,0.5)' }}>

                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #ff6b00, #ff8533)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(255,107,0,0.25)' }}>
                        <Building2 style={{ width: 32, height: 32, color: '#fff' }} />
                    </div>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>Create Organization</h2>
                    <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>Build your biker community from scratch</p>
                </div>

                {error && (
                    <div style={{ marginBottom: 20, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', fontSize: 14 }}>{error}</div>
                )}

                <form onSubmit={handleCreate}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 8 }}>Organization Name</label>
                        <div style={{ position: 'relative' }}>
                            <Bike style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#9ca3af' }} />
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Thunder Riders Club" required style={inputStyle}
                                onFocus={e => { e.target.style.borderColor = '#ff6b00'; e.target.style.background = '#fff'; }}
                                onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#f5f6fa'; }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 8 }}>State / Location</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#9ca3af' }} />
                            <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="Maharashtra" style={inputStyle}
                                onFocus={e => { e.target.style.borderColor = '#ff6b00'; e.target.style.background = '#fff'; }}
                                onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#f5f6fa'; }} />
                        </div>
                    </div>

                    <button type="submit" disabled={loading || !name.trim()}
                        style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #ff6b00, #ff8533)', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px rgba(255,107,0,0.3)', opacity: loading || !name.trim() ? 0.6 : 1 }}>
                        {loading ? 'Creating...' : 'Create Organization'}
                    </button>
                </form>

                <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
                    You&apos;ll become the admin. A unique joining code will be generated automatically.
                </p>
            </motion.div>
        </div>
    );
}
