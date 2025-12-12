import { NextResponse } from 'next/server';
import { buildRavenSystemPrompt, SOMATIC_BLOCKLIST } from '@/lib/raven/persona-law';

/**
 * Guardrail: Check response for somatic terms and filter them
 */
function applySomaticGuard(text: string): string {
    let filtered = text;
    for (const term of SOMATIC_BLOCKLIST) {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        // Replace with geometric alternatives
        const alternatives: Record<string, string> = {
            'chest': 'field center',
            'shoulders': 'structural load',
            'breath': 'rhythm',
            'breathing': 'rhythmic flow',
            'muscles': 'tension channels',
            'ribs': 'containment structure',
            'jaw': 'expression gate',
            'tongue': 'voice channel',
            'heartbeat': 'pulse rhythm',
            'pulse': 'signal rhythm',
            'stomach': 'core field',
            'gut': 'instinct channel',
            'collarbones': 'upper architecture',
            'visceral': 'deep-field',
            'body scan': 'field survey',
            'deep breaths': 'rhythmic pause'
        };
        filtered = filtered.replace(regex, alternatives[term.toLowerCase()] || 'field');
    }
    return filtered;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { model, messages } = body;

        // Use environment variable for the key
        const apiKey = process.env.PERPLEXITY_API_KEY || request.headers.get('x-perplexity-key');

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Configuration Error: No Oracle Key provided.' },
                { status: 401 }
            );
        }

        // Build Raven's complete system prompt
        const ravenSystemPrompt = buildRavenSystemPrompt();

        // Ensure system message uses Raven's persona
        let processedMessages = messages || [];

        // If first message is a system message, replace it with Raven's prompt
        if (processedMessages.length > 0 && processedMessages[0].role === 'system') {
            processedMessages = [
                { role: 'system', content: ravenSystemPrompt },
                ...processedMessages.slice(1)
            ];
        } else if (processedMessages.length === 0) {
            // Default messages for ping
            processedMessages = [
                { role: 'system', content: ravenSystemPrompt },
                { role: 'user', content: 'Ping.' }
            ];
        } else {
            // Prepend Raven's system prompt
            processedMessages = [
                { role: 'system', content: ravenSystemPrompt },
                ...processedMessages
            ];
        }

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model || 'sonar',
                messages: processedMessages
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        // Apply somatic guard to the response
        if (data.choices && data.choices[0]?.message?.content) {
            data.choices[0].message.content = applySomaticGuard(data.choices[0].message.content);
        }

        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Oracle Connection Failed', details: error.message },
            { status: 500 }
        );
    }
}
