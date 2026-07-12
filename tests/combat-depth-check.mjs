import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../game.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(game, /const STAMINA_MAX = 100;/, "Expected stamina system.");
assert.match(game, /function useDodge\(/, "Expected dodge action.");
assert.match(game, /function startStrikeCharge\(/, "Expected charged strike input.");
assert.match(game, /comboStep/, "Expected strike combo state.");
assert.match(game, /function updateEnemyProjectiles\(/, "Expected ranged enemy projectiles.");
assert.match(game, /skillReadySoundArmed/, "Expected a ready sound after skill cooldowns.");
assert.match(game, /archetype: "ranged"/, "Expected ranged enemy archetype.");
assert.match(game, /archetype: "support"/, "Expected support enemy archetype.");
assert.match(game, /elite: true/, "Expected elite enemy behavior.");
assert.match(game, /function isMonsterActive\(/, "Expected combat density to scale by zone and difficulty.");
assert.match(game, /function updateWorldDrops\(/, "Expected health or stamina drops.");
assert.match(game, /function updateLevelHazards\(/, "Expected area traps.");
assert.match(game, /function damageBreakable\(/, "Expected breakable environment objects.");
assert.match(game, /bossPhase/, "Expected two-phase bosses.");
assert.match(html, /id="combat-status"/, "Expected visible stamina and cooldown status.");
assert.match(html, /data-difficulty="story"/, "Expected difficulty selector.");

console.log("PASS: combat depth contracts are present.");
