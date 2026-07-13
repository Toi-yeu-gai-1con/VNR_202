import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");

assert.match(game, /createSceneController\(state\.mode\)/, "The live runtime must create a scene controller from initial state.");
assert.match(game, /Object\.defineProperty\(state, "mode"/, "Legacy mode callers must be bridged through the controller during migration.");
assert.match(game, /sceneController\.transition\(nextScene\)/, "Scene changes must use validated transitions.");

console.log("PASS: the legacy runtime mode field is governed by the scene controller.");
