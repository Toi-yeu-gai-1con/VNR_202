import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const runtime = readFileSync(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");
const showEnding = runtime.slice(
  runtime.indexOf("function showEndOverlay()"),
  runtime.indexOf("function hideEndOverlay()"),
);

assert.match(
  showEnding,
  /assetManager\.(?:loadGroup|preloadGroup)\("ending"\)/,
  "Entering either ending must explicitly load the ending asset group instead of relying on route preloading.",
);
assert.match(
  showEnding,
  /\.then\([\s\S]*syncAmbienceAudio/,
  "Ending music must be synchronized again after its lazy asset group finishes loading.",
);

console.log("PASS: ending scenes explicitly load and resume their music group.");
