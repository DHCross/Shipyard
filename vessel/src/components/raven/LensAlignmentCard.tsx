import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Calendar, Clock, User, Heart, Zap, Save, Globe } from 'lucide-react';
import { saveProfileToVault, generateProfileId, type Profile } from './ProfileVault';
// Import our new Relocation Engine
import { recalculateChart } from '../../lib/astrology/relocation-math';
import { normalizeRelocationMode, relocationDisclosure, type RelocationMode } from '../../lib/astrology/relocation-runtime';

interface City {
    name: string;
    country_code: string;
    latitude: number;
    longitude: number;
    timezone?: string;
}

function normalizeCity(raw: any): City | null {
    if (!raw || typeof raw !== 'object') return null;
    const name = raw.name ?? raw.city ?? raw.city_name;
    const country_code = raw.country_code ?? raw.country ?? raw.nation;
    const latitude = raw.latitude ?? raw.lat;
    const longitude = raw.longitude ?? raw.lng ?? raw.lon;
    const timezone = raw.timezone ?? raw.tz_str ?? raw.tz;

    if (typeof name !== 'string' || typeof country_code !== 'string') return null;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;

    return { name, country_code, latitude, longitude, timezone };
}

interface LensAlignmentCardProps {
    onAlign: (chartData: any) => void;
    onCancel: () => void;
}

export function LensAlignmentCard({ onAlign, onCancel }: LensAlignmentCardProps) {
    // Subject State
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [timeUnknown, setTimeUnknown] = useState(false);
    const [cityQuery, setCityQuery] = useState('');
    const [cityResults, setCityResults] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);

    // Partner State (Second Person)
    const [isRelational, setIsRelational] = useState(false);
    const [partnerName, setPartnerName] = useState('');
    const [partnerDate, setPartnerDate] = useState('');
    const [partnerTime, setPartnerTime] = useState('');
    const [partnerTimeUnknown, setPartnerTimeUnknown] = useState(false);
    const [partnerCityQuery, setPartnerCityQuery] = useState('');
    const [partnerCityResults, setPartnerCityResults] = useState<City[]>([]);
    const [partnerSelectedCity, setPartnerSelectedCity] = useState<City | null>(null);

    // Reading Type & Role Configuration (when 2 people present)
    type ReadingType = 'two_solo' | 'synastry' | 'composite';
    type RelationshipRole = 'partner' | 'parent_child' | 'child_parent' | 'siblings' | 'friends' | 'colleagues' | 'other';
    const [readingType, setReadingType] = useState<ReadingType>('synastry');
    const [relationshipRole, setRelationshipRole] = useState<RelationshipRole>('partner');

    const roleLabels: Record<RelationshipRole, { a: string; b: string }> = {
        'partner': { a: 'Person A', b: 'Person B' },
        'parent_child': { a: 'Parent', b: 'Child' },
        'child_parent': { a: 'Child', b: 'Parent' },
        'siblings': { a: 'Sibling A', b: 'Sibling B' },
        'friends': { a: 'Friend A', b: 'Friend B' },
        'colleagues': { a: 'Colleague A', b: 'Colleague B' },
        'other': { a: 'Person A', b: 'Person B' }
    };

    // Relocation State
    const [showRelocation, setShowRelocation] = useState(false);
    const [relocationMode, setRelocationMode] = useState<RelocationMode>('birthplace');
    const [relocationCityQuery, setRelocationCityQuery] = useState('');
    const [relocationCityResults, setRelocationCityResults] = useState<City[]>([]);
    const [selectedRelocationCity, setSelectedRelocationCity] = useState<City | null>(null);

    // Common State
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState<'subject' | 'partner' | 'relocation' | null>(null); // Track which dropdown needed
    const [debugMsg, setDebugMsg] = useState<string | null>(null);
    const [isAligning, setIsAligning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSavePrompt, setShowSavePrompt] = useState(false);
    const [lastAlignedData, setLastAlignedData] = useState<any>(null); // Array if relational?

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Generalized City Search Helper - Now uses /api/geocode with Perplexity fallback
    const performCitySearch = async (query: string, target: 'subject' | 'partner' | 'relocation') => {
        setIsSearching(true);
        try {
            // Use new geocoding endpoint with built-in Perplexity fallback
            const response = await fetch('/api/geocode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, usePerplexityFallback: true })
            });
            const data = await response.json();

            const source = data.source || 'UNKNOWN'; // ATLAS or SEARCH
            const candidates = data.results || [];
            const normalized = candidates.map(normalizeCity).filter((c: City | null): c is City => !!c);

            if (target === 'subject') setCityResults(normalized);
            else if (target === 'partner') setPartnerCityResults(normalized);
            else setRelocationCityResults(normalized);

            if (normalized.length > 0) {
                setShowResults(target);
                const sourceLabel = source === 'SEARCH' ? '🔍 via Perplexity' : '📍 via Atlas';
                setDebugMsg(`Found ${normalized.length} ${sourceLabel}`);
            } else {
                if (target === 'subject') setCityResults([]);
                else if (target === 'partner') setPartnerCityResults([]);
                else setRelocationCityResults([]);
                setDebugMsg(`No results for "${query}" - try full city name`);
            }
        } catch (err: any) {
            setDebugMsg(`Search failed: ${err.message}`);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced Search Effect
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        let query = cityQuery;
        let target: 'subject' | 'partner' | 'relocation' = 'subject';

        if (document.activeElement?.id === 'partner-city') {
            query = partnerCityQuery; target = 'partner';
        } else if (document.activeElement?.id === 'relocation-city') {
            query = relocationCityQuery; target = 'relocation';
        } else {
            // Default subject
            query = cityQuery; target = 'subject';
        }

        // Skip search if query matches selection
        if (target === 'subject' && (!query || selectedCity?.name === query)) { setCityResults([]); return; }
        if (target === 'partner' && (!query || partnerSelectedCity?.name === query)) { setPartnerCityResults([]); return; }
        if (target === 'relocation' && (!query || selectedRelocationCity?.name === query)) { setRelocationCityResults([]); return; }

        if (!query) return;

        searchTimeoutRef.current = setTimeout(() => performCitySearch(query, target), 500);
        return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
    }, [cityQuery, partnerCityQuery, relocationCityQuery]); // Simple dependency trigger

    const handleSelectCity = (city: City, target: 'subject' | 'partner' | 'relocation') => {
        if (target === 'subject') {
            setSelectedCity(city);
            setCityQuery(`${city.name}, ${city.country_code}`);
        } else if (target === 'partner') {
            setPartnerSelectedCity(city);
            setPartnerCityQuery(`${city.name}, ${city.country_code}`);
        } else {
            setSelectedRelocationCity(city);
            setRelocationCityQuery(`${city.name}, ${city.country_code}`);
        }
        setShowResults(null);
    };

    const alignProfile = async (
        pName: string, pDate: string, pTime: string, pCity: City, pTimeUnknown: boolean
    ) => {
        const [year, month, day] = pDate.split('-').map(Number);
        const [hour, minute] = pTimeUnknown ? [12, 0] : pTime.split(':').map(Number);

        const birth_data: any = { year, month, day, hour, minute, second: 0 };
        if (typeof pCity.latitude === 'number' && typeof pCity.longitude === 'number') {
            birth_data.latitude = pCity.latitude;
            birth_data.longitude = pCity.longitude;
            // V3 auto-detects timezone if omitted but lat/long present
        } else {
            birth_data.city = pCity.name;
            birth_data.country_code = pCity.country_code;
        }

        const response = await fetch('/api/astrology', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint: '/api/v3/analysis/natal-report',
                method: 'POST',
                payload: {
                    subject: { name: pName, birth_data },
                    report_options: { tradition: 'psychological', language: 'en' }
                }
            })
        });

        const data = await response.json();
        if (!response.ok || (data && data.success === false)) {
            throw new Error(data?.error || "Alignment Failed");
        }
        return data;
    };

    // Helper: Apply Relocation if Needed
    const applyRelocation = (natalData: any, pDate: string, targetCity: City | null) => {
        if (!targetCity) return natalData;

        try {
            const [year, month, day] = pDate.split('-').map(Number);
            const dateObj = new Date(Date.UTC(year, month - 1, day, 12, 0, 0)); // Use noon UTC approx for date or exact time from data?
            // Use input time if known, else noon?
            // Ideally we pass the exact timestamp used in natal calculation.
            // But here we reconstruct date.

            // RECALCULATE
            const relocated = recalculateChart(
                dateObj,
                targetCity.latitude,
                targetCity.longitude,
                'placidus' // User preference? Default to Placidus (engine handles polar fallback)
            );

            // MERGE into natalData
            // Update houses
            if (natalData.data && natalData.data.houses) {
                // Map engine output (array) to API structure if needed
                // API structure: usually array of objects or simple list.
                // Let's assume API returns array of house objects.
                // We OVERWRITE the house cusps.
                // And ANGLES.

                // Note: V3 might return specific structure. We need to respect valid JSON.
                // If we just attach `relocated_geometry` property, the backend/Raven needs to see it.
                // Or we overwrite `houses` and `angles`.

                const newAngles = {
                    Ascendant: { ...natalData.data.angles?.Ascendant, degree: relocated.angles.Ascendant },
                    Midheaven: { ...natalData.data.angles?.Midheaven, degree: relocated.angles.Midheaven }
                };

                // Construct new house array compatible with V3?
                // V3 houses often: [{ house: 1, sign: "Aries", degree: 12.5 }, ...]
                // We only have degrees.
                // For now, let's inject a "relocation" block into the data root,
                // which Raven (via ProfileVault/Oracle) logic will explain.

                // BUT wait, Raven reads the 'chartContext'.
                // Creating a clear mutation is better.

                return {
                    ...natalData,
                    relocation_applied: true,
                    relocation_city: targetCity.name,
                    relocation_disclosure: relocationDisclosure('event', targetCity.name), // or specific mode
                    relocated_houses: relocated.houses,
                    relocated_angles: relocated.angles
                };
            }
            return natalData;
        } catch (e) {
            console.error("Relocation Math Failed", e);
            return natalData; // Fallback to natal
        }
    };

    const handleAlign = async () => {
        if (!name || !date || (!time && !timeUnknown) || !selectedCity) {
            setError("Subject fields are required."); return;
        }
        if (isRelational && (!partnerName || !partnerDate || (!partnerTime && !partnerTimeUnknown) || !partnerSelectedCity)) {
            setError("Partner fields are required for synastry."); return;
        }

        // Relocation Validation
        if (showRelocation && !selectedRelocationCity) {
            setError("Please select a Relocation City."); return;
        }

        setError(null);
        setIsAligning(true);

        try {
            // NOTE: In this UI, I'm simplifying "Relocation Mode" to:
            // "Apply Relocation?" -> Select City.
            // If selected, we assume "Current/Shared Location" (both_local logic).
            const targetCity = showRelocation ? selectedRelocationCity : null;

            if (isRelational) {
                // Parallel Fetch
                const [dataA, dataB] = await Promise.all([
                    alignProfile(name, date, time, selectedCity, timeUnknown),
                    alignProfile(partnerName, partnerDate, partnerTime, partnerSelectedCity!, partnerTimeUnknown)
                ]);

                // Apply Relocation Loop
                const finalA = targetCity ? applyRelocation(dataA, date, targetCity) : dataA;
                const finalB = targetCity ? applyRelocation(dataB, partnerDate, targetCity) : dataB;

                // Build payload with reading context
                const payload = {
                    readingType,
                    relationshipRole,
                    roleLabels: roleLabels[relationshipRole],
                    subject: { ...finalA, label: roleLabels[relationshipRole].a },
                    partner: { ...finalB, label: roleLabels[relationshipRole].b }
                };

                if (readingType === 'two_solo') {
                    // Two Solo: Return array of two separate readings
                    onAlign({ ...payload, mode: 'two_solo', charts: [finalA, finalB] });
                } else {
                    // Synastry or Composite: Relational reading
                    onAlign(payload);
                }

                // Can't easily save 2 profiles via prompt yet, skipping save prompt for synastry for now
                setLastAlignedData(null);
            } else {
                const data = await alignProfile(name, date, time, selectedCity, timeUnknown);
                const final = targetCity ? applyRelocation(data, date, targetCity) : data;

                setLastAlignedData({ name, birthData: { ...selectedCity, year: parseInt(date.split('-')[0]) /* simplified for save mock */ } }); // Todo: refined save
                setShowSavePrompt(true);
                onAlign(final);
            }
        } catch (err: any) {
            console.error("Alignment failed", err);
            setError(`Alignment Error: ${err.message}`);
        } finally {
            setIsAligning(false);
        }
    };

    // Reusable Input Group
    const renderInputGroup = (type: 'subject' | 'partner') => {
        const isP = type === 'partner';
        return (
            <div className={`space-y-4 ${isP ? 'pt-4 border-t border-emerald-500/20' : ''}`}>
                {isP && <div className="text-xs font-mono uppercase text-emerald-400/50">Partner Data</div>}

                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-emerald-400/70 font-mono ml-1">{isP ? 'Partner Name' : 'Subject Name'}</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-emerald-500/50" />
                        <input
                            type="text"
                            value={isP ? partnerName : name}
                            onChange={(e) => isP ? setPartnerName(e.target.value) : setName(e.target.value)}
                            placeholder="Enter Name"
                            className="w-full bg-black/40 border border-emerald-500/20 rounded px-9 py-2 text-sm text-emerald-100 placeholder:text-emerald-700/50 focus:outline-none focus:border-emerald-500/60 transition-colors font-serif"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-emerald-400/70 font-mono ml-1">Birth Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-emerald-500/50" />
                            <input
                                type="date"
                                value={isP ? partnerDate : date}
                                onChange={(e) => isP ? setPartnerDate(e.target.value) : setDate(e.target.value)}
                                className="w-full bg-black/40 border border-emerald-500/20 rounded px-9 py-2 text-sm text-emerald-100 focus:outline-none focus:border-emerald-500/60 transition-colors font-mono"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] uppercase tracking-wider text-emerald-400/70 font-mono ml-1">Birth Time</label>
                            <button
                                type="button"
                                onClick={() => isP ? setPartnerTimeUnknown(!partnerTimeUnknown) : setTimeUnknown(!timeUnknown)}
                                className={`text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border transition-colors ${(isP ? partnerTimeUnknown : timeUnknown) ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'text-emerald-500/40 border-transparent hover:text-emerald-400'}`}
                            >
                                {(isP ? partnerTimeUnknown : timeUnknown) ? 'Noon' : 'Unknown?'}
                            </button>
                        </div>
                        <div className="relative">
                            <Clock className={`absolute left-3 top-2.5 w-4 h-4 text-emerald-500/50`} />
                            <input
                                type="time"
                                value={isP ? partnerTime : time}
                                onChange={(e) => isP ? setPartnerTime(e.target.value) : setTime(e.target.value)}
                                disabled={(isP ? partnerTimeUnknown : timeUnknown)}
                                className={`w-full bg-black/40 border rounded px-9 py-2 text-sm focus:outline-none transition-colors font-mono ${(isP ? partnerTimeUnknown : timeUnknown) ? 'border-emerald-500/10 text-emerald-500/30 cursor-not-allowed' : 'border-emerald-500/20 text-emerald-100 focus:border-emerald-500/60'}`}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-1 relative">
                    <label className="text-[10px] uppercase tracking-wider text-emerald-400/70 font-mono ml-1">Birth Place</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-emerald-500/50" />
                        <input
                            id={isP ? 'partner-city' : 'subject-city'}
                            type="text"
                            value={isP ? partnerCityQuery : cityQuery}
                            onChange={(e) => {
                                isP ? setPartnerCityQuery(e.target.value) : setCityQuery(e.target.value);
                                if ((isP ? partnerSelectedCity : selectedCity) && e.target.value !== (isP ? partnerSelectedCity?.name : selectedCity?.name)) {
                                    isP ? setPartnerSelectedCity(null) : setSelectedCity(null);
                                }
                            }}
                            onFocus={() => { if ((isP ? partnerCityResults : cityResults).length > 0) setShowResults(type); }}
                            placeholder="Search City, Country..."
                            className="w-full bg-black/40 border border-emerald-500/20 rounded px-9 py-2 text-sm text-emerald-100 placeholder:text-emerald-700/50 focus:outline-none focus:border-emerald-500/60 transition-colors font-serif"
                        />
                        {isSearching && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 text-emerald-500 animate-spin" />}
                    </div>
                    {/* Results Dropdown */}
                    {showResults === type && (isP ? partnerCityResults : cityResults).length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-emerald-950/95 border border-emerald-500/30 rounded shadow-xl max-h-48 overflow-y-auto backdrop-blur-md">
                            {(isP ? partnerCityResults : cityResults).map((city, idx) => (
                                <div key={idx} onClick={() => handleSelectCity(city, type)} className="px-4 py-2 hover:bg-emerald-500/20 cursor-pointer text-sm text-emerald-100/90 border-b border-emerald-500/10 last:border-0">
                                    <span className="font-semibold">{city.name}</span>
                                    <span className="text-emerald-500/60 ml-2 text-xs">{city.country_code}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-md mx-auto bg-emerald-950/40 border border-emerald-500/30 rounded-lg backdrop-blur-md overflow-visible shadow-2xl animate-fade-in-up scroll-mt-4">
            <div className="bg-emerald-900/40 p-3 border-b border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono tracking-widest text-emerald-100 uppercase">Lens Alignment</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowRelocation(!showRelocation)}
                        className={`text-[10px] uppercase tracking-wider font-mono px-2 py-1 rounded border transition-colors flex items-center gap-1 ${showRelocation ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'text-emerald-500/60 border-emerald-500/20 hover:text-emerald-400'}`}
                    >
                        <Globe className="w-3 h-3" /> {showRelocation ? 'Relocation ON' : 'Relocation'}
                    </button>
                    <button
                        onClick={() => setIsRelational(!isRelational)}
                        className={`text-[10px] uppercase tracking-wider font-mono px-2 py-1 rounded border transition-colors flex items-center gap-1 ${isRelational ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'text-emerald-500/60 border-emerald-500/20 hover:text-emerald-400'}`}
                    >
                        {isRelational ? 'Two People' : '+ Add Person'}
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-4">
                {/* Person A Input - with dynamic role label */}
                <div className="text-xs font-mono uppercase text-emerald-500/50 mb-1">
                    {isRelational ? roleLabels[relationshipRole].a : 'Your Birth Data'}
                </div>
                {renderInputGroup('subject')}

                {isRelational && (
                    <div className="animate-fade-in-up space-y-4">
                        {/* Person B Input - with dynamic role label */}
                        <div className="text-xs font-mono uppercase text-indigo-400/50 mt-4 mb-1">
                            {roleLabels[relationshipRole].b}
                        </div>
                        {renderInputGroup('partner')}

                        {/* Reading Type & Relationship Role Selection */}
                        <div className="pt-4 border-t border-indigo-500/20 space-y-3">
                            <div className="text-xs font-mono uppercase text-indigo-400/50 mb-2">Reading Type</div>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setReadingType('two_solo')}
                                    className={`text-[10px] uppercase tracking-wider font-mono px-3 py-1.5 rounded border transition-colors ${readingType === 'two_solo' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'text-slate-400 border-slate-600/40 hover:text-emerald-400'}`}
                                >
                                    2 Solo Reports
                                </button>
                                <button
                                    onClick={() => setReadingType('synastry')}
                                    className={`text-[10px] uppercase tracking-wider font-mono px-3 py-1.5 rounded border transition-colors ${readingType === 'synastry' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'text-slate-400 border-slate-600/40 hover:text-indigo-400'}`}
                                >
                                    Synastry
                                </button>
                                <button
                                    onClick={() => setReadingType('composite')}
                                    className={`text-[10px] uppercase tracking-wider font-mono px-3 py-1.5 rounded border transition-colors ${readingType === 'composite' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'text-slate-400 border-slate-600/40 hover:text-rose-400'}`}
                                >
                                    Composite
                                </button>
                            </div>

                            {/* Relationship Role (only for synastry/composite) */}
                            {(readingType === 'synastry' || readingType === 'composite') && (
                                <div className="animate-fade-in-up">
                                    <div className="text-xs font-mono uppercase text-indigo-400/50 mb-2 mt-3">Relationship</div>
                                    <select
                                        value={relationshipRole}
                                        onChange={(e) => setRelationshipRole(e.target.value as RelationshipRole)}
                                        className="w-full bg-slate-900/60 border border-indigo-500/30 rounded px-3 py-2 text-emerald-100 text-sm font-mono focus:border-indigo-400 focus:outline-none"
                                    >
                                        <option value="partner">Partners / Romantic</option>
                                        <option value="parent_child">Parent → Child</option>
                                        <option value="child_parent">Child → Parent</option>
                                        <option value="siblings">Siblings</option>
                                        <option value="friends">Friends</option>
                                        <option value="colleagues">Colleagues</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Relocation Section */}
                {showRelocation && (
                    <div className="pt-4 border-t border-amber-500/20 animate-fade-in-up">
                        <div className="text-xs font-mono uppercase text-amber-400/50 mb-2 flex items-center gap-2">
                            <Globe className="w-3 h-3" /> Relocation Target (Same Sky, Different Room)
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-amber-500/50" />
                            <input
                                id="relocation-city"
                                type="text"
                                value={relocationCityQuery}
                                onChange={(e) => {
                                    setRelocationCityQuery(e.target.value);
                                    if (selectedRelocationCity && e.target.value !== selectedRelocationCity.name) {
                                        setSelectedRelocationCity(null);
                                    }
                                }}
                                onFocus={() => { if (relocationCityResults.length > 0) setShowResults('relocation'); }}
                                placeholder="Enter Relocation City (Current Location)..."
                                className="w-full bg-black/40 border border-amber-500/20 rounded px-9 py-2 text-sm text-amber-100 placeholder:text-amber-700/50 focus:outline-none focus:border-amber-500/60 transition-colors font-serif"
                            />
                            {isSearching && document.activeElement?.id === 'relocation-city' && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 text-amber-500 animate-spin" />}
                        </div>
                        {/* Results Dropdown */}
                        {showResults === 'relocation' && relocationCityResults.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-emerald-950/95 border border-emerald-500/30 rounded shadow-xl max-h-48 overflow-y-auto backdrop-blur-md">
                                {relocationCityResults.map((city, idx) => (
                                    <div key={idx} onClick={() => handleSelectCity(city, 'relocation')} className="px-4 py-2 hover:bg-emerald-500/20 cursor-pointer text-sm text-emerald-100/90 border-b border-emerald-500/10 last:border-0">
                                        <span className="font-semibold">{city.name}</span>
                                        <span className="text-emerald-500/60 ml-2 text-xs">{city.country_code}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="text-[10px] text-amber-500/40 mt-1 italic pl-1">
                            * Calculates rotated houses for this location while keeping planetary geometry fixed.
                        </div>
                    </div>
                )}

                {/* Debug & Error (Existing) */}
                {debugMsg && <div className="text-[10px] text-orange-300 font-mono mt-1 px-1">DEBUG: {debugMsg}</div>}

                {error && (
                    <div className="text-xs text-red-400 bg-red-950/20 p-2 rounded border border-red-500/20 text-center animate-pulse">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button onClick={onCancel} disabled={isAligning} className="flex-1 px-4 py-2 rounded text-emerald-500/60 hover:text-emerald-300 hover:bg-emerald-950/50 transition-colors text-xs uppercase tracking-widest font-mono">Dismiss</button>
                    <button onClick={handleAlign} disabled={isAligning || showSavePrompt} className="flex-1 bg-emerald-600/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-100 px-4 py-2 rounded transition-all text-xs uppercase tracking-widest font-mono flex items-center justify-center gap-2 group">
                        {isAligning ? <><Loader2 className="w-3 h-3 animate-spin" /> Aligning...</> : <>Align Lens <span className="group-hover:translate-x-0.5 transition-transform">→</span></>}
                    </button>
                </div>

                {/* Save Prompt (Simplified: Only for Single Profile for now to avoid UI clutter) */}
                {showSavePrompt && lastAlignedData && !isRelational && (
                    <div className="mt-4 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-lg animate-fade-in-up">
                        <div className="text-xs text-indigo-200 font-mono text-center mb-3">
                            <Save className="w-4 h-4 inline mr-1" /> Save <span className="text-indigo-100 font-semibold">{lastAlignedData.name}</span> to Vault?
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowSavePrompt(false)} className="flex-1 px-3 py-1.5 rounded text-indigo-400/60 hover:text-indigo-300 text-xs font-mono uppercase">Skip</button>
                            <button onClick={() => {
                                saveProfileToVault({ id: generateProfileId(), name: lastAlignedData.name, birthData: lastAlignedData.birthData, lastUpdated: new Date().toISOString() });
                                setShowSavePrompt(false);
                            }} className="flex-1 bg-indigo-600/30 hover:bg-indigo-500/40 border border-indigo-500/50 text-indigo-100 px-3 py-1.5 rounded text-xs font-mono uppercase flex items-center justify-center gap-1"><Save className="w-3 h-3" /> Save</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LensAlignmentCard;
