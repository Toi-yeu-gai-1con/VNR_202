import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");
const profiles = readFileSync(new URL("../src/data/zone-profiles.js", import.meta.url), "utf8");
const audio = readFileSync(new URL("../src/systems/audio-system.js", import.meta.url), "utf8");

assert.match(profiles, /ZONE_PROFILES[\s\S]*?zone1:[\s\S]*?stormShelterBeacon/, "Zone 1 needs a landmark profile.");
assert.match(profiles, /zone2:[\s\S]*?archiveLensTower/, "Zone 2 needs a landmark profile.");
assert.match(profiles, /zone3:[\s\S]*?factionStandard/, "Zone 3 needs a landmark profile.");
assert.match(profiles, /zone4:[\s\S]*?restorationEngine/, "Zone 4 needs a landmark profile.");
assert.match(game, /function getZonePresentation\(levelId\)/, "Zone completion must drive a reusable presentation state.");
assert.match(game, /function drawZoneLandmark\(profile\)/, "Zone landmarks need a dedicated renderer.");
assert.match(game, /function drawZoneAtmosphere\(profile\)/, "Each zone needs profile-controlled atmosphere.");
assert.match(audio, /function syncZoneAmbientAudio\(\)/, "Zone ambience needs a dedicated audio synchronizer.");
assert.match(game, /function getZoneProgressStage\(levelId = state\.currentLevelId\)/, "Quest progress needs to resolve to a reusable zone stage.");
assert.match(game, /function drawZoneProgressScene\(profile\)/, "Quest progress needs a dedicated world renderer.");
assert.match(game, /drawZoneProgressScene\(profile\);/, "The world renderer must draw the visible progress state.");
assert.match(game, /zone1Delivered/, "Zone 1 progress needs to drive its visible recovery.");
assert.match(game, /zone2Fragments/, "Zone 2 progress needs to drive its decoded route.");
assert.match(game, /zone3Recruits/, "Zone 3 progress needs to drive its crowd and banners.");
assert.match(game, /zone4Barriers/, "Zone 4 progress needs to drive its cleared barriers.");
assert.match(game, /storm-shelter-beacon\.png/, "Storm shelter beacon asset must be registered.");
assert.match(game, /archive-lens-tower\.png/, "Archive lens tower asset must be registered.");
assert.match(game, /faction-standard\.png/, "Faction standard asset must be registered.");
assert.match(game, /restoration-engine\.png/, "Restoration engine asset must be registered.");

console.log("PASS: zone identity contracts are configured.");
