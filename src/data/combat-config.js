export const BOSS_DEFINITIONS = {
  village: { id: "village-corruption-guard", name: "Kẻ Canh Gác Tha Hóa", variant: "devourer", x: 774, y: 456 },
  archive: { id: "archive-shadow-curator", name: "Bóng Ma Lưu Trữ", variant: "wraith", x: 480, y: 286 },
  crossroads: { id: "southern-tyrant", name: "Bộ Máy Áp Bức", variant: "blight", x: 588, y: 476 },
  spring: { id: "spring-bureaucracy-beast", name: "Quái Thú Quan Liêu", variant: "blight", x: 500, y: 306 },
};

export const COMBAT_ROSTER = {
  village: [
    { id: "village-raider", name: "Kẻ Cướp Bóng Đêm", archetype: "melee", variant: "devourer", x: 640, y: 426, elite: true },
    { id: "village-marksman", name: "Xạ Thủ Bóng Mờ", archetype: "ranged", variant: "wraith", x: 812, y: 330 },
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

export const COMBAT_DENSITY = { village: 1, archive: 2, crossroads: 3, spring: 3 };

