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
const rain = sound();
const click = sound();
const state = { mode: "playing", currentLevelId: "hub", endingId: null, soundMuted: false };
const audio = createAudioSystem({
  state,
  uiSounds: { click },
  ambienceSounds: { rain },
  musicSounds: { hub, portMaze: zone },
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

console.log("PASS: audio state, zone mixing, and mute behavior are isolated in one system.");
