import assert from "node:assert/strict";
import { buildTvaCaseboard, createTvaCaseboardDialogue } from "../src/data/tva-caseboard.js";

function createQuestSnapshot(overrides = {}) {
  return {
    tvaBriefingAccepted: false,
    tvaPortalTarget: null,
    zone1Started: false,
    zone1Delivered: new Set(),
    zone1RewardClaimed: false,
    zone2Fragments: new Set(),
    zone2TowerActivated: false,
    zone2RewardClaimed: false,
    zone3Recruits: new Set(),
    zone3ThreadClaimed: false,
    zone3HamletsFreed: new Set(),
    zone3MapClaimed: false,
    zone4Barriers: new Set(),
    zone4Farmers: new Set(),
    zone4GearClaimed: false,
    ...overrides,
  };
}

const locked = buildTvaCaseboard({ quests: createQuestSnapshot() });
assert.deepEqual(
  locked.entries.map((entry) => entry.id),
  ["zone1"],
  "The caseboard keeps future zones and chapters hidden before David authorizes the first file."
);
assert.equal(locked.entries[0].status, "Chưa cấp quyền", "An unopened file stays non-spoilery.");
assert.equal(locked.entries[0].trackable, false, "A player cannot track a mission they have not received.");

const activeZone1 = buildTvaCaseboard({
  quests: createQuestSnapshot({
    tvaBriefingAccepted: true,
    tvaPortalTarget: "village",
    zone1Started: true,
    zone1Delivered: new Set(["worker-1"]),
  }),
});
assert.equal(activeZone1.entries[0].status, "Đang theo dõi", "The current file reports active progress.");
assert.match(activeZone1.entries[0].objective, /1\/3/, "The known Zone 1 delivery progress is visible.");
assert.equal(activeZone1.entries[0].trackable, true, "An authorized active file can be tracked.");
assert.equal(activeZone1.entries.length, 1, "Zone 2 remains hidden until Zone 1 is actually resolved.");

const deferredZone1 = buildTvaCaseboard({
  quests: createQuestSnapshot({ tvaBriefingAccepted: true }),
});
assert.equal(
  deferredZone1.entries[0].status,
  "Đang theo dõi",
  "The first file remains trackable after David authorizes it, even before the player opens the portal."
);
assert.equal(deferredZone1.entries[0].trackable, true, "Deferring departure does not revoke an authorized objective.");

const archiveUnlocked = buildTvaCaseboard({
  quests: createQuestSnapshot({
    tvaBriefingAccepted: true,
    tvaPortalTarget: "archive",
    zone1RewardClaimed: true,
    zone2Fragments: new Set(["east", "west"]),
  }),
});
assert.deepEqual(
  archiveUnlocked.entries.map((entry) => entry.id),
  ["zone1", "zone2"],
  "Completing a zone seals its file and reveals only the next authorized file."
);
assert.equal(archiveUnlocked.entries[0].status, "Đã niêm phong", "Completed files remain visible as an earned record.");
assert.match(archiveUnlocked.entries[1].objective, /2\/3/, "Archive progress is visible after its dispatch is known.");

const zone3ChapterSplit = buildTvaCaseboard({
  quests: createQuestSnapshot({
    tvaBriefingAccepted: true,
    tvaPortalTarget: "crossroads",
    zone1RewardClaimed: true,
    zone2RewardClaimed: true,
    zone3ThreadClaimed: true,
    zone3HamletsFreed: new Set(["hamlet-1", "hamlet-2"]),
  }),
});
assert.deepEqual(
  zone3ChapterSplit.entries.map((entry) => entry.id),
  ["zone1", "zone2", "zone3a", "zone3b"],
  "The board separates the two Zone 3 chapters while withholding Zone 4."
);
assert.equal(zone3ChapterSplit.entries[2].status, "Đã niêm phong", "Zone 3A is independently recorded after the thread is recovered.");
assert.match(zone3ChapterSplit.entries[3].objective, /2\/3/, "Zone 3B exposes only its own rescue progress.");

const dialogue = createTvaCaseboardDialogue(activeZone1, "zone1");
assert.equal(dialogue.choices[0].id, "track:zone1", "The board supplies a concrete track action for known work.");
assert.match(dialogue.lines.at(-1), /Đang theo dõi/, "The dialogue communicates the selected tracked file.");

console.log("PASS: TVA caseboard reveals only known chapters and supports explicit objective tracking.");
