export const ACHIEVEMENT_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: "bridge-builder",
    title: "Người nối nhịp",
    text: "Bạn đã đặt đối thoại và sự tin cậy lên trước chia rẽ. Hồ sơ TVA ghi nhận những nhịp cầu được dựng từ hành động cụ thể.",
    caption: "Tích lũy ít nhất 4 điểm quan hệ tích cực với các nhân chứng.",
  }),
  Object.freeze({
    id: "protector",
    title: "Người bảo hộ",
    text: "Bạn đã đưa tiếng nói và sự hỗ trợ đến người cần chúng, thay vì chỉ đi ngang qua một mục tiêu.",
    caption: "Hoàn thành một mốc hỗ trợ nhân chứng hoặc dân thường trong khu vực.",
  }),
  Object.freeze({
    id: "precise-parry",
    title: "Nhịp phản đòn",
    text: "Ba lần phản đòn chính xác cho thấy bạn đọc được nhịp hiểm nguy thay vì lao vào va chạm mù quáng.",
    caption: "Thực hiện 3 phản đòn thành công trong các lượt chơi.",
  }),
  Object.freeze({
    id: "steady-compass",
    title: "La bàn vững hướng",
    text: "Bạn giữ được năm tín vật mà không để Tha hóa vượt ngưỡng an toàn của hành trình.",
    caption: "Có đủ 5 tín vật, với Tha hóa cao nhất không quá 24%.",
  }),
  Object.freeze({
    id: "archive-keeper",
    title: "Người lưu giữ tư liệu",
    text: "Bạn đã mở đủ tư liệu để nhìn hành trình như một chuỗi lựa chọn, con người và dấu mốc — không chỉ là một đường đi tới đích.",
    caption: "Mở ít nhất 8 hồ sơ lịch sử trong Sách TVA.",
  }),
]);

function sizeOf(value) {
  return value instanceof Set ? value.size : Array.isArray(value) ? value.length : 0;
}

function positiveRelations(narrative) {
  return Object.values(narrative?.npcRelations ?? {})
    .reduce((total, relation) => total + Math.max(0, Number(relation) || 0), 0);
}

function hasProtectedWitness(quests = {}) {
  return sizeOf(quests.zone1Delivered) >= 3
    || sizeOf(quests.zone2Fragments) >= 3
    || sizeOf(quests.zone3Recruits) >= 4
    || sizeOf(quests.zone3HamletsFreed) >= 3
    || sizeOf(quests.zone4Farmers) >= 3;
}

export function getEarnedAchievementIds({ runStats = {}, unlockedStoryIds, narrative, quests, inventory } = {}) {
  const stats = {
    successfulParries: Math.max(0, Number(runStats.successfulParries) || 0),
    maxCorruption: Math.max(0, Number(runStats.maxCorruption) || 0),
  };
  const earned = [];

  if (positiveRelations(narrative) >= 4) earned.push("bridge-builder");
  if (hasProtectedWitness(quests)) earned.push("protector");
  if (stats.successfulParries >= 3) earned.push("precise-parry");
  if (sizeOf(inventory) >= 5 && stats.maxCorruption <= 24) earned.push("steady-compass");
  if (sizeOf(unlockedStoryIds) >= 8) earned.push("archive-keeper");

  return earned;
}
