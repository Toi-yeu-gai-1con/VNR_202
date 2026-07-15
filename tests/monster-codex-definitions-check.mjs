import assert from "node:assert/strict";
import { MONSTER_CODEX_DEFINITIONS, getMonsterCodexEntry } from "../src/data/monster-codex-definitions.js";

const expectedMonsterIds = [
  "village-raider", "village-marksman", "village-chanter", "village-corruption-guard",
  "archive-raider", "archive-marksman", "archive-chanter", "archive-shadow-curator",
  "crossroads-raider", "crossroads-marksman", "crossroads-chanter", "southern-tyrant",
  "spring-raider", "spring-marksman", "spring-chanter", "spring-bureaucracy-beast",
];

assert.deepEqual(MONSTER_CODEX_DEFINITIONS.map((entry) => entry.monsterId), expectedMonsterIds, "The codex covers every authored zone monster and boss exactly once.");
for (const entry of MONSTER_CODEX_DEFINITIONS) {
  assert.ok(entry.storyId.startsWith("monster:"), `${entry.monsterId} has a stable book record.`);
  assert.ok(entry.artKey, `${entry.monsterId} uses its approved runtime sprite pack.`);
  assert.ok(entry.silhouette && entry.behavior && entry.telegraph && entry.zoneLabel, `${entry.monsterId} explains the silhouette, behavior, telegraph, and zone.`);
  assert.doesNotMatch(entry.note, /sự kiện lịch sử có thật/i, `${entry.monsterId} is clearly framed as a gameplay figure, not historical evidence.`);
}
assert.equal(getMonsterCodexEntry("archive-shadow-curator")?.boss, true, "Boss records retain their boss identity.");
assert.equal(getMonsterCodexEntry("unknown-entity"), null, "Unknown entities cannot create a fake codex record.");

console.log("PASS: monster codex data is complete, game-fiction safe, and bound to approved sprite packs.");
