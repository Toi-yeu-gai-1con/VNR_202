# Core Loop Upgrades Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved onboarding, progression, combat readability, boss, minimap, and zone-summary improvements.

**Architecture:** Keep the canvas game loop as the renderer and add serializable progression state to `game.js`. Use lightweight DOM overlays for tutorial, continue, and zone summary. Reuse the existing monster and quest data rather than introducing an engine or dependency.

**Tech Stack:** Vanilla ES modules, HTML canvas, DOM/CSS, browser localStorage, Playwright CLI.

## Global Constraints

- Preserve both existing endings and the five-relic progression route.
- Store only serializable simulation state in localStorage.
- Keep normal-play HUD coverage compact.
- Reuse the current monster system for bosses.

---

### Task 1: Add test contracts

- [ ] Create `tests/core-loop-upgrades-check.mjs` before production code.
- [ ] Run `node tests/core-loop-upgrades-check.mjs` and confirm the expected missing-feature failure.

### Task 2: Add onboarding and progression persistence

- [ ] Modify `index.html`, `styles.css`, and `game.js` for tutorial/continue/zone-summary overlays.
- [ ] Add versioned save/load helpers, checkpoint data, and objective progress copy.
- [ ] Run the core-loop test and browser boot/continue checks.

### Task 3: Improve combat readability and bosses

- [ ] Add camera-shake and hit-feedback state, monster wind-up telegraphs, and invulnerability visuals.
- [ ] Mark one boss per playable zone with existing monster metadata and give boss health bars distinct treatment.
- [ ] Run the core-loop test and a browser debug combat check.

### Task 4: Improve navigation and zone closure

- [ ] Add minimap marker categories and a zone-complete summary trigger when a relic is collected.
- [ ] Run the core-loop test, syntax check, and browser map transition check.

### Task 5: Commit and hand off

- [ ] Stage the implementation, generated PixelLab asset only if its visual QA passes, tests, and plan.
- [ ] Commit with `feat: improve core game loop`.
