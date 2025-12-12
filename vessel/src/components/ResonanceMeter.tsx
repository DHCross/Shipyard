"use client";

import React, { useState, useEffect, useCallback } from 'react';

// ============================================================
// TYPES
// ============================================================

export type PingResponse = 'yes' | 'no' | 'maybe' | 'unclear';
export type CheckpointType = 'hook' | 'vector' | 'aspect' | 'general' | 'repair';

interface PingRecord {
  messageId: string;
  response: PingResponse;
  checkpointType: CheckpointType;
  timestamp: number;
  note?: string;
}

interface HitRateStats {
  total: number;
  accuracyRate: number;
  clarityRate: number;
  breakdown: {
    yes: number;
    maybe: number;
    no: number;
    unclear: number;
  };
  byCheckpointType: Record<CheckpointType, {
    total: number;
    accuracyRate: number;
  }>;
}

interface ResonanceMeterProps {
  className?: string;
  sessionId?: string;
}

// ============================================================
// PING TRACKER (Local Storage Utility)
// ============================================================

const STORAGE_KEY = 'raven_ping_records';

function getPingRecords(sessionId?: string): PingRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const all: PingRecord[] = JSON.parse(raw);
    // For now, return all records. Session filtering can be added later.
    return all;
  } catch {
    return [];
  }
}

function recordPing(record: PingRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getPingRecords();
    existing.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('ping-recorded'));
  } catch {
    // Silent fail
  }
}

function calculateStats(records: PingRecord[]): HitRateStats {
  const breakdown = { yes: 0, maybe: 0, no: 0, unclear: 0 };
  const byCheckpoint: Record<CheckpointType, { yes: number; total: number }> = {
    hook: { yes: 0, total: 0 },
    vector: { yes: 0, total: 0 },
    aspect: { yes: 0, total: 0 },
    general: { yes: 0, total: 0 },
    repair: { yes: 0, total: 0 },
  };

  for (const rec of records) {
    breakdown[rec.response]++;
    byCheckpoint[rec.checkpointType].total++;
    if (rec.response === 'yes') {
      byCheckpoint[rec.checkpointType].yes++;
    }
  }

  const total = records.length;
  const yesCount = breakdown.yes;
  const maybeCount = breakdown.maybe;
  const unclearCount = breakdown.unclear;

  // Accuracy: (yes + 0.5*maybe) / (total - unclear)
  const clearTotal = total - unclearCount;
  const accuracyRate = clearTotal > 0
    ? ((yesCount + maybeCount * 0.5) / clearTotal) * 100
    : 0;

  // Clarity: (total - unclear) / total
  const clarityRate = total > 0
    ? ((total - unclearCount) / total) * 100
    : 0;

  const byCheckpointType: HitRateStats['byCheckpointType'] = {} as any;
  for (const [type, data] of Object.entries(byCheckpoint)) {
    if (data.total > 0) {
      byCheckpointType[type as CheckpointType] = {
        total: data.total,
        accuracyRate: (data.yes / data.total) * 100,
      };
    }
  }

  return {
    total,
    accuracyRate,
    clarityRate,
    breakdown,
    byCheckpointType,
  };
}

// ============================================================
// COMPONENT
// ============================================================

const ResonanceMeter: React.FC<ResonanceMeterProps> = ({
  className = '',
  sessionId,
}) => {
  const [stats, setStats] = useState<HitRateStats | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const updateStats = useCallback(() => {
    const records = getPingRecords(sessionId);
    setStats(calculateStats(records));
  }, [sessionId]);

  useEffect(() => {
    updateStats();

    const handleUpdate = () => updateStats();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('ping-recorded', handleUpdate);

    // Poll as fallback
    const interval = setInterval(updateStats, 3000);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('ping-recorded', handleUpdate);
      clearInterval(interval);
    };
  }, [updateStats]);

  // Color thresholds per spec
  const getAccuracyColor = (rate: number): string => {
    if (rate >= 75) return '#22c55e'; // Green
    if (rate >= 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const getClarityColor = (rate: number): string => {
    if (rate >= 80) return '#22c55e';
    if (rate >= 60) return '#f59e0b';
    return '#ef4444';
  };

  // Empty state
  if (!stats || stats.total === 0) {
    return (
      <div className={`resonance-meter empty ${className}`}>
        <span className="meter-icon">🎯</span>
        <span className="meter-label">Resonance</span>
        <span className="meter-value muted">Awaiting pings</span>
        <style jsx>{`
          .resonance-meter {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 14px;
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid rgba(148, 163, 184, 0.2);
            border-radius: 10px;
            font-size: 12px;
            font-family: 'Inter', system-ui, sans-serif;
            backdrop-filter: blur(8px);
          }
          .meter-icon {
            font-size: 14px;
          }
          .meter-label {
            font-weight: 500;
            color: #e2e8f0;
            letter-spacing: 0.02em;
          }
          .meter-value.muted {
            color: #64748b;
            font-weight: 400;
          }
        `}</style>
      </div>
    );
  }

  const borderColor = getAccuracyColor(stats.accuracyRate);

  return (
    <div
      className={`resonance-meter ${className}`}
      style={{ borderColor: `${borderColor}40` }}
    >
      {/* Compact top bar */}
      <div
        className="meter-main"
        onClick={() => setShowDetails(!showDetails)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setShowDetails(!showDetails)}
      >
        <span className="meter-icon">🎯</span>
        <span className="meter-label">Accuracy</span>
        <span
          className="meter-value"
          style={{ color: borderColor }}
        >
          {stats.accuracyRate.toFixed(1)}%
        </span>
        <span className="meter-count">({stats.total})</span>
        <span className="toggle-icon">{showDetails ? '▼' : '▶'}</span>
      </div>

      {/* Expanded details panel */}
      {showDetails && (
        <div className="meter-details">
          {/* Clarity rate */}
          <div className="stat-row">
            <span className="stat-label">Clarity</span>
            <span
              className="stat-value"
              style={{ color: getClarityColor(stats.clarityRate) }}
            >
              {stats.clarityRate.toFixed(1)}%
            </span>
          </div>

          {/* Breakdown grid */}
          <div className="breakdown-grid">
            <div className="breakdown-item yes">
              <span className="breakdown-icon">✓</span>
              <span className="breakdown-label">Yes</span>
              <span className="breakdown-count">{stats.breakdown.yes}</span>
            </div>
            <div className="breakdown-item maybe">
              <span className="breakdown-icon">~</span>
              <span className="breakdown-label">Maybe</span>
              <span className="breakdown-count">{stats.breakdown.maybe}</span>
            </div>
            <div className="breakdown-item no">
              <span className="breakdown-icon">✗</span>
              <span className="breakdown-label">No</span>
              <span className="breakdown-count">{stats.breakdown.no}</span>
            </div>
            <div className="breakdown-item unclear">
              <span className="breakdown-icon">?</span>
              <span className="breakdown-label">Unclear</span>
              <span className="breakdown-count">{stats.breakdown.unclear}</span>
            </div>
          </div>

          {/* Checkpoint breakdown */}
          {Object.keys(stats.byCheckpointType).length > 0 && (
            <div className="checkpoint-section">
              <div className="section-header">By Checkpoint</div>
              {Object.entries(stats.byCheckpointType).map(([type, data]) => (
                <div key={type} className="checkpoint-row">
                  <span className="checkpoint-type">{type}</span>
                  <span
                    className="checkpoint-accuracy"
                    style={{ color: getAccuracyColor(data.accuracyRate) }}
                  >
                    {data.accuracyRate.toFixed(0)}%
                  </span>
                  <span className="checkpoint-count">({data.total})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .resonance-meter {
          background: rgba(10, 10, 15, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-left-width: 2px; /* Technical accent */
          border-radius: 2px; /* Sharper corners for HUD feel */
          font-family: 'JetBrains Mono', 'Roboto Mono', monospace;
          backdrop-filter: blur(4px);
          overflow: hidden;
          min-width: 180px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          transition: border-color 0.3s ease;
        }

        .meter-main {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .meter-main:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .meter-icon {
          font-size: 12px;
          opacity: 0.8;
        }

        .meter-label {
          font-size: 10px;
          font-weight: 500;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .meter-value {
          font-size: 12px;
          font-weight: 700;
          margin-left: auto; /* Push value to right */
        }

        .meter-count {
          font-size: 9px;
          color: #475569;
        }

        .toggle-icon {
          font-size: 8px;
          color: #475569;
          margin-left: 6px;
        }

        /* DETAILS PANEL */
        .meter-details {
          padding: 10px 12px;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          background: rgba(0, 0, 0, 0.3);
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          font-size: 10px;
        }

        .stat-label {
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .breakdown-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          margin-bottom: 10px;
        }

        .breakdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 9px;
        }

        .breakdown-label {
          color: #94a3b8;
        }

        .breakdown-count {
          font-weight: 600;
          color: #e2e8f0;
        }

        .breakdown-item.yes { border-left: 2px solid #22c55e; }
        .breakdown-item.maybe { border-left: 2px solid #f59e0b; }
        .breakdown-item.no { border-left: 2px solid #ef4444; }
        .breakdown-item.unclear { border-left: 2px solid #8b5cf6; }

        .checkpoint-row {
          display: flex;
          justify-content: space-between;
          padding: 2px 0;
          font-size: 9px;
          color: #64748b;
          border-bottom: 1px dotted rgba(255, 255, 255, 0.05);
        }
        
        .checkpoint-row:last-child { border-bottom: none; }
        
        .section-header {
          font-size: 8px;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 8px 0 4px 0;
        }
      `}</style>
    </div>
  );
};

// ============================================================
// EXPORTS
// ============================================================

export { ResonanceMeter, recordPing, getPingRecords, calculateStats };
export type { PingRecord, HitRateStats, ResonanceMeterProps };
export default ResonanceMeter;
