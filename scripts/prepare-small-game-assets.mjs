#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((entries, value, index, values) => {
    if (!value.startsWith("--")) return entries;
    entries.push([value.slice(2), values[index + 1]]);
    return entries;
  }, []),
);

const input = args.input;
const output = args.output;
const frameCount = Number(args.frames ?? 4);
const frameSize = Number(args["frame-size"] ?? 24);
const padding = Number(args.padding ?? 2);
const anchor = args.anchor === "center" ? "center" : "bottom";
const paletteColors = Number(args.colors ?? 24);
const paletteVariant = args.palette ?? "source";
const alphaThreshold = Number(args["alpha-threshold"] ?? 64);

if (!input || !output || !Number.isInteger(frameCount) || frameCount < 1) {
  throw new Error("Usage: --input <png> --output <png> --frames <n> --frame-size <px>");
}

function findBounds(data, width, height) {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] <= alphaThreshold) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  return right < left ? null : { left, top, width: right - left + 1, height: bottom - top + 1 };
}

async function hardenAlpha(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const warmRamp = [
    [49, 25, 43],
    [113, 48, 45],
    [184, 78, 43],
    [229, 132, 52],
    [255, 205, 100],
    [255, 244, 194],
  ];
  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] <= alphaThreshold) {
      data[index] = 0;
      data[index + 1] = 0;
      data[index + 2] = 0;
      data[index + 3] = 0;
    } else {
      data[index + 3] = 255;
      if (paletteVariant === "warm") {
        const luminance = 0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2];
        const rampIndex = Math.min(warmRamp.length - 1, Math.floor(luminance / 43));
        [data[index], data[index + 1], data[index + 2]] = warmRamp[rampIndex];
      }
    }
  }
  return sharp(data, { raw: info }).png({ palette: true, colors: paletteColors }).toBuffer();
}

const source = sharp(input).ensureAlpha();
const metadata = await source.metadata();
const slotWidth = Math.floor(metadata.width / frameCount);
const frames = [];

for (let index = 0; index < frameCount; index += 1) {
  const left = Math.round(index * metadata.width / frameCount);
  const right = Math.round((index + 1) * metadata.width / frameCount);
  const width = right - left;
  const { data, info } = await sharp(input)
    .extract({ left, top: 0, width, height: metadata.height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bounds = findBounds(data, info.width, info.height);
  if (!bounds) throw new Error(`No visible content found in frame ${index + 1}`);
  frames.push({ left, width, bounds });
}

const maxWidth = Math.max(...frames.map(({ bounds }) => bounds.width));
const maxHeight = Math.max(...frames.map(({ bounds }) => bounds.height));
const drawableSize = frameSize - padding * 2;
const scale = Math.min(drawableSize / maxWidth, drawableSize / maxHeight);
const normalizedFrames = [];

for (const frame of frames) {
  const width = Math.max(1, Math.round(frame.bounds.width * scale));
  const height = Math.max(1, Math.round(frame.bounds.height * scale));
  const sprite = await sharp(input)
    .extract({
      left: frame.left + frame.bounds.left,
      top: frame.bounds.top,
      width: frame.bounds.width,
      height: frame.bounds.height,
    })
    .resize(width, height, { kernel: sharp.kernel.nearest })
    .png()
    .toBuffer();
  const top = anchor === "center" ? Math.floor((frameSize - height) / 2) : frameSize - padding - height;
  const left = Math.floor((frameSize - width) / 2);
  const composed = await sharp({
    create: { width: frameSize, height: frameSize, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  }).composite([{ input: sprite, left, top }]).png().toBuffer();
  normalizedFrames.push(await hardenAlpha(composed));
}

const sheet = sharp({
  create: {
    width: frameSize * frameCount,
    height: frameSize,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
});

await fs.mkdir(path.dirname(output), { recursive: true });
await sheet
  .composite(normalizedFrames.map((frame, index) => ({ input: frame, left: index * frameSize, top: 0 })))
  .png({ palette: true, colors: paletteColors })
  .toFile(output);

console.log(`${output}: ${frameCount} frames at ${frameSize}x${frameSize}; source slot ${slotWidth}px; scale ${scale.toFixed(4)}`);
