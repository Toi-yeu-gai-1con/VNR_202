import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createLevelDefinitions } from "../src/systems/level-definitions.js";

const game = readFileSync(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");

const levels = createLevelDefinitions({
  world: { width: 960, height: 640 },
  viewport: { width: 640, height: 480 },
  portMazeDoor: { x: 122, y: 154, width: 48, height: 48, portalX: 146, portalY: 178, spawnX: 178, spawnY: 238 },
  getState: () => ({ quests: { zone1RewardClaimed: true } }),
});

assert.deepEqual(Object.keys(levels), ["hub", "village", "archive", "crossroads", "spring"], "The active campaign levels are built by the level module.");
assert.equal(levels.hub.id, "hub", "The hub keeps its stable id.");
assert.equal(levels.village.id, "village", "Zone 1 keeps its stable id.");
assert.equal(levels.archive.id, "archive", "Zone 2 keeps its stable id.");
assert.equal(levels.crossroads.id, "crossroads", "Zone 3 keeps its stable id.");
assert.equal(levels.spring.id, "spring", "Zone 4 keeps its stable id.");
assert.equal(levels.village.exits[0].portal.x, 146, "The Zone 1 portal receives the configured portal geometry.");
assert.equal(levels.village.exits[0].guide.visibleWhen(), true, "Exit guidance reads current quest state through its injected accessor.");
for (const legacyFactory of ["createVillageLevel", "createArchiveLevel", "createCrossroadsLevel", "createSpringLevel"]) {
  assert.doesNotMatch(game, new RegExp(`function ${legacyFactory}\\(`), `${legacyFactory} must not remain as a duplicate runtime definition.`);
}

console.log("PASS: active level definitions are isolated from the game runtime.");
