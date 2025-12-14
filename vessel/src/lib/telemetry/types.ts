/**
 * Telemetry Types - Session data collection for research
 * 
 * Based on Logging Infrastructure specification:
 * - Captures provenance, geometry, and SST verdicts
 * - Anonymized for privacy
 */

export type SSTClassification = 'WB' | 'ABE' | 'OSR';
export type SSTSource = 'self' | 'observer';
export type OSRSubtype = 'O-DATA' | 'O-CONSENT' | 'O-INTEGRATION' | 'O-ANOMALY';

export interface TelemetryProvenance {
    math_brain: string;         // e.g. "v3.2.1"
    poetic_brain: string;       // e.g. "Raven_v4"
    orbs: string;               // e.g. "tight_surgical"
    house_sys: string;          // e.g. "placidus"
}

export interface TelemetryGeometry {
    magnitude: number;          // 0-5
    valence: number;            // -5 to +5 (directional bias)
    volatility?: number;        // Narrative coherence
    sfd_cont?: number;          // Support-Friction Differential (archived)
    active_vectors: string[];   // e.g. ["Pluto_sq_Sun", "Mars_conj_Uranus"]
}

export interface TelemetryOutcome {
    sst_classification: SSTClassification;
    sst_source: SSTSource;
    osr_subtype?: OSRSubtype;
    user_feedback?: string;
    lens_switch?: string;       // e.g. "Sidereal_Match_0.71"
}

export interface TelemetryPayload {
    session_id: string;         // Hashed for anonymity
    timestamp: string;          // ISO 8601
    provenance: TelemetryProvenance;
    input_geometry: TelemetryGeometry;
    outcome: TelemetryOutcome;
}

/**
 * Stored telemetry entry (with server-side additions)
 */
export interface TelemetryEntry extends TelemetryPayload {
    id: string;                 // Server-generated unique ID
    received_at: string;        // Server timestamp
}

/**
 * Telemetry collection statistics
 */
export interface TelemetryStats {
    total_sessions: number;
    wb_count: number;
    abe_count: number;
    osr_count: number;
    osr_by_subtype: Record<OSRSubtype, number>;
    avg_magnitude: number;
    avg_valence: number;
}
