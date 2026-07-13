import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../game.js", import.meta.url), "utf8");

assert.match(game, /function getZoneRecoveryNpcDisplay\(npc\)/, "Recovered characters need to reuse the NPC display pipeline.");
assert.match(game, /drawNpcSpriteActor\(recoveredNpc\)/, "Recovered characters must render with the animated NPC sprite renderer.");
assert.match(game, /zone2TowerActivated/, "Archive tower activation must persist in quest state.");
assert.match(game, /interactionType: "activateArchiveLens"/, "The archive tower needs a real interaction step.");
assert.match(game, /archive-lens-console/, "Navigation needs a target for the archive tower.");
assert.match(game, /function drawRestoredIrrigationStation\(profile\)/, "Zone 4 needs a dedicated reconstructed landmark renderer.");
assert.match(game, /doi-moi-irrigation-station\.png/, "Zone 4 must load the original irrigation-station art.");
assert.doesNotMatch(game, /function drawCrossroadsRecoveryScene[\s\S]*?ctx\.fillRect\(member\.x - 5/, "Zone 3 recovery cannot use rectangle people.");

console.log("PASS: zone recovery presentation uses animated actors and real interactions.");
