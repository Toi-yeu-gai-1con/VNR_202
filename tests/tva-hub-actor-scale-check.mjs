import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as renderConfig from "../src/data/render-config.js";

assert.equal(typeof renderConfig.getTvaActorScale, "function", "TVA actor scale is a shared, testable render rule.");
assert.equal(renderConfig.getTvaActorScale?.(1366), 1.85, "Desktop TVA actors share the authored scale.");
assert.equal(renderConfig.getTvaActorScale?.(800), 1.5, "Compact TVA actors share the compact scale.");

const runtime = readFileSync(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");
assert.match(runtime, /getTvaActorScale\(window\.innerWidth\)[\s\S]{0,180}npc\.hubReturnee/, "Earned TVA returnees receive the same dynamic scale as David and the player.");

console.log("PASS: TVA returnees share the responsive actor scale used by the hub cast.");
