# Resume zone music after map changes

## Goal

When the player leaves a map and returns, that map's music resumes from its
previous playback position instead of starting over.

## Behaviour

- Changing between hub and playable zones pauses inactive music without
  changing its `currentTime`.
- Returning to a prior map restarts that map's playback from its paused
  position.
- Starting a new journey or restarting the game resets all music so the new
  session begins cleanly.
- UI sound effects keep their existing replay-from-start behaviour.
- Ending music is unaffected and begins from the start when an ending is
  reached.

## Implementation

Split the existing stop helper into two explicit behaviours: pause a looping
track while preserving its position, and reset a track when a full session
reset requires it. The map-music synchronizer uses the preserving pause;
session reset paths use the resetting helper.

## Verification

Use the browser debug tools to start hub music, record its playback time,
enter Zone 1, then return to hub. Verify that the hub track is playing and
its playback time has not returned to zero. Also verify a restarted session
resets all music positions.
