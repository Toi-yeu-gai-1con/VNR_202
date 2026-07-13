# Zone identity and persistence (items 31–42)

## Goal

Give each of the four playable zones a distinct player verb, atmosphere, landmark, ambient soundscape, and persistent post-mission state. Returning to a completed zone must visibly and narratively reflect the player's progress.

## Chosen approach

Use data-driven zone profiles consumed by the existing canvas renderer and audio controller. This keeps zone-specific behavior declarative and avoids spreading one-off map checks through `game.js`.

## Zone profiles

| Zone | Core verb | Atmosphere | Landmark | Completion change |
| --- | --- | --- | --- | --- |
| 1 | Survive the storm and protect civilians | Rain, wind, cold blue light | Emergency shelter beacon | Storm eases; rescued NPCs gather at the shelter |
| 2 | Explore and decode archive clues | Paper motes, dusty warm light | Archive lens/tower | A decoded route lights up; archivist dialogue changes |
| 3 | Influence a faction amid large-scale conflict | Firelight, crowd movement, smoke | Faction standard | The chosen side's colours and NPC comments appear |
| 4 | Break barriers and restore the environment | Ash, machinery, recovery light | Restoration engine | Debris clears; recovery effects and rebuilding NPCs appear |

## Shared systems

- `ZONE_PROFILES`: zone identity, ambient layers, weather/particle settings, landmark rendering, objective wording, and before/after dialogue.
- Persistent progress flags reuse the existing save/checkpoint state. A zone has `unstarted`, `active`, or `completed` presentation.
- The renderer draws procedural weather/particles, landmark silhouettes, and post-mission variants without replacing existing map art.
- Ambient audio is selected by the current zone and fades between exploration and combat layers rather than restarting tracks.
- NPC placement and dialogue derive from the zone presentation state, so a revisited map communicates the previous outcome.

## Scope boundaries

- No engine migration and no new external art dependency.
- The zone 3 outcome is represented as the existing mission-result state, not a new branching campaign system.
- Ambient sounds must gracefully fall back if a browser blocks playback or an asset fails to load.

## Validation

- Automated tests assert all four profiles, their unique verbs, landmark definitions, and completed-state variants.
- A save-state test confirms completed zones retain their presentation after a reload.
- Browser playtest visits each zone before and after completion, verifying visual readability, HUD clarity, input, and audio transitions.
