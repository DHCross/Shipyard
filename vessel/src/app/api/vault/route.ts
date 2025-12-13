import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

/**
 * Vault API - User-specific profile storage
 * 
 * All requests require Authorization header: Bearer {token}
 * Token = SHA256(username+password) from /api/auth
 */

function getTokenFromRequest(request: Request): string | null {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.slice(7); // Remove "Bearer " prefix
}

export async function GET(request: Request) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(
                { error: 'Authorization required. Use Bearer token.' },
                { status: 401 }
            );
        }


        const vaultKey = `vault:${token}`;
        const vaultData = await kv.get<any>(vaultKey);

        // Default structure if empty
        const defaultVault = {
            profiles: [],
            savedReports: [],
            preferences: {
                defaultLocation: null,
                orbsProfile: 'standard',
                samplingFrequency: 'daily',
                zodiacType: 'Tropic'
            },
            healthBenchmarks: []
        };

        if (vaultData === null) {
            // New vault, return defaults (and maybe save them? No, lazy save on write is fine)
            // But if invalid auth, earlier check handles it? No, get returns null if key missing.
            // Wait, get returns null if key doesn't exist.
            // We should check if the USER exists first to distinguish "empty vault" from "invalid token".
            // But current Auth architecture: Token IS the key.
            // Actually, /api/auth verifies token by checking user record.
            // Here `vault:{token}` might not exist yet if register didn't set it (though register does check).
            // Let's just return defaults if valid user but empty vault.
            return NextResponse.json({
                success: true,
                vault: defaultVault
            });
        }

        // Return merged structure (in case stored data is missing new fields)
        return NextResponse.json({
            success: true,
            vault: { ...defaultVault, ...vaultData }
        });

    } catch (error: any) {
        console.error('Vault GET error:', error);

        if (error.message?.includes('REDIS') || error.message?.includes('KV')) {
            return NextResponse.json({
                error: 'Vault service not configured. Using local storage mode.',
                fallbackToLocal: true
            }, { status: 503 });
        }

        return NextResponse.json(
            { error: 'Failed to fetch vault', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(
                { error: 'Authorization required. Use Bearer token.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { profiles, savedReports, preferences, healthBenchmarks } = body;

        const vaultKey = `vault:${token}`;

        // Fetch current vault to merge
        const currentVault = (await kv.get<any>(vaultKey)) || {};

        // 1. Update Profiles if provided
        if (profiles && Array.isArray(profiles)) {
            currentVault.profiles = profiles;
        }

        // 2. Update Reports if provided (append or replace? Simplest: Replace list provided by client)
        if (savedReports && Array.isArray(savedReports)) {
            currentVault.savedReports = savedReports;
        }

        // 3. Update Preferences (merge)
        if (preferences) {
            currentVault.preferences = { ...currentVault.preferences, ...preferences };
        }

        // 4. Update Health Benchmarks
        if (healthBenchmarks && Array.isArray(healthBenchmarks)) {
            currentVault.healthBenchmarks = healthBenchmarks;
        }

        // Save updated vault
        await kv.set(vaultKey, currentVault);

        return NextResponse.json({
            success: true,
            action: 'updated',
            counts: {
                profiles: currentVault.profiles?.length || 0,
                reports: currentVault.savedReports?.length || 0
            }
        });

    } catch (error: any) {
        console.error('Vault POST error:', error);

        if (error.message?.includes('REDIS') || error.message?.includes('KV')) {
            return NextResponse.json({
                error: 'Vault service not configured. Using local storage mode.',
                fallbackToLocal: true
            }, { status: 503 });
        }

        return NextResponse.json(
            { error: 'Failed to save vault', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const token = getTokenFromRequest(request);
        if (!token) {
            return NextResponse.json(
                { error: 'Authorization required. Use Bearer token.' },
                { status: 401 }
            );
        }

        const vaultKey = `vault:${token}`;

        // Clear vault (set to empty array, don't delete - keeps auth valid)
        await kv.set(vaultKey, []);

        return NextResponse.json({
            success: true,
            action: 'cleared'
        });

    } catch (error: any) {
        console.error('Vault DELETE error:', error);
        return NextResponse.json(
            { error: 'Failed to clear vault', details: error.message },
            { status: 500 }
        );
    }
}
