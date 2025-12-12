import React, { useMemo, useState } from 'react';
import { VirtualFile, ChatMessage } from '@/types';
import { Scroll, Download, Activity, BookOpen, MessageSquare, FileText, Clock, Map as MapIcon, Terminal, Plus, Save, X, GitCommit, Sparkles } from 'lucide-react';

interface ManifestViewerProps {
  files: VirtualFile[];
  messages: ChatMessage[];
}

type LogTab = 'manifest' | 'changelog' | 'roadmap' | 'sessions';

const ManifestViewer: React.FC<ManifestViewerProps> = ({ files, messages }) => {
  const [activeTab, setActiveTab] = useState<LogTab>('manifest');
  const [selectedSessionPath, setSelectedSessionPath] = useState<string | null>(null);

  // New Log Entry State
  const [isEditing, setIsEditing] = useState(false);
  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogContent, setNewLogContent] = useState('');
  const [commitToGit, setCommitToGit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const manifestFile = useMemo(() =>
    files.find(f => f.path === 'README.md'),
    [files]);

  const changelogFile = useMemo(() =>
    files.find(f => f.path.toLowerCase().includes('changelog')),
    [files]);

  const roadmapFile = useMemo(() =>
    files.find(f => f.path.toLowerCase().includes('roadmap')),
    [files]);

  const sessionFiles = useMemo(() =>
    files
      .filter(f => f.path.includes('logs/sessions/session_'))
      .sort((a, b) => b.timestamp - a.timestamp), // Newest first
    [files]);

  const activeSessionFile = useMemo(() => {
    if (selectedSessionPath) {
      return sessionFiles.find(f => f.path === selectedSessionPath) || sessionFiles[0];
    }
    return sessionFiles[0];
  }, [sessionFiles, selectedSessionPath]);

  const handleDownload = () => {
    let file = manifestFile;
    if (activeTab === 'changelog') file = changelogFile;
    if (activeTab === 'roadmap') file = roadmapFile;
    if (activeTab === 'sessions') file = activeSessionFile;

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

  const handleSaveLog = async () => {
    if (!newLogTitle.trim() || !newLogContent.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/logger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newLogTitle, content: newLogContent, commit: commitToGit })
      });

      if (res.ok) {
        setIsEditing(false);
        setNewLogTitle('');
        setNewLogContent('');
        setCommitToGit(false);
        // We rely on the parent polling to pick up the new file, or we could optimistically update if we had a method.
        // For now, the Periscope interval in ShipyardBridge will detect it shortly.
      } else {
        alert('Failed to save log.');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving log.');
    } finally {
      setIsSaving(false);
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

  let activeFile = manifestFile;
  if (activeTab === 'changelog') activeFile = changelogFile;
  if (activeTab === 'roadmap') activeFile = roadmapFile;
  if (activeTab === 'sessions') activeFile = activeSessionFile;

  if (!manifestFile && !changelogFile && !roadmapFile && sessionFiles.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
        <Scroll className="w-16 h-16 mb-4 stroke-1" />
        <p className="text-sm">No Manifest Found.</p>
        <p className="text-xs mt-2">Initialize the Vessel to create the log.</p>
        {/* Allow creating a session log even if nothing else exists */}
        <button
          onClick={() => { setActiveTab('sessions'); setIsEditing(true); }}
          className="mt-4 px-4 py-2 bg-slate-800 text-slate-300 rounded text-xs hover:bg-slate-700 transition"
        >
          Create First Log
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden relative">
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
            Export Captain's Log
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
        <button
          onClick={() => setActiveTab('roadmap')}
          disabled={!roadmapFile}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'roadmap' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'} ${!roadmapFile ? 'opacity-30 cursor-not-allowed' : ''}`}
        >
          <MapIcon className="w-3 h-3 inline-block mr-1" />
          Roadmap
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'sessions' ? 'text-purple-400 border-b-2 border-purple-500 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Terminal className="w-3 h-3 inline-block mr-1" />
          Sessions
        </button>
      </div>

      {/* Session Browser Header */}
      {activeTab === 'sessions' && (
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide flex-1 mr-4">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex-shrink-0">Logs:</span>
            {sessionFiles.length === 0 && <span className="text-[10px] text-slate-600 italic">No logs yet.</span>}
            {sessionFiles.map((file) => (
              <button
                key={file.path}
                onClick={() => { setSelectedSessionPath(file.path); setIsEditing(false); }}
                className={`text-[10px] px-2 py-1 rounded border whitespace-nowrap transition-colors ${(activeSessionFile && activeSessionFile.path === file.path && !isEditing)
                  ? 'bg-purple-900/30 text-purple-300 border-purple-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
              >
                {file.path.split('/').pop()?.replace('session_', '').replace('.md', '')}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-1 text-[10px] bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>New Entry</span>
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        {activeFile ? (
          <div className="prose prose-invert prose-sm max-w-none">
            {isEditing && activeTab === 'sessions' ? (
              <div className="flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest">New Log Entry</h3>
                  <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-300"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Session Title / Focus..."
                    value={newLogTitle}
                    onChange={(e) => setNewLogTitle(e.target.value)}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <button
                    onClick={() => setNewLogContent(`# Session Analysis\n**Focus**: ${newLogTitle || 'General Maintenance'}\n\n## Key Updates\n- \n\n## Next Steps\n- `)}
                    title="Insert Template"
                    className="bg-slate-800 text-slate-400 hover:text-purple-400 border border-slate-700 rounded px-3 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  placeholder="Only the Captain's thoughts remain..."
                  value={newLogContent}
                  onChange={(e) => setNewLogContent(e.target.value)}
                  className="w-full h-64 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500 transition-colors font-mono"
                />

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <div className={`w-4 h-4 border rounded transition-colors flex items-center justify-center ${commitToGit ? 'bg-purple-600 border-purple-600' : 'border-slate-600 group-hover:border-slate-500'}`}>
                      {commitToGit && <GitCommit className="w-3 h-3 text-white" />}
                    </div>
                    <input type="checkbox" checked={commitToGit} onChange={e => setCommitToGit(e.target.checked)} className="hidden" />
                    <span className={`text-xs ${commitToGit ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-400'}`}>Commit Changes to Shipyard</span>
                  </label>
                  <button
                    onClick={handleSaveLog}
                    disabled={isSaving || !newLogTitle || !newLogContent}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
                  >
                    {isSaving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save to Disk</span>
                  </button>
                </div>
              </div>
            ) : (
              renderMarkdown(activeFile.content)
            )}
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