# Chart Engine API Reference (Shipyard)

**Last Updated:** December 12, 2025  
**Status:** ✅ Current Architecture  
**Location:** `vessel/docs/CHART_ENGINE_API.md`

---

## Overview

The Chart Engine (formerly "Math Brain") is the subordinate computational layer that Raven invokes to generate planetary geometry. Raven translates this raw geometry into human-readable mirrors.

```
User Input → Raven (Sovereign) → Chart Engine (Subordinate) → Geometry → Raven Translation → Output
```

---

## Input Schema (v3 API Request)

### Solo Subject (Natal Chart)

```json
{
  "subject": {
    "name": "Subject Name",
    "birth_data": {
      "year": 1973,
      "month": 7,
      "day": 24,
      "hour": 14,
      "minute": 30,
      "second": 0,
      "city": "Bryn Mawr",
      "country_code": "US"
    }
  },
  "options": {
    "house_system": "P",
    "language": "en",
    "tradition": "universal",
    "detail_level": "full",
    "zodiac_type": "Tropic",
    "active_points": [
      "Sun", "Moon", "Mercury", "Venus", "Mars",
      "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
      "Ascendant", "Medium_Coeli", "Mean_Node", "Chiron"
    ],
    "precision": 2
  }
}
```

### Dual Subject (Synastry/Relational)

```json
{
  "subject1": {
    "name": "Person A",
    "birth_data": { ... }
  },
  "subject2": {
    "name": "Person B",
    "birth_data": { ... }
  },
  "options": { ... }
}
```

### Transit Request

```json
{
  "subject": {
    "name": "Subject Name",
    "birth_data": { ... }
  },
  "transit_time": {
    "datetime": {
      "year": 2025,
      "month": 12,
      "day": 12,
      "hour": 12,
      "minute": 0,
      "second": 0,
      "city": "Chicago",
      "country_code": "US"
    }
  },
  "options": { ... }
}
```

---

## Output Schema (Chart Engine Response)

### Natal Chart Output

```json
{
  "person_a": {
    "details": {
      "name": "Subject Name",
      "birth_date": "1973-07-24",
      "birth_time": "14:30:00",
      "birth_place": "Bryn Mawr, PA, USA",
      "timezone": "America/New_York",
      "latitude": 40.0229,
      "longitude": -75.3167
    },
    "natal_chart": {
      "sun": {
        "sign": "Leo",
        "degree": 1.532,
        "house": 9,
        "retrograde": false
      },
      "moon": {
        "sign": "Aquarius",
        "degree": 18.185,
        "house": 3,
        "retrograde": false
      },
      "ascendant": {
        "sign": "Scorpio",
        "degree": 8.421
      },
      "mercury": { "sign": "Cancer", "degree": 12.789, "house": 8, "retrograde": false },
      "venus": { "sign": "Gemini", "degree": 28.342, "house": 8, "retrograde": false },
      "mars": { "sign": "Aries", "degree": 14.925, "house": 5, "retrograde": false },
      "jupiter": { "sign": "Aquarius", "degree": 5.123, "house": 3, "retrograde": true },
      "saturn": { "sign": "Gemini", "degree": 19.678, "house": 7, "retrograde": false },
      "uranus": { "sign": "Libra", "degree": 21.456, "house": 11, "retrograde": false },
      "neptune": { "sign": "Sagittarius", "degree": 5.789, "house": 1, "retrograde": true },
      "pluto": { "sign": "Libra", "degree": 2.012, "house": 11, "retrograde": false },
      "north_node": { "sign": "Sagittarius", "degree": 15.234, "house": 1 },
      "chiron": { "sign": "Aries", "degree": 17.654, "house": 5, "retrograde": false },
      "midheaven": { "sign": "Leo", "degree": 28.912 }
    }
  },
  "provenance": {
    "source": "Chart Engine v3.1",
    "generated_at": "2025-12-12T06:47:00Z",
    "api_version": "v3",
    "house_system": "Placidus",
    "zodiac_type": "Tropical",
    "relocation_mode": false
  }
}
```

---

## Symbolic Weather Output (Balance Meter)

When transits are requested, the output includes the Balance Meter:

```json
{
  "balance_meter": {
    "magnitude_0to5": 3.2,
    "directional_bias": -1.8,
    "volatility_0to5": 2.1,
    "magnitude_label": "Surge",
    "directional_bias_label": "Contractive",
    "period": {
      "start": "2025-12-09",
      "end": "2025-12-15"
    }
  },
  "symbolic_weather_context": {
    "transit_context": {
      "period": {
        "start": "2025-12-09",
        "end": "2025-12-15",
        "step": "1 day"
      }
    },
    "daily_readings": [
      {
        "date": "2025-12-12",
        "magnitude": 3.2,
        "directional_bias": -1.8,
        "volatility": 2.1,
        "magnitude_label": "Surge",
        "drivers": ["Mars □ Pluto", "Saturn △ Neptune"],
        "aspects": [
          {
            "type": "square",
            "symbol": "□",
            "planet_1": "Mars",
            "planet_2": "Pluto",
            "orb": 0.82,
            "potency": 8.2,
            "polarity": "contractive",
            "house_1": 3,
            "house_2": 8
          }
        ]
      }
    ]
  }
}
```

---

## Synastry/Relational Output

```json
{
  "person_a": { ... },
  "person_b": { ... },
  "relationship_context": {
    "scope": "PARTNER",
    "contact_state": "ACTIVE_DAILY",
    "role": "Primary romantic partner"
  },
  "synastry_aspects": [
    {
      "person_a_planet": "Venus",
      "person_b_planet": "Mars",
      "type": "opposition",
      "orb": 2.3,
      "interpretation": "Magnetic attraction with creative tension"
    }
  ],
  "overlay_dynamics": [
    {
      "description": "When A asserts (Mars), B experiences identity challenge (Sun opposition)",
      "geometry": "♂︎(A)☍☉(B) @ 0.2° • M=4.1"
    }
  ]
}
```

---

## Output Families

### 1. Mirror Flow Outputs (Natal/Synastry)

- Low location sensitivity (only matters for house calculation)
- Primary sections: Natal Mirrors, Pressure Patterns, Polarity Cards
- Derived-from: **Natal Blueprint**

### 2. Balance Meter / Symbolic Weather Outputs

- High location sensitivity (transits + relocation)
- Requires current location for accurate house transits
- Primary sections: Symbolic Weather Overlay, Daily Readings
- Derived-from: **Transit Activation**
- Provenance critical: must track relocation_mode, timezone

---

## Key Data Paths

| Question | JSON Path |
|----------|-----------|
| Sun sign? | `person_a.natal_chart.sun.sign` |
| Moon house? | `person_a.natal_chart.moon.house` |
| Rising sign? | `person_a.natal_chart.ascendant.sign` |
| Retrograde? | `person_a.natal_chart.{planet}.retrograde` |
| Daily magnitude? | `symbolic_weather_context.daily_readings[].magnitude` |
| Aspect orb? | `symbolic_weather_context.daily_readings[].aspects[].orb` |
| Synastry aspect? | `synastry_aspects[].type` |

---

## Footnote Format (for Audit Layer)

```
¹ ♂︎☍☉ @ 0.2° • Natal • M=3.8 • Mars opposition Sun creates tension
² ♄△♆ @ 1.1° • Transit • M=2.9 • Saturn trine Neptune harmonizes structure
³ ♃(A)△☿(B) @ 1.5° • Overlay • M=2.4 • Jupiter trine Mercury supports communication
```

**Components:**
- Planets with glyphs
- Aspect symbol (☍=opposition, △=trine, □=square, ☌=conjunction)
- Orb to nearest 0.1°
- Context: Natal | Transit | Overlay
- Magnitude score
- Brief interpretation

---

## Degradation Rules

| Missing Data | Degradation |
|--------------|-------------|
| Birth time | Wide-Angle mode — no houses/angles |
| Birth location | Angle Drift Alert — timezone uncertain |
| Transit date | No symbolic weather — blueprint only |
| Current location | No relocation — use birth location for transits |

---

## Provenance Fields (Non-Negotiable)

Every response must include:

```json
"provenance": {
  "source": "Chart Engine v3.1",
  "generated_at": "ISO timestamp",
  "api_version": "v3",
  "house_system": "Placidus",
  "zodiac_type": "Tropical",
  "relocation_mode": false,
  "data_integrity": "High | Wide-Angle | Degraded"
}
```

---

## Related Documentation

- `READING_FLOW.md` — Raven's conversational flow
- `persona-law.ts` — 18 protocols (~760 lines)
- `/app/api/oracle/route.ts` — Oracle API implementation

---

**Canonical Source:** This document is the source of truth for Chart Engine API in Shipyard.
