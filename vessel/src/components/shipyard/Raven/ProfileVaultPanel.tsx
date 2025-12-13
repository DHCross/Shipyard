/**
 * ProfileVaultPanel - UI for managing saved birth profiles
 * 
 * Features:
 * - View all saved profiles
 * - Delete profiles
 * - Export all profiles as JSON
 * - Import profiles from JSON file
 */

import React, { useRef, useState } from 'react';
import { Users, Download, Upload, Trash2, User, Heart, Home, UserPlus, X, Check } from 'lucide-react';
import { useProfileVault } from './useProfileVault';
import { BirthProfile } from '../../services/ProfileVault';

const RELATIONSHIP_ICONS: Record<BirthProfile['relationship'], React.ReactNode> = {
    self: <User className="w-4 h-4" />,
    partner: <Heart className="w-4 h-4" />,
    family: <Home className="w-4 h-4" />,
    friend: <Users className="w-4 h-4" />,
    other: <UserPlus className="w-4 h-4" />
};

const RELATIONSHIP_LABELS: Record<BirthProfile['relationship'], string> = {
    self: 'Self',
    partner: 'Partner',
    family: 'Family',
    friend: 'Friend',
    other: 'Other'
};

interface ProfileVaultPanelProps {
    onClose?: () => void;
    onSelectProfile?: (profile: BirthProfile) => void;
}

export const ProfileVaultPanel: React.FC<ProfileVaultPanelProps> = ({ onClose, onSelectProfile }) => {
    const vault = useProfileVault();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleExport = () => {
        vault.downloadBackup();
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const result = vault.importFromJson(text);

            if (result.errors.length > 0) {
                setImportResult({
                    success: false,
                    message: `Errors: ${result.errors.join(', ')}`
                });
            } else {
                setImportResult({
                    success: true,
                    message: `Imported ${result.imported} new, merged ${result.merged} existing profiles.`
                });
            }

            // Clear after 3 seconds
            setTimeout(() => setImportResult(null), 3000);
        } catch (err: any) {
            setImportResult({
                success: false,
                message: `Failed to read file: ${err.message}`
            });
        }

        // Reset file input
        e.target.value = '';
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Remove ${name} from your vault?`)) {
            vault.remove(id);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="bg-slate-900/95 backdrop-blur-sm rounded-lg border border-indigo-900/30 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-900/80 border-b border-indigo-900/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-semibold text-slate-200">Profile Vault</span>
                    <span className="text-xs text-slate-500">({vault.profiles.length})</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
                        title="Export JSON Backup"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleImportClick}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-green-400 transition-colors"
                        title="Import from JSON"
                    >
                        <Upload className="w-4 h-4" />
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* Import Result Toast */}
            {importResult && (
                <div className={`px-4 py-2 text-xs flex items-center gap-2 ${importResult.success ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
                    }`}>
                    {importResult.success ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {importResult.message}
                </div>
            )}

            {/* Profile List */}
            <div className="max-h-64 overflow-y-auto">
                {vault.loading ? (
                    <div className="p-4 text-center text-slate-500 text-sm">Loading...</div>
                ) : vault.profiles.length === 0 ? (
                    <div className="p-6 text-center">
                        <Users className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">No profiles saved yet.</p>
                        <p className="text-slate-600 text-xs mt-1">Complete a handshake with Raven to save your first profile.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800/50">
                        {vault.profiles.map(profile => (
                            <div
                                key={profile.id}
                                className="px-4 py-3 hover:bg-slate-800/30 transition-colors group cursor-pointer"
                                onClick={() => onSelectProfile?.(profile)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-full ${profile.relationship === 'self' ? 'bg-indigo-900/50 text-indigo-400' :
                                                profile.relationship === 'partner' ? 'bg-rose-900/50 text-rose-400' :
                                                    profile.relationship === 'family' ? 'bg-amber-900/50 text-amber-400' :
                                                        profile.relationship === 'friend' ? 'bg-emerald-900/50 text-emerald-400' :
                                                            'bg-slate-800 text-slate-400'
                                            }`}>
                                            {RELATIONSHIP_ICONS[profile.relationship]}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-200">
                                                {profile.name}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {formatDate(profile.birthDate)} • {profile.birthCity}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-600 hidden group-hover:inline">
                                            {RELATIONSHIP_LABELS[profile.relationship]}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(profile.id, profile.name);
                                            }}
                                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-900/30 text-slate-500 hover:text-red-400 transition-all"
                                            title="Delete Profile"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {vault.profiles.length > 0 && (
                <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/50 text-xs text-slate-600 text-center">
                    Click a profile to load • Export to backup
                </div>
            )}
        </div>
    );
};
