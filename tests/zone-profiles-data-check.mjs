import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ZONE_PROFILES } from "../src/data/zone-profiles.js";

const game = readFileSync(new URL("../game.js", import.meta.url), "utf8");

assert.deepEqual(Object.keys(ZONE_PROFILES), ["zone1", "zone2", "zone3", "zone4"], "All four zone profiles live in content data.");
assert.equal(ZONE_PROFILES.zone1.levelId, "village", "Zone 1 keeps its level identity.");
assert.equal(ZONE_PROFILES.zone2.music, "archive", "Zone 2 keeps its audio key.");
assert.equal(ZONE_PROFILES.zone3.landmark, "factionStandard", "Zone 3 keeps its landmark key.");
assert.equal(ZONE_PROFILES.zone4.atmosphere, "recovery", "Zone 4 keeps its atmosphere key.");
assert.doesNotMatch(game, /const LEGACY_ZONE_PROFILES =/, "The runtime must not retain a duplicate zone profile map.");

console.log("PASS: zone identity content is data-driven outside the runtime.");
