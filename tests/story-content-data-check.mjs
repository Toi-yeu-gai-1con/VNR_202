import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");
const story = readFileSync(new URL("../src/data/story-content.js", import.meta.url), "utf8");

for (const exportName of [
  "INTERACTION_DIALOGUES",
  "TVA_EMPLOYEE_DIALOGUES",
  "RELIC_DEFINITIONS",
  "RELIC_STORY_SLIDES",
  "ENDING_DEFINITIONS",
  "ENDING_OVERLAY_SCENES",
  "ENDING_CINEMATIC_DEFINITIONS",
  "BAD_ENDING_RECOVERY",
  "OPENING_DIALOGUE",
]) {
  assert.match(story, new RegExp(`export const ${exportName} =`), `${exportName} must be owned by story content data.`);
  assert.match(game, new RegExp(`import \\{[^}]*${exportName}`), `${exportName} must be consumed from story content data.`);
}

assert.match(story, /Object\.assign\(RELIC_STORY_SLIDES\[itemId\], update\)/, "Story presentation overrides must remain with their data.");
assert.doesNotMatch(game, /const INTERACTION_DIALOGUES =/, "The runtime must not duplicate interaction dialogue data.");

console.log("PASS: story and ending content are data-owned outside the runtime.");
