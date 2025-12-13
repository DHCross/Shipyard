import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Calendar, Clock, User, Heart, Zap, Save } from 'lucide-react';
import { saveProfileToVault, generateProfileId, type Profile } from './ProfileVault';

interface City {
    name: string;
    country_code: string;
    latitude: number;
    longitude: number;
    timezone?: string;
}

interface LensAlignmentCardProps {
    onAlign: (chartData: any) => void;
    onCancel: () => void;
}

export function LensAlignmentCard({ onAlign, onCancel }: LensAlignmentCardProps) {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [timeUnknown, setTimeUnknown] = useState(false);

    // City Search State
    const [cityQuery, setCityQuery] = useState('');
    const [cityResults, setCityResults] = useState<City[]>([]);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Submission State
    const [isAligning, setIsAligning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Relationship Context
    const [intimacyTier, setIntimacyTier] = useState('solo');
    const [contactState, setContactState] = useState<'active' | 'latent'>('active');

    // Save to Vault state
    const [showSavePrompt, setShowSavePrompt] = useState(false);
    const [lastAlignedData, setLastAlignedData] = useState<any>(null);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced City Search
    useEffect(() => {
        if (!cityQuery || selectedCity?.name === cityQuery) {
            setCityResults([]);
            return;
        }

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        searchTimeoutRef.current = setTimeout(async () => {
            setIsSearching(true);
            try {
                // Call our proxy which calls V3 City Search
                // Proxy expects POST by default, but we configured it to handle GET effectively
                // by passing the endpoint string.
                // WE MUST use the specific endpoint structure that our proxy expects.
                // Based on standard implementation:
                const response = await fetch('/api/astrology', {
                    method: 'POST', // The proxy itself is a POST
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        endpoint: `/api/v3/glossary/cities?search=${encodeURIComponent(cityQuery)}&limit=5`,
                        method: 'GET'
                    })
                });

                const data = await response.json();
                if (Array.isArray(data)) {
                    setCityResults(data);
                    setShowResults(true);
                } else {
                    setCityResults([]);
                }
            } catch (err) {
                console.error("City search failed", err);
            } finally {
                setIsSearching(false);
            }
        }, 500); // 500ms debounce

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        };
    }, [cityQuery, selectedCity]);

    const handleSelectCity = (city: City) => {
        setSelectedCity(city);
        setCityQuery(`${city.name}, ${city.country_code}`);
        setShowResults(false);
    };

    const handleAlign = async () => {
        if (!name || !date || !time || !selectedCity) {
            setError("All fields are required to align the lens.");
            return;
        }
        setError(null);
        setIsAligning(true);

        try {
            const [year, month, day] = date.split('-').map(Number);
            const [hour, minute] = time.split(':').map(Number);

            const payload = {
                subject: {
                    name: name,
                    birth_data: {
                        year,
                        month,
                        day,
                        hour,
                        minute,
                        city: selectedCity.name,
                        country_code: selectedCity.country_code,
                        latitude: selectedCity.latitude,
                        longitude: selectedCity.longitude
                    }
                },
                options: {
                    house_system: "P", // Placidus default
                    zodiac_type: "Tropic",
                    language: "en"
                },
                relationship_context: {
                    intimacy_tier: intimacyTier,
                    contact_state: contactState
                }
            };

            const response = await fetch('/api/astrology', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint: '/api/v3/analysis/natal-report',
                    method: 'POST',
                    payload: payload
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Store the aligned data for potential save
            setLastAlignedData({
                name,
                birthData: {
                    year,
                    month,
                    day,
                    hour,
                    minute,
                    city: selectedCity.name,
                    country_code: selectedCity.country_code,
                    latitude: selectedCity.latitude,
                    longitude: selectedCity.longitude
                },
                intimacyTier,
                contactState
            });
            setShowSavePrompt(true);

            onAlign(data);

        } catch (err: any) {
            console.error("Alignment failed", err);
            setError("Failed to align lens. The frequency was interrupted.");
        } finally {
            setIsAligning(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto my-4 bg-emerald-950/40 border border-emerald-500/30 rounded-lg backdrop-blur-md overflow-hidden shadow-2xl animate-fade-in-up">
            {/* Header */}
            <div className="bg-emerald-900/40 p-3 border-b border-emerald-500/20 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono tracking-widest text-emerald-100 uppercase">Lens Alignment Protocol</span>
            </div>

            <div className="p-6 space-y-4">
                {/* Name */}
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-emerald-400/70 font-mono ml-1">Subject Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-emerald-500/50" />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter Name"
                            className="w-full bg-black/40 border border-emerald-500/20 rounded px-9 py-2 text-sm text-emerald-100 placeholder:text-emerald-700/50 focus:outline-none focus:border-emerald-500/60 transition-colors font-serif"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Date */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-emerald-400/70 font-mono ml-1">Birth Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-emerald-500/50" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-black/40 border border-emerald-500/20 rounded px-9 py-2 text-sm text-emerald-100 focus:outline-none focus:border-emerald-500/60 transition-colors font-mono"
                            />
                        </div>
                    </div>

                    {/* Time */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] uppercase tracking-wider text-emerald-400/70 font-mono ml-1">Birth Time</label>
                            <button
                                type="button"
                                onClick={() => {
                                    const newState = !timeUnknown;
                                    setTimeUnknown(newState);
                                    if (newState) setTime('12:00');
                                }}
                                className={`text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border transition-colors ${timeUnknown
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'text-emerald-500/40 border-transparent hover:text-emerald-400'
                                    }`}
                            >
                                {timeUnknown ? 'Unknown (Noon)' : 'Unknown?'}
                            </button>
                        </div>
                        <div className="relative">
                            <Clock className={`absolute left-3 top-2.5 w-4 h-4 ${timeUnknown ? 'text-emerald-500/20' : 'text-emerald-500/50'}`} />
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                disabled={timeUnknown}
                                className={`w-full bg-black/40 border rounded px-9 py-2 text-sm focus:outline-none transition-colors font-mono ${timeUnknown
                                    ? 'border-emerald-500/10 text-emerald-500/30 cursor-not-allowed'
                                    : 'border-emerald-500/20 text-emerald-100 focus:border-emerald-500/60'
                                    }`}
                            />
                        </div>
                    </div>
                </div>

                {/* Place Search */}
                <div className="space-y-1 relative">
                    <label className="text-[10px] uppercase tracking-wider text-emerald-400/70 font-mono ml-1">Birth Place</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-emerald-500/50" />
                        <input
                            type="text"
                            value={cityQuery}
                            onChange={(e) => {
                                setCityQuery(e.target.value);
                                if (selectedCity && e.target.value !== selectedCity.name) {
                                    setSelectedCity(null); // Reset selection if typing
                                }
                            }}
                            onFocus={() => { if (cityResults.length > 0) setShowResults(true); }}
                            placeholder="Search City..."
                            className="w-full bg-black/40 border border-emerald-500/20 rounded px-9 py-2 text-sm text-emerald-100 placeholder:text-emerald-700/50 focus:outline-none focus:border-emerald-500/60 transition-colors font-serif"
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-3 top-2.5 w-4 h-4 text-emerald-500 animate-spin" />
                        )}
                    </div>

                    {/* Dropdown Results */}
                    {showResults && cityResults.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-emerald-950/95 border border-emerald-500/30 rounded shadow-xl max-h-48 overflow-y-auto backdrop-blur-md">
                            {cityResults.map((city, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleSelectCity(city)}
                                    className="px-4 py-2 hover:bg-emerald-500/20 cursor-pointer text-sm text-emerald-100/90 border-b border-emerald-500/10 last:border-0"
                                >
                                    <span className="font-semibold">{city.name}</span>
                                    <span className="text-emerald-500/60 ml-2 text-xs">{city.country_code}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Relationship Context */}
                <div className="space-y-3 pt-2 border-t border-emerald-500/10">
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400/50 font-mono">Relationship Context (Optional)</span>

                    {/* Intimacy Tier */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-emerald-400/70 font-mono ml-1 flex items-center gap-1">
                            <Heart className="w-3 h-3" /> Intimacy Tier
                        </label>
                        <select
                            value={intimacyTier}
                            onChange={(e) => setIntimacyTier(e.target.value)}
                            className="w-full bg-black/40 border border-emerald-500/20 rounded px-3 py-2 text-sm text-emerald-100 focus:outline-none focus:border-emerald-500/60 transition-colors font-mono appearance-none cursor-pointer"
                        >
                            <option value="solo">Solo (Individual Chart)</option>
                            <option value="platonic">Platonic Partners</option>
                            <option value="fwb">Friends-with-Benefits</option>
                            <option value="situationship">Situationship (Unclear/Unstable)</option>
                            <option value="low_commitment">Low-Commitment Romantic/Sexual</option>
                            <option value="committed_romantic_sexual">Committed Romantic + Sexual</option>
                            <option value="committed_romantic_nonsexual">Committed Romantic, Non-Sexual</option>
                            <option value="family_other">Family / Other Bond</option>
                        </select>
                    </div>

                    {/* Contact State */}
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-emerald-400/70 font-mono ml-1 flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Contact State
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setContactState('active')}
                                className={`flex-1 px-3 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all border ${contactState === 'active'
                                    ? 'bg-emerald-600/30 border-emerald-400/60 text-emerald-100'
                                    : 'bg-black/20 border-emerald-500/20 text-emerald-500/50 hover:border-emerald-500/40'
                                    }`}
                            >
                                ⚡ Active (Live Contact)
                            </button>
                            <button
                                type="button"
                                onClick={() => setContactState('latent')}
                                className={`flex-1 px-3 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all border ${contactState === 'latent'
                                    ? 'bg-slate-600/30 border-slate-400/60 text-slate-100'
                                    : 'bg-black/20 border-emerald-500/20 text-emerald-500/50 hover:border-emerald-500/40'
                                    }`}
                            >
                                💤 Latent (Dormant)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="text-xs text-red-400 bg-red-950/20 p-2 rounded border border-red-500/20 text-center animate-pulse">
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={onCancel}
                        disabled={isAligning}
                        className="flex-1 px-4 py-2 rounded text-emerald-500/60 hover:text-emerald-300 hover:bg-emerald-950/50 transition-colors text-xs uppercase tracking-widest font-mono"
                    >
                        Dismiss
                    </button>
                    <button
                        onClick={handleAlign}
                        disabled={isAligning || showSavePrompt}
                        className="flex-1 bg-emerald-600/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-100 px-4 py-2 rounded transition-all text-xs uppercase tracking-widest font-mono flex items-center justify-center gap-2 group"
                    >
                        {isAligning ? (
                            <><Loader2 className="w-3 h-3 animate-spin" /> Aligning...</>
                        ) : (
                            <>Align Lens <span className="group-hover:translate-x-0.5 transition-transform">→</span></>
                        )}
                    </button>
                </div>

                {/* Save to Vault Prompt */}
                {showSavePrompt && lastAlignedData && (
                    <div className="mt-4 p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-lg animate-fade-in-up">
                        <div className="text-xs text-indigo-200 font-mono text-center mb-3">
                            <Save className="w-4 h-4 inline mr-1" />
                            Save <span className="text-indigo-100 font-semibold">{lastAlignedData.name}</span> to your Vault?
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowSavePrompt(false)}
                                className="flex-1 px-3 py-1.5 rounded text-indigo-400/60 hover:text-indigo-300 text-xs font-mono uppercase"
                            >
                                Skip
                            </button>
                            <button
                                onClick={() => {
                                    const profile: Profile = {
                                        id: generateProfileId(),
                                        name: lastAlignedData.name,
                                        birthData: lastAlignedData.birthData,
                                        intimacyTier: lastAlignedData.intimacyTier,
                                        contactState: lastAlignedData.contactState,
                                        lastUpdated: new Date().toISOString()
                                    };
                                    saveProfileToVault(profile);
                                    setShowSavePrompt(false);
                                }}
                                className="flex-1 bg-indigo-600/30 hover:bg-indigo-500/40 border border-indigo-500/50 text-indigo-100 px-3 py-1.5 rounded text-xs font-mono uppercase flex items-center justify-center gap-1"
                            >
                                <Save className="w-3 h-3" /> Save
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LensAlignmentCard;
