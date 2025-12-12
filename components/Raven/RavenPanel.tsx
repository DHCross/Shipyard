import React, { useState, useEffect, useRef } from 'react';
import { Send, Bird, Sun, Map as MapIcon } from 'lucide-react';
import { ChatMessage, ApiConfig } from '../../types';
import { HandshakeManager } from './HandshakeManager';
import { AstrologyService } from '../../services/AstrologyService';

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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
                    latitude: state.place?.lat || 0,
                    longitude: state.place?.lng || 0,
                    datetime: `${state.date}T${state.time}:00`
                };

                // Call the service
                const result = await AstrologyService.calculateChart(params, apiConfig);

                if (result.status === 200) {
                    setChartData(result.data);
                    // CRITICAL: Tell the Oracle to switch to Instrument mode
                    systemInjection = `
[SYSTEM: GEOMETRY ACQUIRED]
The chart has been calculated.
DATA: ${JSON.stringify(result.data).substring(0, 5000)}
INSTRUCTION: You are now in MODE B (Instrument). Interpret this geometry using the "Skeptic Encountering a Ghost" stance.
`;
                } else {
                    systemInjection = `[SYSTEM: ERROR] Failed to fetch chart: ${result.data?.error}. Apologize and ask for data again.`;
                }
            } else if (!state.is_complete) {
                // If not complete, check if we need to ask a specific question
                const nextInquiry = handshakeManager.getNextInquiry();
                // Only prompt for data if the user seems to be engaging in a reading
                if (nextInquiry) {
                    systemInjection = `[SYSTEM: INTAKE MODE] The user has NOT provided full birth data yet. 
If they are just chatting, stay in MODE A (Friend). 
If they seem to want a reading, the missing pieces are: ${!state.date ? 'Date' : ''} ${!state.time ? 'Time' : ''} ${!state.place ? 'Place' : ''}.
Suggested phrasing if needed: "${nextInquiry}"`;
                }
            }

            // 2. Oracle Call (Server-side so persona-law.ts is applied)
            // Switched from client-side GoogleGenAI to server-side Oracle route
            const response = await fetch('/api/oracle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        ...messages.map(m => ({ role: m.role === 'model' ? 'assistant' : m.role, content: m.content })),
                        { role: 'user', content: userMsg.content + systemInjection }
                    ]
                })
            });

            const data = await response.json();
            const text = data.choices?.[0]?.message?.content || 'Raven is silent.';

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

    return (
        <div className="flex flex-col h-full bg-slate-950 font-serif">
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[80%]">
                            {msg.role === 'model' && (
                                <div className="flex items-center text-indigo-400 mb-2">
                                    <Bird className="w-4 h-4 mr-2" />
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
                        <Bird className="w-4 h-4 mr-2" />
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
