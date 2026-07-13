import assert from "node:assert/strict";
import { GAMEPLAY_BALANCE, getDifficultySettings } from "../src/data/gameplay-balance.js";

assert.equal(GAMEPLAY_BALANCE.player.speed, 92, "Player movement must preserve the established pace.");
assert.equal(GAMEPLAY_BALANCE.player.maxHealth, 36, "Player health must preserve existing saves and HUD values.");
assert.equal(GAMEPLAY_BALANCE.combat.parry.windowMs, 260, "Parry timing must remain unchanged.");
assert.equal(GAMEPLAY_BALANCE.mob.baseSpeed, 38, "Monster pursuit pace must remain unchanged.");
assert.equal(GAMEPLAY_BALANCE.difficulty.spawnBudgetOffset.challenge, 1, "Challenge mode gets one extra enemy budget.");
assert.deepEqual(getDifficultySettings("normal"), {
  enemyHealth: 1,
  enemyDamage: 1,
  enemySpeed: 1,
  dropChance: 0.34,
});
assert.equal(Object.isFrozen(GAMEPLAY_BALANCE), true, "Balance config must not be mutated by runtime state.");

console.log("PASS: gameplay balance is data-owned and preserves the shipped tuning.");
