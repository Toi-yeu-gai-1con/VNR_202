# Relic Convergence Audio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three five-relic cinematic cues with ending-appropriate music and add a synchronized one-shot fracture sound for Secret/Bad.

**Architecture:** Keep the existing Canvas cinematic and mute-aware SFX channel. Author deterministic original PCM WAV assets in the existing generator, start the main cue from the E/click interaction, and schedule one separate fracture SFX from cinematic state at the 10-second split threshold.

**Tech Stack:** JavaScript ES modules, HTMLAudioElement audio system, Python standard-library WAV generator, Node unit checks, Playwright browser playtests.

## Global Constraints

- Do not change the convergence animation, map artwork, 14-second duration, or ending thresholds.
- Good must sound warm and resolved; Neutral reflective and suspended without horror; Secret/Bad historically ominous from the first relic arrival.
- The fracture one-shot plays only for Secret/Bad, once per cinematic, at the 10-second split threshold.
- All sounds obey mute and SFX volume and never use the UI/dialogue channels.
- Do not import third-party audio.
- Preserve unrelated dirty-worktree changes; defer implementation commits unless the user explicitly requests one.

---

### Task 1: Audio Asset Regression Contract

**Files:**
- Create: `tests/convergence-audio-check.mjs`
- Modify: `tests/run-checks.mjs`
- Modify: `tests/relic-experience-check.mjs`

**Interfaces:**
- Consumes: PCM WAV files under `assets/audio/sfx/` and `src/runtime/game-runtime.js` source.
- Produces: regression checks for duration, non-silent timeline windows, distinct cue files, and one-shot runtime routing.

- [ ] **Step 1: Write the failing WAV contract**

Create a Node check that parses RIFF PCM metadata, asserts each convergence cue is 13.2 seconds within 0.1 seconds, asserts RMS energy above `0.025` in arrival/fusion/reveal windows, and requires `assets/audio/sfx/relic-fracture.wav` with duration between `0.7` and `1.8` seconds and peak above `0.25`.

- [ ] **Step 2: Write the failing runtime contract**

Require `loadCinematicSfx()` to expose `relicFracture`, require convergence state to initialize `fractureSoundPlayed: false`, and require the renderer to set it true and call `playCinematicSfx("relicFracture")` only after the fractured timeline reaches 10 seconds.

- [ ] **Step 3: Run the focused tests and verify RED**

Run: `node tests/convergence-audio-check.mjs` and `node tests/relic-experience-check.mjs`

Expected: FAIL because `relic-fracture.wav` and the runtime one-shot route do not exist.

### Task 2: Author Four Original Audio Assets

**Files:**
- Modify: `scripts/generate-skill-sfx.py`
- Create: `assets/audio/sfx/relic-fracture.wav`
- Modify: `assets/audio/sfx/relic-convergence.wav`
- Modify: `assets/audio/sfx/relic-convergence-neutral.wav`
- Modify: `assets/audio/sfx/relic-convergence-fractured.wav`

**Interfaces:**
- Consumes: `convergence_score(ending: str) -> list[float]`, `mix`, `tone`, `noise`, `at`.
- Produces: three 13.2-second PCM cues and `fracture_sound() -> list[float]` one-shot.

- [ ] **Step 1: Add timbre helpers**

Implement layered helpers for warm wood strikes, soft bells, low drums, and metallic resonances using the existing oscillator/noise pipeline.

- [ ] **Step 2: Rewrite Good**

Use five ascending warm attacks from 0.45–3.65 seconds, a consonant fusion chord at 4.7–5.2 seconds, and a warm resolved map-reveal cadence from 6.3–12.5 seconds. Remove dark continuous drone.

- [ ] **Step 3: Rewrite Neutral**

Use the same recognizable five-note motif in a narrower register, a gentle fusion chord, and an unresolved suspended cadence. Do not use noise, falling pitch, or distorted low drone.

- [ ] **Step 4: Rewrite Secret/Bad**

Use five descending low metal strikes, restrained gear rhythm and low drum, an ominous fusion resonance, and increasing dissonance from 8 seconds. Leave acoustic space near 10 seconds for the separate fracture one-shot.

- [ ] **Step 5: Generate the fracture one-shot**

Layer a dry wood transient, torn stone/paper noise body, metallic snap, and short low tail. Keep it under 1.8 seconds and normalize without clipping.

- [ ] **Step 6: Regenerate and verify GREEN for WAV contracts**

Run: `python scripts/generate-skill-sfx.py` then `node tests/convergence-audio-check.mjs`

Expected: PASS with four valid, audible, distinct assets.

### Task 3: Synchronize the One-Shot in Runtime

**Files:**
- Modify: `src/runtime/game-runtime.js`
- Test: `tests/relic-experience-check.mjs`

**Interfaces:**
- Consumes: `playCinematicSfx(key, options)`, `elapsed`, `fractured`.
- Produces: `relicFracture` SFX entry and `fractureSoundPlayed: boolean` cinematic state.

- [ ] **Step 1: Load the fracture asset**

Add `relicFracture: loadSound("assets/audio/sfx/relic-fracture.wav", 0.72)` to `loadCinematicSfx()`.

- [ ] **Step 2: Initialize one-shot state**

Add `fractureSoundPlayed: false` when `beginRelicConvergence()` creates the cinematic state.

- [ ] **Step 3: Trigger exactly once at the split threshold**

In `renderRelicConvergence()`, when `fractured && elapsed >= 10000 && !sequence.fractureSoundPlayed`, set the flag before calling `playCinematicSfx("relicFracture", { volume: 0.78, retryOnUserGesture: true })`.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `node tests/relic-experience-check.mjs`

Expected: PASS and no repeated one-shot routing.

### Task 4: Documentation and Browser Verification

**Files:**
- Modify: `ASSET_SOURCES.md`
- Test: `tests/e2e/game-flow.spec.mjs`

**Interfaces:**
- Consumes: debug convergence URLs and browser audio instrumentation.
- Produces: source ledger entry and verified Good/Neutral/Secret playback behavior.

- [ ] **Step 1: Update the asset ledger**

Document the three cue identities, the original layered fracture asset, generation date, and no-third-party provenance.

- [ ] **Step 2: Run full automated checks**

Run: `npm run test:unit`, `npm run build`, and the focused convergence/ending Playwright group.

Expected: all checks pass.

- [ ] **Step 3: Probe browser playback**

Verify each debug route loads the correct cue, that the play call occurs with user activation after E/click, that Secret emits one fracture attempt after 10 seconds, and that Good/Neutral never emit it.

- [ ] **Step 4: Verify mute and volume behavior**

Playtest default volume, muted state, and reduced SFX volume. Confirm there are no UI beeps or overlapping duplicate cues.
