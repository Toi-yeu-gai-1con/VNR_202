# Resume Zone Music Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resume each zone's music from its prior playback position after the player leaves and returns to that zone.

**Architecture:** Keep the existing `HTMLAudioElement` instances alive. Replace map-transition teardown with a pause-only helper, while preserving a separate reset helper for a brand-new/restarted session. The active-music selector remains unchanged, so only one map track plays at a time.

**Tech Stack:** Browser-native JavaScript modules, `HTMLAudioElement`, Playwright CLI browser checks, PowerShell.

## Global Constraints

- Map and hub music must retain `currentTime` when inactive.
- New journeys and explicit restarts must reset music positions to zero.
- UI click sounds retain their existing restart-from-zero behaviour.
- Ending music must keep its current behaviour.
- Do not add dependencies or alter the audio asset set.

---

### Task 1: Add a browser regression check for hub-music resumption

**Files:**
- Create: `E:/VNR_202/tests/audio-resume-check.ps1`
- Test: `E:/VNR_202/tests/audio-resume-check.ps1`

**Interfaces:**
- Consumes: `window.__CROSSROADS_DEBUG__.loadLevel(levelId)` and `getSnapshot()` exposed by `game.js` when `debugTools=1`.
- Produces: a non-zero exit code if hub music starts from zero after the sequence hub → village → hub.

- [ ] **Step 1: Write the failing test**

```powershell
function Invoke-Playwright([string[]]$Arguments) {
  (& npx --yes --package @playwright/cli playwright-cli @Arguments 2>&1 | Out-String)
}

function Invoke-DebugEval([string]$Expression) {
  $result = Invoke-Playwright @('eval', $Expression)
  if ($result -notmatch '### Result\s+"?([^\r\n"]+)') {
    throw "Playwright did not return a result: $result"
  }
  return $Matches[1]
}

$url = 'http://127.0.0.1:8000/?debugLevel=hub&debugTools=1'
Invoke-Playwright @('open', $url) | Out-Null
$snapshot = Invoke-Playwright @('snapshot')
$snapshotFile = [regex]::Match($snapshot, 'Snapshot\]\(([^)]+)\)').Groups[1].Value
$muteRef = [regex]::Match((Get-Content -Raw $snapshotFile), 'button "Tắt âm thanh".*?\[ref=(e\d+)\]').Groups[1].Value
Invoke-Playwright @('click', $muteRef) | Out-Null
$snapshot = Invoke-Playwright @('snapshot')
$snapshotFile = [regex]::Match($snapshot, 'Snapshot\]\(([^)]+)\)').Groups[1].Value
$unmuteRef = [regex]::Match((Get-Content -Raw $snapshotFile), 'button "Bật âm thanh".*?\[ref=(e\d+)\]').Groups[1].Value
Invoke-Playwright @('click', $unmuteRef) | Out-Null
Start-Sleep -Seconds 2

$hubBefore = [double](Invoke-DebugEval 'String(window.__CROSSROADS_DEBUG__.getSnapshot().audio.music.hub.currentTime)')
Invoke-DebugEval "window.__CROSSROADS_DEBUG__.loadLevel('village'); 'ok'" | Out-Null
Start-Sleep -Milliseconds 250
Invoke-DebugEval "window.__CROSSROADS_DEBUG__.loadLevel('hub'); 'ok'" | Out-Null
$hubAfter = [double](Invoke-DebugEval 'String(window.__CROSSROADS_DEBUG__.getSnapshot().audio.music.hub.currentTime)')
if ($hubBefore -le 0 -or $hubAfter -lt $hubBefore) {
  throw "Expected hub music to resume at or after $hubBefore seconds; got $hubAfter."
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `powershell -ExecutionPolicy Bypass -File tests/audio-resume-check.ps1`

Expected: FAIL with `Expected hub music to resume` because `stopSound()` resets inactive music to `currentTime = 0`.

- [ ] **Step 3: Write the minimal implementation**

```js
function pauseLoopingSound(sound) {
  if (!sound) {
    return;
  }
  try {
    sound.pause();
  } catch {
    // Ignore browsers that temporarily reject audio pausing.
  }
}

function resetSound(sound) {
  if (!sound) {
    return;
  }
  pauseLoopingSound(sound);
  try {
    sound.currentTime = 0;
  } catch {
    // Ignore browsers that temporarily reject resetting audio.
  }
}

function resetSoundGroup(soundGroup) {
  for (const sound of Object.values(soundGroup)) {
    resetSound(sound);
  }
}
```

Update `syncLoopingSoundGroup()` to call `pauseLoopingSound()` for inactive tracks. Use `resetSound()` only from the start-new-session and restart paths that intentionally clear the game state.

- [ ] **Step 4: Run test to verify it passes**

Run: `powershell -ExecutionPolicy Bypass -File tests/audio-resume-check.ps1`

Expected: PASS with the hub music's post-return time equal to or greater than its pre-transition time.

- [ ] **Step 5: Verify manual browser flow**

Run Playwright against `http://127.0.0.1:8000/?debugLevel=hub&debugTools=1`, activate audio through the sound button, then use the debug API to transition hub → village → hub. Confirm `hub.paused === false`, `hub.readyState === 4`, and `hub.currentTime` has not reset.

- [ ] **Step 6: Commit**

### Task 2: Reset music for new journeys and endings

**Files:**
- Modify: `E:/VNR_202/game.js:1498-1530, 4692-4720, 4774-4800, 4960-4990`
- Modify: `E:/VNR_202/tests/audio-resume-check.ps1`
- Test: `E:/VNR_202/tests/audio-resume-check.ps1`

**Interfaces:**
- Consumes: `resetSoundGroup(musicSounds)` from Task 1.
- Produces: fresh playback positions for a new journey/restart and for the ending currently being shown.

- [ ] **Step 1: Extend the failing test**

```powershell
Invoke-DebugEval "window.__CROSSROADS_DEBUG__.beginSession(); 'ok'" | Out-Null
$freshHubTime = [double](Invoke-DebugEval 'String(window.__CROSSROADS_DEBUG__.getSnapshot().audio.music.hub.currentTime)')
if ($freshHubTime -gt 0.1) {
  throw "Expected a new session to reset hub music; got $freshHubTime."
}
```

- [ ] **Step 2: Run the test to verify it fails after Task 1**

Run: `powershell -ExecutionPolicy Bypass -File tests/audio-resume-check.ps1`

Expected: FAIL with `Expected a new session to reset hub music` because Task 1 preserves the prior hub position.

- [ ] **Step 3: Write the minimal implementation**

```js
function resetMusicForNewSession() {
  resetSoundGroup(musicSounds);
  resetSoundGroup(ambienceSounds);
}

function beginGameSession() {
  resetMusicForNewSession();
  // existing session setup, then loadLevel("hub")
}

function restartGame() {
  resetMusicForNewSession();
  // existing restart setup, then loadLevel("hub")
}
```

Before `syncAmbienceAudio()` in the ending-display function, call `resetSound(musicSounds[state.endingId === "good" ? "goodEnding" : "badEnding"])` so each newly reached ending begins at zero.

- [ ] **Step 4: Run the complete check to verify it passes**

Run: `powershell -ExecutionPolicy Bypass -File tests/audio-resume-check.ps1`

Expected: PASS; hub time continues after hub → village → hub and returns to zero for a new session.

- [ ] **Step 5: Commit**

```bash
git add game.js tests/audio-resume-check.ps1 docs/superpowers/plans/2026-07-12-resume-zone-music-plan.md
git commit -m "fix: resume zone music after map changes"
```
