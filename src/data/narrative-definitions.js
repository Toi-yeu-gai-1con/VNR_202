export const NARRATIVE_CHAPTER_DEFINITIONS = Object.freeze([
  {
    id: "zone1",
    levelId: "village",
    title: "Báo Người cùng khổ và cuộc tìm đường",
    period: "1922–1929",
    question: "Khi một dân tộc đang bế tắc, điều gì giúp biến lòng yêu nước thành một con đường chung?",
    historicalSource: {
      label: "Bảo tàng Hồ Chí Minh — Nguyễn Ái Quốc–Hồ Chí Minh và báo Người cùng khổ",
      url: "https://baotanghochiminh.vn/nguyen-ai-quoc-ho-chi-minh-va-bao-nguoi-cung-kho-le-paria.htm",
    },
  },
  {
    id: "zone2",
    levelId: "archive",
    title: "Từ phân tán đến hợp nhất",
    period: "1929–02/1930",
    question: "Vì sao lực lượng cùng mục tiêu cần một tổ chức thống nhất?",
    historicalSource: {
      label: "Tư liệu–Văn kiện Đảng — Ngày thành lập Đảng Cộng sản Việt Nam 3/2/1930",
      url: "https://tulieuvankien.dangcongsan.vn/ho-so-su-kien-nhan-chung/su-kien-va-nhan-chung/ngay-thanh-lap-dang-cong-san-viet-nam-3-2-1930-3342",
    },
  },
  {
    id: "zone3a",
    levelId: "crossroads",
    title: "Đại đoàn kết và thời cơ Tháng Tám",
    period: "1941–1945",
    question: "Làm sao sự chuẩn bị và đoàn kết biến một thời cơ thành thắng lợi?",
    historicalSource: {
      label: "Tư liệu–Văn kiện Đảng — Cách mạng Tháng Tám và Quốc khánh 2/9/1945",
      url: "https://tulieuvankien.dangcongsan.vn/ho-so-su-kien-nhan-chung/su-kien-va-nhan-chung/cach-mang-thang-8-va-quoc-khanh-291945-cua-nuoc-viet-nam-dan-chu-cong-hoa-3310",
    },
  },
  {
    id: "zone3b",
    levelId: "crossroads",
    title: "Giới tuyến tạm thời, khát vọng thống nhất",
    period: "1954–1975",
    question: "Làm sao giữ một mục tiêu chung khi đất nước bị chia cắt tạm thời?",
    historicalSource: {
      label: "Báo Chính phủ — Hiệp định Genève 1954",
      url: "https://baochinhphu.vn/hiep-dinh-geneve-1954-mot-moc-son-lich-su-cua-nen-ngoai-giao-viet-nam-102240425094504794.htm",
    },
  },
  {
    id: "zone4",
    levelId: "spring",
    title: "Từ đường lối Đổi Mới đến cơ chế khoán trong nông nghiệp",
    period: "1986–1988",
    question: "Khi cơ chế cũ bộc lộ hạn chế, làm thế nào để đổi mới mà vẫn đặt người sản xuất ở trung tâm?",
    historicalSource: {
      label: "Báo Chính phủ — Đảng Cộng sản Việt Nam qua các kỳ Đại hội",
      url: "https://baochinhphu.vn/dang-cong-san-viet-nam-qua-cac-ky-dai-hoi-102286517.htm",
    },
  },
]);

export const NARRATIVE_ENDING_DEFINITIONS = Object.freeze({
  good: { title: "Đại thắng và phát triển", kind: "good", branchLabel: "Kết quả hành trình" },
  neutral: { title: "Dòng lịch sử còn vết nứt", kind: "neutral", branchLabel: "Kết quả hành trình" },
  "zone1-lost-compass": { title: "Con tàu không la bàn", kind: "bad", branchLabel: "Nhánh giả định" },
  "zone2-fading-fires": { title: "Ba ngọn lửa lụi tàn", kind: "bad", branchLabel: "Nhánh giả định" },
  "zone3a-missed-moment": { title: "Thời cơ Tháng Tám vụt qua", kind: "bad", branchLabel: "Nhánh giả định" },
  "zone3b-divided-border": { title: "Vĩ tuyến thành biên giới", kind: "bad", branchLabel: "Nhánh giả định" },
  "zone4-stalled-machine": { title: "Cỗ máy đứng im", kind: "bad", branchLabel: "Nhánh giả định" },
  "secret-corruption": { title: "Có ngọn cờ nhưng mất lòng dân", kind: "bad", branchLabel: "Nhánh giả định" },
});

export const NARRATIVE_TVA_REACTION_DEFINITIONS = Object.freeze({
  zone1: Object.freeze({
    protectedRoute: "Cậu đã giữ cho tiếng nói của người lao động đi tiếp. Hồ sơ ghi nhận một con đường được bảo vệ bằng sự kiên định, không phải bằng những lời hứa dễ dãi.",
    gatheredEvidence: "Cậu đã chọn quan sát để bảo vệ đường truyền. Thông tin chỉ có ý nghĩa khi cuối cùng vẫn trở về với người cần nó nhất.",
    compromisedAndRepaired: "Máy ghi nhận một lần lệch khỏi đường truyền, rồi một hành động sửa chữa rõ ràng. Lịch sử không xóa sai lầm, nhưng con người có thể chịu trách nhiệm và quay lại với cộng đồng.",
    compromised: "Có một vết lệch trong hồ sơ Khu 1. Cậu đã giữ La Bàn Đỏ, nhưng hãy nhớ: lợi ích riêng luôn làm con đường chung dễ chao đảo hơn.",
  }),
  zone2: Object.freeze({
    unified: "Cậu đã giữ các nguồn tư liệu cùng hướng về một nền tảng chung. Điều quan trọng không phải là xóa khác biệt, mà là không để khác biệt trở thành nghi kỵ.",
    repaired: "Máy ghi nhận một vết nứt đã được cậu quay lại hàn gắn. Một tổ chức bền vững cần khả năng sửa sai công khai, không chỉ một lời tuyên bố đúng.",
    divided: "Hồ sơ Khu 2 còn dấu vết nghi kỵ. Cậu đã mang được Biểu trưng Thống nhất về, nhưng hãy nhớ sức mạnh chung luôn phải được nuôi bằng đối thoại.",
  }),
  zone3: Object.freeze({
    prepared: "Cậu đã nối sự chuẩn bị, đoàn kết và thời cơ thay vì coi chúng là ba việc tách rời. Hồ sơ này cho thấy sức mạnh của một cuộc tập hợp có tổ chức.",
    repaired: "Có những liên hệ đã suýt đứt trong hai chương của Khu 3, rồi được cậu chọn hàn gắn. Lịch sử không giản lược thành một khoảnh khắc, mà được giữ bằng nhiều mối nối.",
    divided: "Máy đọc thấy những vết rạn ở Khu 3: lực lượng có thể bị phân tán, và một giới tuyến tạm thời có thể bị hiểu sai. Hãy mang bài học ấy sang những lựa chọn tiếp theo.",
  }),
  zone4: Object.freeze({
    renewal: "Cậu đã đặt người sản xuất, trách nhiệm và khả năng tự sửa mình vào cùng một hồ sơ. Đổi mới không phải một cái tên, mà là công việc tháo gỡ những nút thắt thật.",
    repaired: "Cậu đã nhìn nhận phần đặc quyền từng gây bế tắc và chọn sửa lại. Máy thời gian đánh giá đây là một chuyển động đáng tin hơn mọi lời hứa suông.",
    stalled: "Hồ sơ Khu 4 vẫn giữ vết của đặc quyền và sự trì trệ. Bánh răng đã về đây, nhưng bài học của nó là một guồng máy chỉ quay khi người dân được đặt ở trung tâm.",
  }),
});

export const NARRATIVE_CHOICE_DEFINITIONS = Object.freeze({
  zone1: Object.freeze([
    {
      id: "recruiter-offer",
      title: "Lời dụ dỗ ở bến cảng",
      options: Object.freeze([
        { id: "refuse", label: "Từ chối và tiếp tục truyền báo", branchFlags: { "zone1.rejectedRecruiter": true }, npcRelations: { "dock-workers": 1 }, themeScores: { direction: 1 } },
        { id: "accept", label: "Nhận tiền để giữ báo lại", branchFlags: { "zone1.acceptedRecruiter": true }, npcRelations: { "dock-workers": -1 }, themeScores: { direction: -1 }, endingRisks: { zone1: 1 }, corruption: 8 },
        { id: "stall", label: "Quan sát đường tuần tra trước khi quyết định", branchFlags: { "zone1.soughtEvidence": true }, themeScores: { direction: 1 } },
      ]),
    },
    {
      id: "dock-workers",
      title: "Đường truyền Le Paria",
      options: Object.freeze([
        { id: "protect", label: "Bảo vệ đường truyền cùng công nhân", npcRelations: { "dock-workers": 1 }, themeScores: { solidarity: 1 }, corruption: 2 },
        { id: "evidence", label: "Dùng lời kể và tư liệu để thuyết phục", branchFlags: { "zone1.usedEvidence": true }, npcRelations: { "dock-workers": 1 }, themeScores: { direction: 1 } },
        { id: "cargo-route", label: "Giấu báo trong tuyến hàng hóa", branchFlags: { "zone1.usedCargoRoute": true }, npcRelations: { "dock-workers": 1 }, themeScores: { solidarity: 1 } },
        { id: "abandon", label: "Đốt báo hoặc giấu báo đi", branchFlags: { "zone1.papersDestroyedOrHidden": true, "zone1.badConfirmed": true }, npcRelations: { "dock-workers": -2 }, endingRisks: { zone1: 3 }, corruption: 12 },
      ]),
    },
    {
      id: "last-issue",
      title: "Số báo cuối cùng",
      options: Object.freeze([
        { id: "rescue", label: "Ưu tiên đưa số báo đến tay người lao động", npcRelations: { "dock-workers": 1 }, themeScores: { solidarity: 1 }, corruption: 3 },
        { id: "divert", label: "Đánh lạc hướng tuần tra để giữ đường truyền", branchFlags: { "zone1.divertedPatrol": true }, themeScores: { direction: 1 } },
        { id: "return-after-compromise", label: "Quay lại sửa sai với người lao động", branchFlags: { "zone1.recoveredTrust": true }, npcRelations: { "dock-workers": 1 }, endingRisks: { zone1: -1 }, corruption: 4 },
        { id: "surrender", label: "Giao nộp số báo cuối cùng", branchFlags: { "zone1.lastIssueSurrendered": true }, npcRelations: { "dock-workers": -2 }, endingRisks: { zone1: 2 }, corruption: 12 },
      ]),
    },
    {
      id: "compass-verdict",
      title: "Lời hứa với La Bàn Đỏ",
      options: Object.freeze([
        { id: "protect-common-path", label: "Trao báo và giữ con đường chung", branchFlags: { "zone1.compassRestored": true, "zone1.badConfirmed": false }, themeScores: { direction: 1 } },
        { id: "repair-harm", label: "Thừa nhận sai lầm và sửa chữa", branchFlags: { "zone1.repairAccepted": true, "zone1.badConfirmed": false }, endingRisks: { zone1: -1 }, themeScores: { direction: 1 } },
        { id: "confirm-personal-gain", label: "Giữ lợi ích riêng dù con đường bị lệch", branchFlags: { "zone1.badConfirmed": true }, endingRisks: { zone1: 2 }, corruption: 10 },
      ]),
    },
  ]),
  zone2: Object.freeze([
    {
      id: "archive-unity-choice",
      title: "Ba nguồn tư liệu",
      options: Object.freeze([
        { id: "listen", label: "Lắng nghe mục tiêu chung của ba nhóm", branchFlags: { "zone2.heardAllGroups": true }, themeScores: { unity: 1 } },
        { id: "evidence", label: "Đối chiếu tư liệu và giữ kênh liên lạc", branchFlags: { "zone2.usedSharedEvidence": true }, themeScores: { unity: 1 } },
        { id: "divide", label: "Kích động nghi kỵ để giành phần hơn", branchFlags: { "zone2.stokedDivision": true }, endingRisks: { zone2: 1 }, corruption: 8 },
      ]),
    },
    {
      id: "emblem-verdict",
      title: "Huy hiệu Thống nhất",
      options: Object.freeze([
        { id: "unify", label: "Xác nhận nền tảng chung và thống nhất tổ chức", branchFlags: { "zone2.emblemStabilized": true, "zone2.badConfirmed": false }, themeScores: { unity: 1 } },
        { id: "repair-division", label: "Sửa sự chia rẽ bằng chứng cứ chung", branchFlags: { "zone2.repairedDivision": true, "zone2.badConfirmed": false }, endingRisks: { zone2: -1 }, themeScores: { unity: 1 }, corruption: 4 },
        { id: "confirm-factionalism", label: "Giữ chia rẽ để đổi lấy quyền lực riêng", branchFlags: { "zone2.badConfirmed": true }, endingRisks: { zone2: 2 }, corruption: 10 },
      ]),
    },
  ]),
  zone3a: Object.freeze([
    {
      id: "rally-strategy",
      title: "Chiến lược tập hợp lực lượng",
      options: Object.freeze([
        { id: "prepare-network", label: "Củng cố liên lạc và chuẩn bị lực lượng", branchFlags: { "zone3a.preparedNetwork": true }, themeScores: { solidarity: 1, timing: 1 } },
        { id: "coordinate-moment", label: "Phối hợp lực lượng để sẵn sàng nắm thời cơ", branchFlags: { "zone3a.coordinatedMoment": true }, themeScores: { solidarity: 1, timing: 1 } },
        { id: "fragment-rally", label: "Chia nhỏ lực lượng để mỗi nhóm tự lo an toàn", branchFlags: { "zone3a.fragmentedRally": true }, endingRisks: { zone3a: 1 }, corruption: 8 },
      ]),
    },
    {
      id: "august-verdict",
      title: "Thời cơ Tháng Tám",
      options: Object.freeze([
        { id: "protect-moment", label: "Giữ liên lạc và cùng hành động", branchFlags: { "zone3a.momentProtected": true, "zone3a.badConfirmed": false }, themeScores: { timing: 1 } },
        { id: "repair-fragment", label: "Hàn gắn sự phân tán trước khi thời cơ qua đi", branchFlags: { "zone3a.repairedRally": true, "zone3a.badConfirmed": false }, endingRisks: { zone3a: -1 }, themeScores: { solidarity: 1 }, corruption: 4 },
        { id: "confirm-delay", label: "Chấp nhận để lực lượng tan tác", branchFlags: { "zone3a.badConfirmed": true }, endingRisks: { zone3a: 2 }, corruption: 10 },
      ]),
    },
  ]),
  zone3b: Object.freeze([
    {
      id: "temporary-line-choice",
      title: "Giới tuyến tạm thời",
      options: Object.freeze([
        { id: "preserve-bonds", label: "Giữ liên lạc giữa đồng bào hai miền", branchFlags: { "zone3b.preservedBonds": true }, themeScores: { unity: 1 } },
        { id: "document-temporary-line", label: "Ghi rõ tính tạm thời của giới tuyến", branchFlags: { "zone3b.recordedTemporaryLine": true }, themeScores: { unity: 1 } },
        { id: "normalize-separation", label: "Xem chia cắt là điều bình thường", branchFlags: { "zone3b.normalizedSeparation": true }, endingRisks: { zone3b: 1 }, corruption: 8 },
      ]),
    },
    {
      id: "border-verdict",
      title: "Bản đồ hàn gắn",
      options: Object.freeze([
        { id: "restore-unity", label: "Giữ mục tiêu thống nhất và đời sống người dân", branchFlags: { "zone3b.unityRestored": true, "zone3b.badConfirmed": false }, themeScores: { unity: 1 } },
        { id: "repair-separation", label: "Sửa lựa chọn chia cắt bằng cách nối liên hệ", branchFlags: { "zone3b.repairedSeparation": true, "zone3b.badConfirmed": false }, endingRisks: { zone3b: -1 }, themeScores: { unity: 1 }, corruption: 4 },
        { id: "confirm-permanent-division", label: "Chấp nhận biến giới tuyến thành chia cắt lâu dài", branchFlags: { "zone3b.badConfirmed": true }, endingRisks: { zone3b: 2 }, corruption: 10 },
      ]),
    },
  ]),
  zone4: Object.freeze([
    {
      id: "production-choice",
      title: "Sổ phân phối",
      options: Object.freeze([
        { id: "open-ledger", label: "Công khai sổ sách và trả lại nguồn lực cho sản xuất", branchFlags: { "zone4.openedLedger": true }, themeScores: { renewal: 1 } },
        { id: "listen-farmers", label: "Lắng nghe người sản xuất", branchFlags: { "zone4.listenedFarmers": true }, themeScores: { renewal: 1 } },
        { id: "protect-private-privilege", label: "Che giấu đặc quyền để giữ lợi ích riêng", branchFlags: { "zone4.protectedPrivilege": true }, endingRisks: { zone4: 1 }, corruption: 8 },
      ]),
    },
    {
      id: "stalled-mechanism-choice",
      title: "Guồng máy đang kẹt",
      options: Object.freeze([
        { id: "remove-bottlenecks", label: "Bỏ thủ tục cản trở sản xuất", branchFlags: { "zone4.removedBottlenecks": true }, themeScores: { renewal: 1 } },
        { id: "test-local-initiative", label: "Thử quyền chủ động có trách nhiệm", branchFlags: { "zone4.testedLocalInitiative": true }, themeScores: { renewal: 1 } },
        { id: "freeze-production", label: "Giữ nguyên cơ chế dù sản xuất trì trệ", branchFlags: { "zone4.frozeProduction": true }, endingRisks: { zone4: 1 }, corruption: 8 },
      ]),
    },
    {
      id: "doi-moi-verdict",
      title: "Lời hứa Đổi Mới",
      options: Object.freeze([
        { id: "put-producers-first", label: "Đặt đời sống người sản xuất ở trung tâm", branchFlags: { "zone4.producersFirst": true, "zone4.badConfirmed": false }, themeScores: { renewal: 1 } },
        { id: "repair-privilege", label: "Sửa phần đặc quyền gây bế tắc", branchFlags: { "zone4.repairedPrivilege": true, "zone4.badConfirmed": false }, endingRisks: { zone4: -1 }, themeScores: { renewal: 1 }, corruption: 4 },
        { id: "confirm-stagnation", label: "Giữ đặc quyền và chấp nhận đình trệ", branchFlags: { "zone4.badConfirmed": true }, endingRisks: { zone4: 2 }, corruption: 10 },
      ]),
    },
  ]),
});
