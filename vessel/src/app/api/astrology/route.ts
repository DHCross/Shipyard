import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Extract the endpoint path from the request body if provided, or default to specific one
        // The RequestPanel might send the full body expected by the external API.
        // We might want to pass a 'targetPath' in the body or query param to know which RapidAPI endpoint to hit.
        // For now, let's assume the client sends the full URL or we map it.
        // ACTUALLY, to make it flexible like the RequestPanel expects, the RequestPanel configures the URL.
        // But if we use a proxy, the RequestPanel should point to /api/astrology.
        // We'll accept a 'endpoint' parameter in the body or search params.

        // Let's refine the strategy: 
        // The RequestPanel is a generic tool.
        // If we want to secure the key, we must proxy.
        // The client will POST to /api/astrology with { endpoint: '/western_chart_data', method: 'POST', data: { ... } }

        // However, the current RequestPanel sends a direct body.
        // Let's stick to a simple proxy for the main endpoint used in the preset for now, 
        // OR allow the client to specify the path.

        const { endpoint, method, payload } = body;

        // RapidAPI key is shared across hosted APIs.
        // Prefer RAPIDAPI_KEY (canonical), but keep Astrology_API_KEY as a fallback.
        const apiKey = process.env.RAPIDAPI_KEY || process.env.Astrology_API_KEY;
        // AstroAPI v3 (RapidAPI)
        const apiHost = 'best-astrology-api.p.rapidapi.com';

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Configuration Error: No Astrology API Key provided.' },
                { status: 401 }
            );
        }

        if (endpoint && typeof endpoint !== 'string') {
            return NextResponse.json(
                { error: 'Invalid request: endpoint must be a string.' },
                { status: 400 }
            );
        }

        const normalizedMethod = (typeof method === 'string' ? method : 'POST').toUpperCase();
        if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].includes(normalizedMethod)) {
            return NextResponse.json(
                { error: `Invalid request: unsupported method ${String(method)}` },
                { status: 400 }
            );
        }

        // Construct the external URL
        // Default to the one in the preset if not specified
        const path = endpoint || '/api/v3/charts/natal';
        if (typeof path !== 'string' || !path.startsWith('/')) {
            return NextResponse.json(
                { error: 'Invalid request: endpoint must start with "/".' },
                { status: 400 }
            );
        }
        const externalUrl = `https://${apiHost}${path}`;

        const fetchOptions: RequestInit = {
            method: normalizedMethod,
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': apiHost,
                'Content-Type': 'application/json',
            },
        };

        if (normalizedMethod !== 'GET' && normalizedMethod !== 'HEAD') {
            fetchOptions.body = JSON.stringify(payload || body);
        }

        const response = await fetch(externalUrl, fetchOptions);

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Astrology API Connection Failed', details: error.message },
            { status: 500 }
        );
    }
}
