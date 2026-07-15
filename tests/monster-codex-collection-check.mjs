import assert from "node:assert/strict";
import { createMonsterCodexCollection } from "../src/systems/monster-codex-collection.js";

function createMemoryStorage() {
  const entries = new Map();

  return {
    getItem(key) {
      return entries.get(key) ?? null;
    },
    setItem(key, value) {
      entries.set(key, value);
    },
  };
}

const storage = createMemoryStorage();
const supportedIds = new Set(["archive-raider", "spring-bureaucracy-beast"]);
const collection = createMonsterCodexCollection({
  storage,
  storageKey: "monster-codex-collection-test",
  isSupportedMonsterId: (monsterId) => supportedIds.has(monsterId),
});

assert.deepEqual(collection.getEntries(), [], "A new TVA dossier has no enemy records.");
assert.equal(collection.record("archive-raider"), true, "Encountering an authored enemy creates a dossier record.");
assert.equal(collection.record("archive-raider"), false, "An existing enemy record is not duplicated.");
assert.equal(collection.record("unknown"), false, "Unknown enemies cannot enter the TVA dossier.");
assert.deepEqual(collection.getEntries(), ["archive-raider"], "Enemy records retain encounter order.");

storage.setItem("monster-codex-collection-test", JSON.stringify({
  version: 1,
  monsterIds: ["archive-raider", "unknown", "archive-raider", "spring-bureaucracy-beast"],
}));
assert.deepEqual(
  collection.getEntries(),
  ["archive-raider", "spring-bureaucracy-beast"],
  "Stale and duplicate browser entries are ignored safely.",
);

storage.setItem("monster-codex-collection-test", "not-json");
assert.deepEqual(collection.getEntries(), [], "Malformed browser storage cannot break a new journey.");

console.log("PASS: TVA monster dossier records persist safely outside the historical book.");
