# Woven Map Research Benchmarks

This directory contains reproducible benchmark payloads and results for validating the Balance Meter / Seismograph system.

## Hurricane Michael Validation Study

**Event:** October 10, 2018 — Category 5 hurricane landfall at Panama City, FL

### The Hypothesis
If the Balance Meter measures real symbolic pressure (not random noise), then:
1. A reading at the **affected location** on the **event date** should show maximum crisis signal
2. A reading at a **different location** on the same date should show significantly lower signal
3. A reading at the **same location** on a **neutral date** should show significantly lower signal

### Results

| Benchmark | Location | Date | Magnitude | Directional Bias | Drivers |
|-----------|----------|------|-----------|------------------|---------|
| **Panama City** | 30.17°N, 85.67°W | Oct 10, 2018 | **5.0** | **-5.0** | Mercury-Pluto opp, Mars-ASC sq |
| **Maryland Control** | 39.05°N, 76.64°W | Oct 10, 2018 | **0** | **0** | None |
| **Neutral Date** | 30.17°N, 85.67°W | Jul 1, 2018 | **0** | **0** | None |

### Key Finding
The Mars → relocated ASC square that triggered the "structural breach" signal only exists in the Panama City chart. When relocated to Maryland, the Ascendant shifts and Mars no longer makes that aspect. This demonstrates **geographic specificity** — the system is not generating random crisis signals.

## Running Benchmarks

### Prerequisites
- Node.js 18+
- WovenWebApp server running (or direct API access)

### Run Hurricane Michael Test
```bash
node scripts/run-benchmarks.js --test hurricane-michael
```

### Run All Controls
```bash
node scripts/run-benchmarks.js --all
```

## Payload Files

| File | Description |
|------|-------------|
| `hurricane-michael-panama-city.json` | Crisis event: landfall location + date |
| `hurricane-michael-maryland-control.json` | Location control: different city, same date |
| `neutral-date-panama-city.json` | Temporal control: same location, neutral date |

## Provenance

All benchmarks use:
- **Subject:** Dan (1973-07-24, 14:30, Bryn Mawr PA)
- **House System:** Placidus
- **Orbs Profile:** `wm-tight-2025-10`
- **Relocation Mode:** `A_local`
