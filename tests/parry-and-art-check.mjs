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
assert.match(game, /assets\/monsters\/zone1-colonial-soldier\/colonial-patrol/, "Zone 1 should load its dedicated animated patrol strip.");
assert.match(game, /assets\/monsters\/zone1-night-raider\/night-raider/, "Zone 1 should load its dedicated animated raider strip.");
assert.match(game, /assets\/monsters\/zone1-signalman\/signalman/, "Zone 1 should load its dedicated animated signalman strip.");
assert.match(game, /assets\/monsters\/zone1-enforcer-captain\/enforcer-captain-south-walk\.png/, "Zone 1 should load its dedicated south-facing captain walk strip.");
assert.match(game, /assets\/monsters\/zone1-enforcer-captain\/enforcer-captain-north-walk\.png/, "Zone 1 should load its dedicated north-facing captain walk strip.");
assert.match(game, /assets\/monsters\/zone1-enforcer-captain\/enforcer-captain-east-walk\.png/, "Zone 1 should load its dedicated east-facing captain walk strip.");
assert.match(game, /function loadZone1DirectionalSprites/, "Zone 1 directional strips are loaded through one normalized asset path.");
assert.match(game, /hitStopUntil/, "Combat hits use a short simulation freeze for impact weight.");
assert.match(game, /combatImpacts\.push/, "Combat hits create a rendered impact effect instead of only changing HP.");
assert.match(game, /comboFollowUpAt/, "Captain phase two keeps an explicit two-hit combo state.");
assert.match(game, /assets\/monsters\/zone1-enforcer-captain\/enforcer-captain-south-attack\.png/, "Zone 1 should load its dedicated captain attack strip.");
assert.match(game, /const animationKey = isDying \? "death" : isHurt \? "hurt" : isHeavyAttack \? "heavyAttack" : isAttacking \? "attack"/, "Monster sprite state prioritizes death, hurt, heavy boss attacks, and regular attacks over locomotion.");
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
