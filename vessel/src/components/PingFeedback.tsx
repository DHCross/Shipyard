"use client";

import React, { useState, useCallback } from 'react';
import { recordPing, PingResponse, CheckpointType } from './ResonanceMeter';

// ============================================================
// TYPES
// ============================================================

interface PingFeedbackProps {
    messageId: string;
    onFeedback: (messageId: string, response: PingResponse, note?: string) => void;
    disabled?: boolean;
    checkpointType?: CheckpointType;
}

interface ResonanceOption {
    id: PingResponse;
    label: string;
    caption: string;
    icon: string;
    accentClasses: string;
}

// ============================================================
// CONFIG
// ============================================================

const RESONANCE_OPTIONS: ResonanceOption[] = [
    {
        id: 'yes',
        label: 'Strong Resonance',
        caption: 'Lands clearly and feels vivid right now.',
        icon: '✓',
        accentClasses: 'border-emerald-400/70 bg-emerald-500/10 text-emerald-200',
    },
    {
        id: 'maybe',
        label: 'Partial Resonance',
        caption: 'Some of it fits; tone or timing feels slightly off.',
        icon: '~',
        accentClasses: 'border-amber-400/70 bg-amber-500/10 text-amber-200',
    },
    {
        id: 'no',
        label: 'No Resonance',
        caption: "Doesn't connect with what's happening right now.",
        icon: '✗',
        accentClasses: 'border-slate-500/70 bg-slate-800/60 text-slate-200',
    },
];

const ACKNOWLEDGEMENTS: Record<PingResponse, string> = {
    yes: 'Noted — this one resonated strongly.',
    maybe: "Logged as partial resonance. I'll keep refining the mirror.",
    no: "Marked as no resonance. I'll adjust course on the next pass.",
    unclear: "Logged as unclear. I'll restate it with plainer language.",
};

const CHECKPOINT_PROMPTS: Record<CheckpointType, string> = {
    hook: 'How does this recognition land for you?',
    vector: 'Does this hidden push or counterweight echo your experience?',
    aspect: 'Does this high-voltage pattern resonate with what you feel?',
    repair: 'Does this repair feel true in your system?',
    general: 'How does this one land for you?',
};

// ============================================================
// COMPONENT
// ============================================================

const PingFeedback: React.FC<PingFeedbackProps> = ({
    messageId,
    onFeedback,
    disabled = false,
    checkpointType = 'general',
}) => {
    const [selectedResponse, setSelectedResponse] = useState<PingResponse | null>(null);
    const [note, setNote] = useState('');
    const [noteTouched, setNoteTouched] = useState(false);

    const handleSelect = useCallback((response: PingResponse) => {
        if (disabled) return;
        setSelectedResponse(response);
        const noteValue = response === 'no' ? note.trim() : undefined;
        onFeedback(messageId, response, noteValue);
        if (response !== 'no') {
            setNote('');
            setNoteTouched(false);
        }
    }, [disabled, messageId, note, onFeedback]);

    const handleNoteBlur = useCallback(() => {
        setNoteTouched(true);
        if (selectedResponse === 'no') {
            onFeedback(messageId, 'no', note.trim() || undefined);
        }
    }, [messageId, note, onFeedback, selectedResponse]);

    // Already submitted
    if (disabled || selectedResponse) {
        return (
            <div className="ping-feedback submitted">
                <span className="submitted-icon">✓</span>
                <span className="submitted-text">
                    {selectedResponse ? ACKNOWLEDGEMENTS[selectedResponse] : 'Resonance recorded.'}
                </span>
                <style jsx>{`
          .ping-feedback.submitted {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.25);
            border-radius: 8px;
            font-size: 11px;
            color: #6ee7b7;
          }
          .submitted-icon {
            font-size: 12px;
          }
          .submitted-text {
            font-style: italic;
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="ping-feedback">
            <p className="prompt-text">{CHECKPOINT_PROMPTS[checkpointType]}</p>

            <div className="options-row">
                {RESONANCE_OPTIONS.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelect(option.id)}
                        className={`option-btn ${option.accentClasses}`}
                        title={option.caption}
                    >
                        <span className="option-icon">{option.icon}</span>
                        <span className="option-label">{option.label}</span>
                    </button>
                ))}
            </div>

            {selectedResponse === 'no' && (
                <div className="note-section">
                    <label htmlFor={`note-${messageId}`} className="note-label">
                        What missed the mark?
                    </label>
                    <textarea
                        id={`note-${messageId}`}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        onBlur={handleNoteBlur}
                        rows={2}
                        placeholder="Optional: share what didn't land so Raven can refine..."
                        className="note-input"
                    />
                    {noteTouched && !note.trim() && (
                        <p className="note-hint">Skipping the note is fine — the tag is already recorded.</p>
                    )}
                </div>
            )}

            <style jsx>{`
        .ping-feedback {
          padding: 12px 14px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 10px;
          margin-top: 8px;
        }

        .prompt-text {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          margin-bottom: 10px;
        }

        .options-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .option-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .option-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .option-icon {
          font-weight: 700;
          font-size: 12px;
        }

        .option-label {
          font-weight: 500;
        }

        .note-section {
          margin-top: 12px;
        }

        .note-label {
          display: block;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
          margin-bottom: 6px;
        }

        .note-input {
          width: 100%;
          padding: 8px 10px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 6px;
          font-size: 12px;
          color: #e2e8f0;
          resize: none;
        }

        .note-input:focus {
          outline: none;
          border-color: rgba(16, 185, 129, 0.4);
        }

        .note-input::placeholder {
          color: #475569;
        }

        .note-hint {
          font-size: 10px;
          color: #475569;
          margin-top: 4px;
        }
      `}</style>
        </div>
    );
};

export { PingFeedback };
export type { PingFeedbackProps };
export default PingFeedback;
