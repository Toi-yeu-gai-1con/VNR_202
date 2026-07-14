import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const runtime = await readFile(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");
const skillEffectRenderer = runtime.slice(runtime.indexOf("function drawSkillEffect"), runtime.indexOf("function drawAtmosphere"));

assert.match(runtime, /function reflectEnemyProjectile\(projectile\)/);
assert.match(runtime, /projectile\.reflected = true/);
assert.match(runtime, /resolveParry\(projectile\.sourceName, projectile\.sourceMonster, \{ projectile \}\)/);
assert.match(runtime, /damageMonster\(target, projectile\.damage/);
assert.doesNotMatch(skillEffectRenderer, /ctx\.arc/);

console.log("PASS: parried projectiles reflect to their ranged source without a player parry circle VFX.");
