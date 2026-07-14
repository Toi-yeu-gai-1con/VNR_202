import assert from "node:assert/strict";
import { createAudioSystem } from "../src/systems/audio-system.js";

function sound() {
  return {
    paused: true,
    currentTime: 9,
    muted: false,
    volume: 1,
    loop: false,
    playCalls: 0,
    pauseCalls: 0,
    play() {
      this.paused = false;
      this.playCalls += 1;
      return Promise.resolve();
    },
    pause() {
      this.paused = true;
      this.pauseCalls += 1;
    },
  };
}

const hub = sound();
const zone = sound();
const badEnding = sound();
const goodEnding = sound();
const rain = sound();
const click = sound();
const state = { mode: "playing", currentLevelId: "hub", endingId: null, soundMuted: false };
const audio = createAudioSystem({
  state,
  uiSounds: { click },
  ambienceSounds: { rain },
  musicSounds: { hub, portMaze: zone, badEnding, goodEnding },
  getZoneProfile: () => ({ ambience: ["rain"], music: "portMaze" }),
  getCurrentLevel: () => ({ monsters: [] }),
  getPlayer: () => ({ x: 0, y: 0 }),
  eventTarget: new EventTarget(),
});

audio.syncAmbienceAudio();
assert.equal(hub.playCalls, 1, "Hub music plays while exploring the centre.");
assert.equal(zone.playCalls, 0, "Zone music is not mixed into the hub.");

state.currentLevelId = "village";
audio.syncAmbienceAudio();
assert.equal(hub.paused, true, "Leaving the hub pauses its track without rewinding it.");
assert.equal(zone.playCalls, 1, "The current zone music starts through the audio system.");
assert.equal(rain.playCalls, 1, "Zone ambience starts with the zone music.");

audio.setMuted(true);
assert.equal(zone.muted, true, "Muting applies to every active music track.");
assert.equal(click.muted, true, "Muting also applies to UI audio.");

audio.setMuted(false);
zone.currentTime = 37.25;
rain.currentTime = 14.5;
audio.suspend();
assert.equal(zone.paused, true, "Suspending pauses the active music track without resetting it.");
assert.equal(rain.paused, true, "Suspending also pauses active ambience.");
assert.equal(zone.currentTime, 37.25, "Suspending preserves the music playback position.");
assert.equal(rain.currentTime, 14.5, "Suspending preserves the ambience playback position.");

audio.resume();
assert.equal(zone.paused, false, "Resuming restores the active zone music track.");
assert.equal(rain.paused, false, "Resuming restores the active zone ambience.");
assert.equal(zone.currentTime, 37.25, "Resuming does not rewind the music track.");
assert.equal(rain.currentTime, 14.5, "Resuming does not rewind ambience.");

state.mode = "ending";
state.endingId = "good";
audio.syncAmbienceAudio();
goodEnding.currentTime = 28.5;
badEnding.currentTime = 16.25;

state.mode = "playing";
state.currentLevelId = "hub";
audio.syncAmbienceAudio();
assert.equal(hub.paused, false, "Returning to the TVA office restores only its hub music.");
assert.equal(goodEnding.paused, true, "Good ending music cannot remain mixed into the TVA office.");
assert.equal(goodEnding.currentTime, 0, "Good ending music is cleared after leaving the ending scene.");
assert.equal(badEnding.currentTime, 0, "Inactive ending music is also cleared outside ending scenes.");

console.log("PASS: audio state, zone mixing, and mute behavior are isolated in one system.");
