# TVA Causality Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the TVA causal graph with a readable brass-and-verdigris Causality Console without changing narrative progression, reset behavior, or endings.

**Architecture:** Keep the existing `CAUSALITY_MAP_NODES`, `CAUSALITY_MAP_LINKS`, relic inventory, reconstructed-memory set, risk data, and reset traces as the source of truth. Extend node metadata with console layout roles, render a semantic console shell plus SVG conduit layers in the TVA dossier renderer, and style the presentation entirely with scoped CSS. Existing detail text stays below the map and selection continues to call `renderTvaDossier()`.

**Tech Stack:** Browser DOM/SVG, scoped CSS animations, Node assert unit checks, Playwright, Vite.

## Global Constraints

- Preserve all five relic IDs, ending thresholds, reset/save semantics, and existing historical copy.
- Use the shipped relic sheets in `assets/story/relics/`; do not draw generic replacement icons or ship fallback art.
- Respect `prefers-reduced-motion`, keyboard focus, pointer interaction, and quiet UI audio.
- Do not add a new modal, gameplay reward, or geographic Vietnam map to this TVA dossier.
- Keep the game’s current vanilla browser renderer and DOM UI architecture.

---

### Task 1: Add a regression contract for the console structure

**Files:**
- Modify: `tests/relic-experience-check.mjs`
- Test: `tests/relic-experience-check.mjs`

**Interfaces:**
- Consumes: `CAUSALITY_MAP_NODES`, `CAUSALITY_MAP_LINKS`, `RELIC_VISUALS`, and `src/runtime/game-runtime.js` source.
- Produces: source-level regression coverage for the console’s five sockets, real relic art, conduit status classes, and actual reset-only loop behavior.

- [ ] **Step 1: Write the failing test**

Append these assertions after the existing causal-map assertions:

```js
assert.ok(
  CAUSALITY_MAP_NODES.every((node) => typeof node.consoleSlot === "string" && node.consoleSlot.length > 0),
  "Every relic owns a named Causality Console socket.",
);
assert.match(runtimeSource, /tva-causality-console/, "The TVA renderer creates the themed Causality Console shell.");
assert.match(runtimeSource, /tva-causality-relic-art/, "Every console socket renders the relic’s own sheet instead of text-only buttons.");
assert.match(runtimeSource, /tva-causality-rail/, "The console renders a dated historical rail.");
assert.match(runtimeSource, /tva-causality-reset-loop/, "A reset trace renders a dedicated clock-loop marker.");
assert.match(runtimeSource, /if \(!resetZones\.has\(getCausalityZoneId\(node\.relicId\)\)\) continue;/, "Reset loop markers are created only for recorded reset traces.");
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node tests/relic-experience-check.mjs`

Expected: FAIL because `consoleSlot`, console shell, relic socket art, rail, and reset loop do not yet exist.

- [ ] **Step 3: Leave the test in place for Tasks 2–3**

Do not weaken these assertions. Task 2 creates `consoleSlot`; Task 3 supplies the renderer markers.

- [ ] **Step 4: Run the focused test after Tasks 2–3**

Run: `node tests/relic-experience-check.mjs`

Expected: `PASS: TVA relic sheets, memory records, causal map and unified-territory cinematic are complete.`

### Task 2: Add stable console-layout metadata

**Files:**
- Modify: `src/data/relic-experience.js`
- Test: `tests/relic-experience-check.mjs`

**Interfaces:**
- Consumes: the five stable relic IDs.
- Produces: `consoleSlot` values `left`, `upper-left`, `center`, `upper-right`, and `right` consumed by the TVA renderer and CSS.

- [ ] **Step 1: Assign each node a console socket**

Add `consoleSlot` alongside the existing position values:

```js
{ relicId: "red-compass", consoleSlot: "left", /* existing fields */ }
{ relicId: "unified-emblem", consoleSlot: "upper-left", /* existing fields */ }
{ relicId: "vietminh-thread", consoleSlot: "center", /* existing fields */ }
{ relicId: "healed-map", consoleSlot: "upper-right", /* existing fields */ }
{ relicId: "doi-moi-gear", consoleSlot: "right", /* existing fields */ }
```

- [ ] **Step 2: Run the focused test**

Run: `node tests/relic-experience-check.mjs`

Expected: failure now mentions only missing runtime console markers.

### Task 3: Render the Causality Console and its semantic controls

**Files:**
- Modify: `src/runtime/game-runtime.js`
- Test: `tests/relic-experience-check.mjs`

**Interfaces:**
- Consumes: `node.consoleSlot`, `RELIC_VISUALS[node.relicId]`, `getCausalityNodeStatus`, `getCausalityLinkStatus`, `resetZones`, and existing `activeCausalityRelicId`.
- Produces: `renderTvaCausalityMap()` with `.tva-causality-console`, `.tva-causality-rail`, `.tva-causality-relic-art`, and `.tva-causality-reset-loop` DOM elements.

- [ ] **Step 1: Add a console frame and dated rail before the SVG conduits**

Replace the map’s generic class assignment and append these elements before `links`:

```js
map.className = "tva-causality-map tva-causality-console";
const rail = document.createElement("div");
rail.className = "tva-causality-rail";
for (const year of ["1922", "1930", "1945", "1975", "1986"]) {
  rail.append(createTvaDossierText("span", "tva-causality-year", year));
}
map.append(rail);
```

- [ ] **Step 2: Render each node as a socket with real relic art**

Inside the `for (const node of CAUSALITY_MAP_NODES)` loop, replace text-only node construction with:

```js
button.className = `tva-causality-node tva-causality-socket is-${status} is-${node.consoleSlot}`;
button.type = "button";
button.setAttribute("aria-pressed", String(node.relicId === state.activeCausalityRelicId));
button.setAttribute("aria-label", `${node.title} — ${node.subtitle}`);
const image = document.createElement("img");
image.className = "tva-causality-relic-art";
image.src = RELIC_VISUALS[node.relicId].src;
image.alt = "";
image.style.setProperty("--relic-color", RELIC_VISUALS[node.relicId].color);
const label = createTvaDossierText("span", "tva-causality-node-label", `${node.title} · ${node.subtitle}`);
button.append(image, label);
```

Keep the existing click callback untouched so selection still refreshes the dossier detail. Do not add a key listener: native `<button>` already supports Enter and Space.

- [ ] **Step 3: Make reset traces into real loop markers**

After appending the socket, create the marker only when saved state records a reset:

```js
for (const node of CAUSALITY_MAP_NODES) {
  if (!resetZones.has(getCausalityZoneId(node.relicId))) continue;
  const reset = createTvaDossierText("span", "tva-causality-reset-loop", "↶ RESET WAVE");
  reset.classList.add(`is-${node.consoleSlot}`);
  map.append(reset);
}
```

Remove the old `has-reset` pseudo-label class toggle and `createCausalityResetElement()` SVG loop, leaving connectors responsible only for branch conduits.

- [ ] **Step 4: Run the focused regression test**

Run: `node tests/relic-experience-check.mjs`

Expected: PASS.

### Task 4: Style the brass TVA console without changing gameplay layout

**Files:**
- Modify: `styles.css`
- Test: `tests/relic-experience-check.mjs`

**Interfaces:**
- Consumes: console/rail/socket/relic/reset class names from Task 3.
- Produces: a responsive visual hierarchy that keeps labels legible and shows every progression state distinctly.

- [ ] **Step 1: Replace the current generic grid map rules**

Replace the `.tva-causality-map` through `.tva-causality-detail` section with scoped console styling:

```css
.tva-causality-console {
  min-height: 25rem;
  border: 0.45rem ridge #815226;
  border-radius: 1rem;
  background: radial-gradient(circle at 50% 44%, rgba(80, 92, 61, .6), rgba(7, 16, 17, .98) 68%);
  box-shadow: inset 0 0 0 .12rem #e1af55, inset 0 0 2.6rem rgba(0, 0, 0, .9);
}
.tva-causality-rail { position:absolute; inset:50% 8% auto; height:.55rem; display:flex; justify-content:space-between; background:linear-gradient(90deg,#a35d30,#f2ca68 16%,#80d5b5 50%,#efc55e 83%,#9d5b2d); }
.tva-causality-socket { width:6.4rem; min-height:7.7rem; display:grid; justify-items:center; gap:.32rem; border-radius:50% 50% .7rem .7rem; }
.tva-causality-relic-art { width:4rem; height:4rem; object-fit:cover; object-position:left; image-rendering:pixelated; filter:drop-shadow(0 0 .42rem var(--relic-color)); }
```

Add `is-left`, `is-upper-left`, `is-center`, `is-upper-right`, and `is-right` absolute positions. Use the same classes to place reset markers below the relevant socket. Define unique visuals for `.is-locked`, `.is-collected`, `.is-reconstructed`, `.is-fractured`, and `.is-selected`.

- [ ] **Step 2: Add controlled motion and accessibility**

Add a 300–450 ms socket/rail reveal and a slow current animation only to collected/reconstructed conduit classes. Include:

```css
@media (prefers-reduced-motion: reduce) {
  .tva-causality-console *,
  .tva-causality-console *::before,
  .tva-causality-console *::after { animation: none !important; transition: none !important; }
}
```

Ensure focus is visibly distinct from selected state:

```css
.tva-causality-socket:focus-visible { outline: .18rem solid #fff0a8; outline-offset: .28rem; }
```

- [ ] **Step 3: Run the focused regression test and production build**

Run: `node tests/relic-experience-check.mjs && npm run build`

Expected: regression check and Vite build PASS.

### Task 5: Playtest all causal states and responsive behavior

**Files:**
- Modify: `tests/e2e/game-flow.spec.mjs`
- Test: `tests/e2e/game-flow.spec.mjs`

**Interfaces:**
- Consumes: TVA memory archive interaction, causality tab button, saved narrative/reset state, and `tva-causality-*` selectors.
- Produces: browser coverage proving real relic sockets, node selection, reset-only marker, and reduced-motion presentation work.

- [ ] **Step 1: Add a causality-console browser test**

Add a test that starts a debug session, injects a save with `red-compass` collected and a Zone 1 reset trace, opens `tva-memory-archive`, switches to `[data-tva-dossier-tab="causality"]`, then asserts:

```js
await expect(page.locator(".tva-causality-console")).toBeVisible();
await expect(page.locator(".tva-causality-socket")).toHaveCount(5);
await expect(page.locator(".tva-causality-relic-art")).toHaveCount(5);
await expect(page.locator(".tva-causality-reset-loop")).toHaveCount(1);
await page.locator(".tva-causality-socket.is-left").focus();
await page.keyboard.press("Enter");
await expect(page.locator(".tva-causality-detail")).toContainText("Đường lối");
```

Capture a full-page screenshot named `tva-causality-console-reset.png`.

- [ ] **Step 2: Add reduced-motion coverage**

Start the same test with `reducedMotion: true` in the settings fixture and assert that `.tva-causality-console` remains visible and the selected socket remains keyboard selectable. Capture `tva-causality-console-reduced-motion.png`.

- [ ] **Step 3: Run the browser tests and a focused presentation pass**

Run: `npx playwright test tests/e2e/game-flow.spec.mjs --grep "causality console"`

Expected: PASS with two screenshots.

Then run: `npm run test:unit && npm run build`

Expected: all checks PASS.

- [ ] **Step 4: Commit the implementation**

```bash
git add src/data/relic-experience.js src/runtime/game-runtime.js styles.css tests/relic-experience-check.mjs tests/e2e/game-flow.spec.mjs docs/superpowers/plans/2026-07-19-tva-causality-console.md
git commit -m "feat: upgrade TVA causality console"
```
