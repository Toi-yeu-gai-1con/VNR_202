# Progression Recovery and TVA Dossier Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the broken training room and make endings, replay state, and TVA collections recoverable, readable, and musically complete.

**Architecture:** Keep the current Canvas 2D runtime and move only pure state rules into small systems/data modules. A final-verdict checkpoint preserves the campaign state immediately before a destructive choice; a Bad Ending restores that checkpoint in the affected map. Historical entries stay in the book, while persistent endings, achievements, and animated monster discoveries move to a separate TVA dossier overlay.

**Tech Stack:** Vanilla ES modules, Canvas 2D, DOM overlays, localStorage collections, Vite, Node assertion tests, Playwright.

## Global Constraints

- Keep the existing custom 2D browser-game architecture; do not migrate engine or renderer.
- Do not alter combat balance, AI, story outcomes, map geometry, or existing Good Ending music.
- Remove the training room and its entry prop completely; do not replace it with a static or geometric stand-in.
- A zone Bad Ending returns to its final decision in that zone with corruption exactly `0`, no reward, and the return portal sealed.
- Every ending ID has an explicit music key; every Bad Ending uses a distinct CC0 loop recorded in `ASSET_SOURCES.md`.
- The historical book contains historical/relic entries only. Ending records, achievements, and monster discoveries live in the separate TVA dossier.
- Restore authored interactable metadata on replay; no stale verdict interaction or completed objective may survive New Game.
- Add a regression test before each behavior change and verify Canvas output in a real browser.
- Preserve unrelated working-tree changes and do not publish Git changes in this plan.

---

## File Structure

- `src/systems/interactable-runtime-state.js` — snapshots authored interactable fields and restores a fresh runtime level.
- `src/systems/bad-ending-recovery.js` — creates/restores a pure pre-verdict checkpoint.
- `src/data/ending-audio-definitions.js` — exhaustive ending ID to audio-key mapping.
- `src/systems/monster-codex-collection.js` — persistent collection storage, isolated from historical entries.
- `src/runtime/game-runtime.js` — invokes the focused systems, removes training routes, renders the TVA dossier, and suppresses reset-wave navigation chrome.
- `src/systems/level-definitions.js` — removes the training console and training level definition.
- `src/data/media-sources.js` — declares all ending sources.
- `src/systems/audio-system.js` — plays exactly one resolved ending loop.
- `index.html`, `styles.css` — TVA dossier overlay and accessible tab controls.
- `ASSET_SOURCES.md` — CC0 source ledger for eight new ending tracks.
- `tests/*.mjs`, `tests/e2e/game-flow.spec.mjs` — data, recovery, audio, history/dossier, and browser regression coverage.

## Task 1: Remove the training-room feature without leaving an orphan route

**Files:**
- Modify: `src/systems/level-definitions.js:1-210,1174`
- Modify: `src/runtime/game-runtime.js:1-1100,6400-6520,7580-7710,10550-10600`
- Modify: `src/data/asset-manifest.js:1-30`
- Delete: `src/systems/training-session.js`
- Delete: `tests/training-session-check.mjs`
- Modify: `tests/level-definitions-check.mjs:1-80`
- Modify: `tests/e2e/game-flow.spec.mjs:540-590`

**Interfaces:**
- Consumes: `createLevelDefinitions()` and the existing interaction dispatcher.
- Produces: no `training` level, `enterTraining`, `resetTraining`, `trainingSession`, or training asset-group reference.

- [ ] **Step 1: Write failing removal assertions**

```js
assert.equal(levels.training, undefined, "The obsolete training map is not registered.");
assert.equal(
  levels.hub.interactables.some((item) => item.id === "tva-training-console"),
  false,
  "The TVA hub has no training-console interaction."
);
```

- [ ] **Step 2: Run the level regression test and verify failure**

Run: `node tests/level-definitions-check.mjs`

Expected: FAIL because the training map and console still exist.

- [ ] **Step 3: Delete the complete feature path**

```js
// level-definitions.js: do not include createTrainingLevel() in the returned levels.
return { hub, port, archive, crossroads, spring };

// game-runtime.js: remove the training import, state property, combat branches,
// interaction cases, save/restore exceptions, and renderer branch rather than
// converting the console into an inert prop.
```

- [ ] **Step 4: Update the browser test to use the live combat zone instead**

```js
test("the first zone supports real combat", async ({ page }) => {
  await startFreshGame(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("port"));
  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe("port");
});
```

- [ ] **Step 5: Verify removal**

Run: `node tests/level-definitions-check.mjs && npm run test:e2e -- --grep "first zone supports real combat"`

Expected: PASS; no interaction opens a static training screen.

- [ ] **Step 6: Commit**

```bash
git add src/systems/level-definitions.js src/runtime/game-runtime.js src/data/asset-manifest.js tests/level-definitions-check.mjs tests/e2e/game-flow.spec.mjs
git rm src/systems/training-session.js tests/training-session-check.mjs
git commit -m "fix: remove obsolete TVA training room"
```

## Task 2: Restore authored interaction state and capture a recoverable pre-verdict checkpoint

**Files:**
- Create: `src/systems/interactable-runtime-state.js`
- Create: `src/systems/bad-ending-recovery.js`
- Modify: `src/runtime/game-runtime.js:2700-3220,4090-4260,5100-5230,7580-7700,7870-7950`
- Create: `tests/interactable-runtime-state-check.mjs`
- Create: `tests/bad-ending-recovery-check.mjs`

**Interfaces:**
- Produces `captureInteractableRuntimeState(levels): Map<string, object>` and `restoreInteractableRuntimeState(levels, snapshots): void`.
- Produces `createFinalVerdictCheckpoint({ levelId, player, inventory, quests, narrative, interactables }): object` and `restoreFinalVerdictCheckpoint(checkpoint): object`.
- Runtime consumes a checkpoint immediately before `applyNarrativeChoice()` for the five zone verdict resolvers.

- [ ] **Step 1: Write a failing replay-state test**

```js
const levels = { port: { interactables: [{ id: "red-compass", interactionType: "rewardCompass", dialogueKey: "compass" }] } };
const authored = captureInteractableRuntimeState(levels);
levels.port.interactables[0].interactionType = "compassVerdict";
levels.port.interactables[0].collected = true;
restoreInteractableRuntimeState(levels, authored);
assert.deepEqual(levels.port.interactables[0], {
  id: "red-compass", interactionType: "rewardCompass", dialogueKey: "compass", collected: false
});
```

- [ ] **Step 2: Run both new system tests and verify failure**

Run: `node tests/interactable-runtime-state-check.mjs && node tests/bad-ending-recovery-check.mjs`

Expected: FAIL because both modules do not exist.

- [ ] **Step 3: Implement deep-copy state helpers**

```js
const RUNTIME_FIELDS = ["interactionType", "dialogueKey", "prompt", "collected", "used", "purified", "activated"];
export function captureInteractableRuntimeState(levels) {
  return new Map(Object.entries(levels).map(([levelId, level]) => [
    levelId,
    new Map((level.interactables ?? []).map((item) => [
      item.id,
      Object.fromEntries(RUNTIME_FIELDS.filter((field) => field in item).map((field) => [field, structuredClone(item[field])]))
    ]))
  ]));
}
export function restoreInteractableRuntimeState(levels, snapshots) {
  for (const [levelId, itemSnapshots] of snapshots) for (const item of levels[levelId].interactables ?? []) {
    Object.assign(item, structuredClone(itemSnapshots.get(item.id)));
    Object.assign(item, { collected: false, used: false, purified: false, activated: false });
  }
}

export function createFinalVerdictCheckpoint(snapshot) {
  return structuredClone(snapshot);
}
export function restoreFinalVerdictCheckpoint(checkpoint) {
  return structuredClone(checkpoint);
}
```

- [ ] **Step 4: Capture before every final choice and restore on a zone Bad Ending**

```js
const checkpoint = createFinalVerdictCheckpoint(createCampaignCheckpoint(item));
const option = applyNarrativeChoice(choiceId);
if (candidate.kind === "bad" || candidate.kind === "secret") {
  triggerNarrativeEnding(candidate, summary, checkpoint);
  return;
}
```

```js
const restored = restoreFinalVerdictCheckpoint(state.badEndingRecovery.checkpoint);
applyCampaignCheckpoint(restored);
state.corruption = 0;
loadLevel(restored.levelId, restored.spawn);
saveGameProgress();
```

- [ ] **Step 5: Verify regressions**

Run: `node tests/interactable-runtime-state-check.mjs && node tests/bad-ending-recovery-check.mjs && npm run test:unit`

Expected: PASS; a reset/replay restores the compass to `rewardCompass`, and zone Bad Ending recovery keeps the verdict available while sealing the portal.

- [ ] **Step 6: Commit**

```bash
git add src/systems/interactable-runtime-state.js src/systems/bad-ending-recovery.js src/runtime/game-runtime.js tests/interactable-runtime-state-check.mjs tests/bad-ending-recovery-check.mjs
git commit -m "fix: recover campaign state after zone bad endings"
```

## Task 3: Give every ending its own correctly routed soundtrack

**Files:**
- Create: `src/data/ending-audio-definitions.js`
- Modify: `src/data/media-sources.js:1-55`
- Modify: `src/runtime/game-runtime.js:1880-1930,5260-5290`
- Modify: `src/systems/audio-system.js:180-240`
- Modify: `tests/audio-system-check.mjs`
- Modify: `ASSET_SOURCES.md`
- Add: `assets/audio/*.ogg`, `assets/audio/*.mp3`

**Interfaces:**
- Produces `ENDING_AUDIO_KEY_BY_ID`, `getEndingAudioKey(endingId): string | null`, and an exhaustive `ENDING_IDS` test fixture.
- `createAudioSystem({ musicSounds, getEndingMusicKey })` receives the resolver and pauses/resets every inactive ending track.

- [ ] **Step 1: Write failing exhaustive resolver and audio tests**

```js
assert.equal(getEndingAudioKey("zone2-fading-fires"), "zone2FadingFires");
assert.equal(getEndingAudioKey("neutral"), "neutralEnding");
assert.equal(getEndingAudioKey("unknown"), null);
audio.sync({ mode: "ending", endingId: "zone3a-missed-moment", currentLevelId: "crossroads" });
assert.equal(musicSounds.zone3aMissedMoment.paused, false);
assert.equal(musicSounds.badEnding.paused, true);
```

- [ ] **Step 2: Run and verify failure**

Run: `node tests/audio-system-check.mjs`

Expected: FAIL because named ending music does not exist or route.

- [ ] **Step 3: Declare the exact ending map and load loops**

```js
export const ENDING_AUDIO_KEY_BY_ID = Object.freeze({
  good: "goodEnding", neutral: "neutralEnding", bad: "badEnding",
  "zone1-lost-compass": "zone1LostCompass", "zone2-fading-fires": "zone2FadingFires",
  "zone3a-missed-moment": "zone3aMissedMoment", "zone3b-divided-border": "zone3bDividedBorder",
  "zone4-stalled-machine": "zone4StalledMachine", "secret-corruption": "secretCorruption"
});
export const getEndingAudioKey = (endingId) => ENDING_AUDIO_KEY_BY_ID[endingId] ?? null;
```

- [ ] **Step 4: Acquire and optimize the eight CC0 loops, then record provenance**

Use only these declared tracks: Eponasoft `Global Resonance` (neutral), Eponasoft `Cold Silence` (generic bad), yd `Return to Nowhere` (zone 1), Paul Wortmann `Dark Cavern Ambient` (zone 2), TokyoGeisha `Dream 2 Ambience` (zone 3A), yd `EmptyCity` (zone 3B), yd `Factory ambience` (zone 4), and Juhani Junkala `Horror Atmosphere` (secret). Convert each source to repository `.ogg` and `.mp3` loop files, retain a minimum 20-second usable loop, and add author, URL, CC0 license, conversion, and ending usage to `ASSET_SOURCES.md`.

- [ ] **Step 5: Route exactly one active ending loop**

```js
const endingKey = state.mode === "ending" ? getEndingMusicKey(state.endingId) : null;
const activeMusic = endingKey ? musicSounds[endingKey] : getLevelMusic(state);
syncSound(activeMusic, true);
resetInactiveSounds(activeMusic, Object.values(musicSounds));
```

- [ ] **Step 6: Verify all endings**

Run: `node tests/audio-system-check.mjs && node tests/media-sources-check.mjs && npm run build`

Expected: PASS; each named Bad Ending and neutral ending selects its defined loop, and no ending loop continues after returning to play.

- [ ] **Step 7: Commit**

```bash
git add src/data/ending-audio-definitions.js src/data/media-sources.js src/runtime/game-runtime.js src/systems/audio-system.js tests/audio-system-check.mjs tests/media-sources-check.mjs ASSET_SOURCES.md assets/audio
git commit -m "feat: add distinct music for every ending"
```

## Task 4: Separate historical book from the persistent TVA dossier

**Files:**
- Create: `src/systems/monster-codex-collection.js`
- Modify: `src/runtime/game-runtime.js:1460-1530,3850-3900,4450-4540,7670-7710`
- Modify: `index.html:150-230`
- Modify: `styles.css:900-1080`
- Create: `tests/monster-codex-collection-check.mjs`
- Modify: `tests/e2e/game-flow.spec.mjs:700-760`

**Interfaces:**
- Produces `loadMonsterCodexCollection(storage)`, `recordMonsterCodexEntry(collection, entry, now)`, and `getMonsterCodexEntries(collection)`.
- Produces `getHistoricalStoryEntryIds(): string[]`; ending, achievement, and monster records are excluded.
- Produces `openTvaDossier(tab = "endings")` and `closeTvaDossier()`.

- [ ] **Step 1: Write failing separation tests**

```js
const collection = recordMonsterCodexEntry([], { id: "archive-raider", name: "Kẻ phá kho" }, "2026-07-15T00:00:00.000Z");
assert.equal(collection.length, 1);
assert.deepEqual(getHistoricalStoryEntryIds(["monster:archive-raider", "history:port"]), ["history:port"]);
```

- [ ] **Step 2: Run test and verify failure**

Run: `node tests/monster-codex-collection-check.mjs`

Expected: FAIL because monster discoveries are still unlocked as story-book records.

- [ ] **Step 3: Store monster discovery in its own persistent collection**

```js
function unlockMonsterCodex(monster) {
  state.monsterCodex = recordMonsterCodexEntry(state.monsterCodex, getMonsterCodexEntry(monster), new Date().toISOString());
  saveMonsterCodexCollection(state.monsterCodex);
}
```

- [ ] **Step 4: Render the dossier without altering historical-book data**

```html
<section id="tva-dossier-modal" class="tva-dossier hidden" role="dialog" aria-modal="true" aria-labelledby="tva-dossier-title">
  <h2 id="tva-dossier-title">Hồ sơ TVA</h2>
  <div role="tablist" aria-label="Hồ sơ TVA">
    <button data-dossier-tab="endings" role="tab">Kết cục</button>
    <button data-dossier-tab="monsters" role="tab">Đối thủ</button>
    <button data-dossier-tab="milestones" role="tab">Dấu mốc</button>
  </div>
  <div id="tva-dossier-content"></div>
  <button id="close-tva-dossier">Đóng</button>
</section>
```

- [ ] **Step 5: Connect the archive desk to the dossier and preserve animated monster previews**

```js
case "openMemoryArchive":
  openTvaDossier("endings");
  break;
```

The Monster tab must use the existing normalized animated sprite strips and frame timing, never a screenshot or rectangle fallback.

- [ ] **Step 6: Verify book/dossier split**

Run: `node tests/monster-codex-collection-check.mjs && npm run test:e2e -- --grep "TVA dossier|history book"`

Expected: PASS; fighting an enemy creates a dossier entry but does not increase the historical book count.

- [ ] **Step 7: Commit**

```bash
git add src/systems/monster-codex-collection.js src/runtime/game-runtime.js index.html styles.css tests/monster-codex-collection-check.mjs tests/e2e/game-flow.spec.mjs
git commit -m "feat: separate TVA dossier from history book"
```

## Task 5: Hide invalid navigation during reset waves and complete browser verification

**Files:**
- Modify: `src/runtime/game-runtime.js:7480-7520,7920-8070`
- Modify: `tests/e2e/game-flow.spec.mjs:650-720,760-820`
- Add: `reports/playtests/2026-07-15-progression-recovery.md`

**Interfaces:**
- Consumes `state.mode`, `state.badEndingRecovery`, and Task 2 checkpoint restoration.
- Produces an ending renderer that does not draw exit labels, navigation assist, or minimap navigation targets while a reset wave is active.

- [ ] **Step 1: Write the failing guard test**

```js
assert.match(runtime, /if \(state\.mode === "playing"\) \{\s*drawNavigationAssist\(\);/);
assert.match(runtime, /if \(state\.mode !== "ending"\) \{\s*drawLevelExitPortals/);
```

- [ ] **Step 2: Run and verify failure**

Run: `node tests/game-runtime-render-check.mjs`

Expected: FAIL because reset waves still draw “Về trung tâm”.

- [ ] **Step 3: Gate navigation-only Canvas layers**

```js
if (state.mode !== "ending") {
  drawLevelExitPortals(currentLevel().exits);
}
if (state.mode === "playing") {
  drawNavigationAssist();
  drawMiniMap();
}
```

- [ ] **Step 4: Run automated and browser checks**

Run: `npm run test:unit && npm run build && npm run test:e2e`

Expected: PASS.

Manually run the Vite server and capture Canvas screenshots for: the TVA hub with no training console; zone 1 New Game compass before/after verdict; each zone’s Bad Ending reset wave with no return label; each named ending with its music element active; TVA dossier tabs; reload after Good Ending and Bad Ending. Record the exact routes, assertions, screenshots, held-key/key-release, blur/tab visibility, modal close, scene reload, and results in `reports/playtests/2026-07-15-progression-recovery.md`.

- [ ] **Step 5: Commit**

```bash
git add src/runtime/game-runtime.js tests/e2e/game-flow.spec.mjs tests/game-runtime-render-check.mjs reports/playtests/2026-07-15-progression-recovery.md
git commit -m "fix: hide navigation chrome during ending resets"
```

## Plan Self-Review

- Spec coverage: Task 1 removes the broken room; Task 2 fixes replay, compass, sealed portal, and Bad Ending recovery; Task 3 assigns all named ending tracks; Task 4 isolates history from collectible dossiers; Task 5 removes the reset-wave “Về trung tâm” leak and performs required Canvas playtests.
- Placeholder scan: no `TBD`, `TODO`, deferred implementation, or unspecified source mappings remain.
- Type consistency: Task 2 exports the checkpoint helpers consumed by the runtime; Task 3 exports `getEndingAudioKey` used by the audio system; Task 4 exports monster collection functions used by `unlockMonsterCodex`.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-15-progression-recovery-tva-dossier-plan.md`. The user approved immediate inline execution, so use `superpowers:executing-plans` task-by-task with review checkpoints.
