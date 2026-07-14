import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const directions = ["south", "north", "east"];

function componentDistance(a, b) {
  const dx = Math.max(0, a.minX - b.maxX - 1, b.minX - a.maxX - 1);
  const dy = Math.max(0, a.minY - b.maxY - 1, b.minY - a.maxY - 1);
  return Math.hypot(dx, dy);
}

function findComponents(source, sourceWidth, slotLeft, slotTop, slotWidth, slotHeight) {
  const visited = new Uint8Array(slotWidth * slotHeight);
  const components = [];
  const alphaAt = (x, y) => source[((slotTop + y) * sourceWidth + slotLeft + x) * 4 + 3];

  for (let startY = 0; startY < slotHeight; startY += 1) {
    for (let startX = 0; startX < slotWidth; startX += 1) {
      const start = startY * slotWidth + startX;
      if (visited[start] || alphaAt(startX, startY) <= 20) continue;
      const queue = [start];
      const pixels = [];
      visited[start] = 1;
      let minX = startX;
      let minY = startY;
      let maxX = startX;
      let maxY = startY;
      for (let cursor = 0; cursor < queue.length; cursor += 1) {
        const index = queue[cursor];
        const x = index % slotWidth;
        const y = Math.floor(index / slotWidth);
        pixels.push(index);
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        for (const [nextX, nextY] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
          if (nextX < 0 || nextY < 0 || nextX >= slotWidth || nextY >= slotHeight) continue;
          const next = nextY * slotWidth + nextX;
          if (visited[next] || alphaAt(nextX, nextY) <= 20) continue;
          visited[next] = 1;
          queue.push(next);
        }
      }
      components.push({ pixels, area: pixels.length, minX, minY, maxX, maxY });
    }
  }

  return components;
}

function detectColumnBounds(source, sourceWidth, rowTop, rowHeight, frameCount) {
  const components = findComponents(source, sourceWidth, 0, rowTop, sourceWidth, rowHeight)
    .sort((a, b) => b.area - a.area);
  const minimumSeparation = sourceWidth / (frameCount * 2.5);
  const subjects = [];
  for (const component of components) {
    const center = (component.minX + component.maxX) / 2;
    if (subjects.every((subject) => Math.abs(subject.center - center) >= minimumSeparation)) {
      subjects.push({ center, area: component.area });
      if (subjects.length === frameCount) break;
    }
  }
  if (subjects.length !== frameCount) {
    return Array.from({ length: frameCount + 1 }, (_, index) => Math.round(index * sourceWidth / frameCount));
  }
  subjects.sort((a, b) => a.center - b.center);
  const bounds = [0];
  for (let index = 1; index < subjects.length; index += 1) {
    bounds.push(Math.round((subjects[index - 1].center + subjects[index].center) / 2));
  }
  bounds.push(sourceWidth);
  return bounds;
}

function cleanSlot(source, sourceWidth, slotLeft, slotTop, slotWidth, slotHeight) {
  const components = findComponents(source, sourceWidth, slotLeft, slotTop, slotWidth, slotHeight);
  if (!components.length) throw new Error("Atlas slot has no opaque subject.");
  components.sort((a, b) => b.area - a.area);
  const main = components[0];
  const kept = components.filter((component) => {
    if (component === main) return true;
    const verticalGap = Math.max(0, component.minY - main.maxY - 1, main.minY - component.maxY - 1);
    return (component.area >= 2 && componentDistance(component, main) <= 6) ||
      (component.area >= main.area * 0.02 && verticalGap <= 6);
  });
  const cleaned = Buffer.alloc(slotWidth * slotHeight * 4);
  for (const component of kept) {
    for (const index of component.pixels) {
      const x = index % slotWidth;
      const y = Math.floor(index / slotWidth);
      const sourceOffset = ((slotTop + y) * sourceWidth + slotLeft + x) * 4;
      source.copy(cleaned, index * 4, sourceOffset, sourceOffset + 4);
    }
  }
  const minX = Math.max(0, Math.min(...kept.map((component) => component.minX)) - 4);
  const minY = Math.max(0, Math.min(...kept.map((component) => component.minY)) - 3);
  const maxX = Math.min(slotWidth - 1, Math.max(...kept.map((component) => component.maxX)) + 4);
  const maxY = Math.min(slotHeight - 1, Math.max(...kept.map((component) => component.maxY)) + 3);
  return { cleaned, slotWidth, slotHeight, crop: { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 } };
}

export async function normalizeCharacterAtlas({ input, outputDirectory, characterName, state, frameCount }) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const slotWidth = Math.floor(info.width / frameCount);
  const slotHeight = Math.floor(info.height / directions.length);
  const slots = [];

  for (let row = 0; row < directions.length; row += 1) {
    slots[row] = [];
    const columnBounds = detectColumnBounds(data, info.width, row * slotHeight, slotHeight, frameCount);
    for (let frame = 0; frame < frameCount; frame += 1) {
      const slotLeft = columnBounds[frame];
      const detectedWidth = columnBounds[frame + 1] - slotLeft;
      slots[row][frame] = cleanSlot(data, info.width, slotLeft, row * slotHeight, detectedWidth, slotHeight);
    }
  }

  const sharedScale = Math.min(
    60 / Math.max(...slots.flat().map(({ crop }) => crop.width)),
    60 / Math.max(...slots.flat().map(({ crop }) => crop.height)),
  );

  for (let row = 0; row < directions.length; row += 1) {
    const frames = [];
    for (let frame = 0; frame < frameCount; frame += 1) {
      const { cleaned, slotWidth: frameSlotWidth, slotHeight: frameSlotHeight, crop } = slots[row][frame];
      const renderWidth = Math.max(1, Math.round(crop.width * sharedScale));
      const renderHeight = Math.max(1, Math.round(crop.height * sharedScale));
      const left = Math.floor((64 - renderWidth) / 2);
      const bottom = 2;
      const cropped = await sharp(cleaned, { raw: { width: frameSlotWidth, height: frameSlotHeight, channels: 4 } })
        .extract(crop)
        .resize(renderWidth, renderHeight, { fit: "fill", kernel: "nearest" })
        .extend({ top: 64 - renderHeight - bottom, bottom, left, right: 64 - renderWidth - left, background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
      frames.push({ input: cropped, left: frame * 64, top: 0 });
    }
    const output = path.join(outputDirectory, `${characterName}-${directions[row]}-${state}.png`);
    await sharp({ create: { width: frameCount * 64, height: 64, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite(frames)
      .png()
      .toFile(output);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [input, outputDirectory, characterName, state, frameArgument] = process.argv.slice(2);
  const frameCount = Number(frameArgument);
  if (!input || !outputDirectory || !characterName || !state || !Number.isInteger(frameCount) || frameCount < 1) {
    throw new Error("Usage: node scripts/normalize-character-atlas.mjs <alpha-atlas.png> <output-dir> <character> <state> <frames>");
  }
  await normalizeCharacterAtlas({ input, outputDirectory, characterName, state, frameCount });
  console.log(`Normalized ${characterName} ${state} atlas.`);
}
