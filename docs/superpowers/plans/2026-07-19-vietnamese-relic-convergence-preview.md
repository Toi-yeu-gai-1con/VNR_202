# Vietnamese Relic Convergence Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce three deterministic, stereo, 13.2-second Vietnamese-instrument-led preview cues for the Good, Neutral, and Secret/Bad relic-convergence cinematic without replacing production audio.

**Architecture:** A focused Python standard-library synthesizer renders stereo PCM WAV files from reusable instrument and mixing functions. A standalone Node regression test parses the rendered WAV bytes and enforces format, duration, phase energy, peak headroom, deterministic output, and distinct hashes. Browser verification loads the committed previews directly through the existing static server; runtime audio mappings remain unchanged.

**Tech Stack:** Python 3 standard library (`math`, `random`, `struct`, `wave`), Node.js assertions and crypto, existing static server and Playwright.

## Global Constraints

- Keep `assets/audio/sfx/relic-convergence*.wav`, `src/runtime/game-runtime.js`, cinematic timing, and ending thresholds unchanged.
- Output exactly three stereo PCM WAV previews at 44,100 Hz, 16-bit, and 13.2 seconds.
- Use no downloaded samples or third-party music; generation must be deterministic.
- Save previews under `assets/audio/previews/` and record them in `ASSET_SOURCES.md`.
- Secret/Bad must reduce score energy around second 10 so the existing fracture one-shot retains headroom.

---

### Task 1: Lock the preview audio contract

**Files:**
- Create: `tests/relic-convergence-preview-audio-check.mjs`
- Test: `tests/relic-convergence-preview-audio-check.mjs`

**Interfaces:**
- Consumes: three future WAV files in `assets/audio/previews/`.
- Produces: a standalone regression command, `node tests/relic-convergence-preview-audio-check.mjs`.

- [ ] **Step 1: Write the failing test**

Create a RIFF parser that asserts each file uses PCM encoding `1`, two channels, sample rate `44100`, and 16 bits per sample. Deinterleave stereo frames before calculating duration, RMS, and peak. Require:

```js
const previews = [
  "relic-convergence-good-vietnamese-preview.wav",
  "relic-convergence-neutral-vietnamese-preview.wav",
  "relic-convergence-secret-vietnamese-preview.wav",
];

assert.ok(Math.abs(audio.duration - 13.2) <= 0.01);
assert.ok(rmsInWindow(audio, 0.3, 4.6) > 0.018);
assert.ok(rmsInWindow(audio, 4.6, 6.2) > 0.018);
assert.ok(rmsInWindow(audio, 6.2, 9.8) > 0.018);
assert.ok(audio.peak < 0.94);
assert.ok(audio.stereoDifferenceRms > 0.002);
```

For Secret/Bad additionally require RMS in `9.95–10.35` seconds below the cue's RMS in `8.0–9.5` seconds. Require all three SHA-256 hashes to differ.

- [ ] **Step 2: Run the test to verify RED**

Run: `node tests/relic-convergence-preview-audio-check.mjs`

Expected: failure with `ENOENT` for `assets/audio/previews/relic-convergence-good-vietnamese-preview.wav` because preview assets do not exist yet.

- [ ] **Step 3: Commit the contract**

```powershell
git add -- tests/relic-convergence-preview-audio-check.mjs
git commit -m "test: define convergence preview audio contract"
```

### Task 2: Render deterministic Vietnamese-led previews

**Files:**
- Create: `scripts/generate-relic-convergence-previews.py`
- Create: `assets/audio/previews/relic-convergence-good-vietnamese-preview.wav`
- Create: `assets/audio/previews/relic-convergence-neutral-vietnamese-preview.wav`
- Create: `assets/audio/previews/relic-convergence-secret-vietnamese-preview.wav`
- Modify: `ASSET_SOURCES.md`
- Test: `tests/relic-convergence-preview-audio-check.mjs`

**Interfaces:**
- Consumes: no external samples or packages.
- Produces: `render_preview(ending: str) -> tuple[list[float], list[float]]` and three fixed WAV paths.

- [ ] **Step 1: Implement the minimal deterministic synthesizer**

Use a fixed `SAMPLE_RATE = 44_100` and `DURATION = 13.2`. Implement stereo buffers and these focused helpers:

```python
def add_layer(left, right, mono, start_seconds, pan=0.0, gain=1.0): ...
def plucked_string(frequency, duration, seed): ...
def dan_bau(frequency, duration, glide_semitones=0.0): ...
def wood_hit(frequency, seed): ...
def low_drum(frequency=62.0): ...
def string_pad(frequencies, duration): ...
def short_reverb(left, right): ...
def render_preview(ending): ...
def write_stereo_wav(path, left, right): ...
```

`plucked_string` uses seeded Karplus–Strong feedback with a decaying low-pass average. `dan_bau` mixes the fundamental and first three harmonics with a slow pitch bend and vibrato. `string_pad` uses quiet detuned sine/triangle partials with slow attack and release. `short_reverb` adds deterministic cross-channel taps below 230 ms.

Schedule five plucks at `0.45`, `1.25`, `2.05`, `2.85`, and `3.65` seconds with pans `-0.55`, `-0.28`, `0`, `0.28`, and `0.55`.

- [ ] **Step 2: Author the three cue variations**

Use one five-note identity and ending-specific treatment:

```python
GOOD_NOTES = [196.00, 220.00, 246.94, 293.66, 329.63]
NEUTRAL_NOTES = [196.00, 220.00, 246.94, 261.63, 293.66]
SECRET_NOTES = [196.00, 174.61, 164.81, 146.83, 138.59]
```

- Good: fusion drum at 4.72 seconds, upward đàn-bầu glide, G-major/add6 pad from 5.65 seconds, and a resolved G chord from 10.35 seconds.
- Neutral: softer fusion, restrained upward glide, Em(add9)/A-sus color from 5.75 seconds, and a D–E–A suspended ending without a bass resolution.
- Secret/Bad: descending plucks with duller damping, low drum and downward glide at fusion, dissonant E–F–B-flat pad, restrained mechanical wood ticks from 6.4–9.2 seconds, a fade at 9.75–10.25 seconds, then only a quiet low tail.

Normalize all cues together to a maximum absolute sample of `0.90`, then write the three files.

- [ ] **Step 3: Render and verify GREEN**

Run:

```powershell
python scripts/generate-relic-convergence-previews.py
node tests/relic-convergence-preview-audio-check.mjs
```

Expected: generator reports three output paths; test prints one PASS line and exits `0`.

- [ ] **Step 4: Verify deterministic output**

Run the generator, hash the three WAV files, run it again, and hash them again:

```powershell
Get-FileHash assets/audio/previews/*.wav -Algorithm SHA256
python scripts/generate-relic-convergence-previews.py
Get-FileHash assets/audio/previews/*.wav -Algorithm SHA256
```

Expected: both hash sets match exactly.

- [ ] **Step 5: Record asset provenance**

Add an `Original Vietnamese convergence previews` entry to `ASSET_SOURCES.md` stating that the three files were deterministically synthesized in-repository on 2026-07-19, contain no third-party samples, are audition-only, and do not replace production cues.

- [ ] **Step 6: Commit rendered previews**

```powershell
git add -- scripts/generate-relic-convergence-previews.py assets/audio/previews ASSET_SOURCES.md
git commit -m "feat: add Vietnamese convergence audio previews"
```

### Task 3: Verify playback and repository health

**Files:**
- Verify: `assets/audio/previews/*.wav`
- Verify: `tests/relic-convergence-preview-audio-check.mjs`

**Interfaces:**
- Consumes: committed preview WAVs and existing repository tooling.
- Produces: browser playback evidence and final verification output.

- [ ] **Step 1: Run focused and existing audio checks**

Run:

```powershell
node tests/relic-convergence-preview-audio-check.mjs
node tests/convergence-audio-check.mjs
node tests/relic-experience-check.mjs
```

Expected: all three commands exit `0`; the production convergence check proves existing assets remain valid.

- [ ] **Step 2: Build the game**

Run: `npm run build`

Expected: Vite build exits `0` without unresolved asset or syntax errors.

- [ ] **Step 3: Verify browser decoding and playback**

Start the existing static server through Playwright, open `/?debugTools=1`, inject three `<audio controls>` elements whose sources point to `/assets/audio/previews/<filename>`, and click each play control from a user gesture. Query each element after playback begins and require `readyState >= 2`, `paused === false`, `duration` within 0.05 seconds of 13.2, and no page errors.

- [ ] **Step 4: Inspect final diff and status**

Run:

```powershell
git diff HEAD~2 --check
git status --short
```

Expected: no whitespace errors; working tree contains no uncommitted implementation files.
