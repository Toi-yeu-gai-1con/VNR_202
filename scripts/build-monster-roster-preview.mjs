import { pathToFileURL } from "node:url";
import sharp from "sharp";

function header(width, text) {
  const escaped = text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  return Buffer.from(`<svg width="${width}" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#141518"/><text x="12" y="27" fill="#f5e6c8" font-family="sans-serif" font-size="18" font-weight="700">${escaped}</text></svg>`);
}

export async function buildMonsterRosterPreview({ entries, output }) {
  if (!entries?.length) throw new Error("Roster preview requires at least one entry.");
  const metadata = await Promise.all(entries.map((entry) => sharp(entry.preview).metadata()));
  const gap = 12;
  const headerHeight = 40;
  const height = headerHeight + Math.max(...metadata.map((item) => item.height));
  const width = metadata.reduce((total, item) => total + item.width, 0) + gap * (entries.length - 1);
  const layers = [];
  let left = 0;
  entries.forEach((entry, index) => {
    layers.push({ input: header(metadata[index].width, entry.label), left, top: 0 });
    layers.push({ input: entry.preview, left, top: headerHeight });
    left += metadata[index].width + gap;
  });
  await sharp({ create: { width, height, channels: 4, background: { r: 20, g: 21, b: 24, alpha: 1 } } })
    .composite(layers)
    .png()
    .toFile(output);
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [output, ...pairs] = process.argv.slice(2);
  if (!output || pairs.length < 2 || pairs.length % 2 !== 0) {
    throw new Error("Usage: node scripts/build-monster-roster-preview.mjs <output.png> <label> <preview.png> [<label> <preview.png> ...]");
  }
  const entries = [];
  for (let index = 0; index < pairs.length; index += 2) entries.push({ label: pairs[index], preview: pairs[index + 1] });
  console.log(`Roster preview written: ${await buildMonsterRosterPreview({ entries, output })}`);
}
