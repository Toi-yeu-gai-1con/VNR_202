import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const game = await readFile(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");
const mediaSources = await readFile(new URL("../src/data/media-sources.js", import.meta.url), "utf8");

assert.match(mediaSources, /strikeSwing:\s*"combat-strike-swing"/, "Combat media must retain the generic player swing SFX.");
assert.match(mediaSources, /playerHurt:\s*"combat-player-hurt"/, "Combat media must expose a dedicated player hurt SFX.");
assert.match(mediaSources, /assets\/audio\/combat\/strike-swing\.ogg/, "Player swing must ship with an OGG source.");
assert.match(mediaSources, /assets\/audio\/combat\/player-hurt\.ogg/, "Player hurt must ship with an OGG source.");

assert.match(game, /attack1:\s*uiSounds\.attack1/, "The runtime must route attack 1 through its authored sword SFX.");
assert.match(game, /attack2:\s*uiSounds\.attack2/, "The runtime must route attack 2 through its authored sword SFX.");
assert.match(game, /strikeSwing:\s*loadSound\(COMBAT_SFX\.strikeSwing/, "The runtime must retain the generic player swing SFX.");
assert.match(game, /attack1:\s*"\[VUNG KIẾM/, "Attack 1 keeps the accessible sword-swing caption.");
assert.match(game, /attack2:\s*"\[VUNG KIẾM/, "Attack 2 keeps the accessible sword-swing caption.");
assert.match(game, /playerHurt:\s*loadSound\(COMBAT_SFX\.playerHurt/, "The runtime must preload the player hurt SFX.");
assert.match(game, /function useStrikeSkill[\s\S]{0,1500}playCombatSfx\(strikeAnimation/, "Every committed player strike must play its animation-specific sword SFX.");
assert.match(game, /function damagePlayer[\s\S]{0,760}playCombatSfx\("playerHurt"/, "Taking damage must play a player hurt SFX.");

console.log("PASS: combat audio covers player swings and incoming damage.");
