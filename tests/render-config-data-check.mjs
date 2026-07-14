import assert from "node:assert/strict";
import {
  PLAYER_SPRITE,
  NPC_SPRITE,
  HUB_PORTAL_SPRITE,
  MONSTER_SPRITE_CONFIG,
  TILECRAFT_TERRAIN,
} from "../src/data/render-config.js";

assert.equal(PLAYER_SPRITE.frameCount, 8, "Player animation config stays data-owned.");
assert.equal(NPC_SPRITE.walkFrames, 8, "NPC animation config stays data-owned.");
assert.equal(HUB_PORTAL_SPRITE.frameCount, 8, "Portal animation config stays data-owned.");
assert.equal(MONSTER_SPRITE_CONFIG.rifleman.directionalAnimation, true, "Rifleman animation metadata stays data-owned.");
assert.equal(MONSTER_SPRITE_CONFIG.zone1Rifleman.animations.run.frameCount, 4, "Zone 1 rifleman keeps a full four-frame walk cycle.");
assert.equal(MONSTER_SPRITE_CONFIG.zone1Rifleman.animations.run.frameWidth, 64, "Zone 1 patrol frames are normalized to a shared 64px canvas.");
assert.equal(MONSTER_SPRITE_CONFIG.zone1Raider.animations.run.frameCount, 4, "Zone 1 raider keeps a full four-frame walk cycle.");
assert.equal(MONSTER_SPRITE_CONFIG.zone1Signalman.animations.run.frameCount, 4, "Zone 1 signalman keeps a full four-frame walk cycle.");
assert.equal(MONSTER_SPRITE_CONFIG.zone1Captain.animations.run.frameCount, 4, "Zone 1 captain keeps a full four-frame walk cycle.");
assert.equal(MONSTER_SPRITE_CONFIG.zone1Captain.animations.attack.frameCount, 4, "Zone 1 captain has a four-frame attack sequence.");
assert.equal(MONSTER_SPRITE_CONFIG.zone1Captain.directionalAnimation, true, "Zone 1 captain uses real directional animation strips.");
assert.equal(MONSTER_SPRITE_CONFIG.zone1Raider.animations.attack.frameDuration, 65, "Zone 1 raider attack timing stays snappy.");
assert.equal(MONSTER_SPRITE_CONFIG.zone1Rifleman.animations.attack.frameCount, 4, "Zone 1 rifleman has a four-frame firing sequence.");
assert.equal(MONSTER_SPRITE_CONFIG.zone1Signalman.animations.attack.frameCount, 4, "Zone 1 signalman has a four-frame signal attack sequence.");
assert.equal(MONSTER_SPRITE_CONFIG.zone1Raider.flipForFacing, true, "Zone 1 enemies mirror for left-facing movement.");
assert.equal(TILECRAFT_TERRAIN.tileSize, 16, "Terrain atlas metadata stays data-owned.");

console.log("PASS: renderer sprite and atlas configuration is data-owned.");
