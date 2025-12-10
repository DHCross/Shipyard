import React, { useState, useEffect } from 'react';
import { Layout, Compass, Cpu, Activity, Info, FileText, Anchor } from 'lucide-react';
import RequestPanel from './components/RequestPanel';
import AnalysisPanel from './components/AnalysisPanel';
import ResponseViewer from './components/ResponseViewer';
import WorkspaceViewer from './components/WorkspaceViewer';
import ManifestViewer from './components/ManifestViewer';
import { ApiConfig, FetchedData, TabView, VirtualFile, ChatMessage, AstrolabeData } from './types';

const App: React.FC = () => {
  // Initialize with default, but try to load from localStorage on mount
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    // Changed key to v3 to force refresh of default config for users with old state
    const saved = localStorage.getItem('nexus_api_config_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved config", e);
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
  const [virtualFiles, setVirtualFiles] = useState<VirtualFile[]>([
    {
      path: 'THE_INVERSION.md',
      timestamp: Date.now(),
      content: `# THE INVERSION: Structural Realignment

## The Axiom
The error "Mirror Halted: Data Unavailable" was not a bug; it was proof that the system's center of gravity was backwards.

## The Old Law (False Mirror)
1. User Inputs Data (Math Brain)
2. Math Brain Calculates
3. Poetic Brain waits for permission to speak.
*Result:* If data is missing, the Voice is silenced. The Machinery governed the Soul.

## The New Law (Poetic Primacy)
1. Poetic Brain Speaks (The Voice is the entry point).
2. Poetic Brain determines it needs geometry.
3. Poetic Brain invokes Math Brain (or API) as a utility.
*Result:* The Voice is never halted. It is the Orchestrator. The Machinery serves the Soul.

## The Vector
We move from "Passive Dependency" to "Active Orchestration".`
    },
    {
      path: 'VESSEL_MANIFEST.md',
      timestamp: Date.now() + 50,
      content: `# VESSEL MANIFEST & BUILD LEDGER
*The Living History of the Woven Map Greenfield*

## [INITIALIZATION] The Keel is Laid
**Timestamp:** ${new Date().toISOString()}
**Phase:** 1 - Audit & Genesis
**Status:** Active

### Architectural Intent
We are building a "Greenfield" vessel. The logic of the old repository is being harvested, but the implementation is new. The "Poetic Brain" is the primary orchestrator.

### Core Systems Initialized
- [x] Constitutional Documents (THE_INVERSION.md)
- [x] Architecture Spec (ARCHITECTURE.md)
- [x] Handshake Protocol (specs/PROTOCOL_HANDSHAKE.md)
- [x] Perplexity Validation Strategy (perplexity_usage.md)
- [x] Archeological Mandate (specs/MANDATE_ARCHEOLOGY.md)

---
*Awaiting further construction logs...*
`
    },
    {
      path: 'ARCHITECTURE.md',
      timestamp: Date.now() + 100,
      content: `# ARCHITECTURE OF THE NEW VESSEL

## Core Directive
**Poetic Brain** is the primary intelligence and central orchestrator. It owns the FIELD → MAP → VOICE sequence.

## Hierarchy
1.  **Layer 1: Poetic Brain (The Orchestrator)**
    *   Direct user interface.
    *   Natural language processing (Gemini).
    *   API Orchestration (Perplexity, Astrology).
    *   Maintains the "Ritual Flow" and "Symbolic Weather".

2.  **Layer 2: The Service Layer (The Organs)**
    *   **Astrology Service:** Pure data fetching (Ephemeris, Charts).
    *   **Perplexity Service:** External knowledge grounding.
    *   **FileSystem:** Memory and context storage.

3.  **Layer 3: Math Brain (The Submodule)**
    *   *Role:* Silent Calculator.
    *   *Trigger:* Invoked ONLY when structured exports (PDF/JSON) are explicitly requested.
    *   *Constraint:* Never blocks the conversation. Never acts as a gatekeeper.

## Tech Stack & Protocol
*   **Frontend:** React (The Interface).
*   **AI Engine:** Gemini 3.0 Pro (The Mind).
*   **State:** Poetic-First. The application state is a "Conversation", not a "Form".
`
    },
    {
      path: 'perplexity_usage.md',
      timestamp: Date.now() + 200,
      content: `# Perplexity API Integration Strategy: "As Above, So Below"

## The Core Philosophy
We do not use Perplexity merely to get news. We use it to **VALIDATE** the Astrology.
*   **As Above (Astrology):** Reveals the Archetype (e.g., "Mars Square Saturn = Structural Stress").
*   **So Below (Perplexity):** Reveals the Manifestation (e.g., "Global Server Outage").

## The Validation Loop
1.  **Raven Senses:** Raven looks at the chart and sees a difficult transit.
2.  **Raven Inquires:** Raven asks Perplexity, "Is there evidence of structural failure in the world news today?"
3.  **Raven Synthesizes:** Raven speaks to the user: *"The tension you feel is real. The sky is holding a square, and the earth is mirroring it with today's outages. You are not alone in this heavy weather."*

## The Interface
The Poetic Brain calls the Oracle when the user's inquiry touches the physical world.

\`\`\`typescript
interface OracleRequest {
  query: string; // The search term designed to validate the transit
  context: "validation" | "grounding";
}
\`\`\`

## The Transformation
Raw data from Perplexity MUST pass through the "Avian Lens" before reaching the user.
`
    },
    {
      path: 'specs/PROTOCOL_HANDSHAKE.md',
      timestamp: Date.now() + 300,
      content: `# PROTOCOL: THE HANDSHAKE (SLOT MACHINE)

## OBJECTIVE
Implement a robust input validation and slot-filling mechanism for collecting birth data (date, time, place) within the Poetic Brain's conversation flow.

## FUNCTIONAL REQUIREMENT
The system must not treat data collection as a form, but as a conversational state machine. The goal is to gather all arguments required for the \`calculate_astrology_chart\` tool.

### 1. THE STATE MACHINE (Slot-Filling)
Maintain a \`HandshakeState\` object that tracks:
- **date**: Validated Date String (ISO)
- **time**: Validated Time String (HH:mm)
- **place**: Validated Lat/Long (via Geocoding)
- **is_complete**: Boolean

### 2. THE LOGIC
*   **Passive Detection:** Analyze user input for entities.
    *   User: "I was born in 1990." -> Update date (partial).
    *   User: "In Paris." -> Update place.
*   **Active Inquiry:** If \`is_complete\` is false, generate the next question based on missing slots.
    *   Missing Time: "To calculate the precise angles, I need the time of day."
    *   Missing Place: "Where were you born?"
*   **Validation:**
    *   If the user provides ambiguous data (e.g., "Springfield"), ask for clarification ("Illinois or Missouri?") before locking the slot.

### 3. THE TRIGGER
Once \`is_complete === true\`:
1.  **Stop Asking:** Do not ask for verified data again.
2.  **Execute:** Immediately call \`calculate_astrology_chart(date, time, place)\`.
3.  **Transition:** Pass the result to the Poetic Brain for narration.

### CONSTRAINT
The transition from "General Chat" to "Handshake" must be triggered by necessity. Only enter this mode if the user asks a question that requires chart data to answer truthfully.
`
    },
    {
      path: 'src/core/handshake.ts',
      timestamp: Date.now() + 400,
      content: `/**
 * HANDSHAKE STATE MACHINE
 * Implements the "Slot Machine" logic for conversational data gathering.
 */

export interface HandshakeState {
  date: string | null;  // ISO Date (YYYY-MM-DD)
  time: string | null;  // HH:MM (24hr)
  place: {
    name: string;
    lat: number;
    lng: number;
  } | null;
  is_complete: boolean;
}

export interface SlotUpdate {
  key: keyof HandshakeState;
  value: any;
  confidence: number; // 0-1
}

export class HandshakeManager {
  private state: HandshakeState;

  constructor() {
    this.state = {
      date: null,
      time: null,
      place: null,
      is_complete: false
    };
  }

  /**
   * Analyzes text to find birth data entities (Passive Detection).
   * In a real implementation, this would call an LLM or NER service.
   */
  public detectSlots(userInput: string): SlotUpdate[] {
    const updates: SlotUpdate[] = [];
    
    // Pseudo-code for detection logic
    if (userInput.match(/\\d{4}/)) {
      // updates.push({ key: 'date', value: extractDate(userInput), confidence: 0.9 });
    }
    
    return updates;
  }

  /**
   * Updates the state and checks for completion.
   */
  public update(updates: SlotUpdate[]): HandshakeState {
    updates.forEach(u => {
      if (u.confidence > 0.8) {
        (this.state as any)[u.key] = u.value;
      }
    });

    this.checkCompletion();
    return this.state;
  }

  private checkCompletion() {
    this.state.is_complete = !!(this.state.date && this.state.time && this.state.place);
  }

  /**
   * Generates the next question based on missing slots (Active Inquiry).
   * Returns null if complete.
   */
  public getNextInquiry(): string | null {
    if (this.state.is_complete) return null;

    if (!this.state.place) {
      return "Where were you standing when you entered the stream? (City of birth)";
    }
    if (!this.state.date) {
      return "And on what day did the light first touch you?";
    }
    if (!this.state.time) {
      return "To calculate the precise angles, I need the moment the clock started. What time was it?";
    }
    
    return null;
  }
}
`
    },
    {
      path: 'specs/MANDATE_ARCHEOLOGY.md',
      timestamp: Date.now() + 500,
      content: `# THE ARCHEOLOGICAL MANDATE (THE LAW OF PROVENANCE)

**TO THE ARCHITECT:** You are NOT permitted to invent "Blue Sky" ideas. You are an Archeologist-Builder. You are building a new temple using the exact stones of the old one.

## THE DANGER
Do not "hallucinate" new features, new tones, or new mechanics. The soul of this project already exists in the WovenWebApp repository. Your job is to translocate it, not reinvent it.

## THE SACRED SITES (MUST READ)
Before writing a single line of a spec, you must scrape these directories for the DNA:

*   **The Soul:** \`lib/raven/persona-law.ts\` (This is the immutable constitution).
*   **The Logic:** \`lib/server/astrology-mathbrain.js\` (This is the physics engine).
*   **The History:** \`docs/archive/01-PoeticBrain-Corpus\` (This is the architectural history).

## THE CITATION RULE
When you propose a feature in the new design, you must **Cite Your Source**.

*   **Bad:** "We should add a mood tracker." (Generic invention).
*   **Good:** "Implementing the 'Seismograph' feature, as defined in \`lib/server/astrology-mathbrain.js\`, lines 40-50." (Provenance).

## SUMMARY
If it is not in the Old Repository, it does not belong in the New Vessel unless explicitly authorized. Dig first. Build second.`
    }
  ]);
  
  // Astrolabe State (The Compass) - Lifted to App level for persistence
  const [astrolabe, setAstrolabe] = useState<AstrolabeData>({
    phase: "Phase 1: Audit & Initialization",
    horizon: "Greenfield Vessel Construction",
    bearing: "Awaiting Command",
    tasks: ["Initialize Manifest", "Scaffold Core Directory"],
    status: 'drifting'
  });

  // Function to generate the Captain's Report based on the Manifest
  const generateCaptainReport = (files: VirtualFile[]) => {
    const manifest = files.find(f => f.path === 'VESSEL_MANIFEST.md');
    let summary = "The Shipwright is online.\n\nI have detected the 'Constitutional Documents' in the Drydock.\nMy role is to build the machine (The Vessel) that Raven (The Pilot) will fly.";
    
    if (manifest) {
      // Very basic extraction of the last entry
      const lines = manifest.content.split('\n');
      let lastEntryIndex = -1;
      
      // Find the last level 2 header
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].startsWith('## [')) {
          lastEntryIndex = i;
          break;
        }
      }
      
      if (lastEntryIndex !== -1) {
        const entryTitle = lines[lastEntryIndex].replace('## ', '');
        const phaseLine = lines.find((l, i) => i > lastEntryIndex && l.startsWith('**Phase:**')) || "**Phase:** Unknown";
        
        summary = `**CAPTAIN'S REPORT**\n\n**Current Status:** Online & Synced\n**Latest Entry:** ${entryTitle}\n${phaseLine}\n\nThe Vessel Manifest is loaded. The Astrolabe is calibrated. I await your command to continue the build.`;
      }
    }
    return summary;
  };

  // Lifted Chat State (Shared between AnalysisPanel and ManifestViewer)
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'intro',
      role: 'system',
      content: generateCaptainReport(virtualFiles), // Use the dynamic report
      timestamp: Date.now(),
    }
  ]);

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
      };
      setFetchedData(errorResult);
      if (activeTab === TabView.CONFIG) {
        setActiveTab(TabView.RESPONSE);
      }
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
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
             <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Greenfield Console</div>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-slate-400">
          <span className="flex items-center space-x-1">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-mono">LINK: ACTIVE</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Column: External API Control */}
        <div className="w-1/2 flex flex-col border-r border-slate-800 bg-slate-900/30">
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab(TabView.CONFIG)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === TabView.CONFIG
                  ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              SENSOR ARRAY
            </button>
            <button
              onClick={() => setActiveTab(TabView.RESPONSE)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === TabView.RESPONSE
                  ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              TELEMETRY
            </button>
            <button
              onClick={() => setActiveTab(TabView.WORKSPACE)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === TabView.WORKSPACE
                  ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-slate-500 hover:text-emerald-300 hover:bg-emerald-900/10'
              }`}
            >
              THE DRYDOCK
            </button>
            <button
              onClick={() => setActiveTab(TabView.MANIFEST)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === TabView.MANIFEST
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
              <ResponseViewer data={fetchedData} files={virtualFiles} />
            )}
            {activeTab === TabView.WORKSPACE && (
              <WorkspaceViewer files={virtualFiles} />
            )}
            {activeTab === TabView.MANIFEST && (
              <ManifestViewer files={virtualFiles} messages={messages} />
            )}
          </div>
        </div>

        {/* Right Column: Gemini Analysis */}
        <div className="w-1/2 flex flex-col bg-slate-950">
          <div className="h-12 border-b border-slate-800 flex items-center px-6 bg-slate-900/30">
            <Cpu className="w-4 h-4 text-indigo-400 mr-2" />
            <span className="text-sm font-medium text-slate-300">Gemini 3.0 Pro (Architect)</span>
            {fetchedData && (
              <span className="ml-auto text-xs bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30">
                Context Loaded
              </span>
            )}
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <AnalysisPanel 
              fetchedData={fetchedData} 
              onConfigChange={setApiConfig}
              onTriggerFetch={handleFetch}
              onCreateFile={handleCreateFile}
              externalInput={undefined}
              onInputChange={undefined}
              virtualFiles={virtualFiles}
              messages={messages}
              setMessages={setMessages}
              astrolabe={astrolabe}
              setAstrolabe={setAstrolabe}
            />
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;