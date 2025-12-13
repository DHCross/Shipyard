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

/**
 * Guardrail: Strip Perplexity citation brackets [1], [2], etc.
 * Raven never shows academic citations in output.
 */
function stripCitations(text: string): string {
    // Remove citation brackets like [1], [2], [1,2], [1-3], etc.
    return text.replace(/\[\d+(?:[,\-]\d+)*\]/g, '').replace(/\s{2,}/g, ' ').trim();
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { model, messages, chartContext } = body;

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

        // Prepare Geometry Context if available
        let geometryMessage = null;
        if (chartContext) {
            geometryMessage = {
                role: 'system',
                content: `[CURRENT GEOMETRY DATA]\n${JSON.stringify(chartContext, null, 2)}\n\n[INSTRUCTION]\nUse the above geometry to inform your reading. Do not recite the data raw; weave it into the poetic narrative.`
            };
        }

        // Assemble Message Chain: System Persona -> Geometry (if any) -> History
        const baseSystem = { role: 'system', content: ravenSystemPrompt };

        // Strip existing system prompt if present in messages (to avoid dupe)
        if (processedMessages.length > 0 && processedMessages[0].role === 'system') {
            processedMessages = processedMessages.slice(1);
        }

        if (processedMessages.length === 0) {
            // Default ping
            processedMessages = [{ role: 'user', content: 'Ping.' }];
        }

        // Final Assembly
        processedMessages = [
            baseSystem,
            ...(geometryMessage ? [geometryMessage] : []),
            ...processedMessages
        ];

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

        // Apply guards to the response
        if (data.choices && data.choices[0]?.message?.content) {
            let content = data.choices[0].message.content;
            content = stripCitations(content);  // Remove [1], [2] etc.
            content = applySomaticGuard(content);  // Replace somatic terms
            data.choices[0].message.content = content;
        }

        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Oracle Connection Failed', details: error.message },
            { status: 500 }
        );
    }
}
