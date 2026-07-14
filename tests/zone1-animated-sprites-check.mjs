import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const strips = [
  "assets/monsters/zone1-colonial-soldier/colonial-patrol-walk.png",
  "assets/monsters/zone1-colonial-soldier/colonial-patrol-attack.png",
  "assets/monsters/zone1-night-raider/night-raider-walk.png",
  "assets/monsters/zone1-night-raider/night-raider-attack.png",
  "assets/monsters/zone1-signalman/signalman-walk.png",
  "assets/monsters/zone1-signalman/signalman-attack.png",
  "assets/monsters/zone1-enforcer-captain/enforcer-captain-walk.png",
  "assets/monsters/zone1-enforcer-captain/enforcer-captain-attack.png",
];

for (const relativeStrip of strips) {
  const strip = path.join(repositoryRoot, relativeStrip);
  const image = sharp(strip).ensureAlpha();
  const metadata = await image.metadata();
  assert.equal(metadata.width, 256, `${relativeStrip} should contain four 64px frames.`);
  assert.equal(metadata.height, 64, `${relativeStrip} should keep the shared 64px frame height.`);

  const frameHashes = await Promise.all(
    [0, 1, 2, 3].map(async (index) => {
      const pixels = await sharp(strip)
        .ensureAlpha()
        .extract({ left: index * 64, top: 0, width: 64, height: 64 })
        .raw()
        .toBuffer();
      return createHash("sha256").update(pixels).digest("hex");
    })
  );
  assert.equal(new Set(frameHashes).size, 4, `${relativeStrip} must contain four distinct animation poses.`);
}

console.log("PASS: Zone 1 adversary sheets contain four unique 64px animation frames.");
