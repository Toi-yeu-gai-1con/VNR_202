import assert from "node:assert/strict";
import { createEndingCollection } from "../src/systems/ending-collection.js";

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
const acceptedIds = new Set(["neutral", "zone1-lost-compass"]);
const collection = createEndingCollection({
  storage,
  storageKey: "ending-collection-test",
  isSupportedEndingId: (endingId) => acceptedIds.has(endingId),
  now: () => "2026-07-15T08:30:00.000Z",
});

assert.deepEqual(collection.getEntries(), [], "A new browser profile begins with no case files.");
assert.equal(collection.record("neutral"), true, "An authored ending is recorded.");
assert.equal(collection.record("neutral"), true, "Recording an existing ending remains safe.");
assert.deepEqual(collection.getEntries(), ["neutral"], "Recorded endings are deduplicated in insertion order.");
assert.equal(typeof collection.getCaseFiles, "function", "The collection exposes dated case files separately from its legacy ID list.");
assert.deepEqual(
  collection.getCaseFiles(),
  [{ id: "neutral", unlockedAt: "2026-07-15T08:30:00.000Z" }],
  "A newly opened ending retains the time it was first recorded.",
);
assert.equal(collection.record("bad"), false, "The generic fallback ending is never collected.");
assert.deepEqual(collection.getEntries(), ["neutral"], "Unsupported IDs cannot alter the collection.");

storage.setItem("ending-collection-test", JSON.stringify({
  version: 1,
  endingIds: ["neutral", "unknown", "neutral", "zone1-lost-compass"],
}));
assert.deepEqual(
  collection.getEntries(),
  ["neutral", "zone1-lost-compass"],
  "Stale IDs and duplicate storage entries are removed safely."
);
assert.deepEqual(
  collection.getCaseFiles(),
  [
    { id: "neutral", unlockedAt: null },
    { id: "zone1-lost-compass", unlockedAt: null },
  ],
  "Version-one collections migrate safely even though they did not record a date.",
);

storage.setItem("ending-collection-test", "not-json");
assert.deepEqual(collection.getEntries(), [], "Malformed browser storage cannot break a new journey.");

console.log("PASS: ending collection safely preserves authored case files.");
