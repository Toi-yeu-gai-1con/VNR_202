import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [game, html, sources] = await Promise.all([
  readFile(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8"),
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../ASSET_SOURCES.md", import.meta.url), "utf8"),
]);

assert.match(game, /function useParrySkill\(/, "K should activate a dedicated parry skill.");
assert.match(game, /function resolveParry\(/, "Incoming attacks should resolve through the parry window.");
assert.match(game, /PARRY_WINDOW_MS/, "Parry timing must be explicit and testable.");
assert.match(game, /useParrySkill\(\)/, "Keyboard input should invoke the parry skill.");
assert.doesNotMatch(game, /function usePurifySkill\(/, "The former purify skill should no longer be active.");
assert.match(game, /assets\/monsters\/pixellab\/shadow-raider-south\.png/, "PixelLab melee art should be loaded.");
assert.match(game, /assets\/monsters\/pixellab\/corrupted-chanter-south\.png/, "PixelLab support art should be loaded.");
assert.match(game, /assets\/monsters\/pixellab\/corrupted-warden-south\.png/, "PixelLab boss art should be loaded.");
assert.match(game, /assets\/monsters\/military-soldier\/soldier-walk-down\.png/, "The rifleman should load a free four-direction walk sheet.");
assert.match(game, /assets\/monsters\/zone1-colonial-soldier\/colonial-patrol-walk\.png/, "Zone 1 should load its dedicated animated patrol strip.");
assert.match(game, /assets\/monsters\/zone1-night-raider\/night-raider-walk\.png/, "Zone 1 should load its dedicated animated raider strip.");
assert.match(game, /assets\/monsters\/zone1-signalman\/signalman-walk\.png/, "Zone 1 should load its dedicated animated signalman strip.");
assert.match(game, /assets\/monsters\/zone1-enforcer-captain\/enforcer-captain-walk\.png/, "Zone 1 should load its dedicated animated captain strip.");
assert.match(game, /assets\/monsters\/zone1-colonial-soldier\/colonial-patrol-attack\.png/, "Zone 1 should load its dedicated rifleman attack strip.");
assert.match(game, /assets\/monsters\/zone1-night-raider\/night-raider-attack\.png/, "Zone 1 should load its dedicated raider attack strip.");
assert.match(game, /assets\/monsters\/zone1-signalman\/signalman-attack\.png/, "Zone 1 should load its dedicated signalman attack strip.");
assert.match(game, /assets\/monsters\/zone1-enforcer-captain\/enforcer-captain-attack\.png/, "Zone 1 should load its dedicated captain attack strip.");
assert.match(game, /const animationKey = isAttacking \? "attack" : monster\.animationState === "run" \? "run" : "idle"/, "Attacking monsters should use their attack sequence instead of walk frames.");
assert.match(game, /monster\.facingDirection = getDirectionFromVector\(moveX, moveY\)/, "Moving enemies should retain a movement-facing direction.");
assert.match(game, /const flipX = Boolean\(config\.flipForFacing && direction === "west"\)/, "Zone 1 sprites should mirror when facing west.");
assert.match(game, /state\.currentLevelId === "village" && monster\.archetype === "ranged"[\s\S]{0,100}"zone1Rifleman"/, "The Zone 1 marksman should select the period-appropriate patrol art.");
assert.match(game, /state\.currentLevelId === "village" && monster\.isBoss[\s\S]{0,100}"zone1Captain"/, "The Zone 1 boss should select the dedicated captain art.");
assert.match(game, /state\.currentLevelId === "village" && monster\.archetype === "melee"[\s\S]{0,100}"zone1Raider"/, "The Zone 1 raider should select its dedicated art.");
assert.match(game, /state\.currentLevelId === "village" && monster\.archetype === "support"[\s\S]{0,100}"zone1Signalman"/, "The Zone 1 support enemy should select its dedicated art.");
assert.match(game, /archetype === "ranged"[\s\S]{0,120}"rifleman"/, "Ranged enemies should use the military soldier art.");
assert.match(game, /drawKenneyRoguelikeSprite\(sprite/, "Breakables should render from proper sprite art.");
assert.match(html, /K phản đòn/, "Player-facing controls should describe parry.");
assert.match(sources, /PixelLab/, "Generated art should be documented.");

console.log("Parry and visual-art checks passed.");
