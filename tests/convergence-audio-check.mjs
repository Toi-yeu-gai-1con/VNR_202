import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

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

const cueFiles = [
  "relic-convergence.wav",
  "relic-convergence-neutral.wav",
  "relic-convergence-fractured.wav",
];
const hashes = new Set();
for (const filename of cueFiles) {
  const buffer = await readFile(fileURLToPath(new URL(`../assets/audio/sfx/${filename}`, import.meta.url)));
  const audio = parsePcmWav(buffer);
  assert.equal(audio.channels, 1, `${filename} must remain mono to avoid unnecessary browser payload.`);
  assert.ok(Math.abs(audio.duration - 13.2) <= 0.1, `${filename} must cover the complete cinematic cue.`);
  assert.ok(rmsInWindow(audio, 0.3, 4.5) > 0.025, `${filename} must audibly score the five relic arrivals.`);
  assert.ok(rmsInWindow(audio, 4.5, 6.2) > 0.025, `${filename} must audibly score the fusion core.`);
  assert.ok(rmsInWindow(audio, 6.2, 12.8) > 0.025, `${filename} must audibly score the map reveal.`);
  hashes.add(createHash("sha256").update(buffer).digest("hex"));
}
assert.equal(hashes.size, cueFiles.length, "Good, Neutral and Secret must use distinct authored cues.");

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

console.log("PASS: convergence cues cover their timeline and the fracture one-shot is production-ready.");
