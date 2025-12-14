import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import type { TelemetryPayload, TelemetryEntry, TelemetryStats } from '@/lib/telemetry/types';

const TELEMETRY_KEY = 'telemetry_entries';
const TELEMETRY_STATS_KEY = 'telemetry_stats';

/**
 * Generate a unique ID for telemetry entries
 */
function generateEntryId(): string {
    return `tel_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Validate incoming telemetry payload
 */
function validatePayload(data: any): { valid: boolean; error?: string } {
    if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Invalid payload format' };
    }

    if (!data.session_id || typeof data.session_id !== 'string') {
        return { valid: false, error: 'Missing or invalid session_id' };
    }

    if (!data.outcome?.sst_classification) {
        return { valid: false, error: 'Missing SST classification' };
    }

    const validClassifications = ['WB', 'ABE', 'OSR'];
    if (!validClassifications.includes(data.outcome.sst_classification)) {
        return { valid: false, error: 'Invalid SST classification' };
    }

    return { valid: true };
}

/**
 * POST /api/telemetry - Submit session telemetry
 */
export async function POST(request: NextRequest) {
    try {
        const payload: TelemetryPayload = await request.json();

        // Validate
        const validation = validatePayload(payload);
        if (!validation.valid) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        // Create entry with server-side additions
        const entry: TelemetryEntry = {
            ...payload,
            id: generateEntryId(),
            received_at: new Date().toISOString()
        };

        // Try Vercel KV storage
        if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
            try {
                // Append to list
                await kv.lpush(TELEMETRY_KEY, JSON.stringify(entry));

                // Update rolling stats
                await updateStats(payload);

                return NextResponse.json({
                    success: true,
                    entry_id: entry.id,
                    storage: 'kv'
                });
            } catch (kvError) {
                console.error('[Telemetry] KV error:', kvError);
                // Fall through to local storage
            }
        }

        // Fallback: Log to console (for local dev)
        console.log('[Telemetry] Entry received (local mode):', JSON.stringify(entry, null, 2));

        return NextResponse.json({
            success: true,
            entry_id: entry.id,
            storage: 'local',
            note: 'Telemetry logged locally. Configure KV for persistence.'
        });

    } catch (error: any) {
        console.error('[Telemetry] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/telemetry - Retrieve telemetry data or stats
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'stats';
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    try {
        if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
            return NextResponse.json({
                success: false,
                error: 'Telemetry storage not configured',
                note: 'Set KV environment variables for data persistence'
            }, { status: 503 });
        }

        if (format === 'stats') {
            // Return aggregated stats
            const stats = await kv.get<TelemetryStats>(TELEMETRY_STATS_KEY);
            return NextResponse.json({
                success: true,
                stats: stats || getEmptyStats()
            });
        }

        if (format === 'export') {
            // Return raw entries as JSON
            const entries = await kv.lrange(TELEMETRY_KEY, 0, limit - 1);
            const parsed = entries.map(e => typeof e === 'string' ? JSON.parse(e) : e);

            return NextResponse.json({
                success: true,
                count: parsed.length,
                entries: parsed
            });
        }

        if (format === 'csv') {
            // Export as CSV
            const entries = await kv.lrange(TELEMETRY_KEY, 0, limit - 1);
            const parsed = entries.map(e => typeof e === 'string' ? JSON.parse(e) : e);

            const csv = entriesToCsv(parsed);
            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="telemetry_${Date.now()}.csv"`
                }
            });
        }

        return NextResponse.json({
            success: false,
            error: 'Invalid format. Use: stats, export, or csv'
        }, { status: 400 });

    } catch (error: any) {
        console.error('[Telemetry] GET error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal error' },
            { status: 500 }
        );
    }
}

/**
 * Update rolling statistics
 */
async function updateStats(payload: TelemetryPayload): Promise<void> {
    const current = await kv.get<TelemetryStats>(TELEMETRY_STATS_KEY) || getEmptyStats();

    current.total_sessions++;

    switch (payload.outcome.sst_classification) {
        case 'WB': current.wb_count++; break;
        case 'ABE': current.abe_count++; break;
        case 'OSR':
            current.osr_count++;
            if (payload.outcome.osr_subtype) {
                current.osr_by_subtype[payload.outcome.osr_subtype]++;
            }
            break;
    }

    // Rolling average for magnitude and valence
    const n = current.total_sessions;
    if (payload.input_geometry?.magnitude !== undefined) {
        current.avg_magnitude = ((current.avg_magnitude * (n - 1)) + payload.input_geometry.magnitude) / n;
    }
    if (payload.input_geometry?.valence !== undefined) {
        current.avg_valence = ((current.avg_valence * (n - 1)) + payload.input_geometry.valence) / n;
    }

    await kv.set(TELEMETRY_STATS_KEY, current);
}

function getEmptyStats(): TelemetryStats {
    return {
        total_sessions: 0,
        wb_count: 0,
        abe_count: 0,
        osr_count: 0,
        osr_by_subtype: {
            'O-DATA': 0,
            'O-CONSENT': 0,
            'O-INTEGRATION': 0,
            'O-ANOMALY': 0
        },
        avg_magnitude: 0,
        avg_valence: 0
    };
}

function entriesToCsv(entries: TelemetryEntry[]): string {
    const headers = [
        'id', 'session_id', 'timestamp', 'received_at',
        'math_brain', 'poetic_brain', 'orbs', 'house_sys',
        'magnitude', 'valence', 'volatility', 'active_vectors',
        'sst_classification', 'sst_source', 'osr_subtype', 'user_feedback'
    ];

    const rows = entries.map(e => [
        e.id,
        e.session_id,
        e.timestamp,
        e.received_at,
        e.provenance?.math_brain || '',
        e.provenance?.poetic_brain || '',
        e.provenance?.orbs || '',
        e.provenance?.house_sys || '',
        e.input_geometry?.magnitude ?? '',
        e.input_geometry?.valence ?? '',
        e.input_geometry?.volatility ?? '',
        (e.input_geometry?.active_vectors || []).join(';'),
        e.outcome?.sst_classification || '',
        e.outcome?.sst_source || '',
        e.outcome?.osr_subtype || '',
        (e.outcome?.user_feedback || '').replace(/"/g, '""')
    ].map(v => `"${v}"`).join(','));

    return [headers.join(','), ...rows].join('\n');
}
