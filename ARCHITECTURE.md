# Runtime architecture

`game.js` is intentionally only the browser entrypoint. It imports `src/runtime/game-runtime.js`, which bootstraps the existing Canvas game without changing its public HTML entry, save key, or gameplay rules.

## Module boundaries

- `src/core/scene-controller.js` owns legal UI/game scene transitions.
- `src/core/asset-manager.js` owns grouped loading, retry state, subscriptions, and a four-asset concurrency cap.
- `src/data/` owns immutable content and configuration: zones, story text, asset grouping, combat rosters, and renderer atlas/sprite metadata.
- `src/systems/audio-system.js` owns looping music, ambient mixing, pause-without-reset behavior, and mute state.
- `src/systems/level-definitions.js` constructs the five active map definitions from injected world/state accessors.
- `src/systems/save-system.js` owns `crossroads-save-v1` serialization and restoration.
- `src/rendering/minimap-renderer.js` owns the HUD minimap.
- `src/runtime/game-runtime.js` remains the compatibility bridge for the Canvas loop, UI wiring, combat, interactions, and world rendering that have not yet been split further.

## Asset lifecycle

The first playable boot loads `core` and `hub`. Zone groups preload in the background and are checked before a level transition. Missing critical visual assets keep the player in the loading/recovery flow rather than showing a placeholder. Audio assets are non-blocking: failure triggers visible guidance and is retried when the player enables sound.

## Compatibility guarantees

- HTML still loads `game.js` as an ES module.
- Save key and version remain `crossroads-save-v1` / `1`.
- The original four zones, hub, quest ids, audio keys, and scene modes retain their existing identifiers.

## Verification

Run every lightweight regression check with PowerShell:

```powershell
Get-ChildItem tests -Filter '*-check.mjs' | Sort-Object Name | ForEach-Object { node $_.FullName }
```

Browser verification additionally covers boot, intro/tutorial flow, held-key movement, pause/resume, representative zone rendering, minimap visibility, and console errors.
