import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const runtime = readFileSync(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");

assert.match(runtime, /import \{ MONSTER_CODEX_DEFINITIONS, getMonsterCodexEntry \} from "\.\.\/data\/monster-codex-definitions\.js";/, "Runtime reads codex content from data.");
assert.match(runtime, /import \{ createMonsterCodexCollection \} from "\.\.\/systems\/monster-codex-collection\.js";/, "Runtime keeps enemy records in a dedicated persistent collection.");
assert.match(runtime, /function unlockMonsterCodex\(monster\)/, "Encounter logic owns monster-codex unlocks.");
assert.match(runtime, /unlockMonsterCodex\(monster\);/, "A live encounter records the creature before combat progression can hide it.");
assert.match(runtime, /monsterCodexCollection\.record\(entry\.monsterId\)/, "An encounter records a dossier entry instead of unlocking a historical-book page.");
assert.match(runtime, /function migrateLegacyMonsterCodexRecords\(\)/, "Legacy monster book pages have an explicit compatibility migration.");
assert.match(runtime, /migrateLegacyMonsterCodexRecords\(\);/, "Continuing an older journey migrates its enemy records into the TVA dossier.");
assert.match(runtime, /function openTvaDossier\(\)/, "The TVA memory station opens its own dossier surface.");
assert.match(runtime, /function renderMonsterCodexPreview\(preview,/, "The dossier renders an animated monster preview.");
assert.match(runtime, /monsterSprites\[preview\.artKey\]/, "Preview uses the shipped runtime sprites rather than a static illustration.");
assert.doesNotMatch(runtime.slice(runtime.indexOf("function renderMonsterCodexPreview"), runtime.indexOf("function openSlide")), /drawArchetypeMonster/, "Codex preview never falls back to a geometric monster drawing.");

console.log("PASS: monster encounters unlock data-owned animated TVA dossier records without placeholder art.");
