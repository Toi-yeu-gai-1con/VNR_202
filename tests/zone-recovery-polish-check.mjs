import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../game.js", import.meta.url), "utf8");

assert.match(game, /function getZoneRecoveryNpcDisplay\(npc\)/, "Recovered characters need to reuse the NPC display pipeline.");
assert.match(game, /drawNpcSpriteActor\(recoveredNpc\)/, "Recovered characters must render with the animated NPC sprite renderer.");
assert.match(game, /zone2TowerActivated/, "Archive tower activation must persist in quest state.");
assert.match(game, /interactionType: "activateArchiveLens"/, "The archive tower needs a real interaction step.");
assert.match(game, /archive-lens-console/, "Navigation needs a target for the archive tower.");
assert.match(game, /function drawZoneLandmarkMotion\(profile\)/, "Landmarks need a dedicated animation renderer.");
assert.match(game, /drawZoneLandmarkMotion\(profile\);/, "Each landmark must render its motion layer.");
assert.doesNotMatch(game, /drawZoneProgressPlaque/, "World-state labels must not cover the map.");
assert.match(game, /doi-moi-irrigation-station\.png/, "Zone 4 needs its restoration landmark art.");
assert.match(game, /function drawDoiMoiStation\(profile\)/, "Zone 4 needs a staged restoration renderer.");
assert.match(game, /state\.quests\.zone4GearClaimed/, "The station can only become fully restored after the Đổi Mới gear is claimed.");
assert.doesNotMatch(game, /drawClearedBarrierPath/, "Cleared barriers should reveal the existing map without decorative grass blocks.");
assert.doesNotMatch(game, /function drawCrossroadsRecoveryScene[\s\S]*?ctx\.fillRect\(member\.x - 5/, "Zone 3 recovery cannot use rectangle people.");

console.log("PASS: zone recovery presentation uses animated actors and real interactions.");
