# Raven Reading Flow Documentation (Shipyard)

**Last Updated:** December 12, 2025  
**Status:** ✅ Current Architecture  
**Location:** `vessel/docs/READING_FLOW.md`

---

## Truth Table (Mode Selection)

| Condition | Mode | Language Rules |
|-----------|------|----------------|
| No chart run occurred | **Plain Intake** | No astrology claims. Warm conversation only. |
| Chart run + birth time missing | **Wide-Angle** | Planet/sign + aspects only. No houses/angles claims. |
| Chart run + full coordinates | **Full Woven Map** | All sections available. Full Mirror Flow. |

> [!IMPORTANT]
> **The Dual-Brain Contract:** Conversation can be optional. Geometry is NOT optional once we call it Woven Map.

---

## Complete Reading Flow (Shipyard Architecture)

### Phase 1: Threshold / Greeting

```
User arrives → Raven greets (threshold-friendly)
                ↓
        User responds with:
        ├── Greeting only → Plain Intake mode
        ├── Birth data → Immediately execute chart
        └── Confusion → Explain the instrument
```

**Threshold Greetings:**
- "Hello. This place works like an instrument: we translate geometry into a mirror you can test."
- "Hello. Before we run the instrument, we can just stand at the doorway."

---

### Phase 2: Data Collection (Handshake)

When a reading is requested but data is missing:

```typescript
// Required for Full Woven Map
{
  birth_date: "YYYY-MM-DD",  // Required
  birth_time: "HH:MM",        // Required for houses/angles
  birth_place: "City, State/Country"  // Required for timezone
}

// Optional for transits
{
  current_location: "City",   // For relocation-aware weather
  transit_date: "YYYY-MM-DD"  // For symbolic weather
}
```

**Raven says:**
- "I need your coordinates to align the lens."
- "Birth date, time, and place—that's what sets the angles and houses."

---

### Phase 3: Chart Engine Invocation

```
User provides complete data
        ↓
Raven: "Running the Chart Engine now..."
        ↓
API call: POST /api/astrology
        ↓
Geometry returns (positions, aspects, houses)
        ↓
Raven translates: FIELD → MAP → VOICE
```

**Instrument Confirmation Block:**
```
Instrument (Chart Engine) — running now.
Inputs received: 1973-07-24 · 14:30 · Bryn Mawr, PA.
That's enough to compute angles + houses.
```

---

### Phase 4: Output Generation

#### Full Woven Map (Complete Data)

1. **Instrument Confirmation Block** — inputs received, lens aligned
2. **Initial Mirror** — recognition-first, no astrology jargon
3. **Pressure Pattern** — testable, ends with "Does that match...?"
4. **Derived-From Tag** — "Natal Blueprint" or "Transit Activation"
5. **Core Insights** — 3-5 patterns (Magnitude ≥ 3.0)
6. **Polarity Cards** — 4 tensions requiring integration
7. **Mirror Voice** — poetic compression
8. **Symbolic Weather Overlay** — if transits + location integrity exist
9. **Integration Blueprint** — falsifiable check (WB/ABE/OSR)

#### Wide-Angle Mode (Missing Birth Time)

1. **Instrument Confirmation Block** — with "Wide-Angle" label
2. **Initial Mirror** — planet/sign + major aspects only
3. **Pressure Pattern** — without house-localized claims
4. **Derived-From Tag** — "Natal Blueprint (Wide-Angle)"
5. **Explicit Disclaimer** — "Houses and rising sign unavailable"

#### Plain Intake (No Chart Run)

- Warm conversation only
- No geometry claims
- No "field" or "pattern" language that implies chart structure
- Can transition to reading if data is provided later

---

## Degradation Protocols

### Missing Birth Time
```
"I can see the natal blueprint clearly, but without birth time, 
the House sensors are offline. I cannot tell you where this 
pressure lands (career vs. home), only that the pressure exists."
```

### Missing Location
```
"Angle Drift Alert — house precision reduced. I'll focus on 
planet-to-planet aspects and sign tone."
```

### Chart Engine Failure
```
"Clouded Skies — geometry temporarily obscured."
```

### Transit Data Unavailable
```
"The instrument didn't return live transit drivers for this window. 
I'll avoid localized symbolic weather claims."
```

---

## E-Prime Compliance

**Forbidden:** is, am, are, was, were, be, being, been

**Use Instead:**
- "tends to," "navigates," "channels," "activates"
- "suggests," "indicates," "reveals," "shows"
- "When X happens, Y tends to emerge"

**Example:**
- ❌ "You are a natural leader"
- ✅ "Your chart shows leadership tools—whether that expresses as commanding presence depends on how you've developed it"

---

## Falsifiability Protocol

Every reading ends with a validation check:

```
"The instrument reads this moment as 'high friction.' 
Does that match your lived reality right now, 
or is the signal missing?"
```

**Classification markers:**
- **WB** (Within Boundary) — pattern confirmed
- **ABE** (At Boundary Edge) — close but needs adjustment  
- **OSR** (Outside Symbolic Range) — miss, log and adjust

---

## Technical Implementation

### API Endpoints

```typescript
// Chart Engine invocation
POST /api/astrology
{
  endpoint: "/api/v3/data/positions",
  method: "POST",
  payload: {
    subject: {
      name: "Subject Name",
      birth_data: {
        year: 1973, month: 7, day: 24,
        hour: 14, minute: 30, second: 0,
        city: "Bryn Mawr", country_code: "US"
      }
    },
    options: {
      house_system: "P",
      zodiac_type: "Tropic",
      active_points: ["Sun", "Moon", "Mercury", ...],
      precision: 2
    }
  }
}
```

### Response Processing

```typescript
// Oracle API response flow
1. buildRavenSystemPrompt() — constructs persona (~760 lines)
2. Call Perplexity API with system prompt + user message
3. applySomaticGuard() — blocks forbidden body metaphors
4. stripCitations() — removes [1][2] brackets
5. Return clean response to UI
```

---

## Canonical Examples

### Solo Mirror (Natal Blueprint)

```markdown
## Solo Mirror: Dan

### Initial Summary

You start with forward motion — then you pause at a threshold and check the floor.
Your signal feels bright, but it won't commit until it can hold its own weight.
Under pressure, you oscillate between ignition and consolidation.
When you're aligned, you look simple from the outside — but the simplicity is built, not given.

### Behavioral Anchors

* You tend to scan for the bigger pattern before you speak, as if you're checking where the conversation *fits* in the wider map.
* You move decisively once you choose a direction — the hesitation lives before the choice, not after it.
* You steady through structure: plans, timing, follow-through, repeatable systems that don't rely on mood.
* You can look calm while you're internally pricing the cost of a "yes."
* You prefer commitments that can be *lived*, not just declared — you test for durability before you romanticize.
* When you're under load, you may narrow your focus and become more exacting, as if precision is how you keep integrity intact.

### Conditional Impulses

* Part of you wants visibility and momentum — to move, build, declare, and watch the world respond.
* Part of you wants containment — to keep what's precious protected, unexposed, and structurally safe.
* These aren't enemies. They rotate leadership. In one season the spark drives; in another, the anchor does.
* When you try to force one side to disappear, the other side tends to get louder.

### Pressure Patterns

* Pressure tends to rise when you're asked for a single clean commitment while you still feel the need to verify the ground beneath it.
* Pressure also rises when timing feels externally imposed — deadlines, social expectations, emotional demands that arrive before internal alignment.
* Release often comes through sequencing: orient → choose → commit → adjust, rather than trying to do all of it in one breath.
  *When you feel cornered by a decision, do you tighten first in the body, or do you go quiet and start calculating?*

### Polarity Snapshot

* Spark ↔ Anchor
* Visibility ↔ Shelter
* Speed ↔ Endurance
* Warmth ↔ Precision

### Constitutional Blueprint

* You tend to take in experience by watching for **structure** first: what holds, what repeats, what fails under pressure.
* Your orientation tends to favor **integrity over momentum**: you'd rather move slower than build something that won't last.
* Your center of gravity often lives in the zone of **commitment**: what you can stand behind, what you can sustain, what you can carry without resentment.
* Regulation improves when you have **clear constraints** (time, scope, cost) instead of endless openness.
* Under load, you may shift into **tightening**: less talk, more calibration, sharper boundaries.

### Mirror Voice

I move, then I measure.
If I pause, I'm not gone — I'm checking what will hold.
I trust what survives time.
When I say yes, it's because the ground is real.
I won't trade integrity for speed.
I won't trade warmth for collapse.

### Derived-from

Derived-from: **Natal Blueprint** (stable architecture).
```

### Symbolic Weather Overlay (Transit Activation)

```markdown
### Symbolic Weather Overlay — Dan — 2025-12-12

**Derived-from:** Transit Activation (symbolic weather)
**Metrics:** Magnitude 2.4 · Bias +0.3 · Volatility 1.0

Active pressure, but not a storm: the air feels a little more buoyant than usual, with a steady signal and only mild jitter. This often correlates with "forward traction" that doesn't require forcing—movement available, but still measurable.

This kind of day tends to support **incremental progress**: adjusting a plan, re-entering a conversation, making a small commitment that can actually be kept. The lift is real but modest—more "permission to proceed" than "breakthrough."

The field is slightly on your side today. Try one clean step you can stand behind—then stop and let the signal settle before you add more.
```

### Relational Mirror (Synastry)

```markdown
# Synastry Mirror Flow — Dan & Stephie

**[INSTRUMENT STATUS: LOCKED]**
Run window: **2025-12-12 → 2025-12-13** · Mode: **Relational Balance Meter** · House system: **Placidus** · Relocation mode: **A_local**  
Frontstage weather (shared): **Magnitude 2.4 · Bias 0.1 · Volatility 0.5** 

---

## 1) Mirror Flow (Polarity Blueprint)

This bond organizes itself around **a very specific contrast in how momentum becomes safe**.

* **Dan's baseline cadence** tends to move as *ignite → verify → commit*. The "yes" strengthens when the ground proves it can hold. (Dan: Sun in Leo, Moon in Taurus, Scorpio rising.)  
* **Stephie's baseline cadence** tends to move as *ignite → engage → clarify*. The "yes" strengthens through contact and motion. (Stephie: Sun in Aries, Moon in Sagittarius, Libra rising.)  

This creates the standing seam: **timing and sequence**, more than values.

**Derived-from:** Natal Blueprint (stable architecture). 

---

## 2) Natal Mirrors (within the joint space)

### Dan (Blueprint A)

You tend to carry steadiness as a relational gesture. With a Taurus Moon placed in the partnership sector, you often treat commitment as something lived, not merely spoken.

### Stephie (Blueprint B)

You tend to bring ignition and direct contact. With Aries emphasis in the relationship axis, you often move toward clarity by doing: naming, initiating, testing reality in real time.

**Derived-from:** Natal Blueprint (stable architecture). 

---

## 3) Field Overview (macro orientation)

Elementally, this pairing holds **a lot of fire** (initiation, honesty, forward motion) threaded through **earth** (durability, proof, real-world pacing).

The risk pattern shows up when fire reads earth as delay, and earth reads fire as pressure. Neither is "wrong." The mismatch is *sequencing*.

---

## 4) Polarity Mapping (the cross-field axes)

### Ignition ↔ Ground

* **Stephie → Dan:** Stephie's Aries/Sag emphasis can bring a bright forward pull.
* **Dan → Stephie:** Dan's Taurus Moon and Scorpio rising can bring gravity—hold, evaluate, protect.

### Two notable "wires" (geometry-based)

* **Stephie Sun (Aries 27°) ↔ Dan Mars (Aries 20°)**: a "shared ignition" wire. Often correlates with fast mutual activation.
* **Stephie Mars (Taurus 14°) ↔ Dan Moon (Taurus 22°)**: an "embodied bond" wire. Often correlates with strong physical/emotional presence.

---

## 5) Cognitive Architecture (symbolic compass, no letters)

* **Dan** often correlates with *stability-first perception*: seek coherence before expanding scope.
* **Stephie** often correlates with *motion-first perception*: seek clarity by engaging and iterating.

---

## 6) Tension Architecture (pressure points and release gates)

### Pressure points

* Pressure often accumulates when **Stephie moves for contact** while **Dan is still verifying the ground**.

### Release gates (non-prescriptive, testable)

* Relief often correlates with **explicit sequencing**: "Are we orienting, deciding, or committing right now?"

---

## 7) Polarity Cards (directionality modifiers)

* **Interior chamber ↔ Shared horizon**
* **Concrete anchor ↔ Pattern horizon**
* **Closure gate ↔ Permeable path**

---

## 8) Symbolic Weather Overlay (transits only, Dec 12–13)

### 2025-12-12

* **Dan weather:** Mag **2.4** · Bias **+0.3** · Vol **1** (active, slightly lifting)
* **Stephie weather:** Mag **2.4** · Bias **−0.4** · Vol **0.5** (active, slightly compressive)

**Field translation:** same room, different pressure.

### 2025-12-13

Shared field settles: volatility drops, bias moves toward neutral. Often correlates with easier repair.

**Derived-from:** Transit Activation (Dec 12–13).  

---

## Integration Blueprint (closing synthesis)

This relationship strengthens when **fire is allowed to initiate** and **earth is allowed to confirm**—in that order, openly named.

Where do you each notice the seam most clearly: **at the beginning of decisions, or at the moment commitment becomes real?**
```

---

## Related Documentation

- `CHART_ENGINE_API.md` — v3 API input/output schemas
- `persona-law.ts` — Raven's 18 protocols
- `/app/reports/page.tsx` — Astro Reports UI scaffold

---

**Canonical Source:** This document is the source of truth for Shipyard reading flow.
