import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const game = await readFile(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");
const mediaSources = await readFile(new URL("../src/data/media-sources.js", import.meta.url), "utf8");

assert.match(mediaSources, /strikeSwing:\s*"combat-strike-swing"/, "Combat media must expose a dedicated player swing SFX.");
assert.match(mediaSources, /playerHurt:\s*"combat-player-hurt"/, "Combat media must expose a dedicated player hurt SFX.");
assert.match(mediaSources, /assets\/audio\/combat\/strike-swing\.ogg/, "Player swing must ship with an OGG source.");
assert.match(mediaSources, /assets\/audio\/combat\/player-hurt\.ogg/, "Player hurt must ship with an OGG source.");

assert.match(game, /strikeSwing:\s*loadSound\(COMBAT_SFX\.strikeSwing/, "The runtime must preload the player swing SFX.");
assert.match(game, /playerHurt:\s*loadSound\(COMBAT_SFX\.playerHurt/, "The runtime must preload the player hurt SFX.");
assert.match(game, /function useStrikeSkill[\s\S]{0,1500}playCombatSfx\("strikeSwing"/, "Every committed player strike must play a swing SFX.");
assert.match(game, /function damagePlayer[\s\S]{0,760}playCombatSfx\("playerHurt"/, "Taking damage must play a player hurt SFX.");

console.log("PASS: combat audio covers player swings and incoming damage.");
