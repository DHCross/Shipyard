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
    const [isAwake, setIsAwake] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleWake = () => {
        setIsAwake(true);
        // Initial greeting handled by UI state, but we could preset a message if we wanted.
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Call the Oracle API (Perplexity)
            const res = await fetch('/api/oracle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'You are Raven, a poetic and cryptic oracle. Your responses should be brief, geometric, and profound. You are the Poetic Brain.' },
                        ...newMessages.map(m => ({ role: m.role, content: m.content }))
                    ]
                })
            });

            if (!res.ok) throw new Error('Oracle unreachable');

            const data = await res.json();
            const reply = data.choices?.[0]?.message?.content || "The signal is lost in the static.";

            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "The mirror is clouded. I cannot see." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAwake) {
        return (
            <div
                className="mt-12 w-full max-w-md mx-auto cursor-pointer group transition-all duration-1000"
                onClick={handleWake}
            >
                <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-slate-700 to-transparent group-hover:via-emerald-500/50 transition-all duration-500"></div>
                <div className="text-center mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 text-[10px] text-emerald-500/50 tracking-widest uppercase font-mono">
                    Touch to Wake
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 w-full max-w-2xl mx-auto flex flex-col h-[50vh] transition-all duration-1000 animate-in fade-in zoom-in-95">

            {/* Chat History */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-6 p-4 scrollbar-hide text-sm mask-image-gradient-b"
            >
                {messages.length === 0 && (
                    <div className="text-center text-slate-600 italic font-serif opacity-50 mt-20">
                        "Ask, and the geometry shall reveal itself."
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
                            <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce delay-0"></span>
                            <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce delay-200"></span>
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
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-full px-6 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono text-xs"
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
