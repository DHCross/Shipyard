/**
 * ProfileVault - Persistent storage for birth profiles
 * 
 * Stores profiles in localStorage with JSON export/import capability.
 * No authentication required - portable via JSON backup.
 */

export interface BirthProfile {
    id: string;
    name: string;
    birthDate: string;      // ISO date: "1982-08-15"
    birthTime: string;      // HH:MM: "14:30"
    birthCity: string;
    latitude: number;
    longitude: number;
    timezone?: string;
    relationship: 'self' | 'partner' | 'family' | 'friend' | 'other';
    createdAt: number;      // Unix timestamp
    lastUsedAt: number;     // Unix timestamp
    notes?: string;
}

const VAULT_KEY = 'raven_profile_vault';

/**
 * Generate a simple UUID for profile IDs
 */
function generateId(): string {
    return 'profile_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

/**
 * Load all profiles from localStorage
 */
export function loadProfiles(): BirthProfile[] {
    if (typeof window === 'undefined') return [];

    try {
        const raw = localStorage.getItem(VAULT_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed as BirthProfile[];
    } catch (err) {
        console.warn('[ProfileVault] Failed to load profiles:', err);
        return [];
    }
}

/**
 * Save all profiles to localStorage
 */
function persistProfiles(profiles: BirthProfile[]): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(VAULT_KEY, JSON.stringify(profiles));
    } catch (err) {
        console.error('[ProfileVault] Failed to persist profiles:', err);
    }
}

/**
 * Save a new profile or update an existing one
 */
export function saveProfile(profile: Omit<BirthProfile, 'id' | 'createdAt' | 'lastUsedAt'> & { id?: string }): BirthProfile {
    const profiles = loadProfiles();
    const now = Date.now();

    if (profile.id) {
        // Update existing
        const index = profiles.findIndex(p => p.id === profile.id);
        if (index >= 0) {
            const updated: BirthProfile = {
                ...profiles[index],
                ...profile,
                id: profile.id,
                lastUsedAt: now
            };
            profiles[index] = updated;
            persistProfiles(profiles);
            console.log('[ProfileVault] Updated profile:', updated.name);
            return updated;
        }
    }

    // Create new
    const newProfile: BirthProfile = {
        ...profile,
        id: generateId(),
        createdAt: now,
        lastUsedAt: now
    };
    profiles.push(newProfile);
    persistProfiles(profiles);
    console.log('[ProfileVault] Saved new profile:', newProfile.name);
    return newProfile;
}

/**
 * Delete a profile by ID
 */
export function deleteProfile(id: string): boolean {
    const profiles = loadProfiles();
    const filtered = profiles.filter(p => p.id !== id);

    if (filtered.length < profiles.length) {
        persistProfiles(filtered);
        console.log('[ProfileVault] Deleted profile:', id);
        return true;
    }
    return false;
}

/**
 * Find a profile by name (case-insensitive)
 */
export function getProfileByName(name: string): BirthProfile | null {
    const profiles = loadProfiles();
    const normalized = name.toLowerCase().trim();
    return profiles.find(p => p.name.toLowerCase().trim() === normalized) || null;
}

/**
 * Find a profile by ID
 */
export function getProfileById(id: string): BirthProfile | null {
    const profiles = loadProfiles();
    return profiles.find(p => p.id === id) || null;
}

/**
 * Mark a profile as recently used (updates lastUsedAt)
 */
export function markProfileUsed(id: string): void {
    const profiles = loadProfiles();
    const index = profiles.findIndex(p => p.id === id);

    if (index >= 0) {
        profiles[index].lastUsedAt = Date.now();
        persistProfiles(profiles);
    }
}

/**
 * Get the "self" profile (the user's own chart)
 */
export function getSelfProfile(): BirthProfile | null {
    const profiles = loadProfiles();
    return profiles.find(p => p.relationship === 'self') || null;
}

/**
 * Get profiles sorted by most recently used
 */
export function getRecentProfiles(limit?: number): BirthProfile[] {
    const profiles = loadProfiles();
    const sorted = profiles.sort((a, b) => b.lastUsedAt - a.lastUsedAt);
    return limit ? sorted.slice(0, limit) : sorted;
}

/**
 * Export all profiles as a JSON string (for backup)
 */
export function exportProfiles(): string {
    const profiles = loadProfiles();
    const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        profiles
    };
    return JSON.stringify(exportData, null, 2);
}

/**
 * Import profiles from a JSON string (for restore)
 * Merges with existing profiles (by ID), preferring imported data for conflicts.
 */
export function importProfiles(jsonString: string): { imported: number; merged: number; errors: string[] } {
    const result = { imported: 0, merged: 0, errors: [] as string[] };

    try {
        const data = JSON.parse(jsonString);

        let incoming: BirthProfile[] = [];

        // Handle both wrapped format { profiles: [...] } and raw array
        if (Array.isArray(data)) {
            incoming = data;
        } else if (data.profiles && Array.isArray(data.profiles)) {
            incoming = data.profiles;
        } else {
            result.errors.push('Invalid format: expected array or { profiles: [...] }');
            return result;
        }

        const existing = loadProfiles();
        const existingIds = new Set(existing.map(p => p.id));

        for (const profile of incoming) {
            // Validate minimum required fields
            if (!profile.name || !profile.birthDate || !profile.birthTime) {
                result.errors.push(`Skipped invalid profile: missing required fields`);
                continue;
            }

            if (existingIds.has(profile.id)) {
                // Merge: update existing with imported data
                const idx = existing.findIndex(p => p.id === profile.id);
                existing[idx] = { ...existing[idx], ...profile, lastUsedAt: Date.now() };
                result.merged++;
            } else {
                // New profile
                existing.push({
                    ...profile,
                    id: profile.id || generateId(),
                    createdAt: profile.createdAt || Date.now(),
                    lastUsedAt: Date.now()
                });
                result.imported++;
            }
        }

        persistProfiles(existing);
        console.log('[ProfileVault] Import complete:', result);
        return result;

    } catch (err: any) {
        result.errors.push(`Parse error: ${err.message}`);
        return result;
    }
}

/**
 * Clear all profiles (use with caution!)
 */
export function clearVault(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(VAULT_KEY);
    console.log('[ProfileVault] Vault cleared');
}

/**
 * Get a summary of the vault for Raven's context injection
 */
export function getVaultSummary(): string {
    const profiles = loadProfiles();

    if (profiles.length === 0) {
        return 'No profiles in vault. This appears to be a new user.';
    }

    const self = profiles.find(p => p.relationship === 'self');
    const others = profiles.filter(p => p.relationship !== 'self');

    let summary = `Profile Vault: ${profiles.length} profile(s) on record.\n`;

    if (self) {
        summary += `• SELF: ${self.name} (${self.birthDate})\n`;
    }

    if (others.length > 0) {
        summary += `• OTHERS: ${others.map(p => `${p.name} [${p.relationship}]`).join(', ')}\n`;
    }

    return summary;
}
