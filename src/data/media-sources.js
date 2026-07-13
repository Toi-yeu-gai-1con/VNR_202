function freezeSources(sources) {
  return Object.freeze(sources.map((source) => Object.freeze(source)));
}

function optimizedAudio(id) {
  return freezeSources([
    { src: `assets/audio/optimized/${id}.ogg`, type: 'audio/ogg; codecs="opus"' },
    { src: `assets/audio/optimized/${id}.mp3`, type: "audio/mpeg" },
  ]);
}

export const AUDIO_TRACKS = Object.freeze({
  fireplace: "fireplace",
  rain: "rain",
  hub: "hub",
  portMaze: "port-maze",
  archive: "archive",
  crossroads: "crossroads",
  spring: "spring",
  badEnding: "bad-ending",
  goodEnding: "good-ending",
});

export const AUDIO_SOURCE_CANDIDATES = Object.freeze({
  [AUDIO_TRACKS.fireplace]: optimizedAudio("fireplace-ambient"),
  [AUDIO_TRACKS.rain]: optimizedAudio("rain-ambient"),
  [AUDIO_TRACKS.hub]: optimizedAudio("hub-unexplored-expansion"),
  [AUDIO_TRACKS.portMaze]: optimizedAudio("unforgiving_himalayas_looping"),
  [AUDIO_TRACKS.archive]: optimizedAudio("archive-cave-theme"),
  [AUDIO_TRACKS.crossroads]: optimizedAudio("crossroads-ancient-power"),
  [AUDIO_TRACKS.spring]: optimizedAudio("spring-town-theme"),
  [AUDIO_TRACKS.badEnding]: optimizedAudio("bad-ending"),
  [AUDIO_TRACKS.goodEnding]: optimizedAudio("good-ending"),
});

export function getAudioSourceCandidates(source) {
  return AUDIO_SOURCE_CANDIDATES[source] ?? freezeSources([{ src: source, type: "audio/mpeg" }]);
}

export function resolveAudioSource(candidates, audio) {
  return candidates.find((candidate) => audio.canPlayType(candidate.type)) ?? candidates.at(-1);
}
