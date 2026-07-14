const CASEBOARD_CHAPTERS = Object.freeze([
  {
    id: "zone1",
    label: "Khu 1 · 1922–1929",
    title: "Báo Người cùng khổ",
    unlocked: () => true,
    completed: (quests) => Boolean(quests.zone1RewardClaimed),
    active: (quests) => Boolean(quests.tvaBriefingAccepted),
    objective: (quests) => {
      if (!quests.tvaBriefingAccepted) return "Gặp David để nhận quyền truy cập hồ sơ đầu tiên.";
      if (!quests.zone1Started) return "Đi tới bến cảng, gặp người liên lạc và nhận tờ báo.";
      if (quests.zone1Delivered.size < 3) return `Đưa báo Người cùng khổ tới công nhân · ${quests.zone1Delivered.size}/3.`;
      return "Quay lại người liên lạc để chốt đường truyền chung.";
    },
  },
  {
    id: "zone2",
    label: "Khu 2 · 1929–02/1930",
    title: "Hồ sơ hợp nhất",
    unlocked: (quests) => Boolean(quests.zone1RewardClaimed),
    completed: (quests) => Boolean(quests.zone2RewardClaimed),
    active: (quests) => quests.tvaPortalTarget === "archive" || quests.zone2Fragments.size > 0 || Boolean(quests.zone2TowerActivated),
    objective: (quests) => {
      if (quests.zone2Fragments.size < 3) return `Hàn gắn các nguồn tư liệu trong kho lưu trữ · ${quests.zone2Fragments.size}/3.`;
      if (!quests.zone2TowerActivated) return "Đưa ba nguồn tư liệu về Tháp lưu trữ.";
      return "Trở lại bàn tròn để chốt hồ sơ thống nhất.";
    },
  },
  {
    id: "zone3a",
    label: "Khu 3A · 1941–1945",
    title: "Thời cơ Tháng Tám",
    unlocked: (quests) => Boolean(quests.zone2RewardClaimed),
    completed: (quests) => Boolean(quests.zone3ThreadClaimed),
    active: (quests) => quests.tvaPortalTarget === "crossroads" || quests.zone3Recruits.size > 0,
    objective: (quests) => {
      if (quests.zone3Recruits.size < 3) return `Kết nối lực lượng cho cuộc tập hợp · ${quests.zone3Recruits.size}/3.`;
      return "Trở lại quảng trường để chốt cách gìn giữ thời cơ.";
    },
  },
  {
    id: "zone3b",
    label: "Khu 3B · 1954–1975",
    title: "Giới tuyến tạm thời",
    unlocked: (quests) => Boolean(quests.zone3ThreadClaimed),
    completed: (quests) => Boolean(quests.zone3MapClaimed),
    active: (quests) => quests.tvaPortalTarget === "crossroads" || quests.zone3HamletsFreed.size > 0,
    objective: (quests) => {
      if (quests.zone3HamletsFreed.size < 3) return `Giải cứu dân khỏi các ấp chiến lược · ${quests.zone3HamletsFreed.size}/3.`;
      return "Đến bàn đồ để khép lại hồ sơ giới tuyến tạm thời.";
    },
  },
  {
    id: "zone4",
    label: "Khu 4 · 1986–1988",
    title: "Đường lối Đổi Mới",
    unlocked: (quests) => Boolean(quests.zone3MapClaimed),
    completed: (quests) => Boolean(quests.zone4GearClaimed),
    active: (quests) => quests.tvaPortalTarget === "spring" || quests.zone4Barriers.size > 0 || quests.zone4Farmers.size > 0,
    objective: (quests) => {
      if (quests.zone4Barriers.size < 3) return `Tháo các rào cản cơ chế · ${quests.zone4Barriers.size}/3.`;
      if (quests.zone4Farmers.size < 3) return `Trao Khoán 10 tới các hộ sản xuất · ${quests.zone4Farmers.size}/3.`;
      return "Gặp người lãnh đạo để nhận Bánh răng Đổi Mới.";
    },
  },
]);

function asQuestSet(value) {
  return value instanceof Set ? value : new Set(Array.isArray(value) ? value : []);
}

function normalizeQuests(quests = {}) {
  return {
    ...quests,
    zone1Delivered: asQuestSet(quests.zone1Delivered),
    zone2Fragments: asQuestSet(quests.zone2Fragments),
    zone3Recruits: asQuestSet(quests.zone3Recruits),
    zone3HamletsFreed: asQuestSet(quests.zone3HamletsFreed),
    zone4Barriers: asQuestSet(quests.zone4Barriers),
    zone4Farmers: asQuestSet(quests.zone4Farmers),
  };
}

export function buildTvaCaseboard({ quests = {} } = {}) {
  const normalizedQuests = normalizeQuests(quests);
  const entries = CASEBOARD_CHAPTERS
    .filter((chapter) => chapter.unlocked(normalizedQuests))
    .map((chapter) => {
      const completed = chapter.completed(normalizedQuests);
      const active = !completed && chapter.active(normalizedQuests);
      const status = completed
        ? "Đã niêm phong"
        : active
          ? "Đang theo dõi"
          : "Chưa cấp quyền";

      return {
        id: chapter.id,
        label: chapter.label,
        title: chapter.title,
        status,
        objective: chapter.objective(normalizedQuests),
        trackable: active,
      };
    });

  return { entries };
}

export function createTvaCaseboardDialogue(caseboard, trackedChapterId = null) {
  const entries = caseboard?.entries ?? [];
  const lines = entries.map((entry) => `${entry.label} — ${entry.status}: ${entry.objective}`);
  const choices = entries
    .filter((entry) => entry.trackable)
    .map((entry) => ({
      id: `track:${entry.id}`,
      label: trackedChapterId === entry.id
        ? `Đang theo dõi: ${entry.title}`
        : `Theo dõi: ${entry.title}`,
    }));

  return {
    speaker: "Bảng hồ sơ TVA",
    lines,
    choices,
    closeLabel: "Đóng hồ sơ",
  };
}

export const TVA_CASEBOARD_CHAPTER_IDS = Object.freeze(CASEBOARD_CHAPTERS.map((chapter) => chapter.id));
