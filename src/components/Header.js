'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bell, ChevronDown, LogOut, User } from 'lucide-react';

export default function Header() {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 32px',
            background: '#fff',
            borderBottom: '1px solid #e5e7eb',
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>
            {/* Left: Greeting */}
            <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>
                    {greeting}, <span style={{ color: '#ff6b00' }}>{user?.name || 'Rider'}</span> 🏍️
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                        padding: '4px 12px',
                        background: 'linear-gradient(135deg, #ff6b00, #ff8533)',
                        color: '#fff',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                    }}>
                        {dateStr}
                    </span>
                </div>
            </div>

            {/* Right: Notifications & Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Notification bell */}
                <button style={{
                    position: 'relative',
                    width: 42, height: 42, borderRadius: 12,
                    background: '#f5f6fa', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#eef0f4'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f6fa'; }}
                >
                    <Bell style={{ width: 20, height: 20, color: '#6b7280' }} />
                    <span style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 8, height: 8, borderRadius: '50%',
                        background: '#ff6b00', border: '2px solid #fff',
                    }} />
                </button>

                {/* Profile dropdown */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '6px 12px 6px 6px', borderRadius: 12,
                            background: '#f5f6fa', border: 'none', cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#eef0f4'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f6fa'; }}
                    >
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: 'linear-gradient(135deg, #ff6b00, #ff8533)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: 14,
                        }}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>
                            {user?.name || 'User'}
                        </span>
                        <ChevronDown style={{
                            width: 16, height: 16, color: '#9ca3af',
                            transition: 'transform 0.2s',
                            transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                        }} />
                    </button>

                    {dropdownOpen && (
                        <div style={{
                            position: 'absolute', right: 0, top: '100%', marginTop: 8,
                            background: '#fff', borderRadius: 14, padding: 6,
                            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                            border: '1px solid #e5e7eb', minWidth: 180, zIndex: 100,
                        }}>
                            <div style={{ padding: '10px 14px', borderBottom: '1px solid #f0f0f0', marginBottom: 4 }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{user?.name}</p>
                                <p style={{ fontSize: 12, color: '#9ca3af' }}>{user?.email}</p>
                            </div>
                            <button
                                onClick={logout}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                                    padding: '10px 14px', borderRadius: 10,
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    fontSize: 13, fontWeight: 500, color: '#ef4444',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                            >
                                <LogOut style={{ width: 16, height: 16 }} />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
