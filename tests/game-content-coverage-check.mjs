import assert from "node:assert/strict";
import { NARRATIVE_CHOICE_DEFINITIONS } from "../src/data/narrative-definitions.js";
import { OPTIONAL_CHALLENGE_DEFINITIONS } from "../src/data/optional-challenge-definitions.js";
import { ENDING_DEFINITIONS } from "../src/data/story-content.js";
import { createQuestState } from "../src/data/quests.js";
import { createNarrativeState } from "../src/systems/narrative-state.js";
import { createLevelDefinitions } from "../src/systems/level-definitions.js";
import {
  CHALLENGE_COVERAGE,
  CHOICE_COVERAGE,
  ENDING_COVERAGE,
  EXIT_COVERAGE,
  INTERACTABLE_COVERAGE,
} from "./coverage/game-content-manifest.mjs";

const key = (...parts) => parts.join("/");
const sorted = (values) => [...values].sort();

function assertExactCoverage(label, liveKeys, manifestKeys) {
  assert.deepEqual(
    sorted(new Set(manifestKeys)),
    sorted(new Set(liveKeys)),
    `${label} manifest must match live game definitions in both directions.`,
  );
  assert.equal(manifestKeys.length, new Set(manifestKeys).size, `${label} manifest keys must be unique.`);
}

const liveChoiceKeys = [];
for (const [chapterId, decisions] of Object.entries(NARRATIVE_CHOICE_DEFINITIONS)) {
  for (const decision of decisions) {
    for (const option of decision.options) {
      liveChoiceKeys.push(key(chapterId, decision.id, option.id));
    }
  }
}
const manifestChoiceKeys = CHOICE_COVERAGE.map((entry) => key(entry.chapterId, entry.decisionId, entry.optionId));
assertExactCoverage("Choice", liveChoiceKeys, manifestChoiceKeys);
assert.equal(CHOICE_COVERAGE.length, 41, "The campaign currently exposes exactly 41 authored options.");

const state = { quests: createQuestState(), narrative: createNarrativeState() };
const levels = createLevelDefinitions({
  world: { width: 960, height: 640 },
  viewport: { width: 640, height: 480 },
  portMazeDoor: { x: 122, y: 154, width: 48, height: 48, portalX: 146, portalY: 178, spawnX: 178, spawnY: 238 },
  getState: () => state,
});

const liveInteractableKeys = Object.entries(levels).flatMap(([levelId, level]) =>
  level.interactables.map((entry) => key(levelId, entry.id))
);
const manifestInteractableKeys = INTERACTABLE_COVERAGE.map((entry) => key(entry.levelId, entry.id));
assertExactCoverage("Interactable", liveInteractableKeys, manifestInteractableKeys);
assert.equal(INTERACTABLE_COVERAGE.length, 44, "The five active maps currently expose exactly 44 interactables.");

const liveExitKeys = Object.entries(levels).flatMap(([levelId, level]) =>
  level.exits.map((entry) => key(levelId, entry.id))
);
const manifestExitKeys = EXIT_COVERAGE.map((entry) => key(entry.levelId, entry.id));
assertExactCoverage("Exit", liveExitKeys, manifestExitKeys);
assert.equal(EXIT_COVERAGE.length, 5, "The campaign currently exposes exactly five route exits.");

assertExactCoverage("Ending", Object.keys(ENDING_DEFINITIONS), ENDING_COVERAGE.map((entry) => entry.id));
assert.equal(ENDING_COVERAGE.length, 9, "The campaign currently ships nine ending presentations.");
assertExactCoverage(
  "Challenge",
  OPTIONAL_CHALLENGE_DEFINITIONS.map((entry) => entry.id),
  CHALLENGE_COVERAGE.map((entry) => entry.id),
);
assert.equal(CHALLENGE_COVERAGE.length, 4, "The campaign currently offers four optional challenges.");

const liveInteractableSet = new Set(liveInteractableKeys);
for (const entry of CHOICE_COVERAGE) {
  assert.ok(liveInteractableSet.has(entry.runtimeInteractableId), `${key(entry.chapterId, entry.decisionId, entry.optionId)} must route through a live interactable.`);
}
for (const collection of [CHOICE_COVERAGE, INTERACTABLE_COVERAGE, EXIT_COVERAGE, ENDING_COVERAGE, CHALLENGE_COVERAGE]) {
  for (const entry of collection) {
    assert.ok(Array.isArray(entry.coveredBy) && entry.coveredBy.length > 0, "Every manifest entry must name at least one executable coverage scenario.");
  }
}

console.log("PASS: game-content coverage cannot drift from 41 choices, 44 interactables, 5 exits, 9 endings, or 4 challenges.");
