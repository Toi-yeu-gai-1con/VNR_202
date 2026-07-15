import assert from "node:assert/strict";
import { createFinalVerdictCheckpoint, restoreFinalVerdictCheckpoint } from "../src/systems/bad-ending-recovery.js";

const checkpoint = createFinalVerdictCheckpoint({
  levelId: "village",
  spawn: { x: 560, y: 476, direction: "up" },
  inventory: ["archive-note"],
  quests: { zone1RewardClaimed: false, zone1Delivered: ["worker-1", "worker-2", "worker-3"] },
  narrative: { endingRisks: { zone1: 1 }, endingsUnlocked: [] },
  verdictItem: { id: "red-compass-reward", interactionType: "compassVerdict", collected: false },
});

checkpoint.inventory.push("red-compass");
checkpoint.quests.zone1RewardClaimed = true;
const restored = restoreFinalVerdictCheckpoint(checkpoint);

assert.deepEqual(restored, {
  levelId: "village",
  spawn: { x: 560, y: 476, direction: "up" },
  inventory: ["archive-note", "red-compass"],
  quests: { zone1RewardClaimed: true, zone1Delivered: ["worker-1", "worker-2", "worker-3"] },
  narrative: { endingRisks: { zone1: 1 }, endingsUnlocked: [] },
  verdictItem: { id: "red-compass-reward", interactionType: "compassVerdict", collected: false },
}, "A recovery checkpoint is a deep copy that can safely restore the exact pre-verdict campaign state.");

console.log("PASS: final verdict checkpoints preserve recoverable campaign state.");
