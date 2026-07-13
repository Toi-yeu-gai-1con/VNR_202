export const SCENES = Object.freeze({
  START: "start",
  OPENING: "opening",
  LOADING: "loading",
  PLAYING: "playing",
  PAUSED: "paused",
  DIALOGUE: "dialogue",
  MODAL: "modal",
  TUTORIAL: "tutorial",
  SUMMARY: "summary",
  ENDING: "ending",
});

const TRANSITIONS = Object.freeze({
  [SCENES.START]: new Set([SCENES.OPENING, SCENES.PLAYING, SCENES.ENDING]),
  [SCENES.OPENING]: new Set([SCENES.LOADING, SCENES.PLAYING, SCENES.START]),
  [SCENES.LOADING]: new Set([SCENES.PLAYING, SCENES.START, SCENES.OPENING]),
  [SCENES.PLAYING]: new Set([
    SCENES.LOADING,
    SCENES.PAUSED,
    SCENES.DIALOGUE,
    SCENES.MODAL,
    SCENES.TUTORIAL,
    SCENES.SUMMARY,
    SCENES.ENDING,
    SCENES.START,
  ]),
  [SCENES.PAUSED]: new Set([SCENES.PLAYING, SCENES.MODAL, SCENES.START]),
  [SCENES.DIALOGUE]: new Set([SCENES.PLAYING]),
  [SCENES.MODAL]: new Set([SCENES.PLAYING, SCENES.PAUSED, SCENES.ENDING]),
  [SCENES.TUTORIAL]: new Set([SCENES.PLAYING]),
  [SCENES.SUMMARY]: new Set([SCENES.PLAYING]),
  [SCENES.ENDING]: new Set([SCENES.START]),
});

export function createSceneController(initialScene = SCENES.START) {
  let current = initialScene;
  const listeners = new Set();

  return {
    get current() {
      return current;
    },
    canTransition(nextScene) {
      return TRANSITIONS[current]?.has(nextScene) ?? false;
    },
    transition(nextScene, payload = null) {
      if (!this.canTransition(nextScene)) {
        return false;
      }

      const previous = current;
      current = nextScene;
      for (const listener of listeners) {
        listener({ previous, current, payload });
      }
      return true;
    },
    isSimulationRunning() {
      return current === SCENES.PLAYING;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
