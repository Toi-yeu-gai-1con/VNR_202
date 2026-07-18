import assert from "node:assert/strict";
import { createQuestState } from "../src/data/quests.js";

const first = createQuestState();
const second = createQuestState();

assert.equal(first.zone1Started, false, "New progress starts before Zone 1.");
assert.equal(first.tvaBriefingAccepted, false, "New progress starts before the office briefing.");
assert.equal(first.tvaPortalTarget, null, "No TVA dispatch portal is open in a new game.");
assert.deepEqual([...first.tvaReportedRelics], [], "No relic has been reported to the TVA employee.");
assert.deepEqual([...first.tvaMemoryReconstructed], [], "No memory reconstruction is completed in a new run.");
assert.equal(first.tvaCausalityViewed, false, "The causal map starts unread in a new run.");
assert.deepEqual(first.tvaResetTraces, [], "A new run has no recorded reset-wave traces.");
assert.equal(first.zone1SoldierDecision, null, "The Zone 1 soldier choice starts unresolved.");
assert.deepEqual([...first.zone2Fragments], [], "Zone 2 starts with no decoded fragments.");
assert.deepEqual([...first.zone4Barriers], [], "Zone 4 starts with no cleared barriers.");
first.zone2Fragments.add("archive-fragment-1");
first.tvaReportedRelics.add("red-compass");
first.tvaMemoryReconstructed.add("red-compass");
first.tvaCausalityViewed = true;
first.tvaResetTraces.push({ zoneId: "zone1", endingId: "zone1-lost-compass" });
assert.deepEqual([...second.zone2Fragments], [], "Quest state collections are not shared between saves.");
assert.deepEqual([...second.tvaReportedRelics], [], "TVA report collections are not shared between saves.");
assert.deepEqual([...second.tvaMemoryReconstructed], [], "Memory archive collections are not shared between saves.");
assert.equal(second.tvaCausalityViewed, false, "Causal-map visibility is not shared between saves.");
assert.deepEqual(second.tvaResetTraces, [], "Reset-wave traces are not shared between saves.");

console.log("PASS: quest state is isolated, serializable data owned outside the runtime.");
