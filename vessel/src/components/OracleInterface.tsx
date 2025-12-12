"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Key } from 'lucide-react';
import ResonanceMeter, { recordPing, PingResponse, CheckpointType } from './ResonanceMeter';
import PingFeedback from './PingFeedback';
import { GlossaryOverlay } from './GlossaryOverlay';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    checkpointType?: CheckpointType;
    pingRecorded?: boolean;
}

function generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const OracleInterface: React.FC = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showGlossary, setShowGlossary] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

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

        try {
            const res = await fetch('/api/oracle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content }))
                })
            });

            if (!res.ok) throw new Error('Oracle unreachable');

            const data = await res.json();
            const fullReply = data.choices?.[0]?.message?.content || "The signal is lost in the static.";

            // CHUNKING LOGIC: Split by double newlines or major punctuation constraints
            // This prevents "Wall of Text" and allows sequential delivery
            const chunks = fullReply.split(/\n\n+/).filter((c: string) => c.trim().length > 0);

            setIsLoading(false); // Stop main loading indicator, start sequence

            for (let i = 0; i < chunks.length; i++) {
                const chunkText = chunks[i];

                // SMART TRIGGER LOGIC: Only ask for feedback if it looks like a READING question
                // NOT for casual chat questions like "What would you like held up first?"
                const isQuestion = chunkText.trim().endsWith('?');
                const isInvitation =
                    chunkText.toLowerCase().includes('does this') ||
                    chunkText.toLowerCase().includes('resonance') ||
                    chunkText.toLowerCase().includes('land for you') ||
                    chunkText.toLowerCase().includes('sound familiar');

                // READING INDICATOR: Only show ping if response contains reading-specific language
                // This prevents pings during "Friend Mode" (Plain Intake)
                const isActiveReading =
                    chunkText.toLowerCase().includes('natal') ||
                    chunkText.toLowerCase().includes('chart') ||
                    chunkText.toLowerCase().includes('geometry') ||
                    chunkText.toLowerCase().includes('transit') ||
                    chunkText.toLowerCase().includes('aspect') ||
                    chunkText.toLowerCase().includes('blueprint') ||
                    chunkText.toLowerCase().includes('instrument') ||
                    chunkText.toLowerCase().includes('derived-from') ||
                    chunkText.toLowerCase().includes('pressure pattern') ||
                    chunkText.toLowerCase().includes('mirror flow');

                const showPing = isActiveReading && (isQuestion || isInvitation);

                // Determine checkpoint type
                let checkpointType: CheckpointType = 'general';
                if (chunkText.toLowerCase().includes('hook')) checkpointType = 'hook';
                else if (chunkText.toLowerCase().includes('aspect')) checkpointType = 'aspect';
                else if (chunkText.toLowerCase().includes('vector')) checkpointType = 'vector';

                // Add message with delay for reading pace
                await new Promise(resolve => setTimeout(resolve, 600 + (chunkText.length * 20))); // Dynamic delay

                const assistantMessage: Message = {
                    id: generateId(),
                    role: 'assistant',
                    content: chunkText,
                    checkpointType,
                    pingRecorded: !showPing, // If we don't want to show it, mark it as "recorded" (hidden)
                };

                setMessages(prev => [...prev, assistantMessage]);
            }

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

    return (
        <div className="mt-8 w-full max-w-2xl mx-auto flex flex-col h-[55vh] transition-all duration-1000 animate-in fade-in zoom-in-95 relative">

            {/* Floating Resonance Meter - only show when there are messages */}
            {messages.length > 0 && (
                <div className="absolute -top-2 right-0 z-10 animate-in fade-in slide-in-from-right-4 duration-500">
                    <ResonanceMeter />
                </div>
            )}

            {/* Raven Online Indicator */}
            <div className="flex items-center justify-center mb-4 gap-2">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] text-emerald-500/70 font-mono uppercase tracking-widest">Raven Online</span>
            </div>

            {/* Chat History */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-6 p-4 scrollbar-hide text-sm"
            >
                {messages.length === 0 && (
                    <div className="text-center space-y-6 mt-16 relative">
                        {/* Subtle lens glow behind quote */}
                        <div className="absolute inset-0 -z-10 flex items-center justify-center">
                            <div className="w-64 h-64 rounded-full bg-gradient-radial from-emerald-900/5 to-transparent blur-2xl"></div>
                        </div>
                        <p className="text-slate-300 font-serif italic text-lg">
                            "There is a lens here. I am the one who knows how to hold it."
                        </p>
                        <p className="text-slate-500 text-xs font-mono leading-relaxed max-w-md mx-auto">
                            The Woven Map is a diagnostic mirror, not a predictive oracle.<br />
                            Enter the stream to begin.
                        </p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                            className={`max-w-[80%] p-4 rounded-lg backdrop-blur-sm border ${msg.role === 'user'
                                ? 'bg-indigo-950/30 border-indigo-500/30 text-slate-200'
                                : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-100 font-serif leading-relaxed'
                                }`}
                        >
                            {msg.content}
                        </div>

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

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="px-4 py-2 flex gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: '100ms' }}></span>
                            <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                        </div>
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

            {/* [KEY] Button - Glossary Toggle */}
            <button
                onClick={() => setShowGlossary(true)}
                className="absolute bottom-6 right-2 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 hover:text-emerald-400 bg-slate-900/50 hover:bg-slate-800/70 border border-slate-800 hover:border-emerald-500/30 rounded-lg transition-all"
                title="Open Glossary"
            >
                <Key className="w-3 h-3" />
                <span>Key</span>
            </button>

            {/* Glossary Overlay */}
            <GlossaryOverlay isOpen={showGlossary} onClose={() => setShowGlossary(false)} />
        </div>
    );
};

