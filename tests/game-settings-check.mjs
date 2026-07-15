import assert from "node:assert/strict";
import { createGameSettingsStore, DEFAULT_GAME_SETTINGS } from "../src/systems/game-settings.js";

function createMemoryStorage() {
  const entries = new Map();
  return {
    getItem(key) {
      return entries.get(key) ?? null;
    },
    setItem(key, value) {
      entries.set(key, value);
    },
  };
}

const storage = createMemoryStorage();
const store = createGameSettingsStore({ storage, storageKey: "settings-test" });

assert.deepEqual(store.load(), DEFAULT_GAME_SETTINGS, "A new browser profile receives readable default settings.");

const saved = store.save({
  soundMuted: false,
  musicVolume: 0.42,
  sfxVolume: 0.67,
  dialogueVolume: 0.58,
  reducedMotion: true,
  textScale: "large",
  minimapVisible: false,
});

assert.deepEqual(saved, {
  soundMuted: false,
  musicVolume: 0.42,
  sfxVolume: 0.67,
  dialogueVolume: 0.58,
  reducedMotion: true,
  textScale: "large",
  minimapVisible: false,
}, "Supported settings persist with their intended values.");

storage.setItem("settings-test", JSON.stringify({
  version: 1,
  settings: { musicVolume: 4, sfxVolume: -1, reducedMotion: "yes", textScale: "huge", minimapVisible: null },
}));
assert.deepEqual(store.load(), DEFAULT_GAME_SETTINGS, "Malformed settings fall back safely instead of creating inaccessible UI.");

storage.setItem("settings-test", JSON.stringify({
  version: 1,
  settings: { soundMuted: false, musicVolume: 0.42, sfxVolume: 0.67, reducedMotion: false, textScale: "normal", minimapVisible: true },
}));
assert.equal(store.load().dialogueVolume, 1, "Existing settings preserve their music and effects choices while safely gaining a dialogue-volume default.");

console.log("PASS: persistent game settings normalize browser preferences safely.");
