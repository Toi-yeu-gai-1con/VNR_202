export const MONSTER_ANIMATION_DEFINITIONS = Object.freeze({
  idle: Object.freeze({ frameWidth: 64, frameHeight: 64, frameCount: 4, frameDuration: 420 }),
  run: Object.freeze({ frameWidth: 64, frameHeight: 64, frameCount: 4, frameDuration: 110 }),
  attack: Object.freeze({ frameWidth: 64, frameHeight: 64, frameCount: 4, frameDuration: 65 }),
  hurt: Object.freeze({ frameWidth: 64, frameHeight: 64, frameCount: 3, frameDuration: 60 }),
  death: Object.freeze({ frameWidth: 64, frameHeight: 64, frameCount: 6, frameDuration: 90 }),
});

function defineMonsterArt(directory, basename, group, { boss = false } = {}) {
  const drawSize = boss ? 60 : 48;
  return Object.freeze({
    directory: `assets/monsters/${directory}`,
    basename,
    group,
    boss,
    directional: true,
    directionalAnimation: true,
    flipForFacing: true,
    drawWidth: drawSize,
    drawHeight: drawSize,
    drawOffsetX: -drawSize / 2,
    drawOffsetY: boss ? -50 : -38,
    shadowWidth: boss ? 32 : 24,
    animations: MONSTER_ANIMATION_DEFINITIONS,
  });
}

export const MONSTER_ART_DEFINITIONS = Object.freeze({
  zone2ArchiveSaboteur: defineMonsterArt("zone2-archive-saboteur", "archive-saboteur", "zone2"),
  zone2CipherMarksman: defineMonsterArt("zone2-cipher-marksman", "cipher-marksman", "zone2"),
  zone2CorruptedArchivist: defineMonsterArt("zone2-corrupted-archivist", "corrupted-archivist", "zone2"),
  zone2ShadowCurator: defineMonsterArt("zone2-shadow-curator", "shadow-curator", "zone2", { boss: true }),
  zone3BridgeRaider: defineMonsterArt("zone3-bridge-raider", "bridge-raider", "zone3"),
  zone3FactionSkirmisher: defineMonsterArt("zone3-faction-skirmisher", "faction-skirmisher", "zone3"),
  zone3WhisperPropagandist: defineMonsterArt("zone3-whisper-propagandist", "whisper-propagandist", "zone3"),
  zone3SouthernTyrant: defineMonsterArt("zone3-southern-tyrant", "southern-tyrant", "zone3", { boss: true }),
  zone4CropSaboteur: defineMonsterArt("zone4-crop-saboteur", "crop-saboteur", "zone4"),
  zone4BureauMarksman: defineMonsterArt("zone4-bureau-marksman", "bureau-marksman", "zone4"),
  zone4RationChanter: defineMonsterArt("zone4-ration-chanter", "ration-chanter", "zone4"),
  zone4BureaucracyBeast: defineMonsterArt("zone4-bureaucracy-beast", "bureaucracy-beast", "zone4", { boss: true }),
});

export const MONSTER_ART_KEY_BY_ID = Object.freeze({
  "archive-raider": "zone2ArchiveSaboteur",
  "archive-marksman": "zone2CipherMarksman",
  "archive-chanter": "zone2CorruptedArchivist",
  "archive-shadow-curator": "zone2ShadowCurator",
  "crossroads-raider": "zone3BridgeRaider",
  "crossroads-marksman": "zone3FactionSkirmisher",
  "crossroads-chanter": "zone3WhisperPropagandist",
  "southern-tyrant": "zone3SouthernTyrant",
  "spring-raider": "zone4CropSaboteur",
  "spring-marksman": "zone4BureauMarksman",
  "spring-chanter": "zone4RationChanter",
  "spring-bureaucracy-beast": "zone4BureaucracyBeast",
});

export function isDedicatedMonsterArtKey(artKey) {
  return Object.hasOwn(MONSTER_ART_DEFINITIONS, artKey);
}

export function getMonsterStripSource(artKey, direction, animationState) {
  const definition = MONSTER_ART_DEFINITIONS[artKey];
  if (!definition) throw new Error(`Unknown monster art key: ${artKey}`);
  const authoredDirection = direction === "west" ? "east" : direction;
  if (!["south", "north", "east"].includes(authoredDirection)) {
    throw new Error(`Unsupported monster direction: ${direction}`);
  }
  const authoredState = animationState === "run" ? "walk" : animationState;
  if (!Object.hasOwn(MONSTER_ANIMATION_DEFINITIONS, animationState)) {
    throw new Error(`Unsupported monster animation: ${animationState}`);
  }
  return `${definition.directory}/${definition.basename}-${authoredDirection}-${authoredState}.png`;
}
