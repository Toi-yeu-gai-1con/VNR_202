function defineMonsterCodex({ monsterId, artKey, title, zoneLabel, silhouette, behavior, telegraph, boss = false }) {
  return Object.freeze({
    monsterId,
    storyId: `monster:${monsterId}`,
    artKey,
    title,
    zoneLabel,
    silhouette,
    behavior,
    telegraph,
    boss,
    note: "Hình tượng gameplay hư cấu, không phải tư liệu lịch sử.",
  });
}

export const MONSTER_CODEX_DEFINITIONS = Object.freeze([
  defineMonsterCodex({ monsterId: "village-raider", artKey: "zone1Raider", title: "Kẻ Cướp Bóng Đêm", zoneLabel: "Khu 1 — Bến cảng", silhouette: "Áo choàng sẫm, vai rộng và lưỡi móc thấp.", behavior: "Áp sát theo nhịp ngắn rồi đổi hướng quanh người chơi.", telegraph: "Hạ thấp vai và chùng lưỡi móc trước cú quét.", }),
  defineMonsterCodex({ monsterId: "village-marksman", artKey: "frenchColonialSoldier", title: "Lính tuần tra Pháp", zoneLabel: "Khu 1 — Bến cảng", silhouette: "Quân phục tối, mũ cứng và súng trường dài.", behavior: "Giữ khoảng cách, lùi khi bị áp sát và bắn thẳng theo trục ngang.", telegraph: "Giương súng, đứng khựng lại trước khi phát đạn rời nòng.", }),
  defineMonsterCodex({ monsterId: "village-chanter", artKey: "zone1Signalman", title: "Kẻ Tụng Niệm Tha Hóa", zoneLabel: "Khu 1 — Bến cảng", silhouette: "Áo trùm xám, tay cầm tín hiệu phát sáng tím.", behavior: "Giữ sau đồng bọn và làm ý chí người chơi suy yếu trong tầm gần.", telegraph: "Tín hiệu tím phồng sáng quanh bàn tay trước nhịp áp chế.", }),
  defineMonsterCodex({ monsterId: "village-corruption-guard", artKey: "zone1Captain", title: "Kẻ Canh Gác Tha Hóa", zoneLabel: "Khu 1 — Bến cảng", silhouette: "Thân hình cao lớn, áo giáp tối và vũ khí dài.", behavior: "Boss đổi nhịp giữa cú quét, đập đất và lệnh tăng tốc cho đồng bọn.", telegraph: "Vòng cảnh báo mở rộng trên nền; cú đập đất có khoảng dừng dài hơn.", boss: true }),
  defineMonsterCodex({ monsterId: "archive-raider", artKey: "zone2ArchiveSaboteur", title: "Bóng Đen Phá Kho", zoneLabel: "Khu 2 — Kho lưu trữ", silhouette: "Áo khoác ngắn, túi tài liệu rách và lưỡi dao giấu tay.", behavior: "Luồn qua lối hẹp để áp sát và ép người chơi rời vị trí.", telegraph: "Nghiêng người về phía trước, tay vũ khí kéo ra sau trước cú lao.", }),
  defineMonsterCodex({ monsterId: "archive-marksman", artKey: "zone2CipherMarksman", title: "Xạ Thủ Mật Mã", zoneLabel: "Khu 2 — Kho lưu trữ", silhouette: "Áo choàng mực đen, mặt nạ nhỏ và nỏ mã hóa.", behavior: "Giữ hành lang dài, bắn xa rồi đổi góc khi bị áp lực.", telegraph: "Nỏ nâng lên cùng một vệt sáng lạnh ở đầu dây.", }),
  defineMonsterCodex({ monsterId: "archive-chanter", artKey: "zone2CorruptedArchivist", title: "Thủ Thư Tha Hóa", zoneLabel: "Khu 2 — Kho lưu trữ", silhouette: "Áo thủ thư xộc xệch, giấy rời và quyền trượng mảnh.", behavior: "Đứng sau đội hình, phát nhịp suy yếu và hỗ trợ đồng bọn.", telegraph: "Giấy xoay quanh quyền trượng trước khi hiệu ứng lan ra.", }),
  defineMonsterCodex({ monsterId: "archive-shadow-curator", artKey: "zone2ShadowCurator", title: "Bóng Ma Lưu Trữ", zoneLabel: "Khu 2 — Kho lưu trữ", silhouette: "Áo choàng dài, mặt tối và cán sào lưu trữ sắc nét.", behavior: "Boss dùng quét rộng, đập đất và lệnh điều phối khiến đội hình tăng tốc.", telegraph: "Cán sào dựng cao cho đập đất; vòng đỏ mở rộng báo cú quét.", boss: true }),
  defineMonsterCodex({ monsterId: "crossroads-raider", artKey: "zone3BridgeRaider", title: "Kẻ Cướp Cầu Gãy", zoneLabel: "Khu 3 — Ngã rẽ", silhouette: "Áo khoác vá, khiên gỗ và móc kéo cầu.", behavior: "Chặn đường hẹp, áp sát theo đường chéo và ép lệch vị trí.", telegraph: "Khiên hạ thấp, móc kéo lùi về sau trước cú lao.", }),
  defineMonsterCodex({ monsterId: "crossroads-marksman", artKey: "zone3FactionSkirmisher", title: "Xạ Thủ Chia Cắt", zoneLabel: "Khu 3 — Ngã rẽ", silhouette: "Khăn che mặt, súng ngắn và túi đạn nâu.", behavior: "Đứng ở rìa giao tranh, bắn chặn rồi lùi khỏi tầm đánh gần.", telegraph: "Nòng súng sáng lên và cơ thể đứng im một nhịp trước phát bắn.", }),
  defineMonsterCodex({ monsterId: "crossroads-chanter", artKey: "zone3WhisperPropagandist", title: "Kẻ Tuyên Truyền Bóng Tối", zoneLabel: "Khu 3 — Ngã rẽ", silhouette: "Áo choàng chắp vá, loa giấy và khăn đỏ sẫm.", behavior: "Duy trì khoảng cách, làm suy yếu người chơi và hỗ trợ đồng đội.", telegraph: "Loa giấy bung sáng, tiếng vọng màu tím lan theo một vòng ngắn.", }),
  defineMonsterCodex({ monsterId: "southern-tyrant", artKey: "zone3SouthernTyrant", title: "Bộ Máy Áp Bức", zoneLabel: "Khu 3 — Ngã rẽ", silhouette: "Áo khoác nặng, mũ sắt và vũ khí cán dài.", behavior: "Boss phối hợp quét, đập đất và hiệu lệnh áp chế khi xuống giai đoạn hai.", telegraph: "Động tác vung vai rất rộng; vòng nền lớn báo vùng đập đất.", boss: true }),
  defineMonsterCodex({ monsterId: "spring-raider", artKey: "zone4CropSaboteur", title: "Kẻ Phá Hoại Mùa Màng", zoneLabel: "Khu 4 — Mùa xuân", silhouette: "Áo nông vụ cũ, liềm gãy và bao hạt rách.", behavior: "Áp sát theo đường ruộng, đổi góc nhanh khi người chơi lùi.", telegraph: "Lưỡi liềm hạ xuống và chân sau ghì đất trước cú quét.", }),
  defineMonsterCodex({ monsterId: "spring-marksman", artKey: "zone4BureauMarksman", title: "Xạ Thủ Quan Liêu", zoneLabel: "Khu 4 — Mùa xuân", silhouette: "Áo khoác công vụ, mũ cứng và súng dài.", behavior: "Canh ở mép sân, giữ khoảng cách để bắn chặn đường tiến.", telegraph: "Súng kéo về vai, thân người đứng lại trước khi khai hỏa.", }),
  defineMonsterCodex({ monsterId: "spring-chanter", artKey: "zone4RationChanter", title: "Kẻ Tụng Niệm Bao Cấp", zoneLabel: "Khu 4 — Mùa xuân", silhouette: "Áo dài tối, sổ tem phiếu và chuỗi giấy bay quanh tay.", behavior: "Tạo nhịp suy yếu để đồng bọn có thời gian áp sát.", telegraph: "Sổ tem phiếu mở ra, giấy phát ánh tím trước hiệu ứng.", }),
  defineMonsterCodex({ monsterId: "spring-bureaucracy-beast", artKey: "zone4BureaucracyBeast", title: "Quái Thú Quan Liêu", zoneLabel: "Khu 4 — Mùa xuân", silhouette: "Thân hình lớn trong áo giáp chắp vá, xích giấy tờ và búa nặng.", behavior: "Boss luân phiên quét rộng, đập đất và hiệu lệnh làm đồng bọn tăng tốc.", telegraph: "Xích giấy tờ cuộn lại và vòng cảnh báo lớn hiện trên đất.", boss: true }),
]);

const MONSTER_CODEX_BY_ID = Object.freeze(
  Object.fromEntries(MONSTER_CODEX_DEFINITIONS.map((entry) => [entry.monsterId, entry]))
);

export function getMonsterCodexEntry(monsterId) {
  return MONSTER_CODEX_BY_ID[monsterId] ?? null;
}
