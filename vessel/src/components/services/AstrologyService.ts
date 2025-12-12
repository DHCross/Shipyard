/**
 * AstrologyService - Stub file
 * Placeholder for Astrology API integration
 * TODO: Implement full service when Raven Panel is activated
 */

import { ApiConfig } from '@/types';

export interface ChartParams {
    latitude: number;
    longitude: number;
    datetime: string;
}

export interface ChartResult {
    status: number;
    data: any;
}

export const AstrologyService = {
    async calculateChart(params: ChartParams, apiConfig: ApiConfig): Promise<ChartResult> {
        // Placeholder - will call /api/astrology endpoint
        console.log('[AstrologyService] Stub called with:', params);
        return {
            status: 500,
            data: { error: 'AstrologyService not yet implemented' }
        };
    }
};
