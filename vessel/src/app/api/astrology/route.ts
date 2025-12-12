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

        const apiKey = process.env.Astrology_API_KEY;
        const apiHost = 'best-astrology-api-natal-charts-transits-synastry.p.rapidapi.com';

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Configuration Error: No Astrology API Key provided.' },
                { status: 401 }
            );
        }

        // Construct the external URL
        // Default to the one in the preset if not specified
        const path = endpoint || '/western_chart_data';
        const externalUrl = `https://${apiHost}${path.startsWith('/') ? path : '/' + path}`;

        const response = await fetch(externalUrl, {
            method: method || 'POST',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': apiHost,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload || body), // Fallback to sending the whole body if payload wrapper isn't used
        });

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
