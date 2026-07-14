import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { MONSTER_DIRECTIONS, MONSTER_STATE_FRAMES } from "./validate-monster-pack.mjs";

function labelSvg(width, height, text, size = 16) {
  const escaped = text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><text x="8" y="${Math.round(height * 0.7)}" fill="#f5e6c8" font-family="sans-serif" font-size="${size}" font-weight="700">${escaped}</text></svg>`);
}

export async function buildMonsterPackPreview({ directory, basename, output = path.join(directory, `${basename}-full-animation-preview.png`) }) {
  const labelWidth = 92;
  const rowWidth = 6 * 64;
  const rowHeight = 72;
  const directionHeader = 30;
  const outerPadding = 16;
  const width = outerPadding * 2 + labelWidth + rowWidth;
  const height = outerPadding * 2 + MONSTER_DIRECTIONS.length * (directionHeader + Object.keys(MONSTER_STATE_FRAMES).length * rowHeight);
  const layers = [];
  let top = outerPadding;

  for (const direction of MONSTER_DIRECTIONS) {
    layers.push({ input: labelSvg(width - outerPadding * 2, directionHeader, direction.toUpperCase(), 18), left: outerPadding, top });
    top += directionHeader;
    for (const [state, frameCount] of Object.entries(MONSTER_STATE_FRAMES)) {
      layers.push({ input: labelSvg(labelWidth, 64, state.toUpperCase(), 14), left: outerPadding, top });
      layers.push({ input: path.join(directory, `${basename}-${direction}-${state}.png`), left: outerPadding + labelWidth, top });
      if (frameCount < 6) {
        layers.push({
          input: { create: { width: (6 - frameCount) * 64, height: 64, channels: 4, background: { r: 30, g: 31, b: 34, alpha: 1 } } },
          left: outerPadding + labelWidth + frameCount * 64,
          top,
        });
      }
      top += rowHeight;
    }
  }

  await sharp({ create: { width, height, channels: 4, background: { r: 20, g: 21, b: 24, alpha: 1 } } })
    .composite(layers)
    .png()
    .toFile(output);
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [directory, basename, output] = process.argv.slice(2);
  if (!directory || !basename) throw new Error("Usage: node scripts/build-monster-pack-preview.mjs <directory> <basename> [output.png]");
  console.log(`Preview written: ${await buildMonsterPackPreview({ directory, basename, output })}`);
}
