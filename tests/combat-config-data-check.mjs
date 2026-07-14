import assert from "node:assert/strict";
import { BOSS_DEFINITIONS, COMBAT_DENSITY, COMBAT_ROSTER } from "../src/data/combat-config.js";

assert.equal(BOSS_DEFINITIONS.crossroads.id, "southern-tyrant", "Boss identities stay data-owned.");
assert.equal(COMBAT_DENSITY.spring, 3, "Combat density stays data-owned.");
assert.equal(COMBAT_DENSITY.village, 2, "Zone 1 normal difficulty includes both frontline and ranged adversaries.");
assert.equal(COMBAT_ROSTER.archive.length, 3, "Each zone roster stays data-owned.");
assert.equal(COMBAT_ROSTER.village[1].archetype, "ranged", "Combat roster keeps its archetype metadata.");

console.log("PASS: combat roster and difficulty density are data-owned.");
