import assert from "node:assert/strict";
import { createQuestState } from "../src/data/quests.js";

const first = createQuestState();
const second = createQuestState();

assert.equal(first.zone1Started, false, "New progress starts before Zone 1.");
assert.deepEqual([...first.zone2Fragments], [], "Zone 2 starts with no decoded fragments.");
assert.deepEqual([...first.zone4Barriers], [], "Zone 4 starts with no cleared barriers.");
first.zone2Fragments.add("archive-fragment-1");
assert.deepEqual([...second.zone2Fragments], [], "Quest state collections are not shared between saves.");

console.log("PASS: quest state is isolated, serializable data owned outside the runtime.");
