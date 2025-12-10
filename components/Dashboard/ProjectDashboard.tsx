
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

            {/* 2. ASTROLABE: HEADS UP DISPLAY */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Phase & Horizon */}
                    <div className="space-y-4">
                        <div>
                            <div className="text-[10px] uppercase text-slate-500 mb-1 tracking-wider">Current Phase</div>
                            <div className="text-xl text-indigo-400 font-light flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                {astrolabe.phase}
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase text-slate-500 mb-1 tracking-wider">Horizon Goal</div>
                            <div className="text-sm text-slate-300">
                                {astrolabe.horizon}
                            </div>
                        </div>
                    </div>

                    {/* Current Bearing */}
                    <div className="bg-slate-900/50 border border-indigo-500/30 rounded-lg p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-20">
                            <Anchor className="w-12 h-12 text-indigo-500" />
                        </div>
                        <div className="text-[10px] uppercase text-indigo-400 mb-2 tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                            Active Bearing (Next Step)
                        </div>
                        <div className="text-lg text-white font-medium leading-relaxed">
                            {astrolabe.bearing}
                        </div>
                    </div>

                </div>

                {/* Task List (Mini) */}
                {astrolabe.tasks.length > 0 && (
                    <div className="mt-6">
                        <div className="text-[10px] uppercase text-slate-500 mb-2 tracking-wider">Mission Queue</div>
                        <div className="space-y-1">
                            {astrolabe.tasks.slice(0, 3).map((task, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                    <div className={`w-3 h-3 rounded-full border ${task.status === 'complete' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`} />
                                    <span className={task.status === 'complete' ? 'text-slate-500 line-through' : 'text-slate-300'}>
                                        {task.description}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 3. SIGNAL STREAM (THE LOG) */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/30 flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-slate-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Signal Stream</span>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-xs">
                    {messages.length === 0 && (
                        <div className="text-center text-slate-600 italic py-10">
                            No signals intercepted. Waiting for Architect transmission...
                        </div>
                    )}

                    {messages.map((msg, idx) => {
                        const isUser = msg.role === 'user';
                        const isSystem = msg.content.includes("SIGNAL SENT") || msg.content.includes("SYSTEM ALERT");

                        return (
                            <div key={msg.id} className={`flex gap-4 ${isUser ? 'opacity-60' : 'opacity-100'}`}>
                                {/* Time Column */}
                                <div className="w-16 text-slate-600 text-[10px] pt-1 text-right shrink-0">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </div>

                                {/* Content Column */}
                                <div className="flex-1">
                                    <div className={`flex items-center gap-2 mb-1 ${isUser ? 'text-slate-500' : isSystem ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {isUser ? <Cpu className="w-3 h-3" /> : isSystem ? <Signal className="w-3 h-3" /> : <Terminal className="w-3 h-3" />}
                                        <span className="uppercase font-bold tracking-wider text-[10px]">
                                            {isUser ? 'BRIDGE SIGNAL' : isSystem ? 'SYSTEM ALERT' : 'SHIPWRIGHT LOG'}
                                        </span>
                                    </div>
                                    <div className={`leading-relaxed whitespace-pre-wrap ${isUser ? 'text-slate-500' : 'text-slate-300'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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
