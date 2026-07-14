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

export const COMBAT_SFX = Object.freeze({
  batonHit: "combat-baton-hit",
  rifleShot: "combat-rifle-shot",
  lanternPulse: "combat-lantern-pulse",
  captainCommand: "combat-captain-command",
  captainSlam: "combat-captain-slam",
  hurt: "combat-hurt",
  death: "combat-death",
  parry: "combat-parry",
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
  [COMBAT_SFX.batonHit]: freezeSources([
    { src: "assets/audio/combat/baton-hit.ogg", type: 'audio/ogg; codecs="opus"' },
    { src: "assets/audio/combat/baton-hit.mp3", type: "audio/mpeg" },
  ]),
  [COMBAT_SFX.rifleShot]: freezeSources([
    { src: "assets/audio/combat/rifle-shot.ogg", type: 'audio/ogg; codecs="opus"' },
    { src: "assets/audio/combat/rifle-shot.mp3", type: "audio/mpeg" },
  ]),
  [COMBAT_SFX.lanternPulse]: freezeSources([
    { src: "assets/audio/combat/lantern-pulse.ogg", type: 'audio/ogg; codecs="opus"' },
    { src: "assets/audio/combat/lantern-pulse.mp3", type: "audio/mpeg" },
  ]),
  [COMBAT_SFX.captainCommand]: freezeSources([
    { src: "assets/audio/combat/captain-command.ogg", type: 'audio/ogg; codecs="opus"' },
    { src: "assets/audio/combat/captain-command.mp3", type: "audio/mpeg" },
  ]),
  [COMBAT_SFX.captainSlam]: freezeSources([
    { src: "assets/audio/combat/captain-slam.ogg", type: 'audio/ogg; codecs="opus"' },
    { src: "assets/audio/combat/captain-slam.mp3", type: "audio/mpeg" },
  ]),
  [COMBAT_SFX.hurt]: freezeSources([
    { src: "assets/audio/combat/hurt.ogg", type: 'audio/ogg; codecs="opus"' },
    { src: "assets/audio/combat/hurt.mp3", type: "audio/mpeg" },
  ]),
  [COMBAT_SFX.death]: freezeSources([
    { src: "assets/audio/combat/death.ogg", type: 'audio/ogg; codecs="opus"' },
    { src: "assets/audio/combat/death.mp3", type: "audio/mpeg" },
  ]),
  [COMBAT_SFX.parry]: freezeSources([
    { src: "assets/audio/combat/parry.ogg", type: 'audio/ogg; codecs="opus"' },
    { src: "assets/audio/combat/parry.mp3", type: "audio/mpeg" },
  ]),
});

export function getAudioSourceCandidates(source) {
  return AUDIO_SOURCE_CANDIDATES[source] ?? freezeSources([{ src: source, type: "audio/mpeg" }]);
}

export function resolveAudioSource(candidates, audio) {
  return candidates.find((candidate) => audio.canPlayType(candidate.type)) ?? candidates.at(-1);
}
