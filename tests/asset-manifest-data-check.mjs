import assert from "node:assert/strict";
import { LEVEL_ASSET_GROUPS, getAssetGroupForSource, isCriticalAsset } from "../src/data/asset-manifest.js";

assert.equal(LEVEL_ASSET_GROUPS.hub, "hub", "The hub has a stable asset group.");
assert.equal(LEVEL_ASSET_GROUPS.village, "zone1", "Zone 1 has a stable asset group.");
assert.equal(getAssetGroupForSource("assets/time-archive/environment/chronicle-office.webp"), "hub", "The Chronicle Office backdrop loads with the hub.");
assert.equal(getAssetGroupForSource("assets/time-archive/characters/agent-m90/down.png"), "hub", "M-90 loads with the hub.");
assert.equal(getAssetGroupForSource("assets/environment/archive-cave.png"), "zone2", "Archive art is grouped with Zone 2.");
assert.equal(getAssetGroupForSource("assets/environment/generated-objects/bureaucracy-wall.png"), "zone4", "Zone 4 bureaucracy barriers are ready before the scene renders.");
assert.equal(getAssetGroupForSource("assets/audio/music/good-ending.mp3"), "ending", "Ending music is grouped with the ending scene.");
assert.equal(getAssetGroupForSource("assets/player/player-sheet.png"), "core", "Player art is available at boot.");
assert.equal(isCriticalAsset("assets/audio/music/archive.mp3", "zone2"), false, "Audio must not block a playable scene.");
assert.equal(isCriticalAsset("assets/environment/archive-cave.png", "zone2"), true, "Zone scenery failures must be recoverable before play.");

console.log("PASS: asset grouping and blocking rules are data-owned.");
