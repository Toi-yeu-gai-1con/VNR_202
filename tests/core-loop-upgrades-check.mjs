import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../game.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

assert.match(game, /const SAVE_STORAGE_KEY = "crossroads-save-v1";/, "Expected versioned local progress saves.");
assert.match(game, /function saveGameProgress\(/, "Expected a save helper.");
assert.match(game, /function loadSavedProgress\(/, "Expected a continue helper.");
assert.match(game, /function showTutorial\(/, "Expected first-session tutorial flow.");
assert.match(game, /function showZoneSummary\(/, "Expected zone completion summary flow.");
assert.match(game, /cameraShakeUntil/, "Expected combat camera feedback state.");
assert.match(game, /telegraphStartsAt/, "Expected monster attack telegraph state.");
assert.match(game, /isBoss: true/, "Expected explicit boss metadata.");
assert.match(game, /function drawMonsterTelegraph\(/, "Expected visible attack telegraphs.");
assert.match(game, /function drawMiniMapLegend\(/, "Expected categorized minimap markers.");
assert.match(html, /id="tutorial-overlay"/, "Expected tutorial overlay UI.");
assert.match(html, /id="zone-summary-overlay"/, "Expected zone summary overlay UI.");
assert.match(html, /id="continue-button"/, "Expected continue button UI.");

console.log("PASS: core loop upgrade contracts are present.");
