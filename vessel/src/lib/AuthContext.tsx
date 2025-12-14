"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Storage keys
const AUTH_STORAGE_KEY = 'raven_auth_token';
const USERNAME_STORAGE_KEY = 'raven_username';

interface AuthContextType {
    isLoggedIn: boolean;
    username: string;
    authToken: string | null;
    syncStatus: 'idle' | 'syncing' | 'synced' | 'local';
    login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    setSyncStatus: (status: 'idle' | 'syncing' | 'synced' | 'local') => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'local'>('local');

    // Check for stored auth on mount
    useEffect(() => {
        const storedToken = localStorage.getItem(AUTH_STORAGE_KEY);
        const storedUsername = localStorage.getItem(USERNAME_STORAGE_KEY);
        if (storedToken && storedUsername) {
            setAuthToken(storedToken);
            setUsername(storedUsername);
            setIsLoggedIn(true);
        }
    }, []);

    const login = useCallback(async (user: string, pass: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login', username: user, password: pass })
            });
            const data = await response.json();

            if (data.fallbackToLocal) {
                setSyncStatus('local');
                return { success: false, error: 'Account system not available. Using local storage.' };
            }

            if (!response.ok) {
                return { success: false, error: data.error || 'Login failed' };
            }

            setAuthToken(data.token);
            setUsername(data.username);
            setIsLoggedIn(true);
            localStorage.setItem(AUTH_STORAGE_KEY, data.token);
            localStorage.setItem(USERNAME_STORAGE_KEY, data.username);
            return { success: true };

        } catch (e) {
            return { success: false, error: 'Connection failed' };
        }
    }, []);

    const register = useCallback(async (user: string, pass: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'register', username: user, password: pass })
            });
            const data = await response.json();

            if (data.fallbackToLocal) {
                setSyncStatus('local');
                return { success: false, error: 'Account system not available. Using local storage.' };
            }

            if (!response.ok) {
                return { success: false, error: data.error || 'Registration failed' };
            }

            setAuthToken(data.token);
            setUsername(data.username);
            setIsLoggedIn(true);
            localStorage.setItem(AUTH_STORAGE_KEY, data.token);
            localStorage.setItem(USERNAME_STORAGE_KEY, data.username);
            return { success: true };

        } catch (e) {
            return { success: false, error: 'Connection failed' };
        }
    }, []);

    const logout = useCallback(() => {
        setIsLoggedIn(false);
        setAuthToken(null);
        setUsername('');
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(USERNAME_STORAGE_KEY);
        setSyncStatus('local');
    }, []);

    return (
        <AuthContext.Provider value={{
            isLoggedIn,
            username,
            authToken,
            syncStatus,
            login,
            register,
            logout,
            setSyncStatus
        }}>
            {children}
        </AuthContext.Provider>
    );
}
