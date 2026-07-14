import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const assetDirectory = path.join(root, "assets", "monsters", "zone4-crop-saboteur");
const seedPath = path.join(assetDirectory, "crop-saboteur-seed.png");
const seed = sharp(await readFile(seedPath)).ensureAlpha();
const [{ width, height }, stats] = await Promise.all([seed.metadata(), seed.stats()]);

assert.equal(width, 64, "The crop saboteur seed must use a 64px frame canvas.");
assert.equal(height, 64, "The crop saboteur seed must use a 64px frame canvas.");
assert.equal(stats.channels[3].min, 0, "The crop saboteur seed must preserve transparent pixels.");

const stateFrames = { idle: 4, walk: 4, attack: 4, hurt: 3, death: 6 };
for (const [state, frameCount] of Object.entries(stateFrames)) {
  for (const direction of ["south", "north", "east"]) {
    const stripPath = path.join(assetDirectory, `crop-saboteur-${direction}-${state}.png`);
    const strip = sharp(await readFile(stripPath)).ensureAlpha();
    const [stripMeta, stripStats] = await Promise.all([strip.metadata(), strip.stats()]);
    assert.equal(stripMeta.width, frameCount * 64, `${direction} ${state} must retain ${frameCount} 64px frames.`);
    assert.equal(stripMeta.height, 64, `${direction} ${state} must retain a shared 64px anchor canvas.`);
    assert.equal(stripStats.channels[3].min, 0, `${direction} ${state} must preserve transparent pixels.`);
  }
}

async function getOpaqueBounds(imagePath, frameIndex) {
  const { data, info } = await sharp(imagePath)
    .extract({ left: frameIndex * 64, top: 0, width: 64, height: 64 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * 4 + 3] > 80) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return { width: maxX - minX + 1, height: maxY - minY + 1 };
}

for (const direction of ["south", "north", "east"]) {
  const finalDeath = await getOpaqueBounds(path.join(assetDirectory, `crop-saboteur-${direction}-death.png`), 5);
  assert.ok(finalDeath.width > finalDeath.height, `${direction} final death frame must preserve its horizontal collapse pose.`);
}

console.log("PASS: crop saboteur seed and animation strips use transparent 64px frame contracts.");
