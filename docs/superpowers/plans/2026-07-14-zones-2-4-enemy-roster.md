# Zones 2–4 Enemy Roster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce eleven new animated enemy packs, approve them by zone, then route the complete twelve-enemy Zones 2–4 roster into the Canvas runtime in one change.

**Architecture:** Keep the custom Canvas 2D renderer and existing combat behavior. Build every character from one identity seed into five three-direction atlases, normalize to fixed 64px frames, validate and preview each pack, then use a data-owned registry to load and route the approved roster without generic fallbacks.

**Tech Stack:** Vite, Canvas 2D, Node.js 20+, Sharp, built-in Imagegen, Playwright.

## Global Constraints

- Preserve the existing AI, balance, hitboxes, maps, story, audio, and Canvas architecture.
- Generate `idle 4`, `walk 4`, `attack 4`, `hurt 3`, and `death 6` frames for `south`, `north`, and `east`; mirror `east` for `west`.
- Normalize every frame to a transparent 64×64 canvas with shared scale and a stable bottom-centre anchor.
- Never ship recolours, static stand-ins, geometric primitives, debug shapes, Zone 1 bodies, or generic fallback art.
- Review and approve one whole zone at a time; do not add any Zones 2–4 runtime route until all three zones pass.
- Preserve unrelated working-tree changes and do not edit `PLAN.md`.

---

### Task 1: Shared asset pipeline

**Files:**
- Create: `scripts/remove-monster-chroma.mjs`
- Create: `scripts/build-monster-pack-preview.mjs`
- Create: `scripts/validate-monster-pack.mjs`
- Modify: `scripts/normalize-character-atlas.mjs`
- Test: `tests/monster-pack-pipeline-check.mjs`

**Interfaces:**
- `removeMonsterChroma(input, output)` removes a flat generated background and despills edge pixels.
- `validateMonsterPack({ directory, basename })` validates the seed, atlases, and fifteen strips.
- Preview CLI accepts `<asset-directory> <basename>` and writes `<basename>-full-animation-preview.png`.

- [ ] Write a failing pipeline test using Crop Saboteur as the known-good fixture and malformed metadata as the rejection case.
- [ ] Run `node tests/monster-pack-pipeline-check.mjs` and verify it fails because the shared interfaces do not exist.
- [ ] Implement the minimal chroma, validation, normalization, and preview interfaces.
- [ ] Run the focused test, then `npm run test:unit`, and verify both pass.

### Task 2: Zone 2 art batch

**Files:**
- Create: `assets/monsters/zone2-archive-saboteur/*`
- Create: `assets/monsters/zone2-cipher-marksman/*`
- Create: `assets/monsters/zone2-corrupted-archivist/*`
- Create: `assets/monsters/zone2-shadow-curator/*`
- Create: `assets/monsters/zone2-roster-preview.png`

- [ ] Generate one approved-identity seed for each character on a flat chroma background.
- [ ] From each seed generate complete three-row atlases for all five states in one state-level pass.
- [ ] Remove chroma, normalize all fifteen strips, run the validator, and render each full preview.
- [ ] Build the Zone 2 roster preview and obtain user approval before continuing.

### Task 3: Zone 3 art batch

**Files:**
- Create the four approved Zone 3 pack directories and `assets/monsters/zone3-roster-preview.png`.

- [ ] Repeat the seed-to-five-atlas pipeline for Strategic-Hamlet Enforcer (`crossroads-raider`), Bridge Checkpoint Marksman (`crossroads-marksman`), Psychological-Warfare Operator (`crossroads-chanter`), and Repression Commander (`southern-tyrant`). Every design belongs to Zone 3B (1954–1975), uses historically grounded fictional mid-century equipment, and avoids real-unit insignia, flags, hand crossbows, bamboo speaking horns, modern plastic equipment, and fantasy anatomy.
- [ ] Validate all sixty strips, build previews, and obtain user approval before continuing.

### Task 4: Zone 4 art batch

**Files:**
- Preserve: `assets/monsters/zone4-crop-saboteur/*`
- Create the Bureau Marksman, Ration Chanter, and Bureaucracy Beast pack directories.
- Create: `assets/monsters/zone4-roster-preview.png`

- [ ] Repeat the complete pipeline for the three unfinished characters.
- [ ] Validate all Zone 4 packs together, build the four-character preview, and obtain user approval.

### Task 5: One-time runtime integration

**Files:**
- Create: `src/data/monster-art-definitions.js`
- Modify: `src/data/render-config.js`
- Modify: `src/data/asset-manifest.js`
- Modify: `src/runtime/game-runtime.js`
- Replace: `tests/reject-unapproved-zone-art-check.mjs`
- Test: `tests/monster-art-routing-check.mjs`

- [ ] Write failing assertions for all twelve ID-to-art-key mappings, animation metadata, asset groups, east-to-west mirroring, and absence of generic fallback routes.
- [ ] Run the focused checks and verify they fail because no runtime registry exists.
- [ ] Add `MONSTER_ART_DEFINITIONS` and `MONSTER_ART_KEY_BY_ID`, then generate loader paths from the registry (`run` loads `walk`).
- [ ] Route every roster and boss ID to its dedicated key and make all generated monster images critical to the appropriate zone load group.
- [ ] Prevent dedicated Zone 2–4 keys from reaching archetype, PixelLab, Pixel Crawler, rifleman, or rectangle drawing paths.
- [ ] Run focused checks, `npm run test:unit`, and `npm run build`.

### Task 6: Browser verification

**Files:**
- Modify: `tests/e2e/game-flow.spec.mjs`
- Output: Playwright screenshots for archive, crossroads, and spring.

- [ ] Add failing E2E coverage for the dedicated roster keys and phase-aware bosses in all three zones.
- [ ] Exercise idle, movement direction, attack, hurt, death, phase two, key release, blur, visibility, pause, collision, and reload.
- [ ] Capture a roster and close combat screenshot for each zone.
- [ ] Run `npm run test` and visually inspect every Canvas screenshot before claiming completion.
