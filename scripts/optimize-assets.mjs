import { spawn } from "node:child_process";
import { mkdir, rename, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";
import { AUDIO_SOURCE_CANDIDATES, AUDIO_TRACKS } from "../src/data/media-sources.js";

export const IMAGE_OPTIMIZATION_SOURCES = Object.freeze([
  "assets/ui/generated/start-screen-hero.png",
  "assets/environment/generated-worlds/colonial-harbor-hero.png",
  "assets/environment/generated-worlds/archive-interior-hero.png",
  "assets/environment/generated-worlds/revolution-square-hero.png",
  "assets/environment/generated-worlds/factory-valley-hero.png",
  "assets/environment/generated-worlds/history-hub-hero.png",
  "assets/environment/generated-worlds/bad-ending-hero.png",
  "assets/environment/generated-worlds/good-ending-hero.png",
  "assets/story/level1/duong-kach-menh.png",
  "assets/story/level2/party-unification-1930.png",
  "assets/story/level3/august-revolution-1945.png",
]);

export const AUDIO_OPTIMIZATION_SOURCES = Object.freeze({
  [AUDIO_TRACKS.fireplace]: "assets/audio/fireplace-ambient.mp3",
  [AUDIO_TRACKS.rain]: "assets/audio/rain-ambient.mp3",
  [AUDIO_TRACKS.hub]: "assets/audio/hub-unexplored-expansion.mp3",
  [AUDIO_TRACKS.portMaze]: "assets/audio/unforgiving_himalayas_looping.ogg",
  [AUDIO_TRACKS.archive]: "assets/audio/archive-cave-theme.ogg",
  [AUDIO_TRACKS.crossroads]: "assets/audio/crossroads-ancient-power.ogg",
  [AUDIO_TRACKS.spring]: "assets/audio/spring-town-theme.mp3",
  [AUDIO_TRACKS.badEnding]: "assets/audio/Bad Ending - Mob of The Dead - Soundtrack.mp3",
  [AUDIO_TRACKS.goodEnding]: "assets/audio/good-ending-legend-will-rise.mp3",
});

export function getOptimizedImagePath(source) {
  return source.replace(/\.png$/i, ".webp");
}

function getImageQuality(source) {
  return source.startsWith("assets/story/") ? 92 : 86;
}

async function fileSize(filePath) {
  return (await stat(filePath)).size;
}

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function optimizeImage(rootDir, source) {
  const output = getOptimizedImagePath(source);
  const inputPath = path.join(rootDir, source);
  const outputPath = path.join(rootDir, output);
  if (!(await pathExists(inputPath))) {
    if (await pathExists(outputPath)) {
      return { source, output, beforeBytes: 0, afterBytes: await fileSize(outputPath), skipped: true };
    }
    throw new Error(`Missing source and replacement image: ${source}`);
  }
  await mkdir(path.dirname(outputPath), { recursive: true });
  await sharp(inputPath).webp({ quality: getImageQuality(source), smartSubsample: false }).toFile(outputPath);
  return { source, output, beforeBytes: await fileSize(inputPath), afterBytes: await fileSize(outputPath) };
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const process = spawn(ffmpegPath, args, { stdio: "inherit" });
    process.once("error", reject);
    process.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`)));
  });
}

async function optimizeAudio(rootDir, track, source) {
  const inputPath = path.join(rootDir, source);
  const [opus, fallback] = AUDIO_SOURCE_CANDIDATES[track];
  const targets = [
    { target: opus, codec: "libopus", bitrate: track === AUDIO_TRACKS.fireplace || track === AUDIO_TRACKS.rain ? "80k" : "112k" },
    { target: fallback, codec: "libmp3lame", bitrate: track === AUDIO_TRACKS.fireplace || track === AUDIO_TRACKS.rain ? "96k" : "128k" },
  ];
  const results = [];

  if (!(await pathExists(inputPath))) {
    const replacementsExist = await Promise.all(targets.map(({ target }) => pathExists(path.join(rootDir, target.src))));
    if (!replacementsExist.every(Boolean)) {
      throw new Error(`Missing source and replacement audio: ${source}`);
    }
    return {
      source,
      beforeBytes: 0,
      skipped: true,
      results: await Promise.all(targets.map(async ({ target }) => ({ output: target.src, bytes: await fileSize(path.join(rootDir, target.src)) }))),
    };
  }

  const beforeBytes = await fileSize(inputPath);

  for (const { target, codec, bitrate } of targets) {
    const outputPath = path.join(rootDir, target.src);
    const temporaryPath = `${outputPath}.tmp${path.extname(outputPath)}`;
    await mkdir(path.dirname(outputPath), { recursive: true });
    await runFfmpeg(["-y", "-i", inputPath, "-vn", "-c:a", codec, "-b:a", bitrate, temporaryPath]);
    await rename(temporaryPath, outputPath);
    results.push({ output: target.src, bytes: await fileSize(outputPath) });
  }

  return { source, beforeBytes, results };
}

export async function optimizeAssets(rootDir) {
  const images = [];
  for (const source of IMAGE_OPTIMIZATION_SOURCES) {
    images.push(await optimizeImage(rootDir, source));
  }

  const audio = [];
  for (const [track, source] of Object.entries(AUDIO_OPTIMIZATION_SOURCES)) {
    audio.push(await optimizeAudio(rootDir, track, source));
  }

  return { images, audio };
}

async function runCli() {
  const result = await optimizeAssets(process.cwd());
  const beforeBytes = result.images.reduce((total, image) => total + image.beforeBytes, 0) + result.audio.reduce((total, audio) => total + audio.beforeBytes, 0);
  const afterBytes = result.images.reduce((total, image) => total + image.afterBytes, 0) + result.audio.reduce((total, audio) => total + audio.results.reduce((sum, output) => sum + output.bytes, 0), 0);
  console.log(`Optimized ${result.images.length} images and ${result.audio.length} audio tracks: ${(beforeBytes / 1024 / 1024).toFixed(2)} MiB source -> ${(afterBytes / 1024 / 1024).toFixed(2)} MiB replacement set.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await runCli();
}
