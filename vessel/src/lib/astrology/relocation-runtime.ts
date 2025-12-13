
// Tier 3: Relocation Runtime Support
// Handles logic for Relocation Modes, Disclosures, and Context normalization.
// Ported from WovenWebApp/lib/relocation-runtime.js to TypeScript

export type RelocationMode =
    | 'birthplace'
    | 'A_local'
    | 'B_local'
    | 'both_local'
    | 'event'
    | 'midpoint_advanced_hidden';

export interface RelocationContext {
    active: boolean;
    mode: RelocationMode;
    label?: string;
    disclosure?: string;
}

export function normalizeRelocationMode(raw: any, fallback: RelocationMode = 'birthplace'): RelocationMode {
    if (!raw && raw !== 0) return fallback;
    const token = String(raw)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_');

    switch (token) {
        case 'a_local':
        case 'a_local_lens':
        case 'person_a_local':
        case 'alocal':
        case 'a_local_mode':
            return 'A_local';
        case 'b_local':
        case 'person_b_local':
        case 'blocal':
        case 'b_local_mode':
            return 'B_local';
        case 'both_local':
        case 'both':
        case 'shared':
        case 'shared_local':
        case 'dual_local':
        case 'same_city':
            return 'both_local';
        case 'event':
        case 'custom':
        case 'event_city':
        case 'custom_event':
            return 'event';
        case 'midpoint':
        case 'midpoint_advanced':
        case 'midpoint_advanced_hidden':
        case 'composite_midpoint':
            return 'midpoint_advanced_hidden';
        case 'birthplace':
        case 'none':
        case 'natal':
        case 'a_natal':
        case 'b_natal':
        case 'off':
            return 'birthplace';
        default:
            if (token.includes('midpoint')) return 'midpoint_advanced_hidden';
            if (token.includes('both') || token.includes('shared')) return 'both_local';
            if (token.includes('b_local')) return 'B_local';
            if (token.includes('a_local')) return 'A_local';
            if (token.includes('event')) return 'event';
            return fallback;
    }
}

export function relocationActive(mode: RelocationMode): boolean {
    return mode !== 'birthplace';
}

export function relocationDisclosure(mode: RelocationMode, label?: string | null): string {
    const place = label?.trim();
    const safe = place && place.length > 0 ? place : undefined;
    switch (mode) {
        case 'birthplace':
            return 'Relocation: None (birthplace houses/angles).';
        case 'A_local':
            return `Relocation on: ${safe ?? "Person A’s city"}. Houses/angles move; planets stay fixed.`;
        case 'B_local':
            return `Relocation on: ${safe ?? "Person B’s city"}. Houses/angles move; planets stay fixed.`;
        case 'both_local':
            return `Relocation on: ${safe ?? "Shared city for A & B"}. Houses/angles move; planets stay fixed.`;
        case 'event':
            return `Relocation on: ${safe ?? 'Event city'}. Houses/angles move; planets stay fixed.`;
        case 'midpoint_advanced_hidden':
            return 'Relocation: Midpoint (symbolic; lower confidence).';
        default:
            return `Relocation on: ${safe ?? 'Selected city'}. Houses/angles move; planets stay fixed.`;
    }
}

/**
 * Format string describing house cusp shift
 */
export function formatHouseContrast(symbol: string, natalHouse: number, relocatedHouse: number): string {
    if (natalHouse === relocatedHouse) return `${symbol}: Same arena (House ${natalHouse}) under relocation.`;
    return `${symbol}: Natal House ${natalHouse} → Relocated House ${relocatedHouse} (channel shift)`;
}
