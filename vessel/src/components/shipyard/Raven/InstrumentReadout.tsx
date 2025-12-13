import React, { useMemo } from 'react';
import { Activity, ArrowRight, Zap, Waves } from 'lucide-react';

interface BalanceMeterReadoutProps {
    data: {
        magnitude?: number;
        bias?: number;
        volatility?: number;
        timestamp?: string;
    } | null;
    isLoading?: boolean;
}

const getMagnitudeLabel = (val: number) => {
    if (val >= 4.5) return { label: 'Breakpoint', color: 'text-red-400', bg: 'bg-red-500' };
    if (val >= 3.5) return { label: 'High', color: 'text-orange-400', bg: 'bg-orange-500' };
    if (val >= 1.5) return { label: 'Active', color: 'text-emerald-400', bg: 'bg-emerald-500' };
    return { label: 'Latent', color: 'text-slate-400', bg: 'bg-slate-500' };
};

const getBiasLabel = (val: number) => {
    if (val > 3) return { label: 'Strong Expansion', color: 'text-indigo-300' };
    if (val > 1) return { label: 'Expansion', color: 'text-indigo-400' };
    if (val < -3) return { label: 'Strong Contraction', color: 'text-rose-300' };
    if (val < -1) return { label: 'Contraction', color: 'text-rose-400' };
    return { label: 'Equilibrium', color: 'text-slate-300' };
};

export const InstrumentReadout: React.FC<BalanceMeterReadoutProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="w-full p-4 mb-4 rounded-lg bg-slate-900/50 border border-slate-800 animate-pulse flex items-center justify-center gap-3">
                <Activity className="w-4 h-4 text-indigo-500/50 animate-spin" />
                <span className="text-xs font-mono text-slate-500">CALIBRATING INSTRUMENTS...</span>
            </div>
        );
    }

    if (!data) return null;

    // Defaults
    const mag = data.magnitude ?? 0;
    const bias = data.bias ?? 0;
    const vol = data.volatility ?? 0;

    const magMeta = getMagnitudeLabel(mag);
    const biasMeta = getBiasLabel(bias);

    // Bias bar calculation (center is 50%)
    // Range -5 to +5 maps to 0% to 100%
    // 0 -> 50%
    // +5 -> 100%
    // -5 -> 0%
    const biasPercent = ((bias + 5) / 10) * 100;
    const clampedBias = Math.min(100, Math.max(0, biasPercent));

    return (
        <div className="w-full p-0 mb-6 rounded-lg bg-slate-900/40 border border-indigo-900/30 backdrop-blur-sm overflow-hidden group hover:border-indigo-500/30 transition-colors">
            {/* Header */}
            <div className="px-4 py-2 bg-slate-900/60 border-b border-indigo-900/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-indigo-400" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 group-hover:text-indigo-300 transition-colors">
                        Balance Meter
                    </span>
                </div>
                <div className="text-[10px] font-mono text-slate-600">
                    BM-v5.0
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 divide-x divide-indigo-900/20">
                {/* MAGNITUDE */}
                <div className="p-3 flex flex-col items-center justify-center relative">
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-wider">Magnitude</div>
                    <div className={`text-xl font-mono font-light ${magMeta.color}`}>
                        {mag.toFixed(1)} <span className="text-[10px] opacity-50">⚡</span>
                    </div>
                    <div className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-slate-800/50 mt-1 ${magMeta.color}`}>
                        {magMeta.label}
                    </div>
                    {/* Background Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
                        <div
                            className={`h-full ${magMeta.bg} opacity-50 transition-all duration-500`}
                            style={{ width: `${(mag / 5) * 100}%` }}
                        />
                    </div>
                </div>

                {/* DIRECTIONAL BIAS */}
                <div className="p-3 flex flex-col items-center justify-center relative col-span-1">
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-wider">Bias</div>
                    <div className={`text-xl font-mono font-light ${biasMeta.color} flex items-center gap-1`}>
                        {bias > 0 ? '+' : ''}{bias.toFixed(1)}
                        {bias > 1 ? <ArrowRight className="w-3 h-3 rotate-[-45deg]" /> :
                            bias < -1 ? <ArrowRight className="w-3 h-3 rotate-[135deg]" /> :
                                <div className="w-3 h-3 rounded-full border border-current opacity-30" />}
                    </div>
                    <div className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-slate-800/50 mt-1 ${biasMeta.color}`}>
                        {biasMeta.label}
                    </div>

                    {/* Center Zero Line */}
                    <div className="absolute bottom-0 left-1/2 w-px h-1 bg-slate-600 z-10"></div>
                    {/* Background Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
                        {/* We need a bar that starts from center and goes left or right */}
                        <div
                            className={`h-full absolute transition-all duration-500 ${bias > 0 ? 'bg-indigo-500' : 'bg-rose-500'} opacity-50`}
                            style={{
                                left: bias > 0 ? '50%' : `${50 + (bias / 5) * 50}%`,
                                width: `${Math.abs(bias / 5) * 50}%`
                            }}
                        />
                    </div>
                </div>

                {/* VOLATILITY */}
                <div className="p-3 flex flex-col items-center justify-center relative">
                    <div className="text-[10px] uppercase text-slate-500 font-bold mb-1 tracking-wider">Volatility</div>
                    <div className="text-xl font-mono font-light text-slate-300">
                        {vol.toFixed(1)} <span className="text-[10px] text-slate-600">~</span>
                    </div>
                    <div className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-slate-800/50 mt-1 text-slate-400">
                        {vol < 2 ? 'Stable' : vol < 4 ? 'Choppy' : 'Volatile'}
                    </div>
                </div>
            </div>
        </div>
    );
};
