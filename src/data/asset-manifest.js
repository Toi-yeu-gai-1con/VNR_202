export const LEVEL_ASSET_GROUPS = Object.freeze({
  hub: "hub",
  village: "zone1",
  archive: "zone2",
  crossroads: "zone3",
  spring: "zone4",
});

export function getAssetGroupForSource(src) {
  // The five relics can converge in the TVA hub before Zone 4 has been
  // visited. Keep their entire shared visual set in core; otherwise the
  // `doi-moi` filename rule below incorrectly defers the gear sprite to the
  // Zone 4 group and the cinematic renders only four relics.
  if (/assets\/story\/relics\//i.test(src)) {
    return "core";
  }

  if (/good-ending|bad-ending|neutral-history-fracture-ending|secret-corruption-ending|lost-compass-ending|fading-fires-ending|missed-moment-ending|divided-border-ending|stalled-machine-ending/i.test(src)) {
    return "ending";
  }

  if (/hub-unexplored|history-hub|time-archive|tva-office|tva-employee|final-history-gate|historyDoor|portal-spinning/i.test(src)) {
    return "hub";
  }

  if (/unforgiving_himalayas|rain-ambient|colonial-harbor|storm-shelter|mutterpixel-ruined-village|french-colonial-soldier/i.test(src)) {
    return "zone1";
  }

  if (/assets\/monsters\/zone2-/i.test(src)) {
    return "zone2";
  }

  if (/assets\/monsters\/zone3-/i.test(src)) {
    return "zone3";
  }

  if (/assets\/monsters\/zone4-/i.test(src)) {
    return "zone4";
  }

  if (/archive-cave|environment\/archive|archive-interior|archive-lens|paper-bundle|fragment-table|compass-pedestal/i.test(src)) {
    return "zone2";
  }

  if (/crossroads-ancient|revolution-square|faction-standard|strategic-hamlet/i.test(src)) {
    return "zone3";
  }

  if (/spring-town|factory-valley|restoration-engine|doi-moi|ration-market|bureaucracy-wall/i.test(src)) {
    return "zone4";
  }

  return "core";
}

export function isCriticalAsset(src, group) {
  if (/\.(mp3|ogg|wav)(?:$|\?)/i.test(src)) {
    return false;
  }

  return group !== "core" || /player|npc|monster|enemy|enemies/i.test(src);
}
