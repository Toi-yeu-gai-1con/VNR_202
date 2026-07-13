import assert from "node:assert/strict";
import { AUDIO_TRACKS, getAudioSourceCandidates, resolveAudioSource } from "../src/data/media-sources.js";

const candidates = getAudioSourceCandidates(AUDIO_TRACKS.fireplace);
assert.equal(candidates.length, 2, "Optimized music must retain a browser fallback.");
assert.match(candidates[0].src, /\.ogg$/, "Opus must be preferred when the browser supports it.");
assert.match(candidates[1].src, /\.mp3$/, "MP3 must remain the compatibility fallback.");
assert.equal(resolveAudioSource(candidates, { canPlayType: (type) => type.includes("opus") ? "probably" : "" }).src, candidates[0].src);
assert.equal(resolveAudioSource(candidates, { canPlayType: () => "" }).src, candidates[1].src);
assert.deepEqual(getAudioSourceCandidates("assets/audio/ui-pixel-click.mp3"), [{ src: "assets/audio/ui-pixel-click.mp3", type: "audio/mpeg" }]);

console.log("PASS: optimized audio prefers Opus and retains MP3 compatibility.");
