import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";

function parsePcmWav(buffer) {
  assert.equal(buffer.toString("ascii", 0, 4), "RIFF", "Audio asset must use a RIFF container.");
  assert.equal(buffer.toString("ascii", 8, 12), "WAVE", "Audio asset must use WAVE encoding.");
  let offset = 12;
  let format = null;
  let data = null;
  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString("ascii", offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    if (chunkId === "fmt ") {
      format = {
        encoding: buffer.readUInt16LE(chunkStart),
        channels: buffer.readUInt16LE(chunkStart + 2),
        sampleRate: buffer.readUInt32LE(chunkStart + 4),
        bitsPerSample: buffer.readUInt16LE(chunkStart + 14),
      };
    } else if (chunkId === "data") {
      data = buffer.subarray(chunkStart, chunkStart + chunkSize);
    }
    offset = chunkStart + chunkSize + (chunkSize % 2);
  }
  assert.ok(format && data, "WAV must include fmt and data chunks.");
  assert.equal(format.encoding, 1, "Convergence audio must remain PCM.");
  assert.equal(format.bitsPerSample, 16, "Convergence audio must remain 16-bit PCM.");
  const samples = new Int16Array(data.buffer, data.byteOffset, Math.floor(data.byteLength / 2));
  return {
    ...format,
    samples,
    duration: samples.length / format.sampleRate / format.channels,
  };
}

function rmsInWindow(audio, startSeconds, endSeconds) {
  const start = Math.floor(startSeconds * audio.sampleRate);
  const end = Math.min(audio.samples.length, Math.ceil(endSeconds * audio.sampleRate));
  let energy = 0;
  for (let index = start; index < end; index += 1) {
    const normalized = audio.samples[index] / 32768;
    energy += normalized * normalized;
  }
  return Math.sqrt(energy / Math.max(1, end - start));
}

function peak(audio) {
  let result = 0;
  for (const sample of audio.samples) result = Math.max(result, Math.abs(sample) / 32768);
  return result;
}

function probeDuration(path) {
  const result = spawnSync(ffmpegPath, ["-hide_banner", "-i", path], { encoding: "utf8" });
  const match = `${result.stdout}\n${result.stderr}`.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  assert.ok(match, `FFmpeg must read cinematic cue metadata for ${path}.`);
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

const cueFiles = [
  "relic-convergence-good",
  "relic-convergence-neutral",
  "relic-convergence-fractured",
];
const hashes = new Set();
for (const basename of cueFiles) {
  for (const extension of ["ogg", "mp3"]) {
    const path = fileURLToPath(new URL(`../assets/audio/cinematics/${basename}.${extension}`, import.meta.url));
    const buffer = await readFile(path);
    assert.ok(buffer.length > 20_000, `${basename}.${extension} must contain a real cinematic excerpt.`);
    assert.ok(Math.abs(probeDuration(path) - 13.2) <= 0.12, `${basename}.${extension} must cover the complete 13.2-second cinematic.`);
    hashes.add(createHash("sha256").update(buffer).digest("hex"));
  }
}
assert.equal(hashes.size, cueFiles.length * 2, "Every ending and browser format must use a distinct encoded asset.");

const fractureUrl = new URL("../assets/audio/sfx/relic-fracture.wav", import.meta.url);
let fractureExists = true;
try {
  await access(fileURLToPath(fractureUrl));
} catch {
  fractureExists = false;
}
assert.equal(fractureExists, true, "Secret/Bad requires a dedicated relic-fracture.wav one-shot.");
const fracture = parsePcmWav(await readFile(fileURLToPath(fractureUrl)));
assert.equal(fracture.channels, 2, "The new fracture one-shot uses stereo separation for the two map pieces.");
assert.equal(fracture.sampleRate, 48000, "The new fracture one-shot uses a 48 kHz cinematic master.");
assert.ok(fracture.duration >= 1.5 && fracture.duration <= 1.7, "The fracture one-shot must remain synchronized with the 850 ms tear and debris tail.");
assert.ok(peak(fracture) > 0.25, "The fracture transient must be clearly audible at the split moment.");

const generatorSource = await readFile(fileURLToPath(new URL("../scripts/generate-skill-sfx.py", import.meta.url)), "utf8");
assert.doesNotMatch(
  generatorSource,
  /"relic-fracture\.wav"\s*:/,
  "The deterministic cue generator must not overwrite the licensed recorded fracture master.",
);
assert.doesNotMatch(
  generatorSource,
  /"relic-convergence(?:-neutral|-fractured)?\.wav"\s*:/,
  "The deterministic SFX generator must not overwrite the selected cinematic music excerpts.",
);

console.log("PASS: convergence cues cover their timeline and the fracture one-shot is production-ready.");
