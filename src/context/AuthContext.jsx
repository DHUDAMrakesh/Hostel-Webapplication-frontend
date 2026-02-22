import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Always point to the backend server directly (works with or without Vite proxy)
const API = `${window.location.protocol}//${window.location.hostname}:5000/api/auth`;



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

    /** Login: calls POST /api/auth/login, persists token + user in localStorage */
    const login = async (email, password) => {
        const res = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');

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

    /** Utility: returns Authorization header object */
    const authHeader = () => ({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    });

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, register, logout, authHeader }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
