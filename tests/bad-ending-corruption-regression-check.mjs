import assert from "node:assert/strict";
import { BAD_ENDING_RECOVERY } from "../src/data/story-content.js";

assert.equal(BAD_ENDING_RECOVERY.corruptionAfterReset, 0, "TVA recovery clears corruption completely after a bad ending.");

console.log("PASS: bad-ending recovery resets corruption to zero.");
