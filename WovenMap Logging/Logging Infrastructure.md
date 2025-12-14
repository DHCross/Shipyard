To bridge the gap between your conceptual framework and a working research platform, you need to implement a **Telemetry Payload**—a structured JSON object generated at the end of every session. This payload captures the "State of the System" (Math Brain), the "Reflection" (Poetic Brain), and the "Verdict" (User Feedback).

Based on your technical specifications and validation protocols, here is the specific data schema you need to capture to turn Raven Calder readings into a rigorous, falsifiable dataset.

### 1. The Session Context (Provenance)
To ensure scientific reproducibility, every data point must be traceable to the specific engine configuration used at that moment. You cannot compare results if the "ruler" keeps changing.
*   **`hashedSessionId`**: Anonymized user identifier (essential for ethical compliance and longitudinal tracking).
*   **`compute_timestamp`**: Exact UTC time the calculation was performed.
*   **`math_brain_version`**: The specific build of your calculation engine (e.g., "v3.2.7").
*   **`renderer_version`**: The version of Raven Calder’s voice/prompting logic used.
*   **`orbs_profile`**: The geometric strictness applied (e.g., "wm-spec-2025-09" for tight diagnostic orbs).
*   **`house_system`**: Explicitly logging "Placidus" (diagnostic) or "Whole Sign" (poetic) to prevent interpretive drift.
*   **`relocation_mode`**: Did the reading use Birth Coordinates, Current Location (`A_local`), or Midpoint?.

### 2. The Math Brain Inputs (The "Stimulus")
You must capture the raw geometric pressure *before* it was translated into poetry. This allows you to audit whether high-pressure math actually correlated with high-pressure experiences.
*   **`mag` (Magnitude):** The raw intensity score (0–5).
*   **`val` (Directional Bias):** The directional score (-5 to +5).
*   **`sfd_cont` (Support-Friction Differential):** **Crucial.** Even though you retired this from the user-facing display (v5.0), your protocols mandate logging it in the background for archival integrity and "differential honesty" checks.
*   **`volatility`**: The narrative coherence/stability score.
*   **`drivers`**: An array of the specific planetary aspects (e.g., `["Mars_square_Saturn", "Sun_conjunct_Pluto"]`) that triggered the reading.

### 3. The SST Verdict (The Falsifiability Metric)
This is the most critical piece of the "missing infrastructure." You need a UI mechanism (buttons or a text classifier) that forces the session to end with a classification.
*   **`sst_output`**: The primary tag assigned to the interaction:
    *   **WB (Within Boundary):** User confirmed resonance.
    *   **ABE (At Boundary Edge):** User confirmed patterns but noted inversion or paradox.
    *   **OSR (Outside Symbolic Range):** User explicitly stated "that doesn't fit.".
*   **`sst_source`**: Who applied the tag?
    *   `"self"` (The user clicked "This fits" or "This missed").
    *   `"observer"` (You or a third-party rater applied the tag later).

### 4. The OSR Sub-Classification (The "Why")
If the result is **OSR**, your logging infrastructure must capture the *type* of miss to separate data errors from genuine transcendence.
*   **`osr_subtype`**:
    *   `O-DATA`: The birth time was wrong (technical error).
    *   `O-CONSENT`: The user stopped the reading (ethical stop).
    *   `O-INTEGRATION`: The pattern was accurate to the chart, but the user has outgrown the behavior (transcendence).
    *   `O-ANOMALY`: A true signal void; the chart promised pressure, the user felt nothing.
*   **`lens_switch_result`**: If an OSR triggered a lens switch (e.g., Tropical -> Sidereal), log the correlation score of the *second* lens to see if it resolved the miss.

### 5. Behavioral & Narrative Fit
To support the "Three-Lane Verification" (Symbolic, Physiological, Narrative), you need to capture the qualitative data alongside the math.
*   **`narrative_fit_score`**: A derived score (0-100) assessing how well the user's journal entry/feedback matched the symbolic weather.
*   **`user_feedback_text`**: The raw text of the user's response (e.g., "I felt exhausted, not energized").
*   **`biometric_correlation`** (Future State): Fields for `hrv_dip` or `resting_hr_spike` if Apple Health integration is active.

### Summary of Implementation
To build the "logging infrastructure," you need to append a function to your chat interface that saves the following JSON blob to your database upon session completion:

```json
{
  "session_id": "hashed_12345",
  "timestamp": "2025-10-27T14:30:00Z",
  "provenance": {
    "math_brain": "v3.2.1",
    "poetic_brain": "Raven_v4",
    "orbs": "tight_surgical",
    "house_sys": "placidus"
  },
  "input_geometry": {
    "magnitude": 4.8,
    "valence": -3.2,
    "sfd_cont": -0.21,
    "active_vectors": ["Pluto_sq_Sun", "Mars_conj_Uranus"]
  },
  "outcome": {
    "sst_classification": "OSR",
    "osr_subtype": "O-INTEGRATION",
    "user_feedback": "I used to react this way, but today I felt calm.",
    "lens_switch": "Sidereal_Match_0.71"
  }
}
```

Capturing this payload turns your "working software" into a research instrument capable of generating the **"1 in 15,000"** probability statistics referenced in your validation studies.