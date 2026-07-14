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
  reducedMotion: true,
  textScale: "large",
  minimapVisible: false,
});

assert.deepEqual(saved, {
  soundMuted: false,
  musicVolume: 0.42,
  sfxVolume: 0.67,
  reducedMotion: true,
  textScale: "large",
  minimapVisible: false,
}, "Supported settings persist with their intended values.");

storage.setItem("settings-test", JSON.stringify({
  version: 1,
  settings: { musicVolume: 4, sfxVolume: -1, reducedMotion: "yes", textScale: "huge", minimapVisible: null },
}));
assert.deepEqual(store.load(), DEFAULT_GAME_SETTINGS, "Malformed settings fall back safely instead of creating inaccessible UI.");

console.log("PASS: persistent game settings normalize browser preferences safely.");
