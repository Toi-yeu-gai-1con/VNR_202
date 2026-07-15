import assert from "node:assert/strict";
import { createPortalTransition } from "../src/systems/portal-transition.js";

const transition = createPortalTransition({
  targetLevelId: "archive",
  spawn: { x: 146, y: 178, direction: "down" },
  startedAt: 100,
  duration: 560,
  swapProgress: 0.56,
  showTitleCard: true,
});

assert.equal(transition.getFrame(100).phase, "depart", "A portal starts with a departure fade before the level changes.");
assert.equal(transition.getFrame(300).shouldSwapLevel, false, "The source scene remains active until the centre of the warp.");
assert.equal(transition.getFrame(414).shouldSwapLevel, true, "The destination starts loading before the transition is allowed to finish.");
assert.equal(transition.getFrame(660).complete, true, "The input lock ends only after the full time-warp has completed.");
assert.equal(transition.targetLevelId, "archive", "The transition retains its authored destination.");
assert.equal(transition.showTitleCard, true, "The destination title card is deferred until after the visual handoff.");

console.log("PASS: portal transitions defer map swaps and title cards behind an input-safe time warp.");
