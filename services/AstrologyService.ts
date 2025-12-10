import { ApiConfig, FetchedData } from '../types';

export interface AstrologyParams {
    latitude: number;
    longitude: number;
    datetime: string; // ISO 8601
}

export class AstrologyService {
    private static BASE_URL = 'https://best-astrology-api-natal-charts-transits-synastry.p.rapidapi.com';

    // NOTE: In a real app, keys should be in env vars. 
    // For the Shipyard prototype, we are pulling from the config state managed in App.tsx 
    // or defaults if necessary.

    static async calculateChart(params: AstrologyParams, config: ApiConfig): Promise<FetchedData> {
        const url = `${this.BASE_URL}/western_chart_data`;

        // Construct header object from array
        const headersInit: HeadersInit = {};
        config.headers.forEach(h => {
            if (h.key && h.value) headersInit[h.key] = h.value;
        });

        const body = JSON.stringify({
            latitude: params.latitude,
            longitude: params.longitude,
            datetime: params.datetime,
            // Default housekeeping opts
            house_system: "placidus",
            zodiac_type: "tropic"
        });

        const startTime = performance.now();
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headersInit,
                body: body
            });

            const data = await response.json();
            const endTime = performance.now();

            return {
                status: response.status,
                statusText: response.statusText,
                data: data,
                timestamp: Date.now(),
                duration: Math.round(endTime - startTime)
            };

        } catch (error: any) {
            return {
                status: 0,
                statusText: 'Client Error',
                data: { error: error.message },
                timestamp: Date.now(),
                duration: 0
            };
        }
    }
}
