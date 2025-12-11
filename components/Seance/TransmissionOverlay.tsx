import React, { useEffect, useState } from 'react';
import { Radio, Zap, X } from 'lucide-react';

export interface Transmission {
    id: string;
    content: string;
    type: 'architect' | 'system';
    timestamp: number;
}

export const TransmissionOverlay: React.FC = () => {
    const [transmission, setTransmission] = useState<Transmission | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [lastId, setLastId] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('last_transmission_id') || 'init';
        }
        return 'init';
    });

    // Seance Polling Hook
    useEffect(() => {
        const poll = async () => {
            try {
                const res = await fetch('/transmission.json', { cache: 'no-store' });
                if (res.ok) {
                    const data: Transmission = await res.json();
                    if (data.id !== lastId && data.id !== 'init') {
                        // Double check against storage to catch fast updates
                        const storedId = localStorage.getItem('last_transmission_id');
                        if (data.id === storedId) return;

                        setLastId(data.id);
                        localStorage.setItem('last_transmission_id', data.id);

                        setTransmission(data);
                        setIsVisible(true);

                        // Auto-dismiss after 10 seconds for system messages, keep Architect messages longer
                        if (data.type === 'system') {
                            setTimeout(() => setIsVisible(false), 5000);
                        }
                    }
                }
            } catch (e) {
                // The void is silent
            }
        };

        const interval = setInterval(poll, 3000); // 3 Second Pulse
        return () => clearInterval(interval);
    }, [lastId]);

    if (!isVisible || !transmission) return null;

    const isArchitect = transmission.type === 'architect';

    return (
        <div className="fixed top-6 right-6 z-[100] w-[400px] pointer-events-auto animate-in fade-in slide-in-from-right-8 duration-500">
            <div className={`
        relative overflow-hidden rounded-lg border shadow-2xl backdrop-blur-md
        ${isArchitect
                    ? 'bg-indigo-950/90 border-indigo-500/50 shadow-indigo-500/20'
                    : 'bg-slate-900/95 border-slate-700 shadow-xl'}
      `}>

                {/* Header */}
                <div className={`px-4 py-2 flex items-center justify-between border-b ${isArchitect ? 'border-indigo-500/50 bg-indigo-900/30' : 'border-slate-700 bg-slate-800/50'}`}>
                    <div className="flex items-center space-x-2">
                        <Radio className={`w-4 h-4 ${isArchitect ? 'text-indigo-300 animate-pulse' : 'text-slate-400'}`} />
                        <span className={`text-xs font-bold uppercase tracking-widest ${isArchitect ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {isArchitect ? 'Incoming Transmission: The Architect' : 'System Broadcast'}
                        </span>
                    </div>
                    <button onClick={() => setIsVisible(false)} className="text-white/50 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 relative">
                    {isArchitect && (
                        <Zap className="absolute top-4 right-4 w-12 h-12 text-indigo-500/20 rotate-12" />
                    )}
                    <p className={`text-lg md:text-xl font-serif leading-relaxed ${isArchitect ? 'text-white drop-shadow-md' : 'text-slate-200'}`}>
                        "{transmission.content}"
                    </p>
                    <div className="mt-4 text-[10px] font-mono opacity-50 text-right">
                        SIGNAL_ID: {transmission.id} • {new Date(transmission.timestamp).toLocaleTimeString()}
                    </div>
                </div>

                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 pointer-events-none" style={{ backgroundSize: '100% 4px' }}></div>
            </div>
        </div>
    );
};
