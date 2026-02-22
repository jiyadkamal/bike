'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-page-bg">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-14 h-14 border-4 border-white/5 border-t-accent rounded-full animate-spin shadow-[0_0_20px_#ff6b0033]"></div>
                    <p className="text-text-muted font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Operational Grid</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return children;
}
