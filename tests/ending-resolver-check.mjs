import assert from "node:assert/strict";
import { resolveEnding } from "../src/systems/ending-resolver.js";

const relics = ["red-compass", "unified-emblem", "vietminh-thread", "healed-map", "doi-moi-gear"];
const base = {
  inventory: new Set(relics),
  saDoa: 8,
  narrative: {
    endingRisks: { zone1: 0, zone2: 0, zone3a: 0, zone3b: 0, zone4: 0, secret: 0 },
    branchFlags: {},
    endingsUnlocked: new Set(),
  },
};

assert.deepEqual(resolveEnding(base).id, "good", "A complete low-corruption campaign resolves to good.");
assert.deepEqual(
  resolveEnding({ ...base, saDoa: 49 }).id,
  "good",
  "A complete campaign remains Good below 50 corruption.",
);
assert.deepEqual(
  resolveEnding({ ...base, saDoa: 50 }).id,
  "neutral",
  "A complete campaign resolves to Neutral from 50 corruption onward.",
);
assert.deepEqual(
  resolveEnding({ ...base, saDoa: 75 }).id,
  "neutral",
  "A complete campaign remains Neutral through 75 corruption.",
);
assert.deepEqual(
  resolveEnding({ ...base, saDoa: 76 }).id,
  "secret-corruption",
  "Corruption above 75 resolves to the Secret Bad Ending.",
);
assert.deepEqual(
  resolveEnding({ ...base, narrative: { ...base.narrative, endingRisks: { ...base.narrative.endingRisks, zone1: 3 }, branchFlags: { "zone1.badConfirmed": true } } }).id,
  "zone1-lost-compass",
  "A confirmed Zone 1 risk resolves to its dedicated bad ending.",
);
assert.deepEqual(
  resolveEnding({ ...base, inventory: new Set(), narrative: { ...base.narrative, endingRisks: { ...base.narrative.endingRisks, zone1: 3 }, branchFlags: { "zone1.badConfirmed": true } } }).id,
  "zone1-lost-compass",
  "A confirmed Zone 1 paper failure can resolve before the relic is collected.",
);
assert.deepEqual(
  resolveEnding({ ...base, saDoa: 100 }).id,
  "bad",
  "Total corruption resolves to the generic Bad Ending.",
);
assert.deepEqual(
  resolveEnding({ ...base, inventory: new Set(relics.slice(0, 2)) }).id,
  null,
  "The resolver does not select an ending before all relics are available.",
);
assert.deepEqual(
  resolveEnding({ ...base, inventory: new Set(relics.slice(0, 2)), saDoa: 76 }).id,
  null,
  "Secret corruption cannot interrupt a run before all relics are available.",
);

console.log("PASS: ending resolution is data-driven, explainable, and prioritizes the secret corruption ending.");
