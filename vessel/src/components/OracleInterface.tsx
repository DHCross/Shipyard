"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const OracleInterface: React.FC = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Call the Oracle API - backend handles Raven's full persona
            const res = await fetch('/api/oracle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content }))
                })
            });

            if (!res.ok) throw new Error('Oracle unreachable');

            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content || "The signal is lost in the static.";

            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Clouded Skies. The geometry is momentarily obscured." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-8 w-full max-w-2xl mx-auto flex flex-col h-[55vh] transition-all duration-1000 animate-in fade-in zoom-in-95">

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
                    <div className="text-center space-y-6 mt-16">
                        <p className="text-slate-500 font-serif italic">
                            "I need your coordinates to align the lens."
                        </p>
                        <p className="text-slate-600 text-xs font-mono">
                            Share your birth date, time, and location—or simply begin.
                        </p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[80%] p-4 rounded-lg backdrop-blur-sm border ${msg.role === 'user'
                                ? 'bg-indigo-950/30 border-indigo-500/30 text-slate-200'
                                : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-100 font-serif leading-relaxed'
                                }`}
                        >
                            {msg.content}
                        </div>
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

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="relative mt-4 p-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter the stream..."
                    disabled={isLoading}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-full px-6 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono text-xs"
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 disabled:opacity-30 transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};
