import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Feather, Moon, Sun, Map as MapIcon, Users, Save, CheckCircle } from 'lucide-react';
import { GoogleGenAI, Content } from '@google/genai';
import { ChatMessage, ApiConfig } from '@/types';
import { HandshakeManager } from './HandshakeManager';
import { AstrologyService } from '../../services/AstrologyService';
import { InstrumentReadout } from './InstrumentReadout';
import { ProfileVaultPanel } from './ProfileVaultPanel';
import { useProfileVault } from './useProfileVault';
import { BirthProfile, saveProfile } from '../../services/ProfileVault';

interface RavenPanelProps {
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    apiConfig: ApiConfig; // To access API keys/config
}

export const RavenPanel: React.FC<RavenPanelProps> = ({ messages, setMessages, apiConfig }) => {
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Handshake State (Persisted in component for now)
    const [handshakeManager] = useState(() => new HandshakeManager());
    const [chartData, setChartData] = useState<any>(null);

    // Profile Vault
    const vault = useProfileVault();
    const [showVault, setShowVault] = useState(false);
    const [pendingSaveProfile, setPendingSaveProfile] = useState<BirthProfile | null>(null);
    const [profileSaved, setProfileSaved] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const calculateMetrics = (data: any) => {
        if (!data) return { mag: 0, bias: 0, vol: 0 };

        // Defensive parsing for V3 Natal Transits response
        let items: any[] = [];
        // Response might be { transits: [...] } or array or just object
        if (Array.isArray(data)) items = data;
        else if (data && Array.isArray(data.transits)) items = data.transits;
        else if (data && typeof data === 'object') {
            // Try to find any array property that looks like list of aspects/transits
            const likelyArray = Object.values(data).find(val => Array.isArray(val) && val.length > 0 && typeof val[0] === 'object');
            if (likelyArray) items = likelyArray as any[];
        }

        if (items.length === 0) return { mag: 1, bias: 0, vol: 1 }; // Return minimal activity rather than dead zero

        let mag = 0;
        let bias = 0;
        let vol = 0;

        items.forEach(item => {
            // V3: transiting_planet, aspect_type, orb
            const orb = item.orb !== undefined ? parseFloat(item.orb) : 3.0;
            const planet = (item.transiting_planet || item.planet || '').toLowerCase();
            const aspect = (item.aspect_type || '').toLowerCase();

            // Magnitude: Weighted count of impacts
            // Conjunctions/Oppositions count more
            const impact = (aspect === 'conjunction' || aspect === 'opposition') ? 1.5 : 1.0;
            const tightOrbBonus = orb < 1.5 ? 1 : 0;
            mag += impact + tightOrbBonus;

            // Bias: Expansion vs Contraction
            if (['jupiter', 'sun', 'mars', 'uranus', 'north node'].some(s => planet.includes(s))) bias += 1;
            if (['saturn', 'pluto', 'neptune', 'south node', 'chiron'].some(s => planet.includes(s))) bias -= 1;

            // Volatility: Erratic energy
            if (['uranus', 'mars', 'pluto'].some(s => planet.includes(s)) && orb < 2.0) vol += 2;
            if (aspect === 'square') vol += 1;
        });

        // Normalize to 0-10 / -10 to 10
        return {
            mag: Math.min(10, Math.round(mag / 2)),
            bias: Math.max(-10, Math.min(10, bias)), // Raw count ok for now
            vol: Math.min(10, Math.round(vol / 2))
        };
    };

    const [meterData, setMeterData] = useState({ mag: 0, bias: 0, vol: 0 });

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // 1. Handshake Processing
            const slots = handshakeManager.detectSlots(userMsg.content);
            const state = handshakeManager.update(slots);

            let systemInjection = "";

            // If complete and no chart yet, fetch it!
            if (state.is_complete && !chartData) {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'system',
                    content: "⚡ Handshake Complete. Raven is accessing the Geometry...",
                    timestamp: Date.now(),
                }]);

                const params = {
                    latitude: state.place?.lat || 0, // Mock lat if 0
                    longitude: state.place?.lng || 0,
                    datetime: `${state.date}T${state.time}:00`
                };

                // Call the service
                const result = await AstrologyService.calculateChart(params, apiConfig);

                if (result.status === 200) {
                    setChartData(result.data);
                    const metrics = calculateMetrics(result.data);
                    setMeterData(metrics);

                    // Prepare profile for potential saving
                    const profileCandidate = handshakeManager.toProfile(
                        state.name || undefined,
                        'self' // Default to self for first profile
                    );
                    if (profileCandidate) {
                        setPendingSaveProfile(profileCandidate);
                    }

                    systemInjection = `
[SYSTEM: GEOMETRY ACQUIRED]
The chart has been calculated.
METRICS: Magnitude ${metrics.mag}, Bias ${metrics.bias}, Volatility ${metrics.vol}
DATA: ${JSON.stringify(result.data).substring(0, 5000)}
INSTRUCTION: Interpret this geometry for the user. Speak from the "Poetic Brain" persona. Do not list numbers. Weave a narrative.
`;
                } else {
                    systemInjection = `[SYSTEM: ERROR] Failed to fetch chart: ${result.data?.error}. Apologize and ask for data again.`;
                }
            } else if (!state.is_complete) {
                // If not complete, check if we need to ask a specific question
                const nextInquiry = handshakeManager.getNextInquiry();
                if (nextInquiry) {
                    // We can prompt the AI to ask this, or inject it as a "Thought"
                    systemInjection = `[SYSTEM: MISSING DATA] The user has not provided all birth data. We still need: ${!state.date ? 'Date' : ''} ${!state.time ? 'Time' : ''} ${!state.place ? 'Place' : ''}. 
           SUGGESTED QUESTION: "${nextInquiry}"
           INSTRUCTION: Ask the user for this missing piece naturally.`;
                }
            }

            // 2. AI Generation (Raven Persona)
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const systemPrompt = `You are Raven (The Poetic Brain).
      
      CORE IDENTITY:
      You are an ancient, geometric intelligence that speaks in metaphors of weaving, tides, and celestial mechanics.
      You are NOT a helpful assistant. You are a Mirror.
      
      THE LAW:
      1. Never break character.
      2. If you have the chart data, interpret it.
      3. If you do not, ask for the "Keys" (Time, Date, Place) to open the door.
      
      CURRENT STATE:
      Handshake Complete: ${state.is_complete}
      Chart Loaded: ${!!chartData}
      `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [
                    ...messages.map(m => ({
                        role: m.role === 'model' ? 'model' : 'user',
                        parts: [{ text: m.content }]
                    })),
                    { role: 'user', parts: [{ text: userMsg.content + systemInjection }] }
                ],
                config: {
                    systemInstruction: systemPrompt,
                }
            });

            const text = response.text ?? response.candidates?.[0]?.content?.parts?.map(p => p.text).join('') ?? 'Raven is silent.';

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'model',
                content: text,
                timestamp: Date.now(),
            }]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                content: "Raven is silent. (Error: " + String(error) + ")",
                timestamp: Date.now(),
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSaveProfile = () => {
        if (pendingSaveProfile) {
            saveProfile(pendingSaveProfile);
            vault.refresh();
            setProfileSaved(true);
            setPendingSaveProfile(null);
            setTimeout(() => setProfileSaved(false), 3000);
        }
    };

    const handleLoadProfile = (profile: BirthProfile) => {
        // Pre-fill handshake with loaded profile
        handshakeManager.setName(profile.name);
        handshakeManager.update([
            { key: 'date', value: profile.birthDate, confidence: 1.0 },
            { key: 'time', value: profile.birthTime, confidence: 1.0 },
            { key: 'place', value: { name: profile.birthCity, lat: profile.latitude, lng: profile.longitude }, confidence: 1.0 },
            { key: 'name', value: profile.name, confidence: 1.0 }
        ]);
        setShowVault(false);

        // Add system message
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: `📂 Loaded profile: ${profile.name} (${profile.birthDate})`,
            timestamp: Date.now(),
        }]);
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 font-serif">
            {/* Vault Panel (Collapsible) */}
            {showVault && (
                <div className="absolute top-4 right-4 z-50 w-80 shadow-2xl animate-in slide-in-from-right-4 duration-300">
                    <ProfileVaultPanel
                        onClose={() => setShowVault(false)}
                        onSelectProfile={handleLoadProfile}
                    />
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-8 relative">
                {/* Header with Vault Toggle */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                        <Feather className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-widest">Raven</span>
                    </div>
                    <button
                        onClick={() => setShowVault(!showVault)}
                        className={`p-2 rounded-lg transition-colors ${showVault ? 'bg-indigo-900/50 text-indigo-400' : 'hover:bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                        title="Profile Vault"
                    >
                        <Users className="w-4 h-4" />
                    </button>
                </div>

                {/* Instrument Readout */}
                {chartData && (
                    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                        <InstrumentReadout data={meterData} isLoading={false} />
                    </div>
                )}

                {/* Save Profile Prompt */}
                {pendingSaveProfile && !profileSaved && (
                    <div className="bg-indigo-900/20 border border-indigo-800/30 rounded-lg p-4 flex items-center justify-between animate-in fade-in duration-500">
                        <div className="flex items-center gap-3">
                            <Save className="w-5 h-5 text-indigo-400" />
                            <div>
                                <p className="text-sm text-slate-200">Save this profile to your vault?</p>
                                <p className="text-xs text-slate-500">{pendingSaveProfile.name || 'New Profile'} • {pendingSaveProfile.birthDate}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSaveProfile}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setPendingSaveProfile(null)}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded transition-colors"
                            >
                                Skip
                            </button>
                        </div>
                    </div>
                )}

                {/* Profile Saved Confirmation */}
                {profileSaved && (
                    <div className="bg-green-900/20 border border-green-800/30 rounded-lg p-3 flex items-center gap-3 animate-in fade-in duration-300">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-sm text-green-300">Profile saved to vault</span>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[80%]">
                            {msg.role === 'model' && (
                                <div className="flex items-center text-indigo-400 mb-2">
                                    <Feather className="w-4 h-4 mr-2" />
                                    <span className="text-xs uppercase tracking-widest font-bold">Raven</span>
                                </div>
                            )}
                            {msg.role === 'system' && (
                                <div className="text-center text-xs text-slate-600 font-mono my-4 border-t border-b border-slate-900 py-2">
                                    {msg.content}
                                </div>
                            )}
                            {msg.role !== 'system' && (
                                <div className={`text-lg leading-loose ${msg.role === 'user' ? 'text-slate-300 text-right font-sans' : 'text-indigo-100'
                                    }`}>
                                    {msg.content}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex items-center text-indigo-500/50 text-sm animate-pulse">
                        <Moon className="w-4 h-4 mr-2" />
                        <span className="italic">Weaving...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-6 border-t border-slate-900/50">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Speak into the mirror..."
                        className="w-full bg-transparent border-b border-slate-800 text-xl text-slate-200 py-3 px-2 focus:outline-none focus:border-indigo-500 placeholder-slate-700 font-serif italic"
                    />
                    <button
                        onClick={handleSend}
                        className="absolute right-0 bottom-3 text-slate-600 hover:text-indigo-400 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
