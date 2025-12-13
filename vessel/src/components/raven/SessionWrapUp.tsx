'use client';

import React, { useState } from 'react';
import { X, Download, FileText, Copy, Check } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    hook?: string;
    climate?: string;
}

interface SessionWrapUpProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmEnd: () => void;
    messages: Message[];
    sessionMode: string;
    chartData?: any; // Raw V3 API response for export
}

export function SessionWrapUp({ isOpen, onClose, onConfirmEnd, messages, sessionMode, chartData }: SessionWrapUpProps) {
    const [copied, setCopied] = useState(false);
    const [exporting, setExporting] = useState(false);

    if (!isOpen) return null;

    // Generate session transcript
    const generateTranscript = (): string => {
        const header = `# Raven Calder Session Transcript
Date: ${new Date().toLocaleString()}
Mode: ${sessionMode === 'report' ? 'Structured Reading' : 'Exploratory Dialogue'}
Messages: ${messages.length}

---

`;
        const body = messages.map(msg => {
            const speaker = msg.role === 'user' ? 'You' : 'Raven';
            const badges = [msg.hook, msg.climate].filter(Boolean).join(' | ');
            const badgeLine = badges ? `[${badges}]\n` : '';
            return `**${speaker}:**\n${badgeLine}${msg.content}\n`;
        }).join('\n---\n\n');

        return header + body;
    };

    const handleCopyTranscript = async () => {
        const transcript = generateTranscript();
        try {
            await navigator.clipboard.writeText(transcript);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy transcript:', err);
        }
    };

    const handleDownloadText = () => {
        const transcript = generateTranscript();
        const blob = new Blob([transcript], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `raven-session-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDownloadPDF = async () => {
        setExporting(true);
        try {
            // For now, generate a simple HTML-to-print solution
            // A full PDF library (jsPDF, pdfmake) could be added later
            const transcript = generateTranscript();
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Raven Calder Session</title>
                        <style>
                            body { font-family: Georgia, serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                            h1 { color: #065f46; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
                            .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
                            .message { margin: 20px 0; padding: 15px; border-radius: 8px; }
                            .user { background: #eef2ff; border-left: 3px solid #6366f1; }
                            .assistant { background: #ecfdf5; border-left: 3px solid #10b981; }
                            .speaker { font-weight: bold; margin-bottom: 8px; }
                            .badges { font-size: 11px; color: #666; font-family: monospace; margin-bottom: 8px; }
                            hr { border: none; border-top: 1px solid #e5e7eb; margin: 30px 0; }
                        </style>
                    </head>
                    <body>
                        <h1>🐦‍⬛ Raven Calder Session</h1>
                        <div class="meta">
                            <div>Date: ${new Date().toLocaleString()}</div>
                            <div>Mode: ${sessionMode === 'report' ? 'Structured Reading' : 'Exploratory Dialogue'}</div>
                            <div>Messages: ${messages.length}</div>
                        </div>
                        <hr>
                        ${messages.map(msg => {
                    const speaker = msg.role === 'user' ? 'You' : 'Raven';
                    const badges = [msg.hook, msg.climate].filter(Boolean).join(' | ');
                    return `
                                <div class="message ${msg.role}">
                                    <div class="speaker">${speaker}</div>
                                    ${badges ? `<div class="badges">[${badges}]</div>` : ''}
                                    <div>${msg.content.replace(/\n/g, '<br>')}</div>
                                </div>
                            `;
                }).join('')}
                    </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
            }
        } catch (err) {
            console.error('Failed to generate PDF:', err);
        } finally {
            setExporting(false);
        }
    };

    const handleDownloadJSON = () => {
        if (!chartData) return;
        const jsonString = JSON.stringify(chartData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `raven-chart-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const messageCount = messages.length;
    const userMessages = messages.filter(m => m.role === 'user').length;
    const ravenMessages = messages.filter(m => m.role === 'assistant').length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-slate-900/95 border border-emerald-500/30 rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🐦‍⬛</span>
                        <span className="text-sm font-mono uppercase tracking-widest text-emerald-100">Session Wrap-Up</span>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-emerald-400 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Stats */}
                <div className="p-4 border-b border-emerald-500/10">
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-2xl font-mono text-emerald-400">{messageCount}</div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-500">Messages</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-2xl font-mono text-indigo-400">{userMessages}</div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-500">Your Words</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-2xl font-mono text-emerald-400">{ravenMessages}</div>
                            <div className="text-[9px] uppercase tracking-wider text-slate-500">Raven's</div>
                        </div>
                    </div>
                </div>

                {/* Export Options */}
                <div className="p-4 space-y-3">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono mb-2">Export Session</div>

                    {/* JSON Data Export - Only if chart data exists */}
                    {chartData && (
                        <button
                            onClick={handleDownloadJSON}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-900/20 hover:bg-indigo-900/30 border border-indigo-500/20 hover:border-indigo-500/40 rounded-lg transition-all text-left group"
                        >
                            <div className="bg-indigo-500/10 p-1.5 rounded-md group-hover:bg-indigo-500/20 transition-colors">
                                <FileText className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div>
                                <div className="text-sm text-indigo-200">Save Chart Data (JSON)</div>
                                <div className="text-[10px] text-indigo-400/60">Raw analysis structure for backup</div>
                            </div>
                        </button>
                    )}

                    <button
                        onClick={handleCopyTranscript}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-emerald-500/30 rounded-lg transition-all text-left"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        <div>
                            <div className="text-sm text-slate-200">{copied ? 'Copied!' : 'Copy to Clipboard'}</div>
                            <div className="text-[10px] text-slate-500">Markdown format</div>
                        </div>
                    </button>

                    <button
                        onClick={handleDownloadText}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-emerald-500/30 rounded-lg transition-all text-left"
                    >
                        <Download className="w-4 h-4 text-slate-400" />
                        <div>
                            <div className="text-sm text-slate-200">Download Markdown</div>
                            <div className="text-[10px] text-slate-500">.md file for your records</div>
                        </div>
                    </button>

                    <button
                        onClick={handleDownloadPDF}
                        disabled={exporting}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-indigo-500/30 rounded-lg transition-all text-left disabled:opacity-50"
                    >
                        <FileText className="w-4 h-4 text-slate-400" />
                        <div>
                            <div className="text-sm text-slate-200">{exporting ? 'Generating...' : 'Print / Save as PDF'}</div>
                            <div className="text-[10px] text-slate-500">Opens print dialog</div>
                        </div>
                    </button>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-emerald-500/10 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/50 transition-colors text-xs uppercase tracking-widest font-mono"
                    >
                        Continue Session
                    </button>
                    <button
                        onClick={onConfirmEnd}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-200 text-xs uppercase tracking-widest font-mono transition-all"
                    >
                        End Session
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SessionWrapUp;
