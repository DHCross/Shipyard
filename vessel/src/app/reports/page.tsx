'use client';

import React, { useState } from 'react';
import { Activity, User, Users, Clock, MapPin, AlertTriangle } from 'lucide-react';

/**
 * Astro Reports Page - The Instrument Room
 * Where Geometry Meets Insight
 * 
 * This page allows users to run the Chart Engine for up to two people.
 * The instrument requires birth date, time, and place.
 * Raven translates the resulting geometry into a readable mirror.
 */

interface SubjectData {
    name: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    currentLocation?: string;
}

export default function AstroReportsPage() {
    const [mode, setMode] = useState<'solo' | 'relational'>('solo');
    const [subjectA, setSubjectA] = useState<SubjectData>({
        name: '',
        birthDate: '',
        birthTime: '',
        birthPlace: ''
    });
    const [subjectB, setSubjectB] = useState<SubjectData>({
        name: '',
        birthDate: '',
        birthTime: '',
        birthPlace: ''
    });
    const [userRole, setUserRole] = useState<string>('');
    const [isRunning, setIsRunning] = useState(false);
    const [instrumentStatus, setInstrumentStatus] = useState<string | null>(null);

    const hasCompleteData = (subject: SubjectData) => {
        return subject.name && subject.birthDate && subject.birthTime && subject.birthPlace;
    };

    const hasPartialData = (subject: SubjectData) => {
        return subject.name && subject.birthDate && subject.birthPlace && !subject.birthTime;
    };

    const runInstrument = async () => {
        setIsRunning(true);
        setInstrumentStatus('Aligning instrument to coordinates...');

        // TODO: Wire to actual Chart Engine API
        await new Promise(resolve => setTimeout(resolve, 2000));

        setInstrumentStatus('Geometry received. Translating to mirror...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsRunning(false);
        setInstrumentStatus('LOCKED');
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200">
            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-900/50">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <h1 className="text-2xl font-bold tracking-tight mb-2">The Instrument Room</h1>
                    <p className="text-slate-400 text-sm">Where Geometry Meets Insight</p>
                </div>
            </div>

            {/* Explanation */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">How It Works</h2>
                    <ol className="space-y-3 text-sm text-slate-300">
                        <li className="flex gap-3">
                            <span className="text-indigo-400 font-mono">1.</span>
                            <span><strong>Input:</strong> We feed raw coordinate data (Date, Time, Place) into the Chart Engine.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-indigo-400 font-mono">2.</span>
                            <span><strong>Calculation:</strong> The engine measures planetary geometry—calculating positions, aspects, and house placements.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-indigo-400 font-mono">3.</span>
                            <span><strong>Translation:</strong> Raven translates these raw geometric pressures into a "Mirror"—a clear, testable description of the field.</span>
                        </li>
                    </ol>
                    <div className="mt-4 p-3 bg-amber-950/30 border border-amber-800/50 rounded text-xs text-amber-200 flex gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                            <strong>Data Integrity:</strong> If you don't have an exact birth time, the instrument will run in "Wide-Angle Mode,"
                            removing specific claims about life sectors (Houses) to ensure we never guess at what we cannot measure.
                        </span>
                    </div>
                </div>

                {/* Mode Selection */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => setMode('solo')}
                        className={`flex-1 p-4 rounded-lg border transition-all ${mode === 'solo'
                                ? 'bg-indigo-950/50 border-indigo-500 text-indigo-200'
                                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                    >
                        <User className="w-5 h-5 mb-2" />
                        <div className="font-semibold">Solo Mirror</div>
                        <div className="text-xs opacity-70">One person's blueprint</div>
                    </button>
                    <button
                        onClick={() => setMode('relational')}
                        className={`flex-1 p-4 rounded-lg border transition-all ${mode === 'relational'
                                ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                    >
                        <Users className="w-5 h-5 mb-2" />
                        <div className="font-semibold">Relational Mirror</div>
                        <div className="text-xs opacity-70">Two people's dynamics</div>
                    </button>
                </div>

                {/* Subject A Input */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 mb-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-400" />
                        {mode === 'relational' ? 'Subject A' : 'Subject'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Name"
                            value={subjectA.name}
                            onChange={(e) => setSubjectA({ ...subjectA, name: e.target.value })}
                            className="col-span-2 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                        />
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <input
                                type="date"
                                value={subjectA.birthDate}
                                onChange={(e) => setSubjectA({ ...subjectA, birthDate: e.target.value })}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <input
                            type="time"
                            value={subjectA.birthTime}
                            onChange={(e) => setSubjectA({ ...subjectA, birthTime: e.target.value })}
                            placeholder="Birth time (optional for wide-angle)"
                            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                        />
                        <div className="col-span-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Birth place (city, state/country)"
                                value={subjectA.birthPlace}
                                onChange={(e) => setSubjectA({ ...subjectA, birthPlace: e.target.value })}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                    {hasPartialData(subjectA) && (
                        <div className="mt-3 text-xs text-amber-400">
                            ⚠️ Wide-Angle Mode: Birth time missing. Houses and rising sign will be unavailable.
                        </div>
                    )}
                </div>

                {/* Subject B Input (Relational only) */}
                {mode === 'relational' && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 mb-4">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 text-emerald-400" />
                            Subject B
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Name"
                                value={subjectB.name}
                                onChange={(e) => setSubjectB({ ...subjectB, name: e.target.value })}
                                className="col-span-2 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                            />
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-500" />
                                <input
                                    type="date"
                                    value={subjectB.birthDate}
                                    onChange={(e) => setSubjectB({ ...subjectB, birthDate: e.target.value })}
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <input
                                type="time"
                                value={subjectB.birthTime}
                                onChange={(e) => setSubjectB({ ...subjectB, birthTime: e.target.value })}
                                className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                            />
                            <div className="col-span-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Birth place (city, state/country)"
                                    value={subjectB.birthPlace}
                                    onChange={(e) => setSubjectB({ ...subjectB, birthPlace: e.target.value })}
                                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* User Role (if not one of the subjects) */}
                {mode === 'relational' && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 mb-8">
                        <label className="text-xs text-slate-400 block mb-2">
                            Your relationship to the subjects (optional — helps frame the language)
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., observer, partner of A, friend of both"
                            value={userRole}
                            onChange={(e) => setUserRole(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                        />
                    </div>
                )}

                {/* Run Button */}
                <button
                    onClick={runInstrument}
                    disabled={isRunning || !hasCompleteData(subjectA) && !hasPartialData(subjectA)}
                    className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-3 ${isRunning
                            ? 'bg-slate-800 text-slate-400 cursor-wait'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                >
                    <Activity className={`w-5 h-5 ${isRunning ? 'animate-pulse' : ''}`} />
                    {isRunning ? 'Running Instrument...' : 'Run Chart Engine'}
                </button>

                {/* Instrument Readout (Placeholder) */}
                {instrumentStatus && (
                    <div className="mt-6 bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-xs">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            INSTRUMENT STATUS: {instrumentStatus}
                        </div>
                        <div className="text-slate-500">
                            Run ID: #WM-2025-{Date.now().toString(36).toUpperCase()} |
                            Mode: {mode === 'solo' ? 'Solo_Mirror' : 'Relational_Balance_Meter'}
                        </div>
                        <div className="text-slate-500 mt-1">
                            Data Integrity: {subjectA.birthTime ? 'High' : 'Wide-Angle (no birth time)'}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
