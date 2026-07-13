import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const entrypoint = readFileSync(new URL("../game.js", import.meta.url), "utf8");
const runtime = readFileSync(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");

assert.match(entrypoint, /import "\.\/src\/runtime\/game-runtime\.js";/, "game.js must be a composition-only entrypoint.");
assert.ok(entrypoint.trim().split(/\r?\n/).length <= 12, "The entrypoint must stay intentionally thin.");
assert.match(runtime, /function bootGame\(/, "The gameplay runtime owns the boot sequence.");
assert.match(runtime, /function frame\(/, "The gameplay runtime owns the update loop.");

console.log("PASS: game.js is a thin composition entrypoint over the runtime modules.");
