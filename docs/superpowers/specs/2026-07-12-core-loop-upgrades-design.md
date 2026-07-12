# Core Loop Upgrades Design

## Goal

Upgrade the existing four-zone browser game so a first-time player can learn,
complete, recover progress, and understand the result of each zone without
losing the historical-story focus.

## Scope

1. A dismissible first-session tutorial.
2. Context-sensitive control prompts.
3. Stronger interaction affordances.
4. Objective copy with progress and distance.
5. A checkpoint per playable zone.
6. Local progress save and a continue entry point.
7. Combat hit feedback through brief shake/flash state.
8. Visible monster attack telegraphs.
9. Damage invulnerability feedback.
10. One lightweight boss encounter per zone using the existing monster model.
11. Minimap icons that distinguish exits, interactables, monsters, and goals.
12. A concise zone-complete summary before return to the hub.

## Architecture

All added state remains serializable and is owned by the existing `state`
object. Canvas rendering reads that state; DOM overlays provide tutorial,
continue, and summary UI. Save data excludes audio and renderer objects and is
versioned under one local-storage key so incompatible data can be ignored.

## Constraints

- Preserve the current five-relic route and both endings.
- Keep keyboard-first play usable on desktop and do not add dependencies.
- Keep the HUD compact; detailed text stays transient or in an overlay.
- A boss uses the current monster system, with additional health/telegraph
  metadata rather than a new combat engine.
- Save only after a stable game-state transition; never persist active modal
  or animation state.

## Verification

- Test source-level contracts for save, checkpoints, telegraphs, combat
  feedback, tutorial, boss metadata, minimap markers, and zone summary.
- Run a browser debug pass for boot, start/continue, zone transition, respawn,
  boss state, and summary overlay.
