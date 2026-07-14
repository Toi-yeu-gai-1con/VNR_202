import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BAD_ENDING_RECOVERY, TVA_EMPLOYEE_DIALOGUES } from "../src/data/story-content.js";

const game = readFileSync(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");
const story = readFileSync(new URL("../src/data/story-content.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

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

const tvaIntroduction = TVA_EMPLOYEE_DIALOGUES.introduction.lines;
assert.equal(tvaIntroduction[0].speaker, "David", "The TVA employee introduces the scene under his own name.");
assert.match(tvaIntroduction[0].text, /^[\x00-\x7F]+$/, "David initially addresses the traveler in English.");
assert.equal(tvaIntroduction[1].speaker, "Nhà du hành", "The confused traveler answers David in Vietnamese.");
assert.match(tvaIntroduction[1].text, /đây là đâu/i, "The traveler clearly asks where they are.");
assert.ok(
  tvaIntroduction.some((line) => /hiệu chỉnh|bộ phiên dịch/i.test(line.text)),
  "David visibly adjusts his personal translation system before continuing in Vietnamese."
);
assert.ok(
  tvaIntroduction.some((line) => /Time Variance Authority/.test(line.text)),
  "David expands the TVA acronym in English."
);
assert.ok(
  tvaIntroduction.some((line) => /Cơ quan Quản lý Phương sai Thời gian/.test(line.text)),
  "David gives the Vietnamese translation of TVA."
);
assert.equal(BAD_ENDING_RECOVERY.speaker, "David", "The TVA employee keeps his name in ending recovery scenes.");
assert.match(game, /dialogueBox\.dataset\.speaker\s*=/, "Dialogue rendering exposes the current speaker to the UI theme.");
assert.match(styles, /\.dialogue-box\[data-speaker="david"\]/, "David has a distinct dialogue name treatment.");
assert.match(styles, /\.dialogue-box\[data-speaker="traveler"\]/, "The traveler has a distinct dialogue name treatment.");

console.log("PASS: story and ending content are data-owned outside the runtime.");
