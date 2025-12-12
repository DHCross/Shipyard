export interface HeaderItem {
  key: string;
  value: string;
  id: string;
}

export interface ApiConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: HeaderItem[];
  body: string;
}

export interface PathOption {
  type: 'mason' | 'weaver' | 'oracle';
  title: string;
  description: string;
  rationale: string;
  command: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  image?: string; // Base64 image string for UI mockups
  threePaths?: {
    mason: PathOption;
    weaver: PathOption;
    oracle: PathOption;
  };
  timestamp: number;
}

export interface FetchedData {
  status: number;
  statusText: string;
  data: any;
  timestamp: number;
  duration: number;
  hint?: string;
}

export enum TabView {
  CONFIG = 'config',
  RESPONSE = 'response',
  WORKSPACE = 'workspace',
  MANIFEST = 'manifest',
}

export interface VirtualFile {
  path: string;
  content: string;
  timestamp: number;
}

// Navigation Dashboard State
export interface AstrolabeState {
  phase: string;      // Current Coordinates (e.g., "Phase 1: Audit")
  horizon: string;    // The Goal (e.g., "Greenfield Scaffolding")
  bearing: string;    // The Immediate Next Step (e.g., "Create src/app/layout.tsx")
  tasks: { description: string; status: 'pending' | 'active' | 'complete' }[];   // The Queue/Plan
  status: 'calibrated' | 'drifting' | 'scanning';
}

// GitHub API Types
export interface GithubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface GithubTreeResponse {
  sha: string;
  url: string;
  tree: GithubTreeItem[];
  truncated: boolean;
}