import { restoreNarrativeState, serializeNarrativeState } from "./narrative-state.js";
import { createRunStats } from "./run-summary.js";

export function createSaveSystem({
  storage,
  saveKey,
  version,
  getState,
  getLevels,
  getPlayer,
  cloneSpawnPoint,
  clamp,
}) {
  function serializeQuestState() {
    const quests = getState().quests;
    return {
      tvaBriefingAccepted: quests.tvaBriefingAccepted,
      tvaPortalTarget: quests.tvaPortalTarget,
      tvaTrackedChapterId: quests.tvaTrackedChapterId ?? null,
      tvaReportedRelics: [...quests.tvaReportedRelics],
      zone1Started: quests.zone1Started,
      zone1Delivered: [...quests.zone1Delivered],
      zone1RewardClaimed: quests.zone1RewardClaimed,
      zone1SoldierDecision: quests.zone1SoldierDecision,
      zone2Fragments: [...quests.zone2Fragments],
      zone2TowerActivated: quests.zone2TowerActivated,
      zone2RewardClaimed: quests.zone2RewardClaimed,
      zone3Recruits: [...quests.zone3Recruits],
      zone3ThreadClaimed: quests.zone3ThreadClaimed,
      zone3HamletsFreed: [...quests.zone3HamletsFreed],
      zone3BossDefeated: quests.zone3BossDefeated,
      zone3MapClaimed: quests.zone3MapClaimed,
      zone4Barriers: [...quests.zone4Barriers],
      zone4Farmers: [...quests.zone4Farmers],
      zone4GearClaimed: quests.zone4GearClaimed,
    };
  }

  function restoreQuestState(savedQuests = {}) {
    getState().quests = {
      tvaBriefingAccepted: Boolean(savedQuests.tvaBriefingAccepted),
      tvaPortalTarget: savedQuests.tvaPortalTarget ?? null,
      tvaTrackedChapterId: typeof savedQuests.tvaTrackedChapterId === "string"
        ? savedQuests.tvaTrackedChapterId
        : null,
      tvaReportedRelics: new Set(savedQuests.tvaReportedRelics ?? []),
      zone1Started: Boolean(savedQuests.zone1Started),
      zone1Delivered: new Set(savedQuests.zone1Delivered ?? []),
      zone1RewardClaimed: Boolean(savedQuests.zone1RewardClaimed),
      zone1SoldierDecision: savedQuests.zone1SoldierDecision ?? null,
      zone2Fragments: new Set(savedQuests.zone2Fragments ?? []),
      zone2TowerActivated: Boolean(savedQuests.zone2TowerActivated),
      zone2RewardClaimed: Boolean(savedQuests.zone2RewardClaimed),
      zone3Recruits: new Set(savedQuests.zone3Recruits ?? []),
      zone3ThreadClaimed: Boolean(savedQuests.zone3ThreadClaimed),
      zone3HamletsFreed: new Set(savedQuests.zone3HamletsFreed ?? []),
      zone3BossDefeated: Boolean(savedQuests.zone3BossDefeated),
      zone3MapClaimed: Boolean(savedQuests.zone3MapClaimed),
      zone4Barriers: new Set(savedQuests.zone4Barriers ?? []),
      zone4Farmers: new Set(savedQuests.zone4Farmers ?? []),
      zone4GearClaimed: Boolean(savedQuests.zone4GearClaimed),
    };
  }

  function getRuntimeState() {
    return Object.fromEntries(
      Object.entries(getLevels()).map(([levelId, level]) => [levelId, {
        interactables: Object.fromEntries((level.interactables ?? []).map((item) => [item.id, {
          collected: Boolean(item.collected), used: Boolean(item.used), purified: Boolean(item.purified), activated: Boolean(item.activated),
        }])),
        monsters: Object.fromEntries((level.monsters ?? []).map((monster) => [monster.id, {
          health: monster.health, defeated: Boolean(monster.defeated),
        }])),
      }])
    );
  }

  function restoreRuntimeState(runtime = {}) {
    for (const [levelId, level] of Object.entries(getLevels())) {
      const savedLevel = runtime[levelId] ?? {};
      for (const item of level.interactables ?? []) {
        const savedItem = savedLevel.interactables?.[item.id];
        if (savedItem) {
          item.collected = Boolean(savedItem.collected);
          item.used = Boolean(savedItem.used);
          item.purified = Boolean(savedItem.purified);
          item.activated = Boolean(savedItem.activated);
        }
      }

      for (const monster of level.monsters ?? []) {
        const savedMonster = savedLevel.monsters?.[monster.id];
        if (savedMonster) {
          monster.health = clamp(Number(savedMonster.health) || 0, 0, monster.runtimeMaxHealth ?? monster.maxHealth);
          monster.defeated = Boolean(savedMonster.defeated);
        }
      }
    }
  }

  function save() {
    const state = getState();
    if (state.mode !== "playing") {
      return false;
    }

    try {
      const player = getPlayer();
      storage.setItem(saveKey, JSON.stringify({
        version,
        currentLevelId: state.currentLevelId,
        player: { x: player.x, y: player.y, direction: player.direction },
        respawnLevelId: state.respawnLevelId,
        respawnSpawn: cloneSpawnPoint(state.respawnSpawn),
        health: state.health,
        stamina: state.stamina,
        saDoa: state.saDoa,
        inventory: [...state.inventory],
        unlockedStoryIds: [...state.unlockedStoryIds],
        completedZones: [...state.completedZones],
        difficulty: state.difficulty,
        tutorialSeen: state.tutorialSeen,
        hubEpilogueEndingId: typeof state.hubEpilogueEndingId === "string" ? state.hubEpilogueEndingId : null,
        runStats: createRunStats(state.runStats),
        quests: serializeQuestState(),
        narrative: serializeNarrativeState(state.narrative),
        runtime: getRuntimeState(),
      }));
      return true;
    } catch {
      return false;
    }
  }

  function load() {
    try {
      const saved = JSON.parse(storage.getItem(saveKey) ?? "null");
      if (!saved || !getLevels()[saved.currentLevelId]) {
        return null;
      }

      const savedVersion = Number(saved.version) || 1;
      if (savedVersion > version) {
        return null;
      }

      return {
        ...saved,
        version,
        narrative: serializeNarrativeState(saved.narrative),
        runStats: createRunStats(saved.runStats),
      };
    } catch {
      return null;
    }
  }

  function restoreNarrativeSaveState(savedNarrative = {}) {
    getState().narrative = restoreNarrativeState(savedNarrative);
  }

  function clear() {
    try {
      storage.removeItem(saveKey);
      return true;
    } catch {
      return false;
    }
  }

  return {
    serializeQuestState,
    restoreQuestState,
    getRuntimeState,
    restoreRuntimeState,
    restoreNarrativeSaveState,
    save,
    load,
    clear,
  };
}
