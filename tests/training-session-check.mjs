import assert from "node:assert/strict";
import { createTrainingSession } from "../src/systems/training-session.js";

const campaign = { health: 21, saDoa: 37, levelId: "hub" };
const session = createTrainingSession(campaign);

assert.deepEqual(session.enter(), { health: 36, saDoa: 0, levelId: "training" }, "Training starts with a safe independent combat state.");
session.takeHit(9);
session.addCorruption(20);
assert.deepEqual(session.reset(), { health: 36, saDoa: 0, levelId: "training" }, "Reset restores the safe training snapshot only.");
assert.deepEqual(session.leave(), campaign, "Leaving training restores the campaign exactly as it was on entry.");

console.log("PASS: training sessions isolate combat practice from campaign progress.");
