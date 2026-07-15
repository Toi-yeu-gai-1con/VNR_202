import assert from "node:assert/strict";
import { getPortalState } from "../src/systems/portal-state.js";

const quietNarrative = { endingRisks: {} };

assert.deepEqual(
  getPortalState({ levelId: "hub", exitId: "tva-dispatch-portal", targetLevelId: null, available: false, narrative: quietNarrative }),
  { status: "standby", icon: "standby", label: "ĐỢI ĐIỀU PHỐI", color: "#78909d", glow: "#5d7886", visible: false },
  "An unassigned TVA portal stays visually dormant instead of pretending to be a destination."
);

assert.deepEqual(
  getPortalState({ levelId: "hub", exitId: "tva-dispatch-portal", targetLevelId: "village", available: true, narrative: quietNarrative }),
  { status: "active", icon: "depart", label: "MỞ VN-1930-A", color: "#9fe3ba", glow: "#e0b75f", visible: true },
  "An authorized TVA route uses an explicit departure state and coordinate label."
);

assert.equal(
  getPortalState({
    levelId: "hub",
    exitId: "tva-dispatch-portal",
    targetLevelId: "archive",
    available: true,
    narrative: { endingRisks: { zone2: 1 } },
  }).status,
  "danger",
  "A risky unresolved chapter warns without naming or leaking its ending."
);

assert.deepEqual(
  getPortalState({ levelId: "village", exitId: "back-to-hub-1", targetLevelId: "hub", available: false, narrative: quietNarrative }),
  { status: "sealed", icon: "lock", label: "CỔNG ĐANG NIÊM", color: "#75818b", glow: "#53616d", visible: true },
  "An incomplete zone keeps a visible sealed anchor without enabling its return transition."
);

assert.deepEqual(
  getPortalState({ levelId: "village", exitId: "back-to-hub-1", targetLevelId: "hub", available: true, narrative: quietNarrative }),
  { status: "complete", icon: "return", label: "LỐI VỀ MỞ", color: "#f3d777", glow: "#b99452", visible: true },
  "A completed zone exposes a distinct return state instead of reusing the departure treatment."
);

assert.equal(
  getPortalState({ levelId: "training", exitId: "training-return-to-hub", targetLevelId: "hub", available: true, narrative: quietNarrative }).status,
  "safe",
  "The training room exit remains explicitly non-campaign and safe."
);

console.log("PASS: portal state presentation is data-driven and does not leak endings.");
