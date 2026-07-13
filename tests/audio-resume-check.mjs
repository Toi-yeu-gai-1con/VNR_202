import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../game.js", import.meta.url), "utf8");
const audioSource = readFileSync(new URL("../src/systems/audio-system.js", import.meta.url), "utf8");

assert.match(
  audioSource,
  /function pauseLoopingSound\(sound\)[\s\S]*?sound\.pause\(\);/,
  "Inactive map music needs a pause-only helper."
);
assert.match(
  audioSource,
  /function resetSound\(sound\)[\s\S]*?sound\.currentTime = 0;/,
  "New sessions need an explicit reset helper."
);
assert.match(
  audioSource,
  /if \(!activeSet\.has\(sound\)\) \{\s*pauseLoopingSound\(sound\);\s*\}/,
  "Changing maps must pause inactive music without resetting its playback position."
);
assert.match(
  source,
  /function beginGameSession\(\) \{\s*resetMusicForNewSession\(\);/,
  "A new journey must reset saved music positions."
);
assert.match(
  source,
  /function restartGame\(\) \{\s*resetMusicForNewSession\(\);/,
  "Restarting must reset saved music positions."
);

console.log("PASS: music pause and reset boundaries are configured.");
