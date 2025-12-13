import { validateImport, type ImportType, type ImportResult } from '../../lib/raven/ImportUtils';
import { Upload, FileJson, AlertCircle } from 'lucide-react';

import React, { useState, useEffect } from 'react';
import { Users, User, Calendar, MapPin, Heart, Zap, Trash2, Edit2, Check, X } from 'lucide-react';

// Profile interface for stored data
export interface Profile {
    id: string;
    name: string;
    birthData: {
        year: number;
        month: number;
        day: number;
        hour: number;
        minute: number;
        city: string;
        country_code: string;
        latitude: number;
        longitude: number;
    };
    intimacyTier?: string;
    contactState?: 'active' | 'latent';
    lastUpdated: string; // ISO 8601
}

// Storage key
const VAULT_STORAGE_KEY = 'raven_profile_vault';

// Helper to format date
function formatDate(bd: Profile['birthData']): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[bd.month - 1]} ${bd.day}, ${bd.year}`;
}

// Helper to format intimacy tier label
function getTierLabel(tier?: string): string {
    const labels: Record<string, string> = {
        solo: 'Solo',
        platonic: 'Platonic',
        fwb: 'FWB',
        situationship: 'Situationship',
        low_commitment: 'Low-Commit',
        committed_romantic_sexual: 'Committed R+S',
        committed_romantic_nonsexual: 'Committed R',
        family_other: 'Family/Other'
    };
    return labels[tier || 'solo'] || tier || 'Solo';
}

interface ProfileVaultProps {
    isOpen: boolean;
    onClose: () => void;
    onInject: (profiles: Profile[]) => void;
    onEditProfile?: (profile: Profile) => void;
    onRestoreSession?: (data: any) => void; // New callback for full session restore
}

export function ProfileVault({ isOpen, onClose, onInject, onEditProfile, onRestoreSession }: ProfileVaultProps) {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Load profiles from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(VAULT_STORAGE_KEY);
        if (stored) {
            try {
                setProfiles(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse profile vault:', e);
            }
        }
    }, []);

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleInject = () => {
        const selected = profiles.filter(p => selectedIds.has(p.id));
        if (selected.length > 0) {
            onInject(selected);
            setSelectedIds(new Set());
            onClose();
        }
    };

    const handleDelete = (id: string) => {
        const updated = profiles.filter(p => p.id !== id);
        setProfiles(updated);
        localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
        selectedIds.delete(id);
        setSelectedIds(new Set(selectedIds));
    };

    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportError(null);
        setImportSuccess(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string;
                const json = JSON.parse(text);
                const result = validateImport(json);

                if (!result.valid) {
                    setImportError(result.error || "Invalid file format");
                    return;
                }

                if (result.type === 'profile' && result.normalizedData) {
                    // Import as generic profile
                    const newProfile: Profile = {
                        id: generateProfileId(),
                        name: result.normalizedData.subject.name,
                        birthData: result.normalizedData.subject.birth_data,
                        lastUpdated: new Date().toISOString()
                    };
                    saveProfileToVault(newProfile);
                    // Refresh local state
                    const updated = [...profiles, newProfile];
                    setProfiles(updated);
                    setImportSuccess(`Imported profile: ${newProfile.name}`);
                }
                else if ((result.type === 'session_export' || result.type === 'legacy_report') && result.normalizedData) {
                    // If we have onRestoreSession, offer to restore immediately
                    if (onRestoreSession) {
                        onRestoreSession(result.normalizedData);
                        onClose(); // Close vault after restore
                        return;
                    }

                    // Fallback: Save as profile if possible
                    if (result.normalizedData.subject) {
                        const newProfile: Profile = {
                            id: generateProfileId(),
                            name: result.normalizedData.subject.name,
                            birthData: result.normalizedData.subject.birth_data,
                            lastUpdated: new Date().toISOString()
                        };
                        saveProfileToVault(newProfile);
                        // Refresh local state
                        const updated = [...profiles, newProfile];
                        setProfiles(updated);
                        setImportSuccess(`Imported chart data for: ${newProfile.name}`);
                    }
                }

            } catch (err) {
                console.error("Import failed", err);
                setImportError("Failed to parse JSON file");
            } finally {
                // Reset input
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    // ... (existing render logic)

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Side Panel */}
            <div className="relative ml-auto w-80 max-w-full h-full bg-slate-900/95 border-l border-emerald-500/20 shadow-2xl flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="p-4 border-b border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-mono uppercase tracking-widest text-emerald-100">Profile Vault</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-slate-500 hover:text-emerald-400 transition-colors p-1"
                            title="Import JSON"
                        >
                            <Upload className="w-4 h-4" />
                        </button>
                        <input
                            type="file"
                            accept=".json"
                            ref={fileInputRef}
                            onChange={handleFileImport}
                            hidden
                        />
                        <button onClick={onClose} className="text-slate-500 hover:text-emerald-400 transition-colors p-1">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                {importError && (
                    <div className="mx-4 mt-4 p-3 bg-red-950/30 border border-red-500/30 rounded text-red-200 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {importError}
                    </div>
                )}
                {importSuccess && (
                    <div className="mx-4 mt-4 p-3 bg-emerald-950/30 border border-emerald-500/30 rounded text-emerald-200 text-xs flex items-center gap-2">
                        <Check className="w-4 h-4 flex-shrink-0" />
                        {importSuccess}
                    </div>
                )}

                {/* Profile List */}
                {/* ... existing profile list code ... */}

                {/* Profile List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {profiles.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-xs font-mono">
                            <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            No profiles saved yet.<br />
                            Use the Lens Alignment Card to add.
                        </div>
                    ) : (
                        profiles.map(profile => (
                            <div
                                key={profile.id}
                                onClick={() => toggleSelection(profile.id)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedIds.has(profile.id)
                                    ? 'bg-emerald-900/40 border-emerald-400/60'
                                    : 'bg-slate-800/50 border-slate-700/50 hover:border-emerald-500/30'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {selectedIds.has(profile.id) && (
                                                <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                            )}
                                            <span className="text-sm font-serif text-emerald-100 truncate">{profile.name}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono mt-1 flex flex-wrap gap-x-2">
                                            <span className="flex items-center gap-0.5">
                                                <Calendar className="w-2.5 h-2.5" />
                                                {formatDate(profile.birthData)}
                                            </span>
                                            <span className="flex items-center gap-0.5">
                                                <MapPin className="w-2.5 h-2.5" />
                                                {profile.birthData.city}
                                            </span>
                                        </div>
                                        {profile.intimacyTier && profile.intimacyTier !== 'solo' && (
                                            <div className="text-[9px] text-emerald-500/60 font-mono mt-1 flex items-center gap-1">
                                                <Heart className="w-2 h-2" />
                                                {getTierLabel(profile.intimacyTier)}
                                                {profile.contactState === 'latent' && (
                                                    <span className="text-slate-500 ml-1">💤</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-1 ml-2 flex-shrink-0">
                                        {onEditProfile && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEditProfile(profile); }}
                                                className="p-1 text-slate-500 hover:text-emerald-400 transition-colors"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(profile.id); }}
                                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-emerald-500/20 space-y-2">
                    <div className="text-[10px] text-slate-500 font-mono text-center">
                        {selectedIds.size > 0 ? (
                            <span className="text-emerald-400">{selectedIds.size} profile{selectedIds.size > 1 ? 's' : ''} selected</span>
                        ) : (
                            'Select profiles to inject into chat'
                        )}
                    </div>
                    <button
                        onClick={handleInject}
                        disabled={selectedIds.size === 0}
                        className="w-full py-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-100 text-xs font-mono uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Zap className="w-3 h-3" />
                        Inject {selectedIds.size > 1 ? 'Profiles' : 'Profile'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper function to save a profile to the vault (exported for LensAlignmentCard)
export function saveProfileToVault(profile: Profile): void {
    const stored = localStorage.getItem(VAULT_STORAGE_KEY);
    let profiles: Profile[] = [];
    if (stored) {
        try {
            profiles = JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse profile vault:', e);
        }
    }
    // Check if profile with same id exists, update it
    const existingIndex = profiles.findIndex(p => p.id === profile.id);
    if (existingIndex >= 0) {
        profiles[existingIndex] = profile;
    } else {
        profiles.push(profile);
    }
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(profiles));
}

// Helper to generate unique ID
export function generateProfileId(): string {
    return `profile_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default ProfileVault;
