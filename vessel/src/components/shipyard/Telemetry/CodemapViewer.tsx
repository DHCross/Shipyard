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
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { VirtualFile } from '@/types';
import { FileCode, FileText, FileJson, Folder, Cog } from 'lucide-react';

interface CodemapViewerProps {
    files: VirtualFile[];
    onFileSelect: (path: string) => void;
    activePath?: string | null;
}

// Dagre setup for layouting
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 220;
const nodeHeight = 60;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? Position.Left : Position.Top;
        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

// Custom Node Component with enhanced visuals
const FileNode: React.FC<NodeProps> = ({ data }) => {
    const getIcon = (path: string) => {
        if (path.endsWith('.tsx') || path.endsWith('.ts')) return <FileCode className="w-4 h-4 text-indigo-400" />;
        if (path.endsWith('.md')) return <FileText className="w-4 h-4 text-emerald-400" />;
        if (path.endsWith('.json')) return <FileJson className="w-4 h-4 text-amber-400" />;
        if (path.endsWith('.css')) return <Cog className="w-4 h-4 text-pink-400" />;
        if (path.includes('/')) return <Folder className="w-4 h-4 text-slate-400" />;
        return <Cog className="w-4 h-4 text-slate-400" />;
    };

    // Color-coding by file type (border + glow)
    const getTypeStyle = (path: string, isActive: boolean) => {
        // Base active style override
        if (isActive) {
             return 'border-white bg-slate-800 shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105 z-10';
        }

        if (path.endsWith('.tsx') || path.endsWith('.ts')) {
            return 'border-indigo-500 bg-indigo-950/60 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]';
        }
        if (path.endsWith('.md')) {
            return 'border-emerald-500 bg-emerald-950/60 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]';
        }
        if (path.endsWith('.json')) {
            return 'border-amber-500 bg-amber-950/60 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]';
        }
        if (path.endsWith('.css')) {
            return 'border-pink-500 bg-pink-950/60 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)]';
        }
        return 'border-slate-600 bg-slate-900/60 shadow-[0_0_10px_rgba(100,116,139,0.2)] hover:shadow-[0_0_15px_rgba(100,116,139,0.4)]';
    };

    const getStatusIndicator = (status: string) => {
        switch (status) {
            case 'complete': return <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />;
            case 'in-progress': return <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />;
            case 'error': return <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />;
            default: return null;
        }
    };

    return (
        <div
            className={`relative px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${getTypeStyle(data.path, data.isActive)}`}
            onClick={() => {
                if (data.onSelect) {
                    const cleanPath = data.path.startsWith('vessel/') ? data.path.replace('vessel/', '') : data.path;
                    data.onSelect(cleanPath);
                }
            }}
            title={data.path} // Full path tooltip
        >
            <Handle type="target" position={Position.Top} className="!bg-slate-500 !border-slate-400 !w-2 !h-2" />
            {getStatusIndicator(data.status)}
            <div className="flex items-center space-x-2">
                {getIcon(data.path)}
                <span className="text-xs font-mono text-slate-200 truncate max-w-[140px]">
                    {data.label}
                </span>
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-slate-500 !border-slate-400 !w-2 !h-2" />
        </div>
    );
};

const nodeTypes = { fileNode: FileNode };

export const CodemapViewer: React.FC<CodemapViewerProps> = ({ files, onFileSelect, activePath }) => {
    // Generate nodes and edges with tree logic
    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];
        const dirMap: Record<string, string[]> = {}; // Map directory to contained files (or subdirs)

        // 1. Identify all unique directory paths from the file list
        const directories = new Set<string>();
        files.forEach(file => {
            const parts = file.path.split('/');
            // If it's deeper than root
            if (parts.length > 1) {
                // Add all intermediate directories
                let currentPath = '';
                for (let i = 0; i < parts.length - 1; i++) {
                     const part = parts[i];
                     currentPath = currentPath ? `${currentPath}/${part}` : part;
                     directories.add(currentPath);
                }
            }
        });

        // 2. Create nodes for Directories
        directories.forEach(dirPath => {
             nodes.push({
                 id: dirPath, // ID is the path
                 type: 'fileNode',
                 position: { x: 0, y: 0 },
                 data: {
                     label: dirPath.split('/').pop() || dirPath,
                     path: dirPath,
                     status: 'folder',
                     onSelect: onFileSelect, // Folders can also be selectable if we want
                     isActive: activePath === dirPath
                 }
             });
        });

        // 3. Create nodes for Files
        files.forEach((file) => {
             nodes.push({
                 id: file.path,
                 type: 'fileNode',
                 position: { x: 0, y: 0 },
                 data: {
                     label: file.path.split('/').pop() || file.path,
                     path: file.path,
                     status: 'complete',
                     onSelect: onFileSelect,
                     isActive: activePath === file.path
                 }
             });
        });

        // 4. Create Edges (Hierarchy)
        // Link files to their parent directory
        files.forEach(file => {
             const parts = file.path.split('/');
             if (parts.length > 1) {
                 const parentDir = parts.slice(0, -1).join('/');
                 edges.push({
                     id: `${parentDir}-${file.path}`,
                     source: parentDir,
                     target: file.path,
                     type: 'smoothstep',
                     animated: true,
                     style: { stroke: '#06b6d4', strokeWidth: 1.5 },
                 });
             }
        });

        // Link directories to their parent directory
        directories.forEach(dirPath => {
            const parts = dirPath.split('/');
            if (parts.length > 1) {
                const parentDir = parts.slice(0, -1).join('/');
                edges.push({
                     id: `${parentDir}-${dirPath}`,
                     source: parentDir,
                     target: dirPath,
                     type: 'smoothstep',
                     animated: true,
                     style: { stroke: '#64748b', strokeWidth: 1.5, strokeDasharray: '5,5' },
                });
            }
        });

        // 5. Apply Dagre Layout
        return getLayoutedElements(nodes, edges);
    }, [files, onFileSelect, activePath]);

    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    // Update nodes when files or selection change
    React.useEffect(() => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

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
            <ReactFlowProvider>
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
                            // Color by file type for consistency
                            const path = node.data?.path || '';
                            if (node.data?.isActive) return '#ffffff';
                            if (path.endsWith('.tsx') || path.endsWith('.ts')) return '#6366f1'; // indigo
                            if (path.endsWith('.md')) return '#10b981'; // emerald
                            if (path.endsWith('.json')) return '#f59e0b'; // amber
                            if (path.endsWith('.css')) return '#ec4899'; // pink
                            return '#64748b'; // slate
                        }}
                        className="!bg-slate-900 !border-slate-700 !rounded-lg"
                    />
                </ReactFlow>
            </ReactFlowProvider>
        </div>
    );
};
