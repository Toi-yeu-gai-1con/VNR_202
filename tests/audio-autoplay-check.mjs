import assert from "node:assert/strict";
import { createAudioSystem } from "../src/systems/audio-system.js";

const blocked = { paused: true, muted: false, volume: 1, play: () => Promise.reject(new Error("NotAllowedError")), pause() {} };
let notices = 0;
const audio = createAudioSystem({
  state: { mode: "playing", currentLevelId: "hub", soundMuted: false }, uiSounds: {}, sfxSounds: {}, ambienceSounds: {}, musicSounds: { hub: blocked },
  getZoneProfile: () => null, getCurrentLevel: () => ({ monsters: [] }), getPlayer: () => ({ x: 0, y: 0 }), getSettings: () => ({ musicVolume: 1, sfxVolume: 1, dialogueVolume: 1 }),
  eventTarget: new EventTarget(), onPlaybackBlocked: () => { notices += 1; },
});
audio.syncAmbienceAudio();
await Promise.resolve();
assert.equal(notices, 1, "Autoplay rejection reports a recoverable browser-permission warning.");
console.log("PASS: autoplay blocks are surfaced separately from asset failures.");
