import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const monsters = [
  ["zone1-enforcer-captain", "enforcer-captain"],
  ["zone1-night-raider", "night-raider"],
  ["zone1-colonial-soldier", "colonial-patrol"],
  ["zone1-signalman", "signalman"],
];

async function sourceFrame(source, index = 0) {
  return sharp(source).extract({ left: index * 64, top: 0, width: 64, height: 64 }).ensureAlpha().png().toBuffer();
}

async function pose(input, { height, brightness = 1, saturation = 1, opacity = 1 }) {
  const body = await sharp(input)
    .resize(56, height, { fit: "contain", kernel: "nearest", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .modulate({ brightness, saturation })
    .ensureAlpha(opacity)
    .png()
    .toBuffer();
  return sharp({ create: { width: 64, height: 64, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: body, left: 4, top: 60 - height }])
    .png()
    .toBuffer();
}

async function saveStrip(destination, frames) {
  await sharp({ create: { width: frames.length * 64, height: 64, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(frames.map((input, index) => ({ input, left: index * 64, top: 0 })))
    .png()
    .toFile(destination);
}

for (const [folderName, spriteName] of monsters) {
  const folder = path.join(root, "assets", "monsters", folderName);
  for (const direction of ["south", "north", "east"]) {
    const base = await sourceFrame(path.join(folder, `${spriteName}-${direction}-idle.png`));
    const hurt = await Promise.all([
      pose(base, { height: 56 }),
      pose(base, { height: 54, brightness: 1.35, saturation: 0.55 }),
      pose(base, { height: 56, brightness: 0.86, saturation: 0.8 }),
    ]);
    const death = await Promise.all([
      pose(base, { height: 56 }),
      pose(base, { height: 52, brightness: 0.9, saturation: 0.75 }),
      pose(base, { height: 46, brightness: 0.78, saturation: 0.55 }),
      pose(base, { height: 36, brightness: 0.66, saturation: 0.38 }),
      pose(base, { height: 24, brightness: 0.54, saturation: 0.2 }),
      pose(base, { height: 12, brightness: 0.42, saturation: 0.05, opacity: 0.82 }),
    ]);
    await saveStrip(path.join(folder, `${spriteName}-${direction}-hurt.png`), hurt);
    await saveStrip(path.join(folder, `${spriteName}-${direction}-death.png`), death);
  }
}

console.log("Generated Zone 1 hurt and death state strips with a fixed bottom anchor.");
