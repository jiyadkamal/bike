'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout({ children }) {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user?.role === 'admin') {
            router.push('/admin');
        }
    }, [user, router]);

    // Don't render user dashboard for admins
    if (user?.role === 'admin') return null;

    return (
        <ProtectedRoute>
            <div style={{ minHeight: '100vh', background: '#f5f6fa', fontFamily: "'Inter', system-ui, sans-serif" }}>
                <Sidebar />
                <div style={{
                    marginLeft: 256,
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <Header />
                    <main style={{
                        flex: 1,
                        padding: 28,
                        overflowY: 'auto',
                    }}>
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
