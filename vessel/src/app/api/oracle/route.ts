import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { model, messages } = body;

        // Use environment variable for the key, or fall back to a provided header for dev flexibility
        // In production (Vercel), this MUST be an env var.
        const apiKey = process.env.PERPLEXITY_API_KEY || request.headers.get('x-perplexity-key');

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Configuration Error: No Oracle Key provided.' },
                { status: 401 }
            );
        }

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model || 'llama-3.1-sonar-small-128k-online',
                messages: messages || [
                    { role: 'system', content: 'You are the Oracle.' },
                    { role: 'user', content: 'Ping.' }
                ]
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Oracle Connection Failed', details: error.message },
            { status: 500 }
        );
    }
}
