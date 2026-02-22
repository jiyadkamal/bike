'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Shield, Users, FileCheck, LayoutDashboard, LogOut, Bike } from 'lucide-react';

const adminMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Users', icon: Users, href: '/admin/users' },
    { name: 'Applications', icon: FileCheck, href: '/admin/applications' },
];

export default function AdminLayout({ children }) {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (loading) return;

        if (pathname === '/admin/login') {
            setAuthorized(true);
            return;
        }
        if (!user) {
            setAuthorized(false);
            router.push('/login');
        } else if (user.role !== 'admin') {
            setAuthorized(false);
            router.push('/login');
        } else {
            setAuthorized(true);
        }
    }, [user, pathname, router, loading]);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    // For the login page, render without the sidebar
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    if (!authorized) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
                <div style={{ width: 40, height: 40, border: '4px solid #1e293b', borderTop: '4px solid #ff6b00', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Admin Sidebar */}
            <aside style={{
                position: 'fixed', left: 0, top: 0, width: 256, height: '100vh',
                background: '#1e293b', display: 'flex', flexDirection: 'column',
                zIndex: 50, borderRight: '1px solid rgba(255,255,255,0.06)',
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #ff6b00, #ff8533)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255,107,0,0.3)' }}>
                        <Shield style={{ width: 22, height: 22, color: '#fff' }} />
                    </div>
                    <div>
                        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em' }}>Admin Panel</h1>
                        <p style={{ color: '#475569', fontSize: 11, fontWeight: 500 }}>Biker OS</p>
                    </div>
                </div>

                {/* Menu */}
                <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {adminMenuItems.map(item => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link key={item.name} href={item.href} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                                    borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
                                    background: isActive ? '#ff6b00' : 'transparent',
                                    color: isActive ? '#fff' : '#94a3b8',
                                    boxShadow: isActive ? '0 4px 12px rgba(255,107,0,0.3)' : 'none',
                                }}
                                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff'; } }}
                                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
                                >
                                    <Icon style={{ width: 20, height: 20, flexShrink: 0 }} />
                                    <span style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div style={{ padding: '8px 10px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12, color: '#94a3b8', transition: 'all 0.15s', cursor: 'pointer' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                            <Bike style={{ width: 20, height: 20 }} />
                            <span style={{ fontSize: 14, fontWeight: 500 }}>User Dashboard</span>
                        </div>
                    </Link>
                    <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12, background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', width: '100%', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
                        <LogOut style={{ width: 20, height: 20 }} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Content */}
            <div style={{ marginLeft: 256, minHeight: '100vh' }}>
                {/* Admin Header */}
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                            Welcome, <span style={{ color: '#ff6b00' }}>{user?.name || 'Admin'}</span>
                        </h2>
                        <p style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>System Administrator</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(255,107,0,0.1)', borderRadius: 10, border: '1px solid rgba(255,107,0,0.2)' }}>
                        <Shield style={{ width: 16, height: 16, color: '#ff6b00' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#ff6b00' }}>Admin Mode</span>
                    </div>
                </header>

                <main style={{ padding: 28 }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
