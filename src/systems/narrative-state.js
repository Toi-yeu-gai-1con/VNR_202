const THEME_SCORE_KEYS = Object.freeze([
  "direction",
  "solidarity",
  "timing",
  "unity",
  "renewal",
]);

const ENDING_RISK_KEYS = Object.freeze(["zone1", "zone2", "zone3a", "zone3b", "zone4", "secret"]);

function createNumericRecord(keys) {
  return Object.fromEntries(keys.map((key) => [key, 0]));
}

function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function asFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function restoreNumericRecord(keys, saved) {
  const source = asRecord(saved);
  const restored = createNumericRecord(keys);

  for (const key of keys) {
    restored[key] = asFiniteNumber(source[key]);
  }

  return restored;
}

function restoreChoiceHistory(saved) {
  if (!Array.isArray(saved)) {
    return [];
  }

  return saved
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      chapterId: typeof entry.chapterId === "string" ? entry.chapterId : "global",
      decisionId: typeof entry.decisionId === "string" ? entry.decisionId : "",
      optionId: typeof entry.optionId === "string" ? entry.optionId : "",
    }))
    .filter((entry) => entry.decisionId && entry.optionId);
}

export function createNarrativeState() {
  return {
    choices: {},
    choiceHistory: [],
    branchFlags: {},
    npcRelations: {},
    themeScores: createNumericRecord(THEME_SCORE_KEYS),
    endingRisks: createNumericRecord(ENDING_RISK_KEYS),
    endingsUnlocked: new Set(),
  };
}

export function recordNarrativeChoice(narrative, choice) {
  if (!narrative || !choice?.id) {
    return narrative;
  }

  narrative.choices[choice.id] = choice.chapterId ?? "global";
  if (typeof choice.optionId === "string" && choice.optionId) {
    const chapterId = choice.chapterId ?? "global";
    const prefix = `${chapterId}.`;
    const decisionId = choice.id.startsWith(prefix) ? choice.id.slice(prefix.length) : choice.id;
    narrative.choiceHistory.push({ chapterId, decisionId, optionId: choice.optionId });
  }

  for (const [key, value] of Object.entries(asRecord(choice.branchFlags))) {
    narrative.branchFlags[key] = Boolean(value);
  }

  for (const [key, delta] of Object.entries(asRecord(choice.npcRelations))) {
    narrative.npcRelations[key] = asFiniteNumber(narrative.npcRelations[key]) + asFiniteNumber(delta);
  }

  for (const [key, delta] of Object.entries(asRecord(choice.themeScores))) {
    if (THEME_SCORE_KEYS.includes(key)) {
      narrative.themeScores[key] = asFiniteNumber(narrative.themeScores[key]) + asFiniteNumber(delta);
    }
  }

  for (const [key, delta] of Object.entries(asRecord(choice.endingRisks))) {
    if (ENDING_RISK_KEYS.includes(key)) {
      narrative.endingRisks[key] = Math.max(0, asFiniteNumber(narrative.endingRisks[key]) + asFiniteNumber(delta));
    }
  }

  return narrative;
}

export function unlockNarrativeEnding(narrative, endingId) {
  if (narrative?.endingsUnlocked && endingId) {
    narrative.endingsUnlocked.add(endingId);
  }
  return narrative;
}

export function serializeNarrativeState(narrative) {
  const normalized = restoreNarrativeState(narrative);
  return {
    choices: { ...normalized.choices },
    choiceHistory: normalized.choiceHistory.map((entry) => ({ ...entry })),
    branchFlags: { ...normalized.branchFlags },
    npcRelations: { ...normalized.npcRelations },
    themeScores: { ...normalized.themeScores },
    endingRisks: { ...normalized.endingRisks },
    endingsUnlocked: [...normalized.endingsUnlocked],
  };
}

export function restoreNarrativeState(saved = {}) {
  const source = asRecord(saved);
  const narrative = createNarrativeState();

  narrative.choices = Object.fromEntries(
    Object.entries(asRecord(source.choices)).map(([key, value]) => [key, String(value)])
  );
  narrative.choiceHistory = restoreChoiceHistory(source.choiceHistory);
  narrative.branchFlags = Object.fromEntries(
    Object.entries(asRecord(source.branchFlags)).map(([key, value]) => [key, Boolean(value)])
  );
  narrative.npcRelations = Object.fromEntries(
    Object.entries(asRecord(source.npcRelations)).map(([key, value]) => [key, asFiniteNumber(value)])
  );
  narrative.themeScores = restoreNumericRecord(THEME_SCORE_KEYS, source.themeScores);
  narrative.endingRisks = restoreNumericRecord(ENDING_RISK_KEYS, source.endingRisks);
  const endingEntries = source.endingsUnlocked instanceof Set
    ? [...source.endingsUnlocked]
    : Array.isArray(source.endingsUnlocked)
      ? source.endingsUnlocked
      : [];
  narrative.endingsUnlocked = new Set(endingEntries.filter((entry) => typeof entry === "string"));

  return narrative;
}

export function clearCompletedZoneBadConfirmations(narrative, { inventory = new Set(), quests = {} } = {}) {
  if (!narrative?.branchFlags) {
    return narrative;
  }

  const itemIds = inventory instanceof Set ? inventory : new Set(inventory ?? []);
  const completedZones = [
    ["zone1", itemIds.has("red-compass") || quests.zone1RewardClaimed],
    ["zone2", itemIds.has("unified-emblem") || quests.zone2RewardClaimed],
    ["zone3a", itemIds.has("vietminh-thread") || quests.zone3ThreadClaimed],
    ["zone3b", itemIds.has("healed-map") || quests.zone3MapClaimed],
    ["zone4", itemIds.has("doi-moi-gear") || quests.zone4GearClaimed],
  ];

  for (const [zoneId, completed] of completedZones) {
    if (completed) {
      narrative.branchFlags[`${zoneId}.badConfirmed`] = false;
    }
  }

  return narrative;
}

export const NARRATIVE_THEME_SCORE_KEYS = THEME_SCORE_KEYS;
export const NARRATIVE_ENDING_RISK_KEYS = ENDING_RISK_KEYS;
