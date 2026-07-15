import assert from "node:assert/strict";
import { ENDING_AUDIO_KEY_BY_ID, getEndingAudioKey } from "../src/data/ending-audio-definitions.js";

const endingIds = [
  "good", "neutral", "bad", "zone1-lost-compass", "zone2-fading-fires",
  "zone3a-missed-moment", "zone3b-divided-border", "zone4-stalled-machine", "secret-corruption",
];

assert.deepEqual(Object.keys(ENDING_AUDIO_KEY_BY_ID).sort(), endingIds.slice().sort(), "Every shipped ending has exactly one music definition.");
assert.equal(getEndingAudioKey("zone1-lost-compass"), "zone1LostCompass", "Zone 1's Bad Ending has its own loop.");
assert.equal(getEndingAudioKey("zone4-stalled-machine"), "zone4StalledMachine", "Zone 4's Bad Ending has its own loop.");
assert.equal(getEndingAudioKey("neutral"), "neutralEnding", "The neutral ending is not silently routed to Good Ending music.");
assert.equal(getEndingAudioKey("missing-ending"), null, "An unknown ending never falls back to an unrelated track.");

console.log("PASS: ending audio routing is explicit and exhaustive.");
