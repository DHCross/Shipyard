'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Anchor } from 'lucide-react';
import RequestPanel from '@/components/shipyard/RequestPanel';
import ProjectDashboard from '@/components/shipyard/Dashboard/ProjectDashboard';
import WorkspaceViewer from '@/components/shipyard/WorkspaceViewer';
import ManifestViewer from '@/components/shipyard/ManifestViewer';
import { ApiConfig, FetchedData, TabView, VirtualFile, ChatMessage, AstrolabeState } from '@/types';
import { TransmissionOverlay } from '@/components/shipyard/Seance/TransmissionOverlay';
import { CodemapViewer } from '@/components/shipyard/Telemetry/CodemapViewer';

const ShipyardBridge: React.FC = () => {
    // Initialize with default, but try to load from localStorage on mount
    const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('nexus_api_config_v3');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse saved config", e);
                }
            }
        }
        // Default to Astrology API instead of generic JSON placeholder
        return {
            url: 'https://best-astrology-api-natal-charts-transits-synastry.p.rapidapi.com/western_chart_data',
            method: 'POST',
            headers: [
                { key: 'x-rapidapi-key', value: '', id: 'rapid-key' },
                { key: 'x-rapidapi-host', value: 'best-astrology-api-natal-charts-transits-synastry.p.rapidapi.com', id: 'rapid-host' },
                { key: 'Content-Type', value: 'application/json', id: 'content-type' }
            ],
            body: JSON.stringify({
                "latitude": 37.7749,
                "longitude": -122.4194,
                "datetime": "1990-01-01T12:00:00Z"
            }, null, 2)
        };
    });

    // Save to localStorage whenever apiConfig changes
    useEffect(() => {
        localStorage.setItem('nexus_api_config_v3', JSON.stringify(apiConfig));
    }, [apiConfig]);

    const [fetchedData, setFetchedData] = useState<FetchedData | null>(null);

    // Pre-seed the workspace with the Constitutional Documents
    const [virtualFiles, setVirtualFiles] = useState<VirtualFile[]>([]);

    // Astrolabe State (The Compass) - Lifted to App level for persistence
    const [astrolabe, setAstrolabe] = useState<AstrolabeState>({
        phase: "Phase 16: The Stowaway Protocol",
        horizon: "Migrate Console to Internal Route",
        bearing: "Port App.tsx to /bridge",
        tasks: [
            { description: "Move Components to /shipyard", status: 'complete' },
            { description: "Create API Routes (Periscope)", status: 'complete' },
            { description: "Launch Internal Bridge", status: 'active' },
        ],
        status: 'calibrated'
    });

    // Function to generate the Captain's Report based on the Manifest
    const generateCaptainReport = (files: VirtualFile[]) => {
        // Look for README.md as the new Manifest source of truth
        const manifest = files.find(f => f.path === 'README.md') || files.find(f => f.path === 'VESSEL_MANIFEST.md');
        let summary = "The Shipwright is online.\n\nI have detected the 'Constitutional Documents' in the Drydock.\nMy role is to build the machine (The Vessel) that Raven (The Pilot) will fly.";

        if (manifest) {
            summary = `**CAPTAIN'S REPORT**\n\nThe Vessel Manifest (${manifest.path}) is loaded. The Astrolabe is calibrated. I await your command to continue the build.`;
        }
        return summary;
    };

    // Lifted Chat State (Shared between AnalysisPanel and ManifestViewer)
    const [messages, setMessages] = useState<ChatMessage[]>(() => [
        {
            id: 'intro',
            role: 'system',
            content: "Initializing Shipyard Bridge...",
            timestamp: Date.now(),
        }
    ]);

    // Update report when files change
    useEffect(() => {
        if (virtualFiles.length > 0 && messages[0].content === "Initializing Shipyard Bridge...") {
            setMessages(prev => [{
                ...prev[0],
                content: generateCaptainReport(virtualFiles)
            }]);
        }
    }, [virtualFiles]);


    const [activeTab, setActiveTab] = useState<TabView>(TabView.MANIFEST); // Start on Manifest
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateFile = (path: string, content: string) => {
        setVirtualFiles(prev => {
            // Remove existing if overwriting
            const filtered = prev.filter(f => f.path !== path);
            return [...filtered, { path, content, timestamp: Date.now() }];
        });
        // Auto-switch to workspace tab to show the creation (unless in Manifest view)
        if (activeTab !== TabView.MANIFEST) {
            setActiveTab(TabView.WORKSPACE);
        }
    };

    // Updated to accept an optional config override. 
    // This allows the AI to trigger a fetch with new settings immediately.
    const handleFetch = async (configOverride?: ApiConfig) => {
        const configToUse = configOverride || apiConfig;

        // If an override was provided, update the UI state to match
        if (configOverride) {
            setApiConfig(configOverride);
        }

        setIsLoading(true);
        const startTime = performance.now();
        try {
            const headersInit: HeadersInit = {};
            configToUse.headers.forEach((h) => {
                // Sanitize headers to prevent "Invalid name" errors from whitespace
                const cleanKey = h.key ? h.key.trim() : '';
                const cleanValue = h.value ? h.value.trim() : '';

                if (cleanKey && cleanValue) {
                    headersInit[cleanKey] = cleanValue;
                }
            });

            const options: RequestInit = {
                method: configToUse.method,
                headers: headersInit,
            };

            if (['POST', 'PUT', 'PATCH'].includes(configToUse.method) && configToUse.body) {
                options.body = configToUse.body;
            }

            const response = await fetch(configToUse.url, options);
            const contentType = response.headers.get('content-type');

            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            const endTime = performance.now();

            const result: FetchedData = {
                status: response.status,
                statusText: response.statusText,
                data: data,
                timestamp: Date.now(),
                duration: Math.round(endTime - startTime),
            };

            setFetchedData(result);
            if (activeTab === TabView.CONFIG) {
                setActiveTab(TabView.RESPONSE);
            }
            return result; // Return for async usage if needed
        } catch (error: any) {
            const errorResult: FetchedData = {
                status: 0,
                statusText: 'Network Error',
                data: { error: error.message, hint: "Check CORS policies if calling external APIs from the browser." },
                timestamp: Date.now(),
                duration: 0,
                hint: "Check CORS policies if calling external APIs from the browser."
            };
            setFetchedData(result);
            if (activeTab === TabView.CONFIG) {
                setActiveTab(TabView.RESPONSE);
            }
            return errorResult;
        } finally {
            setIsLoading(false);
        }
    };

    // ---------------------------------------------------------
    // PERISCOPE IN THE BRIDGE (API ROUTE)
    // ---------------------------------------------------------
    useEffect(() => {
        const pollFiles = async () => {
            try {
                const res = await fetch('/api/periscope'); // Internal Route
                if (res.ok) {
                    const data = await res.json();
                    if (data.files && Array.isArray(data.files) && data.files.length > 0) {
                        setVirtualFiles(prev => {
                            // Merge strategy: Create a map of existing files
                            const existingMap = new Map(prev.map(f => [f.path, f]));

                            // Update/Add files from disk
                            data.files.forEach((f: VirtualFile) => {
                                existingMap.set(f.path, f);
                            });

                            return Array.from(existingMap.values());
                        });
                    }
                }
            } catch (e) {
                // Silently fail
            }
        };

        const interval = setInterval(pollFiles, 5000); // Poll every 5 seconds
        pollFiles(); // Initial fetch
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
            <TransmissionOverlay />
            {/* Header */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center px-6 justify-between backdrop-blur-md z-10">
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/50">
                        <Anchor className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-100 tracking-wide">
                            Woven Map <span className="text-indigo-400">Shipyard</span>
                        </h1>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Greenfield Console (Internal Bridge)</div>
                    </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <span className="flex items-center space-x-1">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-mono">LINK: INTERNAL</span>
                    </span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">

                {/* Left Column: External API Control */}
                <div className="flex flex-col border-r border-slate-800 bg-slate-900/30 transition-all duration-300 ease-in-out" style={{ width: activeTab === TabView.RESPONSE ? '100%' : '35%' }}>
                    <div className="flex border-b border-slate-800">
                        <button
                            onClick={() => setActiveTab(TabView.CONFIG)}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === TabView.CONFIG
                                ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                }`}
                        >
                            SENSOR ARRAY
                        </button>
                        <button
                            onClick={() => setActiveTab(TabView.RESPONSE)}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === TabView.RESPONSE
                                ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                                }`}
                        >
                            TELEMETRY
                        </button>
                        <button
                            onClick={() => setActiveTab(TabView.WORKSPACE)}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === TabView.WORKSPACE
                                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500'
                                : 'text-slate-500 hover:text-emerald-300 hover:bg-emerald-900/10'
                                }`}
                        >
                            THE DRYDOCK
                        </button>
                        <button
                            onClick={() => setActiveTab(TabView.MANIFEST)}
                            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === TabView.MANIFEST
                                ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-500'
                                : 'text-slate-500 hover:text-amber-300 hover:bg-amber-900/10'
                                }`}
                        >
                            CAPTAIN'S LOG
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-6 scrollbar-hide">
                        {activeTab === TabView.CONFIG && (
                            <RequestPanel
                                config={apiConfig}
                                onChange={setApiConfig}
                                onFetch={() => handleFetch()}
                                isLoading={isLoading}
                            />
                        )}
                        {activeTab === TabView.RESPONSE && (
                            <CodemapViewer
                                files={virtualFiles}
                                onFileSelect={(path) => {
                                    // Switch to Workspace and highlight the file
                                    setActiveTab(TabView.WORKSPACE);
                                    // Could add scroll-to-file logic here later
                                }}
                            />
                        )}
                        {activeTab === TabView.WORKSPACE && (
                            <WorkspaceViewer
                                files={virtualFiles}
                                onUpdateFile={handleCreateFile}
                            />
                        )}
                        {activeTab === TabView.MANIFEST && (
                            <ManifestViewer files={virtualFiles} messages={messages} />
                        )}
                    </div>
                </div>

                {/* Right Column: Signal Deck (Project Dashboard) */}
                {activeTab !== TabView.RESPONSE && (
                    <div className="flex flex-col bg-slate-950 border-l border-slate-800" style={{ width: '65%' }}>
                        <ProjectDashboard
                            astrolabe={astrolabe}
                            messages={messages}
                            virtualFiles={virtualFiles}
                        />
                    </div>
                )}

            </main >
        </div >
    );
};

export default ShipyardBridge;
