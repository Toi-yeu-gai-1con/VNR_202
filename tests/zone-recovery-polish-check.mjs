import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../game.js", import.meta.url), "utf8");

assert.match(game, /function getZoneRecoveryNpcDisplay\(npc\)/, "Recovered characters need to reuse the NPC display pipeline.");
assert.match(game, /drawNpcSpriteActor\(recoveredNpc\)/, "Recovered characters must render with the animated NPC sprite renderer.");
assert.match(game, /zone2TowerActivated/, "Archive tower activation must persist in quest state.");
assert.match(game, /interactionType: "activateArchiveLens"/, "The archive tower needs a real interaction step.");
assert.match(game, /archive-lens-console/, "Navigation needs a target for the archive tower.");
assert.match(game, /landmarkAnimationFrames:/, "Landmark animation frames must be normalized before rendering.");
assert.match(game, /stormShelterBeacon: \[/, "Zone 1 needs a normalized animation frame set.");
assert.match(game, /archiveLensTower: \[/, "Zone 2 needs a normalized animation frame set.");
assert.match(game, /factionStandard: \[/, "Zone 3 needs a normalized animation frame set.");
assert.match(game, /restorationEngine: \[/, "Zone 4 needs a normalized animation frame set.");
assert.match(game, /function drawZoneLandmarkAnimationFrame\(frames, x, y, width, height\)/, "Landmarks need a fixed-anchor frame renderer.");
assert.match(game, /const frame = frames\[Math\.floor\(state\.lastTimestamp \/ 180\) % frames\.length\];/, "Landmark animations must advance through their normalized frame list.");
assert.doesNotMatch(game, /function drawZoneLandmarkMotion\(profile\)/, "Canvas overlay effects cannot replace landmark sprite animation.");
assert.match(game, /function clearPressedKeys\(\) \{\s*keys\.clear\(\);/s, "Input needs a shared clear-state helper.");
assert.match(game, /window\.addEventListener\("blur", clearPressedKeys\);/, "Input must clear when the game loses focus.");
assert.match(game, /document\.addEventListener\("visibilitychange", \(\) => \{\s*if \(document\.hidden\) \{\s*clearPressedKeys\(\);/s, "Input must clear when the tab is hidden.");
assert.doesNotMatch(game, /drawZoneProgressPlaque/, "World-state labels must not cover the map.");
assert.match(game, /doi-moi-irrigation-station\.png/, "Zone 4 needs its restoration landmark art.");
assert.match(game, /function drawDoiMoiStation\(profile\)/, "Zone 4 needs a staged restoration renderer.");
assert.match(game, /state\.quests\.zone4GearClaimed/, "The station can only become fully restored after the Đổi Mới gear is claimed.");
assert.doesNotMatch(game, /drawClearedBarrierPath/, "Cleared barriers should reveal the existing map without decorative grass blocks.");
assert.doesNotMatch(game, /function drawCrossroadsRecoveryScene[\s\S]*?ctx\.fillRect\(member\.x - 5/, "Zone 3 recovery cannot use rectangle people.");

console.log("PASS: zone recovery presentation uses animated actors and real interactions.");
