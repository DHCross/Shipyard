import React from 'react';
import { Pickaxe, Palette, Eye, ArrowRight, Play } from 'lucide-react';
import { PathOption } from '@/types';

interface ThreePathsCardProps {
    options: {
        mason: PathOption;
        weaver: PathOption;
        oracle: PathOption;
    };
    onSelect: (command: string) => void;
}

export const ThreePathsCard: React.FC<ThreePathsCardProps> = ({ options, onSelect }) => {
    const paths = [
        { data: options.mason, icon: Pickaxe, color: 'indigo', border: 'border-indigo-500/50', bg: 'bg-indigo-950/30' },
        { data: options.weaver, icon: Palette, color: 'emerald', border: 'border-emerald-500/50', bg: 'bg-emerald-950/30' },
        { data: options.oracle, icon: Eye, color: 'amber', border: 'border-amber-500/50', bg: 'bg-amber-950/30' },
    ];

    return (
        <div className="w-full my-4 space-y-3 font-sans">
            <div className="text-xs uppercase tracking-widest text-slate-500 font-bold text-center mb-2">
                ◆ The Three Paths ◆
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {paths.map((path) => (
                    <div
                        key={path.data.type}
                        className={`relative group rounded-xl border ${path.border} ${path.bg} p-4 hover:bg-slate-800 transition-all cursor-pointer overflow-hidden`}
                        onClick={() => onSelect(path.data.command)}
                    >
                        {/* Absolute Icon Back drop */}
                        <path.icon className={`absolute -bottom-4 -right-4 w-24 h-24 opacity-5 text-${path.color}-500 transform group-hover:scale-110 transition-transform`} />

                        <div className="flex items-center space-x-2 mb-2">
                            <div className={`p-1.5 rounded-lg bg-${path.color}-500/20 text-${path.color}-400`}>
                                <path.icon className="w-4 h-4" />
                            </div>
                            <h3 className={`font-bold text-sm text-${path.color}-200 uppercase tracking-wide`}>
                                {path.data.title}
                            </h3>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed mb-3 h-12 overflow-hidden">
                            {path.data.description}
                        </p>

                        <div className="text-[10px] text-slate-500 border-t border-slate-700/50 pt-2 mb-3 h-8 overflow-hidden font-mono">
                            why: {path.data.rationale}
                        </div>

                        <button className={`w-full py-1.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-700 text-slate-400 group-hover:text-white group-hover:bg-${path.color}-600 group-hover:border-${path.color}-500 transition-all flex items-center justify-center`}>
                            <span>Select Path</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
