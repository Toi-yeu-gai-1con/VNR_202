import assert from "node:assert/strict";
import { getGroundShadowMetrics } from "../src/rendering/ground-shadow.js";

const idle = getGroundShadowMetrics({ width: 20, height: 5 });
assert.deepEqual(
  idle,
  { width: 20, height: 5, offsetY: 0, alpha: 0.24 },
  "An idle actor keeps a restrained, stable ground shadow."
);

const walking = getGroundShadowMetrics({ width: 20, height: 5, activity: "walk" });
assert.equal(walking.width, 22, "A walking actor widens its shadow slightly with its stride.");
assert.equal(walking.height, 4, "A walking shadow stays shallow instead of becoming visually heavy.");
assert.equal(walking.alpha, 0.2, "A moving shadow is lighter than a planted idle shadow.");

const airborne = getGroundShadowMetrics({ width: 20, height: 5, airborne: 1 });
assert.deepEqual(
  airborne,
  { width: 14, height: 3, offsetY: 5, alpha: 0.1 },
  "An airborne or strongly knocked-back actor leaves a smaller, softer shadow below its anchor."
);

console.log("PASS: ground shadows stay subtle and communicate movement or elevation.");
