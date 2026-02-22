'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const res = await api.get('/api/auth/me');
            setUser(res.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password) {
        const res = await api.post('/api/auth/login', { email, password });
        setUser(res.data.user);
        return res.data;
    }

    async function register(name, email, password, state) {
        const res = await api.post('/api/auth/register', { name, email, password, state });
        // Don't auto-set user if pending approval
        if (!res.data.pending) {
            setUser(res.data.user);
        }
        return res.data;
    }

    async function logout() {
        try {
            await api.post('/api/auth/logout');
        } catch (e) { }
        setUser(null);
    }

    async function refreshToken() {
        try {
            await api.post('/api/auth/refresh');
            await checkAuth();
        } catch (e) {
            setUser(null);
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshToken, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
