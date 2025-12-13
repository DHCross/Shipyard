/**
 * useProfileVault - React hook for ProfileVault integration
 * 
 * Provides reactive access to the profile vault with loading states.
 */

import { useState, useEffect, useCallback } from 'react';
import {
    BirthProfile,
    loadProfiles,
    saveProfile,
    deleteProfile,
    getProfileByName,
    getSelfProfile,
    getRecentProfiles,
    exportProfiles,
    importProfiles,
    getVaultSummary
} from '../../services/ProfileVault';

export interface UseProfileVaultResult {
    profiles: BirthProfile[];
    loading: boolean;
    selfProfile: BirthProfile | null;

    // CRUD
    save: (profile: Omit<BirthProfile, 'id' | 'createdAt' | 'lastUsedAt'>) => BirthProfile;
    remove: (id: string) => boolean;
    findByName: (name: string) => BirthProfile | null;

    // Vault operations
    refresh: () => void;
    getSummary: () => string;

    // Export/Import
    exportToJson: () => string;
    importFromJson: (json: string) => { imported: number; merged: number; errors: string[] };
    downloadBackup: () => void;
}

export function useProfileVault(): UseProfileVaultResult {
    const [profiles, setProfiles] = useState<BirthProfile[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(() => {
        setLoading(true);
        const loaded = loadProfiles();
        setProfiles(loaded);
        setLoading(false);
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const save = useCallback((profile: Omit<BirthProfile, 'id' | 'createdAt' | 'lastUsedAt'>) => {
        const saved = saveProfile(profile);
        refresh();
        return saved;
    }, [refresh]);

    const remove = useCallback((id: string) => {
        const result = deleteProfile(id);
        if (result) refresh();
        return result;
    }, [refresh]);

    const findByName = useCallback((name: string) => {
        return getProfileByName(name);
    }, []);

    const exportToJson = useCallback(() => {
        return exportProfiles();
    }, []);

    const importFromJson = useCallback((json: string) => {
        const result = importProfiles(json);
        refresh();
        return result;
    }, [refresh]);

    const downloadBackup = useCallback(() => {
        const json = exportProfiles();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `raven_profiles_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, []);

    const getSummary = useCallback(() => {
        return getVaultSummary();
    }, []);

    const selfProfile = profiles.find(p => p.relationship === 'self') || null;

    return {
        profiles,
        loading,
        selfProfile,
        save,
        remove,
        findByName,
        refresh,
        getSummary,
        exportToJson,
        importFromJson,
        downloadBackup
    };
}
