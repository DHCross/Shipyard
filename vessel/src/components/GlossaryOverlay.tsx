"use client";

import React from 'react';
import { X, Key } from 'lucide-react';

interface GlossaryOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const glossaryTerms = [
    {
        term: "Raven Calder",
        definition: "The voice you are speaking to. A poetic intelligence designed to reflect, not predict."
    },
    {
        term: "The Woven Map",
        definition: "The symbolic navigation system we use to locate pressure points."
    },
    {
        term: "The Instrument",
        definition: "The geometry engine. It calculates the sky, but only when you ask it to."
    },
    {
        term: "OSR",
        definition: '"This didn\'t land." A valid data point meaning the reflection was inaccurate.'
    },
    {
        term: "Ping",
        definition: "A request for you to confirm if a statement resonates physically or emotionally."
    }
];

export const GlossaryOverlay: React.FC<GlossaryOverlayProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Overlay Card */}
            <div
                className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-slate-900/95 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-bold text-slate-200 uppercase tracking-widest">The Key</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded hover:bg-slate-800"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Terms */}
                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                    {glossaryTerms.map((item, i) => (
                        <div key={i} className="group">
                            <dt className="text-sm font-semibold text-emerald-400 mb-1">
                                {item.term}
                            </dt>
                            <dd className="text-xs text-slate-400 leading-relaxed pl-3 border-l-2 border-slate-800 group-hover:border-emerald-500/50 transition-colors">
                                {item.definition}
                            </dd>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/50">
                    <p className="text-[10px] text-slate-600 text-center font-mono">
                        Tap outside or press ESC to close
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GlossaryOverlay;
