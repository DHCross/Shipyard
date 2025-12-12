import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Feather, Moon, Sun, Map as MapIcon } from 'lucide-react';
import { GoogleGenAI, Content } from '@google/genai';
import { ChatMessage, ApiConfig } from '@/types';
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
                    latitude: state.place?.lat || 0, // Mock lat if 0
                    longitude: state.place?.lng || 0,
                    datetime: `${state.date}T${state.time}:00`
                };

                // Call the service
                const result = await AstrologyService.calculateChart(params, apiConfig);

                if (result.status === 200) {
                    setChartData(result.data);
                    systemInjection = `
[SYSTEM: GEOMETRY ACQUIRED]
The chart has been calculated.
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

    return (
        <div className="flex flex-col h-full bg-slate-950 font-serif">
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
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
