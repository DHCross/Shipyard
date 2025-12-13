/**
 * BirthDataParser - Conservative parser for extracting birth data from natural language
 * 
 * DESIGN PRINCIPLES (per Raven GPT):
 * - Parse ONLY the latest message (no accumulation across turns)
 * - High confidence matches only (prefer false negatives over false positives)
 * - Extract what exists, mark what's missing
 * - No confidence = no detection
 */

export interface ParsedBirthData {
    date?: {
        month: number;  // 1-12
        day: number;    // 1-31
        year: number;   // 4-digit
    };
    time?: {
        hour: number;   // 0-23
        minute: number; // 0-59
    } | null;           // null = explicitly stated as unknown
    location?: {
        city: string;
        region?: string;
        country?: string;
    };
    confidence: 'high' | 'medium';
    raw: {
        dateMatch?: string;
        timeMatch?: string;
        locationMatch?: string;
    };
}

// Month name patterns
const MONTHS: Record<string, number> = {
    'january': 1, 'jan': 1,
    'february': 2, 'feb': 2,
    'march': 3, 'mar': 3,
    'april': 4, 'apr': 4,
    'may': 5,
    'june': 6, 'jun': 6,
    'july': 7, 'jul': 7,
    'august': 8, 'aug': 8,
    'september': 9, 'sep': 9, 'sept': 9,
    'october': 10, 'oct': 10,
    'november': 11, 'nov': 11,
    'december': 12, 'dec': 12,
};

// Time unknown indicators
const TIME_UNKNOWN_PATTERNS = [
    /don'?t know (my |the )?birth ?time/i,
    /unknown (birth )?time/i,
    /not sure (of |about )?(my |the )?(birth )?time/i,
    /time (is )?unknown/i,
    /no birth ?time/i,
];

/**
 * Parse date from natural language
 * Supports: "July 24, 1973", "7/24/1973", "24 July 1973", "1973-07-24"
 */
function parseDate(text: string): { month: number; day: number; year: number; raw: string } | null {
    // Pattern 1: Month Day, Year (July 24, 1973)
    const monthNamePattern = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})\b/i;
    const monthMatch = text.match(monthNamePattern);
    if (monthMatch) {
        const month = MONTHS[monthMatch[1].toLowerCase()];
        const day = parseInt(monthMatch[2], 10);
        const year = parseInt(monthMatch[3], 10);
        if (month && day >= 1 && day <= 31 && year >= 1900 && year <= new Date().getFullYear()) {
            return { month, day, year, raw: monthMatch[0] };
        }
    }

    // Pattern 2: Day Month Year (24 July 1973)
    const dayFirstPattern = /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec),?\s*(\d{4})\b/i;
    const dayFirstMatch = text.match(dayFirstPattern);
    if (dayFirstMatch) {
        const day = parseInt(dayFirstMatch[1], 10);
        const month = MONTHS[dayFirstMatch[2].toLowerCase()];
        const year = parseInt(dayFirstMatch[3], 10);
        if (month && day >= 1 && day <= 31 && year >= 1900 && year <= new Date().getFullYear()) {
            return { month, day, year, raw: dayFirstMatch[0] };
        }
    }

    // Pattern 3: MM/DD/YYYY or M/D/YYYY
    const usDatePattern = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/;
    const usMatch = text.match(usDatePattern);
    if (usMatch) {
        const month = parseInt(usMatch[1], 10);
        const day = parseInt(usMatch[2], 10);
        const year = parseInt(usMatch[3], 10);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= new Date().getFullYear()) {
            return { month, day, year, raw: usMatch[0] };
        }
    }

    // Pattern 4: YYYY-MM-DD (ISO)
    const isoPattern = /\b(\d{4})-(\d{2})-(\d{2})\b/;
    const isoMatch = text.match(isoPattern);
    if (isoMatch) {
        const year = parseInt(isoMatch[1], 10);
        const month = parseInt(isoMatch[2], 10);
        const day = parseInt(isoMatch[3], 10);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= new Date().getFullYear()) {
            return { month, day, year, raw: isoMatch[0] };
        }
    }

    return null;
}

/**
 * Parse time from natural language
 * Supports: "3:15 AM", "3:15am", "15:15", "3 in the morning"
 */
function parseTime(text: string): { hour: number; minute: number; raw: string } | null {
    // Pattern 1: HH:MM AM/PM
    const ampmPattern = /\b(\d{1,2}):(\d{2})\s*(am|pm|a\.m\.|p\.m\.)\b/i;
    const ampmMatch = text.match(ampmPattern);
    if (ampmMatch) {
        let hour = parseInt(ampmMatch[1], 10);
        const minute = parseInt(ampmMatch[2], 10);
        const isPM = ampmMatch[3].toLowerCase().startsWith('p');

        if (hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59) {
            if (isPM && hour !== 12) hour += 12;
            if (!isPM && hour === 12) hour = 0;
            return { hour, minute, raw: ampmMatch[0] };
        }
    }

    // Pattern 2: H AM/PM (no minutes)
    const hourOnlyPattern = /\b(\d{1,2})\s*(am|pm|a\.m\.|p\.m\.)\b/i;
    const hourOnlyMatch = text.match(hourOnlyPattern);
    if (hourOnlyMatch) {
        let hour = parseInt(hourOnlyMatch[1], 10);
        const isPM = hourOnlyMatch[2].toLowerCase().startsWith('p');

        if (hour >= 1 && hour <= 12) {
            if (isPM && hour !== 12) hour += 12;
            if (!isPM && hour === 12) hour = 0;
            return { hour, minute: 0, raw: hourOnlyMatch[0] };
        }
    }

    // Pattern 3: 24-hour format (15:30)
    const militaryPattern = /\b(\d{1,2}):(\d{2})\b/;
    const militaryMatch = text.match(militaryPattern);
    if (militaryMatch) {
        const hour = parseInt(militaryMatch[1], 10);
        const minute = parseInt(militaryMatch[2], 10);
        if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
            return { hour, minute, raw: militaryMatch[0] };
        }
    }

    return null;
}

/**
 * Parse location from natural language
 * Supports: "in Austin, Texas", "Austin TX", "born in London"
 */
function parseLocation(text: string): { city: string; region?: string; country?: string; raw: string } | null {
    // Pattern 1: "in City, State" or "born in City, State"
    const cityStatePattern = /(?:born |in |from )?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?|[A-Z]{2})\b/;
    const cityStateMatch = text.match(cityStatePattern);
    if (cityStateMatch) {
        return {
            city: cityStateMatch[1],
            region: cityStateMatch[2],
            raw: cityStateMatch[0]
        };
    }

    // Pattern 2: Just city name after "in" or "born in"
    const justCityPattern = /(?:born |in |from )([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/;
    const justCityMatch = text.match(justCityPattern);
    if (justCityMatch) {
        return {
            city: justCityMatch[1],
            raw: justCityMatch[0]
        };
    }

    return null;
}

/**
 * Check if user explicitly states time is unknown
 */
function checkTimeUnknown(text: string): boolean {
    return TIME_UNKNOWN_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Main parser function - extracts birth data from a single message
 * 
 * @param message - The user's message to parse
 * @returns ParsedBirthData if birth data detected, null otherwise
 */
export function parseBirthData(message: string): ParsedBirthData | null {
    const dateResult = parseDate(message);
    const timeResult = parseTime(message);
    const locationResult = parseLocation(message);
    const timeUnknown = checkTimeUnknown(message);

    // Need at least a date to consider this birth data
    // (Someone mentioning just a city isn't necessarily birth data)
    if (!dateResult) {
        return null;
    }

    // Determine confidence
    // High: date + (time OR time-unknown) + location
    // Medium: date + one of the above
    const hasTime = timeResult !== null || timeUnknown;
    const hasLocation = locationResult !== null;

    let confidence: 'high' | 'medium';
    if (hasTime && hasLocation) {
        confidence = 'high';
    } else if (hasTime || hasLocation) {
        confidence = 'medium';
    } else {
        // Just a date alone - too low confidence, might not be birth data
        return null;
    }

    return {
        date: {
            month: dateResult.month,
            day: dateResult.day,
            year: dateResult.year,
        },
        time: timeUnknown ? null : (timeResult ? {
            hour: timeResult.hour,
            minute: timeResult.minute,
        } : undefined),
        location: locationResult ? {
            city: locationResult.city,
            region: locationResult.region,
            country: locationResult.country,
        } : undefined,
        confidence,
        raw: {
            dateMatch: dateResult.raw,
            timeMatch: timeResult?.raw,
            locationMatch: locationResult?.raw,
        },
    };
}

/**
 * Format parsed data for display in confirmation message
 */
export function formatParsedData(data: ParsedBirthData): string {
    const parts: string[] = [];

    if (data.date) {
        const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        parts.push(`${monthNames[data.date.month]} ${data.date.day}, ${data.date.year}`);
    }

    if (data.time === null) {
        parts.push('(time unknown)');
    } else if (data.time) {
        const hour12 = data.time.hour % 12 || 12;
        const ampm = data.time.hour >= 12 ? 'PM' : 'AM';
        const min = data.time.minute.toString().padStart(2, '0');
        parts.push(`at ${hour12}:${min} ${ampm}`);
    }

    if (data.location) {
        const loc = data.location;
        parts.push(`in ${loc.city}${loc.region ? `, ${loc.region}` : ''}`);
    }

    return parts.join(' ');
}
