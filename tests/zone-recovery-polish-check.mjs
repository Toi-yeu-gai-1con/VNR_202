import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../game.js", import.meta.url), "utf8");

assert.match(game, /function getZoneRecoveryNpcDisplay\(npc\)/, "Recovered characters need to reuse the NPC display pipeline.");
assert.match(game, /drawNpcSpriteActor\(recoveredNpc\)/, "Recovered characters must render with the animated NPC sprite renderer.");
assert.match(game, /zone2TowerActivated/, "Archive tower activation must persist in quest state.");
assert.match(game, /interactionType: "activateArchiveLens"/, "The archive tower needs a real interaction step.");
assert.match(game, /archive-lens-console/, "Navigation needs a target for the archive tower.");
assert.match(game, /landmarkAnimations:/, "Landmarks need a dedicated sprite-sheet collection.");
assert.match(game, /storm-shelter-beacon-animated\.png/, "Zone 1 must load its animated landmark strip.");
assert.match(game, /archive-lens-tower-animated\.png/, "Zone 2 must load its animated landmark strip.");
assert.match(game, /faction-standard-animated\.png/, "Zone 3 must load its animated landmark strip.");
assert.match(game, /restoration-engine-animated\.png/, "Zone 4 must load its animated landmark strip.");
assert.match(game, /function drawZoneLandmarkSpriteFrame\(spriteSheet, x, y, width, height\)/, "Landmarks need a frame-cropping renderer.");
assert.match(game, /Math\.floor\(state\.lastTimestamp \/ 180\) % 4/, "Landmark strips must advance through four time-based frames.");
assert.doesNotMatch(game, /function drawZoneLandmarkMotion\(profile\)/, "Canvas overlay effects cannot replace landmark sprite animation.");
assert.doesNotMatch(game, /drawZoneProgressPlaque/, "World-state labels must not cover the map.");
assert.match(game, /doi-moi-irrigation-station\.png/, "Zone 4 needs its restoration landmark art.");
assert.match(game, /function drawDoiMoiStation\(profile\)/, "Zone 4 needs a staged restoration renderer.");
assert.match(game, /state\.quests\.zone4GearClaimed/, "The station can only become fully restored after the Đổi Mới gear is claimed.");
assert.doesNotMatch(game, /drawClearedBarrierPath/, "Cleared barriers should reveal the existing map without decorative grass blocks.");
assert.doesNotMatch(game, /function drawCrossroadsRecoveryScene[\s\S]*?ctx\.fillRect\(member\.x - 5/, "Zone 3 recovery cannot use rectangle people.");

console.log("PASS: zone recovery presentation uses animated actors and real interactions.");
