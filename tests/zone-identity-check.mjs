import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../game.js", import.meta.url), "utf8");

assert.match(game, /const ZONE_PROFILES = \{[\s\S]*?zone1:[\s\S]*?stormShelterBeacon/, "Zone 1 needs a landmark profile.");
assert.match(game, /zone2:[\s\S]*?archiveLensTower/, "Zone 2 needs a landmark profile.");
assert.match(game, /zone3:[\s\S]*?factionStandard/, "Zone 3 needs a landmark profile.");
assert.match(game, /zone4:[\s\S]*?restorationEngine/, "Zone 4 needs a landmark profile.");
assert.match(game, /function getZonePresentation\(levelId\)/, "Zone completion must drive a reusable presentation state.");
assert.match(game, /function drawZoneLandmark\(profile\)/, "Zone landmarks need a dedicated renderer.");
assert.match(game, /function drawZoneAtmosphere\(profile\)/, "Each zone needs profile-controlled atmosphere.");
assert.match(game, /function syncZoneAmbientAudio\(\)/, "Zone ambience needs a dedicated audio synchronizer.");
assert.match(game, /storm-shelter-beacon\.png/, "Storm shelter beacon asset must be registered.");
assert.match(game, /archive-lens-tower\.png/, "Archive lens tower asset must be registered.");
assert.match(game, /faction-standard\.png/, "Faction standard asset must be registered.");
assert.match(game, /restoration-engine\.png/, "Restoration engine asset must be registered.");

console.log("PASS: zone identity contracts are configured.");
