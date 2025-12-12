# Captain's Log — Shipyard Dev Journal

Development journal for Raven Calder / Woven Map system.

---

## 2025-12-12 — The Bimodal Fix

**Session Focus:** Fixing Raven's "Always-On Verifier Problem"

### The Bug
Raven was asking "Does this resonate?" after simple greetings like "Good morning." The intended "mystical but grounded" tone collapsed into something robotic and intrusive.

### Root Cause (Not What It Seemed)
- ❌ Not a tone problem
- ❌ Not a prompt wording issue
- ✅ **Architectural failure:** Global verification loop firing outside its valid domain
- ✅ **Split-brain problem:** `RavenPanel.tsx` was bypassing `persona-law.ts` entirely

### The Fix
**Bimodal Architecture:**
| Mode | State | Behavior |
|------|-------|----------|
| A (Friend) | No chart data | Warm conversation, verification loop OFF |
| B (Instrument) | Handshake complete | Diagnostic precision, verification loop ON |

**Key Insight:** "Raven holds the instrument but IS NOT the instrument. She can set it down."

### Files Changed
- `persona-law.ts` — Rewritten VOICE_PRIME_DIRECTIVE with bimodal logic
- `OracleInterface.tsx` — Ping validator now requires `isActiveReading` check
- `RavenPanel.tsx` — Now routes through `/api/oracle`, not client-side GoogleGenAI
- `page.tsx` — Fixed chat window centering
- `ResonanceMeter.tsx` — Replaced 🎯 emoji with SVG
- `ARCHITECTURE.md` — Documented bimodal logic as system invariant

### Verification Status
- [x] Test 1: Small Talk (MODE A) — PASSED
- [ ] Test 2: Handshake (MODE B switch) — Needs manual verification
- [ ] Test 3: Deep State (MODE B persistence) — Pending

### Raven GPT Feedback
> "You didn't make Raven quieter. You taught her when to speak as a mystical bird, and when to speak as an instrument."

---

## Previous Entries

*Add earlier development notes here as needed.*
