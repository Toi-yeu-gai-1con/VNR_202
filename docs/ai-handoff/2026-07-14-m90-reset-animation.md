# AI handoff: M-90 Reset activation animation

## What changed

Added a production-ready, non-looping reset activation animation for the CLTNT time-archive guide character M-90. The character is derived from the approved M-90 seed and keeps the same tired eyes/dark circles, hair, brown 1970s suit, tie, orange badge, coffee/clipboard, belt gear, and game-scale proportions.

The animation was authored with the Aseprite MCP workflow, normalized with a fixed 96x96 frame, and packed with the existing bottom-center anchor. Frame 1 is pixel-identical to the approved M-90 down-facing idle placement.

## Files

- `assets/time-archive/characters/agent-m90/actions/reset-activate/reset-activate.aseprite` — editable Aseprite source, one flattened layer, tag `reset_activate`.
- `assets/time-archive/characters/agent-m90/actions/reset-activate/reset-activate.png` — horizontal 8-frame RGBA spritesheet, 768x96; each frame is 96x96.
- `assets/time-archive/characters/agent-m90/actions/reset-activate/reset-activate.json` — Aseprite JSON frame rectangles, durations, tag, and layer metadata.
- `assets/time-archive/characters/agent-m90/actions/reset-activate/reset-activate.events.json` — gameplay event beats and reset-wave sequencing contract.
- `assets/time-archive/previews/m90-reset-activate.gif` — animation review loop.
- `assets/time-archive/previews/m90-reset-activate-runtime-preview.png` — preview at the game-relative 62x62 action canvas, enlarged 4x.
- `scripts/normalize_action_strip.py` — deterministic fixed-frame/anchor normalizer used for this action.

## Frame contract

| Frame | Duration | Beat/event |
| ---: | ---: | --- |
| 1 | 220 ms | weary idle |
| 2 | 120 ms | secure coffee and reach |
| 3 | 140 ms | draw Reset Charge; event `reset_charge_drawn` |
| 4 | 180 ms | twist lock; event `reset_charge_armed` |
| 5 | 130 ms | lower to ground |
| 6 | 220 ms | place charge; event `reset_charge_grounded` |
| 7 | 120 ms | raise Chronicle Pad; event `chronicle_pad_ready` |
| 8 | 300 ms | trigger and hold; event `reset_wave_start` |

Total action duration is 1,430 ms. The action is intentionally non-looping.

## Runtime integration instructions

The asset is committed, but it is **not yet wired into `game-runtime.js`**. A future implementation should:

1. Load `reset-activate.png` as an 8-frame horizontal sheet with `frameWidth=96`, `frameHeight=96`.
2. Draw each frame using the action contract `drawWidth=62`, `drawHeight=62`, bottom-center anchor (`x=0.5`, `y=1`). The character body remains the existing `24x40` NPC crop inside that canvas.
3. Play frames once on the Reset interaction; do not loop.
4. On `reset_wave_start` (frame 8), play `assets/time-archive/effects/reset-wave-sheet.png` with 8 frames at 90 ms each.
5. Restore the latest checkpoint after reset-wave frame 7, then return M-90 to the idle state.
6. Optional game-feel cues: 80 ms hit-stop, 120 ms CRT glitch, and 3 px screen shake.

Do not replace this with a static character image or geometric fallback. Keep nearest-neighbor sampling and the existing Canvas 2D architecture.

## Validation completed

- Aseprite metadata: 8 frames, 96x96, one flattened layer, `reset_activate` tag.
- All frame alpha bounds were checked for clipping and horizontal slot overflow.
- Frame 1 was pixel-compared against the approved M-90 down-facing seed placement.
- `node tests/asset-audit-check.mjs`
- `node tests/render-config-data-check.mjs`
- `node tests/asset-manifest-data-check.mjs`
- `git diff --check`

The GIF and runtime preview are the quickest visual checks before integrating the action into gameplay.
