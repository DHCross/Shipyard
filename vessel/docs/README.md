# Shipyard Documentation

**Location:** `vessel/docs/`  
**Status:** ✅ Current Architecture

---

## Core Documentation

| Document | Purpose |
|----------|---------|
| [CORPUS_ARCHITECTURE.md](./CORPUS_ARCHITECTURE.md) | Complete diagnostic-to-action ecosystem: SST, Hook Stack, Advice Ladder, MBTI Inference |
| [PHILOSOPHY.md](./PHILOSOPHY.md) | Block-Time epistemology, falsifiability, what Raven refuses to claim |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Woven Map hierarchy: OS vs Instruments (Mirror Flow, Balance Meter, Poetic Codex) |
| [DESIGN.md](./DESIGN.md) | "Haunted Instrument" aesthetic: color palette, texture, frontstage/backstage |
| [ORBS_AND_ASPECTS.md](./ORBS_AND_ASPECTS.md) | Orb caps, aspect priority, protocol violations, reading integrity rules |
| [READING_PROTOCOL.md](./READING_PROTOCOL.md) | Full reading specification: FIELD→MAP→VOICE, Hook Stack, SST validation |
| [READING_FLOW.md](./READING_FLOW.md) | Raven's conversational flow, three modes (Plain/Wide-Angle/Full), canonical examples |
| [CHART_ENGINE_API.md](./CHART_ENGINE_API.md) | v3 API input/output schemas, provenance fields, footnote format |


---

## Quick Reference

### Three Modes

| Mode | Trigger | Language Rules |
|------|---------|----------------|
| **Plain Intake** | No chart run | No astrology claims |
| **Wide-Angle** | Missing birth time | Planet/sign only, no houses |
| **Full Woven Map** | Complete data | All sections available |

### Key Principles

1. **Dual-Brain Contract:** Conversation optional, geometry NOT optional for Woven Map
2. **Instrument-First:** Chart Engine runs before Raven translates
3. **E-Prime Compliance:** No "to be" forms, use process verbs
4. **Falsifiability:** Every pattern must be testable (WB/ABE/OSR)
5. **Derived-From Tags:** Always label Natal Blueprint vs Transit Activation

---

## Related Code

| File | Purpose |
|------|---------|
| `lib/raven/persona-law.ts` | 18 protocols (~760 lines) |
| `app/api/oracle/route.ts` | Oracle API implementation |
| `app/reports/page.tsx` | Astro Reports page scaffold |

---

## Archive (Deprecated)

The following documents are historical and should not be used as current reference:

- `WovenWebApp/docs/archive/01-PoeticBrain-Corpus/Developers Notes/Poetic Brain/READING_FLOW_DOCUMENTATION.md`
- `WovenWebApp/docs/archive/01-PoeticBrain-Corpus/Developers Notes/Poetic Brain/REPORT_JSON_STRUCTURE.md`

These have deprecation banners and link here.
