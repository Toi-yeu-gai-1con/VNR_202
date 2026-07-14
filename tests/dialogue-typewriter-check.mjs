import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const runtime = await readFile(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");

for (const sound of ["sfx-blipmale.wav", "sfx-blipfemale.wav"]) {
  const soundUrl = new URL(`../assets/audio/sfx/${sound}`, import.meta.url);
  const soundStats = await stat(soundUrl);
  assert.ok(soundStats.size > 44, `${sound} must contain a valid WAV payload.`);
}

assert.match(runtime, /dialogueMale: loadSound\("assets\/audio\/sfx\/sfx-blipmale\.wav"/, "Male dialogue blip must be preloaded.");
assert.match(runtime, /dialogueFemale: loadSound\("assets\/audio\/sfx\/sfx-blipfemale\.wav"/, "Female dialogue blip must be preloaded.");
assert.match(runtime, /function updateTypewriter\(/, "Dialogue text must advance through a typewriter update loop.");
assert.match(runtime, /function revealActiveTypewriter\(/, "Input must be able to finish the current line before advancing.");
assert.match(runtime, /playCombatSfx\(typewriter\.voiceKey/, "Each revealed dialogue character must emit its voice blip through the SFX path.");
assert.match(runtime, /endingRecovery.*intervalMs|intervalMs.*endingRecovery/s, "Bad-ending recovery must use its own slower typewriter timing.");
assert.match(runtime, /dialogue:\s*32/, "Regular dialogue must use a Phoenix Wright-like brisk typewriter interval.");
assert.match(runtime, /endingRecovery:\s*40/, "Bad-ending recovery dialogue must remain slower than regular dialogue.");
assert.match(runtime, /function getTypewriterPunctuationPause\(/, "Typewriter cadence must pause naturally at punctuation.");
assert.match(runtime, /short:\s*70/, "Commas and other short punctuation must add a brief pause.");
assert.match(runtime, /sentence:\s*130/, "Sentence endings must add a clear dramatic pause.");
assert.match(runtime, /const cadence = typewriter\.blipGroup % 2 === 0 \? 2 : 3/, "Voice blips must alternate between two- and three-letter spacing.");
assert.match(runtime, /!\/?\[\\p\{L\}\\p\{N\}\]/, "Voice blips must ignore whitespace and punctuation.");

console.log("PASS: dialogue typewriter and male/female voice blips are wired into the runtime.");
