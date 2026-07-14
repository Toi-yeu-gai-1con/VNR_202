import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

for (const direction of ["down", "downleft", "left", "up", "upleft"]) {
  const spritePath = fileURLToPath(
    new URL(`../assets/time-archive/characters/agent-m90/${direction}.png`, import.meta.url)
  );
  const metadata = await sharp(spritePath).metadata();

  assert.equal(metadata.width, 768, `${direction} keeps eight 96 px frames.`);
  assert.equal(metadata.height, 192, `${direction} keeps two 96 px animation rows.`);
  assert.equal(metadata.hasAlpha, true, `${direction} keeps transparent chroma-key removal.`);
}

console.log("PASS: the TVA employee role uses M-90's normalized directional sheets.");
