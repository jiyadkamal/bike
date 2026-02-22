'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bike, Mail, Lock, User, MapPin, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
    const { register, user } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [state, setState] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingApproval, setPendingApproval] = useState(false);

    useEffect(() => {
        if (user && user.status !== 'pending') router.push('/dashboard');
    }, [user, router]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await register(name, email, password, state);
            if (data.pending) {
                setPendingApproval(true);
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    }

    const inputStyle = {
        width: '100%',
        paddingLeft: 44,
        paddingRight: 16,
        paddingTop: 12,
        paddingBottom: 12,
        background: '#f5f6fa',
        borderRadius: 12,
        fontSize: 14,
        border: '2px solid transparent',
        outline: 'none',
        color: '#1a1a2e',
        transition: 'all 0.2s',
        fontFamily: "'Inter', system-ui, sans-serif",
    };

    const iconStyle = {
        position: 'absolute',
        left: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 18,
        height: 18,
        color: '#9ca3af',
    };

    function handleFocus(e) {
        e.target.style.borderColor = '#ff6b00';
        e.target.style.background = '#fff';
        e.target.style.boxShadow = '0 0 0 3px rgba(255,107,0,0.1)';
    }
    function handleBlur(e) {
        e.target.style.borderColor = 'transparent';
        e.target.style.background = '#f5f6fa';
        e.target.style.boxShadow = 'none';
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: '#1f2937',
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>
            {/* Left: Branding */}
            <div style={{
                width: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at 30% 50%, rgba(255,107,0,0.15) 0%, transparent 60%)',
                }} />
                <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 48px' }}>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            width: 80, height: 80, borderRadius: 16,
                            background: 'linear-gradient(135deg, #ff6b00 0%, #ff8533 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 32px',
                            boxShadow: '0 20px 40px rgba(255,107,0,0.3)',
                        }}
                    >
                        <Bike style={{ width: 40, height: 40, color: '#fff' }} />
                    </motion.div>
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{ fontSize: 48, fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em' }}
                    >
                        Biker OS
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{ fontSize: 16, color: '#9ca3af', maxWidth: 380, margin: '0 auto', lineHeight: 1.6 }}
                    >
                        Join the premier platform for biker organizations and communities.
                    </motion.p>
                </div>
                <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,107,0,0.06)', filter: 'blur(60px)' }} />
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,107,0,0.08)', filter: 'blur(40px)' }} />
            </div>

            {/* Right: Register form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 48px' }}>
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ width: '100%', maxWidth: 420 }}
                >
                    <div style={{
                        background: '#fff', borderRadius: 20, padding: '36px 36px',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                    }}>
                        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>Create account</h2>
                        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28 }}>Join Biker OS today</p>

                        {error && (
                            <div style={{ marginBottom: 20, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, color: '#dc2626', fontSize: 14 }}>
                                {error}
                            </div>
                        )}

                        {pendingApproval ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ width: 64, height: 64, borderRadius: 16, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <span style={{ fontSize: 32 }}>⏳</span>
                                </div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>Registration Successful!</h3>
                                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 20 }}>
                                    Your account is pending admin approval. You&apos;ll be able to log in once an admin has reviewed and approved your application.
                                </p>
                                <Link href="/login" style={{ display: 'inline-block', padding: '12px 24px', background: 'linear-gradient(135deg, #ff6b00, #ff8533)', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 12px rgba(255,107,0,0.25)' }}>
                                    Go to Login
                                </Link>
                            </div>
                        ) : (
                            <>
                                <form onSubmit={handleSubmit}>
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 8 }}>Full Name</label>
                                        <div style={{ position: 'relative' }}>
                                            <User style={iconStyle} />
                                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Rider" required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 8 }}>Email</label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail style={iconStyle} />
                                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="rider@bikeros.com" required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 8 }}>Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock style={iconStyle} />
                                            <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ ...inputStyle, paddingRight: 48 }} onFocus={handleFocus} onBlur={handleBlur} />
                                            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                                                {showPass ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 24 }}>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a2e', marginBottom: 8 }}>State</label>
                                        <div style={{ position: 'relative' }}>
                                            <MapPin style={iconStyle} />
                                            <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="Maharashtra" style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            width: '100%', padding: 14,
                                            background: 'linear-gradient(135deg, #ff6b00 0%, #ff8533 100%)',
                                            borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 14,
                                            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                            boxShadow: '0 8px 24px rgba(255,107,0,0.35)',
                                            transition: 'all 0.2s', opacity: loading ? 0.6 : 1,
                                        }}
                                    >
                                        {loading ? 'Creating account...' : 'Create Account'}
                                    </button>
                                </form>

                                <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#6b7280' }}>
                                    Already have an account?{' '}
                                    <Link href="/login" style={{ color: '#ff6b00', fontWeight: 600, textDecoration: 'none' }}>
                                        Sign in
                                    </Link>
                                </p>
                            </>
                        )}
                    </div>
                </motion.div>
            </div >
        </div >
    );
}
