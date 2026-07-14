import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const runtime = readFileSync(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");
const strike = runtime.slice(
  runtime.indexOf("function useStrikeSkill("),
  runtime.indexOf("function useDodge("),
);

assert.doesNotMatch(strike, /playUiSound\([^)]*attack/, "A normal strike must not layer the legacy attack UI sound over its swing SFX.");
assert.equal((strike.match(/playCombatSfx\("strikeSwing"/g) ?? []).length, 1, "Each committed strike emits exactly one swing cue.");

console.log("PASS: normal attacks emit one swing SFX instead of two overlapping cues.");
