'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const res = await api.post('/api/auth/login', { email, password });
            if (res.data.user.role !== 'admin') {
                setError('Access denied. Admin credentials required.');
                await api.post('/api/auth/logout');
                setLoading(false);
                return;
            }
            router.push('/admin');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally { setLoading(false); }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            fontFamily: "'Inter', system-ui, sans-serif",
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Background decoration */}
            <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,107,0,0.05)', filter: 'blur(80px)' }} />
            <div style={{ position: 'absolute', bottom: -100, left: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,107,0,0.08)', filter: 'blur(60px)' }} />

            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}
                style={{ width: '100%', maxWidth: 420, padding: '0 24px', position: 'relative', zIndex: 10 }}>

                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: 20,
                        background: 'linear-gradient(135deg, #ff6b00 0%, #ff8533 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 20px 50px rgba(255,107,0,0.35)',
                    }}>
                        <Shield style={{ width: 36, height: 36, color: '#fff' }} />
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Admin Panel</h1>
                    <p style={{ fontSize: 14, color: '#64748b' }}>Biker OS System Administration</p>
                </div>

                <div style={{
                    background: 'rgba(30, 41, 59, 0.8)', borderRadius: 20, padding: '36px 32px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
                }}>
                    {error && (
                        <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, color: '#fca5a5', fontSize: 14 }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#475569' }} />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@bikeros.com" required
                                    style={{ width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 13, paddingBottom: 13, background: 'rgba(15,23,42,0.6)', borderRadius: 12, fontSize: 14, border: '2px solid rgba(255,255,255,0.06)', outline: 'none', color: '#e2e8f0', transition: 'all 0.2s' }}
                                    onFocus={e => { e.target.style.borderColor = '#ff6b00'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,0,0.15)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#475569' }} />
                                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                                    style={{ width: '100%', paddingLeft: 44, paddingRight: 48, paddingTop: 13, paddingBottom: 13, background: 'rgba(15,23,42,0.6)', borderRadius: 12, fontSize: 14, border: '2px solid rgba(255,255,255,0.06)', outline: 'none', color: '#e2e8f0', transition: 'all 0.2s' }}
                                    onFocus={e => { e.target.style.borderColor = '#ff6b00'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,0,0.15)'; }}
                                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = 'none'; }}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}>
                                    {showPass ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #ff6b00, #ff8533)', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 30px rgba(255,107,0,0.35)', opacity: loading ? 0.6 : 1, transition: 'all 0.2s' }}>
                            {loading ? 'Signing in...' : 'Sign In as Admin'}
                        </button>
                    </form>

                    <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#475569' }}>
                        This area is restricted to system administrators only.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
