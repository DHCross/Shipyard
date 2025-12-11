import React, { useState } from 'react';
import { ApiConfig, HeaderItem } from '@/types';
import { Plus, Trash2, Play, Search, Zap, Key, Github, ArrowRight, Sparkles, Send } from 'lucide-react';

interface RequestPanelProps {
  config: ApiConfig;
  onChange: (config: ApiConfig) => void;
  onFetch: () => void;
  isLoading: boolean;
}

const PRESETS: Record<string, ApiConfig> = {
  custom: {
    url: '',
    method: 'GET',
    headers: [{ key: 'Accept', value: 'application/json', id: 'default-1' }],
    body: ''
  },
  github: {
    url: 'https://api.github.com/repos/DHCross/WovenWebApp/git/trees/main?recursive=1',
    method: 'GET',
    headers: [
      { key: 'Accept', value: 'application/vnd.github.v3+json', id: 'gh-default' }
    ],
    body: ''
  },
  astrology: {
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
  },
  perplexity: {
    url: 'https://api.perplexity.ai/chat/completions',
    method: 'POST',
    headers: [
      { key: 'Authorization', value: 'Bearer YOUR_KEY_HERE', id: 'auth' },
      { key: 'Content-Type', value: 'application/json', id: 'content-type' }
    ],
    body: JSON.stringify({
      "model": "llama-3.1-sonar-small-128k-online",
      "messages": [
        {
          "role": "system",
          "content": "Be precise and concise."
        },
        {
          "role": "user",
          "content": "Find the latest news on SpaceX starship."
        }
      ]
    }, null, 2)
  }
};

const RequestPanel: React.FC<RequestPanelProps> = ({ config, onChange, onFetch, isLoading }) => {
  const [githubPasteUrl, setGithubPasteUrl] = useState('');
  
  const updateField = (field: keyof ApiConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const addHeader = () => {
    const newHeaders = [...config.headers, { key: '', value: '', id: Math.random().toString(36).substr(2, 9) }];
    updateField('headers', newHeaders);
  };

  const removeHeader = (id: string) => {
    const newHeaders = config.headers.filter(h => h.id !== id);
    updateField('headers', newHeaders);
  };

  const updateHeader = (id: string, field: 'key' | 'value', value: string) => {
    const newHeaders = config.headers.map(h => 
      h.id === id ? { ...h, [field]: value } : h
    );
    updateField('headers', newHeaders);
  };

  const loadPreset = (key: string) => {
    if (PRESETS[key]) {
      const template = PRESETS[key];
      const newHeaders = template.headers.map(h => ({...h, id: Math.random().toString(36).substr(2, 9)}));
      onChange({
        ...template,
        headers: newHeaders
      });
    }
  };

  const handleGithubConvert = () => {
    try {
      // Robust parser for GitHub URLs including branch support
      // Supported: https://github.com/Owner/Repo
      // Supported: https://github.com/Owner/Repo/tree/branch-name
      // Supported: https://github.com/Owner/Repo/tree/feature/branch-name
      
      const cleanUrl = githubPasteUrl.trim().replace(/\/$/, '');
      const urlStr = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
      const urlObj = new URL(urlStr);
      
      if (urlObj.hostname !== 'github.com') return;

      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      // Expected: [owner, repo, "tree"?, branch_part1, branch_part2...]
      
      if (pathParts.length >= 2) {
        const owner = pathParts[0];
        const repo = pathParts[1];
        let branch = 'main';

        // Check for /tree/branch pattern
        if (pathParts.length >= 4 && pathParts[2] === 'tree') {
          // Join all remaining parts to support branches with slashes
          branch = pathParts.slice(3).join('/');
        }

        onChange({
          url: `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
          method: 'GET',
          headers: [
             { key: 'Accept', value: 'application/vnd.github.v3+json', id: 'gh-accept-' + Date.now() }
          ],
          body: ''
        });
        setGithubPasteUrl(''); 
      }
    } catch (e) {
      console.error("Invalid GitHub URL format", e);
    }
  };

  const handleHandover = () => {
    const prompt = `I have manually configured this API endpoint (Signal Source):
URL: ${config.url}
Method: ${config.method}
Headers: ${config.headers.map(h => `${h.key}: ${h.value}`).join(', ')}

Please analyze this configuration and integrate it into the 'New Vessel' architecture. This is a critical sensor input for the Ship.`;
    
    // Dispatch a custom event that App.tsx or AnalysisPanel might listen to
    const event = new CustomEvent('inject-prompt', { detail: prompt });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Card */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
        <h3 className="text-indigo-400 font-semibold mb-2 flex items-center text-xs uppercase tracking-wider">
          <Zap className="w-4 h-4 mr-2" /> Connect Sensor Array
        </h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
           <button 
             onClick={() => loadPreset('astrology')}
             className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-200 border border-slate-600 transition-colors text-left truncate flex items-center"
           >
             <Sparkles className="w-3 h-3 mr-2 text-amber-400" /> Astrology API
           </button>
           <button 
             onClick={() => loadPreset('perplexity')}
             className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-200 border border-slate-600 transition-colors text-left truncate flex items-center"
           >
             <Zap className="w-3 h-3 mr-2 text-indigo-400" /> Perplexity AI
           </button>
           <button 
             onClick={() => loadPreset('github')}
             className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-200 border border-slate-600 transition-colors text-left truncate"
           >
             <Github className="w-3 h-3 inline mr-2"/> GitHub Repo
           </button>
           <button 
             onClick={() => loadPreset('custom')}
             className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-medium text-slate-200 border border-slate-600 transition-colors text-left truncate"
           >
             🛠️ Reset / Custom
           </button>
        </div>

        {/* GitHub Converter Helper */}
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
           <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
             Convert Repository to API Signal
           </label>
           <div className="flex space-x-2">
             <input 
               type="text" 
               placeholder="https://github.com/owner/repo"
               value={githubPasteUrl}
               onChange={(e) => setGithubPasteUrl(e.target.value)}
               className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600"
             />
             <button 
               onClick={handleGithubConvert}
               disabled={!githubPasteUrl.includes('github.com')}
               className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               title="Convert to API Endpoint"
             >
               <ArrowRight className="w-4 h-4" />
             </button>
           </div>
        </div>
      </div>

      {/* URL & Method */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signal Source (Endpoint)</label>
        <div className="flex space-x-0">
          <select 
            value={config.method}
            onChange={(e) => updateField('method', e.target.value)}
            className="bg-slate-800 border-y border-l border-slate-700 rounded-l-lg px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 appearance-none"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          <input 
            type="text" 
            value={config.url}
            onChange={(e) => updateField('url', e.target.value)}
            placeholder="https://api.example.com/v1/data"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-r-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 w-full"
          />
        </div>
      </div>

      {/* Headers */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center">
            Authentication Keys (Headers) <Key className="w-3 h-3 ml-1 opacity-50"/>
          </label>
          <button onClick={addHeader} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center">
            <Plus className="w-3 h-3 mr-1" /> Add Key
          </button>
        </div>
        
        <div className="space-y-2">
          {config.headers.map((header) => (
            <div key={header.id} className="flex space-x-2 group">
              <input 
                type="text" 
                placeholder="Key Name"
                value={header.key}
                onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <input 
                type="text" 
                placeholder="Key Value"
                value={header.value}
                onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                className={`flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 ${header.key.toLowerCase().includes('key') || header.key.toLowerCase().includes('auth') ? 'text-emerald-400 font-mono' : ''}`}
              />
              <button onClick={() => removeHeader(header.id)} className="text-slate-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Body (Conditional) */}
      {['POST', 'PUT', 'PATCH'].includes(config.method) && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payload (JSON)</label>
          <textarea 
            value={config.body}
            onChange={(e) => updateField('body', e.target.value)}
            className="w-full h-48 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
            placeholder='{"key": "value"}'
          />
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-2">
        <button 
          onClick={onFetch}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg flex items-center justify-center font-semibold transition-all ${
            isLoading 
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Acquiring Signal...
            </span>
          ) : (
            <span className="flex items-center">
              <Play className="w-4 h-4 mr-2 fill-current" /> Test Sensor Signal
            </span>
          )}
        </button>

        <button 
           onClick={handleHandover}
           className="w-full py-3 rounded-lg flex items-center justify-center font-semibold text-xs bg-slate-800 border border-slate-700 text-indigo-300 hover:bg-slate-700 hover:text-white transition-all"
        >
           <Send className="w-3 h-3 mr-2" /> ✨ Handover to Architect
        </button>
      </div>

    </div>
  );
};

export default RequestPanel;