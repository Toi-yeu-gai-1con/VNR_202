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
  resolveEnding({ ...base, saDoa: 42 }).id,
  "neutral",
  "A complete campaign with recoverable negative consequences resolves to neutral.",
);
assert.deepEqual(
  resolveEnding({ ...base, narrative: { ...base.narrative, endingRisks: { ...base.narrative.endingRisks, zone1: 3 }, branchFlags: { "zone1.badConfirmed": true } } }).id,
  "zone1-lost-compass",
  "A confirmed Zone 1 risk resolves to its dedicated bad ending.",
);
assert.deepEqual(
  resolveEnding({ ...base, saDoa: 100 }).id,
  "secret-corruption",
  "Extreme corruption has priority over zone-specific ending risks.",
);
assert.deepEqual(
  resolveEnding({ ...base, inventory: new Set(relics.slice(0, 2)) }).id,
  null,
  "The resolver does not select an ending before all relics are available.",
);

console.log("PASS: ending resolution is data-driven, explainable, and prioritizes the secret corruption ending.");
