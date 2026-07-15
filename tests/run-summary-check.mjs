import assert from "node:assert/strict";
import { createRunStats, createRunSummary, recordRunStat } from "../src/systems/run-summary.js";

const stats = createRunStats({ activeMilliseconds: 1234, strikes: 2, successfulParries: 1, maxCorruption: 18 });
recordRunStat(stats, "choicesMade");
recordRunStat(stats, "damageTaken", 4);
assert.deepEqual(
  stats,
  { activeMilliseconds: 1234, strikes: 2, successfulParries: 1, damageTaken: 4, choicesMade: 1, maxCorruption: 18 },
  "Run statistics retain only safe, non-negative counters."
);

const summary = createRunSummary({
  runStats: { activeMilliseconds: 3_600_000, strikes: 8, successfulParries: 3, damageTaken: 12, choicesMade: 6, maxCorruption: 20 },
  inventory: new Set(["a", "b", "c", "d", "e"]),
  corruption: 12,
  completedZones: new Set(["village", "archive", "crossroads", "spring"]),
  narrative: { npcRelations: { "dock-workers": 3, "archive-groups": 2 } },
});

assert.equal(summary.score, 755, "A complete, careful playthrough earns an explainable score without time bonuses.");
assert.equal(summary.durationLabel, "1 giờ", "Play duration is reported without incentivizing speedrunning.");
assert.equal(summary.combatStyle, "3 phản đòn thành công / 8 đòn đánh", "Combat method is preserved as a readable recap.");
assert.equal(summary.components.some((component) => component.id === "time"), false, "Time is never converted into a score reward.");

console.log("PASS: final-run summaries are explainable, persistent-ready, and do not reward rushing history.");
