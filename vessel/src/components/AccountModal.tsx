"use client";

import React, { useState } from 'react';
import { X, User, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AccountModal({ isOpen, onClose }: AccountModalProps) {
    const { isLoggedIn, username, syncStatus, login, register, logout } = useAuth();

    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [authUsername, setAuthUsername] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const result = authMode === 'login'
            ? await login(authUsername, authPassword)
            : await register(authUsername, authPassword);

        setLoading(false);

        if (result.success) {
            setAuthUsername('');
            setAuthPassword('');
            onClose();
        } else {
            setError(result.error || 'Authentication failed');
        }
    };

    const handleLogout = () => {
        logout();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-80 max-w-full bg-slate-900/95 border border-emerald-500/20 rounded-lg shadow-2xl animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="p-4 border-b border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-mono uppercase tracking-widest text-emerald-100">
                            {isLoggedIn ? 'Account' : 'Sign In'}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-emerald-400 transition-colors p-1">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {isLoggedIn ? (
                        /* Logged-in View */
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-emerald-950/30 border border-emerald-500/20 rounded">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-emerald-400" />
                                    <span className="text-emerald-200 font-mono">{username}</span>
                                </div>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded ${syncStatus === 'synced' ? 'bg-emerald-500/20 text-emerald-300' :
                                        syncStatus === 'syncing' ? 'bg-amber-500/20 text-amber-300' :
                                            'bg-slate-500/20 text-slate-400'
                                    }`}>
                                    {syncStatus === 'synced' ? '✓ Synced' : syncStatus === 'syncing' ? '↻ Syncing' : '⚡ Local'}
                                </span>
                            </div>

                            <p className="text-xs text-slate-500 text-center">
                                Your Profile Vault and saved reports are linked to this account.
                            </p>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 rounded px-3 py-2 text-rose-300 text-xs font-mono transition-colors"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        /* Login/Register Form */
                        <form onSubmit={handleSubmit} className="space-y-3">
                            {/* Mode Toggle */}
                            <div className="flex items-center gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('login')}
                                    className={`flex-1 flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider font-mono px-2 py-2 rounded border transition-colors ${authMode === 'login'
                                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                            : 'text-slate-400 border-slate-600/40 hover:text-emerald-400'
                                        }`}
                                >
                                    <LogIn className="w-3 h-3" />
                                    Sign In
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('register')}
                                    className={`flex-1 flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider font-mono px-2 py-2 rounded border transition-colors ${authMode === 'register'
                                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                            : 'text-slate-400 border-slate-600/40 hover:text-indigo-400'
                                        }`}
                                >
                                    <UserPlus className="w-3 h-3" />
                                    Create
                                </button>
                            </div>

                            <input
                                type="text"
                                placeholder="Username"
                                value={authUsername}
                                onChange={(e) => setAuthUsername(e.target.value)}
                                className="w-full bg-slate-800/60 border border-slate-600/40 rounded px-3 py-2 text-sm text-emerald-100 font-mono focus:border-emerald-500/50 focus:outline-none"
                                required
                                minLength={3}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                className="w-full bg-slate-800/60 border border-slate-600/40 rounded px-3 py-2 text-sm text-emerald-100 font-mono focus:border-emerald-500/50 focus:outline-none"
                                required
                                minLength={6}
                            />

                            {error && (
                                <div className="text-[10px] text-rose-400 text-center">{error}</div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full rounded px-3 py-2 text-sm font-mono transition-colors disabled:opacity-50 ${authMode === 'login'
                                        ? 'bg-emerald-600/30 hover:bg-emerald-500/40 border border-emerald-500/40 text-emerald-200'
                                        : 'bg-indigo-600/30 hover:bg-indigo-500/40 border border-indigo-500/40 text-indigo-200'
                                    }`}
                            >
                                {loading ? 'Please wait...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                            </button>

                            {syncStatus === 'local' && (
                                <p className="text-[9px] text-slate-500 text-center">
                                    Server not configured — data stored locally in browser.
                                </p>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
