import assert from "node:assert/strict";
import { ACHIEVEMENT_DEFINITIONS, getEarnedAchievementIds } from "../src/data/achievement-definitions.js";
import { createAchievementCollection } from "../src/systems/achievement-collection.js";

const earned = getEarnedAchievementIds({
  runStats: { successfulParries: 3, maxCorruption: 18 },
  unlockedStoryIds: new Set(["a", "b", "c", "d", "e", "f", "g", "h"]),
  narrative: { npcRelations: { workers: 3, archive: 2 } },
  quests: { zone1Delivered: new Set(["one", "two", "three"]) },
  inventory: new Set(["one", "two", "three", "four", "five"]),
});

assert.deepEqual(
  earned,
  ["bridge-builder", "protector", "precise-parry", "steady-compass", "archive-keeper"],
  "Achievements recognize constructive play without inspecting ending identities."
);

const storage = new Map();
const collection = createAchievementCollection({
  storage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  storageKey: "achievement-test",
  isSupportedAchievementId: (id) => ACHIEVEMENT_DEFINITIONS.some((achievement) => achievement.id === id),
});

assert.equal(collection.record("precise-parry"), true, "A valid achievement is kept outside campaign progress.");
assert.equal(collection.record("precise-parry"), false, "An already-recorded achievement does not emit a duplicate unlock.");
assert.deepEqual(collection.getEntries(), ["precise-parry"], "Persistent achievement entries are deduplicated.");
assert.equal(collection.record("secret-ending"), false, "Unsupported or spoiler-like achievement IDs are rejected.");

console.log("PASS: achievement rules reward constructive play and persist independently from a journey save.");
