import assert from "node:assert/strict";
import {
  createNarrativeState,
  recordNarrativeChoice,
  restoreNarrativeState,
  serializeNarrativeState,
} from "../src/systems/narrative-state.js";

const first = createNarrativeState();
const second = createNarrativeState();

assert.deepEqual(first.themeScores, {
  direction: 0,
  solidarity: 0,
  timing: 0,
  unity: 0,
  renewal: 0,
});
assert.deepEqual(first.endingsUnlocked, new Set(), "A new campaign has no ending collection entries.");

recordNarrativeChoice(first, {
  id: "recruiter-offer",
  chapterId: "zone1",
  optionId: "refuse",
  branchFlags: { "zone1.rejectedRecruiter": true },
  npcRelations: { "dock-workers": 1 },
  themeScores: { direction: 1 },
  endingRisks: { zone1: 0 },
});

assert.equal(first.choices["recruiter-offer"], "zone1", "Choices retain their chapter for timeline summaries.");
assert.deepEqual(
  first.choiceHistory,
  [{ chapterId: "zone1", decisionId: "recruiter-offer", optionId: "refuse" }],
  "A choice timeline retains the exact option needed for a faithful end-of-run report."
);
assert.equal(first.branchFlags["zone1.rejectedRecruiter"], true, "Choice flags are saveable data.");
assert.equal(first.npcRelations["dock-workers"], 1, "NPC trust changes are data-owned.");
assert.equal(first.themeScores.direction, 1, "Theme scores update without becoming HUD meters.");
assert.equal(second.themeScores.direction, 0, "Campaign narrative state is not shared between sessions.");

const serialized = serializeNarrativeState(first);
assert.deepEqual(serialized.endingsUnlocked, [], "Ending collection entries serialize as arrays.");
assert.deepEqual(serialized.choiceHistory, first.choiceHistory, "Choice history survives a save round trip.");

const restored = restoreNarrativeState({
  choices: { "last-issue": "zone1" },
  branchFlags: { "zone1.lastIssueSurrendered": true },
  npcRelations: { "dock-workers": -1 },
  themeScores: { direction: -2, solidarity: 1 },
  endingRisks: { zone1: 3 },
  endingsUnlocked: ["zone1-lost-compass"],
});

assert.equal(restored.themeScores.direction, -2, "Saved theme scores migrate onto the complete default schema.");
assert.equal(restored.themeScores.unity, 0, "Missing future theme scores receive a safe default.");
assert.equal(restored.endingsUnlocked.has("zone1-lost-compass"), true, "Ending collection restores as a Set.");
assert.deepEqual(restored.choiceHistory, [], "Older saves without detailed history remain valid and do not invent past decisions.");

console.log("PASS: narrative state is isolated, serializable, and safe to restore from partial saves.");
