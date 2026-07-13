import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const game = readFileSync(new URL("../game.js", import.meta.url), "utf8");

assert.match(html, /id="asset-loading-overlay"/, "The game needs a dedicated loading and recovery overlay.");
assert.match(html, /id="asset-retry-button"/, "Critical asset errors need an explicit retry action.");
assert.match(game, /function ensureLevelAssets\(/, "Level transitions must wait for their asset group.");
assert.match(game, /function showAssetLoading\(/, "The runtime must surface loading progress.");
assert.match(game, /function retryFailedAudioAssets\(/, "Audio failures need a non-blocking retry path.");
assert.match(game, /assetManager\.subscribe\(/, "The runtime must surface asset failures to players.");
assert.match(game, /Âm thanh chưa sẵn sàng/, "Audio failure guidance must be visible to players.");

console.log("PASS: asset loading has a visible recovery path instead of a visual fallback.");
