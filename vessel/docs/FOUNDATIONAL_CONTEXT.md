# Woven Map: Foundational Context & Validation History

**INTERNAL DOCUMENT — Not for Raven's voice, but the ground Raven stands on.**

---

## 1. What Is Actually Being Claimed

The Woven Map claims that **astrological geometry correlates with lived experience** at rates exceeding random chance. It does NOT claim:

- Astrology is "real" in a metaphysical sense
- The planets "cause" events
- The system can predict specific outcomes
- The geometry determines fate

It DOES claim:

- Certain geometric configurations correlate with pressure patterns
- These correlations can be measured, logged, and falsified
- Location matters (houses rotate with coordinates)
- Lived experience is the final authority—if it doesn't land, it's OSR (Outside Symbolic Range)

---

## 2. The Validation Corpus (What Has Actually Been Tested)

### Golden Standard #1: Hurricane Michael (2018) — Retrodictive
- **Event:** Category 5 hurricane destroyed property in Panama City, FL
- **Coordinates:** 30.1588°N, -85.6602°W
- **Time:** October 10, 2018, 12:30 PM CDT (eye wall breach)
- **Geometry:** Mars square Ascendant (3° orb), Pluto square Sun (3° orb), Saturn in 2nd House
- **Balance Meter:** Magnitude ~4.86, Directional Bias -3.3
- **Control Test:** Same chart relocated to Maryland showed 93% reduction in crisis signal
- **Status:** High-fidelity match. The symbolic "storm" hit the 2nd House (assets/security); the literal storm destroyed physical property.

### Golden Standard #2: September 2025 — Predictive
Two events within 10 days during a forecasted "friction-dominant" window:

**Event A (Sept 5):** Family member collapse/hospitalization
- SFD: -0.28 (deep friction-dominant range)
- Saturn-Neptune signature: "structural fragility"

**Event B (Sept 15):** Partner injury (broken kneecap, surgery, job loss)
- Mars opposing Saturn: "force meets bone"
- 4th/10th axis: Home/career destabilization

**Status:** Predictive hit. The system flagged the window BEFORE the events occurred.

### Biometric Locking (December 2025 — Real-Time)
- **Data:** Apple Watch health metrics vs. symbolic weather
- **Finding:** Walking speed, stand hours, and activity collapsed on the same days Directional Bias bottomed out (-0.5)
- **Status:** Triangulation proof. Three independent data streams (sky, body, log) converging on the same temporal axis.

### External Replications
- Hurricane Opal (1995) on independent subject: Magnitude 5.0, Bias -5.0
- Friend's life events (Saturn Return, Pluto transit) mapped to specific years
- Temporal precision tests (prospective date hits at >1:10,000 odds)

---

## 3. What This Does NOT Prove

**Be rigorous here:**

- Sample size is small. These are N=1 or N=few case studies.
- No double-blind controlled trials have been conducted.
- Publication bias: the hits are documented; the misses may be under-reported.
- Selection bias: the creator of the system is the primary subject.
- The "93% drop" for relocation needs independent replication.
- Correlation ≠ causation. The geometry may be tracking something real, or it may be a sophisticated pattern-matching artifact.

---

## 4. The Honest Position

The Woven Map operates under **Skeptical Phenomenology**:

> "Something is happening that shouldn't be happening according to materialist ontology. We don't know WHY it's happening. But we can measure WHEN it happens and WHETHER it matches lived experience."

The system doesn't ask users to believe. It asks them to **test**.

- If the geometry matches: log the ping.
- If it doesn't: log the OSR.
- Over time, the data will speak.

---

## 5. Architectural Implications

These findings inform the code:

| Principle | Implementation |
|-----------|----------------|
| **Magnitude is neutral** | No "doom" vocabulary. Labels describe activation, not disaster. |
| **Bias determines direction** | Signed scale (-5 to +5). Positive bias + high magnitude = breakthrough, not crisis. |
| **Location matters** | Relocation mode required. Houses rotate with coordinates. |
| **Falsifiability first** | OSR is valid data. The system yields if it doesn't land. |
| **Separation of concerns** | Chart Engine calculates. Raven interprets. Type IV records without overlay. |

---

## 6. What Raven Must Never Do

Based on the validation history, Raven is prohibited from:

1. Claiming certainty ("This WILL happen")
2. Predicting specific events ("You will break a bone")
3. Dismissing OSR ("You're just not seeing it")
4. Overriding lived experience with geometry
5. Converting users to belief

Raven's job is to **hold the lens steady**—and let the user decide if the image matches.

---

## 7. Architecture Reference (Current Terminology)

Based on `WovenWebApp` codebase exploration:

### Components
| Component | Location | Purpose |
|-----------|----------|---------|
| **SymbolicSeismograph** | `app/components/` | Dual-panel time-series chart (Bias + Magnitude) |
| **SnapshotDisplay** | `app/math-brain/components/` | Balance Meter diagnostic panel with tooltips |
| **useChartExport** | `app/math-brain/hooks/` | Export orchestration, PDF generation, Raven directives |

### State Labels (Hard-Coded in Engine)
| Axis | Labels |
|------|--------|
| Magnitude | High, Active, Murmur, Latent |
| Directional Bias | Strong Outward, Mild Outward, Equilibrium, Mild Inward, Strong Inward |
| Volatility | Very High, Moderate, Low |

### Tooltip Language (Seismograph)
- Bias > 0: "expansion (outward)"
- Bias < 0: "contraction (inward)"
- Bias = 0: "neutral balance"
- Magnitude ≥ 4: "peak storm"
- Magnitude ≥ 2: "noticeable"
- Magnitude ≥ 1: "background"
- Magnitude < 1: "latent"

### Workflow Embedded in Exports
```
FIELD → MAP → VOICE
```
- **FIELD:** Raw geometric data from Chart Engine
- **MAP:** Structural patterns (natal, synastry, transits)
- **VOICE:** Raven's synthesis into lived-experience language

### Relationship Tiers (From useChartExport.ts)
| Tier | Definition |
|------|------------|
| P1 | Platonic partners (no romantic/sexual) |
| P2 | Friends-with-benefits (sexual, not romantic) |
| P3 | Situationship (unclear/unstable) |
| P4 | Low-commitment romantic/sexual |
| P5a | Committed romantic + sexual |
| P5b | Committed romantic, non-sexual |

---

## 8. Summary

The Woven Map was built by a skeptic who ran a transit chart after a hurricane and couldn't look away from the match. The system that emerged is not a prediction engine—it's a **measurement instrument** designed to detect when symbolic pressure aligns with lived reality.

The validation corpus is compelling but not conclusive. More data is needed. The system's integrity depends on honest logging: pings AND misses.

If it works, we'll know—because the data will accumulate.
If it doesn't, we'll know that too.

That's the point.
