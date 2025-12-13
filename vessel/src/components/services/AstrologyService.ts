
import { ApiConfig } from '@/types';

export interface ChartParams {
    latitude: number;
    longitude: number;
    datetime: string; // ISO string
}

export interface ChartResult {
    status: number;
    data: any;
}

export const AstrologyService = {
    async calculateChart(params: ChartParams, apiConfig?: ApiConfig): Promise<ChartResult> {
        console.log('[AstrologyService] Calculating chart for:', params);

        // Parse date for V3 API structure
        const dateObj = new Date(params.datetime);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        const hour = dateObj.getHours();
        const minute = dateObj.getMinutes();

        // Define a small date range for "current" transits (1-day window)
        const startDate = { year, month, day };
        // Create end date (next day) to satisfy range requirement, though we focus on start
        const nextDay = new Date(dateObj);
        nextDay.setDate(nextDay.getDate() + 1);
        const endDate = {
            year: nextDay.getFullYear(),
            month: nextDay.getMonth() + 1,
            day: nextDay.getDate()
        };

        // Payload for Natal Transits (V3)
        // Uses coordinates instead of city/country
        const payload = {
            subject: {
                name: "Raven User",
                birth_data: {
                    year,
                    month,
                    day,
                    hour,
                    minute,
                    second: 0,
                    latitude: params.latitude,
                    longitude: params.longitude
                }
            },
            date_range: {
                start_date: startDate,
                end_date: endDate
            },
            orb: 3.0 // Standard orb for detecting active influences
        };

        try {
            // Call our local proxy route
            const response = await fetch('/api/astrology', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    endpoint: '/api/v3/charts/natal-transits',
                    method: 'POST',
                    payload: payload
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('[AstrologyService] API Error:', data);
            }

            return {
                status: response.status,
                data: data
            };
        } catch (error: any) {
            console.error('[AstrologyService] Connection Error:', error);
            return {
                status: 500,
                data: { error: error.message || 'Unknown network error' }
            };
        }
    }
};
