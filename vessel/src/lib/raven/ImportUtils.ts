/**
 * ImportUtils - Validation and normalization for importing chart data and sessions
 * 
 * Supports:
 * 1. Current V3 API Export (subject, geometry)
 * 2. Legacy 'Mirror Symbolic Weather' format (person_a, person_b, chart)
 * 3. Profile Vault Exports
 */

export type ImportType = 'profile' | 'profile_array' | 'session_export' | 'legacy_report' | 'unknown';

export interface ImportResult {
    valid: boolean;
    type: ImportType;
    data?: any;
    error?: string;
    normalizedData?: any; // Standardized structure (V3-like)
}

/**
 * Validate and identify the type of imported JSON
 */
export function validateImport(data: any): ImportResult {
    if (!data || typeof data !== 'object') {
        return { valid: false, type: 'unknown', error: "Invalid JSON format" };
    }

    // 0. Profile Array (Vault Bulk Import) - e.g., [{ id, name, birthData }, ...]
    if (Array.isArray(data) && data.length > 0 && data[0].birthData && data[0].name) {
        return {
            valid: true,
            type: 'profile_array' as ImportType,
            data,
            normalizedData: data // Array of profiles
        };
    }

    // 1. Profile Vault Export (Single Profile)
    if (data.birthData && data.name && data.id) {
        return {
            valid: true,
            type: 'profile',
            data,
            normalizedData: {
                subject: {
                    name: data.name,
                    birth_data: data.birthData
                },
                // Profiles might not have cached geometry, but that's okay for vault import
                geometry: data.cachedGeometry
            }
        };
    }

    // 2. Current V3 Session Export (subject or person_a with geometry at root or nested)
    // Structure: { subject: { name... }, geometry: { ... } } OR { person_a: { ... } }

    // Check for V3 Subject + Geometry pattern
    if (data.subject && (data.geometry || data.chart)) {
        return {
            valid: true,
            type: 'session_export',
            data,
            normalizedData: data // Already standard
        };
    }

    // 3. Legacy / Alternative Format (person_a root)
    if (data.person_a && data.person_a.chart) {
        return {
            valid: true,
            type: 'legacy_report',
            data,
            normalizedData: {
                // Map legacy structure to V3-like structure for Raven
                subject: {
                    name: data.person_a.name,
                    birth_data: data.person_a.birth_data,
                },
                geometry: data.person_a.chart, // Map chart to geometry
                // Preserve Person B if present
                partner: data.person_b ? {
                    name: data.person_b.name,
                    birth_data: data.person_b.birth_data,
                    geometry: data.person_b.chart
                } : undefined,
                // Preserve original report type metadata
                report_kind: data.report_kind
            }
        };
    }

    return {
        valid: false,
        type: 'unknown',
        error: "Unrecognized file structure. Must be a Profile, Session Export, or Valid Chart."
    };
}
