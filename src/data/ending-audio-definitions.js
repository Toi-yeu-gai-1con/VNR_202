export const ENDING_AUDIO_KEY_BY_ID = Object.freeze({
  good: "goodEnding",
  neutral: "neutralEnding",
  bad: "badEnding",
  "zone1-lost-compass": "zone1LostCompass",
  "zone2-fading-fires": "zone2FadingFires",
  "zone3a-missed-moment": "zone3aMissedMoment",
  "zone3b-divided-border": "zone3bDividedBorder",
  "zone4-stalled-machine": "zone4StalledMachine",
  "secret-corruption": "secretCorruption",
});

export const ENDING_AUDIO_KEYS = Object.freeze([...new Set(Object.values(ENDING_AUDIO_KEY_BY_ID))]);

export function getEndingAudioKey(endingId) {
  return ENDING_AUDIO_KEY_BY_ID[endingId] ?? null;
}
