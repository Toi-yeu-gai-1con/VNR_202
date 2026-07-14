import { pathToFileURL } from "node:url";
import sharp from "sharp";

export async function normalizeMonsterSeed(input, output) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * 4 + 3] <= 20) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (maxX < 0) throw new Error("Seed has no opaque subject.");
  const crop = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
  const scale = Math.min(60 / crop.width, 60 / crop.height);
  const width = Math.max(1, Math.round(crop.width * scale));
  const height = Math.max(1, Math.round(crop.height * scale));
  const left = Math.floor((64 - width) / 2);
  const bottom = 2;
  await sharp(input)
    .extract(crop)
    .resize(width, height, { fit: "fill", kernel: "nearest" })
    .extend({ top: 64 - height - bottom, bottom, left, right: 64 - width - left, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(output);
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error("Usage: node scripts/normalize-monster-seed.mjs <input.png> <output.png>");
  await normalizeMonsterSeed(input, output);
  console.log(`Normalized seed: ${output}`);
}
