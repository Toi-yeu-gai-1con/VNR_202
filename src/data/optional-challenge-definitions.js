const definitions = [
  {
    id: "no-damage",
    title: "Không một vết thương",
    rule: "Hoàn tất hành trình mà không nhận sát thương.",
    failure: "Thất bại nếu nhận bất kỳ thương tích nào.",
  },
  {
    id: "low-corruption",
    title: "Giữ hồ sơ trong sáng",
    rule: "Không để Tha hóa cao nhất vượt quá 25%.",
    failure: "Thất bại ngay khi Tha hóa cao nhất vượt 25%.",
    corruptionCap: 25,
  },
  {
    id: "restraint",
    title: "Lời nói có trọng lượng",
    rule: "Ghi ít nhất 3 điểm rẽ đối thoại, tạo 3 điểm niềm tin và không quá 8 đòn đánh.",
    failure: "Thất bại nếu dùng quá 8 đòn đánh.",
    minimumChoices: 3,
    minimumTrust: 3,
    maximumStrikes: 8,
  },
  {
    id: "zone3a-timing",
    title: "Nắm đúng thời cơ",
    rule: "Bảo vệ thời cơ ở Chương Khu 3A và không xác nhận nhánh bỏ lỡ thời cơ.",
    failure: "Thất bại nếu xác nhận nhánh ‘Thời cơ Tháng Tám vụt qua’.",
  },
];

export const OPTIONAL_CHALLENGE_DEFINITIONS = Object.freeze(definitions.map((definition) => Object.freeze(definition)));

export function getOptionalChallengeDefinition(id) {
  return OPTIONAL_CHALLENGE_DEFINITIONS.find((definition) => definition.id === id) ?? null;
}
