# Project Agent Rules

These rules apply to the entire repository.

## Mandatory Game Studio routing

- Every task related to game design, gameplay, game code, game UI, game assets, audio, animation, debugging, optimization, or playtesting MUST begin by using [@game-studio](plugin://game-studio@openai-curated-remote).
- Game Studio is the mandatory umbrella workflow even when the requested change appears small. Use it to classify the task, then route immediately to the most relevant specialist skill.
- Do not substitute a general web-development workflow for Game Studio. If the plugin is unavailable, report the blocker instead of silently continuing without it.
- Keep the current project architecture unless the user explicitly approves an engine migration. This repository is a 2D browser game; do not migrate it to Phaser, React, Three.js, or another engine merely because a skill defaults to that stack.

## Preferred game-development skills

After invoking Game Studio, use the smallest relevant set of specialist skills:

- `Game Studio: web-game-foundations`: architecture, core loop, save/debug/performance boundaries, and browser-game decisions.
- `Game Studio: sprite-pipeline`: pixel-art generation, whole-strip animation generation, fixed-size frame normalization, shared scale, bottom-center anchors, preview sheets, and in-engine sprite validation.
- `Game Studio: game-playtest`: keyboard/input testing, browser smoke tests, scene transitions, screenshots, HUD review, and visual regression checks.
- `Game Studio: game-ui-frontend`: HUD, menus, dialogue, overlays, minimap, responsive layout, and visual hierarchy.
- `Game Studio: phaser-2d-game`: use only for a Phaser-specific task or an explicitly approved Phaser migration.
- `imagegen`: create or edit original raster game art when a new bitmap asset or animation strip is needed.
- `playwright`: automate the running game and capture screenshots for real browser verification.

Useful external skill candidates discovered for this project are listed below. Review their instructions and provenance before installation or use; do not silently install them without authorization:

- `openai/skills@develop-web-game` — general web-game implementation workflow.
- `gamedev-skills/awesome-gamedev-agent-skills@rpg` — RPG systems and progression design.
- `opusgamelabs/game-creator@game-assets` — game-asset planning and production.
- `omer-metin/skills-for-antigravity@pixel-art-sprites` — pixel-art sprite creation.
- `nexu-io/open-design@sprite-animation` — sprite-animation workflow.

## Asset creation and research autonomy

- Agents are encouraged to research, source, draw, generate, edit, and animate new models, assets, sprites, tiles, effects, landmarks, NPCs, monsters, and interactable objects whenever doing so materially improves the requested work.
- Do not wait for the user to request every individual asset when the need is obvious and remains within the approved task scope.
- Reuse existing project art direction, palette, camera angle, pixel density, scale, and silhouette language. New art must look like it belongs in the same game.
- Third-party assets must have clear, compatible usage rights. Record the source, author, license, modifications, and in-game use in `ASSET_SOURCES.md` or the nearest scoped source ledger.
- Generated assets must be saved inside the repository before code references them. Preserve generation sources outside the repository when required by the generating tool.

## Vietnamese cultural and content standards

- All new content must fit the project's Vietnamese historical setting, narrative, tone, and educational intent.
- Architecture, clothing, tools, crops, symbols, environments, language, and social details must be period-appropriate or intentionally justified by the game's fiction.
- Use correct Vietnamese spelling, diacritics, and UTF-8 encoding. Do not introduce mojibake into user-facing text.
- Treat Vietnamese national and cultural symbols respectfully. When depicting the national flag, preserve the recognizable red field and centered yellow five-pointed star; do not replace it with unrelated foreign or generic fantasy iconography.
- Avoid anachronisms, cultural stereotypes, sexualized or degrading depictions, gratuitous gore, and content inconsistent with Vietnamese cultural norms and thuần phong mỹ tục.
- When historical or cultural accuracy is uncertain, research before drawing or implementing the asset and document any deliberate artistic interpretation.

## No ugly static stand-ins or fallbacks

- Never ship a static image, static geometric primitive, debug shape, placeholder, or low-quality fallback as a substitute for a character, NPC, monster, landmark, interactable object, destruction result, environmental reaction, or effect that should visibly move or change.
- Prohibited examples include rectangle people, colored blocks after an interaction, a still enemy pretending to walk, a static landmark with Canvas shapes pretending to be sprite animation, temporary text labels placed in the world, and generic grass/path blocks used to hide missing art.
- If an element is expected to feel alive, it must use a real animation asset: a coherent sprite strip, normalized frame set, particle/effect animation, or another production-quality animated representation appropriate to the renderer.
- Genuinely static terrain or background art may remain static only when it is finished, intentional artwork that matches the game's visual quality. This exception must not be used to avoid animating a focal or interactive element.
- If a required animated asset is unavailable, create or source it. Do not silently fall back to an ugly placeholder in the shipped game.

## Sprite and animation quality gates

- Generate a full animation strip from one approved seed whenever possible; do not generate unrelated frames independently and assume they will align.
- Normalize every frame to a fixed canvas, shared scale, consistent pixel density, and stable bottom-center or task-appropriate anchor.
- Preserve silhouette, perspective, facing direction, palette, proportions, and identifying details across frames.
- Ensure no frame crosses a slot boundary, clips important content, contains chroma-key residue, or introduces unrelated fragments.
- Preview the complete loop before integration, then inspect it again at actual in-game scale.
- Movement must come from the animated subject, not accidental whole-sprite translation. Focal structures and characters must not jitter between frames unless that motion is intentional.

## Implementation and playtest requirements

- Preserve existing player changes and unrelated work in the working tree.
- Add or update a regression test before implementing a bug fix or behavior change whenever the repository's test setup supports it.
- For Canvas-heavy changes, browser screenshots are mandatory; DOM assertions alone are insufficient.
- Test the main player verbs affected by the task, including held keyboard input, key release, window blur, tab visibility changes, collisions, pause/modal transitions, and scene reload when relevant.
- Verify both the default state and every new progression state. A restored or completed visual must not appear before its gameplay condition is satisfied.
- Do not claim completion based only on source inspection. Run syntax checks, relevant automated tests, and an in-browser visual/playtest pass.
