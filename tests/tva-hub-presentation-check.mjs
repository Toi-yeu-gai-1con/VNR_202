import assert from "node:assert/strict";
import { getTvaHubPresentation } from "../src/data/tva-hub-presentation.js";

const empty = getTvaHubPresentation({ inventory: new Set(), corruption: 0 });
assert.equal(empty.relics.length, 0, "The portal has no false relics before the player collects them.");
assert.equal(empty.stability, "unstable", "An empty TVA hub remains visually unstable.");

const firstRelic = getTvaHubPresentation({ inventory: new Set(["red-compass"]), corruption: 12 });
assert.deepEqual(firstRelic.relics.map((relic) => relic.id), ["red-compass"], "Collected relics appear in their authored convergence order.");
assert.equal(firstRelic.relics[0].color, "#f26b5e", "The Red Compass has a distinct warm signal color.");
assert.equal(firstRelic.stability, "stabilizing", "A recovered relic changes the hub state.");

const full = getTvaHubPresentation({
  inventory: new Set(["red-compass", "unified-emblem", "vietminh-thread", "healed-map", "doi-moi-gear", "unknown"]),
  corruption: 74,
});
assert.deepEqual(full.relics.map((relic) => relic.id), ["red-compass", "unified-emblem", "vietminh-thread", "healed-map", "doi-moi-gear"], "Unknown inventory entries never become portal relics.");
assert.equal(full.stability, "corrupted", "High corruption remains legible even with all relics.");
assert.equal(full.portalIntensity, 1, "All five relics fully charge the portal convergence effect.");

const converged = getTvaHubPresentation({
  inventory: new Set(["red-compass", "unified-emblem", "vietminh-thread", "healed-map", "doi-moi-gear"]),
  corruption: 18,
});
assert.equal(converged.stability, "converged", "Five relics with controlled corruption unlock the convergence state.");

const goodEpilogue = getTvaHubPresentation({
  inventory: new Set(["red-compass", "unified-emblem", "vietminh-thread", "healed-map", "doi-moi-gear"]),
  corruption: 18,
  endingId: "good",
});
assert.equal(goodEpilogue.epilogue.kind, "good", "A completed good ending gives TVA a distinct restored epilogue state.");
assert.equal(goodEpilogue.epilogue.davidLine.includes("trở về"), true, "David's post-ending line explains the restored hub without revealing a future route.");

const neutralEpilogue = getTvaHubPresentation({ endingId: "neutral" });
assert.equal(neutralEpilogue.epilogue.kind, "neutral", "Neutral has a separate, reflective TVA epilogue rather than reusing good-ending treatment.");

const badEpilogue = getTvaHubPresentation({ endingId: "zone1-lost-compass" });
assert.equal(badEpilogue.epilogue.kind, "fractured", "A recovered bad-ending branch remains visibly archived at TVA after checkpoint recovery.");

console.log("PASS: TVA hub presentation exposes only collected relics and reflects stabilization/corruption.");
