import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { PLAYER_ANIMATIONS, PLAYER_SPRITE } from "../src/data/render-config.js";

const runtime = await readFile(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");
const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
const pipeline = await readFile(new URL("../scripts/extract-adventurer-preview-animations.py", import.meta.url), "utf8");
const skillEffectRenderer = runtime.slice(runtime.indexOf("function drawSkillEffect"), runtime.indexOf("function drawAtmosphere"));

const expectedAnimations = {
  idle: 8,
  run: 8,
  attack1: 8,
  attack2: 8,
  heal: 12,
  hurt: 4,
  dash: 7,
  death: 7,
};

assert.deepEqual(
  Object.fromEntries(Object.entries(PLAYER_ANIMATIONS).map(([name, animation]) => [name, animation.frameCount])),
  expectedAnimations,
  "Player animation metadata must preserve the Adventurer frame contract."
);
assert.deepEqual(PLAYER_ANIMATIONS.death.frameDurations, [90, 90, 90, 90, 90, 90, 600]);
assert.equal(PLAYER_SPRITE.frameWidth, 96);
assert.equal(PLAYER_SPRITE.frameHeight, 80);

assert.match(runtime, /attack1: loadDirectionalSprites\("attack1"\)/);
assert.match(runtime, /attack2: loadDirectionalSprites\("attack2"\)/);
assert.match(runtime, /dash: loadDirectionalSprites\("dash"\)/);
assert.match(runtime, /heal: loadDirectionalSprites\("heal"\)/);
assert.match(runtime, /hurt: loadDirectionalSprites\("hurt"\)/);
assert.match(runtime, /death: loadDirectionalSprites\("death"\)/);
assert.match(runtime, /function startPlayerAnimation\(/);
assert.match(runtime, /function getPlayerAnimationFrame\(/);
assert.match(runtime, /const strikeAnimation = isCharged \? "attack2"/);
assert.match(runtime, /startPlayerAnimation\("dash"/);
assert.match(runtime, /startPlayerAnimation\("heal"/);
assert.match(runtime, /startPlayerAnimation\("hurt"/);
assert.match(runtime, /startPlayerAnimation\("death"/);
assert.match(runtime, /state\.mode === "playing" && key === "l"/);
assert.doesNotMatch(runtime, /state\.mode === "playing" && key === "shift"/);
assert.doesNotMatch(skillEffectRenderer, /drawAttackSlash/);
assert.doesNotMatch(skillEffectRenderer, /type === "dodge"/);
assert.match(index, /L lướt/);
assert.match(pipeline, /def reduce_dash_down_vfx\(/);

function readPngDimensions(buffer) {
  assert.equal(buffer.toString("ascii", 1, 4), "PNG", "Expected a PNG asset.");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

for (const [animation, frameCount] of Object.entries(expectedAnimations)) {
  for (const direction of ["up", "down", "left", "right"]) {
    const url = new URL(`../assets/player/${animation}_${direction}.png`, import.meta.url);
    await stat(url);
    const dimensions = readPngDimensions(await readFile(url));
    assert.deepEqual(dimensions, { width: frameCount * 96, height: 80 }, `${animation}_${direction} has the wrong strip layout.`);
  }
}

console.log("PASS: Adventurer action animations are mapped to gameplay and keep their source frame contract.");
