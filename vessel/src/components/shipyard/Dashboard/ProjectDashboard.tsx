
import React, { useRef, useEffect, useState } from 'react';
import {
    Activity,
    Radio,
    Anchor,
    Map as MapIcon,
    Cpu,
    Signal,
    Terminal,
    Clock,
    Globe,
    ExternalLink,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Circle,
    Loader2,
    RotateCw
} from 'lucide-react';
import { ChatMessage, AstrolabeState } from '@/types';

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
    const [urlPath, setUrlPath] = useState('/');
    const [iframeSrc, setIframeSrc] = useState('http://localhost:3000');
    const [showRoadmap, setShowRoadmap] = useState(true);
    const [astrolabeExpanded, setAstrolabeExpanded] = useState(false);
    const [needsRefresh, setNeedsRefresh] = useState(false);

    // Trigger glow after 30 seconds of inactivity (simulates "changes detected")
    useEffect(() => {
        const timer = setTimeout(() => setNeedsRefresh(true), 30000);
        return () => clearTimeout(timer);
    }, [messages, virtualFiles]); // Reset timer on new data

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
                    <button
                        onClick={() => {
                            window.location.reload();
                        }}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all ${needsRefresh
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                            }`}
                        title="Hard Refresh Page"
                    >
                        <RotateCw className="w-3 h-3" />
                        <span className="hidden sm:inline">REFRESH</span>
                    </button>
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
            <div className="border-b border-slate-800 bg-slate-900/40 shrink-0">
                {/* Collapsed view */}
                <div
                    className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition-colors"
                    onClick={() => setAstrolabeExpanded(!astrolabeExpanded)}
                >
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

                    {/* Expand toggle + Horizon */}
                    <div className="flex items-center gap-4 text-xs">
                        <span className="text-slate-500 uppercase tracking-widest">Horizon: {astrolabe.horizon}</span>
                        {astrolabeExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                    </div>
                </div>

                {/* Expanded view - Task List */}
                {astrolabeExpanded && (
                    <div className="px-6 pb-4 border-t border-slate-800/50 animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-2 gap-6 pt-4">
                            {/* Task List */}
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-bold">Task Queue</div>
                                <div className="space-y-2">
                                    {astrolabe.tasks.map((task, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            {task.status === 'complete' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                                            {task.status === 'active' && <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
                                            {task.status === 'pending' && <Circle className="w-3.5 h-3.5 text-slate-600" />}
                                            <span className={`text-xs ${task.status === 'complete' ? 'text-slate-500 line-through' :
                                                task.status === 'active' ? 'text-indigo-300' : 'text-slate-500'
                                                }`}>
                                                {task.description}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Future Phases */}
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-bold">Roadmap</div>
                                <div className="space-y-3 text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <span className="text-emerald-400">Phase 14: Raven Chat & HUD</span>
                                        <span className="text-slate-600">— Current (Interface Polish)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500/50"></div>
                                        <span className="text-slate-400">Phase 15: The Awakening</span>
                                        <span className="text-slate-600">— Reports & Instrument Readout</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                                        <span className="text-slate-500">Phase 16: Sovereignty</span>
                                        <span className="text-slate-600">— Autonomous operation</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                                        <span className="text-slate-600">Phase 17: Expansion</span>
                                        <span className="text-slate-700">— External API</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. THE LIVE MIRROR (PREVIEW) */}
            <div className="flex-1 flex flex-col min-h-0 bg-black group">

                {/* NAVIGATION BAR */}
                <div className="h-10 border-b border-slate-800 bg-slate-900/80 flex items-center px-4 gap-3 shrink-0 backdrop-blur-sm z-20">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Globe className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono hidden sm:inline opacity-70">LOCALHOST:3000</span>
                    </div>
                    <div className="flex-1 relative group/input">
                        <input
                            type="text"
                            value={urlPath}
                            onChange={(e) => setUrlPath(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    setIframeSrc(`http://localhost:3000${urlPath}`);
                                }
                            }}
                            className="w-full bg-slate-950/50 border border-slate-800 text-slate-300 text-xs px-2 py-1 rounded-sm font-mono focus:border-indigo-500/50 focus:bg-slate-950 outline-none transition-all placeholder-slate-700"
                            placeholder="/"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowRoadmap(!showRoadmap)}
                            className={`p-1.5 rounded transition-colors ${showRoadmap ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                            title={showRoadmap ? "Hide Roadmap" : "Show Roadmap"}
                        >
                            {showRoadmap ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <div className="w-px h-3 bg-slate-800 mx-1"></div>
                        <button
                            onClick={() => {
                                const iframe = document.getElementById('vessel-preview') as HTMLIFrameElement;
                                if (iframe) iframe.src = iframe.src;
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50 rounded transition-colors"
                            title="Refresh Signal"
                        >
                            <Activity className="w-3.5 h-3.5" />
                        </button>
                        <a
                            href={iframeSrc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 rounded transition-colors"
                            title="Open in New Tab"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>

                <div className="flex-1 relative min-h-0">
                    {/* FUTURE PLAN HUD OVERLAY */}
                    <div className={`absolute bottom-6 left-6 z-10 max-w-sm pointer-events-none transition-opacity duration-300 ${showRoadmap ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-lg p-4 shadow-2xl pointer-events-auto">
                            <div className="flex items-center justify-between gap-2 mb-3 border-b border-slate-800 pb-2">
                                <div className="flex items-center gap-2">
                                    <MapIcon className="w-4 h-4 text-indigo-400" />
                                    <span className="text-xs font-bold text-slate-100 tracking-widest uppercase">Project Roadmap</span>
                                </div>
                                <button
                                    onClick={() => setShowRoadmap(false)}
                                    className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded hover:bg-slate-800"
                                    title="Dismiss"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="relative pl-4 border-l-2 border-emerald-500">
                                    <div className="text-[10px] text-emerald-400 font-mono mb-0.5">CURRENT PHASE</div>
                                    <div className="text-sm font-medium text-slate-200">{astrolabe.phase.split(':')[1] || astrolabe.phase}</div>
                                    <div className="text-xs text-slate-400 mt-1">{astrolabe.bearing}</div>
                                </div>

                                <div className="relative pl-4 border-l-2 border-indigo-500/30">
                                    <div className="text-[10px] text-indigo-400/70 font-mono mb-0.5">NEXT HORIZON</div>
                                    <div className="text-sm font-medium text-slate-400">Phase 15: The Awakening</div>
                                    <div className="text-xs text-slate-500 mt-1">Reports & Instrument Readout Integration.</div>
                                </div>

                                <div className="relative pl-4 border-l-2 border-slate-700/30">
                                    <div className="text-[10px] text-slate-500 font-mono mb-0.5">LONG TERM</div>
                                    <div className="text-sm font-medium text-slate-500">Phase 16: Sovereignty</div>
                                    <div className="text-xs text-slate-600 mt-1">Autonomous operation & self-repair.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <iframe
                        id="vessel-preview"
                        src={iframeSrc}
                        className="w-full h-full border-0 bg-white"
                        title="Vessel Preview"
                    />
                </div>
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
