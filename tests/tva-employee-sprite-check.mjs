import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

for (const direction of ["down", "downleft", "left", "up", "upleft"]) {
  const spritePath = fileURLToPath(
    new URL(`../assets/npcs/tva-employee/${direction}.png`, import.meta.url)
  );
  const metadata = await sharp(spritePath).metadata();

  assert.equal(metadata.width, 1536, `${direction} keeps eight 192 px frames.`);
  assert.equal(metadata.height, 768, `${direction} keeps two 384 px animation rows.`);
  assert.equal(metadata.hasAlpha, true, `${direction} keeps transparent chroma-key removal.`);
}

console.log("PASS: David uses the high-resolution normalized directional sheets.");
