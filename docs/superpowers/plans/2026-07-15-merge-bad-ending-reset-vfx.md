# Bad Ending Reset VFX Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the committed and pending work from `codex/tva-narrative-roadmap` plus `origin/codex/bad-ending-reset-vfx` into `main` without regressing narrative recovery, save migration, audio settings, dialogue choices, or browser rendering.

**Architecture:** Finish and verify the current branch first, then create one integration branch from it. Replay the four VFX-branch commits in order with `cherry-pick --no-commit`, resolving each feature against the newer runtime instead of accepting the old runtime wholesale; merge the verified integration branch into `main` only after unit, build, and browser gates pass.

**Tech Stack:** Git, Vite, JavaScript ES modules, Canvas 2D, HTML audio, Node test scripts, Playwright.

## Global Constraints

- Preserve every current narrative/save fix, especially zone-scoped bad endings, stale-save repair, David's post-reset dispatch, hub music during dialogue, and the five-relic final-return choice.
- Do not discard or overwrite the current dirty working tree.
- Dialogue blips must respect `dialogueVolume`, mute, scene suspension, and autoplay recovery; they must not be routed only through combat SFX volume.
- Canvas-heavy VFX and new animated assets require screenshot-based browser verification.
- Preserve Vietnamese spelling, historical setting, flag treatment, fixed-frame animation contracts, and `ASSET_SOURCES.md` provenance.
- Do not merge directly into `main` until the integration branch is clean and all gates pass.

---

### Task 1: Freeze the current branch into reviewable commits

**Files:**
- Review: every path reported by `git status --short`
- Test: `tests/narrative-state-check.mjs`
- Test: `tests/e2e/game-flow.spec.mjs`

**Interfaces:**
- Consumes: dirty `codex/tva-narrative-roadmap` working tree
- Produces: clean, committed current branch containing all accepted TVA dossier and progression fixes

- [ ] **Step 1: Audit the dirty tree before staging**

Run:

```powershell
git status --short --branch
git diff --check
git diff --stat
git diff -- src/runtime/game-runtime.js tests/e2e/game-flow.spec.mjs
```

Expected: no whitespace errors; the runtime/E2E diff includes the latest bad-ending recovery and five-relic completion fixes.

- [ ] **Step 2: Run the current branch baseline**

Run:

```powershell
npm run test:unit
npm run build
npx playwright test tests/e2e/game-flow.spec.mjs --grep "Zone 3A|David reports|offers the final return|reported relics unlock" --reporter=line
```

Expected: unit/build exit `0`; the selected browser tests all pass.

- [ ] **Step 3: Commit the accepted current work without staging unrelated files blindly**

Run `git add -p` for modified shared files and explicitly add new collection files:

```powershell
git add -p
git add src/systems/monster-codex-collection.js tests/monster-codex-collection-check.mjs
git diff --cached --check
git diff --cached --stat
git commit -m "fix: complete TVA progression recovery"
```

Expected: commit succeeds and `git status --short` is empty. If unrelated changes remain, commit them separately with a message matching their actual scope before continuing.

### Task 2: Create the integration branch and establish the conflict baseline

**Files:**
- Conflict-prone: `src/runtime/game-runtime.js`
- Conflict-prone: `tests/e2e/game-flow.spec.mjs`
- Semantic review: `src/data/story-content.js`
- Semantic review: `src/systems/level-definitions.js`

**Interfaces:**
- Consumes: clean `codex/tva-narrative-roadmap` and fetched `origin/codex/bad-ending-reset-vfx`
- Produces: `codex/integrate-bad-ending-reset-vfx`

- [ ] **Step 1: Refresh refs and verify ancestry**

```powershell
git fetch origin --prune
git rev-list --left-right --count origin/main...HEAD
git rev-list --left-right --count origin/main...origin/codex/bad-ending-reset-vfx
```

Expected from the inspected state: current branch is `0 54` relative to `origin/main`; VFX branch is `1 4`. Re-evaluate if these counts change.

- [ ] **Step 2: Create an isolated integration branch from the current branch**

```powershell
git switch -c codex/integrate-bad-ending-reset-vfx
```

Expected: branch is created from the fully committed current HEAD.

- [ ] **Step 3: Record the expected conflict surface**

```powershell
git merge-tree --write-tree HEAD origin/codex/bad-ending-reset-vfx
```

Expected: content conflicts in `src/runtime/game-runtime.js` and `tests/e2e/game-flow.spec.mjs`; `story-content.js` may merge textually but still requires semantic review.

### Task 3: Port commit `ac70062` — centered reset and fullscreen wave

**Files:**
- Modify: `src/runtime/game-runtime.js`
- Modify: `tests/m90-reset-regression-check.mjs`
- Modify: `tests/combat-audio-check.mjs`
- Modify: `tests/strike-sfx-regression-check.mjs`
- Modify: `tests/e2e/game-flow.spec.mjs`

**Interfaces:**
- Consumes: `renderBadEndingRecoveryScene`, `drawM90ResetSequence`, `useStrikeSkill`
- Produces: centered David/M-90 recovery, canvas-diagonal reset wave, radial bloom, one animation-specific sword cue per strike

- [ ] **Step 1: Apply the commit without committing conflict resolutions automatically**

```powershell
git cherry-pick --no-commit ac70062
```

Expected: shared runtime/test conflicts may appear; do not choose all of either side.

- [ ] **Step 2: Resolve the reset renderer semantically**

Preserve the current recovery/checkpoint state machine and port only these target calculations:

```js
const recoveryCenterX = width * 0.5;
const actorX = -width * 0.1 + recoveryCenterX * 1.2 * walkProgress;
const canvasDiagonal = Math.hypot(context.canvas.width, context.canvas.height);
const waveProgress = clamp(waveElapsed / waveDuration, 0, 1);
const easedWaveProgress = easeOutQuad(waveProgress);
const waveSize = Math.round(canvasDiagonal * (0.28 + easedWaveProgress * 1.18));
```

Keep the target radial gradient bloom centered on `waveOriginY`; keep current save restoration and ending-scoped audio logic unchanged.

- [ ] **Step 3: Resolve strike audio without duplicating cues**

Keep one call in `useStrikeSkill`:

```js
playCombatSfx(strikeAnimation, {
  volume: isCharged ? 0.62 : 0.48,
  playbackRate: isCharged ? 0.82 : 0.96 + state.comboStep * 0.035,
});
```

Map `attack1` and `attack2` into `loadCombatSfx`; retain sound-caption behavior and the generic `strikeSwing` asset only where still referenced.

- [ ] **Step 4: Verify and commit the reset VFX slice**

```powershell
node tests/m90-reset-regression-check.mjs
node tests/combat-audio-check.mjs
node tests/strike-sfx-regression-check.mjs
npx playwright test tests/e2e/game-flow.spec.mjs --grep "bad ending|combat emits" --reporter=line
git add src/runtime/game-runtime.js tests/m90-reset-regression-check.mjs tests/combat-audio-check.mjs tests/strike-sfx-regression-check.mjs tests/e2e/game-flow.spec.mjs
git commit -m "feat: center bad-ending reset recovery"
```

Expected: all commands pass; screenshots show David centered and the reset wave reaching the viewport edges.

### Task 4: Port commit `e6d3e4f` — typewriter cadence and dialogue blips

**Files:**
- Modify: `src/runtime/game-runtime.js`
- Modify: `src/systems/audio-system.js`
- Modify: `src/data/story-content.js`
- Add: `assets/audio/sfx/sfx-blipmale.wav`
- Add: `assets/audio/sfx/sfx-blipfemale.wav`
- Add: `tests/dialogue-typewriter-check.mjs`
- Modify: `tests/audio-system-check.mjs`
- Modify: `tests/e2e/game-flow.spec.mjs`
- Modify: `ASSET_SOURCES.md`

**Interfaces:**
- Consumes: current scene controller, dialogue renderer, dialogue-volume settings, `playDialogueSound`
- Produces: `state.typewriter`, punctuation-aware reveal cadence, first-click reveal/second-click advance, male/female blips governed by dialogue volume

- [ ] **Step 1: Write the current-audio regression before applying runtime code**

Extend `tests/audio-system-check.mjs` with an assertion that a dialogue blip uses `dialogueVolume` and preserves an explicit `playbackRate`:

```js
settings.dialogueVolume = 0.4;
audio.playDialogueSound(dialogueBlip, { volume: 0.5, playbackRate: 1.01 });
assert.equal(dialogueBlip.volume, 0.2);
assert.equal(dialogueBlip.playbackRate, 1.01);
```

Run `node tests/audio-system-check.mjs`; expected: FAIL because the current dialogue path does not accept options.

- [ ] **Step 2: Apply the target commit without committing**

```powershell
git cherry-pick --no-commit e6d3e4f
```

Expected: conflicts in the newer runtime and E2E helpers.

- [ ] **Step 3: Integrate typewriter state into the newer runtime**

Port `TYPEWRITER_INTERVALS`, `TYPEWRITER_PUNCTUATION_PAUSES`, `ensureTypewriter`, `updateTypewriter`, `revealActiveTypewriter`, and debug snapshot fields. Preserve current `AUDIO_PAUSING_SCENES`, save migration, narrative resolver, David completion dialogue, and all current scene transitions.

Do not use `playCombatSfx(typewriter.voiceKey, ...)`. Route blips through:

```js
playDialogueSound(uiSounds[typewriter.voiceKey], {
  volume: typewriter.kind === "endingRecovery" ? 0.16 : 0.18,
  playbackRate: pitchPattern[typewriter.blipGroup % pitchPattern.length],
});
```

Extend `audioSystem.playDialogueSound(sound, options)` so cloned/played blips honor `dialogueVolume`, mute, suspension, playback rate, and autoplay recovery.

- [ ] **Step 4: Resolve dialogue tests for two-click semantics**

Retain current E2E scenarios and add shared helpers equivalent to:

```js
async function finishDialogueLine(page) {
  const typing = await snapshot(page).then((state) => state.typewriter?.kind === "dialogue" && !state.typewriter.complete);
  if (typing) await page.locator("#dialogue-next-button").click();
  await expect.poll(() => snapshot(page).then((state) => state.typewriter?.complete ?? true)).toBe(true);
}
```

Use the helper before advancing lines or selecting choices; do not remove the newer stale-save, Zone 2, Zone 3, or five-relic regressions.

- [ ] **Step 5: Correct the target timeline assertion**

The target raises `complaintDuration` to `6000`, making total recovery approximately `12750ms`. Replace the stale final E2E elapsed value `11000` with a value beyond completion:

```js
await page.evaluate(() => window.__CROSSROADS_DEBUG__.setBadEndingRecoveryElapsed(13000));
```

- [ ] **Step 6: Verify and commit dialogue cadence**

```powershell
node tests/dialogue-typewriter-check.mjs
node tests/audio-system-check.mjs
npx playwright test tests/e2e/game-flow.spec.mjs --grep "dialogue|David|bad ending" --reporter=line
npm run build
git add src/runtime/game-runtime.js src/systems/audio-system.js src/data/story-content.js assets/audio/sfx/sfx-blipmale.wav assets/audio/sfx/sfx-blipfemale.wav tests/dialogue-typewriter-check.mjs tests/audio-system-check.mjs tests/e2e/game-flow.spec.mjs ASSET_SOURCES.md
git commit -m "feat: add dialogue typewriter cadence"
```

Expected: blips follow dialogue volume, hub music continues during dialogue, choices appear only after full reveal, and recovery completes after the longer complaint phase.

### Task 5: Port commit `67e83e2` — dialogue authoring guide

**Files:**
- Add: `docs/ai-handoff/dialogue-authoring.md`
- Modify: `AGENTS.md`

**Interfaces:**
- Consumes: integrated typewriter/audio behavior
- Produces: authoring rules aligned with the actual implementation

- [ ] **Step 1: Apply and review the documentation commit**

```powershell
git cherry-pick --no-commit 67e83e2
```

Update the guide so it says dialogue blips use the dialogue-audio path and `dialogueVolume`, not the combat SFX path.

- [ ] **Step 2: Verify references and commit**

```powershell
rg -n "dialogue-authoring|dialogueVolume|typewriter" AGENTS.md docs/ai-handoff/dialogue-authoring.md src/runtime/game-runtime.js src/systems/audio-system.js
git add AGENTS.md docs/ai-handoff/dialogue-authoring.md
git commit -m "docs: add dialogue authoring guide"
```

Expected: every documented path and behavior matches the integrated runtime.

### Task 6: Port commit `ec903cf` — animated small gameplay assets

**Files:**
- Add: `assets/effects/combat/timeline-projectile.png`
- Add: `assets/effects/combat/timeline-projectile-reflected.png`
- Add: `assets/items/pickups/health-tonic.png`
- Add: `assets/items/pickups/stamina-tonic.png`
- Add: `assets/props/animated/vietnam-flag-small.png`
- Add: `assets/props/breakables/bamboo-provisions-basket.png`
- Add: `assets/props/breakables/wooden-supply-crate.png`
- Add: `scripts/prepare-small-game-assets.mjs`
- Modify: `src/data/render-config.js`
- Modify: `src/runtime/game-runtime.js`
- Modify: `src/systems/level-definitions.js`
- Add: `tests/small-game-assets-check.mjs`
- Modify: `ASSET_SOURCES.md`

**Interfaces:**
- Consumes: current Canvas renderer, quest state, projectile state, drops and breakables
- Produces: normalized animated flags, tonics, projectiles, crates, and baskets with no geometric fallback

- [ ] **Step 1: Apply the asset commit without committing**

```powershell
git cherry-pick --no-commit ec903cf
```

Expected: runtime overlap; preserve the current TVA/narrative render paths while porting only asset loading, animation metadata, and specialized draw functions.

- [ ] **Step 2: Preserve progression visibility contracts**

Keep flags hidden until their exact hamlet is freed:

```js
if (flag.hamletId && !state.quests.zone3HamletsFreed.has(flag.hamletId)) {
  continue;
}
```

Preserve `destroyedAt` for breakable animation, reflected projectile rotation, fixed-frame pickup strips, and the asset-source entries. Do not restore rectangle or generic-crate fallbacks.

- [ ] **Step 3: Verify assets and browser presentation**

```powershell
node tests/small-game-assets-check.mjs
npm run test:unit
npm run build
npx playwright test tests/e2e/game-flow.spec.mjs --grep "projectile|Zone 3|combat" --reporter=line
```

Expected: all tests pass; screenshots confirm flag animation only after liberation, distinct health/stamina tonics, readable normal/reflected projectiles, and animated breakable destruction at in-game scale.

- [ ] **Step 4: Commit the asset slice**

```powershell
git add ASSET_SOURCES.md scripts/prepare-small-game-assets.mjs src/data/render-config.js src/runtime/game-runtime.js src/systems/level-definitions.js tests/small-game-assets-check.mjs assets/effects/combat assets/items/pickups assets/props/animated/vietnam-flag-small.png assets/props/breakables
git commit -m "feat: replace small gameplay placeholders with pixel assets"
```

### Task 7: Run the integration gates and merge to main

**Files:**
- Verify: entire repository
- Visual evidence: Playwright output under `test-results/`

**Interfaces:**
- Consumes: completed `codex/integrate-bad-ending-reset-vfx`
- Produces: verified `main` containing both workstreams

- [ ] **Step 1: Run static and automated gates on the integration branch**

```powershell
git diff --check origin/main...HEAD
npm run test:unit
npm run build
npx playwright test tests/e2e/game-flow.spec.mjs --reporter=line
```

Expected: exit `0` for every command and zero failed Playwright tests.

- [ ] **Step 2: Review mandatory screenshots**

Inspect at minimum:

- centered David/M-90 walk and reset-wave fullscreen bloom;
- partial and completed dialogue typewriter states;
- male and female speaker transitions with choices still reachable;
- five-relic return after a high-corruption reset;
- animated flag before/after hamlet liberation;
- health/stamina pickup, normal/reflected projectile, and breakable destruction frames.

Expected: no clipping, black compositor artifacts, placeholder geometry, premature progression visuals, or HUD/modal overlap.

- [ ] **Step 3: Bring main up to date and merge only after a clean gate**

```powershell
git switch main
git pull --ff-only origin main
git merge --no-ff codex/integrate-bad-ending-reset-vfx -m "merge: integrate TVA roadmap and bad-ending reset VFX"
```

Expected: merge completes without conflicts because all conflicts were resolved on the integration branch.

- [ ] **Step 4: Verify the actual merged main**

```powershell
npm run test:unit
npm run build
npx playwright test tests/e2e/game-flow.spec.mjs --reporter=line
git status --short --branch
```

Expected: all tests pass and `main` is clean. Push or open a PR only with explicit authorization.
