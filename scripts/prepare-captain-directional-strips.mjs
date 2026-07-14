import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const folder = path.join(root, "assets", "monsters", "zone1-enforcer-captain");
const source = path.join(folder, "enforcer-captain-directional-source-alpha.png");
const sourceImage = sharp(source).ensureAlpha();
const { width, height } = await sourceImage.metadata();
const cellWidth = width / 6;
const cellHeight = height / 3;

function cell(row, column) {
  return { left: Math.round(column * cellWidth), top: Math.round(row * cellHeight), width: Math.round((column + 1) * cellWidth) - Math.round(column * cellWidth), height: Math.round((row + 1) * cellHeight) - Math.round(row * cellHeight) };
}

async function frame(row, column) {
  const bounds = cell(row, column);
  const raw = await sharp(source).ensureAlpha().extract(bounds).raw().toBuffer();
  let minX = bounds.width;
  let minY = bounds.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < bounds.height; y += 1) {
    for (let x = 0; x < bounds.width; x += 1) {
      if (raw[(y * bounds.width + x) * 4 + 3] > 220) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  const cropped = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
  const extracted = await sharp(raw, { raw: { width: bounds.width, height: bounds.height, channels: 4 } }).extract(cropped).resize(56, 56, { fit: "contain", kernel: "nearest" }).png().toBuffer();
  return sharp({ create: { width: 64, height: 64, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: extracted, left: 4, top: 4 }])
    .png()
    .toBuffer();
}

async function strip(name, cells) {
  const frames = await Promise.all(cells.map(([row, column]) => frame(row, column)));
  await sharp({ create: { width: 64 * frames.length, height: 64, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(frames.map((input, index) => ({ input, left: index * 64, top: 0 })))
    .png()
    .toFile(path.join(folder, `enforcer-captain-${name}.png`));
}

const directions = {
  south: { idle: [[0, 0], [0, 0], [0, 0], [0, 0]], walk: [[0, 0], [0, 3], [1, 0], [1, 3]], attack: [[2, 0], [2, 3], [2, 0], [2, 3]] },
  north: { idle: [[0, 1], [0, 1], [0, 1], [0, 1]], walk: [[0, 1], [0, 4], [1, 1], [1, 4]], attack: [[2, 1], [2, 4], [2, 1], [2, 4]] },
  east: { idle: [[0, 2], [0, 2], [0, 2], [0, 2]], walk: [[0, 2], [0, 5], [1, 2], [1, 5]], attack: [[2, 2], [2, 5], [2, 2], [2, 5]] },
};

for (const [direction, actions] of Object.entries(directions)) {
  for (const [action, cells] of Object.entries(actions)) {
    await strip(`${direction}-${action}`, cells);
  }
}

console.log("Prepared captain directional strips from the generated 3x6 source sheet.");
