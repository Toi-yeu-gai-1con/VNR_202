export const DEFAULT_GAME_SETTINGS = Object.freeze({
  soundMuted: false,
  musicVolume: 1,
  sfxVolume: 1,
  dialogueVolume: 1,
  soundCaptions: true,
  reducedMotion: false,
  textScale: "normal",
  minimapVisible: true,
  keyBindings: Object.freeze({ moveUp: "w", moveDown: "s", moveLeft: "a", moveRight: "d", interact: "e", attack: "j", parry: "k", dodge: "l", minimap: "m", pause: "escape", book: "b" }),
});

const GAME_SETTINGS_VERSION = 2;
const LEGACY_GAME_SETTINGS_VERSION = 1;
const TEXT_SCALES = new Set(["normal", "large"]);
const BINDING_ACTIONS = Object.freeze(Object.keys(DEFAULT_GAME_SETTINGS.keyBindings));

function isVolume(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function normalizeSettings(settings) {
  if (
    !settings ||
    typeof settings !== "object" ||
    typeof settings.soundMuted !== "boolean" ||
    !isVolume(settings.musicVolume) ||
    !isVolume(settings.sfxVolume) ||
    typeof settings.reducedMotion !== "boolean" ||
    !TEXT_SCALES.has(settings.textScale) ||
    typeof settings.minimapVisible !== "boolean"
  ) {
    return { ...DEFAULT_GAME_SETTINGS };
  }

  return {
    soundMuted: settings.soundMuted,
    musicVolume: settings.musicVolume,
    sfxVolume: settings.sfxVolume,
    dialogueVolume: isVolume(settings.dialogueVolume) ? settings.dialogueVolume : DEFAULT_GAME_SETTINGS.dialogueVolume,
    soundCaptions: typeof settings.soundCaptions === "boolean" ? settings.soundCaptions : DEFAULT_GAME_SETTINGS.soundCaptions,
    reducedMotion: settings.reducedMotion,
    textScale: settings.textScale,
    minimapVisible: settings.minimapVisible,
    keyBindings: normalizeKeyBindings(settings.keyBindings),
  };
}

function normalizeKeyBindings(bindings) {
  const normalized = { ...DEFAULT_GAME_SETTINGS.keyBindings };
  if (!bindings || typeof bindings !== "object") {
    return normalized;
  }
  const used = new Set();
  for (const action of BINDING_ACTIONS) {
    const key = typeof bindings[action] === "string" ? bindings[action].toLowerCase() : null;
    if (key && key.length <= 16 && !used.has(key)) {
      normalized[action] = key;
      used.add(key);
    }
  }
  return normalized;
}

export function createGameSettingsStore({ storage, storageKey }) {
  function load() {
    try {
      const saved = JSON.parse(storage.getItem(storageKey) ?? "null");
      if (saved?.version !== GAME_SETTINGS_VERSION && saved?.version !== LEGACY_GAME_SETTINGS_VERSION) {
        return { ...DEFAULT_GAME_SETTINGS };
      }
      return normalizeSettings(saved.settings);
    } catch {
      return { ...DEFAULT_GAME_SETTINGS };
    }
  }

  function save(settings) {
    const normalized = normalizeSettings(settings);
    try {
      storage.setItem(storageKey, JSON.stringify({
        version: GAME_SETTINGS_VERSION,
        settings: normalized,
      }));
    } catch {
      // Preferences are non-critical: keep the active normalized values even when storage is unavailable.
    }
    return normalized;
  }

  return { load, save };
}
