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
        const profiles = await kv.get<any[]>(vaultKey);

        if (profiles === null) {
            // Token doesn't match any vault - invalid auth
            return NextResponse.json(
                { error: 'Invalid token or vault not found' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            profiles,
            count: profiles.length
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
        const { profiles } = body;

        if (!Array.isArray(profiles)) {
            return NextResponse.json(
                { error: 'Request body must include "profiles" array' },
                { status: 400 }
            );
        }

        const vaultKey = `vault:${token}`;

        // Verify vault exists (valid token)
        const existing = await kv.get(vaultKey);
        if (existing === null) {
            return NextResponse.json(
                { error: 'Invalid token or vault not found' },
                { status: 401 }
            );
        }

        // Update vault
        await kv.set(vaultKey, profiles);

        return NextResponse.json({
            success: true,
            action: 'saved',
            count: profiles.length
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
