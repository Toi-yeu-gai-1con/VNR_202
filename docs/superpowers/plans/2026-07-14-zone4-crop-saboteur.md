# Zone 4 Crop Saboteur Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship one approved animated Zone 4 Crop Saboteur pack without reintroducing procedural block art or unreviewed runtime assets.

**Architecture:** Generate one transparent, high-quality south-facing seed with the built-in image-generation workflow. Derive complete normalized strips from that same seed and keep them out of the runtime until their preview and Canvas screenshot receive approval.

**Tech Stack:** Existing Canvas 2D renderer, Vite, Node.js, built-in image generation, Game Studio sprite-pipeline, Sharp, Playwright.

## Global Constraints

- Preserve the custom Canvas 2D renderer.
- Use transparent 64×64, bottom-centre anchored frames; south/north/east only, with runtime east-to-west mirroring.
- Depict a rural saboteur in worn olive-brown work clothing, dark face cloth, shoulder bag, and wooden-handled sickle.
- Never ship rectangles, procedural block figures, static fallback art, opaque chroma key, scenery, labels, or mismatched frames.
- Do not update `getMonsterArtKey` before visual approval.

---

### Task 1: Seed and contract

**Files:**
- Create: `assets/monsters/zone4-crop-saboteur/crop-saboteur-seed.png`
- Create: `assets/monsters/zone4-crop-saboteur/crop-saboteur-art-notes.md`
- Create: `tests/crop-saboteur-art-check.mjs`

**Produces:** a 64×64 transparent south-facing seed and a test that rejects missing, non-64px, or opaque candidate art.

- [ ] Write `tests/crop-saboteur-art-check.mjs` with `sharp(seedPath).ensureAlpha()`, asserting width/height are `64` and alpha minimum is `0`.
- [ ] Run `node tests/crop-saboteur-art-check.mjs`; expect `ENOENT` before the seed exists.
- [ ] Generate this seed in one image request: `Single south-facing Vietnamese rural crop saboteur for a top-down 2D RPG, 64x64 pixel-art production sprite, transparent background. Adult human proportions, worn olive-brown work jacket and trousers, dark cloth face covering, low fabric cap, cloth shoulder bag, one wooden-handled sickle held low. Crisp deliberate pixel clusters, readable silhouette, upper-left lighting, hard dark outline, 7-9 muted colors. No scenery, text, UI, chroma key, gradients, modern tactical gear, armour, or flag. Keep the entire character and sickle inside one 64x64 frame with feet at bottom centre.`
- [ ] Normalize alpha and anchor; record source, palette, and silhouette rules in `crop-saboteur-art-notes.md`.
- [ ] Re-run `node tests/crop-saboteur-art-check.mjs`; expect PASS.
- [ ] Commit only these files: `git add assets/monsters/zone4-crop-saboteur/crop-saboteur-seed.png assets/monsters/zone4-crop-saboteur/crop-saboteur-art-notes.md tests/crop-saboteur-art-check.mjs && git commit -m "feat: add Zone 4 crop saboteur art seed"`.

### Task 2: Coherent candidate animation pack

**Files:**
- Create: `assets/monsters/zone4-crop-saboteur/crop-saboteur-{south,north,east}-{idle,walk,attack,hurt,death}.png`
- Create: `assets/monsters/zone4-crop-saboteur/crop-saboteur-preview.png`
- Modify: `tests/crop-saboteur-art-check.mjs`

**Produces:** 15 transparent strips: idle/walk/attack have four frames, hurt has three, death has six.

- [ ] Extend the test to assert every strip has width `frameCount * 64`, height `64`, and transparent pixels.
- [ ] Run it and expect `ENOENT` for the first strip.
- [ ] Generate each state in one complete strip from the seed, preserving costume/palette/proportions: idle breath plus bag/sickle settle; walk alternating feet and counter-swinging sickle; attack wind-up, low cut, contact, recovery; hurt recoil and weapon dip; death stagger, knee, collapse, stillness.
- [ ] Normalize each frame to the shared canvas and compose the required strip; no independently invented frames.
- [ ] Render `crop-saboteur-preview.png` and inspect at 1× and actual game scale for clipped weapons, slot bleed, whole-sprite jitter, and readable attack anticipation/contact/recovery.
- [ ] Run `node tests/crop-saboteur-art-check.mjs`; expect PASS.
- [ ] Commit candidate art only: `git add assets/monsters/zone4-crop-saboteur tests/crop-saboteur-art-check.mjs && git commit -m "feat: animate Zone 4 crop saboteur"`.

### Task 3: User review gate

**Files:**
- Review: `assets/monsters/zone4-crop-saboteur/crop-saboteur-preview.png`

**Produces:** explicit approval or correction request; no runtime code change.

- [ ] Show the full preview sheet and state that it is not live.
- [ ] Ask the user to approve silhouette, palette, and animation readability.
- [ ] Stop until approval. Do not modify `src/data/render-config.js` or `src/runtime/game-runtime.js`.

### Task 4: Approved runtime integration and Canvas QA

**Files:**
- Modify: `src/data/render-config.js`
- Modify: `src/runtime/game-runtime.js`
- Modify: `tests/crop-saboteur-art-check.mjs`
- Modify: `tests/e2e/game-flow.spec.mjs`
- Modify: `ASSET_SOURCES.md`

**Produces:** `zone4CropSaboteur` only for Zone 4 melee enemies; other levels retain current mappings.

- [ ] Add failing assertions that `spring` melee returns `zone4CropSaboteur` and its three directions load through `loadZone1DirectionalSprites("assets/monsters/zone4-crop-saboteur/crop-saboteur")`.
- [ ] Run `node tests/crop-saboteur-art-check.mjs`; expect assertion failure before registration.
- [ ] Add a data-owned `zone4CropSaboteur` config: 48×48 draw size, 24px shadow, directional animation, west mirror, and the approved frame counts.
- [ ] Load south/north/east strips and route only `spring` melee monsters to the key.
- [ ] Add a Playwright test that loads `spring` in a debug session and saves `zone4-crop-saboteur.png`.
- [ ] Run `node tests/crop-saboteur-art-check.mjs && npm run test:unit && npm run test:e2e && npm run build`; expect all pass and Canvas output to show the approved actor with no placeholders.
- [ ] Record source, seed, normalization, and in-game use in `ASSET_SOURCES.md`; commit only approved art/runtime/test files with `git commit -m "feat: add approved Zone 4 crop saboteur"`.
