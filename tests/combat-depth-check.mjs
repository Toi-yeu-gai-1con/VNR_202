import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const combatConfig = readFileSync(new URL("../src/data/combat-config.js", import.meta.url), "utf8");

assert.match(game, /GAMEPLAY_BALANCE\.stamina\.max/, "Expected stamina system to use data-owned balance.");
assert.match(game, /function useDodge\(/, "Expected dodge action.");
assert.match(game, /function startStrikeCharge\(/, "Expected charged strike input.");
assert.match(game, /comboStep/, "Expected strike combo state.");
assert.match(game, /function updateEnemyProjectiles\(/, "Expected ranged enemy projectiles.");
assert.match(game, /skillReadySoundArmed/, "Expected a ready sound after skill cooldowns.");
assert.match(combatConfig, /archetype: "ranged"/, "Expected ranged enemy archetype.");
assert.match(combatConfig, /archetype: "support"/, "Expected support enemy archetype.");
assert.match(combatConfig, /elite: true/, "Expected elite enemy behavior.");
assert.match(game, /function isMonsterActive\(/, "Expected combat density to scale by zone and difficulty.");
assert.match(game, /function updateWorldDrops\(/, "Expected health or stamina drops.");
assert.match(game, /function updateLevelHazards\(/, "Expected area traps.");
assert.match(game, /function damageBreakable\(/, "Expected breakable environment objects.");
assert.match(game, /bossPhase/, "Expected two-phase bosses.");
assert.match(html, /id="combat-status"/, "Expected visible stamina and cooldown status.");
assert.match(html, /data-difficulty="story"/, "Expected difficulty selector.");

console.log("PASS: combat depth contracts are present.");
