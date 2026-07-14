import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const monsters = [
  ["zone1-enforcer-captain", "enforcer-captain"],
  ["zone1-night-raider", "night-raider"],
  ["zone1-colonial-soldier", "colonial-patrol"],
  ["zone1-signalman", "signalman"],
];

for (const [folder, sprite] of monsters) {
  for (const direction of ["south", "north", "east"]) {
    for (const [state, frameCount] of [["idle", 4], ["walk", 4], ["attack", 4], ["hurt", 3], ["death", 6]]) {
      const file = path.join(root, "assets", "monsters", folder, `${sprite}-${direction}-${state}.png`);
      const image = sharp(file).ensureAlpha();
      const metadata = await image.metadata();
      assert.equal(metadata.width, frameCount * 64, `${file} has the expected fixed-width frame strip.`);
      assert.equal(metadata.height, 64, `${file} keeps the Zone 1 shared frame height.`);

      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
      for (let frame = 0; frame < frameCount; frame += 1) {
        for (const x of [4, 5, 6, 7, 8, 9, 10]) {
          let opaqueBlackPixels = 0;
          for (let y = 4; y < 60; y += 1) {
            const index = (y * info.width + frame * 64 + x) * 4;
            if (data[index] === 0 && data[index + 1] === 0 && data[index + 2] === 0 && data[index + 3] > 220) {
              opaqueBlackPixels += 1;
            }
          }
          assert.ok(opaqueBlackPixels < 36, `${file} frame ${frame} must not contain a chroma-key black side wall.`);
        }
      }
    }
  }
}

console.log("PASS: Zone 1 directional sheets are normalized and free of opaque chroma-key side walls.");
