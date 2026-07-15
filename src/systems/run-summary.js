const RUN_STAT_KEYS = Object.freeze([
  "activeMilliseconds",
  "strikes",
  "successfulParries",
  "damageTaken",
  "choicesMade",
  "maxCorruption",
]);

function nonNegativeInteger(value) {
  return Math.max(0, Math.round(Number(value) || 0));
}

function formatDuration(milliseconds) {
  const totalMinutes = Math.floor(nonNegativeInteger(milliseconds) / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} giờ ${minutes} phút`;
  }
  if (hours > 0) {
    return `${hours} giờ`;
  }
  return `${Math.max(1, minutes)} phút`;
}

export function createRunStats(saved = {}) {
  return Object.fromEntries(RUN_STAT_KEYS.map((key) => [key, nonNegativeInteger(saved?.[key])]));
}

export function recordRunStat(stats, key, amount = 1) {
  if (!stats || !RUN_STAT_KEYS.includes(key)) {
    return stats;
  }

  stats[key] = nonNegativeInteger(stats[key]) + nonNegativeInteger(amount);
  return stats;
}

export function createRunSummary({ runStats, inventory, corruption = 0, completedZones, narrative } = {}) {
  const stats = createRunStats(runStats);
  const relicCount = inventory instanceof Set ? inventory.size : Array.isArray(inventory) ? inventory.length : 0;
  const zoneCount = completedZones instanceof Set ? completedZones.size : Array.isArray(completedZones) ? completedZones.length : 0;
  const positiveRelations = Object.values(narrative?.npcRelations ?? {})
    .reduce((total, relation) => total + Math.max(0, Number(relation) || 0), 0);
  const components = [
    { id: "relics", label: "Tín vật được bảo toàn", points: Math.min(5, relicCount) * 100 },
    { id: "zones", label: "Khu vực đã ổn định", points: Math.min(4, zoneCount) * 20 },
    { id: "integrity", label: "Giữ Tha hóa ở mức an toàn", points: Math.max(0, 100 - Math.min(100, stats.maxCorruption)) },
    { id: "relations", label: "Niềm tin của nhân chứng", points: Math.min(10, positiveRelations) * 10 },
    { id: "choices", label: "Lựa chọn có trách nhiệm", points: Math.min(10, stats.choicesMade) * 5 },
    { id: "parries", label: "Phản đòn chính xác", points: Math.min(8, stats.successfulParries) * 5 },
  ];

  return {
    score: components.reduce((total, component) => total + component.points, 0),
    components: components.filter((component) => component.points > 0),
    durationLabel: formatDuration(stats.activeMilliseconds),
    corruptionLabel: `Tha hóa cao nhất ${Math.min(100, stats.maxCorruption)}% • kết thúc ${Math.min(100, nonNegativeInteger(corruption))}%`,
    combatStyle: `${stats.successfulParries} phản đòn thành công / ${stats.strikes} đòn đánh`,
    damageTaken: stats.damageTaken,
  };
}
