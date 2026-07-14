import assert from "node:assert/strict";
import { createSaveSystem } from "../src/systems/save-system.js";

const store = new Map();
const state = {
  mode: "playing",
  currentLevelId: "hub",
  respawnLevelId: "hub",
  respawnSpawn: { x: 4, y: 5, direction: "down" },
  health: 30,
  stamina: 70,
  saDoa: 5,
  inventory: new Set(["relic"]),
  unlockedStoryIds: new Set(["story"]),
  completedZones: new Set(["hub"]),
  difficulty: "normal",
  tutorialSeen: true,
  quests: { tvaBriefingAccepted: true, tvaPortalTarget: "village", tvaReportedRelics: new Set(["red-compass"]), zone1Started: true, zone1Delivered: new Set(["worker-1"]), zone1RewardClaimed: false, zone1SoldierDecision: "refused", zone2Fragments: new Set(), zone2TowerActivated: false, zone2RewardClaimed: false, zone3Recruits: new Set(), zone3ThreadClaimed: false, zone3HamletsFreed: new Set(), zone3BossDefeated: false, zone3MapClaimed: false, zone4Barriers: new Set(), zone4Farmers: new Set(), zone4GearClaimed: false },
};
const levels = { hub: { interactables: [{ id: "item", collected: true }], monsters: [{ id: "monster", health: 3, maxHealth: 5, defeated: false }] } };
const saves = createSaveSystem({
  storage: { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value), removeItem: (key) => store.delete(key) },
  saveKey: "save-key",
  version: 1,
  getState: () => state,
  getLevels: () => levels,
  getPlayer: () => ({ x: 10, y: 12, direction: "right" }),
  cloneSpawnPoint: (spawn) => ({ ...spawn }),
  clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
});

assert.equal(saves.save(), true, "A playing session is persisted.");
const loaded = saves.load();
assert.equal(loaded.version, 1, "The versioned save round-trips.");
assert.deepEqual(loaded.quests.zone1Delivered, ["worker-1"], "Quest Sets serialize as arrays.");
assert.equal(loaded.quests.tvaBriefingAccepted, true, "The office briefing persists with quest progress.");
assert.equal(loaded.quests.tvaPortalTarget, "village", "The active dispatch portal persists.");
assert.deepEqual(loaded.quests.tvaReportedRelics, ["red-compass"], "Reported relics serialize as an array.");
assert.equal(loaded.quests.zone1SoldierDecision, "refused", "Dialogue choices persist with quest progress.");

state.quests.zone1Delivered = new Set();
levels.hub.interactables[0].collected = false;
levels.hub.monsters[0].health = 5;
saves.restoreQuestState(loaded.quests);
saves.restoreRuntimeState(loaded.runtime);
assert.equal(state.quests.tvaBriefingAccepted, true, "The office briefing restores from save data.");
assert.equal(state.quests.tvaPortalTarget, "village", "The active dispatch portal restores from save data.");
assert.equal(state.quests.tvaReportedRelics.has("red-compass"), true, "Reported relics restore from save data.");
assert.equal(state.quests.zone1Delivered.has("worker-1"), true, "Quest Sets restore from save data.");
assert.equal(levels.hub.interactables[0].collected, true, "Interactable state restores from save data.");
assert.equal(levels.hub.monsters[0].health, 3, "Monster health restores from save data.");

saves.clear();
assert.equal(saves.load(), null, "Clearing a save removes it from storage.");

console.log("PASS: versioned saves are isolated and backward-compatible in behavior.");
