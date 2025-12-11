import React, { useMemo, useState } from 'react';
import { VirtualFile, ChatMessage } from '../types';
import { Scroll, Download, Activity, BookOpen, MessageSquare, FileText, Clock } from 'lucide-react';

interface ManifestViewerProps {
  files: VirtualFile[];
  messages: ChatMessage[];
}

type LogTab = 'manifest' | 'changelog';

const ManifestViewer: React.FC<ManifestViewerProps> = ({ files, messages }) => {
  const [activeTab, setActiveTab] = useState<LogTab>('manifest');

  const manifestFile = useMemo(() =>
    files.find(f => f.path === 'README.md'),
    [files]);

  const changelogFile = useMemo(() =>
    files.find(f => f.path.toLowerCase().includes('changelog')),
    [files]);

  const handleDownload = () => {
    const file = activeTab === 'manifest' ? manifestFile : changelogFile;
    if (file) {
      const blob = new Blob([file.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.path.split('/').pop() || 'log.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleExportChat = () => {
    if (messages.length === 0) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let content = `# CAPTAIN'S LOG - SESSION TRANSCRIPT\nDate: ${new Date().toISOString()}\n\n`;

    messages.forEach(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      const role = msg.role.toUpperCase();
      content += `## [${role}] - ${time}\n${msg.content}\n\n`;
      if (msg.image) {
        content += `*[Attached Image Generated]*\n\n`;
      }
      content += `---\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SESSION_TRANSCRIPT_${timestamp}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderMarkdown = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-xl font-bold text-indigo-400 mb-4 border-b border-slate-800 pb-2 font-mono">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-lg font-bold text-emerald-400 mt-6 mb-3 font-mono">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-md font-semibold text-slate-200 mt-4 mb-2 font-mono">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-4 text-slate-400 list-disc font-sans">{line.replace('- ', '')}</li>;
      }
      if (line.startsWith('```')) {
        return <div key={i} className="text-xs text-slate-500 font-mono">{line}</div>;
      }
      if (line.trim() === '') {
        return <div key={i} className="h-2"></div>;
      }
      // Body text uses sans-serif for readability
      return <p key={i} className="text-slate-300 mb-1 font-sans leading-relaxed">{line}</p>;
    });
  };

  const activeFile = activeTab === 'manifest' ? manifestFile : changelogFile;

  if (!manifestFile && !changelogFile) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
        <Scroll className="w-16 h-16 mb-4 stroke-1" />
        <p className="text-sm">No Manifest Found.</p>
        <p className="text-xs mt-2">Initialize the Vessel to create the log.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 font-mono">Captain's Log</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExportChat}
            className="text-xs flex items-center bg-slate-800 hover:bg-slate-700 text-indigo-300 px-3 py-1.5 rounded border border-slate-700 transition-colors"
            title="Export Chat Session"
          >
            <MessageSquare className="w-3 h-3 mr-2" />
            Export Transcript
          </button>
          <button
            onClick={handleDownload}
            className="text-xs flex items-center bg-slate-800 hover:bg-slate-700 text-emerald-300 px-3 py-1.5 rounded border border-slate-700 transition-colors"
            title="Download Log"
          >
            <Download className="w-3 h-3 mr-2" />
            Download
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/30">
        <button
          onClick={() => setActiveTab('manifest')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'manifest' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <FileText className="w-3 h-3 inline-block mr-1" />
          Manifest
        </button>
        <button
          onClick={() => setActiveTab('changelog')}
          disabled={!changelogFile}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'changelog' ? 'text-amber-400 border-b-2 border-amber-500 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'} ${!changelogFile ? 'opacity-30 cursor-not-allowed' : ''}`}
        >
          <Clock className="w-3 h-3 inline-block mr-1" />
          Changelog
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        {activeFile ? (
          <div className="prose prose-invert prose-sm max-w-none">
            {renderMarkdown(activeFile.content)}
          </div>
        ) : (
          <div className="text-center text-slate-600 py-10">
            <p>No {activeTab} file found in the workspace.</p>
          </div>
        )}

        {/* Footer / Status */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center text-xs text-slate-500 font-sans">
          <Activity className="w-3 h-3 mr-2 animate-pulse text-emerald-500" />
          Synced with Greenfield Workspace
        </div>
      </div>
    </div>
  );
};

export default ManifestViewer;