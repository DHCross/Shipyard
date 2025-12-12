import { OracleInterface } from '../components/OracleInterface';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-slate-950 selection:bg-emerald-500/30">

      {/* Star Field (CSS-only subtle dots) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-full h-full" style={{
          backgroundImage: `radial-gradient(1px 1px at 20% 30%, rgba(148, 163, 184, 0.3) 1px, transparent 0),
                           radial-gradient(1px 1px at 60% 70%, rgba(148, 163, 184, 0.2) 1px, transparent 0),
                           radial-gradient(1px 1px at 40% 20%, rgba(148, 163, 184, 0.25) 1px, transparent 0),
                           radial-gradient(1px 1px at 80% 50%, rgba(148, 163, 184, 0.15) 1px, transparent 0),
                           radial-gradient(1px 1px at 10% 80%, rgba(148, 163, 184, 0.2) 1px, transparent 0)`,
          backgroundSize: '200px 200px'
        }}></div>
      </div>

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-[128px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-[128px] pointer-events-none"></div>

      {/* Lens Gradient (Portal effect behind interface) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
        <div className="w-full h-full rounded-full bg-gradient-radial from-indigo-900/10 via-transparent to-transparent blur-2xl"></div>
      </div>

      {/* The Mirror Content */}
      <div className="z-10 text-center space-y-8 flex flex-col items-center w-full max-w-4xl">

        {/* The Sigil / Title with breathing glow */}
        <div className="relative group cursor-default">
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/30 to-indigo-600/30 rounded-lg blur-xl opacity-40 animate-[pulse_4s_ease-in-out_infinite]"></div>
          <h1 className="relative text-5xl md:text-7xl font-sans font-thin tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-500">
            Raven Calder
          </h1>
        </div>

        {/* The Oracle Interface (Replaces static prompt) */}
        <OracleInterface />

      </div>

      {/* Footer / Coordinates */}
      <div className="absolute bottom-8 text-[10px] text-slate-700 font-mono flex space-x-4">
        <span>PHASE: AWAKENING</span>
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
