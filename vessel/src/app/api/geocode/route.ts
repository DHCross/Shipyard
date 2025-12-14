import { NextResponse } from 'next/server';

/**
 * Geocoding API with Perplexity Fallback
 * 
 * This endpoint tries the AstroAPI city glossary first,
 * then falls back to Perplexity for geocoding if no results found.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { query, usePerplexityFallback = true } = body;

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // Step 1: Try AstroAPI Glossary
        const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.Astrology_API_KEY;
        if (rapidApiKey) {
            try {
                const searchTerm = query.split(',')[0].trim();
                const astroResponse = await fetch(
                    `https://best-astrology-api.p.rapidapi.com/api/v3/glossary/cities?search=${encodeURIComponent(searchTerm)}&limit=5`,
                    {
                        method: 'GET',
                        headers: {
                            'X-RapidAPI-Key': rapidApiKey,
                            'X-RapidAPI-Host': 'best-astrology-api.p.rapidapi.com'
                        }
                    }
                );

                if (astroResponse.ok) {
                    const data = await astroResponse.json();
                    const candidates = Array.isArray(data) ? data : data?.data || data?.results || data?.cities || [];

                    if (candidates.length > 0) {
                        return NextResponse.json({
                            source: 'ATLAS',
                            results: candidates
                        });
                    }
                }
            } catch (e) {
                console.error('AstroAPI lookup failed:', e);
            }
        }

        // Step 2: Perplexity Fallback
        if (!usePerplexityFallback) {
            return NextResponse.json({ source: 'ATLAS', results: [] });
        }

        const perplexityKey = process.env.PERPLEXITY_API_KEY;
        if (!perplexityKey) {
            return NextResponse.json({
                error: 'No Perplexity key for fallback geocoding',
                source: 'ATLAS',
                results: []
            });
        }

        // Ask Perplexity for location data
        const prompt = `Find the geographic coordinates for: "${query}"

Return ONLY a JSON object in this exact format (no markdown, no explanation):
{
  "name": "City Name",
  "country_code": "US",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "timezone": "America/New_York"
}

If you cannot find the location, return: {"error": "not found"}`;

        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${perplexityKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'sonar',
                messages: [
                    { role: 'system', content: 'You are a geocoding assistant. Return only valid JSON, no markdown or explanation.' },
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!perplexityResponse.ok) {
            return NextResponse.json({
                source: 'SEARCH_FAILED',
                results: [],
                error: 'Perplexity geocoding failed'
            });
        }

        const perplexityData = await perplexityResponse.json();
        const content = perplexityData.choices?.[0]?.message?.content || '';

        // Parse JSON from response
        try {
            // Clean up potential markdown formatting
            const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(cleaned);

            if (parsed.error) {
                return NextResponse.json({ source: 'SEARCH', results: [] });
            }

            // Validate required fields
            if (typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
                return NextResponse.json({
                    source: 'SEARCH',
                    results: [{
                        name: parsed.name || query.split(',')[0].trim(),
                        country_code: parsed.country_code || 'XX',
                        latitude: parsed.latitude,
                        longitude: parsed.longitude,
                        timezone: parsed.timezone || null
                    }]
                });
            }
        } catch (parseError) {
            console.error('Failed to parse Perplexity geocoding response:', content);
        }

        return NextResponse.json({ source: 'SEARCH', results: [] });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Geocoding failed', details: error.message },
            { status: 500 }
        );
    }
}
