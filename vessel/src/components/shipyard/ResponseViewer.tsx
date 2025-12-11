import React, { useState, useEffect } from 'react';
import { FetchedData, GithubTreeResponse, VirtualFile } from '@/types';
import { AlertCircle, Clock, Database, Code2, FileJson, ArrowRight, Cpu, Globe, Zap, Eye, Activity, Map } from 'lucide-react';
import CodeMapVisualizer from './CodeMapVisualizer';

interface ResponseViewerProps {
  data: FetchedData | null;
  files?: VirtualFile[];
}

const ResponseViewer: React.FC<ResponseViewerProps> = ({ data, files }) => {
  const [viewMode, setViewMode] = useState<'json' | 'map'>('json');
  // New state to toggle between Signal (External) and Map (Internal) when both are available
  const [telemetrySource, setTelemetrySource] = useState<'signal' | 'vessel'>('signal');

  // Auto-detect response type or missing signal
  useEffect(() => {
    if (data) {
       // If we have data, default to showing the signal, but respect previous specific view mode
       setTelemetrySource('signal');
       if (data.data && Array.isArray(data.data.tree)) {
         setViewMode('map');
       } else {
         setViewMode('json');
       }
    } else {
       // No data, default to vessel map
       setTelemetrySource('vessel');
    }
  }, [data]);

  // Render Vessel Map (Internal Telemetry)
  const renderVesselMap = () => {
    if (!files || files.length === 0) return null;
    return (
      <div className="h-full flex flex-col">
         <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest flex items-center">
               <Activity className="w-3 h-3 mr-2" /> Vessel Structure (Live)
            </span>
            <span className="text-[10px] text-slate-500">{files.length} Files</span>
         </div>
         <div className="flex-1 overflow-auto bg-slate-900/30">
           <CodeMapVisualizer files={files} />
         </div>
      </div>
    );
  };

  // If we strictly have no data, show the Vessel Map or Placeholder
  if (!data) {
    if (files && files.length > 0) {
       return (
         <div className="h-full flex flex-col">
             <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-2 px-1">
               <span className="text-[10px] text-slate-500 font-mono">Telemetry Source: INTERNAL</span>
               <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-emerald-400 font-bold">VESSEL MAP</span>
               </div>
             </div>
             <div className="flex-1 border border-slate-800 rounded-lg bg-slate-900/50 overflow-hidden">
                {renderVesselMap()}
             </div>
         </div>
       );
    }

    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center select-none">
        
        {/* Architecture Visualization */}
        <div className="relative w-full max-w-sm aspect-square mb-8 opacity-90">
           {/* Center: The Integration */}
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-600 shadow-xl">
                 <Database className="w-8 h-8 text-slate-400" />
              </div>
              <span className="mt-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-900/80 px-2 py-1 rounded">Telemetry</span>
           </div>

           {/* Top: Raven (Analysis) */}
           <div className="absolute top-0 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
              <div className="w-12 h-12 bg-indigo-900/50 rounded-xl flex items-center justify-center border border-indigo-500/30 animate-pulse">
                 <Cpu className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="mt-2 text-xs font-bold text-indigo-400">Raven (Brain)</span>
           </div>

           {/* Left: Request (Math) */}
           <div className="absolute left-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                 <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <span className="mt-2 text-xs font-bold text-slate-400">Sensor (Hand)</span>
           </div>

           {/* Right: The Field (API) */}
           <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col items-center">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                 <Globe className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="mt-2 text-xs font-bold text-emerald-400">The Field (API)</span>
           </div>

           {/* Connecting Lines (SVG) */}
           <svg className="absolute inset-0 w-full h-full pointer-events-none text-slate-700" style={{ zIndex: 0 }}>
              {/* Raven -> Request */}
              <path d="M140 30 Q 60 30 60 110" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
              {/* Request -> Field */}
              <path d="M90 150 L 290 150" fill="none" stroke="currentColor" strokeWidth="2" />
              {/* Field -> Response */}
              <path d="M320 180 Q 320 200 220 200" fill="none" stroke="currentColor" strokeWidth="2" />
              {/* Response -> Raven */}
              <path d="M190 150 Q 190 80 190 60" fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrow)" />
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="currentColor" />
                </marker>
              </defs>
           </svg>
        </div>

        <div className="max-w-md space-y-2">
           <h3 className="text-lg font-medium text-slate-200">System Standby</h3>
           <p className="text-sm text-slate-400 leading-relaxed">
             Waiting for Sensor Signal or Vessel Construction. <br/>
             Use the <strong>Sensor Array</strong> to fetch external data, or instruct the Architect to build to see internal telemetry.
           </p>
        </div>
      </div>
    );
  }

  const isError = data.status >= 400 || data.status === 0;
  const isGithubTree = data.data && Array.isArray(data.data.tree);

  return (
    <div className="flex flex-col h-full space-y-4">
      
      {/* Telemetry Source Toggles */}
      <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-lg border border-slate-800 w-full">
         <button
            onClick={() => setTelemetrySource('signal')}
            className={`flex-1 flex items-center justify-center px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
               telemetrySource === 'signal' 
               ? 'bg-indigo-600 text-white shadow-sm' 
               : 'text-slate-500 hover:text-slate-300'
            }`}
         >
            <Zap className="w-3 h-3 mr-1.5" /> Signal Data {isError && '(Error)'}
         </button>
         <button
            onClick={() => setTelemetrySource('vessel')}
            disabled={!files || files.length === 0}
            className={`flex-1 flex items-center justify-center px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
               telemetrySource === 'vessel' 
               ? 'bg-emerald-600 text-white shadow-sm' 
               : 'text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
         >
            <Activity className="w-3 h-3 mr-1.5" /> Vessel Map
         </button>
      </div>

      {telemetrySource === 'vessel' ? (
        <div className="flex-1 border border-slate-800 rounded-lg bg-slate-900/50 overflow-hidden">
           {renderVesselMap()}
        </div>
      ) : (
        <>
          {/* Status Bar */}
          <div className={`flex-shrink-0 flex items-center justify-between p-3 rounded-lg border ${
            isError 
              ? 'bg-red-500/10 border-red-500/30 text-red-400' 
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <div className="flex items-center space-x-3">
              {isError ? <AlertCircle className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              <span className="font-mono font-bold">{data.status} {data.statusText}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs opacity-75">
              <Clock className="w-3 h-3" />
              <span>{data.duration}ms</span>
            </div>
          </div>

          {/* View Toggles (JSON vs Code Map for External Signals) */}
          {isGithubTree && (
            <div className="flex-shrink-0 flex bg-slate-900 rounded-lg p-1 border border-slate-800 w-fit">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3 h-3 mr-1.5" />
                Code Map
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`flex items-center px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  viewMode === 'json' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileJson className="w-3 h-3 mr-1.5" />
                Raw JSON
              </button>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 relative min-h-0">
            {viewMode === 'map' && isGithubTree ? (
              <CodeMapVisualizer items={(data.data as GithubTreeResponse).tree} />
            ) : (
              <>
                <div className="absolute top-2 right-2 z-10 p-2 pointer-events-none">
                   <span className="text-[10px] text-slate-500 font-mono uppercase bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                     Raw Response
                   </span>
                </div>
                <pre className="w-full h-full bg-slate-900 border border-slate-800 rounded-lg p-4 overflow-auto text-xs font-mono text-slate-300 leading-relaxed custom-scrollbar">
                  {JSON.stringify(data.data, null, 2)}
                </pre>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ResponseViewer;