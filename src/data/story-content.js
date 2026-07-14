export const TVA_EMPLOYEE_DIALOGUES = {
  introduction: {
    speaker: "David",
    lines: [
      { speaker: "David", text: "Hold it. You're not on today's intake list. Name, home timeline, and variant file number?" },
      { speaker: "Nhà du hành", text: "Khoan đã... anh đang nói gì vậy? Đây là đâu? Tôi vừa rơi xuyên qua sàn nhà hay sao?" },
      { speaker: "David", text: "Vietnamese? Right. Give me a second." },
      { speaker: "David", text: "Một giây. Tôi đang hiệu chỉnh bộ phiên dịch cá nhân sang tiếng Việt... Xong. Giờ cậu nghe rõ tôi chứ?" },
      { speaker: "Nhà du hành", text: "Rõ rồi. Anh vừa đổi ngôn ngữ của chính mình à?" },
      { speaker: "David", text: "Chính xác. Thiết bị này điều chỉnh ngôn ngữ đầu ra. Tôi là David, nhân viên phụ trách ca trực này." },
      { speaker: "Nhà du hành", text: "Vậy đây là đâu, David?" },
      { speaker: "David", text: "Đây là TVA. TVA là viết tắt của Time Variance Authority, tạm dịch là Cơ quan Quản lý Phương sai Thời gian." },
      { speaker: "David", text: "Chúng tôi theo dõi những nhánh lịch sử đi chệch khỏi dòng thời gian được ghi nhận. Cậu vừa rơi vào đây qua một khe nứt không-thời gian trái phép." },
      { speaker: "Nhà du hành", text: "Tôi không cố ý. Tôi chỉ muốn về nhà." },
      { speaker: "David", text: "Tôi có thể dò tọa độ gốc của cậu, nhưng cú rơi đã làm nhiễu hồ sơ. Giúp tôi ổn định các nhánh lịch sử đang lệch; đủ dữ liệu, tôi sẽ mở đường đưa cậu về." },
    ],
    choices: [
      { id: "accept-assignment", label: "Được, tôi sẽ giúp" },
      { id: "refuse-assignment", label: "Không, tôi muốn về ngay", tone: "danger" },
    ],
  },
  refusal: {
    speaker: "David",
    lines: [
      { speaker: "Nhà du hành", text: "Không. Tôi không biết anh là ai, cũng không định làm việc không công cho một văn phòng kỳ quặc." },
      { speaker: "David", text: "Tùy cậu. Nhưng nếu không hợp tác, tôi sẽ không nhập tọa độ và cũng không chỉ cách về nhà." },
      { speaker: "Nhà du hành", text: "Nơi này không có cửa sổ, cũng chẳng có lối ra... Anh đang nói tôi không còn lựa chọn nào khác à?" },
      { speaker: "David", text: "Trên giấy tờ thì cậu luôn có lựa chọn. Trên thực tế thì không." },
    ],
    choices: [
      { id: "forced-accept-assignment", label: "Được rồi, tôi đồng ý" },
    ],
  },
  dispatchPrompt: {
    speaker: "David",
    lines: [
      { speaker: "David", text: "Tốt. Hồ sơ đầu tiên đã nằm trên bàn. Cậu muốn xuất phát ngay chưa?" },
    ],
    choices: [
      { id: "dispatch-ready", label: "Tôi sẵn sàng" },
      { id: "dispatch-later", label: "Cho tôi thêm chút thời gian" },
    ],
  },
  portalActive: {
    speaker: "David",
    storyId: null,
    lines: [
      { speaker: "David", text: "Tọa độ vẫn ổn định. Cổng ở ngay bên cạnh; bước qua khi cậu sẵn sàng." },
    ],
  },
};

export const INTERACTION_DIALOGUES = {
  "le-paria-stack": {
    speaker: "Người liên lạc",
    lines: [
      "Những tờ Le Paria cần đến tay người lao động, nhưng bến cảng đang bị giám sát. Cậu sẽ tổ chức việc truyền báo thế nào?",
    ],
    choices: [
      { id: "protect", label: "Đi cùng công nhân, bảo vệ đường truyền" },
      { id: "evidence", label: "Dùng lời kể và tư liệu để thuyết phục" },
      { id: "cargo-route", label: "Giấu báo trong tuyến hàng hóa của bến cảng" },
      { id: "abandon", label: "Giữ báo lại để tránh rủi ro", tone: "danger" },
    ],
  },
  "tva-clerk-placeholder": TVA_EMPLOYEE_DIALOGUES.introduction,
  "old-peasant": {
    speaker: "Người nông dân",
    lines: [
      "Mưa dầm kéo dài, dân làng chỉ còn biết gồng mình sống qua ngày giữa cảnh đói nghèo.",
      "Bao phong trào yêu nước đã nổi lên rồi lụi tắt, vì vẫn thiếu một con đường đủ đúng để dẫn lối.",
      "Hãy ghi lại câu chuyện này. Nó cho thấy đất nước đã bế tắc ra sao trước năm 1930.",
    ],
  },
  "scholar-desk": {
    speaker: "Bàn học bỏ hoang",
    lines: [
      "Trên chiếc bàn đổ nát này từng có những người đi tìm lời giải cho vận mệnh dân tộc.",
      "Nhưng càng tìm, xã hội càng lún sâu vào khủng hoảng đường lối và chưa thấy lối ra rõ ràng.",
      "Một mảnh câu chuyện mới đã sẵn sàng để cậu mở lại trong cuốn sách của mình.",
    ],
  },
  "glowing-fragments": {
    speaker: "Mảnh tài liệu",
    lines: [
      "Cuối năm 1929, ba tổ chức cộng sản cùng hướng tới cách mạng nhưng vẫn hoạt động biệt lập, tiềm ẩn nguy cơ chia rẽ và công kích lẫn nhau.",
      "Ngày 3/2/1930 tại Hương Cảng, Nguyễn Ái Quốc đã chủ trì hội nghị hợp nhất, thống nhất các tổ chức thành Đảng Cộng sản Việt Nam.",
      "Từ đây, phong trào cách mạng có tổ chức thống nhất và một bàn chỉ nam lý luận rõ ràng để dẫn đường.",
    ],
  },
  "colonial-recruiter": {
    speaker: "Lính tuần tra Pháp",
    lines: [
      "Ta biết cậu đang giữ những tờ Le Paria. Đừng phí công mang chúng đến tay đám phu bến cảng.",
      "Theo ta, cậu sẽ có tiền bạc và được yên thân. Chỉ cần để những tờ báo ấy nằm im, không đến tay người lao động.",
      "Đây là lời dụ dỗ nguy hiểm, nhưng chưa phải điểm không thể quay lại: cậu còn có thể sửa sai bằng hành động tiếp theo.",
    ],
    choices: [
      { id: "refuse", label: "Từ chối, tiếp tục truyền báo" },
      { id: "stall", label: "Kéo dài cuộc nói chuyện để quan sát tuần tra" },
      { id: "accept", label: "Nhận tiền, hứa sẽ giữ báo lại", tone: "danger" },
    ],
  },
  "red-compass-reward": {
    speaker: "Chiếc La Bàn Đỏ",
    lines: [
      "Con đường chung chỉ bền khi người đi không đổi nó lấy lợi ích riêng. Hãy quyết định cách cậu khép lại chuyến đi này.",
    ],
    choices: [
      { id: "protect-common-path", label: "Trao báo và giữ con đường chung" },
      { id: "repair-harm", label: "Thừa nhận sai lầm, sửa chữa với người lao động" },
      { id: "confirm-personal-gain", label: "Giữ lợi ích riêng dù con đường bị lệch", tone: "danger" },
    ],
  },
  "split-blade": {
    speaker: "Vết nứt trong kho lưu trữ",
    lines: [
      "Những khác biệt giữa các tổ chức đang bị đẩy thành nghi kỵ. Cậu sẽ dùng chúng để chia rẽ hay tìm một nền tảng chung?",
    ],
    choices: [
      { id: "listen", label: "Lắng nghe mục tiêu chung của cả ba nhóm" },
      { id: "evidence", label: "Đối chiếu tài liệu và giữ kênh liên lạc" },
      { id: "divide", label: "Kích động nghi kỵ để giành phần hơn", tone: "danger" },
    ],
  },
  "unity-round-table": {
    speaker: "Huy hiệu Thống nhất",
    lines: [
      "Ba nguồn tư liệu chỉ phát sáng khi cùng hướng về một tổ chức thống nhất. Cậu sẽ chốt hồ sơ theo con đường nào?",
    ],
    choices: [
      { id: "unify", label: "Xác nhận nền tảng chung và thống nhất tổ chức" },
      { id: "repair-division", label: "Sửa lại sự chia rẽ bằng chứng cứ chung" },
      { id: "confirm-factionalism", label: "Giữ chia rẽ để đổi lấy quyền lực riêng", tone: "danger" },
    ],
  },
  "vietminh-rally": {
    speaker: "Cán bộ Mặt trận",
    lines: [
      "Một mặt trận rộng rãi chỉ có ý nghĩa khi các lực lượng cùng được lắng nghe, tổ chức và chuẩn bị. Cậu sẽ giữ cuộc tập hợp theo hướng nào?",
    ],
    choices: [
      { id: "prepare-network", label: "Củng cố liên lạc, chuẩn bị lực lượng và bảo vệ dân" },
      { id: "coordinate-moment", label: "Phối hợp các lực lượng để sẵn sàng nắm thời cơ" },
      { id: "fragment-rally", label: "Chia nhỏ lực lượng để mỗi nhóm tự lo an toàn", tone: "danger" },
    ],
  },
  "august-verdict": {
    speaker: "Sợi Chỉ Đỏ Việt Minh",
    lines: [
      "Những sợi chỉ chỉ thành một tấm vải khi được buộc lại đúng lúc. Cậu sẽ chốt cách gìn giữ thời cơ Tháng Tám?",
    ],
    choices: [
      { id: "protect-moment", label: "Giữ liên lạc và đưa lực lượng cùng hành động" },
      { id: "repair-fragment", label: "Hàn gắn sự phân tán trước khi thời cơ qua đi" },
      { id: "confirm-delay", label: "Chấp nhận để lực lượng tan tác và bỏ lỡ thời cơ", tone: "danger" },
    ],
  },
  "temporary-line-choice": {
    speaker: "Người đưa bản thảo",
    lines: [
      "Đường phân giới quân sự tạm thời không phải là biên giới quốc gia. Cậu sẽ đọc bản thảo này với trách nhiệm nào?",
    ],
    choices: [
      { id: "preserve-bonds", label: "Giữ liên lạc giữa đồng bào hai miền" },
      { id: "document-temporary-line", label: "Ghi rõ tính tạm thời để không đánh tráo ý nghĩa" },
      { id: "normalize-separation", label: "Xem chia cắt là điều bình thường để đổi lấy yên ổn", tone: "danger" },
    ],
  },
  "border-verdict": {
    speaker: "Bản đồ hàn gắn",
    lines: [
      "Những mảnh bản đồ chỉ khớp lại khi khát vọng thống nhất không bị bỏ quên. Cậu sẽ đóng hồ sơ theo hướng nào?",
    ],
    choices: [
      { id: "restore-unity", label: "Giữ mục tiêu thống nhất và cuộc sống người dân làm trung tâm" },
      { id: "repair-separation", label: "Sửa lại lựa chọn chia cắt bằng cách nối các mối liên hệ" },
      { id: "confirm-permanent-division", label: "Chấp nhận biến giới tuyến tạm thời thành chia cắt lâu dài", tone: "danger" },
    ],
  },
  "production-choice": {
    speaker: "Sổ phân phối",
    lines: [
      "Một cơ chế có thể phục vụ đời sống hoặc nuôi đặc quyền. Khi kho hàng và sổ sách không còn khớp, cậu sẽ làm gì trước?",
    ],
    choices: [
      { id: "open-ledger", label: "Công khai sổ sách và trả lại nguồn lực cho sản xuất" },
      { id: "listen-farmers", label: "Lắng nghe người sản xuất về điều gì đang làm họ bế tắc" },
      { id: "protect-private-privilege", label: "Che giấu đặc quyền để giữ lợi ích riêng", tone: "danger" },
    ],
  },
  "stalled-mechanism-choice": {
    speaker: "Bàn tem phiếu cũ",
    lines: [
      "Hàng rào thủ tục đang khiến nông hộ không thể chủ động sản xuất. Cậu sẽ tháo nút thắt hay giữ guồng máy đứng yên?",
    ],
    choices: [
      { id: "remove-bottlenecks", label: "Bỏ thủ tục cản trở và để nguồn lực đến nơi cần thiết" },
      { id: "test-local-initiative", label: "Thử quyền chủ động có trách nhiệm tại địa phương" },
      { id: "freeze-production", label: "Giữ nguyên cơ chế dù sản xuất tiếp tục trì trệ", tone: "danger" },
    ],
  },
  "doi-moi-verdict": {
    speaker: "Bánh răng Đổi Mới",
    lines: [
      "Đổi mới chỉ vận hành khi sự chủ động của người sản xuất đi cùng trách nhiệm và minh bạch. Cậu sẽ chốt hướng nào cho hồ sơ?",
    ],
    choices: [
      { id: "put-producers-first", label: "Đặt đời sống và quyền chủ động của người sản xuất ở trung tâm" },
      { id: "repair-privilege", label: "Sửa phần đặc quyền đã tạo ra để guồng máy vận hành công bằng" },
      { id: "confirm-stagnation", label: "Giữ đặc quyền và chấp nhận để guồng máy tiếp tục đình trệ", tone: "danger" },
    ],
  },
  "guiding-compass": {
    speaker: "Chiếc la bàn",
    lines: [
      "Không có bàn chỉ nam, con thuyền cách mạng chỉ xoay vòng giữa bóng tối và nghi ngờ.",
      "Sự ra đời của Đảng đã chấm dứt cơn khủng hoảng đường lối và mở ra hướng đi rõ ràng cho dân tộc.",
      "Câu chuyện này đã được đánh dấu. Cậu có thể mở sách để thuyết trình lại bất cứ lúc nào.",
    ],
  },
  "united-gathering": {
    speaker: "Khối đoàn kết",
    lines: [
      "Từ Hội nghị Trung ương 8 năm 1941, Việt Minh ra đời để quy tụ mọi tầng lớp nhân dân vào mục tiêu giải phóng dân tộc.",
      "Khi thời cơ đến vào tháng Tám năm 1945, Đảng đã phát động tổng khởi nghĩa với tinh thần tập trung, thống nhất và kịp thời.",
      "Hãy ghi nhớ khoảnh khắc này. Đây là chương về sức mạnh quần chúng và kỳ tích Cách mạng Tháng Tám.",
    ],
  },
  "broken-bridge": {
    speaker: "Giới tuyến 17",
    lines: [
      "Sau Hiệp định Giơnevơ năm 1954, đất nước tạm thời bị chia cắt hai miền ở vĩ tuyến 17, còn miền Nam đứng trước âm mưu trở thành thuộc địa kiểu mới của đế quốc Mỹ.",
      "Đại hội III của Đảng năm 1960 đã đề ra một đường lối chiến lược sáng tạo: xây dựng chủ nghĩa xã hội ở miền Bắc, đồng thời tiến hành cách mạng dân tộc dân chủ nhân dân ở miền Nam.",
      "Cả hai nhiệm vụ ấy đều hướng về mục tiêu chung duy nhất: giải phóng miền Nam, thống nhất đất nước.",
    ],
  },
  "grand-tree": {
    speaker: "Mùa xuân Đổi Mới",
    lines: [
      "Sau năm 1975, đất nước thống nhất nhưng phải đối mặt với hậu quả chiến tranh và cuộc khủng hoảng kinh tế - xã hội kéo dài dưới cơ chế tập trung quan liêu, bao cấp.",
      "Đại hội VI của Đảng năm 1986 đã thể hiện bản lĩnh của người cầm lái khi dám nhìn thẳng vào sự thật và khởi xướng công cuộc Đổi Mới toàn diện, trọng tâm là đổi mới tư duy kinh tế.",
      "Từ đây, Việt Nam từng bước vượt qua khủng hoảng, mở rộng hội nhập và hướng tới mục tiêu dân giàu, nước mạnh, dân chủ, công bằng, văn minh.",
    ],
  },
};

export const RELIC_DEFINITIONS = {
  "red-compass": {
    label: "Chiếc La Bàn Đỏ",
    source: "sau khi phát báo Người Cùng Khổ cho công nhân bến cảng",
    storyId: "relic-red-compass",
  },
  "unified-emblem": {
    label: "Huy hiệu Búa Liềm thống nhất",
    source: "đặt đủ ba mảnh hợp nhất lên bàn tròn",
    storyId: "relic-unified-emblem",
  },
  "vietminh-thread": {
    label: "Sợi chỉ đỏ Việt Minh",
    source: "quy tụ đủ khối đại đoàn kết toàn dân",
    storyId: "relic-vietminh-thread",
  },
  "healed-map": {
    label: "Bản đồ Vĩ tuyến 17 hàn gắn",
    source: "giải phóng các ấp chiến lược và đẩy lùi thế lực chia cắt",
    storyId: "relic-healed-map",
  },
  "doi-moi-gear": {
    label: "Bánh răng Đổi Mới",
    source: "phá hàng rào bao cấp và phát Khoán 10 cho nông dân",
    storyId: "relic-doi-moi-gear",
  },
};

export const RELIC_STORY_SLIDES = {
  "red-compass": {
    levelId: "village",
    kicker: "Tín vật 1/5 - Khu 1",
    title: "CHIẾC LA BÀN ĐỎ",
    text:
      "1. Nhiệm vụ mở khóa\nNhận Le Paria ở chồng báo, đưa báo cho 3 công nhân bến cảng, rồi quay lại nhận Chiếc La Bàn Đỏ.\n\n2. Mô tả vật phẩm\nMột chiếc la bàn cổ phát ra ánh sáng đỏ rực rỡ, xuyên thủng lớp sương mù dày đặc của mê cung.\n\n3. Hồ sơ lịch sử\nCuối thế kỷ XIX, dưới ách thống trị của thực dân Pháp, Việt Nam biến thành một nước thuộc địa nửa phong kiến. Dù có truyền thống yêu nước, các phong trào từ Cần Vương đến khuynh hướng tư sản như Đông Du, Đông Kinh Nghĩa Thục đều thất bại do thiếu đường lối đúng đắn. Lịch sử dân tộc rơi vào khủng hoảng đường lối cứu nước.\n\n4. Giá trị chân lý\nNguyễn Ái Quốc đã tìm ra con đường cách mạng vô sản. Câu nói \"Đảng mà không có chủ nghĩa cũng như người không có trí khôn, tàu không có bàn chỉ nam\" giúp giải thích biểu tượng la bàn: Chủ nghĩa Mác - Lênin là kim chỉ nam đưa dân tộc thoát khỏi màn đêm nô lệ.\n\n5. Câu chốt thuyết trình\nChiếc la bàn không chỉ là vật phẩm chỉ đường trong game, mà là hình ảnh của đường lối đúng đắn trong lịch sử.",
    caption: "Từ bế tắc đường lối đến kim chỉ nam Mác - Lênin",
    gallery: [
      {
        src: "assets/story/level1/colonial-exploitation.png",
        alt: "Ng\u01b0\u1eddi d\u00e2n Vi\u1ec7t Nam lao \u0111\u1ed9ng kh\u1ed5 c\u1ef1c d\u01b0\u1edbi \u00e1ch b\u00f3c l\u1ed9t c\u1ee7a th\u1ef1c d\u00e2n Ph\u00e1p",
        caption: "Ng\u01b0\u1eddi d\u00e2n Vi\u1ec7t Nam b\u1ecb b\u00f3c l\u1ed9t n\u1eb7ng n\u1ec1 d\u01b0\u1edbi \u00e1ch th\u1ed1ng tr\u1ecb c\u1ee7a th\u1ef1c d\u00e2n Ph\u00e1p.",
      },
      {
        src: "assets/story/level1/patriotic-scholars.png",
        alt: "Hai nh\u00e0 c\u00e1ch m\u1ea1ng Phan B\u1ed9i Ch\u00e2u v\u00e0 Phan Ch\u00e2u Trinh",
        caption: "Hai nh\u00e0 y\u00eau n\u01b0\u1edbc Phan B\u1ed9i Ch\u00e2u v\u00e0 Phan Ch\u00e2u Trinh ti\u00eau bi\u1ec3u cho n\u1ed7 l\u1ef1c t\u00ecm \u0111\u01b0\u1eddng c\u1ee9u n\u01b0\u1edbc \u0111\u1ea7u th\u1ebf k\u1ef7 XX.",
      },
      {
        src: "assets/story/level1/duong-kach-menh.webp",
        alt: "T\u00e1c ph\u1ea9m \u0110\u01b0\u1eddng K\u00e1ch M\u1ec7nh",
        caption: "T\u00e1c ph\u1ea9m \u0110\u01b0\u1eddng K\u00e1ch M\u1ec7nh \u0111\u1eb7t n\u1ec1n t\u1ea3ng l\u00fd lu\u1eadn, m\u1edf ra kim ch\u1ec9 nam cho con \u0111\u01b0\u1eddng c\u1ee7a c\u00e1ch m\u1ea1ng Vi\u1ec7t Nam.",
      },
    ],
    art: "compass",
  },
  "unified-emblem": {
    levelId: "archive",
    kicker: "Tín vật 2/5 - Khu 2",
    title: "HUY HIỆU BÚA LIỀM THỐNG NHẤT",
    text:
      "1. Nhiệm vụ mở khóa\nNói chuyện đủ 3 nhóm west, east và north, sau đó tới bàn tròn để lấy Huy hiệu Búa Liềm Thống Nhất.\n\n2. Mô tả vật phẩm\nBa mảnh ghép kim loại tản mát bỗng bị hút chặt vào nhau bằng một từ trường mạnh mẽ, đúc thành biểu tượng Búa Liềm rực sáng.\n\n3. Hồ sơ lịch sử\nCuối năm 1929, phong trào đấu tranh lên cao dẫn đến sự ra đời của ba tổ chức cộng sản hoạt động biệt lập: Đông Dương Cộng sản Đảng, An Nam Cộng sản Đảng và Đông Dương Cộng sản Liên đoàn. Tuy nhiên, sự biệt lập này có nguy cơ gây chia rẽ, công kích lẫn nhau và làm suy yếu phong trào.\n\n4. Sự kiện bước ngoặt\nNgày 6/1/1930 tại Hương Cảng, Nguyễn Ái Quốc chủ trì hội nghị, yêu cầu bỏ thành kiến, thành thật hợp tác để hợp nhất ba tổ chức thành Đảng Cộng sản Việt Nam. Từ đó, phong trào cách mạng có một đội tiên phong thống nhất lãnh đạo.\n\n5. Câu chốt thuyết trình\nHuy hiệu thể hiện sức mạnh của sự thống nhất: những mảnh rời rạc chỉ trở thành lực lượng lịch sử khi được quy tụ chung một tổ chức.",
    caption: "Ba tổ chức rời rạc hợp nhất thành một đội tiên phong lãnh đạo cách mạng",
    gallery: [
      {
        src: "assets/story/level2/party-unification-1930.webp",
        alt: "H\u1ee3p nh\u1ea5t c\u00e1c t\u1ed5 ch\u1ee9c c\u1ed9ng s\u1ea3n n\u0103m 1930",
        caption: "H\u1ed9i ngh\u1ecb h\u1ee3p nh\u1ea5t c\u00e1c t\u1ed5 ch\u1ee9c c\u1ed9ng s\u1ea3n n\u0103m 1930 d\u01b0\u1edbi s\u1ef1 ch\u1ee7 tr\u00ec c\u1ee7a Nguy\u1ec5n \u00c1i Qu\u1ed1c.",
      },
    ],
    art: "compass",
  },
  "vietminh-thread": {
    levelId: "crossroads",
    kicker: "Tín vật 3/5 - Khu 3A",
    title: "SỢI CHỈ ĐỎ VIỆT MINH",
    text:
      "1. Nhiệm vụ mở khóa\nMời đủ 4 lực lượng nông dân, công nhân, trí thức và tư sản dân tộc, rồi gặp cán bộ Việt Minh để lấy Sợi Chỉ Đỏ Việt Minh.\n\n2. Mô tả vật phẩm\nMột sợi dây thừng rực lửa kết nối các nhân vật đang đứng rải rác trên quảng trường thành một khối vững chắc.\n\n3. Hồ sơ lịch sử\nChủ nghĩa Mác - Lênin khẳng định cách mạng là sự nghiệp của quần chúng nhân dân. Quần chúng thiếu tổ chức chỉ là những đốm lửa lẻ tẻ. Tháng 5/1941, tại Hội nghị Trung ương 8, Đảng quyết định thành lập Mặt trận Việt Minh để quy tụ sức mạnh đại đoàn kết toàn dân tộc, đặt nhiệm vụ giải phóng dân tộc lên cao nhất.\n\n4. Chớp thời cơ ngàn năm\nKhi phát xít Nhật đầu hàng Đồng minh tháng 8/1945, Đảng đã chớp đúng thời cơ, phát động Tổng khởi nghĩa theo tinh thần tập trung, thống nhất và kịp thời, lập ra nước Việt Nam Dân chủ Cộng hòa.\n\n5. Câu chốt thuyết trình\nSợi chỉ đỏ cho thấy quần chúng khi được tổ chức sẽ trở thành sức mạnh quyết định của cách mạng.",
    caption: "Mặt trận Việt Minh quy tụ sức mạnh toàn dân cho Cách mạng Tháng Tám",
    gallery: [
      {
        src: "assets/story/level3/viet-minh-1941.png",
        alt: "M\u1eb7t tr\u1eadn Vi\u1ec7t Nam \u0110\u1ed9c l\u1eadp \u0110\u1ed3ng minh th\u00e0nh l\u1eadp n\u0103m 1941",
        caption: "M\u1eb7t tr\u1eadn Vi\u1ec7t Nam \u0110\u1ed9c l\u1eadp \u0110\u1ed3ng minh (Vi\u1ec7t Minh) th\u00e0nh l\u1eadp n\u0103m 1941, quy t\u1ee5 s\u1ee9c m\u1ea1nh \u0111\u1ea1i \u0111o\u00e0n k\u1ebft to\u00e0n d\u00e2n t\u1ed9c.",
      },
      {
        src: "assets/story/level3/august-revolution-1945.webp",
        alt: "M\u00edt tinh t\u1ea1i Qu\u1ea3ng tr\u01b0\u1eddng Ba \u0110\u00ecnh ng\u00e0y 2 th\u00e1ng 9 n\u0103m 1945",
        caption: "Cu\u1ed9c m\u00edt tinh t\u1ea1i Qu\u1ea3ng tr\u01b0\u1eddng Ba \u0110\u00ecnh ng\u00e0y 2/9/1945, d\u1ea5u m\u1ed1c khai sinh n\u01b0\u1edbc Vi\u1ec7t Nam D\u00e2n ch\u1ee7 C\u1ed9ng h\u00f2a.",
      },
    ],
    art: "crowd",
  },
  "healed-map": {
    levelId: "crossroads",
    kicker: "Tín vật 4/5 - Khu 3B",
    title: "BẢN ĐỒ VIỆT NAM THỐNG NHẤT",
    text:
      "1. Nhiệm vụ mở khóa\nPhá 3 ấp chiến lược, đánh bại bộ máy áp bức miền Nam, rồi gặp chỉ huy kháng chiến để lấy Bản đồ Vĩ tuyến 17 hàn gắn.\n\n2. Mô tả vật phẩm\nTấm bản đồ bị xé rách làm đôi tại vĩ tuyến 17 được khâu liền lại bằng ánh sáng vàng, xua tan bóng đen của sự chia cắt.\n\n3. Hồ sơ lịch sử\nSau Hiệp định Giơnevơ năm 1954, đất nước tạm thời bị chia cắt tại vĩ tuyến 17. Đế quốc Mỹ âm mưu hất cẳng Pháp, biến miền Nam thành thuộc địa kiểu mới và chia cắt vĩnh viễn nước ta.\n\n4. Đường lối sáng tạo\nĐại hội III của Đảng năm 1960 xác định đường lối tiến hành đồng thời cách mạng xã hội chủ nghĩa ở miền Bắc, làm hậu phương lớn, và cách mạng dân tộc dân chủ ở miền Nam, làm tiền tuyến lớn.\n\n5. Bản anh hùng ca\nNhờ kết hợp hậu phương và tiền tuyến, dân tộc ta đánh bại các chiến lược chiến tranh của Mỹ, làm nên Đại thắng Mùa Xuân 1975, đưa non sông thu về một mối.",
    caption: "Từ vĩ tuyến chia cắt đến khát vọng thống nhất đất nước",
    gallery: [
      {
        src: "assets/story/level3/vietnam-divided-17th-parallel.png",
        alt: "Vi\u1ec7t Nam b\u1ecb chia c\u1eaft hai mi\u1ec1n t\u1ea1i v\u0129 tuy\u1ebfn 17",
        caption: "Vi\u1ec7t Nam t\u1ea1m th\u1eddi b\u1ecb chia c\u1eaft hai mi\u1ec1n t\u1ea1i v\u0129 tuy\u1ebfn 17 sau Hi\u1ec7p \u0111\u1ecbnh Gi\u01a1nev\u01a1 n\u0103m 1954.",
      },
      {
        src: "assets/story/level3/reunification-1975.png",
        alt: "Xe t\u0103ng h\u00fac \u0111\u1ed5 c\u1ed5ng Dinh \u0110\u1ed9c L\u1eadp ng\u00e0y 30 th\u00e1ng 4 n\u0103m 1975",
        caption: "Xe t\u0103ng ti\u1ebfn v\u00e0o Dinh \u0110\u1ed9c L\u1eadp ng\u00e0y 30/4/1975, bi\u1ec3u t\u01b0\u1ee3ng cho \u0111\u1ea1i th\u1eafng m\u00f9a xu\u00e2n v\u00e0 s\u1ef1 nghi\u1ec7p th\u1ed1ng nh\u1ea5t \u0111\u1ea5t n\u01b0\u1edbc.",
      },
    ],
    art: "bridge",
  },
  "doi-moi-gear": {
    levelId: "spring",
    kicker: "Tín vật 5/5 - Khu 4",
    title: "BÁNH RĂNG ĐỔI MỚI",
    text:
      "1. Nhiệm vụ mở khóa\nPhá 3 hàng rào bao cấp, trao Khoán 10 cho 3 nông dân, rồi gặp nhà lãnh đạo Đổi Mới để nhận Bánh răng Đổi Mới.\n\n2. Mô tả vật phẩm\nBánh răng tượng trưng cho guồng máy kinh tế được khởi động lại: từ trì trệ, bao cấp sang tự chủ sản xuất và đổi mới tư duy.\n\n3. Hồ sơ lịch sử\nSau chiến tranh, đất nước lâm vào khủng hoảng kinh tế - xã hội trầm trọng do hậu quả chiến tranh và cơ chế tập trung quan liêu, bao cấp. Lạm phát năm 1986 lên tới 774,7%, đời sống nhân dân gặp nhiều khó khăn.\n\n4. Bước ngoặt Đổi Mới\nĐại hội VI năm 1986 dũng cảm nhìn thẳng vào sự thật, khởi xướng đường lối Đổi Mới toàn diện, trọng tâm là đổi mới tư duy kinh tế, giải phóng sức sản xuất và mở đường hội nhập.\n\n5. Câu chốt thuyết trình\nBánh răng Đổi Mới cho thấy bản lĩnh tự sửa mình và năng lực lãnh đạo đất nước vượt qua khủng hoảng để phát triển.",
    caption: "Đại hội VI mở ra công cuộc Đổi Mới toàn diện",
    gallery: [
      {
        src: "assets/story/level4/bao-cap-before-1986.png",
        alt: "Khung cảnh thời bao cấp trước năm 1986",
        caption: "Khung cảnh thời bao cấp trước năm 1986 gợi lại đời sống nhiều thiếu thốn, xếp hàng và tem phiếu kéo dài.",
      },
      {
        src: "assets/story/level4/dai-hoi-vi-1986.png",
        alt: "Đại hội Đảng VI năm 1986",
        caption: "Đại hội Đảng VI năm 1986 mở ra bước ngoặt Đổi Mới, đặt nền tảng để đất nước thoát khỏi khủng hoảng và phát triển.",
      },
    ],
    art: "spring",
  },
};

const RELIC_STORY_PRESENTATION_UPDATES = {
  "red-compass": {
    text:
      "Đầu thế kỷ XX, các phong trào yêu nước lần lượt bế tắc vì thiếu đường lối đúng đắn. Nguyễn Ái Quốc tìm thấy con đường cách mạng vô sản, biến chủ nghĩa Mác - Lênin thành kim chỉ nam soi đường giải phóng dân tộc.",
    gallery: [
      {
        src: "assets/story/level1/colonial-exploitation.png",
        alt: "Người dân Việt Nam lao động khổ cực dưới ách bóc lột của thực dân Pháp",
        caption: "Đời sống thuộc địa dưới ách bóc lột của thực dân Pháp.",
      },
      {
        src: "assets/story/level1/patriotic-scholars.png",
        alt: "Hai nhà yêu nước Phan Bội Châu và Phan Châu Trinh",
        caption: "Các sĩ phu yêu nước đầu thế kỷ XX nỗ lực tìm đường cứu nước.",
      },
      {
        src: "assets/story/level1/duong-kach-menh.webp",
        alt: "Tác phẩm Đường Kách Mệnh",
        caption: "Đường Kách Mệnh đặt nền lý luận cho con đường cách mạng Việt Nam.",
      },
    ],
  },
  "unified-emblem": {
    text:
      "Cuối năm 1929, ba tổ chức cộng sản ra đời nhưng hoạt động riêng rẽ, có nguy cơ chia rẽ phong trào. Hội nghị hợp nhất đầu năm 1930 do Nguyễn Ái Quốc chủ trì đã lập nên Đảng Cộng sản Việt Nam, tạo một đội tiên phong thống nhất.",
    gallery: [
      {
        src: "assets/story/level2/party-unification-1930.webp",
        alt: "Hợp nhất các tổ chức cộng sản năm 1930",
        caption: "Hội nghị hợp nhất năm 1930 tạo nên một đội tiên phong thống nhất.",
      },
    ],
  },
  "vietminh-thread": {
    text:
      "Năm 1941, Mặt trận Việt Minh ra đời để quy tụ sức mạnh toàn dân, đặt nhiệm vụ giải phóng dân tộc lên hàng đầu. Khi thời cơ tháng 8/1945 đến, khối đoàn kết ấy trở thành lực lượng quyết định giành chính quyền.",
    gallery: [
      {
        src: "assets/story/level3/viet-minh-1941.png",
        alt: "Mặt trận Việt Nam Độc lập Đồng minh thành lập năm 1941",
        caption: "Việt Minh quy tụ sức mạnh đại đoàn kết toàn dân tộc.",
      },
      {
        src: "assets/story/level3/august-revolution-1945.webp",
        alt: "Mít tinh tại Quảng trường Ba Đình ngày 2 tháng 9 năm 1945",
        caption: "Cách mạng Tháng Tám mở ra kỷ nguyên độc lập cho dân tộc.",
      },
    ],
  },
  "healed-map": {
    text:
      "Sau năm 1954, đất nước tạm thời bị chia cắt tại vĩ tuyến 17. Đường lối cách mạng xác định miền Bắc là hậu phương lớn, miền Nam là tiền tuyến lớn; sức mạnh cả nước đã hội tụ trong Đại thắng mùa Xuân 1975, thống nhất non sông.",
    gallery: [
      {
        src: "assets/story/level3/vietnam-divided-17th-parallel.png",
        alt: "Việt Nam bị chia cắt hai miền tại vĩ tuyến 17",
        caption: "Vĩ tuyến 17 trở thành giới tuyến chia cắt tạm thời sau năm 1954.",
      },
      {
        src: "assets/story/level3/reunification-1975.png",
        alt: "Xe tăng húc đổ cổng Dinh Độc Lập ngày 30 tháng 4 năm 1975",
        caption: "Đại thắng 30/4/1975 khép lại chiến tranh, thống nhất đất nước.",
      },
    ],
  },
  "doi-moi-gear": {
    text:
      "Sau chiến tranh, cơ chế bao cấp khiến kinh tế trì trệ và đời sống khó khăn. Đại hội VI năm 1986 khởi xướng Đổi Mới, giải phóng sức sản xuất, đổi mới tư duy kinh tế và mở đường để đất nước phát triển, hội nhập.",
    gallery: [
      {
        src: "assets/story/level4/bao-cap-before-1986.png",
        alt: "Khung cảnh thời bao cấp trước năm 1986",
        caption: "Thời bao cấp gợi lại đời sống thiếu thốn, tem phiếu và xếp hàng.",
      },
      {
        src: "assets/story/level4/dai-hoi-vi-1986.png",
        alt: "Đại hội Đảng VI năm 1986",
        caption: "Đại hội VI năm 1986 mở ra công cuộc Đổi Mới toàn diện.",
      },
    ],
  },
};

for (const [itemId, update] of Object.entries(RELIC_STORY_PRESENTATION_UPDATES)) {
  Object.assign(RELIC_STORY_SLIDES[itemId], update);
}

export const ENDING_DEFINITIONS = {
  good: {
    title: "GOOD ENDING: ĐẠI THẮNG & PHÁT TRIỂN",
    copy:
      "Dưới sự lãnh đạo của Đảng Cộng sản Việt Nam, dân tộc ta đã giành lại độc lập, thống nhất và đang vững bước trên con đường dân giàu, nước mạnh. Sự lãnh đạo của Đảng là nhân tố hàng đầu bảo đảm mọi thắng lợi.",
    artSrc: "assets/environment/generated-worlds/good-ending-hero.webp",
    artAlt: "Khung cảnh kết thúc tốt với quảng trường đoàn kết, ngọn đuốc rực sáng, ruộng lúa và công trình hiện đại.",
  },
  bad: {
    title: "BAD ENDING: MẤT NƯỚC / CHỆCH HƯỚNG",
    copy:
      "Không có ngọn cờ dẫn đường đúng đắn và bản lĩnh kiên định, lịch sử dân tộc đã rẽ sang một bóng đen nô lệ và chia cắt mới. Đất nước tiếp tục bị các thế lực thù địch thao túng hoặc chệch khỏi con đường xã hội chủ nghĩa.",
    artSrc: "assets/environment/generated-worlds/bad-ending-hero.webp",
    artAlt: "Khung cảnh kết thúc xấu với xã hội đen tối hiện đại, trụ Tha hóa, chia rẽ và lệ thuộc.",
  },
  "zone1-lost-compass": {
    title: "NHÁNH GIẢ ĐỊNH: CON TÀU KHÔNG LA BÀN",
    copy:
      "Khi những lời thức tỉnh bị đổi lấy lợi ích riêng, phong trào phản kháng vẫn tồn tại nhưng khó tìm được một đường hướng chung. Đây là nhánh giả định: đất nước không ngừng đấu tranh, song con đường cứu nước bị kéo dài trong bế tắc.",
    artSrc: "assets/environment/generated-worlds/zone1-lost-compass-ending.png",
    artAlt: "Nhánh giả định về phong trào bị mất phương hướng, với người lao động tản mác trước một cổng thời gian tối.",
  },
  "zone2-fading-fires": {
    title: "NHÁNH GIẢ ĐỊNH: BA NGỌN LỬA LỤI TÀN",
    copy:
      "Khi nghi kỵ được nuôi lớn thay vì được hóa giải, những tổ chức cùng hướng về độc lập không tìm được tiếng nói chung. Đây là nhánh giả định: khát vọng giải phóng vẫn còn, nhưng sức mạnh liên kết bị phân tán, khiến con đường thành lập một tổ chức thống nhất bị chậm lại.",
    artSrc: "assets/environment/generated-worlds/zone2-fading-fires-ending.png",
    artAlt: "Nhánh giả định về một cuộc hội họp tan vỡ trong đêm mưa, với ba ngọn đèn dầu tách rời trên bàn tròn.",
  },
  "zone3a-missed-moment": {
    title: "NHÁNH GIẢ ĐỊNH: THỜI CƠ THÁNG TÁM VỤT QUA",
    copy:
      "Khi sự chuẩn bị bị phân tán và liên lạc bị bỏ mặc, một thời cơ có thể đi qua trước khi các lực lượng kịp cùng hành động. Đây là nhánh giả định: khát vọng độc lập không biến mất, nhưng con đường giành chính quyền bị kéo dài bởi sự rời rạc và chậm trễ.",
    artSrc: "assets/environment/generated-worlds/zone3a-missed-moment-ending.png",
    artAlt: "Nhánh giả định về một cuộc chuẩn bị bị bỏ dở trong căn nhà cộng đồng nông thôn giữa cơn mưa, với sợi chỉ đỏ tháo rời trên bản đồ.",
  },
  "zone3b-divided-border": {
    title: "NHÁNH GIẢ ĐỊNH: VĨ TUYẾN THÀNH BIÊN GIỚI",
    copy:
      "Khi một giới tuyến quân sự tạm thời bị coi như ranh giới cố định, những mối liên hệ giữa đồng bào hai miền bị đặt trước nguy cơ đứt đoạn. Đây là nhánh giả định: sự chia cắt bị kéo dài trong đời sống thường ngày, thay vì được nhìn nhận là một tình thế cần vượt qua.",
    artSrc: "assets/environment/generated-worlds/zone3b-divided-border-ending.png",
    artAlt: "Nhánh giả định về hai mái nhà bên một con sông và cây cầu gãy ở giữa, với sợi chỉ đỏ đứt trên bản đồ.",
  },
  "zone4-stalled-machine": {
    title: "NHÁNH GIẢ ĐỊNH: CỖ MÁY ĐỨNG IM",
    copy:
      "Khi đặc quyền được bảo vệ và những nút thắt cũ không được tháo gỡ, sức sản xuất không thể tự mở đường. Đây là nhánh giả định: người dân vẫn lao động, nhưng cơ hội đổi mới bị trì hoãn bởi một guồng máy không chịu sửa mình.",
    artSrc: "assets/environment/generated-worlds/zone4-stalled-machine-ending.png",
    artAlt: "Nhánh giả định về một trạm nước và bánh răng ngừng quay bên ruộng đồng, với sổ phân phối còn bỏ ngỏ trên bàn.",
  },
};

export const ENDING_OVERLAY_SCENES = {
  good: {
    figures: [
      {
        kind: "npc",
        x: 0.24,
        y: 0.92,
        spriteKey: "npc03",
        direction: "up",
        scale: 0.72,
        bobAmplitude: 1.2,
        swayAmplitude: 1.4,
        swaySpeed: 0.0018,
        frameOffset: 0.1,
      },
      {
        kind: "npc",
        x: 0.33,
        y: 0.9,
        spriteKey: "npc06",
        direction: "up",
        scale: 0.8,
        bobAmplitude: 1.6,
        swayAmplitude: 1.8,
        swaySpeed: 0.0022,
        frameOffset: 0.35,
      },
      {
        kind: "npc",
        x: 0.42,
        y: 0.88,
        spriteKey: "npc02",
        direction: "up",
        scale: 0.88,
        bobAmplitude: 1.4,
        swayAmplitude: 1.2,
        swaySpeed: 0.0024,
        frameOffset: 0.6,
      },
      {
        kind: "player",
        x: 0.5,
        y: 0.885,
        direction: "up",
        scale: 0.96,
        bobAmplitude: 1.7,
        swayAmplitude: 0.8,
        swaySpeed: 0.0019,
        frameOffset: 0.15,
      },
      {
        kind: "npc",
        x: 0.58,
        y: 0.88,
        spriteKey: "npc01",
        direction: "up",
        scale: 0.88,
        bobAmplitude: 1.4,
        swayAmplitude: 1.1,
        swaySpeed: 0.002,
        frameOffset: 0.8,
      },
      {
        kind: "npc",
        x: 0.67,
        y: 0.9,
        spriteKey: "npc05",
        direction: "up",
        scale: 0.8,
        bobAmplitude: 1.5,
        swayAmplitude: 1.6,
        swaySpeed: 0.0021,
        frameOffset: 0.48,
      },
      {
        kind: "npc",
        x: 0.76,
        y: 0.92,
        spriteKey: "npc04",
        direction: "up",
        scale: 0.72,
        bobAmplitude: 1.2,
        swayAmplitude: 1.4,
        swaySpeed: 0.0017,
        frameOffset: 0.92,
      },
    ],
    motes: [
      { x: 0.48, y: 0.64, size: 13, speed: 0.0013, drift: 4, alpha: 0.18 },
      { x: 0.56, y: 0.58, size: 10, speed: 0.0017, drift: 6, alpha: 0.22 },
      { x: 0.37, y: 0.72, size: 9, speed: 0.0015, drift: 5, alpha: 0.16 },
      { x: 0.66, y: 0.73, size: 8, speed: 0.0019, drift: 5, alpha: 0.16 },
      { x: 0.5, y: 0.49, size: 15, speed: 0.0011, drift: 7, alpha: 0.18 },
    ],
  },
  bad: {
    figures: [
      {
        kind: "npc",
        x: 0.18,
        y: 0.9,
        spriteKey: "npc05",
        direction: "right",
        scale: 0.78,
        animation: "walk",
        bobAmplitude: 1.6,
        swayAmplitude: 2.4,
        swaySpeed: 0.003,
        frameOffset: 0.2,
        opacity: 0.92,
      },
      {
        kind: "npc",
        x: 0.28,
        y: 0.88,
        spriteKey: "npc02",
        direction: "up",
        scale: 0.84,
        animation: "walk",
        bobAmplitude: 1.3,
        swayAmplitude: 1.8,
        swaySpeed: 0.0028,
        frameOffset: 0.48,
        opacity: 0.92,
      },
      {
        kind: "npc",
        x: 0.44,
        y: 0.83,
        spriteKey: "npc06",
        direction: "up",
        scale: 0.88,
        bobAmplitude: 0.8,
        swayAmplitude: 0.7,
        swaySpeed: 0.0015,
        frameOffset: 0.1,
        opacity: 0.94,
      },
      {
        kind: "player",
        x: 0.5,
        y: 0.84,
        direction: "up",
        scale: 0.92,
        bobAmplitude: 0.9,
        swayAmplitude: 0.5,
        swaySpeed: 0.0012,
        frameOffset: 0.55,
        opacity: 0.8,
      },
      {
        kind: "npc",
        x: 0.56,
        y: 0.83,
        spriteKey: "npc01",
        direction: "up",
        scale: 0.88,
        bobAmplitude: 0.8,
        swayAmplitude: 0.7,
        swaySpeed: 0.0014,
        frameOffset: 0.7,
        opacity: 0.94,
      },
      {
        kind: "npc",
        x: 0.7,
        y: 0.9,
        spriteKey: "npc03",
        direction: "left",
        scale: 0.78,
        animation: "walk",
        bobAmplitude: 1.6,
        swayAmplitude: 2.2,
        swaySpeed: 0.0031,
        frameOffset: 0.84,
        opacity: 0.92,
      },
      {
        kind: "npc",
        x: 0.81,
        y: 0.92,
        spriteKey: "npc04",
        direction: "left",
        scale: 0.72,
        bobAmplitude: 1.2,
        swayAmplitude: 1.5,
        swaySpeed: 0.0025,
        frameOffset: 0.33,
        opacity: 0.86,
      },
    ],
  },
  "zone1-lost-compass": {
    figures: [
      { kind: "npc", x: 0.2, y: 0.91, spriteKey: "npc05", direction: "right", scale: 0.78, animation: "walk", bobAmplitude: 1.4, swayAmplitude: 2.2, swaySpeed: 0.0028, frameOffset: 0.18, opacity: 0.9 },
      { kind: "npc", x: 0.34, y: 0.88, spriteKey: "npc02", direction: "up", scale: 0.84, animation: "walk", bobAmplitude: 1.2, swayAmplitude: 1.6, swaySpeed: 0.0024, frameOffset: 0.48, opacity: 0.88 },
      { kind: "player", x: 0.5, y: 0.84, direction: "up", scale: 0.92, bobAmplitude: 0.72, swayAmplitude: 0.45, swaySpeed: 0.0013, frameOffset: 0.54, opacity: 0.78 },
      { kind: "npc", x: 0.67, y: 0.9, spriteKey: "npc03", direction: "left", scale: 0.78, animation: "walk", bobAmplitude: 1.5, swayAmplitude: 2.1, swaySpeed: 0.0029, frameOffset: 0.82, opacity: 0.88 },
    ],
    motes: [
      { x: 0.42, y: 0.63, size: 8, speed: 0.0013, drift: 5, alpha: 0.1 },
      { x: 0.58, y: 0.58, size: 11, speed: 0.0016, drift: 4, alpha: 0.12 },
    ],
  },
  "zone2-fading-fires": {
    figures: [
      { kind: "npc", x: 0.2, y: 0.81, spriteKey: "npc01", direction: "left", scale: 1.1, animation: "walk", bobAmplitude: 1.45, swayAmplitude: 2.1, swaySpeed: 0.0028, frameOffset: 0.14, opacity: 0.86 },
      { kind: "npc", x: 0.35, y: 0.78, spriteKey: "npc04", direction: "up", scale: 1.14, animation: "walk", bobAmplitude: 1.25, swayAmplitude: 1.7, swaySpeed: 0.0025, frameOffset: 0.44, opacity: 0.88 },
      { kind: "player", x: 0.5, y: 0.76, direction: "up", scale: 1.2, bobAmplitude: 0.74, swayAmplitude: 0.46, swaySpeed: 0.0013, frameOffset: 0.55, opacity: 0.78 },
      { kind: "npc", x: 0.66, y: 0.79, spriteKey: "npc03", direction: "right", scale: 1.12, animation: "walk", bobAmplitude: 1.4, swayAmplitude: 2, swaySpeed: 0.0028, frameOffset: 0.76, opacity: 0.86 },
    ],
    motes: [
      { x: 0.29, y: 0.67, size: 7, speed: 0.0011, drift: 4, alpha: 0.1 },
      { x: 0.51, y: 0.55, size: 11, speed: 0.0014, drift: 5, alpha: 0.13 },
      { x: 0.72, y: 0.63, size: 8, speed: 0.0013, drift: 5, alpha: 0.11 },
    ],
  },
  "zone3a-missed-moment": {
    figures: [
      { kind: "npc", x: 0.22, y: 0.81, spriteKey: "npc02", direction: "left", scale: 1.06, animation: "walk", bobAmplitude: 1.3, swayAmplitude: 2.1, swaySpeed: 0.0027, frameOffset: 0.18, opacity: 0.84 },
      { kind: "npc", x: 0.4, y: 0.77, spriteKey: "npc05", direction: "up", scale: 1.12, animation: "walk", bobAmplitude: 1.2, swayAmplitude: 1.7, swaySpeed: 0.0025, frameOffset: 0.53, opacity: 0.86 },
      { kind: "player", x: 0.58, y: 0.78, direction: "up", scale: 1.18, bobAmplitude: 0.72, swayAmplitude: 0.48, swaySpeed: 0.0014, frameOffset: 0.33, opacity: 0.78 },
      { kind: "npc", x: 0.76, y: 0.82, spriteKey: "npc03", direction: "right", scale: 1.04, animation: "walk", bobAmplitude: 1.35, swayAmplitude: 2, swaySpeed: 0.0028, frameOffset: 0.79, opacity: 0.84 },
    ],
    motes: [
      { x: 0.3, y: 0.59, size: 7, speed: 0.0012, drift: 4, alpha: 0.1 },
      { x: 0.52, y: 0.65, size: 10, speed: 0.0015, drift: 5, alpha: 0.12 },
      { x: 0.68, y: 0.56, size: 8, speed: 0.0013, drift: 4, alpha: 0.1 },
    ],
  },
  "zone3b-divided-border": {
    figures: [
      { kind: "npc", x: 0.2, y: 0.79, spriteKey: "npc02", direction: "right", scale: 1.08, animation: "walk", bobAmplitude: 1.3, swayAmplitude: 1.8, swaySpeed: 0.0026, frameOffset: 0.14, opacity: 0.86 },
      { kind: "npc", x: 0.34, y: 0.82, spriteKey: "npc04", direction: "right", scale: 1.02, animation: "walk", bobAmplitude: 1.35, swayAmplitude: 2, swaySpeed: 0.0028, frameOffset: 0.44, opacity: 0.84 },
      { kind: "player", x: 0.5, y: 0.8, direction: "up", scale: 1.18, bobAmplitude: 0.7, swayAmplitude: 0.45, swaySpeed: 0.0013, frameOffset: 0.58, opacity: 0.78 },
      { kind: "npc", x: 0.68, y: 0.82, spriteKey: "npc01", direction: "left", scale: 1.04, animation: "walk", bobAmplitude: 1.35, swayAmplitude: 2, swaySpeed: 0.0027, frameOffset: 0.8, opacity: 0.84 },
      { kind: "npc", x: 0.82, y: 0.79, spriteKey: "npc05", direction: "left", scale: 1.08, animation: "walk", bobAmplitude: 1.3, swayAmplitude: 1.8, swaySpeed: 0.0026, frameOffset: 0.28, opacity: 0.86 },
    ],
    motes: [
      { x: 0.26, y: 0.62, size: 7, speed: 0.0011, drift: 4, alpha: 0.1 },
      { x: 0.5, y: 0.55, size: 10, speed: 0.0014, drift: 5, alpha: 0.12 },
      { x: 0.74, y: 0.61, size: 7, speed: 0.0012, drift: 4, alpha: 0.1 },
    ],
  },
  "zone4-stalled-machine": {
    figures: [
      { kind: "npc", x: 0.2, y: 0.81, spriteKey: "npc02", direction: "left", scale: 1.08, animation: "walk", bobAmplitude: 1.28, swayAmplitude: 1.9, swaySpeed: 0.0027, frameOffset: 0.16, opacity: 0.86 },
      { kind: "npc", x: 0.37, y: 0.78, spriteKey: "npc04", direction: "up", scale: 1.14, animation: "walk", bobAmplitude: 1.2, swayAmplitude: 1.7, swaySpeed: 0.0025, frameOffset: 0.48, opacity: 0.88 },
      { kind: "player", x: 0.53, y: 0.79, direction: "up", scale: 1.2, bobAmplitude: 0.72, swayAmplitude: 0.46, swaySpeed: 0.0014, frameOffset: 0.62, opacity: 0.78 },
      { kind: "npc", x: 0.7, y: 0.8, spriteKey: "npc01", direction: "right", scale: 1.1, animation: "walk", bobAmplitude: 1.3, swayAmplitude: 2, swaySpeed: 0.0027, frameOffset: 0.8, opacity: 0.86 },
    ],
    motes: [
      { x: 0.32, y: 0.62, size: 8, speed: 0.0012, drift: 4, alpha: 0.1 },
      { x: 0.54, y: 0.58, size: 10, speed: 0.0014, drift: 5, alpha: 0.12 },
      { x: 0.73, y: 0.64, size: 7, speed: 0.0012, drift: 4, alpha: 0.1 },
    ],
  },
};

export const ENDING_CINEMATIC_DEFINITIONS = {
  good: {
    duration: 8600,
    keyframes: [
      { at: 0, x: 0.18, y: 0.2, zoom: 2.52 },
      { at: 0.24, x: 0.82, y: 0.2, zoom: 2.4 },
      { at: 0.52, x: 0.82, y: 0.78, zoom: 2.18 },
      { at: 0.78, x: 0.2, y: 0.8, zoom: 1.94 },
      { at: 1, x: 0.5, y: 0.5, zoom: 1 },
    ],
  },
  bad: {
    duration: 9000,
    keyframes: [
      { at: 0, x: 0.2, y: 0.8, zoom: 2.56 },
      { at: 0.24, x: 0.22, y: 0.2, zoom: 2.42 },
      { at: 0.52, x: 0.8, y: 0.22, zoom: 2.2 },
      { at: 0.8, x: 0.82, y: 0.8, zoom: 1.98 },
      { at: 1, x: 0.5, y: 0.5, zoom: 1 },
    ],
  },
  "zone1-lost-compass": {
    duration: 9000,
    keyframes: [
      { at: 0, x: 0.28, y: 0.72, zoom: 2.4 },
      { at: 0.32, x: 0.68, y: 0.3, zoom: 2.22 },
      { at: 0.66, x: 0.46, y: 0.56, zoom: 1.7 },
      { at: 1, x: 0.5, y: 0.5, zoom: 1 },
    ],
  },
  "zone2-fading-fires": {
    duration: 9000,
    keyframes: [
      { at: 0, x: 0.52, y: 0.63, zoom: 2.34 },
      { at: 0.3, x: 0.3, y: 0.42, zoom: 2.12 },
      { at: 0.66, x: 0.7, y: 0.34, zoom: 1.74 },
      { at: 1, x: 0.5, y: 0.5, zoom: 1 },
    ],
  },
  "zone3a-missed-moment": {
    duration: 9000,
    keyframes: [
      { at: 0, x: 0.58, y: 0.66, zoom: 2.3 },
      { at: 0.32, x: 0.32, y: 0.46, zoom: 2.1 },
      { at: 0.68, x: 0.74, y: 0.36, zoom: 1.72 },
      { at: 1, x: 0.5, y: 0.5, zoom: 1 },
    ],
  },
  "zone3b-divided-border": {
    duration: 9000,
    keyframes: [
      { at: 0, x: 0.3, y: 0.42, zoom: 2.3 },
      { at: 0.3, x: 0.7, y: 0.42, zoom: 2.12 },
      { at: 0.65, x: 0.5, y: 0.74, zoom: 1.72 },
      { at: 1, x: 0.5, y: 0.5, zoom: 1 },
    ],
  },
  "zone4-stalled-machine": {
    duration: 9000,
    keyframes: [
      { at: 0, x: 0.18, y: 0.48, zoom: 2.28 },
      { at: 0.32, x: 0.77, y: 0.7, zoom: 2.08 },
      { at: 0.68, x: 0.48, y: 0.7, zoom: 1.72 },
      { at: 1, x: 0.5, y: 0.5, zoom: 1 },
    ],
  },
};

export const BAD_ENDING_RECOVERY = {
  lingerDuration: 2200,
  blackoutDuration: 700,
  walkDuration: 1700,
  complaintDuration: 3200,
  resetDuration: 2150,
  corruptionAfterReset: 0,
  speaker: "David",
  lines: [
    "Lại một nhánh thời gian hỏng nữa... Tôi còn chưa uống xong cà phê.",
    "Đứng dậy. Tôi đưa cậu về điểm kiểm soát gần nhất. Lần này đừng làm đầy thanh Tha hóa nữa.",
  ],
};

export const OPENING_DIALOGUE = [
  {
    speaker: "Khoảng không",
    text: "Không có cánh cửa, không có tiếng cảnh báo. Mặt đất biến mất và bạn rơi xuyên qua một khe nứt giữa các dòng thời gian.",
    stage: "fall",
  },
  {
    speaker: "Nhà du hành",
    text: "Bạn đáp xuống một nền bê tông lạnh ngắt. Trên đầu là vô số hộp đèn; trước mặt, những dãy bàn giấy kéo dài đến mức không thấy điểm cuối.",
    stage: "landed",
  },
  {
    speaker: "Nhà du hành",
    text: "Không biết đây là đâu, bạn chỉ còn cách đi theo lối hành lang dài hun hút. Có tiếng ai đó đang càm ràm về chuyện tăng ca ở phía trước.",
    stage: "orient",
  },
];

