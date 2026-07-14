import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createLevelDefinitions } from "../src/systems/level-definitions.js";

const game = readFileSync(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");

const levels = createLevelDefinitions({
  world: { width: 960, height: 640 },
  viewport: { width: 640, height: 480 },
  portMazeDoor: { x: 122, y: 154, width: 48, height: 48, portalX: 146, portalY: 178, spawnX: 178, spawnY: 238 },
  getState: () => ({ quests: { zone1RewardClaimed: true, tvaPortalTarget: "village" } }),
});

assert.deepEqual(Object.keys(levels), ["hub", "village", "archive", "crossroads", "spring"], "The active campaign levels are built by the level module.");
assert.equal(levels.hub.id, "hub", "The hub keeps its stable id.");
assert.equal(levels.hub.cameraZoom, 0.7, "The TVA office uses a wider camera without changing actor scale.");
assert.equal(levels.hub.exits.length, 1, "The office hub exposes only the employee-controlled dispatch portal.");
assert.equal(levels.hub.exits[0].id, "tva-dispatch-portal", "The hub contains no legacy fixed destination gates.");
assert.equal(levels.hub.exits[0].targetFromState(), "village", "The dispatch portal resolves its target from TVA state.");
assert.equal(levels.hub.exits[0].portal.visibleWhen(), true, "The dispatch portal appears only after coordinates are locked.");
const tvaClerk = levels.hub.interactables.find((item) => item.id === "tva-clerk-placeholder");
const tvaPortal = levels.hub.exits[0].portal;
assert.equal(tvaClerk?.name, "David", "The TVA employee keeps his character name in the world UI.");
assert.equal(tvaClerk?.interactionType, "tvaBriefing", "The long office aisle ends at the employee briefing.");
assert.equal(tvaClerk?.kind, "npc", "The TVA employee remains an interactive NPC.");
assert.equal(tvaClerk?.spriteKey, "tvaEmployee", "The TVA employee role routes through the M-90 directional sprite set.");
assert.equal(tvaClerk?.idleFrameCount, 2, "The TVA employee idles without looping the coffee-drinking frame.");
assert.ok(
  Math.hypot(tvaClerk.x - tvaPortal.x, tvaClerk.y - tvaPortal.y) >= 96,
  "The TVA employee stands clear of the dispatch portal."
);
assert.ok(
  Math.hypot(tvaClerk.x - tvaPortal.x, tvaClerk.approachFromY - tvaPortal.y) >= 96,
  "The TVA employee's approach path stays clear of the dispatch portal."
);
assert.equal(levels.village.id, "village", "Zone 1 keeps its stable id.");
assert.equal(levels.archive.id, "archive", "Zone 2 keeps its stable id.");
assert.equal(levels.crossroads.id, "crossroads", "Zone 3 keeps its stable id.");
assert.equal(levels.spring.id, "spring", "Zone 4 keeps its stable id.");
assert.equal(levels.village.exits[0].portal.x, 146, "The Zone 1 portal receives the configured portal geometry.");
assert.equal(levels.village.exits[0].guide.visibleWhen(), true, "Exit guidance reads current quest state through its injected accessor.");
const colonialRecruiter = levels.village.interactables.find((item) => item.id === "colonial-recruiter");
assert.equal(colonialRecruiter?.name, "Lính tuần tra Pháp", "Zone 1 includes the named colonial recruiter NPC.");
assert.equal(colonialRecruiter?.artKey, "frenchColonialSoldier", "The recruiter reuses the French soldier art.");
for (const legacyFactory of ["createVillageLevel", "createArchiveLevel", "createCrossroadsLevel", "createSpringLevel"]) {
  assert.doesNotMatch(game, new RegExp(`function ${legacyFactory}\\(`), `${legacyFactory} must not remain as a duplicate runtime definition.`);
}

console.log("PASS: active level definitions are isolated from the game runtime.");
