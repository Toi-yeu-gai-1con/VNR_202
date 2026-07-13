import assert from "node:assert/strict";
import { createAssetManager } from "../src/core/asset-manager.js";

const attempts = new Map();
const manager = createAssetManager(
  {
    core: [
      { key: "player", type: "image", src: "player.png", critical: true },
      { key: "click", type: "audio", src: "click.mp3", critical: false },
    ],
    zone1: [{ key: "beacon", type: "image", src: "beacon.png", critical: true }],
  },
  {
    loadImage: async (entry) => {
      attempts.set(entry.key, (attempts.get(entry.key) ?? 0) + 1);
      if (entry.key === "beacon" && attempts.get(entry.key) === 1) {
        throw new Error("missing beacon");
      }
      return { kind: "image", key: entry.key };
    },
    loadAudio: async (entry) => ({ kind: "audio", key: entry.key }),
  }
);

const core = await manager.loadGroup("core");
assert.equal(core.ready, true, "Core assets become ready when all critical entries load.");
assert.equal(manager.getImage("player").key, "player", "Loaded images are retrievable by stable key.");

const failedZone = await manager.loadGroup("zone1");
assert.equal(failedZone.ready, false, "A failed critical asset blocks a zone group.");
assert.deepEqual(failedZone.failedKeys, ["beacon"], "The failed critical asset is reported.");

const retriedZone = await manager.retryGroup("zone1");
assert.equal(retriedZone.ready, true, "Retry reloads only failed entries and unlocks the group.");
assert.equal(attempts.get("beacon"), 2, "The failed entry is retried exactly once.");

console.log("PASS: grouped assets load by stable key and critical failures can be retried.");
