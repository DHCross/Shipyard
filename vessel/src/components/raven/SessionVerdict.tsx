'use client';

import React, { useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, XCircle, Send, ChevronDown } from 'lucide-react';
import type { SSTClassification, OSRSubtype, TelemetryPayload } from '@/lib/telemetry/types';

interface SessionVerdictProps {
    sessionId: string;
    geometry?: {
        magnitude?: number;
        valence?: number;
        volatility?: number;
        drivers?: string[];
    };
    provenance?: {
        math_brain?: string;
        poetic_brain?: string;
        orbs?: string;
        house_sys?: string;
    };
    onSubmit?: (verdict: SSTClassification, subtype?: OSRSubtype, feedback?: string) => void;
    onClose?: () => void;
}

const VERDICTS: { id: SSTClassification; label: string; description: string; icon: React.ReactNode; color: string }[] = [
    {
        id: 'WB',
        label: 'This Fits',
        description: 'The pattern matched my experience',
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'emerald'
    },
    {
        id: 'ABE',
        label: 'Partial / Edge',
        description: 'Some resonance, but mixed or inverted',
        icon: <AlertCircle className="w-5 h-5" />,
        color: 'amber'
    },
    {
        id: 'OSR',
        label: 'This Missed',
        description: 'Outside symbolic range — didn\'t land',
        icon: <XCircle className="w-5 h-5" />,
        color: 'rose'
    }
];

const OSR_SUBTYPES: { id: OSRSubtype; label: string; description: string }[] = [
    { id: 'O-DATA', label: 'Data Issue', description: 'Birth time or location was wrong' },
    { id: 'O-CONSENT', label: 'Stopped Reading', description: 'I chose to end the session' },
    { id: 'O-INTEGRATION', label: 'Outgrown', description: 'Pattern was accurate but I\'ve moved past it' },
    { id: 'O-ANOMALY', label: 'True Miss', description: 'Genuine signal void — chart promised, I felt nothing' }
];

export function SessionVerdict({
    sessionId,
    geometry,
    provenance,
    onSubmit,
    onClose
}: SessionVerdictProps) {
    const [selectedVerdict, setSelectedVerdict] = useState<SSTClassification | null>(null);
    const [selectedSubtype, setSelectedSubtype] = useState<OSRSubtype | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showSubtypes, setShowSubtypes] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (!selectedVerdict) return;

        setIsSubmitting(true);

        // Build telemetry payload
        const payload: TelemetryPayload = {
            session_id: sessionId,
            timestamp: new Date().toISOString(),
            provenance: {
                math_brain: provenance?.math_brain || 'unknown',
                poetic_brain: provenance?.poetic_brain || 'Raven_v4',
                orbs: provenance?.orbs || 'default',
                house_sys: provenance?.house_sys || 'placidus'
            },
            input_geometry: {
                magnitude: geometry?.magnitude ?? 0,
                valence: geometry?.valence ?? 0,
                volatility: geometry?.volatility,
                active_vectors: geometry?.drivers || []
            },
            outcome: {
                sst_classification: selectedVerdict,
                sst_source: 'self',
                osr_subtype: selectedVerdict === 'OSR' ? selectedSubtype || undefined : undefined,
                user_feedback: feedback.trim() || undefined
            }
        };

        try {
            const res = await fetch('/api/telemetry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                setSubmitted(true);
                onSubmit?.(selectedVerdict, selectedSubtype || undefined, feedback);
            } else {
                console.error('[SessionVerdict] Submit failed:', data.error);
            }
        } catch (err) {
            console.error('[SessionVerdict] Error:', err);
        } finally {
            setIsSubmitting(false);
        }
    }, [sessionId, selectedVerdict, selectedSubtype, feedback, geometry, provenance, onSubmit]);

    if (submitted) {
        return (
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-lg p-6 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">Thank You</h3>
                <p className="text-sm text-slate-400">Your feedback helps calibrate the mirror.</p>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded transition-colors"
                    >
                        Close
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                How Did This Land?
            </h3>

            {/* Verdict Buttons */}
            <div className="grid grid-cols-3 gap-2">
                {VERDICTS.map((v) => (
                    <button
                        key={v.id}
                        onClick={() => {
                            setSelectedVerdict(v.id);
                            setShowSubtypes(v.id === 'OSR');
                        }}
                        className={`flex flex-col items-center p-3 rounded-lg border transition-all ${selectedVerdict === v.id
                                ? `border-${v.color}-500 bg-${v.color}-500/20 text-${v.color}-400`
                                : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                            }`}
                    >
                        <span className={selectedVerdict === v.id ? `text-${v.color}-400` : ''}>
                            {v.icon}
                        </span>
                        <span className="text-xs font-medium mt-1">{v.label}</span>
                    </button>
                ))}
            </div>

            {/* OSR Subtypes (if OSR selected) */}
            {selectedVerdict === 'OSR' && showSubtypes && (
                <div className="space-y-2">
                    <p className="text-xs text-slate-500">Why didn't it land?</p>
                    <div className="grid grid-cols-2 gap-2">
                        {OSR_SUBTYPES.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedSubtype(s.id)}
                                className={`text-left p-2 rounded border transition-all ${selectedSubtype === s.id
                                        ? 'border-rose-500/50 bg-rose-500/10 text-rose-300'
                                        : 'border-slate-700 bg-slate-800/30 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                <span className="text-xs font-medium block">{s.label}</span>
                                <span className="text-[10px] text-slate-500">{s.description}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Optional Feedback */}
            {selectedVerdict && (
                <div>
                    <label className="text-xs text-slate-500 block mb-1">
                        Any notes? (optional)
                    </label>
                    <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="What resonated or didn't..."
                        className="w-full bg-slate-800/50 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-600 resize-none"
                        rows={2}
                    />
                </div>
            )}

            {/* Submit */}
            {selectedVerdict && (
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white py-2 rounded font-medium transition-colors"
                >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                </button>
            )}

            {/* Geometry Preview (collapsed by default) */}
            {geometry && (
                <details className="text-xs text-slate-600">
                    <summary className="cursor-pointer hover:text-slate-500">
                        Session Data <ChevronDown className="w-3 h-3 inline ml-1" />
                    </summary>
                    <pre className="mt-2 p-2 bg-slate-800/30 rounded overflow-auto">
                        {JSON.stringify(geometry, null, 2)}
                    </pre>
                </details>
            )}
        </div>
    );
}

export default SessionVerdict;
