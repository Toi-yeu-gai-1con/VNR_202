import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createLevelDefinitions } from "../src/systems/level-definitions.js";

const state = {
  quests: {
    tvaPortalTarget: null,
    zone1RewardClaimed: false,
    zone2RewardClaimed: false,
    zone3ThreadClaimed: false,
    zone3MapClaimed: false,
    zone4GearClaimed: false,
  },
};
const levels = createLevelDefinitions({
  world: { width: 960, height: 640 },
  viewport: { width: 640, height: 480 },
  portMazeDoor: { x: 122, y: 154, width: 48, height: 48, portalX: 146, portalY: 178, spawnX: 178, spawnY: 238 },
  getState: () => state,
});

const cases = [
  ["village", () => { state.quests.zone1RewardClaimed = true; }],
  ["archive", () => { state.quests.zone2RewardClaimed = true; }],
  ["crossroads", () => {
    state.quests.zone3ThreadClaimed = true;
    state.quests.zone3MapClaimed = true;
  }],
  ["spring", () => { state.quests.zone4GearClaimed = true; }],
];

for (const [levelId, complete] of cases) {
  const exit = levels[levelId].exits[0];
  assert.equal(exit.availableWhen?.(), false, `${levelId} return portal stays locked before its mission is complete.`);
  complete();
  assert.equal(exit.availableWhen?.(), true, `${levelId} return portal opens after its mission is complete.`);
}

const runtime = readFileSync(new URL("../src/runtime/game-runtime.js", import.meta.url), "utf8");
assert.match(
  runtime,
  /function isExitAvailable\(exit\)[\s\S]{0,240}availableWhen/,
  "Exit collision and transitions must honor the same completion predicate as the portal art.",
);
assert.match(
  runtime,
  /function handleLevelTransitions\(\)[\s\S]{0,260}isExitAvailable\(exit\)/,
  "The transition loop cannot bypass the locked-exit predicate.",
);
assert.match(
  runtime,
  /function getExitPortalState\(exit\)[\s\S]{0,220}isExitAvailable\(exit\)/,
  "Portal presentation must receive the same completion predicate as collision and transitions.",
);
assert.match(
  runtime,
  /function drawLevelExitPortal\(exit\)[\s\S]{0,1000}portalState\.status === "sealed"/,
  "A locked return anchor must be rendered as sealed rather than as an active exit.",
);
assert.match(
  runtime,
  /function drawLevelExitPortal\(exit\)[\s\S]{0,1600}drawSealedPortalLock/,
  "A sealed anchor must carry a visible lock treatment in addition to its label.",
);

console.log("PASS: every zone return portal stays sealed until its mission is complete.");
