import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const runtime = await readFile(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");
const story = await readFile(new URL("../src/data/story-content.js", import.meta.url), "utf8");

assert.match(story, /"last-issue":\s*\{/, "The authored last-issue decision must have a real in-game dialogue.");
assert.match(runtime, /applyNarrativeChoice\("zone1", "last-issue", choiceId\)/, "The last-issue choice must apply its authored narrative consequences.");
assert.match(runtime, /item\.interactionType = "lastIssueChoice"/, "The Zone 1 reward interaction must route through the last-issue decision before the verdict.");
assert.match(runtime, /interactionType === "lastIssueChoice"/, "Runtime dialogue routing must recognize the last-issue decision.");
assert.match(runtime, /hasCompromiseToRepair = \(state\.narrative\.endingRisks\.zone1[\s\S]*choice\.id !== "return-after-compromise" \|\| hasCompromiseToRepair/s, "The repair option must be offered only when there is a prior Zone 1 compromise to repair.");

console.log("PASS: Zone 1 last-issue choices are connected to the playable pre-verdict flow.");
