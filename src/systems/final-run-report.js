import {
  NARRATIVE_CHAPTER_DEFINITIONS,
  NARRATIVE_CHOICE_DEFINITIONS,
  NARRATIVE_ENDING_DEFINITIONS,
} from "../data/narrative-definitions.js";
import { createRunStats, createRunSummary } from "./run-summary.js";

const DIFFICULTY_LABELS = Object.freeze({
  easy: "Khám phá lịch sử",
  normal: "Hành trình chuẩn",
  hard: "Thử thách cao",
});

function collectionSize(value) {
  if (value instanceof Set) {
    return value.size;
  }
  if (Array.isArray(value)) {
    return value.length;
  }
  return 0;
}

function getDecision(chapterId, decisionId) {
  return NARRATIVE_CHOICE_DEFINITIONS[chapterId]?.find((decision) => decision.id === decisionId) ?? null;
}

function getTimeline(narrative = {}) {
  const history = Array.isArray(narrative.choiceHistory) ? narrative.choiceHistory : [];
  const detailedEntries = history
    .map((entry) => {
      const decision = getDecision(entry?.chapterId, entry?.decisionId);
      const option = decision?.options.find((candidate) => candidate.id === entry?.optionId);
      const chapter = NARRATIVE_CHAPTER_DEFINITIONS.find((candidate) => candidate.id === entry?.chapterId);

      if (!decision || !option || !chapter) {
        return null;
      }

      return {
        id: `${entry.chapterId}.${entry.decisionId}.${entry.optionId}`,
        chapterId: entry.chapterId,
        decisionId: entry.decisionId,
        chapterLabel: chapter.title,
        decisionLabel: decision.title,
        label: option.label,
      };
    })
    .filter(Boolean);

  const detailedDecisionIds = new Set(detailedEntries.map((entry) => `${entry.chapterId}.${entry.decisionId}`));
  const legacyEntries = Object.entries(narrative.choices ?? {})
    .map(([storedId, chapterId]) => {
      const decisionId = storedId.startsWith(`${chapterId}.`) ? storedId.slice(chapterId.length + 1) : storedId;
      const decision = getDecision(chapterId, decisionId);
      const chapter = NARRATIVE_CHAPTER_DEFINITIONS.find((candidate) => candidate.id === chapterId);
      if (!decision || !chapter) {
        return null;
      }
      return {
        id: `${chapterId}.${decisionId}`,
        chapterId,
        decisionId,
        chapterLabel: chapter.title,
        decisionLabel: decision.title,
        label: "Điểm rẽ đã được ghi trong hồ sơ cũ",
        legacy: true,
      };
    })
    .filter(Boolean)
    .filter((entry) => !detailedDecisionIds.has(`${entry.chapterId}.${entry.decisionId}`));

  return [...detailedEntries, ...legacyEntries];
}

function getPeopleReport(quests = {}) {
  return [
    { id: "dock-workers", label: "Công nhân bến cảng đã nhận báo", completed: collectionSize(quests.zone1Delivered), total: 3 },
    { id: "crossroads-recruits", label: "Lực lượng đã được thuyết phục", completed: collectionSize(quests.zone3Recruits), total: 4 },
    { id: "crossroads-hamlets", label: "Ấp có người dân được giải phóng", completed: collectionSize(quests.zone3HamletsFreed), total: 3 },
    { id: "spring-farmers", label: "Nông dân đã nhận hỗ trợ", completed: collectionSize(quests.zone4Farmers), total: 3 },
  ].map((entry) => ({ ...entry, completed: Math.min(entry.total, entry.completed) }));
}

function getReplayPrompts(timeline) {
  return [...new Set(timeline.map((entry) => entry.chapterId))]
    .map((chapterId) => NARRATIVE_CHAPTER_DEFINITIONS.find((chapter) => chapter.id === chapterId))
    .filter(Boolean)
    .map((chapter) => `Có thể xem lại ${chapter.title} để thử một cách xử lý khác ở các điểm rẽ đã ghi.`);
}

export function createFinalRunReport({ endingId, corruption = 0, runStats, quests, narrative, difficulty } = {}) {
  const stats = createRunStats(runStats);
  const scoreSummary = createRunSummary({ runStats: stats, corruption, narrative });
  const timeline = getTimeline(narrative);
  const ending = NARRATIVE_ENDING_DEFINITIONS[endingId] ?? {
    title: "Hồ sơ chưa khép lại",
    branchLabel: "Trạng thái hành trình",
  };

  return {
    ending: { id: endingId ?? null, label: ending.title, kind: ending.branchLabel },
    durationLabel: scoreSummary.durationLabel,
    corruptionLabel: scoreSummary.corruptionLabel,
    challenge: {
      id: difficulty ?? "normal",
      label: DIFFICULTY_LABELS[difficulty] ?? DIFFICULTY_LABELS.normal,
    },
    resolution: {
      dialogue: stats.choicesMade,
      combat: stats.strikes,
      parries: stats.successfulParries,
      damageTaken: stats.damageTaken,
      label: `${stats.choicesMade} điểm rẽ đối thoại • ${stats.strikes} đòn đánh • ${stats.successfulParries} phản đòn`,
    },
    people: getPeopleReport(quests),
    timeline,
    replayPrompts: getReplayPrompts(timeline),
  };
}
