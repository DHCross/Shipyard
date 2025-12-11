import React, { useState, useCallback } from 'react';
import { VirtualFile } from '../types';
import { FileText, Clock, Copy, Check, Download, Package, FolderTree, Pencil, Eye, Save } from 'lucide-react';
import JSZip from 'jszip';
import CodeMapVisualizer from './CodeMapVisualizer';

interface WorkspaceViewerProps {
  files: VirtualFile[];
  onUpdateFile?: (path: string, content: string) => void;
}

const WorkspaceViewer: React.FC<WorkspaceViewerProps> = ({ files, onUpdateFile }) => {
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>(files.length > 0 ? files[files.length - 1] : null);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  // Auto-select newest file if none selected and strictly no selection logic active
  React.useEffect(() => {
    if (!selectedFile && files.length > 0) {
      setSelectedFile(files[files.length - 1]);
    }
  }, [files, selectedFile]);

  // Sync edit content when selected file changes
  React.useEffect(() => {
    if (selectedFile) {
      setEditContent(selectedFile.content);
    }
  }, [selectedFile]);

  const handleSelectPath = (path: string) => {
    const file = files.find(f => f.path === path);
    if (file) {
      setSelectedFile(file);
      setIsEditing(false); // Exit edit mode when switching files
    }
  };

  const handleCopy = () => {
    if (selectedFile) {
      navigator.clipboard.writeText(isEditing ? editContent : selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (selectedFile) {
      const blob = new Blob([isEditing ? editContent : selectedFile.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.path.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleSaveEdit = useCallback(() => {
    if (selectedFile && onUpdateFile && editContent !== selectedFile.content) {
      onUpdateFile(selectedFile.path, editContent);
    }
    setIsEditing(false);
  }, [selectedFile, editContent, onUpdateFile]);

  const handleToggleEdit = () => {
    if (isEditing) {
      // Saving
      handleSaveEdit();
    } else {
      // Entering edit mode
      if (selectedFile) {
        setEditContent(selectedFile.content);
      }
      setIsEditing(true);
    }
  };

  const handleDownloadZip = async () => {
    if (files.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add all workspace files
      files.forEach(file => {
        const cleanPath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
        zip.file(cleanPath, file.content);
      });

      // Generate and add codemap.json manifest
      const manifest = {
        generatedAt: new Date().toISOString(),
        fileCount: files.length,
        structure: files.map(f => f.path),
        phase: "Greenfield Scaffolding"
      };
      zip.file("codemap.json", JSON.stringify(manifest, null, 2));

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'woven-map-greenfield.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to zip files", error);
      alert("Failed to create ZIP archive.");
    } finally {
      setIsZipping(false);
    }
  };

  if (files.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
        <FileText className="w-16 h-16 mb-4 stroke-1" />
        <p className="text-sm">Workspace is empty.</p>
        <p className="text-xs mt-2">The Architect has not created any files yet.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full border border-slate-800 rounded-lg overflow-hidden bg-slate-900">
      {/* File Tree (Left) */}
      <div className="w-1/3 border-r border-slate-800 flex flex-col bg-slate-900/50 min-w-[200px]">
        <div className="p-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center font-mono">
            <FolderTree className="w-3 h-3 mr-2" />
            Structure
          </h3>
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="text-xs flex items-center bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
            title="Export Vessel (ZIP)"
          >
            <Package className="w-3 h-3 mr-1" />
            {isZipping ? 'Pkg...' : 'Export'}
          </button>
        </div>

        {/* CodeMap Visualizer */}
        <div className="flex-1 overflow-hidden">
          <CodeMapVisualizer
            files={files}
            onSelect={handleSelectPath}
            selectedPath={selectedFile?.path}
          />
        </div>
      </div>

      {/* Content Viewer (Right) */}
      <div className="flex-1 flex flex-col bg-slate-950 min-w-0">
        {selectedFile ? (
          <>
            <div className="h-10 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900">
              <span className="font-mono text-xs text-slate-300 truncate">{selectedFile.path}</span>
              <div className="flex items-center space-x-3 flex-shrink-0">
                <span className="text-[10px] text-slate-600 font-mono hidden sm:inline-block">
                  {new Date(selectedFile.timestamp).toLocaleTimeString()}
                </span>
                <div className="h-4 w-px bg-slate-800 mx-2"></div>

                {/* Edit Toggle */}
                <button
                  onClick={handleToggleEdit}
                  className={`px-2 py-1 text-[10px] font-bold uppercase rounded flex items-center transition-colors ${isEditing ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  title={isEditing ? "Save Changes" : "Edit File"}
                >
                  {isEditing ? <Save className="w-3 h-3 mr-1" /> : <Pencil className="w-3 h-3 mr-1" />}
                  {isEditing ? 'Save' : 'Edit'}
                </button>

                <button
                  onClick={handleCopy}
                  className="text-slate-500 hover:text-white transition-colors flex items-center space-x-1"
                  title="Copy Content"
                >
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                </button>
                <button
                  onClick={handleDownload}
                  className="text-slate-500 hover:text-indigo-400 transition-colors flex items-center space-x-1"
                  title="Download Single File"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
              {isEditing ? (
                <textarea
                  className="w-full h-full bg-slate-900 text-slate-300 font-mono text-xs p-2 border border-slate-700 rounded resize-none focus:outline-none focus:border-indigo-500"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  spellCheck={false}
                />
              ) : (
                <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedFile.content}
                </pre>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-600">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-xs font-sans">Select a node from the map</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceViewer;