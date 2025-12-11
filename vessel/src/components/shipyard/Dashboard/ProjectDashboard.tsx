
import React, { useRef, useEffect } from 'react';
import {
    Activity,
    Radio,
    Anchor,
    Map as MapIcon,
    Cpu,
    Signal,
    Terminal,
    Clock
} from 'lucide-react';
import { ChatMessage, AstrolabeState } from '../../types';

interface ProjectDashboardProps {
    astrolabe: AstrolabeState;
    messages: ChatMessage[];
    virtualFiles: any[];
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
    astrolabe,
    messages,
    virtualFiles
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of log
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const getLastSignal = () => {
        const lastMsg = messages[messages.length - 1];
        return lastMsg ? lastMsg.timestamp : Date.now();
    };

    return (
        <div className="h-full flex flex-col bg-slate-950 text-slate-300 font-mono text-sm">

            {/* 1. HEADER: MISSION CONTROL */}
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold tracking-widest text-slate-100">SIGNAL DECK</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                        <Radio className="w-3 h-3" />
                        <span>BRIDGE ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>T-{Math.floor(Date.now() / 1000)}</span>
                    </div>
                </div>
            </div>

            {/* 2. ASTROLABE: COMPACT HEADS UP DISPLAY */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-400" />
                        <span className="text-slate-200 font-medium">{astrolabe.phase}</span>
                    </div>
                    <div className="h-4 w-px bg-slate-700"></div>
                    <div className="flex items-center gap-2">
                        <Anchor className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-400 text-xs">NEXT:</span>
                        <span className="text-emerald-300 text-sm">{astrolabe.bearing}</span>
                    </div>
                </div>

                {/* Compact Task Status */}
                <div className="flex items-center gap-4 text-xs">
                    <span className="text-slate-500 uppercase tracking-widest">Horizon: {astrolabe.horizon}</span>
                </div>
            </div>

            {/* 3. THE LIVE MIRROR (PREVIEW) */}
            <div className="flex-1 flex flex-col min-h-0 relative bg-black">
                <div className="absolute top-3 right-3 z-10">
                    <button
                        onClick={() => {
                            const iframe = document.getElementById('vessel-preview') as HTMLIFrameElement;
                            if (iframe) iframe.src = iframe.src;
                        }}
                        className="bg-slate-900/80 hover:bg-indigo-600 text-white p-2 rounded-full border border-slate-700 transition-all shadow-lg backdrop-blur-sm"
                        title="Refresh Signal"
                    >
                        <Activity className="w-4 h-4" />
                    </button>
                </div>

                <iframe
                    id="vessel-preview"
                    src="http://localhost:3000"
                    className="w-full h-full border-0"
                    title="Vessel Preview"
                />
            </div>

            {/* 4. FOOTER STATS */}
            <div className="h-10 border-t border-slate-800 bg-slate-900 px-6 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider">
                <div>
                    Est. Velocity: <span className="text-emerald-500">NOMINAL</span>
                </div>
                <div>
                    Files: <span className="text-slate-300">{virtualFiles.length}</span>
                </div>
            </div>

        </div>
    );
};

export default ProjectDashboard;
