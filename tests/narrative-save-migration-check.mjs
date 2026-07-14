import assert from "node:assert/strict";
import { createSaveSystem } from "../src/systems/save-system.js";
import { createNarrativeState } from "../src/systems/narrative-state.js";

const storage = new Map();
const state = {
  mode: "playing",
  currentLevelId: "hub",
  respawnLevelId: "hub",
  respawnSpawn: { x: 4, y: 5, direction: "down" },
  health: 30,
  stamina: 70,
  saDoa: 5,
  inventory: new Set(["red-compass"]),
  unlockedStoryIds: new Set(),
  completedZones: new Set(),
  difficulty: "normal",
  tutorialSeen: true,
  narrative: createNarrativeState(),
  quests: { tvaBriefingAccepted: true, tvaPortalTarget: null, tvaReportedRelics: new Set(), zone1Started: false, zone1Delivered: new Set(), zone1RewardClaimed: false, zone1SoldierDecision: null, zone2Fragments: new Set(), zone2TowerActivated: false, zone2RewardClaimed: false, zone3Recruits: new Set(), zone3ThreadClaimed: false, zone3HamletsFreed: new Set(), zone3BossDefeated: false, zone3MapClaimed: false, zone4Barriers: new Set(), zone4Farmers: new Set(), zone4GearClaimed: false },
};
const levels = { hub: { interactables: [], monsters: [] } };
const saveSystem = createSaveSystem({
  storage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) },
  saveKey: "save-key",
  version: 2,
  getState: () => state,
  getLevels: () => levels,
  getPlayer: () => ({ x: 10, y: 12, direction: "right" }),
  cloneSpawnPoint: (spawn) => ({ ...spawn }),
  clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
});

storage.set("save-key", JSON.stringify({ version: 1, currentLevelId: "hub", player: { x: 10, y: 12, direction: "right" }, quests: {} }));
const migrated = saveSystem.load();
assert.equal(migrated.version, 2, "Version 1 saves migrate to the current version instead of being discarded.");
assert.deepEqual(migrated.narrative.endingsUnlocked, [], "A migrated save starts with an empty ending collection.");

state.narrative.endingsUnlocked.add("zone1-lost-compass");
assert.equal(saveSystem.save(), true, "Version 2 saves persist narrative state.");
const roundTrip = saveSystem.load();
assert.deepEqual(roundTrip.narrative.endingsUnlocked, ["zone1-lost-compass"], "Narrative ending collection round-trips through save data.");

console.log("PASS: versioned saves migrate legacy progress and persist narrative state.");
