# Woven Map Design Language

**The Aesthetic: "The Haunted Instrument"**

The site should not look like a spaceship (too cold) nor a temple (too soft). It should look like a **Cartographer's Field Desk** or an **Analog Weather Station**.

---

## Core Metaphor

> "Seismograph meets illuminated manuscript."

A tool that measures invisible forces — engineering precision + mythic depth.

---

## Color Palette

| Color | Usage |
|-------|-------|
| **Abyss Black** | Background (the "messy block" of time) |
| **Bone White** | Primary text, data lines |
| **Electric Blue** | Accent, "current," coherence zones |
| **Deep Red** | Magnitude 5 / Negative Bias warnings only ("Pain with Coordinates") |
| **Verdant/Blue** | Coherence zones, positive signal |

---

## Texture

- Avoid slick, glossy "Apple-store" surfaces
- Lean into **paper texture** or **matte finishes** for Mirror Flow sections
- These are "durable artifacts" or "letters," not data dumps

---

## Hook Stack (Entry Point)

Hook Cards should look like **physical tarot or index cards** on a digital surface.

- **Front:** High-contrast tension (e.g., *Restless & Intense*)
- **Back (on click):** The "Latin" (e.g., *Pluto Square Moon, Orb 1.2°*)
- Starry borders, soft gradients
- "Recognition before explanation"

---

## Dashboard: The True Accelerometer

Replace zodiac wheel with **Two-Axis Symbolic Seismograph**.

| Axis | Meaning | Visual |
|------|---------|--------|
| **Y (Magnitude)** | Amplitude / "How loud" | Height of waveform |
| **X (Directional Bias)** | Contraction ← → Expansion | Left = weight, Right = lift |

- Use **waveform or heartbeat line**, not static chart
- Data points as sharp circles/nodes ("geometry made audible")

---

## Frontstage / Backstage Toggle

### Frontstage (The Mirror)
- Text-heavy, **serif font** (novel/field journal feel)
- Presents the VOICE — poetic inquiry, Socratic questions
- Intimate, like a letter from a wise observer

### Backstage (The Engine)
- Toggle via "gear" or "schematic" icon
- **Monospaced code font**
- Raw Data Scaffold (e.g., *Saturn at 29° Gemini [8th House] → Structural Audit*)
- Exposes the guts, proves the system isn't cheating

---

## Signal States

| State | Visual |
|-------|--------|
| **[WB] Within Boundary** | Node "lights up" / locks in |
| **[ABE] At Boundary Edge** | Partial highlight, tension indicator |
| **[OSR] Outside Symbolic Range** | Section dims / greys out ("signal void") |

---

## About / Philosophy Section

- **No guru photos** — use abstract imagery (maps, constellations, woven lattice)
- Display disclaimer prominently:

> *"This is a map, not a mandate. It does not predict. It measures pressure. You are the navigator."*

---

## The Vibe

> A **private observatory** or a **cartographer's workshop** late at night. Quiet, dark, precise, filled with instruments that measure things you can feel but cannot see. Respects the mystery without drowning in it.

---

## UX Improvements (Data Display)

### Visual Hierarchy
- **Dashboard Grid:** Break data into panels (Planets | Houses | Aspects)
- **Tables over Lists:** Structured columns: `Planet | Sign | Degree | House`
- **Collapsible Sections:** Accordion headers for Minor Aspects, etc.

### Data Visualization (HUD Approach)
- **Natal Wheel:** Circular chart styled as radar/HUD display
- **Aspect Matrix:** Triangular grid (planets on axes, symbols in cells)
- **Degree Bars:** `[=====-----] 15° Leo` progress visualization

### Typography & Symbology
- **Use Glyphs:** ☉ Sun, ☽ Moon, ♌ Leo (faster recognition, saves space)
- **Color by Element:** Fire = Red, Water = Blue, Air = White, Earth = Green
- **Aspect Colors:** Hard (Square/Opposition) = Red, Soft (Trine/Sextile) = Blue
- **Bold Degrees:** Emphasize 1° over 41' (degree > minute)

### Interactivity
- **Tooltips:** Hover definitions for Retrograde, Lilith, etc.
- **Filtering:** Toggle "Hard Aspects Only" or "Hide Minor"

### Quick Wins
- Increase **line height** (leading)
- Add **margin between list items**
- Keep **monospace for numbers**, cleaner sans-serif for labels

---

## Wall of Text Fixes

### 1. Grid System (Break the Wall)
Split layout into **panels**:
- **Panel A (Left):** Raw Data (Planet & House positions)
- **Panel B (Right):** Analysis (narrative text)

Why: Separates "facts" from "interpretation" — lets user switch modes mentally.

### 2. Data Visualization
- **Tables:** Convert lists to columns: `Planet | Sign | Degree | House`
- **Glyphs:** ☉ Sun, ☽ Moon, ♌ Leo (saves space, looks technical)
- **Progress Bars:** Render degrees (0°–30°) as visual bars: `[=====-----] 15°`

### 3. Typography & Spacing
- **Line Height:** At least `1.6` or `1.8`
- **Breathing Room:** `margin-bottom` between paragraphs/list items
- **Highlight Key Info:** Bold **Planet Names**, distinct color for **Signs**

### 4. Color Coding for Meaning
| Category | Color Logic |
|----------|-------------|
| **Elements** | Fire = Red/Orange, Water = Blue, Air = White, Earth = Green |
| **Aspects** | Squares/Opps = Red (tension), Trines/Sextiles = Blue/Green (flow) |

### 5. Interactive Data Sorting
- **Collapsible Headers:** Click to expand/collapse sections
- **Tooltips:** Hide orb details in hover (e.g., "Orb: 7°06', Separating")
- **Filters:** Toggle "Hard Aspects Only" or "Hide Minor"

---

## Hit Rate / Resonance Meter (Session View)

A floating or docked instrument component that tracks calibration in real-time.

### Visual Components
- **Top Readout:** "🎯 Accuracy: X%" (Compact mode)
- **Scope Toggle:** "This Session" vs "All Time"
- **Categories:** Yes (✓), Maybe (~), No (✗), Unclear (?)
- **Checkpoint Types:** Hook | Vector | Aspect | General

### Color Thresholds
- **Green:** > 75% Accuracy
- **Amber:** 50-74% Accuracy
- **Red:** < 50% Accuracy

### Design Logic
- **Not a score, but a calibration metric.** It measures how well the map aligns with the territory.
- **Micro-interaction:** Click top readout to expand details panel.
- **Aesthetic:** Translucent dark glass (`bg-slate-900/90`), border glow matching current accuracy color.

---

## Related Documentation

- [PHILOSOPHY.md](./PHILOSOPHY.md) — Block-Time, falsifiability, what Raven refuses
- [READING_PROTOCOL.md](./READING_PROTOCOL.md) — FIELD→MAP→VOICE, Hook Stack, SST
