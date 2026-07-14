import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { MONSTER_ART_DEFINITIONS, MONSTER_ART_KEY_BY_ID } from "../src/data/monster-art-definitions.js";

const runtime = await readFile(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");

for (const [monsterId, artKey] of Object.entries(MONSTER_ART_KEY_BY_ID)) {
  assert.ok(MONSTER_ART_DEFINITIONS[artKey], `${monsterId} must resolve to approved dedicated art.`);
}

assert.match(runtime, /MONSTER_ART_KEY_BY_ID\[monster\.id\]/, "Approved art must route by exact monster ID before generic archetypes.");
assert.match(runtime, /!isDedicatedMonsterArtKey\(artKey\)/, "Dedicated monsters must never enter a generic renderer fallback.");

console.log("PASS: approved Zone 2–4 sprite packs are routed and protected from generic fallbacks.");
