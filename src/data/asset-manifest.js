export const LEVEL_ASSET_GROUPS = Object.freeze({
  hub: "hub",
  village: "zone1",
  archive: "zone2",
  crossroads: "zone3",
  spring: "zone4",
});

export function getAssetGroupForSource(src) {
  if (/good-ending|bad-ending/i.test(src)) {
    return "ending";
  }

  if (/hub-unexplored|history-hub|time-archive|final-history-gate|historyDoor|portal-spinning/i.test(src)) {
    return "hub";
  }

  if (/unforgiving_himalayas|rain-ambient|colonial-harbor|storm-shelter|mutterpixel-ruined-village|french-colonial-soldier/i.test(src)) {
    return "zone1";
  }

  if (/archive-cave|environment\/archive|archive-interior|archive-lens|paper-bundle|fragment-table|compass-pedestal/i.test(src)) {
    return "zone2";
  }

  if (/crossroads-ancient|revolution-square|faction-standard|strategic-hamlet|bureaucracy-wall/i.test(src)) {
    return "zone3";
  }

  if (/spring-town|factory-valley|restoration-engine|doi-moi|ration-market/i.test(src)) {
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
