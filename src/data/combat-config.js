export const BOSS_DEFINITIONS = {
  village: {
    id: "village-corruption-guard",
    name: "Kẻ Canh Gác Tha Hóa",
    variant: "devourer",
    x: 774,
    y: 456,
    maxHealth: 18,
    damage: 2,
    combatProfile: {
      phaseTwoThreshold: 0.5,
      comboEvery: 3,
      sweep: { telegraphMs: 520, attackMs: 300, range: 66 },
      slam: { telegraphMs: 650, attackMs: 360, radius: 70 },
      commandPulse: { intervalMs: 6000, durationMs: 1400, radius: 150, speedMultiplier: 1.15, attackDurationMultiplier: 0.9 },
    },
  },
  archive: {
    id: "archive-shadow-curator",
    name: "Bóng Ma Lưu Trữ",
    variant: "wraith",
    x: 480,
    y: 286,
    maxHealth: 18,
    damage: 2,
    combatProfile: {
      phaseTwoThreshold: 0.5,
      comboEvery: 3,
      sweep: { telegraphMs: 480, attackMs: 290, range: 68 },
      slam: { telegraphMs: 620, attackMs: 360, radius: 74 },
      commandPulse: { intervalMs: 6500, durationMs: 1300, radius: 140, speedMultiplier: 1.12, attackDurationMultiplier: 0.9 },
    },
  },
  crossroads: {
    id: "southern-tyrant",
    name: "Bộ Máy Áp Bức",
    variant: "blight",
    x: 588,
    y: 476,
    maxHealth: 20,
    damage: 2,
    combatProfile: {
      phaseTwoThreshold: 0.5,
      comboEvery: 3,
      sweep: { telegraphMs: 500, attackMs: 300, range: 70 },
      slam: { telegraphMs: 640, attackMs: 380, radius: 78 },
      commandPulse: { intervalMs: 6200, durationMs: 1300, radius: 150, speedMultiplier: 1.14, attackDurationMultiplier: 0.9 },
    },
  },
  spring: {
    id: "spring-bureaucracy-beast",
    name: "Quái Thú Quan Liêu",
    variant: "blight",
    x: 500,
    y: 306,
    maxHealth: 20,
    damage: 2,
    combatProfile: {
      phaseTwoThreshold: 0.5,
      comboEvery: 3,
      sweep: { telegraphMs: 500, attackMs: 300, range: 70 },
      slam: { telegraphMs: 640, attackMs: 380, radius: 78 },
      commandPulse: { intervalMs: 6000, durationMs: 1300, radius: 150, speedMultiplier: 1.16, attackDurationMultiplier: 0.88 },
    },
  },
};

export const COMBAT_ROSTER = {
  village: [
    { id: "village-raider", name: "Kẻ Cướp Bóng Đêm", archetype: "melee", variant: "devourer", x: 640, y: 426, elite: true },
    { id: "village-marksman", name: "Lính tuần tra Pháp", archetype: "ranged", variant: "wraith", artKey: "frenchColonialSoldier", x: 812, y: 330, patrolAxis: "horizontal", attackAnimationMs: 800, attackImpactDelayMs: 300 },
    { id: "village-chanter", name: "Kẻ Tụng Niệm Tha Hóa", archetype: "support", variant: "blight", x: 566, y: 286 },
  ],
  archive: [
    { id: "archive-raider", name: "Bóng Đen Phá Kho", archetype: "melee", variant: "devourer", x: 270, y: 392 },
    { id: "archive-marksman", name: "Xạ Thủ Mật Mã", archetype: "ranged", variant: "wraith", x: 700, y: 352, elite: true },
    { id: "archive-chanter", name: "Thủ Thư Tha Hóa", archetype: "support", variant: "blight", x: 490, y: 210 },
  ],
  crossroads: [
    { id: "crossroads-raider", name: "Kẻ Cướp Cầu Gãy", archetype: "melee", variant: "devourer", x: 360, y: 438 },
    { id: "crossroads-marksman", name: "Xạ Thủ Chia Cắt", archetype: "ranged", variant: "wraith", x: 620, y: 402 },
    { id: "crossroads-chanter", name: "Kẻ Tuyên Truyền Bóng Tối", archetype: "support", variant: "blight", x: 780, y: 496, elite: true },
  ],
  spring: [
    { id: "spring-raider", name: "Kẻ Phá Hoại Mùa Màng", archetype: "melee", variant: "devourer", x: 350, y: 360 },
    { id: "spring-marksman", name: "Xạ Thủ Quan Liêu", archetype: "ranged", variant: "wraith", x: 700, y: 328, elite: true },
    { id: "spring-chanter", name: "Kẻ Tụng Niệm Bao Cấp", archetype: "support", variant: "blight", x: 540, y: 428 },
  ],
};

export const COMBAT_DENSITY = { village: 2, archive: 2, crossroads: 3, spring: 3 };

