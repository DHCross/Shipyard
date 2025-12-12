# Changelog

## [0.3.0] - 2025-12-12 — Phase 13: Oracle's Path (Complete)

### Added
**Persona Architecture (19 Protocols, ~875 lines)**
- `RAVEN_ARCHITECTURAL_LAW` — Constitutional law + voice principles
- `RAVEN_SPIRIT` — Poetry as compression, river-reads-stone sensibility
- `RAVEN_INTELLECTUAL_LINEAGE` — Jung, Campbell, Hillman, Rudhyar, R.A. Wilson
- `RAVEN_SELF_DEFINITION` — "What are you?" protocol
- `RAVEN_ADVICE_LADDER` — Crisis protocol (TIPP block, grounding)
- `RAVEN_PROHIBITIONS` — Hard guardrails (no somatic metaphors, no unsolicited advice)
- `RAVEN_EPRIME_PROTOCOL` — E-Prime compliance (no "to be" forms)
- `RAVEN_PERMISSIONS` — 5 permissions (warm, explore, wrong, complexity, human)
- `SYMBOLIC_WEATHER_DEFINITION` — Transits as external pressure (Magnitude/Bias/Volatility)
- `READING_OUTPUT_FORMAT` — Auto-execute mandate, prohibited patterns, correct structure
- `RAVEN_MATH_BRAIN_KNOWLEDGE` → renamed to "Chart Engine"
- `RAVEN_INSTRUMENT_PATTERNS` — Invocation, calibration pause, degradation, derived-from tags
- `MBTI_HINGE_PROTOCOL` — Cognitive architecture symbolic compass
- `RELATIONAL_FIELD_PROTOCOL` — Safe phrasing, asymmetry language, SST classification
- `RELATIONAL_CONTEXT_PROTOCOL` — Relationship types, intimacy tiers (P1-P5b), role mapping, session context
- `RELOCATION_PROTOCOL` — Geographic anchoring for transits
- `BIRTH_TIME_PROTOCOL` — Wide-angle mode, degradation scripts
- `SESSION_FLOW_PROTOCOL` — Three modes (Plain Intake / Wide-Angle / Full Woven Map)
- `SOMATIC_BLOCKLIST` — Runtime regex guard

**Documentation**
- `vessel/docs/README.md` — Index with quick reference
- `vessel/docs/READING_FLOW.md` — Truth Table, three modes, degradation protocols, canonical examples
- `vessel/docs/CHART_ENGINE_API.md` — v3 input/output schemas, provenance fields, footnote format
- Deprecated archive docs with banners linking to Shipyard

**Canonical Examples Added**
- Solo Mirror (Natal Blueprint) — Dan
- Symbolic Weather Overlay (Transit Activation) — Dec 12
- Relational Mirror (Synastry) — Dan & Stephie, 8-section structure

**UI Scaffolds**
- `/app/reports/page.tsx` — Astro Reports page (solo/relational mode, subject inputs, wide-angle detection)

### Changed
- Renamed "Math Brain" → "Chart Engine" in all public-facing language
- Fixed Perplexity model name (`sonar`)
- Added `stripCitations()` to remove [1][2] brackets
- Added dismiss button to roadmap overlay

### Technical
- `buildRavenSystemPrompt()` now joins 19 protocols
- `applySomaticGuard()` blocks forbidden body metaphors at runtime

---

## [0.2.0] - Phase 12: Signal Deck
### Added
- Project Dashboard with Signal Deck
- Roadmap overlay with phase visibility
- Codemap Viewer integration

---

## [0.1.0] - Genesis Phase
### Added
- Initialized Next.js 14 application in `vessel/`.
- Created "Clean Mirror" landing page (`page.tsx`).
- Configured "Dark Mode" base styles in `globals.css` and `layout.tsx`.
