import React, { useMemo, useState } from 'react';
import { GithubTreeItem, VirtualFile } from '../types';
import { Folder, FolderOpen, FileCode, FileJson, FileText, FileImage, File, ChevronRight, ChevronDown, Package } from 'lucide-react';

interface CodeMapVisualizerProps {
  items?: GithubTreeItem[];
  files?: VirtualFile[];
  onSelect?: (path: string) => void;
  selectedPath?: string | null;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'blob' | 'tree';
  children: Record<string, TreeNode>;
}

const buildTree = (items?: GithubTreeItem[], files?: VirtualFile[]): TreeNode => {
  const root: TreeNode = { name: 'root', path: '', type: 'tree', children: {} };

  if (items) {
    items.forEach(item => {
      const parts = item.path.split('/');
      addToTree(root, parts, item.path, item.type === 'blob');
    });
  } else if (files) {
    files.forEach(file => {
      // Remove leading slash if present
      const cleanPath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
      const parts = cleanPath.split('/');
      addToTree(root, parts, file.path, true);
    });
  }

  return root;
};

const addToTree = (current: TreeNode, parts: string[], fullPath: string, isFile: boolean) => {
  parts.forEach((part, index) => {
    if (!current.children[part]) {
      const isLast = index === parts.length - 1;
      current.children[part] = {
        name: part,
        path: isLast ? fullPath : parts.slice(0, index + 1).join('/'),
        type: isLast && isFile ? 'blob' : 'tree',
        children: {}
      };
    }
    current = current.children[part];
  });
};

const getFileIcon = (name: string) => {
  if (name.endsWith('.tsx') || name.endsWith('.ts') || name.endsWith('.js') || name.endsWith('.jsx')) return <FileCode className="w-4 h-4 text-indigo-400" />;
  if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-amber-400" />;
  if (name.endsWith('.css') || name.endsWith('.html')) return <FileCode className="w-4 h-4 text-pink-400" />;
  if (name.endsWith('.md')) return <FileText className="w-4 h-4 text-slate-400" />;
  if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.svg')) return <FileImage className="w-4 h-4 text-purple-400" />;
  return <File className="w-4 h-4 text-slate-500" />;
};

const TreeNodeItem: React.FC<{ 
  node: TreeNode; 
  depth: number; 
  onSelect?: (path: string) => void;
  selectedPath?: string | null;
}> = ({ node, depth, onSelect, selectedPath }) => {
  const [isOpen, setIsOpen] = useState(depth < 2); // Auto-expand top levels
  const hasChildren = Object.keys(node.children).length > 0;
  const isFolder = node.type === 'tree' || hasChildren;

  // Determine if this node is selected
  const isSelected = selectedPath === node.path;

  if (node.name === 'root') {
    return (
      <div className="space-y-1">
        {(Object.values(node.children) as TreeNode[])
          .sort((a, b) => {
            // Folders first, then files
            const aIsFolder = a.type === 'tree' || Object.keys(a.children).length > 0;
            const bIsFolder = b.type === 'tree' || Object.keys(b.children).length > 0;
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            return a.name.localeCompare(b.name);
          })
          .map((child) => (
            <TreeNodeItem 
              key={child.path} 
              node={child} 
              depth={0} 
              onSelect={onSelect} 
              selectedPath={selectedPath}
            />
          ))}
      </div>
    );
  }

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      if (onSelect) onSelect(node.path);
    }
  };

  return (
    <div>
      <div 
        className={`flex items-center py-1 px-2 rounded cursor-pointer transition-colors ${depth > 0 ? 'ml-4' : ''} ${
          isSelected 
            ? 'bg-indigo-900/50 text-indigo-200 border border-indigo-500/30' 
            : 'hover:bg-slate-800'
        }`}
        onClick={handleClick}
      >
        <span className="mr-1 opacity-50">
          {isFolder ? (
            isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
          ) : <span className="w-3 block" />}
        </span>
        
        <span className="mr-2">
          {isFolder ? (
            isOpen ? <FolderOpen className="w-4 h-4 text-indigo-300" /> : <Folder className="w-4 h-4 text-slate-500" />
          ) : (
            getFileIcon(node.name)
          )}
        </span>
        
        <span className={`text-xs font-mono truncate ${isFolder ? 'font-semibold text-slate-200' : isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
          {node.name}
        </span>
      </div>
      
      {isOpen && hasChildren && (
        <div className="border-l border-slate-800 ml-[11px]">
          {(Object.values(node.children) as TreeNode[])
            .sort((a, b) => {
               const aIsFolder = a.type === 'tree' || Object.keys(a.children).length > 0;
               const bIsFolder = b.type === 'tree' || Object.keys(b.children).length > 0;
               if (aIsFolder && !bIsFolder) return -1;
               if (!aIsFolder && bIsFolder) return 1;
               return a.name.localeCompare(b.name);
            })
            .map((child) => (
              <TreeNodeItem 
                key={child.path} 
                node={child} 
                depth={depth + 1} 
                onSelect={onSelect}
                selectedPath={selectedPath}
              />
            ))}
        </div>
      )}
    </div>
  );
};

const CodeMapVisualizer: React.FC<CodeMapVisualizerProps> = ({ items, files, onSelect, selectedPath }) => {
  const tree = useMemo(() => buildTree(items, files), [items, files]);
  
  // Calculate node count for display
  const countNodes = (node: TreeNode): number => {
    let count = 0;
    if (node.name !== 'root') count++;
    Object.values(node.children).forEach(child => {
      count += countNodes(child);
    });
    return count;
  };
  const nodeCount = useMemo(() => countNodes(tree), [tree]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-2 pb-2 border-b border-slate-800 px-2 pt-2">
        <Package className="w-4 h-4 text-indigo-400 mr-2" />
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Vessel Map</h3>
        <span className="ml-auto text-[10px] text-slate-500 font-mono">{nodeCount} nodes</span>
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar p-2">
        <TreeNodeItem node={tree} depth={0} onSelect={onSelect} selectedPath={selectedPath} />
      </div>
    </div>
  );
};

export default CodeMapVisualizer;