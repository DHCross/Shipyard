import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-slate-950 selection:bg-emerald-500/30">

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-[128px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-[128px] pointer-events-none"></div>

      {/* The Mirror Content */}
      <div className="z-10 text-center space-y-8 flex flex-col items-center">

        {/* The Sigil / Title */}
        <div className="relative group cursor-default">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <h1 className="relative text-5xl md:text-7xl font-sans font-thin tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-500">
            Raven Calder
          </h1>
        </div>

        {/* The Prompt */}
        <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.2em] animate-pulse">
          The Mirror is Dark
        </p>

        {/* The Input Placeholder (Interactive element to come) */}
        <div className="mt-12 w-full max-w-md mx-auto opacity-50">
          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
        </div>

      </div>

      {/* Footer / Coordinates */}
      <div className="absolute bottom-8 text-[10px] text-slate-700 font-mono flex space-x-4">
        <span>PHASE: GENESIS</span>
        <span>LAT: 0.00</span>
        <span>LON: 0.00</span>
      </div>

      {/* The Door (Bottom Right) */}
      <div className="absolute bottom-8 right-8 z-50">
        <a href="/bridge" className="text-[10px] font-mono text-slate-800 hover:text-indigo-400 transition-colors cursor-pointer uppercase tracking-widest flex items-center gap-2 group">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">Enter Shipyard</span>
          <span className="border border-slate-800 rounded px-1 group-hover:border-indigo-500">KEY</span>
        </a>
      </div>

    </main>
  );
}
