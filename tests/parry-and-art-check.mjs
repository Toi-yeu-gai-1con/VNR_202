import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [game, html, sources] = await Promise.all([
  readFile(new URL("../game.js", import.meta.url), "utf8"),
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
assert.match(game, /archetype === "ranged"[\s\S]{0,120}"rifleman"/, "Ranged enemies should use the military soldier art.");
assert.match(game, /drawKenneyRoguelikeSprite\(sprite/, "Breakables should render from proper sprite art.");
assert.match(html, /K phản đòn/, "Player-facing controls should describe parry.");
assert.match(sources, /PixelLab/, "Generated art should be documented.");

console.log("Parry and visual-art checks passed.");
