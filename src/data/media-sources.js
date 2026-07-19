function freezeSources(sources) {
  return Object.freeze(sources.map((source) => Object.freeze(source)));
}

function optimizedAudio(id) {
  return freezeSources([
    { src: `assets/audio/optimized/${id}.ogg`, type: 'audio/ogg; codecs="opus"' },
    { src: `assets/audio/optimized/${id}.mp3`, type: "audio/mpeg" },
  ]);
}

function cinematicAudio(id) {
  return freezeSources([
    { src: `assets/audio/cinematics/${id}.ogg`, type: 'audio/ogg; codecs="opus"' },
    { src: `assets/audio/cinematics/${id}.mp3`, type: "audio/mpeg" },
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
  neutralEnding: "neutral-ending",
  zone1LostCompass: "zone1-lost-compass-ending",
  zone2FadingFires: "zone2-fading-fires-ending",
  zone3aMissedMoment: "zone3a-missed-moment-ending",
  zone3bDividedBorder: "zone3b-divided-border-ending",
  zone4StalledMachine: "zone4-stalled-machine-ending",
  secretCorruption: "secret-corruption-ending",
});

export const COMBAT_SFX = Object.freeze({
  strikeSwing: "combat-strike-swing",
  batonHit: "combat-baton-hit",
  rifleShot: "combat-rifle-shot",
  lanternPulse: "combat-lantern-pulse",
  captainCommand: "combat-captain-command",
  captainSlam: "combat-captain-slam",
  hurt: "combat-hurt",
  playerHurt: "combat-player-hurt",
  death: "combat-death",
  parry: "combat-parry",
});

export const RELIC_CONVERGENCE_CUES = Object.freeze({
  good: "relic-convergence-good",
  neutral: "relic-convergence-neutral",
  fractured: "relic-convergence-fractured",
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
  [AUDIO_TRACKS.neutralEnding]: optimizedAudio("neutral-ending"),
  [AUDIO_TRACKS.zone1LostCompass]: optimizedAudio("zone1-lost-compass-ending"),
  [AUDIO_TRACKS.zone2FadingFires]: optimizedAudio("zone2-fading-fires-ending"),
  [AUDIO_TRACKS.zone3aMissedMoment]: optimizedAudio("zone3a-missed-moment-ending"),
  [AUDIO_TRACKS.zone3bDividedBorder]: optimizedAudio("zone3b-divided-border-ending"),
  [AUDIO_TRACKS.zone4StalledMachine]: optimizedAudio("zone4-stalled-machine-ending"),
  [AUDIO_TRACKS.secretCorruption]: optimizedAudio("secret-corruption-ending"),
  [RELIC_CONVERGENCE_CUES.good]: cinematicAudio(RELIC_CONVERGENCE_CUES.good),
  [RELIC_CONVERGENCE_CUES.neutral]: cinematicAudio(RELIC_CONVERGENCE_CUES.neutral),
  [RELIC_CONVERGENCE_CUES.fractured]: cinematicAudio(RELIC_CONVERGENCE_CUES.fractured),
  [COMBAT_SFX.strikeSwing]: freezeSources([
    { src: "assets/audio/combat/strike-swing.ogg", type: 'audio/ogg; codecs="opus"' },
    { src: "assets/audio/combat/strike-swing.mp3", type: "audio/mpeg" },
  ]),
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
  [COMBAT_SFX.playerHurt]: freezeSources([
    { src: "assets/audio/combat/player-hurt.ogg", type: 'audio/ogg; codecs="opus"' },
    { src: "assets/audio/combat/player-hurt.mp3", type: "audio/mpeg" },
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
