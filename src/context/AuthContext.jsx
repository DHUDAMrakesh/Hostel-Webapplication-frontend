import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Point to the backend server (uses env variable on Vercel, defaults to local 5001)
const API = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/auth` 
    : `${window.location.protocol}//${window.location.hostname}:5001/api/auth`;



export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);   // { id, name, email, role }
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // hydrating from localStorage

    // On mount: restore session from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('hostel_token');
        const storedUser = localStorage.getItem('hostel_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    /** Login: calls POST /api/auth/login */
    const login = async (email, password) => {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');

        if (data.mfaRequired) {
            return { mfaRequired: true, email: data.email };
        }

        localStorage.setItem('hostel_token', data.token);
        localStorage.setItem('hostel_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { user: data.user };
    };

    /** Verify 2FA: completes the login flow */
    const verify2FA = async (email, otp) => {
        const res = await fetch(`${API}/verify-2fa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Verification failed');

        localStorage.setItem('hostel_token', data.token);
        localStorage.setItem('hostel_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    /** Register: calls POST /api/auth/register (creates student account) */
    const register = async (name, email, password) => {
        const res = await fetch(`${API}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');

        localStorage.setItem('hostel_token', data.token);
        localStorage.setItem('hostel_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return data.user;
    };

    /** Logout: clears state and localStorage */
    const logout = () => {
        localStorage.removeItem('hostel_token');
        localStorage.removeItem('hostel_user');
        setToken(null);
        setUser(null);
    };

    /** Update user fields (e.g. name, phone) in memory + localStorage */
    const updateUser = (fields) => {
        setUser(prev => {
            const updated = { ...prev, ...fields };
            localStorage.setItem('hostel_user', JSON.stringify(updated));
            return updated;
        });
    };

    /** Utility: returns Authorization header object */
    const authHeader = () => ({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    });

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, verify2FA, register, logout, authHeader, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
