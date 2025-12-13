const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Input/Output paths
const INPUT_PATH = '../../DH Cross Vault of People/Astro Vault of People.md';
const OUTPUT_PATH = '../../DH Cross Vault of People/normalized_vault.json';

// Helper: Parse "30n10" or "85w40" to decimal
function parseCoordinate(coordStr) {
    if (!coordStr) return 0;
    const match = coordStr.match(/(\d+)([nswe])(\d+)/i);
    if (!match) return 0;

    let [_, deg, dir, min] = match;
    let decimal = parseInt(deg) + (parseInt(min) / 60);
    dir = dir.toLowerCase();

    if (dir === 's' || dir === 'w') {
        decimal = -decimal;
    }
    return parseFloat(decimal.toFixed(4));
}

// Helper: Generate ID
function generateId(name) {
    return 'profile_' + crypto.createHash('md5').update(name).digest('hex').substr(0, 12);
}

// Main processing
try {
    const rawContent = fs.readFileSync(path.join(__dirname, INPUT_PATH), 'utf8');

    // Extract JSON-like objects using regex since the file might be malformed/truncated
    // This regex looks for { ... } blocks
    const matches = rawContent.match(/\{[^}]+\}/g);

    if (!matches) {
        console.error("No valid objects found.");
        process.exit(1);
    }

    const profiles = matches.map(jsonStr => {
        try {
            // Fix potential trailing commas or missing quotes if strictly needed, 
            // but the file looks like valid JSON objects inside the array.
            const raw = JSON.parse(jsonStr);

            // Parse Date
            const [year, month, day] = raw.birth_date ? raw.birth_date.split('-').map(Number) : [null, null, null];

            // Parse Time
            let hour = 0, minute = 0;
            if (raw.birth_time) {
                [hour, minute] = raw.birth_time.split(':').map(Number);
            }

            // Construct Profile
            return {
                id: generateId(raw.name),
                name: raw.name,
                birthData: {
                    year,
                    month,
                    day,
                    hour,
                    minute,
                    city: raw.city,
                    country_code: raw.country === 'USA' ? 'US' : raw.country.substring(0, 2).toUpperCase(),
                    latitude: parseCoordinate(raw.lat),
                    longitude: parseCoordinate(raw.lon)
                },
                lastUpdated: new Date().toISOString()
            };
        } catch (e) {
            console.warn("Skipping malformed entry:", jsonStr.substring(0, 50) + "...", e.message);
            return null;
        }
    }).filter(p => p !== null);

    // Save to valid JSON
    fs.writeFileSync(path.join(__dirname, OUTPUT_PATH), JSON.stringify(profiles, null, 2));
    console.log(`Successfully normalized ${profiles.length} profiles to ${OUTPUT_PATH}`);

} catch (err) {
    console.error("Error processing vault:", err);
}
