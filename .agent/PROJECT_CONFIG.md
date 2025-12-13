# Shipyard Project Configuration

This file provides persistent context about the project structure, components, and key references.
Read this at the start of each session to understand the codebase.

---

## Project Identity

**Repository**: Shipyard  
**Primary Application**: `vessel/` (Next.js 16)  
**Purpose**: Raven Calder - Astrological Pattern Interpreter ("Poetic Brain")

---

## Key Architecture

### The Inversion (Core Principle)
- **Poetic Brain (Raven)** is the sovereign entry point
- **Math Brain (AstroAPI)** is a subordinate tool called on-demand
- User interacts with Raven first; geometry is fetched only when needed

### Dual-Brain System
| Brain | Role | API |
|-------|------|-----|
| **Poetic** | Interpretation, Symbolic Language | `/api/oracle` → Perplexity |
| **Math** | Geometry, Calculations | `/api/astrology` → AstroAPI V3 |

---

## Component Map

### Frontend (`vessel/src/components/`)

| Component | Purpose |
|-----------|---------|
| `OracleInterface.tsx` | Main chat UI with Raven. Handles message flow, chart injection, session state. |
| `raven/LensAlignmentCard.tsx` | Birth data entry form. City search, time handling, Manual Synastry Mode, Relocation. |
| `raven/ProfileVault.tsx` | Side panel for saved profiles. Multi-select for synastry. Import/Export JSON. |

### API Routes (`vessel/src/app/api/`)

| Route | Purpose |
|-------|---------|
| `/api/oracle` | Perplexity chat endpoint with Raven persona. Accepts `chartContext` for geometry injection. |
| `/api/astrology` | Proxy to AstroAPI V3. Handles city lookup, natal reports, transits. |
| `/api/geocode` | City → lat/long. AstroAPI first, **Perplexity fallback** if not found. |
| `/api/periscope` | Codebase scan for telemetry (lists all source files). |
| `/api/signal` | User signal logging. |

### Persona Law (`vessel/src/lib/raven/persona-law.ts`)

**Master file for Raven's constitutional prompts.**

Key exports:
- `RAVEN_COHERENCE_ENGINE` - Canonical constitution (Single-Process principle)
- `buildRavenSystemPrompt()` - Assembles the full system prompt from all modules
- `RAVEN_PROHIBITIONS` - Hard guardrails (no somatic metaphors, no modes/layers language)
- `SOMATIC_BLOCKLIST` - Terms Raven must not use

### Relocation Engine (`vessel/src/lib/astrology/`)

| File | Purpose |
|------|---------|
| `relocation-math.ts` | Tier 1: GMST, LST, Ascendant, MC, House calculations |
| `relocation-runtime.ts` | Tier 3: Mode normalization, disclosure generation |

---

## External APIs

### AstroAPI V3 (RapidAPI)
- **Host**: `best-astrology-api.p.rapidapi.com`
- **Key**: `RAPIDAPI_KEY` or `Astrology_API_KEY`
- **Endpoints Used**:
  - `/api/v3/glossary/cities` - City lookup
  - `/api/v3/analysis/natal-report` - Full natal geometry

### Perplexity AI
- **Key**: `PERPLEXITY_API_KEY`
- **Model**: `sonar`
- **Usage**: Raven's voice, geocoding fallback

---

## Telemetry / Codemap

The `/api/periscope` endpoint scans the codebase and returns all source files.
This can be used to generate a live codemap for context.

To access programmatically:
```bash
curl http://localhost:3000/api/periscope
```

---

## User Defaults

**DHCross Profile** (auto-seeded in ProfileVault):
- Name: DHCross
- Date: 1973-07-24
- Time: 06:17
- City: Panama City, FL (or Bryn Mawr, PA for relocation)

---

## Session Flow

1. User opens `/` → `OracleInterface` renders
2. User opens Vault or types birth data → `LensAlignmentCard` appears
3. On "Align" → `/api/astrology` fetches natal report
4. If Relocation active → `relocation-math.ts` recalculates houses
5. `chartData` passed to `OracleInterface` state
6. On message submit → `/api/oracle` receives `chartContext`
7. Raven responds with geometry-informed interpretation

---

## Quick Reference

| Task | File |
|------|------|
| Update Raven's voice | `persona-law.ts` |
| Fix city search | `LensAlignmentCard.tsx` + `/api/geocode` |
| Add new API endpoint | `vessel/src/app/api/[name]/route.ts` |
| Modify system prompt | `buildRavenSystemPrompt()` in `persona-law.ts` |

---

*Last updated: 2025-12-13*
