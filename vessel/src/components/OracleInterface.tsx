"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Key, Users, Power } from 'lucide-react';
import ResonanceMeter, { recordPing, PingResponse, CheckpointType } from './ResonanceMeter';
import PingFeedback from './PingFeedback';
import { GlossaryOverlay } from './GlossaryOverlay';
import { LensAlignmentCard } from './raven/LensAlignmentCard';
import { ProfileVault, type Profile } from './raven/ProfileVault';
import { SessionWrapUp } from './raven/SessionWrapUp';
import { parseBirthData, formatParsedData, type ParsedBirthData } from '@/lib/raven/BirthDataParser';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    checkpointType?: CheckpointType;
    pingRecorded?: boolean;
    hook?: string;    // Session context tag (e.g., "Session · Structured Reading")
    climate?: string; // Voice mode tag (e.g., "VOICE · Report Interpretation")
}

// Session mode state machine: idle → exploration → report
type SessionMode = 'idle' | 'exploration' | 'report';

function generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const OracleInterface: React.FC = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isChunking, setIsChunking] = useState(false); // True while delivering chunks with delays
    const [showGlossary, setShowGlossary] = useState(false);
    const [isActiveReading, setIsActiveReading] = useState(false); // Gate for Resonance Meter
    const [showLensCard, setShowLensCard] = useState(false); // Lens Alignment Input Card visibility
    const [showProfileVault, setShowProfileVault] = useState(false); // Profile Vault panel visibility
    const [sessionMode, setSessionMode] = useState<SessionMode>('idle'); // Session state machine
    const [sessionStarted, setSessionStarted] = useState(false); // Has the session been formally started?
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastUserMsgRef = useRef<HTMLDivElement>(null); // For scroll-to-response
    const [showWrapUp, setShowWrapUp] = useState(false); // Session wrap-up modal
    const [chartData, setChartData] = useState<any>(null); // Store raw V3 API response for export

    // Birth data detection state machine

    // Birth data detection state machine
    const [pendingBirthData, setPendingBirthData] = useState<ParsedBirthData | null>(null);
    const [showBirthDataConfirm, setShowBirthDataConfirm] = useState(false);

    // Smart scroll: scroll to show the last user message at top when new response arrives
    // This lets user read from the beginning of Raven's response
    useEffect(() => {
        if (lastUserMsgRef.current) {
            lastUserMsgRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [messages.length]);

    const handlePingFeedback = useCallback((messageId: string, response: PingResponse, note?: string) => {
        // Find the message to get its checkpoint type
        const msg = messages.find(m => m.id === messageId);
        const checkpointType = msg?.checkpointType || 'general';

        // Record the ping
        recordPing({
            messageId,
            response,
            checkpointType,
            timestamp: Date.now(),
            note,
        });

        // Mark as recorded
        setMessages(prev => prev.map(m =>
            m.id === messageId ? { ...m, pingRecorded: true } : m
        ));

        // Add acknowledgement narrative (plain language, no jargon)
        // CRITICAL: No retrofitting language - a miss does NOT change the map
        let acknowledgement: string | null = null;
        switch (response) {
            case 'yes':
                acknowledgement = "Noted—glad that landed. I'll keep threading that thread.";
                break;
            case 'maybe':
                acknowledgement = "Noted—partially resonant. That stands as partial data; nothing is forced to fit.";
                break;
            case 'no':
                acknowledgement = "Noted—that didn't land. A miss is logged as a miss, not reinterpreted away.";
                break;
            case 'unclear':
                acknowledgement = "Noted—too foggy. That stands as null data unless you want to try a different angle.";
                break;
        }

        if (acknowledgement) {
            const ackMessage: Message = {
                id: generateId(),
                role: 'assistant',
                content: acknowledgement,
                hook: 'Resonance · Feedback Received',
                climate: 'VOICE · Feedback Logged',
                pingRecorded: true, // Don't prompt for feedback on feedback
            };
            setMessages(prev => [...prev, ackMessage]);
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        const userMessage: Message = {
            id: generateId(),
            role: 'user',
            content: userMsg
        };
        const newMessages: Message[] = [...messages, userMessage];
        setMessages(newMessages);
        setIsLoading(true);

        // Session mode transitions
        if (sessionMode === 'idle') {
            setSessionMode('exploration');
            setSessionStarted(true);
        }

        // Birth data detection (Detect → Prepare → Ask → Act)
        // Parse ONLY this message, never accumulate across turns
        const detected = parseBirthData(userMsg);
        if (detected && !showLensCard) {
            // Candidate detected - pause and ask for consent
            setPendingBirthData(detected);
            setShowBirthDataConfirm(true);
            setIsLoading(false);

            // Add Raven's confirmation question
            const confirmMsg: Message = {
                id: generateId(),
                role: 'assistant',
                content: `I noticed what looks like birth information: **${formatParsedData(detected)}**\n\nWould you like me to use that to open a chart?`,
                hook: 'Inference · Data Detected',
                climate: 'VOICE · Awaiting Consent',
                pingRecorded: true,
            };
            setMessages(prev => [...prev, confirmMsg]);
            return; // Don't proceed to API call yet
        }

        // Create placeholder message immediately (placeholder-then-stream pattern)
        // Start with pingRecorded: true to prevent flash during streaming
        // Final eligibility check will set it to false only if pings should show
        const placeholderId = generateId();
        const placeholderMessage: Message = {
            id: placeholderId,
            role: 'assistant',
            content: '',
            hook: sessionMode === 'report' ? 'Session · Structured Reading' : 'Session · Listening',
            climate: sessionMode === 'report' ? 'VOICE · Report Interpretation' : 'VOICE · Open Dialogue',
            pingRecorded: true // Prevent ping flash during streaming
        };
        setMessages(prev => [...prev, placeholderMessage]);

        try {
            const res = await fetch('/api/oracle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                    chartContext: chartData // Pass current geometry to Raven
                })
            });

            if (!res.ok) throw new Error('Oracle unreachable');

            const data = await res.json();
            const fullReply = data.choices?.[0]?.message?.content || "The signal is lost in the static.";

            // CHUNKING LOGIC: Split by double newlines or major punctuation constraints
            // This prevents "Wall of Text" and allows sequential delivery
            const chunks = fullReply.split(/\n\n+/).filter((c: string) => c.trim().length > 0);

            // Keep loading visible until first chunk renders
            setIsChunking(true);

            let accumulatedContent = '';
            let hasGeometryInReply = false;
            let finalCheckpointType: CheckpointType = 'general';

            for (let i = 0; i < chunks.length; i++) {
                const chunkText = chunks[i];

                // Check for geometry data in this chunk
                const hasGeometryData =
                    chunkText.includes('[GEOMETRY') ||
                    chunkText.includes('[CHART:') ||
                    chunkText.includes('[DATA:') ||
                    /\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto)\s+in\s+[A-Z]/i.test(chunkText) ||
                    /\d+°/.test(chunkText) ||
                    /[△□☌⚹⚻⚺]/.test(chunkText) ||
                    /your (sun|moon|mars|venus|saturn|mercury|jupiter|neptune|uranus|pluto|ascendant|rising)/i.test(chunkText) ||
                    /(field shows|I see|pattern here|geometry reveals|readout shows|the chart shows)/i.test(chunkText);

                if (hasGeometryData) {
                    setIsActiveReading(true);
                    hasGeometryInReply = true;
                }

                // Determine checkpoint type from content
                if (chunkText.toLowerCase().includes('hook')) finalCheckpointType = 'hook';
                else if (chunkText.toLowerCase().includes('aspect')) finalCheckpointType = 'aspect';
                else if (chunkText.toLowerCase().includes('vector')) finalCheckpointType = 'vector';

                // Add delay for reading pace
                await new Promise(resolve => setTimeout(resolve, 600 + (chunkText.length * 15)));

                // Accumulate content and update placeholder
                accumulatedContent += (accumulatedContent ? '\n\n' : '') + chunkText;

                // Update placeholder message with accumulated content
                setMessages(prev => prev.map(msg =>
                    msg.id === placeholderId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                ));

                // Turn off loading after first chunk
                if (i === 0) {
                    setIsLoading(false);
                }
            }

            // After all chunks, finalize the message with ping eligibility
            // Only show pings in 'report' mode (structured reading), not 'exploration' (casual chat)
            const isQuestion = accumulatedContent.trim().endsWith('?');
            const isInvitation =
                accumulatedContent.toLowerCase().includes('does this') ||
                accumulatedContent.toLowerCase().includes('land for you') ||
                accumulatedContent.toLowerCase().includes('sound familiar');

            // GATE: Only show ping feedback in structured readings with actual geometry
            const showPing = sessionMode === 'report' && isActiveReading && hasGeometryInReply && (isQuestion || isInvitation);

            setMessages(prev => prev.map(msg =>
                msg.id === placeholderId
                    ? { ...msg, checkpointType: finalCheckpointType, pingRecorded: !showPing }
                    : msg
            ));

            setIsChunking(false);

        } catch (err) {
            setIsLoading(false);
            const errorMessage: Message = {
                id: generateId(),
                role: 'assistant',
                content: "Clouded Skies. The geometry is momentarily obscured.",
                checkpointType: 'general',
                pingRecorded: true,
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    // End session handler - resets all state
    const handleEndSession = useCallback(() => {
        setMessages([]);
        setSessionMode('idle');
        setSessionStarted(false);
        setIsActiveReading(false);
        setShowWrapUp(false);
        setInput('');
    }, []);

    // Birth data consent handlers
    const handleBirthDataConfirm = useCallback(() => {
        // User confirmed - open card with pre-filled data
        setShowBirthDataConfirm(false);
        setShowLensCard(true);
        // pendingBirthData will be passed to card via initialData prop
    }, []);

    const handleBirthDataDecline = useCallback(() => {
        // User declined - discard candidate, return to idle
        setShowBirthDataConfirm(false);
        setPendingBirthData(null);

        // Add neutral acknowledgement
        const declineMsg: Message = {
            id: generateId(),
            role: 'assistant',
            content: "No problem. Let me know when you're ready, or just keep talking.",
            hook: 'Inference · Declined',
            climate: 'VOICE · Open Dialogue',
            pingRecorded: true,
        };
        setMessages(prev => [...prev, declineMsg]);
    }, []);

    return (
        <div className={`mt-8 w-full max-w-2xl mx-auto flex flex-col ${showLensCard ? 'h-auto min-h-[55vh]' : 'h-[55vh]'} transition-all duration-1000 animate-in fade-in zoom-in-95 relative`}>

            {/* Floating Resonance Meter - only show during active readings, not casual chat */}
            {isActiveReading && (
                <div className="absolute -top-2 right-0 z-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <ResonanceMeter />
                </div>
            )}

            {/* Raven Online Indicator & Session Controls */}
            <div className="flex items-center justify-center mb-4 gap-4">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] text-emerald-500/70 font-mono uppercase tracking-widest">Raven Online</span>
                </div>

                {/* Explicit Clear Geometry Action */}
                {isActiveReading && (
                    <button
                        onClick={() => {
                            // Clear Geometry Action
                            setChartData(null);
                            setIsActiveReading(false);
                            setSessionMode('exploration'); // Return to open exploration

                            const systemMsg: Message = {
                                id: generateId(),
                                role: 'system',
                                content: '[SYSTEM] Geometry cleared. Map dismissed.',
                                hook: 'Session · Ended'
                            };
                            setMessages(prev => [...prev, systemMsg]);
                        }}
                        className="group flex items-center gap-1 px-2 py-1 rounded border border-rose-900/30 bg-rose-950/20 hover:bg-rose-900/40 hover:border-rose-500/30 transition-all cursor-pointer"
                        title="Dismiss Map (Clear Geometry)"
                    >
                        <Power className="w-3 h-3 text-rose-500/50 group-hover:text-rose-400" />
                        <span className="text-[9px] text-rose-500/50 group-hover:text-rose-300 font-mono uppercase tracking-wider">Close Lens</span>
                    </button>
                )}
            </div>

            {/* Session Mode Badge */}
            {sessionStarted && (
                <div className="flex justify-center mb-2 animate-in fade-in duration-300">
                    <span className={`px-3 py-1 text-[9px] font-mono uppercase tracking-wider rounded-full border ${sessionMode === 'report'
                        ? 'border-indigo-400/40 bg-indigo-500/20 text-indigo-200'
                        : 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200'
                        }`}>
                        {sessionMode === 'idle' && 'Session Idle'}
                        {sessionMode === 'exploration' && 'Exploratory Dialogue'}
                        {sessionMode === 'report' && 'Structured Reading'}
                    </span>
                </div>
            )}

            {/* Chat History */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-6 p-4 scrollbar-hide text-sm"
            >
                {messages.length === 0 && !showLensCard && (
                    <div className="flex flex-col items-center justify-center h-full text-center relative gap-4">
                        {/* Subtle lens glow behind quote */}
                        <div className="absolute inset-0 -z-10 flex items-center justify-center">
                            <div className="w-64 h-64 rounded-full bg-gradient-radial from-emerald-900/5 to-transparent blur-2xl"></div>
                        </div>
                        <p className="text-slate-300 font-serif italic text-lg">
                            "There is a lens here. We hold it steady together."
                        </p>
                        <p className="text-slate-500 text-xs font-mono leading-relaxed max-w-md mx-auto">
                            The Woven Map is a diagnostic mirror, not a predictive oracle.
                        </p>

                        {/* Session Mode Badges */}
                        <div className="flex flex-wrap justify-center gap-3 mt-8">
                            <button
                                onClick={() => setInput("What is this all about?")}
                                className="group px-4 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-emerald-500/30 rounded-lg transition-all duration-300"
                            >
                                <span className="text-xs font-mono text-slate-400 group-hover:text-emerald-400 transition-colors">
                                    💬 Ask Raven a Question
                                </span>
                            </button>
                            <button
                                onClick={() => setShowLensCard(true)}
                                className="group px-4 py-2.5 bg-indigo-900/30 hover:bg-indigo-800/40 border border-indigo-500/30 hover:border-indigo-400/50 rounded-lg transition-all duration-300"
                            >
                                <span className="text-xs font-mono text-indigo-300 group-hover:text-indigo-200 transition-colors">
                                    🌙 Read My Chart
                                </span>
                            </button>
                            <button
                                onClick={() => setInput("I want to compare two charts—mine and someone else's.")}
                                className="group px-4 py-2.5 bg-rose-900/20 hover:bg-rose-800/30 border border-rose-500/20 hover:border-rose-400/40 rounded-lg transition-all duration-300"
                            >
                                <span className="text-xs font-mono text-rose-300/80 group-hover:text-rose-200 transition-colors">
                                    ✨ Compare Two Charts
                                </span>
                            </button>
                        </div>

                        <p className="text-slate-600 text-[10px] font-mono mt-4">
                            Or simply type below to enter the stream.
                        </p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={msg.id}
                        ref={msg.role === 'user' ? lastUserMsgRef : null}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-center'}`}
                    >
                        {/* Hook/Climate Badges for assistant messages */}
                        {msg.role === 'assistant' && (msg.hook || msg.climate) && (
                            <div className="flex gap-2 mb-1.5 text-[9px] font-mono uppercase tracking-wider">
                                {msg.hook && (
                                    <span className="px-2 py-0.5 bg-indigo-950/40 border border-indigo-500/20 rounded text-indigo-300/70">
                                        {msg.hook}
                                    </span>
                                )}
                                {msg.climate && (
                                    <span className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-500/20 rounded text-emerald-300/70">
                                        {msg.climate}
                                    </span>
                                )}
                            </div>
                        )}
                        {/* Only render message box when content exists (prevents empty placeholder box) */}
                        {msg.content.trim() && (
                            <div
                                className={`max-w-[80%] p-4 rounded-lg backdrop-blur-sm border ${msg.role === 'user'
                                    ? 'bg-indigo-950/30 border-indigo-500/30 text-slate-200'
                                    : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-100 font-serif leading-relaxed whitespace-pre-wrap text-left'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        )}

                        {/* Ping Feedback for assistant messages */}
                        {msg.role === 'assistant' && !msg.pingRecorded && (
                            <div className="max-w-[80%] mt-2">
                                <PingFeedback
                                    messageId={msg.id}
                                    onFeedback={handlePingFeedback}
                                    checkpointType={msg.checkpointType}
                                />
                            </div>
                        )}
                    </div>
                ))}

                {/* Birth Data Confirmation Buttons */}
                {showBirthDataConfirm && (
                    <div className="flex justify-center gap-3 mt-4">
                        <button
                            onClick={handleBirthDataConfirm}
                            className="px-4 py-2.5 bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-500/40 hover:border-emerald-400/60 rounded-lg transition-all text-emerald-200 text-sm font-mono"
                        >
                            Yes, use this
                        </button>
                        <button
                            onClick={handleBirthDataDecline}
                            className="px-4 py-2.5 bg-slate-800/50 hover:bg-slate-700/60 border border-slate-600/40 hover:border-slate-500/50 rounded-lg transition-all text-slate-300 text-sm font-mono"
                        >
                            Not yet
                        </button>
                    </div>
                )}

                {/* Lens Alignment Card */}
                {showLensCard && (
                    <LensAlignmentCard
                        onAlign={(data) => {
                            setChartData(data); // Store for export
                            setShowLensCard(false);
                            // Store chart data or pass to Raven context
                            console.log('Chart aligned:', data);
                            // For now, send a message indicating alignment
                            const userMsg: Message = {
                                id: generateId(),
                                role: 'user',
                                content: `[GEOMETRY ACQUIRED] Chart aligned for analysis.`
                            };
                            setMessages(prev => [...prev, userMsg]);
                            setIsActiveReading(true); // Enable Resonance Meter
                            // Optionally trigger Raven to acknowledge the chart
                            setInput('The lens is aligned. Please read the chart.');
                        }}
                        onCancel={() => setShowLensCard(false)}
                    />
                )}

                {(isLoading || isChunking) && (
                    <div className="flex justify-start items-center gap-3">
                        <div className="px-4 py-2 flex gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                        </div>
                        <span className="text-[10px] text-emerald-500/50 font-mono italic">
                            {isLoading ? 'Raven is composing...' : 'Raven is weaving...'}
                        </span>
                    </div>
                )}
            </div>

            {/* Input Area - Enhanced */}
            <form onSubmit={handleSubmit} className="relative mt-4 p-4">
                <div className="relative group">
                    {/* Signal-ready glow ring */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter the stream..."
                        disabled={isLoading}
                        className="relative w-full bg-slate-900/70 border border-slate-700/50 rounded-full px-6 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all font-mono text-xs"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 disabled:opacity-30 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>

            {/* Action Buttons Row - UNDER the input field */}
            <div className="flex justify-center gap-3 mt-3">
                {/* End Session Button - only show when session is active */}
                {sessionStarted && (
                    <button
                        onClick={() => setShowWrapUp(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 hover:text-rose-400 bg-slate-900/50 hover:bg-slate-800/70 border border-slate-800 hover:border-rose-500/30 rounded-lg transition-all"
                        title="End Session"
                    >
                        <Power className="w-3 h-3" />
                        <span>End</span>
                    </button>
                )}

                {/* Vault Button */}
                <button
                    onClick={() => setShowProfileVault(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 hover:text-indigo-400 bg-slate-900/50 hover:bg-slate-800/70 border border-slate-800 hover:border-indigo-500/30 rounded-lg transition-all"
                    title="Open Profile Vault"
                >
                    <Users className="w-3 h-3" />
                    <span>Vault</span>
                </button>

                {/* [KEY] Button - Glossary Toggle */}
                <button
                    onClick={() => setShowGlossary(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 hover:text-emerald-400 bg-slate-900/50 hover:bg-slate-800/70 border border-slate-800 hover:border-emerald-500/30 rounded-lg transition-all"
                    title="Open Glossary"
                >
                    <Key className="w-3 h-3" />
                    <span>Key</span>
                </button>
            </div>

            {/* Glossary Overlay */}
            <GlossaryOverlay isOpen={showGlossary} onClose={() => setShowGlossary(false)} />

            {/* Profile Vault Panel */}
            <ProfileVault
                isOpen={showProfileVault}
                onClose={() => setShowProfileVault(false)}
                onInject={async (profiles: Profile[]) => {
                    if (profiles.length === 0) return;

                    setIsLoading(true);
                    const selected = profiles.slice(0, 2); // Handle max 2

                    // Helper to align a single profile
                    const alignOne = async (p: Profile) => {
                        const birth_data: any = {
                            year: p.birthData.year, month: p.birthData.month, day: p.birthData.day,
                            hour: p.birthData.hour, minute: p.birthData.minute, second: 0
                        };
                        if (typeof p.birthData.latitude === 'number' && typeof p.birthData.longitude === 'number') {
                            birth_data.latitude = p.birthData.latitude;
                            birth_data.longitude = p.birthData.longitude;
                        } else {
                            birth_data.city = p.birthData.city;
                            birth_data.country_code = p.birthData.country_code;
                        }

                        const res = await fetch('/api/astrology', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                endpoint: '/api/v3/analysis/natal-report',
                                method: 'POST',
                                payload: {
                                    subject: { name: p.name, birth_data },
                                    report_options: { tradition: 'psychological', language: 'en' }
                                }
                            })
                        });
                        const data = await res.json();
                        if (!res.ok || data.success === false) throw new Error(data.error || "Alignment Failed");
                        return data;
                    };

                    try {
                        let finalChartData = null;

                        if (selected.length === 1) {
                            // Single Alignment
                            finalChartData = await alignOne(selected[0]);
                            setMessages(prev => [...prev, {
                                id: generateId(), role: 'system', content: `[SYSTEM] Alignment Established: ${selected[0].name}`, hook: 'System'
                            }]);
                            setInput(`Please read the chart for ${selected[0].name}.`);
                        } else {
                            // Dual Alignment (Parallel)
                            const [dataA, dataB] = await Promise.all([alignOne(selected[0]), alignOne(selected[1])]);
                            finalChartData = { subject: dataA, partner: dataB };
                            setMessages(prev => [...prev, {
                                id: generateId(), role: 'system', content: `[SYSTEM] Synastry Alignment Established: ${selected[0].name} + ${selected[1].name}`, hook: 'System'
                            }]);
                            setInput(`Please read the chart comparison for ${selected[0].name} and ${selected[1].name}.`);
                        }

                        setChartData(finalChartData);
                        setSessionMode('report');
                        setSessionStarted(true);
                        setIsActiveReading(true);

                        // Inject user context
                        const profileString = selected.map(p => `${p.name} (${p.birthData.city})`).join(' + ');
                        setMessages(prev => [...prev, {
                            id: generateId(), role: 'user', content: `[INJECTED PROFILES] ${profileString}`
                        }]);

                    } catch (err: any) {
                        console.error("Injection Failed", err);
                        setMessages(prev => [...prev, {
                            id: generateId(), role: 'assistant', content: `Signal failure: ${err.message}`, climate: 'Alert'
                        }]);
                    } finally {
                        setIsLoading(false);
                    }
                }}
                onRestoreSession={(data: any) => {
                    // RESTORE SESSION STATE
                    console.log("Restoring session from import:", data);

                    // 1. Restore Chart Data
                    setChartData(data);

                    // 2. Check for Relational Data (Person B)
                    const hasPartner = !!(data.partner || data.person_b);
                    const subjectName = data.subject?.name || data.person_a?.name || "Subject";
                    const partnerName = data.partner?.name || data.person_b?.name || "Partner";

                    // 3. Set Active State
                    setIsActiveReading(true);
                    setSessionMode('report');
                    setSessionStarted(true);

                    // 4. Inject Context Messages with Relational Guard
                    const restoreMsg: Message = {
                        id: generateId(),
                        role: 'system',
                        content: hasPartner
                            ? `[SYSTEM] Chart data restored for ${subjectName} and ${partnerName}. Relational geometry detected.`
                            : `[SYSTEM] Chart data restored for ${subjectName}. Geometry is active.`,
                        hook: 'Session · Restored',
                    };

                    const ravenMsg: Message = {
                        id: generateId(),
                        role: 'assistant',
                        content: hasPartner
                            ? `I see the maps for **${subjectName}** and **${partnerName}** are back. I’ve laid them out.\n\nAre we looking at the space between them today, or should we focus on one?`
                            : `I see the map for **${subjectName}** is back in focus. What would you like to explore?`,
                        climate: hasPartner ? 'VOICE · Relational Inquiry' : 'VOICE · Diagnostic',
                        pingRecorded: true
                    };

                    setMessages(prev => [...prev, restoreMsg, ravenMsg]);
                    setInput('');
                }}
            />

            {/* Session Wrap-Up Modal */}
            <SessionWrapUp
                isOpen={showWrapUp}
                onClose={() => setShowWrapUp(false)}
                onConfirmEnd={handleEndSession}
                messages={messages}
                sessionMode={sessionMode}
                chartData={chartData}
            />
        </div>
    );
};
