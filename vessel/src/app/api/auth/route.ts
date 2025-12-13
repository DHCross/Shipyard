import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import crypto from 'crypto';

/**
 * Simple Auth API for User Vault System
 * 
 * Actions:
 * - register: Create new account with empty vault
 * - login: Verify credentials, return token
 * 
 * Token = SHA256(username + password) - used as vault key
 */

function hashCredentials(username: string, password: string): string {
    return crypto.createHash('sha256').update(`${username.toLowerCase()}:${password}`).digest('hex');
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, username, password } = body;

        // Validate input
        if (!action || !username || !password) {
            return NextResponse.json(
                { error: 'Missing required fields: action, username, password' },
                { status: 400 }
            );
        }

        if (username.length < 3 || password.length < 6) {
            return NextResponse.json(
                { error: 'Username must be 3+ chars, password 6+ chars' },
                { status: 400 }
            );
        }

        const token = hashCredentials(username, password);
        const vaultKey = `vault:${token}`;
        const userKey = `user:${username.toLowerCase()}`;

        if (action === 'register') {
            // Check if username already exists
            const existingUser = await kv.get(userKey);
            if (existingUser) {
                return NextResponse.json(
                    { error: 'Username already taken' },
                    { status: 409 }
                );
            }

            // Create user record and empty vault
            await kv.set(userKey, { token, createdAt: new Date().toISOString() });
            await kv.set(vaultKey, []); // Empty vault

            return NextResponse.json({
                success: true,
                action: 'registered',
                token,
                username: username.toLowerCase()
            });

        } else if (action === 'login') {
            // Verify user exists and token matches
            const userRecord = await kv.get<{ token: string }>(userKey);

            if (!userRecord || userRecord.token !== token) {
                return NextResponse.json(
                    { error: 'Invalid username or password' },
                    { status: 401 }
                );
            }

            return NextResponse.json({
                success: true,
                action: 'logged_in',
                token,
                username: username.toLowerCase()
            });

        } else {
            return NextResponse.json(
                { error: 'Invalid action. Use "register" or "login"' },
                { status: 400 }
            );
        }

    } catch (error: any) {
        console.error('Auth error:', error);

        // Handle KV not configured (local dev without Vercel KV)
        if (error.message?.includes('REDIS') || error.message?.includes('KV')) {
            return NextResponse.json({
                error: 'Auth service not configured. Using local storage mode.',
                fallbackToLocal: true
            }, { status: 503 });
        }

        return NextResponse.json(
            { error: 'Authentication failed', details: error.message },
            { status: 500 }
        );
    }
}
