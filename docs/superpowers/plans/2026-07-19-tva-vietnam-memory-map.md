# TVA Vietnam Memory Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved “Việt Nam bằng ký ức” direction on an isolated comparison branch without changing progression or ending behavior.

**Architecture:** Extend the existing causality node data with map placement roles, then replace only the presentation inside `renderTvaCausalityMap()`. Reuse the production Vietnam cinematic art and relic sheets; use scoped DOM/SVG/CSS for state, interaction, responsiveness, and motion.

**Tech Stack:** Vanilla JavaScript, DOM/SVG, CSS, Node contract tests, Playwright browser tests.

## Global Constraints

- Preserve all existing narrative, save, quest, reset, and ending behavior.
- Use real relic sheets and the production Vietnam map artwork; do not add placeholders.
- Preserve Vietnamese copy and UTF-8 encoding.
- Respect keyboard focus and reduced motion.
- Verify Canvas/UI changes with browser screenshots.

---

### Task 1: Define the memory-map contract

**Files:**
- Modify: `tests/relic-experience-check.mjs`
- Modify: `src/data/relic-experience.js`

- [ ] Add failing assertions requiring five unique `memoryMapSlot` values and map-coordinate metadata.
- [ ] Run `node tests/relic-experience-check.mjs` and confirm the new assertion fails because metadata is absent.
- [ ] Add fixed, north-to-south placement metadata for all five nodes.
- [ ] Re-run the test and confirm the data contract passes.

### Task 2: Render the Vietnam memory composition

**Files:**
- Modify: `tests/relic-experience-check.mjs`
- Modify: `src/runtime/game-runtime.js`

- [ ] Add failing source contracts for `.tva-memory-map`, `.tva-memory-map-art`, five `.tva-memory-seal` controls, `aria-pressed`, and reset markers gated by recorded reset zones.
- [ ] Run the contract test and confirm failure on missing renderer markers.
- [ ] Render the production map artwork, SVG memory currents, real relic sheets, labels, emotional plaque, spotlight, and conditional reset ripples.
- [ ] Preserve click selection and native keyboard activation.
- [ ] Re-run the contract test and confirm it passes.

### Task 3: Build the visual system

**Files:**
- Modify: `tests/relic-experience-check.mjs`
- Modify: `styles.css`

- [ ] Add failing contracts for the memory-map shell, map spotlight, seal state styling, reset ripple, responsive layout, and reduced-motion handling.
- [ ] Run the contract test and confirm it fails on missing CSS selectors.
- [ ] Add the scoped green-gold memory atmosphere, scaled production map, readable seal placements, luminous state language, focus styles, presentation sizing, mobile layout, and reduced-motion rules.
- [ ] Re-run unit tests and build.

### Task 4: Browser regression and visual QA

**Files:**
- Modify: `tests/e2e/game-flow.spec.mjs`

- [ ] Add a browser test that opens `/?debugTva=causality&debugTvaRelics=5&debugTvaReset=zone1`, verifies the map artwork, five real relic seals, one reset ripple, keyboard selection, and visible selected detail.
- [ ] Add a reduced-motion check and a full-five-relic no-reset check.
- [ ] Run the focused Playwright tests.
- [ ] Capture and inspect screenshots at 1366×768 for complete and reset/fractured states; adjust layout until all five seals and the map fit cleanly.

### Task 5: Final verification and comparison handoff

**Files:**
- Modify only files required by failed verification.

- [ ] Run `npm run test:unit`.
- [ ] Run `npm run build`.
- [ ] Run the focused TVA Playwright tests.
- [ ] Commit the implementation on `codex/tva-vietnam-memory-map`.
- [ ] Start a local server on a different port from Direction 1 and provide both debug URLs for side-by-side comparison.
