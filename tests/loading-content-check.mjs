import assert from "node:assert/strict";
import { getLoadingContent } from "../src/data/loading-content.js";

const zone1 = getLoadingContent("zone1");
assert.match(zone1.tip, /phản đòn/i, "Zone loading content includes an actionable gameplay tip.");
assert.match(zone1.history, /1922/, "Zone 1 loading content uses its verified historical period.");
assert.equal(getLoadingContent("unknown").history, "", "Unknown loading groups do not invent historical claims.");

console.log("PASS: loading content is scoped to known zones and avoids unverified fallback history.");
