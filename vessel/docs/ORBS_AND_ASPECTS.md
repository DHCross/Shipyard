# Orbs & Aspect Integrity

**Chart-Spec Validation Rules**

This document defines the orb caps and integrity checks that govern whether an aspect is treated as load-bearing.

---

## Orb Caps (wm-spec)

| Aspect Type | Max Orb |
|-------------|---------|
| Conjunction (☌) | 8° |
| Opposition (☍) | 8° |
| Square (☐) | 7° |
| Trine (△) | 7° |
| Sextile (✶) | 5° |

**Rule:** Aspects beyond these caps are **out of spec** and should NOT be treated as structurally defining. They may be mentioned as "wide/secondary" but cannot carry meaning in the main architecture.

---

## Aspect Priority (by orb tightness)

Tighter orbs = higher signal. When building a reading, prioritize:

1. **Sub-1°** — Primary wires (define the architecture)
2. **1°–3°** — Strong wires (reliable load-bearing)
3. **3°–5°** — Standard wires (include but don't overweight)
4. **5°–7°** — Secondary wires (mention if relevant)
5. **Beyond cap** — Out of spec (flag or drop)

---

## Example: Dan's Chart (In-Spec High-Signal Aspects)

| Aspect | Orb | Status |
|--------|-----|--------|
| MC ☐ Moon | 0°24' | **Primary** — Career/relational friction |
| Mars ☌ Chiron | 0°14' | **Primary** — Wounded drive signature |
| Sun ✶ Pluto | 0°28' | **Primary** — Power/transform current |
| Venus ✶ Saturn | 0°32' | **Primary** — Warmth + duty stabilizer |
| Fortune ☐ Neptune | 0°41' | **Primary** — Fortune/vision tension |
| Mars ☍ Uranus | 1°23' | **Strong** — Volatility wire |
| MC △ Mars | 1°29' | **Strong** — Career/action flow |
| MC △ Chiron | 1°15' | **Strong** — Career/wound integration |
| Sun △ Neptune | 3°06' | **Standard** — Creative vision link |
| Mercury ☐ Mars | 3°54' | **Standard** — Mental/action friction |
| Saturn ☐ Pluto | 3°05' | **Standard** — Structure/power tension |
| Mercury ☐ Uranus | 5°18' | **Secondary** — Mental/innovation friction |

### Out of Spec (Do Not Treat as Load-Bearing)

| Aspect | Orb | Issue |
|--------|-----|-------|
| Moon △ Pluto | 9°35' | Exceeds 7° trine cap |
| ASC ☍ Moon | 9°20' | Exceeds 8° opposition cap |

---

## Protocol Violations to Avoid

### 1. Unsolicited MBTI Output
The "ENTJ/INTJ hinge" framing is **only shown on explicit request**. The compass can be described in natural language, but letters are backstage.

### 2. Teleology / Self-Help Arc Language
Avoid:
- "wounded drive heals through..."
- "this equips you to..."
- "the trick is..."

These turn the mirror into instruction. Use **testable correlations** instead:
- "This often shows up as..."
- "Pressure tends to build when..."
- "Relief often correlates with..."

### 3. Internal Jargon Frontstage
Avoid leaking dev notes:
- "Field Architecture"
- "N-preference"
- "closure-permeable rhythm (J/P)"

Frontstage is recognizably human first. Appendix is optional.

### 4. Inference Jumps Without Geometry
Don't claim "pattern-led evaluation (N-preference via Neptune/Jupiter sextiles)" unless the geometry mechanically justifies it. If the claim is interpretive, label it as such.

---

## The Clean Fix (Reading Rebuild Checklist)

1. **Keep** the "instrument standing by / lens aligned" language
2. **Strip** the menu and any MBTI reveal
3. **Rebuild "Key wires"** around only in-spec, high-signal aspects
4. **Replace** "you're learning / heals / the trick is" with testable correlations
5. **Cite** the geometry in provenance footnotes, not frontstage

---

## Footnote Protocol (Invisible Scaffolding)

### The Rule
No jargon, code, degree, sign, or aspect in main narrative—only in footnotes.

### Frontstage (The Mirror)
- Plain, resonant English
- Describes "lived behavior," "felt pressure," "navigational tension"
- **FORBIDDEN in main text:** planetary names, degrees, house numbers, aspect names

### Backstage (The Engine)
- Astrological data in **FOOTNOTES ONLY**
- Prevents intellectualizing ("Oh, I'm a Gemini")
- Forces engagement with the tension itself

### Source Attribution Badges

| Badge | Source | Meaning |
|-------|--------|---------|
| ⚙️ CHART | Astrology API | Computed geometry from Chart Engine |
| 🪶 RAVEN | Poetic Brain | Interpretation, not from API |

### Example Footnote Block

```
---
SOURCES

[1] ⚙️ CHART: Sun sextile Pluto (0°28') — 9th House
    → Power-transform current linked to horizon expansion.

[2] ⚙️ CHART: MC square Moon (0°24')
    → Visible ambition fricts emotional stability needs.

[3] 🪶 RAVEN: Interpretation of navigational pressure.
    → Derived from pattern recognition, not geometric coordinates.
---
```

---

## Related Documentation

- [READING_PROTOCOL.md](./READING_PROTOCOL.md) — FIELD→MAP→VOICE, SST validation
- [CHART_ENGINE_API.md](./CHART_ENGINE_API.md) — v3 API schemas
