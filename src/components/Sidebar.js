'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard, Search, Building2, PlusCircle,
    MessageSquare, Users, Settings, HelpCircle,
    LogOut, Bike
} from 'lucide-react';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'Explore', icon: Search, href: '/dashboard/explore' },
    { name: 'My Organization', icon: Building2, href: '/dashboard/my-org' },
    { name: 'Create Org', icon: PlusCircle, href: '/dashboard/create-org' },
    { name: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
    { name: 'Members', icon: Users, href: '/dashboard/members' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
];

const bottomItems = [
    { name: 'Help', icon: HelpCircle, href: '/dashboard/help' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <aside style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: 256,
            height: '100vh',
            background: '#1f2937',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50,
            boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
            fontFamily: "'Inter', system-ui, sans-serif",
            overflow: 'hidden',
        }}>
            {/* Logo */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '24px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
                <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'linear-gradient(135deg, #ff6b00 0%, #ff8533 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(255,107,0,0.3)',
                }}>
                    <Bike style={{ width: 22, height: 22, color: '#fff' }} />
                </div>
                <h1 style={{
                    color: '#fff', fontWeight: 700, fontSize: 20,
                    whiteSpace: 'nowrap', letterSpacing: '-0.01em',
                }}>
                    Biker OS
                </h1>
            </div>

            {/* Menu */}
            <nav style={{
                flex: 1, padding: '16px 10px', overflowY: 'auto',
                display: 'flex', flexDirection: 'column', gap: 4,
            }}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                        <Link key={item.name} href={item.href} style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '11px 14px',
                                borderRadius: 12,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                background: isActive ? '#ff6b00' : 'transparent',
                                color: isActive ? '#fff' : '#9ca3af',
                                boxShadow: isActive ? '0 4px 12px rgba(255,107,0,0.3)' : 'none',
                            }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        e.currentTarget.style.color = '#fff';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#9ca3af';
                                    }
                                }}
                            >
                                <Icon style={{ width: 20, height: 20, flexShrink: 0 }} />
                                <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>
                                    {item.name}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom: Help + Sign Out */}
            <div style={{ padding: '8px 10px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {bottomItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link key={item.name} href={item.href} style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '11px 14px', borderRadius: 12, cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                background: isActive ? '#ff6b00' : 'transparent',
                                color: isActive ? '#fff' : '#9ca3af',
                            }}
                                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; } }}
                                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; } }}
                            >
                                <Icon style={{ width: 20, height: 20, flexShrink: 0 }} />
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</span>
                            </div>
                        </Link>
                    );
                })}

                {/* Sign Out */}
                <button
                    onClick={logout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '11px 14px', borderRadius: 12,
                        background: 'none', border: '1px solid rgba(239,68,68,0.3)',
                        cursor: 'pointer', transition: 'all 0.15s ease',
                        color: '#ef4444', width: '100%',
                        fontSize: 14, fontWeight: 500,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                >
                    <LogOut style={{ width: 20, height: 20, flexShrink: 0 }} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
