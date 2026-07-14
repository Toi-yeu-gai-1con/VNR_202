import { pathToFileURL } from "node:url";
import sharp from "sharp";

export async function removeMonsterChroma(input, output, { tolerance = 96 } = {}) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const result = Buffer.from(data);

  for (let index = 0; index < result.length; index += 4) {
    const red = result[index];
    const green = result[index + 1];
    const blue = result[index + 2];
    const distance = Math.hypot(255 - red, green, 255 - blue);
    if (distance <= tolerance) {
      result[index + 3] = 0;
      continue;
    }

    if (result[index + 3] > 0 && red > green * 1.45 && blue > green * 1.45) {
      const spill = Math.min(red, blue) - green;
      result[index] = Math.max(green, red - spill * 0.7);
      result[index + 2] = Math.max(green, blue - spill * 0.7);
    }
  }

  await sharp(result, { raw: info }).png().toFile(output);
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error("Usage: node scripts/remove-monster-chroma.mjs <input.png> <output.png>");
  await removeMonsterChroma(input, output);
  console.log(`Removed chroma background: ${output}`);
}
