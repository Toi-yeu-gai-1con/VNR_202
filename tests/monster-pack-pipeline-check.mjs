import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { removeMonsterChroma } from "../scripts/remove-monster-chroma.mjs";
import { normalizeMonsterSeed } from "../scripts/normalize-monster-seed.mjs";
import { normalizeCharacterAtlas } from "../scripts/normalize-character-atlas.mjs";
import { buildMonsterPackPreview } from "../scripts/build-monster-pack-preview.mjs";
import { buildMonsterRosterPreview } from "../scripts/build-monster-roster-preview.mjs";
import { validateMonsterPack } from "../scripts/validate-monster-pack.mjs";

const root = path.resolve(import.meta.dirname, "..");
const cropDirectory = path.join(root, "assets", "monsters", "zone4-crop-saboteur");
const tempDirectory = await mkdtemp(path.join(os.tmpdir(), "vnr-monster-pipeline-"));

try {
  const source = path.join(tempDirectory, "chroma-source.png");
  const output = path.join(tempDirectory, "chroma-output.png");
  const pixels = Buffer.alloc(4 * 4 * 4, 255);
  for (let index = 0; index < 16; index += 1) {
    pixels[index * 4] = 255;
    pixels[index * 4 + 1] = 0;
    pixels[index * 4 + 2] = 255;
  }
  for (const [x, y] of [[1, 1], [2, 1], [1, 2], [2, 2]]) {
    const offset = (y * 4 + x) * 4;
    pixels[offset] = 72;
    pixels[offset + 1] = 91;
    pixels[offset + 2] = 63;
  }
  await sharp(pixels, { raw: { width: 4, height: 4, channels: 4 } }).png().toFile(source);
  await removeMonsterChroma(source, output);
  const { data } = await sharp(output).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.equal(data[3], 0, "Flat magenta border pixels must become transparent.");
  assert.equal(data[(1 * 4 + 1) * 4 + 3], 255, "Interior subject pixels must remain opaque.");

  const normalizedSeed = path.join(tempDirectory, "normalized-seed.png");
  await normalizeMonsterSeed(output, normalizedSeed);
  const normalizedSeedMeta = await sharp(normalizedSeed).metadata();
  assert.deepEqual([normalizedSeedMeta.width, normalizedSeedMeta.height], [64, 64], "Seeds use the runtime frame canvas.");

  const noisyAtlas = path.join(tempDirectory, "noisy-atlas.png");
  const noisyPixels = Buffer.alloc(64 * 192 * 4);
  for (let row = 0; row < 3; row += 1) {
    for (let y = 30; y < 60; y += 1) {
      for (let x = 24; x < 40; x += 1) {
        const offset = ((row * 64 + y) * 64 + x) * 4;
        noisyPixels[offset] = 80;
        noisyPixels[offset + 1] = 100;
        noisyPixels[offset + 2] = 70;
        noisyPixels[offset + 3] = 255;
      }
    }
    for (let y = 2; y < 4; y += 1) {
      for (let x = 60; x < 62; x += 1) noisyPixels[((row * 64 + y) * 64 + x) * 4 + 3] = 255;
    }
  }
  await sharp(noisyPixels, { raw: { width: 64, height: 192, channels: 4 } }).png().toFile(noisyAtlas);
  await normalizeCharacterAtlas({ input: noisyAtlas, outputDirectory: tempDirectory, characterName: "fixture", state: "idle", frameCount: 1 });
  const cleaned = await sharp(path.join(tempDirectory, "fixture-south-idle.png")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let cleanedMinY = 64;
  let cleanedMaxY = -1;
  for (let y = 0; y < 64; y += 1) {
    for (let x = 0; x < 64; x += 1) {
      if (cleaned.data[(y * 64 + x) * 4 + 3] > 20) {
        cleanedMinY = Math.min(cleanedMinY, y);
        cleanedMaxY = Math.max(cleanedMaxY, y);
      }
    }
  }
  assert.ok(cleanedMaxY - cleanedMinY + 1 >= 48, "Tiny detached fragments must not shrink the main subject during normalization.");

  const rowBleedAtlas = path.join(tempDirectory, "row-bleed-atlas.png");
  const rowBleedPixels = Buffer.alloc(64 * 192 * 4);
  for (let row = 0; row < 3; row += 1) {
    for (let y = 30; y < 60; y += 1) {
      for (let x = 24; x < 40; x += 1) {
        const offset = ((row * 64 + y) * 64 + x) * 4;
        rowBleedPixels[offset] = 80;
        rowBleedPixels[offset + 1] = 100;
        rowBleedPixels[offset + 2] = 70;
        rowBleedPixels[offset + 3] = 255;
      }
    }
    for (let y = 2; y < 10; y += 1) {
      for (let x = 22; x < 30; x += 1) rowBleedPixels[((row * 64 + y) * 64 + x) * 4 + 3] = 255;
    }
  }
  await sharp(rowBleedPixels, { raw: { width: 64, height: 192, channels: 4 } }).png().toFile(rowBleedAtlas);
  await normalizeCharacterAtlas({ input: rowBleedAtlas, outputDirectory: tempDirectory, characterName: "row-bleed", state: "death", frameCount: 1 });
  const rowBleedFrame = await sharp(path.join(tempDirectory, "row-bleed-south-death.png")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const visited = new Uint8Array(64 * 64);
  let componentCount = 0;
  for (let start = 0; start < visited.length; start += 1) {
    if (visited[start] || rowBleedFrame.data[start * 4 + 3] <= 20) continue;
    componentCount += 1;
    const queue = [start];
    visited[start] = 1;
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const index = queue[cursor];
      const x = index % 64;
      const y = Math.floor(index / 64);
      for (const [nextX, nextY] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (nextX < 0 || nextY < 0 || nextX >= 64 || nextY >= 64) continue;
        const next = nextY * 64 + nextX;
        if (visited[next] || rowBleedFrame.data[next * 4 + 3] <= 20) continue;
        visited[next] = 1;
        queue.push(next);
      }
    }
  }
  assert.equal(componentCount, 1, "A substantial but distant row-bleed fragment must not survive normalization.");

  const looseGridAtlas = path.join(tempDirectory, "loose-grid-atlas.png");
  const loosePixels = Buffer.alloc(1536 * 768 * 4);
  const centers = [300, 590, 880, 1170];
  for (let row = 0; row < 3; row += 1) {
    for (const center of centers) {
      for (let y = 58; y < 198; y += 1) {
        for (let x = center - 40; x < center + 40; x += 1) {
          const offset = ((row * 256 + y) * 1536 + x) * 4;
          loosePixels[offset] = 90;
          loosePixels[offset + 1] = 110;
          loosePixels[offset + 2] = 80;
          loosePixels[offset + 3] = 255;
        }
      }
    }
  }
  await sharp(loosePixels, { raw: { width: 1536, height: 768, channels: 4 } }).png().toFile(looseGridAtlas);
  await normalizeCharacterAtlas({ input: looseGridAtlas, outputDirectory: tempDirectory, characterName: "loose", state: "idle", frameCount: 4 });
  const looseStrip = await sharp(path.join(tempDirectory, "loose-south-idle.png")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let frame = 0; frame < 4; frame += 1) {
    let minX = 64;
    let maxX = -1;
    for (let y = 0; y < 64; y += 1) {
      for (let x = 0; x < 64; x += 1) {
        if (looseStrip.data[(y * looseStrip.info.width + frame * 64 + x) * 4 + 3] > 20) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
        }
      }
    }
    assert.ok(maxX - minX + 1 >= 28, `Loose-grid frame ${frame + 1} must not be split by equal-width atlas assumptions.`);
  }

  const summary = await validateMonsterPack({ directory: cropDirectory, basename: "crop-saboteur" });
  assert.equal(summary.stripCount, 15, "A complete pack exposes fifteen direction/state strips.");
  assert.equal(summary.frameCount, 63, "A complete pack exposes sixty-three normalized frames.");

  const previewPath = path.join(tempDirectory, "crop-preview.png");
  await buildMonsterPackPreview({ directory: cropDirectory, basename: "crop-saboteur", output: previewPath });
  const preview = await sharp(await readFile(previewPath)).metadata();
  assert.ok(preview.width >= 384, "The preview must fit the six-frame death row.");
  assert.ok(preview.height >= 960, "The preview must show all five states for all three directions.");

  const rosterPath = path.join(tempDirectory, "roster-preview.png");
  await buildMonsterRosterPreview({
    entries: Array.from({ length: 4 }, (_, index) => ({ label: `Fixture ${index + 1}`, preview: previewPath })),
    output: rosterPath,
  });
  const roster = await sharp(rosterPath).metadata();
  assert.ok(roster.width >= 1900, "A four-character roster keeps all animation columns readable.");
  assert.ok(roster.height >= preview.height, "Roster preview preserves complete animation rows.");
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}

console.log("PASS: monster pack pipeline removes chroma, validates strips, and renders previews.");
