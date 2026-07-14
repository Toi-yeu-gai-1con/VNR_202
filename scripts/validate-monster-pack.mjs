import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

export const MONSTER_STATE_FRAMES = Object.freeze({ idle: 4, walk: 4, attack: 4, hurt: 3, death: 6 });
export const MONSTER_DIRECTIONS = Object.freeze(["south", "north", "east"]);

async function opaqueBounds(imagePath, frameIndex) {
  const { data, info } = await sharp(imagePath)
    .extract({ left: frameIndex * 64, top: 0, width: 64, height: 64 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let minX = 64;
  let minY = 64;
  let maxX = -1;
  let maxY = -1;
  let magentaPixels = 0;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * 4;
      const alpha = data[offset + 3];
      if (alpha <= 20) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      if (data[offset] > 240 && data[offset + 1] < 24 && data[offset + 2] > 240) magentaPixels += 1;
    }
  }
  if (maxX < 0) throw new Error(`${path.basename(imagePath)} frame ${frameIndex + 1} has no opaque subject.`);
  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1, magentaPixels };
}

export async function validateMonsterPack({ directory, basename }) {
  const seedPath = path.join(directory, `${basename}-seed.png`);
  await access(seedPath);
  const seed = await sharp(await readFile(seedPath)).ensureAlpha().metadata();
  if (seed.width !== 64 || seed.height !== 64) throw new Error(`${basename} seed must be 64x64.`);

  for (const state of Object.keys(MONSTER_STATE_FRAMES)) {
    const atlasPath = path.join(directory, `${basename}-${state}-atlas.png`);
    await access(atlasPath);
    const atlas = await sharp(await readFile(atlasPath)).ensureAlpha().metadata();
    if (!atlas.hasAlpha) throw new Error(`${basename} ${state} atlas must preserve alpha.`);
  }

  let stripCount = 0;
  let frameCount = 0;
  for (const [state, expectedFrames] of Object.entries(MONSTER_STATE_FRAMES)) {
    for (const direction of MONSTER_DIRECTIONS) {
      const stripPath = path.join(directory, `${basename}-${direction}-${state}.png`);
      const metadata = await sharp(await readFile(stripPath)).ensureAlpha().metadata();
      if (metadata.width !== expectedFrames * 64 || metadata.height !== 64) {
        throw new Error(`${basename} ${direction} ${state} must be ${expectedFrames * 64}x64.`);
      }
      for (let frame = 0; frame < expectedFrames; frame += 1) {
        const bounds = await opaqueBounds(stripPath, frame);
        if (bounds.minX === 0 || bounds.maxX === 63 || bounds.minY === 0 || bounds.maxY === 63) {
          throw new Error(`${basename} ${direction} ${state} frame ${frame + 1} clips its 64px slot.`);
        }
        if (bounds.magentaPixels > 0) throw new Error(`${basename} ${direction} ${state} retains chroma pixels.`);
        if (bounds.maxY < 59 || bounds.maxY > 62) throw new Error(`${basename} ${direction} ${state} frame ${frame + 1} has an unstable ground anchor.`);
      }
      if (state === "death") {
        const finalPose = await opaqueBounds(stripPath, expectedFrames - 1);
        if (finalPose.width <= finalPose.height) throw new Error(`${basename} ${direction} death must finish in a horizontal collapse pose.`);
      }
      stripCount += 1;
      frameCount += expectedFrames;
    }
  }
  return { stripCount, frameCount };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [directory, basename] = process.argv.slice(2);
  if (!directory || !basename) throw new Error("Usage: node scripts/validate-monster-pack.mjs <directory> <basename>");
  const summary = await validateMonsterPack({ directory, basename });
  console.log(`Validated ${basename}: ${summary.stripCount} strips, ${summary.frameCount} frames.`);
}
