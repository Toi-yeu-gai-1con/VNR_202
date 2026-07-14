import assert from "node:assert/strict";
import {
  PLAYER_SPRITE,
  NPC_SPRITE,
  TVA_EMPLOYEE_SPRITE,
  HUB_PORTAL_SPRITE,
  MONSTER_SPRITE_CONFIG,
  TILECRAFT_TERRAIN,
} from "../src/data/render-config.js";

assert.equal(PLAYER_SPRITE.frameCount, 8, "Player animation config stays data-owned.");
assert.equal(NPC_SPRITE.walkFrames, 8, "NPC animation config stays data-owned.");
assert.equal(TVA_EMPLOYEE_SPRITE.frameHeight, 384, "The TVA employee keeps a high-resolution source atlas.");
assert.equal(TVA_EMPLOYEE_SPRITE.smoothing, true, "The TVA employee is downsampled cleanly at runtime.");
assert.equal(HUB_PORTAL_SPRITE.frameCount, 8, "Portal animation config stays data-owned.");
assert.equal(MONSTER_SPRITE_CONFIG.rifleman.directionalAnimation, true, "Rifleman animation metadata stays data-owned.");
assert.equal(MONSTER_SPRITE_CONFIG.frenchColonialSoldier.drawHeight, 46, "The French soldier matches the average actor height.");
assert.equal(TILECRAFT_TERRAIN.tileSize, 16, "Terrain atlas metadata stays data-owned.");

console.log("PASS: renderer sprite and atlas configuration is data-owned.");
