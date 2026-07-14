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
});

export const NARRATIVE_CHOICE_DEFINITIONS = Object.freeze({
  zone1: Object.freeze([
    {
      id: "recruiter-offer",
      options: Object.freeze([
        { id: "refuse", branchFlags: { "zone1.rejectedRecruiter": true }, npcRelations: { "dock-workers": 1 }, themeScores: { direction: 1 } },
        { id: "accept", branchFlags: { "zone1.acceptedRecruiter": true }, npcRelations: { "dock-workers": -1 }, themeScores: { direction: -1 }, endingRisks: { zone1: 1 }, corruption: 8 },
        { id: "stall", branchFlags: { "zone1.soughtEvidence": true }, themeScores: { direction: 1 } },
      ]),
    },
    {
      id: "dock-workers",
      options: Object.freeze([
        { id: "protect", npcRelations: { "dock-workers": 1 }, themeScores: { solidarity: 1 }, corruption: 2 },
        { id: "evidence", branchFlags: { "zone1.usedEvidence": true }, npcRelations: { "dock-workers": 1 }, themeScores: { direction: 1 } },
        { id: "cargo-route", branchFlags: { "zone1.usedCargoRoute": true }, npcRelations: { "dock-workers": 1 }, themeScores: { solidarity: 1 } },
        { id: "abandon", npcRelations: { "dock-workers": -1 }, endingRisks: { zone1: 1 }, corruption: 6 },
      ]),
    },
    {
      id: "last-issue",
      options: Object.freeze([
        { id: "rescue", npcRelations: { "dock-workers": 1 }, themeScores: { solidarity: 1 }, corruption: 3 },
        { id: "divert", branchFlags: { "zone1.divertedPatrol": true }, themeScores: { direction: 1 } },
        { id: "return-after-compromise", branchFlags: { "zone1.recoveredTrust": true }, npcRelations: { "dock-workers": 1 }, endingRisks: { zone1: -1 }, corruption: 4 },
        { id: "surrender", branchFlags: { "zone1.lastIssueSurrendered": true }, npcRelations: { "dock-workers": -2 }, endingRisks: { zone1: 2 }, corruption: 12 },
      ]),
    },
    {
      id: "compass-verdict",
      options: Object.freeze([
        { id: "protect-common-path", branchFlags: { "zone1.compassRestored": true }, themeScores: { direction: 1 } },
        { id: "repair-harm", branchFlags: { "zone1.repairAccepted": true }, endingRisks: { zone1: -1 }, themeScores: { direction: 1 } },
        { id: "confirm-personal-gain", branchFlags: { "zone1.badConfirmed": true }, endingRisks: { zone1: 2 }, corruption: 10 },
      ]),
    },
  ]),
});
