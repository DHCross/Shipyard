import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { VirtualFile } from '@/types';
import { FileCode, FileText, FileJson, Folder, Cog } from 'lucide-react';

interface CodemapViewerProps {
    files: VirtualFile[];
    onFileSelect: (path: string) => void;
}

// Custom Node Component
const FileNode: React.FC<NodeProps> = ({ data }) => {
    const getIcon = (path: string) => {
        if (path.endsWith('.tsx') || path.endsWith('.ts')) return <FileCode className="w-4 h-4 text-indigo-400" />;
        if (path.endsWith('.md')) return <FileText className="w-4 h-4 text-emerald-400" />;
        if (path.endsWith('.json')) return <FileJson className="w-4 h-4 text-amber-400" />;
        if (path.includes('/')) return <Folder className="w-4 h-4 text-slate-400" />;
        return <Cog className="w-4 h-4 text-slate-400" />;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'complete': return 'border-emerald-500 bg-emerald-950/50';
            case 'in-progress': return 'border-amber-500 bg-amber-950/50 animate-pulse';
            case 'planned': return 'border-slate-600 bg-slate-900/50';
            case 'error': return 'border-red-500 bg-red-950/50';
            default: return 'border-indigo-500 bg-indigo-950/50';
        }
    };

    return (
        <div
            className={`px-3 py-2 rounded-lg border-2 shadow-lg cursor-pointer hover:scale-105 transition-transform ${getStatusColor(data.status)}`}
            onClick={() => {
                if (data.onSelect) {
                    const cleanPath = data.path.startsWith('vessel/') ? data.path.replace('vessel/', '') : data.path;
                    data.onSelect(cleanPath);
                }
            }}
        >
            <Handle type="target" position={Position.Top} className="!bg-slate-500 !border-slate-400" />
            <div className="flex items-center space-x-2">
                {getIcon(data.path)}
                <span className="text-xs font-mono text-slate-200 truncate max-w-[120px]">
                    {data.label}
                </span>
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !border-slate-400" />
        </div>
    );
};

const nodeTypes = { fileNode: FileNode };

export const CodemapViewer: React.FC<CodemapViewerProps> = ({ files, onFileSelect }) => {
    // Generate nodes from files
    const initialNodes: Node[] = useMemo(() => {
        return files.map((file, index) => {
            // Simple grid layout
            const cols = 4;
            const x = (index % cols) * 200 + 50;
            const y = Math.floor(index / cols) * 100 + 50;

            // Determine status (for now, all are "complete")
            const status = 'complete';

            return {
                id: file.path,
                type: 'fileNode',
                position: { x, y },
                data: {
                    label: file.path.split('/').pop() || file.path,
                    path: file.path,
                    status,
                    onSelect: onFileSelect,
                },
            };
        });
    }, [files, onFileSelect]);

    // Generate edges based on directory hierarchy
    const initialEdges: Edge[] = useMemo(() => {
        const edges: Edge[] = [];
        const dirMap: Record<string, string[]> = {};

        // Group files by directory
        files.forEach((file) => {
            const parts = file.path.split('/');
            if (parts.length > 1) {
                const dir = parts.slice(0, -1).join('/');
                if (!dirMap[dir]) dirMap[dir] = [];
                dirMap[dir].push(file.path);
            }
        });

        // Create edges from directory "parent" to children
        Object.entries(dirMap).forEach(([dir, children]) => {
            // Find first file in this dir to act as "parent" visual anchor
            const parentFile = files.find(f => f.path.startsWith(dir + '/'));
            if (parentFile && children.length > 1) {
                for (let i = 1; i < children.length; i++) {
                    edges.push({
                        id: `${children[0]}-${children[i]}`,
                        source: children[0],
                        target: children[i],
                        animated: false,
                        style: { stroke: '#475569', strokeWidth: 1 },
                    });
                }
            }
        });

        return edges;
    }, [files]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Update nodes when files change
    React.useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    if (files.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-slate-500">
                <div className="text-center">
                    <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">The Drydock is empty.</p>
                    <p className="text-xs mt-1">Create files to populate the Codemap.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-slate-950">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
                className="bg-slate-950"
            >
                <Background color="#334155" gap={20} size={1} />
                <Controls className="!bg-slate-800 !border-slate-700 !rounded-lg [&>button]:!bg-slate-700 [&>button]:!border-slate-600 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-600" />
                <MiniMap
                    nodeColor={(node) => {
                        switch (node.data?.status) {
                            case 'complete': return '#10b981';
                            case 'in-progress': return '#f59e0b';
                            case 'error': return '#ef4444';
                            default: return '#6366f1';
                        }
                    }}
                    className="!bg-slate-900 !border-slate-700"
                />
            </ReactFlow>
        </div>
    );
};
