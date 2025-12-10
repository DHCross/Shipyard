import React, { useMemo } from 'react';
import { VirtualFile, ChatMessage } from '../types';
import { Scroll, Download, Activity, BookOpen, MessageSquare } from 'lucide-react';

interface ManifestViewerProps {
  files: VirtualFile[];
  messages: ChatMessage[];
}

const ManifestViewer: React.FC<ManifestViewerProps> = ({ files, messages }) => {
  const manifestFile = useMemo(() => 
    files.find(f => f.path === 'VESSEL_MANIFEST.md'), 
  [files]);

  const handleDownload = () => {
    if (manifestFile) {
      const blob = new Blob([manifestFile.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'VESSEL_MANIFEST.md';
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

  if (!manifestFile) {
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
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">Vessel Manifest</h3>
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
            Download Manifest
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div className="prose prose-invert prose-sm max-w-none font-mono">
           {/* Simple Markdown Rendering (splitting by lines for basic styling) */}
           {manifestFile.content.split('\n').map((line, i) => {
             if (line.startsWith('# ')) {
               return <h1 key={i} className="text-xl font-bold text-indigo-400 mb-4 border-b border-slate-800 pb-2">{line.replace('# ', '')}</h1>;
             }
             if (line.startsWith('## ')) {
               return <h2 key={i} className="text-lg font-bold text-emerald-400 mt-6 mb-3">{line.replace('## ', '')}</h2>;
             }
             if (line.startsWith('### ')) {
               return <h3 key={i} className="text-md font-semibold text-slate-200 mt-4 mb-2">{line.replace('### ', '')}</h3>;
             }
             if (line.startsWith('- ')) {
               return <li key={i} className="ml-4 text-slate-400 list-disc">{line.replace('- ', '')}</li>;
             }
             if (line.trim() === '') {
               return <div key={i} className="h-2"></div>;
             }
             return <p key={i} className="text-slate-300 mb-1">{line}</p>;
           })}
        </div>
        
        {/* Footer / Status */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center text-xs text-slate-500">
           <Activity className="w-3 h-3 mr-2 animate-pulse text-emerald-500" />
           Synced with Greenfield Workspace
        </div>
      </div>
    </div>
  );
};

export default ManifestViewer;