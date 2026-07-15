import assert from "node:assert/strict";
import { createFinalRunReport } from "../src/systems/final-run-report.js";

const report = createFinalRunReport({
  endingId: "good",
  corruption: 12,
  runStats: {
    activeMilliseconds: 3_600_000,
    strikes: 8,
    successfulParries: 3,
    damageTaken: 5,
    choicesMade: 4,
    maxCorruption: 28,
  },
  quests: {
    zone1Delivered: new Set(["worker-1", "worker-2", "worker-3"]),
    zone3Recruits: new Set(["recruit-1", "recruit-2"]),
    zone3HamletsFreed: new Set(["hamlet-1", "hamlet-2", "hamlet-3"]),
    zone4Farmers: new Set(["farmer-1", "farmer-2", "farmer-3"]),
  },
  narrative: {
    choices: { "zone3a.august-verdict": "zone3a" },
    choiceHistory: [
      { chapterId: "zone1", decisionId: "dock-workers", optionId: "protect" },
      { chapterId: "zone2", decisionId: "archive-unity-choice", optionId: "listen" },
      { chapterId: "zone4", decisionId: "production-choice", optionId: "open-ledger" },
    ],
    npcRelations: { "dock-workers": 3 },
  },
});

assert.equal(report.ending.label, "Đại thắng và phát triển", "The report names the ending the player actually reached.");
assert.equal(report.durationLabel, "1 giờ", "The report retains the non-competitive play duration.");
assert.equal(report.corruptionLabel, "Tha hóa cao nhất 28% • kết thúc 12%", "The report distinguishes peak and final corruption.");
assert.equal(report.resolution.label, "4 điểm rẽ đối thoại • 8 đòn đánh • 3 phản đòn", "The report exposes dialogue and combat methods together.");
assert.deepEqual(
  report.people,
  [
    { id: "dock-workers", label: "Công nhân bến cảng đã nhận báo", completed: 3, total: 3 },
    { id: "crossroads-recruits", label: "Lực lượng đã được thuyết phục", completed: 2, total: 4 },
    { id: "crossroads-hamlets", label: "Ấp có người dân được giải phóng", completed: 3, total: 3 },
    { id: "spring-farmers", label: "Nông dân đã nhận hỗ trợ", completed: 3, total: 3 },
  ],
  "The report distinguishes people helped from generic loot or combat counters."
);
assert.deepEqual(
  report.timeline.map((entry) => entry.label),
  [
    "Bảo vệ đường truyền cùng công nhân",
    "Lắng nghe mục tiêu chung của ba nhóm",
    "Công khai sổ sách và trả lại nguồn lực cho sản xuất",
    "Điểm rẽ đã được ghi trong hồ sơ cũ",
  ],
  "The report preserves detailed new choices without erasing older saves that only contain a turning-point record."
);
assert.equal(report.replayPrompts.some((prompt) => /đáp án|đúng|sai/i.test(prompt)), false, "Replay prompts invite reflection without revealing a correct answer.");

console.log("PASS: final reports preserve turning points, people helped, and a non-spoiler replay invitation.");
