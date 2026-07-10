const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const startScreen = document.getElementById("start-screen");
const pauseMenu = document.getElementById("pause-menu");
const slideModal = document.getElementById("slide-modal");
const endOverlay = document.getElementById("end-overlay");
const interactionPrompt = document.getElementById("interaction-prompt");
const levelChip = document.getElementById("level-chip");
const questChip = document.getElementById("quest-chip");
const pauseTitle = document.getElementById("pause-title");
const storyBookButton = document.getElementById("story-book-button");
const storyBookCount = document.getElementById("story-book-count");
const storyToast = document.getElementById("story-toast");
const dialogueBox = document.getElementById("dialogue-box");
const dialogueSpeaker = document.getElementById("dialogue-speaker");
const dialogueProgress = document.getElementById("dialogue-progress");
const dialogueText = document.getElementById("dialogue-text");
const dialogueNextButton = document.getElementById("dialogue-next-button");
const openingIntro = document.getElementById("opening-intro");
const openingCard = openingIntro.querySelector(".intro-card");
const openingSpeaker = document.getElementById("opening-speaker");
const openingProgress = document.getElementById("opening-progress");
const openingText = document.getElementById("opening-text");
const openingNextButton = document.getElementById("opening-next-button");
const openingKicker = openingIntro.querySelector(".intro-kicker");
const openingHint = openingIntro.querySelector(".intro-hint");
const startQuestion = startScreen.querySelector(".start-question");
const startCopy = startScreen.querySelector(".intro-copy");
const startObjectiveItems = Array.from(startScreen.querySelectorAll(".start-objectives p"));
const startControls = startScreen.querySelector(".start-controls");

const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const resumeButton = document.getElementById("resume-button");
const restartButton = document.getElementById("restart-button");
const aboutButton = document.getElementById("about-button");
const closeSlideButton = document.getElementById("close-slide-button");
const returnStartButton = document.getElementById("return-start-button");

const slideKicker = document.getElementById("slide-kicker");
const slideTitle = document.getElementById("slide-title");
const slideText = document.getElementById("slide-text");
const slideCaption = document.getElementById("slide-caption");
const slideImageFrame = document.getElementById("slide-image-frame");
const slideImage = document.getElementById("slide-image");
const slideGallery = document.getElementById("slide-gallery");
const bookControls = document.getElementById("book-controls");
const storyPrevButton = document.getElementById("story-prev-button");
const storyNextButton = document.getElementById("story-next-button");
const bookPageIndicator = document.getElementById("book-page-indicator");
const hpFill = document.getElementById("hp-fill");
const hpValue = document.getElementById("hp-value");
const saDoaFill = document.getElementById("sa-doa-fill");
const saDoaValue = document.getElementById("sa-doa-value");
const inventoryValue = document.getElementById("inventory-value");
const skillValue = document.getElementById("skill-value");
const endTitle = document.getElementById("end-title");
const endCopy = document.getElementById("end-copy");
const endSummary = document.getElementById("end-summary");
const endArtFrame = document.getElementById("end-art-frame");
const endArtCinematic = document.getElementById("end-art-cinematic");
const endArtImage = document.getElementById("end-art-image");
const endArtCinematicCtx = endArtCinematic?.getContext("2d") ?? null;
const endArtOverlay = document.getElementById("end-art-overlay");
const endArtOverlayCtx = endArtOverlay?.getContext("2d") ?? null;

if (endArtCinematicCtx) {
  endArtCinematicCtx.imageSmoothingEnabled = false;
}

if (endArtOverlayCtx) {
  endArtOverlayCtx.imageSmoothingEnabled = false;
}

const VIEWPORT = { width: canvas.width, height: canvas.height };
const WORLD = { width: 960, height: 640 };
const PLAYER_SPEED = 92;
const INTERACTION_RADIUS = 30;
const STORY_UNLOCK_TOAST_MS = 2800;
const PLAYER_MAX_HEALTH = 5;
const SA_DOA_MAX = 100;
const SA_DOA_BAD_ENDING = 60;
const STRIKE_COOLDOWN_MS = 420;
const PURIFY_COOLDOWN_MS = 1800;
const STRIKE_RANGE = 48;
const PURIFY_RANGE = 76;
const MONSTER_SPEED = 38;
const MONSTER_TOUCH_RANGE = 18;
const MONSTER_CONTACT_DAMAGE_COOLDOWN_MS = 900;
const RELIC_TARGET_COUNT = 5;
const PLAYER_ATTACK_ANIMATION_MS = 260;
const MONSTER_ATTACK_ANIMATION_MS = 260;
const ATTACK_LUNGE_DISTANCE = 4;
const NAVIGATION_ASSIST = {
  objectiveGlowRadius: 18,
  playerGlowRadius: 18,
  edgeGlowRadius: 16,
  objectiveCellSize: 2,
  playerCellSize: 1,
  edgeCellSize: 1,
  exitGuideMaxCellSize: 2,
  playerArrowOffset: 30,
  playerArrowYOffset: -24,
};
const REQUIRED_RELIC_IDS = [
  "red-compass",
  "unified-emblem",
  "vietminh-thread",
  "healed-map",
  "doi-moi-gear",
];
const PLAYER_FOOTPRINT = { width: 8, height: 6, offsetY: 7 };
const PLAYER_SPRITE = {
  frameWidth: 96,
  frameHeight: 80,
  cropX: 34,
  cropY: 24,
  cropWidth: 30,
  cropHeight: 38,
  drawWidth: 30,
  drawHeight: 38,
  drawOffsetX: -15,
  drawOffsetY: -24,
  frameCount: 8,
  idleFrameDuration: 180,
};
const NPC_SPRITE = {
  frameWidth: 96,
  frameHeight: 96,
  cropX: 30,
  cropY: 18,
  cropWidth: 36,
  cropHeight: 62,
  drawWidth: 24,
  drawHeight: 40,
  idleFrames: 4,
  walkFrames: 8,
  idleFrameDuration: 240,
  walkFrameDuration: 150,
};
const ENVIRONMENT_SPRITES = {
  deadBranches: [
    { x: 0, y: 0, width: 28, height: 44 },
    { x: 6, y: 56, width: 56, height: 24 },
    { x: 0, y: 86, width: 82, height: 42 },
  ],
  dryGrass: [
    { x: 0, y: 72, width: 24, height: 28 },
    { x: 34, y: 68, width: 28, height: 30 },
    { x: 22, y: 102, width: 24, height: 26 },
    { x: 0, y: 112, width: 16, height: 16 },
    { x: 58, y: 118, width: 40, height: 10 },
  ],
  barkStrip: { x: 0, y: 0, width: 24, height: 256 },
};
const TILECRAFT_TERRAIN = {
  tileSize: 16,
  dirt: [
    { col: 0, row: 3 },
    { col: 1, row: 3 },
    { col: 2, row: 3 },
    { col: 0, row: 4 },
    { col: 1, row: 4 },
    { col: 2, row: 4 },
  ],
  water: [
    { col: 3, row: 3 },
    { col: 4, row: 3 },
    { col: 3, row: 4 },
    { col: 4, row: 4 },
  ],
  grass: [
    { col: 5, row: 3 },
    { col: 5, row: 4 },
    { col: 6, row: 4 },
    { col: 4, row: 7 },
    { col: 5, row: 7 },
    { col: 4, row: 8 },
    { col: 5, row: 8 },
    { col: 6, row: 8 },
  ],
  stone: [
    { col: 7, row: 3 },
    { col: 8, row: 3 },
    { col: 7, row: 4 },
    { col: 8, row: 4 },
    { col: 2, row: 7 },
    { col: 3, row: 7 },
    { col: 2, row: 8 },
    { col: 3, row: 8 },
  ],
};
const PIXEL_CRAWLER_TERRAIN = {
  tileSize: 16,
  grass: [
    { col: 1, row: 10 },
    { col: 2, row: 10 },
    { col: 1, row: 11 },
    { col: 2, row: 11 },
  ],
  dirt: [
    { col: 10, row: 10 },
    { col: 11, row: 10 },
    { col: 12, row: 10 },
    { col: 11, row: 11 },
  ],
  stone: [
    { col: 6, row: 10 },
    { col: 7, row: 10 },
    { col: 8, row: 10 },
    { col: 7, row: 11 },
  ],
  brick: [
    { col: 16, row: 1 },
    { col: 17, row: 1 },
    { col: 18, row: 1 },
    { col: 17, row: 2 },
  ],
};
const VILLAGE_SKYLINE_Y = 148;
const VILLAGE_PROP_SPRITES = {
  fenceVine: { x: 0, y: 184, width: 760, height: 190 },
  gate: { x: 232, y: 510, width: 300, height: 154 },
  carts: [
    { x: 128, y: 0, width: 16, height: 16 },
    { x: 128, y: 16, width: 16, height: 16 },
    { x: 128, y: 32, width: 16, height: 16 },
  ],
  crates: [
    { x: 0, y: 32, width: 16, height: 16 },
    { x: 16, y: 32, width: 16, height: 16 },
    { x: 32, y: 32, width: 16, height: 16 },
  ],
};
const PIXEL_CRAWLER_BUILDING_SPRITES = {
  historyGateDoor: { x: 128, y: 64, width: 64, height: 32 },
};
const HUB_PORTAL_SPRITE = {
  frameSize: 64,
  columns: 3,
  frameCount: 8,
  frameDuration: 90,
  drawSize: 68,
};
const SWORD_SLASH_SPRITE = {
  frames: [
    { x: 64, y: 0, width: 58, height: 68, anchorX: 28, anchorY: 21, scale: 0.64 },
    { x: 143, y: 0, width: 43, height: 74, anchorX: 24, anchorY: 23, scale: 0.62 },
    { x: 205, y: 42, width: 35, height: 24, anchorX: 10, anchorY: 10, scale: 0.74 },
  ],
};
const PIXEL_CRAWLER_TREE_SPRITE = {
  frameWidth: 64,
  frameHeight: 96,
  columns: 3,
  displayVariants: [0, 1, 3, 4],
};
const KENNEY_ROGUELIKE_TILE = {
  size: 16,
  spacing: 17,
  margin: 1,
};
const KENNEY_ROGUELIKE_SPRITES = {
  torch: { col: 18, row: 7 },
  candle: { col: 21, row: 7 },
  treeGreen: { col: 13, row: 9 },
  treeOrange: { col: 14, row: 9 },
  treeTeal: { col: 15, row: 9 },
  treePineGreen: { col: 16, row: 9 },
  treePineOrange: { col: 17, row: 9 },
  bush: { col: 28, row: 10 },
  flowerPink: { col: 33, row: 10 },
  fenceHorizontal: { col: 47, row: 23 },
  fencePost: { col: 50, row: 23 },
  crate: { col: 24, row: 0 },
  barrel: { col: 22, row: 0 },
  redFlag: { col: 52, row: 0 },
};
const PIXEL_CRAWLER_VEGETATION_SPRITES = [
  { x: 0, y: 0, width: 48, height: 48 },
  { x: 48, y: 0, width: 48, height: 48 },
  { x: 96, y: 0, width: 48, height: 48 },
  { x: 144, y: 0, width: 48, height: 48 },
  { x: 0, y: 48, width: 48, height: 48 },
  { x: 48, y: 48, width: 48, height: 48 },
  { x: 96, y: 48, width: 48, height: 48 },
  { x: 144, y: 48, width: 48, height: 48 },
  { x: 0, y: 96, width: 48, height: 48 },
  { x: 48, y: 96, width: 48, height: 48 },
  { x: 96, y: 96, width: 48, height: 48 },
  { x: 144, y: 96, width: 48, height: 48 },
];
const PIXEL_CRAWLER_TOOL_CLUSTER_SPRITES = [
  { x: 16, y: 28, width: 48, height: 32 },
  { x: 80, y: 24, width: 32, height: 42 },
];
const CAINOS_PROP_SPRITES = {
  cargoStack: { x: 64, y: 0, width: 64, height: 64, shadowWidth: 40, shadowHeight: 8, shadowOffsetY: 56 },
  bench: { x: 288, y: 0, width: 64, height: 64, shadowWidth: 44, shadowHeight: 8, shadowOffsetY: 54 },
  statue: { x: 448, y: 0, width: 64, height: 96, shadowWidth: 34, shadowHeight: 10, shadowOffsetY: 88 },
  barrel: { x: 160, y: 96, width: 32, height: 32, shadowWidth: 18, shadowHeight: 6, shadowOffsetY: 28 },
};
const LIMEZU_INTERIOR_SPRITES = {
  bookshelfTall: { x: 240, y: 720, width: 96, height: 144, shadowWidth: 64, shadowHeight: 8, shadowOffsetY: 136 },
  rugGold: { x: 384, y: 720, width: 144, height: 144, noShadow: true },
  sofaSet: { x: 384, y: 864, width: 144, height: 96, shadowWidth: 86, shadowHeight: 8, shadowOffsetY: 86 },
  deskCompact: { x: 0, y: 1728, width: 96, height: 96, shadowWidth: 62, shadowHeight: 8, shadowOffsetY: 88 },
  deskWide: { x: 96, y: 1728, width: 144, height: 96, shadowWidth: 104, shadowHeight: 8, shadowOffsetY: 88 },
  deskArchive: { x: 384, y: 1728, width: 96, height: 96, shadowWidth: 60, shadowHeight: 8, shadowOffsetY: 88 },
  chalkboard: { x: 480, y: 1920, width: 96, height: 96, shadowWidth: 60, shadowHeight: 8, shadowOffsetY: 88 },
};
const HOUSE_INTERIOR_A_SPRITES = {
  cabinetTall: { x: 32, y: 0, width: 32, height: 32, shadowWidth: 20, shadowHeight: 6, shadowOffsetY: 28 },
  chairDark: { x: 64, y: 0, width: 32, height: 32, shadowWidth: 14, shadowHeight: 5, shadowOffsetY: 28 },
  chairWood: { x: 96, y: 0, width: 32, height: 32, shadowWidth: 14, shadowHeight: 5, shadowOffsetY: 28 },
  chairRed: { x: 128, y: 0, width: 32, height: 32, shadowWidth: 16, shadowHeight: 5, shadowOffsetY: 28 },
  chairScarlet: { x: 192, y: 0, width: 32, height: 32, shadowWidth: 14, shadowHeight: 5, shadowOffsetY: 28 },
  writingTable: { x: 32, y: 32, width: 64, height: 32, shadowWidth: 44, shadowHeight: 7, shadowOffsetY: 26 },
  dividerCabinet: { x: 96, y: 32, width: 32, height: 32, shadowWidth: 18, shadowHeight: 6, shadowOffsetY: 28 },
  sideDesk: { x: 160, y: 32, width: 32, height: 32, shadowWidth: 18, shadowHeight: 6, shadowOffsetY: 28 },
  cupboard: { x: 192, y: 32, width: 32, height: 32, shadowWidth: 20, shadowHeight: 6, shadowOffsetY: 28 },
  stoveCabinet: { x: 224, y: 32, width: 32, height: 32, shadowWidth: 20, shadowHeight: 6, shadowOffsetY: 28 },
  bookStack: { x: 0, y: 64, width: 32, height: 32, shadowWidth: 16, shadowHeight: 4, shadowOffsetY: 28 },
  bench: { x: 32, y: 64, width: 32, height: 32, shadowWidth: 22, shadowHeight: 5, shadowOffsetY: 28 },
  drawerCabinet: { x: 64, y: 64, width: 32, height: 32, shadowWidth: 18, shadowHeight: 5, shadowOffsetY: 28 },
  chestSmall: { x: 160, y: 64, width: 32, height: 32, shadowWidth: 16, shadowHeight: 5, shadowOffsetY: 28 },
  barrel: { x: 224, y: 64, width: 32, height: 32, shadowWidth: 18, shadowHeight: 6, shadowOffsetY: 28 },
  mirror: { x: 96, y: 128, width: 32, height: 32, shadowWidth: 12, shadowHeight: 4, shadowOffsetY: 28 },
  chestLarge: { x: 96, y: 192, width: 32, height: 32, shadowWidth: 18, shadowHeight: 5, shadowOffsetY: 28 },
  crateOpen: { x: 128, y: 192, width: 32, height: 32, shadowWidth: 18, shadowHeight: 5, shadowOffsetY: 28 },
  doorPanel: { x: 160, y: 192, width: 32, height: 32, shadowWidth: 18, shadowHeight: 5, shadowOffsetY: 28 },
};
const MONSTER_SPRITE_CONFIG = {
  wraith: {
    drawWidth: 34,
    drawHeight: 34,
    drawOffsetX: -17,
    drawOffsetY: -20,
    shadowWidth: 18,
    animations: {
      idle: { frameWidth: 32, frameHeight: 32, frameCount: 4, frameDuration: 180 },
      run: { frameWidth: 64, frameHeight: 64, frameCount: 6, frameDuration: 110 },
    },
  },
  devourer: {
    drawWidth: 36,
    drawHeight: 36,
    drawOffsetX: -18,
    drawOffsetY: -22,
    shadowWidth: 20,
    animations: {
      idle: { frameWidth: 32, frameHeight: 32, frameCount: 4, frameDuration: 180 },
      run: { frameWidth: 64, frameHeight: 64, frameCount: 6, frameDuration: 110 },
    },
  },
  blight: {
    drawWidth: 36,
    drawHeight: 36,
    drawOffsetX: -18,
    drawOffsetY: -22,
    shadowWidth: 20,
    animations: {
      idle: { frameWidth: 32, frameHeight: 32, frameCount: 4, frameDuration: 180 },
      run: { frameWidth: 64, frameHeight: 64, frameCount: 6, frameDuration: 110 },
    },
  },
};

const INTERACTION_DIALOGUES = {
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

const RELIC_DEFINITIONS = {
  "red-compass": {
    label: "Chiếc La Bàn Đỏ",
    source: "sau khi phát báo Người Cùng Khổ cho công nhân bến cảng",
  },
  "unified-emblem": {
    label: "Huy hiệu Búa Liềm thống nhất",
    source: "đặt đủ ba mảnh hợp nhất lên bàn tròn",
  },
  "vietminh-thread": {
    label: "Sợi chỉ đỏ Việt Minh",
    source: "quy tụ đủ khối đại đoàn kết toàn dân",
  },
  "healed-map": {
    label: "Bản đồ Vĩ tuyến 17 hàn gắn",
    source: "giải phóng các ấp chiến lược và đẩy lùi thế lực chia cắt",
  },
  "doi-moi-gear": {
    label: "Bánh răng Đổi Mới",
    source: "phá hàng rào bao cấp và phát Khoán 10 cho nông dân",
  },
};

const ENDING_DEFINITIONS = {
  good: {
    title: "GOOD ENDING: ĐẠI THẮNG & PHÁT TRIỂN",
    copy:
      "Dưới sự lãnh đạo của Đảng Cộng sản Việt Nam, dân tộc ta đã giành lại độc lập, thống nhất và đang vững bước trên con đường dân giàu, nước mạnh. Sự lãnh đạo của Đảng là nhân tố hàng đầu bảo đảm mọi thắng lợi.",
    artSrc: "assets/environment/generated-worlds/good-ending-hero.png",
    artAlt: "Khung cảnh kết thúc tốt với quảng trường đoàn kết, ngọn đuốc rực sáng, ruộng lúa và công trình hiện đại.",
  },
  bad: {
    title: "BAD ENDING: MẤT NƯỚC / CHỆCH HƯỚNG",
    copy:
      "Không có ngọn cờ dẫn đường đúng đắn và bản lĩnh kiên định, lịch sử dân tộc đã rẽ sang một bóng đen nô lệ và chia cắt mới. Đất nước tiếp tục bị các thế lực thù địch thao túng hoặc chệch khỏi con đường xã hội chủ nghĩa.",
    artSrc: "assets/environment/generated-worlds/bad-ending-hero.png",
    artAlt: "Khung cảnh kết thúc xấu với xã hội đen tối hiện đại, trụ Tha hóa, chia rẽ và lệ thuộc.",
  },
};

const ENDING_OVERLAY_SCENES = {
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
};

const ENDING_CINEMATIC_DEFINITIONS = {
  good: {
    duration: 7000,
    keyframes: [
      { at: 0, x: 0.2, y: 0.34, zoom: 2.18 },
      { at: 0.26, x: 0.5, y: 0.46, zoom: 2.28 },
      { at: 0.54, x: 0.8, y: 0.28, zoom: 2.04 },
      { at: 0.78, x: 0.52, y: 0.76, zoom: 1.74 },
      { at: 1, x: 0.5, y: 0.5, zoom: 1 },
    ],
  },
  bad: {
    duration: 7200,
    keyframes: [
      { at: 0, x: 0.2, y: 0.72, zoom: 2.22 },
      { at: 0.28, x: 0.5, y: 0.43, zoom: 2.36 },
      { at: 0.56, x: 0.78, y: 0.32, zoom: 2.08 },
      { at: 0.8, x: 0.58, y: 0.76, zoom: 1.82 },
      { at: 1, x: 0.5, y: 0.5, zoom: 1 },
    ],
  },
};

const OPENING_DIALOGUE = [
  {
    speaker: "Cảnh 1",
    text: "Sương mù đang phủ kín những ngã rẽ lịch sử.",
  },
  {
    speaker: "Cảnh 2",
    text: "Bốn khu vực đang mở ra. Năm tín vật đang chờ được tập hợp.",
  },
  {
    speaker: "Cảnh 3",
    text: "Mọi lời hứa vinh hoa đều có giá của nó: thanh Tha hóa sẽ dâng lên.",
  },
  {
    speaker: "Cảnh 4",
    text: "Nếu giữ vững chính khí, ngươi có thể mở Cánh Cửa Lịch Sử và viết nên Good Ending.",
  },
];

function createQuestState() {
  return {
    zone1Started: false,
    zone1Delivered: new Set(),
    zone1RewardClaimed: false,
    zone2Fragments: new Set(),
    zone2RewardClaimed: false,
    zone3Recruits: new Set(),
    zone3ThreadClaimed: false,
    zone3HamletsFreed: new Set(),
    zone3MapClaimed: false,
    zone4Barriers: new Set(),
    zone4Farmers: new Set(),
    zone4GearClaimed: false,
  };
}

function configureOpeningCopy() {
  startQuestion.textContent = "Nếu lịch sử rẽ sang hướng khác, Việt Nam sẽ về đâu?";
  startCopy.textContent = "4 khu vực. 5 tín vật. 1 Cánh Cửa Lịch Sử đang chờ được mở.";
  startControls.textContent = "WASD di chuyển • E tương tác • J/K kỹ năng • B mở sách";

  const objectiveLabels = [
    "Tiến qua 4 khu vực",
    "Tìm đủ 5 tín vật",
    "Giữ Tha hóa thấp",
  ];

  startObjectiveItems.forEach((item, index) => {
    item.textContent = objectiveLabels[index] ?? "";
  });

  openingKicker.textContent = "Dẫn nhập";
  openingHint.textContent = "E / Phím cách để tiếp tục";
}

const keys = new Set();
const playerSprites = loadPlayerSprites();
const npcSprites = loadVillageNpcSprites();
const environmentSprites = loadEnvironmentSprites();
const effectSprites = loadEffectSprites();
const monsterSprites = loadMonsterSprites();
const uiSounds = loadUiSounds();
const ambienceSounds = loadAmbienceSounds();
let storyToastTimeoutId = 0;

const state = {
  mode: "start",
  currentLevelId: "hub",
  activeSlide: null,
  activeDialogue: null,
  activeDialogueIndex: 0,
  openingStep: 0,
  activeStoryIds: [],
  activeStoryIndex: 0,
  unlockedStoryIds: new Set(),
  activeInteractionId: null,
  aboutFromPause: false,
  pendingEnding: false,
  health: PLAYER_MAX_HEALTH,
  saDoa: 0,
  inventory: new Set(),
  skillCooldowns: {
    strikeReadyAt: 0,
    purifyReadyAt: 0,
  },
  invulnerableUntil: 0,
  activeSkillEffect: null,
  endingId: null,
  endingSummary: "",
  endingCinematic: null,
  blockedExitIds: new Set(),
  puzzleState: {
    archiveSequence: 0,
    archiveSolved: false,
  },
  quests: createQuestState(),
  lastTimestamp: 0,
};

const player = createPlayer();
const camera = { x: 0, y: 0 };
const levels = {
  hub: createHubLevel(),
  village: createPortMazeLevel(),
  archive: createUnityHouseLevel(),
  crossroads: createRedSquareLevel(),
  spring: createDoiMoiValleyLevel(),
};
const storyRegistry = createStoryRegistry(levels);
initializeLevelRuntime();
configureOpeningCopy();
updateProgressHud();

startButton.addEventListener("click", withUiClickSound(startGame));
pauseButton.addEventListener("click", withUiClickSound(togglePause));
resumeButton.addEventListener("click", withUiClickSound(resumeGame));
restartButton.addEventListener("click", withUiClickSound(restartGame));
storyBookButton.addEventListener("click", withUiClickSound(() => openStoryBook()));
aboutButton.addEventListener("click", withUiClickSound(() => {
  state.aboutFromPause = true;
  state.activeStoryIds = [];
  state.activeStoryIndex = 0;
  openSlide(currentLevel().aboutSlide);
}));
closeSlideButton.addEventListener("click", closeSlide);
dialogueNextButton.addEventListener("click", withUiClickSound(advanceDialogue));
openingNextButton.addEventListener("click", withUiClickSound(advanceOpeningIntro));
storyPrevButton.addEventListener("click", withUiClickSound(() => showStoryBookEntry(-1)));
storyNextButton.addEventListener("click", withUiClickSound(() => showStoryBookEntry(1)));
returnStartButton.addEventListener("click", withUiClickSound(handleReturnFromEnding));

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
    event.preventDefault();
  }

  if (event.repeat) {
    return;
  }

  const key = normalizeKey(event.key);

  if (key === "escape") {
    if (state.mode === "opening") {
      playUiSound(uiSounds.pixelClick);
      returnToStartScreen();
      return;
    }

    if (state.mode === "dialogue") {
      cancelDialogue();
      return;
    }

    if (state.mode === "modal") {
      closeSlide();
      return;
    }

    if (state.mode === "playing" || state.mode === "paused") {
      playUiSound(uiSounds.pixelClick);
      togglePause();
      return;
    }
  }

  if (state.mode === "start" && (key === "enter" || key === "space")) {
    playUiSound(uiSounds.pixelClick);
    startGame();
    return;
  }

  if (state.mode === "opening" && (key === "enter" || key === "e" || key === "space")) {
    playUiSound(uiSounds.pixelClick);
    advanceOpeningIntro();
    return;
  }

  if (state.mode === "ending" && (key === "enter" || key === "space")) {
    if (!isEndingCinematicComplete()) {
      return;
    }

    playUiSound(uiSounds.pixelClick);
    handleReturnFromEnding();
    return;
  }

  if (state.mode === "dialogue" && (key === "enter" || key === "e" || key === "space")) {
    playUiSound(uiSounds.pixelClick);
    advanceDialogue();
    return;
  }

  if (state.mode === "modal" && key === "arrowleft") {
    if (state.activeStoryIds.length > 0) {
      playUiSound(uiSounds.pixelClick);
      showStoryBookEntry(-1);
    }
    return;
  }

  if (state.mode === "modal" && key === "arrowright") {
    if (state.activeStoryIds.length > 0) {
      playUiSound(uiSounds.pixelClick);
      showStoryBookEntry(1);
    }
    return;
  }

  if (state.mode === "playing" && key === "b") {
    if (state.unlockedStoryIds.size > 0) {
      playUiSound(uiSounds.pixelClick);
      openStoryBook();
    }
    return;
  }

  if (state.mode === "playing" && key === "j") {
    useStrikeSkill();
    return;
  }

  if (state.mode === "playing" && key === "k") {
    usePurifySkill();
    return;
  }

  if (state.mode === "playing" && (key === "e" || key === "space")) {
    handleInteraction();
    return;
  }

  keys.add(key);
});

window.addEventListener("keyup", (event) => {
  keys.delete(normalizeKey(event.key));
});

loadLevel("hub");
applyDebugLevelFromUrl();
applyDebugEndingFromUrl();
requestAnimationFrame(frame);

function createPlayer() {
  return {
    x: 128,
    y: 366,
    width: 14,
    height: 18,
    direction: "right",
    walkTime: 0,
    isMoving: false,
  };
}

function loadPlayerSprites() {
  return {
    run: loadDirectionalSprites("run"),
    idle: loadDirectionalSprites("idle"),
  };
}

function loadVillageNpcSprites() {
  return {
    npc01: loadNpcSpriteSet("npc01"),
    npc02: loadNpcSpriteSet("npc02"),
    npc03: loadNpcSpriteSet("npc03"),
    npc04: loadNpcSpriteSet("npc04"),
    npc05: loadNpcSpriteSet("npc05"),
    npc06: loadNpcSpriteSet("npc06"),
  };
}

function loadEnvironmentSprites() {
  return {
    deadBranches: loadSprite("assets/environment/dead-aspen/Trees1Alpha128.png"),
    dryGrass: loadSprite("assets/environment/dead-aspen/grass128.png"),
    barkTexture: loadSprite("assets/environment/dead-aspen/Tree1Diff256.png"),
    tilecraftGround: loadSprite("assets/environment/tilecraft/TileCraftGroundSetVersion2.png"),
    archiveParquet: loadSprite("assets/environment/archive/Birch_Parquet_01_basecolor.png"),
    archiveHouseInterior: loadSprite("assets/environment/archive/HouseInteriorA.png"),
    generatedWorlds: {
      colonialHarbor: loadSprite("assets/environment/generated-worlds/colonial-harbor-hero.png"),
      archiveInterior: loadSprite("assets/environment/generated-worlds/archive-interior-hero.png"),
      revolutionSquare: loadSprite("assets/environment/generated-worlds/revolution-square-hero.png"),
      factoryValley: loadSprite("assets/environment/generated-worlds/factory-valley-hero.png"),
      historyHub: loadSprite("assets/environment/generated-worlds/history-hub-hero.png"),
    },
    generatedObjects: {
      finalHistoryGate: loadSprite("assets/environment/generated-objects/final-history-gate.png"),
      paperBundle: loadSprite("assets/environment/generated-objects/paper-bundle.png"),
      unityTable: loadSprite("assets/environment/generated-objects/unity-table.png"),
      storyRelic: loadSprite("assets/environment/generated-objects/story-relic.png"),
      memorySeal: loadSprite("assets/environment/generated-objects/memory-seal.png"),
      corruptObelisk: loadSprite("assets/environment/generated-objects/corrupt-obelisk.png"),
      fragmentTable: loadSprite("assets/environment/generated-objects/fragment-table.png"),
      compassPedestal: loadSprite("assets/environment/generated-objects/compass-pedestal.png"),
      strategicHamlet: loadSprite("assets/environment/generated-objects/strategic-hamlet.png"),
      bureaucracyWall: loadSprite("assets/environment/generated-objects/bureaucracy-wall.png"),
      rationMarket: loadSprite("assets/environment/generated-objects/ration-market.png"),
    },
    ruinedVillageBuildings: Array.from({ length: 7 }, (_, index) =>
      loadSprite(`assets/environment/mutterpixel-ruined-village/spr_old_building_${index + 1}.png`)
    ),
    hubPortalSheet: loadSprite("assets/environment/portal/portal-spinning.png"),
    pixelCrawler: {
      floorTiles: loadSprite("assets/Pixel Crawler - Free Pack/Environment/Tilesets/Floors_Tiles.png"),
      vegetation: loadSprite("assets/environment/pixel-crawler/vegetation.png"),
      tools: loadSprite("assets/environment/pixel-crawler/tools.png"),
      trees: loadSprite("assets/Pixel Crawler - Free Pack/Environment/Props/Static/Trees/Model_03/Size_03.png"),
      buildingProps: loadSprite("assets/Pixel Crawler - Free Pack/Environment/Structures/Buildings/Props.png"),
    },
    kenneyRoguelike: {
      spritesheet: loadSprite("assets/kenney-roguelike-rpg/Spritesheet/roguelikeSheet_transparent.png"),
    },
    openGameArt: {
      historyDoor: loadSprite("assets/environment/opengameart/pixel_door.png"),
    },
    cainos: {
      props: loadSprite("assets/environment/cainos/tx-props.png"),
    },
    limezu: {
      interiors: loadSprite("assets/environment/limezu/interiors-free-48x48.png"),
    },
    villageProps: {
      fencesWallsGate: loadSprite("assets/environment/village-props/fences-walls-gate.png"),
      boxesCrates: loadSprite("assets/environment/village-props/boxes-crates.png"),
      fantasyVehicles: loadSprite("assets/environment/village-props/fantasy-vehicles.png"),
    },
  };
}

function loadMonsterSprites() {
  return {
    wraith: {
      idle: loadSprite("assets/monsters/pixel-crawler/skeleton-rogue-idle.png"),
      run: loadSprite("assets/monsters/pixel-crawler/skeleton-rogue-run.png"),
    },
    devourer: {
      idle: loadSprite("assets/monsters/pixel-crawler/orc-idle.png"),
      run: loadSprite("assets/monsters/pixel-crawler/orc-run.png"),
    },
    blight: {
      idle: loadSprite("assets/monsters/pixel-crawler/orc-shaman-idle.png"),
      run: loadSprite("assets/monsters/pixel-crawler/orc-shaman-run.png"),
    },
  };
}

function loadEffectSprites() {
  return {
    rainDrops: [
      loadSprite("assets/effects/rain_drops-01.png"),
      loadSprite("assets/effects/rain_drops-02.png"),
      loadSprite("assets/effects/rain_drops-03.png"),
      loadSprite("assets/effects/rain_drops-04.png"),
    ],
    eternalCandle: loadSprite("assets/effects/eternal-ember-candle-1-DEMO.gif"),
    eternalCandleSheet: loadSprite("assets/effects/eternal-ember-sprite-sheet-DEMO.png"),
    glow: loadSprite("assets/effects/kenney-particles/light_01.png"),
    ember: loadSprite("assets/effects/kenney-particles/flame_05.png"),
    magic: loadSprite("assets/effects/kenney-particles/magic_04.png"),
    sparkle: loadSprite("assets/effects/kenney-particles/star_04.png"),
    petal: loadSprite("assets/effects/petal-pink.png"),
    swordSlashSheet: loadSprite("assets/effects/combat/sword-slash-sheet.png"),
  };
}

function loadUiSounds() {
  return {
    bookPageFlip: loadSound("assets/audio/book-page-flip.mp3", 0.42),
    pixelClick: loadSound("assets/audio/ui-pixel-click.mp3", 0.34),
  };
}

function loadAmbienceSounds() {
  return {
    rain: loadSound("assets/audio/rain-ambient.mp3", 0.18, { loop: true }),
    fireplace: loadSound("assets/audio/fireplace-ambient.mp3", 0.14, { loop: true }),
  };
}

function loadDirectionalSprites(prefix) {
  return {
    up: loadSprite(`assets/player/${prefix}_up.png`),
    down: loadSprite(`assets/player/${prefix}_down.png`),
    left: loadSprite(`assets/player/${prefix}_left.png`),
    right: loadSprite(`assets/player/${prefix}_right.png`),
  };
}

function loadNpcSpriteSet(id) {
  const basePath = `assets/npcs/village-vol1/${id}`;

  return {
    down: loadSprite(`${basePath}/down.png`),
    downleft: loadSprite(`${basePath}/downleft.png`),
    left: loadSprite(`${basePath}/left.png`),
    up: loadSprite(`${basePath}/up.png`),
    upleft: loadSprite(`${basePath}/upleft.png`),
  };
}

function loadSprite(src) {
  const image = new Image();
  image.src = src;
  return image;
}

function loadSound(src, volume = 1, options = {}) {
  const sound = new Audio(src);
  sound.preload = "auto";
  sound.volume = volume;
  sound.loop = Boolean(options.loop);
  return sound;
}

function playUiSound(sound) {
  if (!sound) {
    return;
  }

  try {
    sound.pause();
    sound.currentTime = 0;
    const playback = sound.play();
    playback?.catch(() => {});
  } catch {
    // Ignore browsers that temporarily block or delay UI sound playback.
  }
}

function withUiClickSound(action) {
  return (...args) => {
    playUiSound(uiSounds.pixelClick);
    action(...args);
  };
}

function playLoopingSound(sound) {
  if (!sound || !sound.paused) {
    return;
  }

  try {
    const playback = sound.play();
    playback?.catch(() => {});
  } catch {
    // Ignore browsers that temporarily block ambient playback.
  }
}

function stopSound(sound) {
  if (!sound) {
    return;
  }

  try {
    sound.pause();
    sound.currentTime = 0;
  } catch {
    // Ignore browsers that do not allow resetting audio immediately.
  }
}

function syncAmbienceAudio() {
  let activeAmbience = null;

  if (state.mode !== "start" && state.currentLevelId === "village") {
    activeAmbience = ambienceSounds.rain;
  }

  for (const sound of Object.values(ambienceSounds)) {
    if (sound !== activeAmbience) {
      stopSound(sound);
    }
  }

  if (activeAmbience) {
    playLoopingSound(activeAmbience);
  }
}

function canDrawSprite(image) {
  return Boolean(image?.complete && image.naturalWidth > 0);
}

function resolveNpcDirection(direction = "down") {
  switch (direction) {
    case "right":
      return { key: "left", flipX: true };
    case "upright":
      return { key: "upleft", flipX: true };
    case "downright":
      return { key: "downleft", flipX: true };
    case "up":
    case "upleft":
    case "left":
    case "downleft":
    case "down":
      return { key: direction, flipX: false };
    default:
      return { key: "down", flipX: false };
  }
}

function getNpcFrame(actor) {
  return getNpcFrameAt(actor, state.lastTimestamp);
}

function getNpcFrameAt(actor, timestamp = state.lastTimestamp) {
  const animation = actor.animation === "walk" ? "walk" : "idle";
  const frameCount = animation === "walk" ? NPC_SPRITE.walkFrames : NPC_SPRITE.idleFrames;
  const duration =
    animation === "walk" ? NPC_SPRITE.walkFrameDuration : NPC_SPRITE.idleFrameDuration;
  const frameOffset = actor.frameOffset ?? 0;
  const frameTime = timestamp + frameOffset * duration * 4;

  return {
    animation,
    index: Math.floor(frameTime / duration) % frameCount,
  };
}

function drawNpcSpriteActor(actor) {
  return drawNpcSpriteActorToContext(ctx, actor, state.lastTimestamp);
}

function drawNpcSpriteActorToContext(context, actor, timestamp = state.lastTimestamp) {
  const spriteSet = npcSprites[actor.spriteKey];

  if (!spriteSet) {
    return false;
  }

  const direction = resolveNpcDirection(actor.direction);
  const sheet = spriteSet[direction.key];

  if (!canDrawSprite(sheet)) {
    return false;
  }

  const frame = getNpcFrameAt(actor, timestamp);
  const scale = actor.scale ?? 1;
  const sourceY = frame.animation === "walk" ? NPC_SPRITE.frameHeight : 0;
  const sourceX = frame.index * NPC_SPRITE.frameWidth + NPC_SPRITE.cropX;
  const drawWidth = Math.max(1, Math.round(NPC_SPRITE.drawWidth * scale));
  const drawHeight = Math.max(1, Math.round(NPC_SPRITE.drawHeight * scale));

  context.save();
  context.globalAlpha = actor.opacity ?? 1;
  context.translate(Math.round(actor.x), Math.round(actor.y));
  context.scale(direction.flipX ? -1 : 1, 1);
  context.drawImage(
    sheet,
    sourceX,
    sourceY + NPC_SPRITE.cropY,
    NPC_SPRITE.cropWidth,
    NPC_SPRITE.cropHeight,
    Math.round(-drawWidth / 2),
    -drawHeight + 8,
    drawWidth,
    drawHeight
  );
  context.restore();
  return true;
}

function drawPlayerSpriteActorToContext(context, actor, timestamp = state.lastTimestamp) {
  const animationSet = actor.animation === "walk" ? playerSprites.run : playerSprites.idle;
  const sheet = animationSet[actor.direction] ?? animationSet.down;

  if (!canDrawSprite(sheet)) {
    return false;
  }

  const scale = actor.scale ?? 1;
  const duration = actor.animation === "walk" ? 120 : PLAYER_SPRITE.idleFrameDuration;
  const frameOffset = actor.frameOffset ?? 0;
  const frameTime = timestamp + frameOffset * duration * 4;
  const frameIndex = Math.floor(frameTime / duration) % PLAYER_SPRITE.frameCount;
  const sourceX = frameIndex * PLAYER_SPRITE.frameWidth + PLAYER_SPRITE.cropX;
  const drawWidth = Math.max(1, Math.round(PLAYER_SPRITE.drawWidth * scale));
  const drawHeight = Math.max(1, Math.round(PLAYER_SPRITE.drawHeight * scale));
  const drawOffsetX = Math.round(PLAYER_SPRITE.drawOffsetX * scale);
  const drawOffsetY = Math.round(PLAYER_SPRITE.drawOffsetY * scale);

  context.save();
  context.globalAlpha = actor.opacity ?? 1;
  context.translate(Math.round(actor.x), Math.round(actor.y));
  context.drawImage(
    sheet,
    sourceX,
    PLAYER_SPRITE.cropY,
    PLAYER_SPRITE.cropWidth,
    PLAYER_SPRITE.cropHeight,
    drawOffsetX,
    drawOffsetY,
    drawWidth,
    drawHeight
  );
  context.restore();
  return true;
}

function drawSheetSprite(image, sprite, x, y, scale = 1, options = {}) {
  if (!canDrawSprite(image)) {
    return false;
  }

  const drawWidth = Math.max(1, Math.round(sprite.width * scale));
  const drawHeight = Math.max(1, Math.round(sprite.height * scale));
  const anchorX = options.anchorX ?? Math.round(drawWidth / 2);
  const anchorY = options.anchorY ?? drawHeight;

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate(options.rotation ?? 0);
  ctx.globalAlpha = options.alpha ?? 1;
  ctx.drawImage(
    image,
    sprite.x,
    sprite.y,
    sprite.width,
    sprite.height,
    -anchorX,
    -anchorY,
    drawWidth,
    drawHeight
  );
  ctx.restore();
  return true;
}

function drawSpriteRect(image, sprite, x, y, width, height, options = {}) {
  if (!canDrawSprite(image)) {
    return false;
  }

  ctx.save();
  ctx.globalAlpha = options.alpha ?? 1;
  ctx.filter = options.filter ?? "none";
  ctx.drawImage(
    image,
    sprite.x,
    sprite.y,
    sprite.width,
    sprite.height,
    Math.round(x),
    Math.round(y),
    Math.round(width),
    Math.round(height)
  );
  ctx.restore();
  return true;
}

function drawCoverImage(image, x, y, width, height, options = {}) {
  if (!canDrawSprite(image)) {
    return false;
  }

  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  const targetAspect = width / height;
  const sourceAspect = sourceWidth / sourceHeight;
  let cropX = 0;
  let cropY = 0;
  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;

  if (sourceAspect > targetAspect) {
    cropWidth = Math.round(sourceHeight * targetAspect);
    cropX = Math.round((sourceWidth - cropWidth) / 2);
  } else if (sourceAspect < targetAspect) {
    cropHeight = Math.round(sourceWidth / targetAspect);
    cropY = Math.round((sourceHeight - cropHeight) / 2);
  }

  ctx.save();
  ctx.globalAlpha = options.alpha ?? 1;
  ctx.filter = options.filter ?? "none";
  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    Math.round(x),
    Math.round(y),
    Math.round(width),
    Math.round(height)
  );
  ctx.restore();

  if (options.overlayColor) {
    ctx.save();
    ctx.fillStyle = options.overlayColor;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
    ctx.restore();
  }

  return true;
}

function drawLooseSprite(image, x, y, width, height, options = {}) {
  if (!canDrawSprite(image)) {
    return false;
  }

  const anchorX = options.anchorX ?? 0.5;
  const anchorY = options.anchorY ?? 1;
  const drawX = x - width * anchorX + (options.offsetX ?? 0);
  const drawY = y - height * anchorY + (options.offsetY ?? 0);

  ctx.save();
  ctx.globalAlpha = options.alpha ?? 1;
  ctx.filter = options.filter ?? "none";
  ctx.drawImage(
    image,
    Math.round(drawX),
    Math.round(drawY),
    Math.round(width),
    Math.round(height)
  );
  ctx.restore();
  return true;
}

function drawKenneyRoguelikeSprite(sprite, x, y, width = 16, height = 16, options = {}) {
  const sheet = environmentSprites.kenneyRoguelike?.spritesheet;

  if (!sprite || !canDrawSprite(sheet)) {
    return false;
  }

  const sourceX = KENNEY_ROGUELIKE_TILE.margin + sprite.col * KENNEY_ROGUELIKE_TILE.spacing;
  const sourceY = KENNEY_ROGUELIKE_TILE.margin + sprite.row * KENNEY_ROGUELIKE_TILE.spacing;

  ctx.save();
  ctx.globalAlpha = options.alpha ?? 1;
  ctx.filter = options.filter ?? "none";
  ctx.drawImage(
    sheet,
    sourceX,
    sourceY,
    KENNEY_ROGUELIKE_TILE.size,
    KENNEY_ROGUELIKE_TILE.size,
    Math.round(x),
    Math.round(y),
    Math.round(width),
    Math.round(height)
  );
  ctx.restore();
  return true;
}

function drawBarkOverlay(x, y, width, height, alpha = 0.36) {
  if (!canDrawSprite(environmentSprites.barkTexture)) {
    return;
  }

  const strip = ENVIRONMENT_SPRITES.barkStrip;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    environmentSprites.barkTexture,
    strip.x,
    strip.y,
    strip.width,
    strip.height,
    x,
    y,
    width,
    height
  );
  ctx.restore();
}

function drawTerrainFill(tiles, x, y, width, height, options = {}) {
  if (!canDrawSprite(environmentSprites.tilecraftGround)) {
    return false;
  }

  const tileSize = TILECRAFT_TERRAIN.tileSize;
  const scale = options.scale ?? 1;
  const drawSize = tileSize * scale;
  const seed = options.seed ?? 0;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.globalAlpha = options.alpha ?? 1;

  for (let drawY = y; drawY < y + height + drawSize; drawY += drawSize) {
    for (let drawX = x; drawX < x + width + drawSize; drawX += drawSize) {
      const columnIndex = Math.floor((drawX - x) / drawSize);
      const rowIndex = Math.floor((drawY - y) / drawSize);
      const tile = tiles[Math.abs((columnIndex * 3 + rowIndex * 5 + seed) % tiles.length)];

      ctx.drawImage(
        environmentSprites.tilecraftGround,
        tile.col * tileSize,
        tile.row * tileSize,
        tileSize,
        tileSize,
        drawX,
        drawY,
        drawSize,
        drawSize
      );
    }
  }

  ctx.restore();
  return true;
}

function drawPixelCrawlerTerrainFill(tiles, x, y, width, height, options = {}) {
  const sheet = environmentSprites.pixelCrawler?.floorTiles;

  if (!canDrawSprite(sheet)) {
    return false;
  }

  const tileSize = PIXEL_CRAWLER_TERRAIN.tileSize;
  const scale = options.scale ?? 1;
  const drawSize = tileSize * scale;
  const seed = options.seed ?? 0;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.globalAlpha = options.alpha ?? 1;

  for (let drawY = y; drawY < y + height + drawSize; drawY += drawSize) {
    for (let drawX = x; drawX < x + width + drawSize; drawX += drawSize) {
      const columnIndex = Math.floor((drawX - x) / drawSize);
      const rowIndex = Math.floor((drawY - y) / drawSize);
      const tile = tiles[Math.abs((columnIndex * 5 + rowIndex * 7 + seed) % tiles.length)];

      ctx.drawImage(
        sheet,
        tile.col * tileSize,
        tile.row * tileSize,
        tileSize,
        tileSize,
        drawX,
        drawY,
        drawSize,
        drawSize
      );
    }
  }

  ctx.restore();
  return true;
}

function getPixelTextureCanvas(image, sampleSize = 32) {
  if (!canDrawSprite(image)) {
    return null;
  }

  const cacheKey = `pixelTexture${sampleSize}`;

  if (!image[cacheKey]) {
    const canvas = document.createElement("canvas");
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0, sampleSize, sampleSize);
    image[cacheKey] = canvas;
  }

  return image[cacheKey];
}

function drawPixelTextureFill(image, x, y, width, height, options = {}) {
  const sampleSize = options.sampleSize ?? 32;
  const tileDrawSize = options.tileDrawSize ?? 48;
  const textureCanvas = getPixelTextureCanvas(image, sampleSize);

  if (!textureCanvas) {
    return false;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.globalAlpha = options.alpha ?? 1;

  for (let drawY = y; drawY < y + height + tileDrawSize; drawY += tileDrawSize) {
    for (let drawX = x; drawX < x + width + tileDrawSize; drawX += tileDrawSize) {
      ctx.drawImage(textureCanvas, drawX, drawY, tileDrawSize, tileDrawSize);
    }
  }

  ctx.restore();
  return true;
}

function drawArchiveFloor(room, beams) {
  const floor = {
    x: room.x + 16,
    y: room.y + 100,
    width: room.width - 32,
    height: room.height - 160,
  };

  if (!drawPixelTextureFill(environmentSprites.archiveParquet, floor.x, floor.y, floor.width, floor.height, {
    sampleSize: 28,
    tileDrawSize: 56,
    alpha: 0.96,
  })) {
    ctx.fillStyle = "#7a593e";
    ctx.fillRect(floor.x, floor.y, floor.width, floor.height);

    for (let y = floor.y; y < floor.y + floor.height - 58; y += 20) {
      ctx.fillStyle = y % 40 === 0 ? "#815f42" : "#6d5038";
      ctx.fillRect(floor.x, y, floor.width, 16);
    }
    return;
  }

  ctx.fillStyle = "rgba(104, 70, 46, 0.18)";
  ctx.fillRect(floor.x, floor.y, floor.width, floor.height);

  for (let y = floor.y; y < floor.y + floor.height; y += 20) {
    ctx.fillStyle = Math.floor((y - floor.y) / 20) % 2 === 0 ? "rgba(83, 56, 39, 0.18)" : "rgba(138, 95, 66, 0.06)";
    ctx.fillRect(floor.x, y, floor.width, 12);
  }

  for (const x of beams) {
    ctx.fillStyle = "rgba(33, 20, 14, 0.12)";
    ctx.fillRect(x - 6, floor.y, 18, floor.height);
  }

  ctx.fillStyle = "rgba(28, 18, 13, 0.16)";
  ctx.fillRect(floor.x, floor.y + floor.height - 20, floor.width, 20);
  ctx.fillRect(floor.x, floor.y, floor.width, 14);
}

function getPlayerSpriteSheet() {
  const animationSet = player.isMoving ? playerSprites.run : playerSprites.idle;
  return animationSet[player.direction] ?? animationSet.down;
}

function getPlayerFrameIndex() {
  if (player.isMoving) {
    return Math.floor(player.walkTime) % PLAYER_SPRITE.frameCount;
  }

  return Math.floor(state.lastTimestamp / PLAYER_SPRITE.idleFrameDuration) % PLAYER_SPRITE.frameCount;
}

function createVillageLevel() {
  const decorations = createVillageDecorations();

  return {
    id: "village",
    label: "Màn 1: Đêm mưa thuộc địa",
    canvasLabel: "Màn chơi 1: Đêm mưa thuộc địa",
    pauseTitle: "Đêm mưa thuộc địa",
    spawn: { x: 128, y: 366, direction: "right" },
    bounds: { minX: 15, maxX: 945, minY: 21, maxY: 621 },
    aboutSlide: {
      kicker: "Màn 1",
      title: "Đêm đen nô lệ",
      text:
        "Ngôi làng đổ nát trong mưa gợi lại bối cảnh Việt Nam dưới ách thuộc địa trước năm 1930. Mỗi tương tác ở đây mở ra bóng tối áp bức và sự bế tắc của những con đường cứu nước cũ.",
      caption: "Mưa lạnh, mái nhà đổ nát và con đường dẫn lịch sử tới một bước ngoặt",
      art: "peasant",
    },
    exits: [
      {
        id: "east-road",
        kind: "edge-right",
        prompt: "Lối phía đông -> Màn 2",
        target: "archive",
        hintMinX: WORLD.width - 128,
        triggerX: 944,
        minY: 294,
        maxY: 414,
        spawn: { x: 110, y: 438, direction: "right" },
        guide: {
          color: "#f3d777",
          glowAlpha: 0.3,
          markers: [
            { x: 468, y: 362, direction: "right" },
            { x: 572, y: 362, direction: "right" },
            { x: 676, y: 362, direction: "right" },
            { x: 780, y: 362, direction: "right" },
            { x: 884, y: 362, direction: "right" },
          ],
        },
      },
    ],
    interactables: [
      {
        id: "old-peasant",
        x: 324,
        y: 366,
        width: 22,
        height: 42,
        kind: "npc",
        variant: "peasant",
        spriteKey: "npc02",
        direction: "down",
        animation: "idle",
        frameOffset: 0.8,
        prompt: "trò chuyện với người nông dân",
        slide: {
          kicker: "Màn 1",
          title: "ĐÊM ĐEN NÔ LỆ & KHỦNG HOẢNG ĐƯỜNG LỐI",
          text:
            "- Bối cảnh thuộc địa: Cuối thế kỷ XIX, dưới ách thống trị của thực dân Pháp, Việt Nam từ một quốc gia phong kiến độc lập đã biến thành nước thuộc địa nửa phong kiến. Nhân dân, đặc biệt là giai cấp nông dân, bị bần cùng hóa, phá sản và bóc lột nặng nề.\n\n- Sự bế tắc của các phong trào yêu nước: Với truyền thống yêu nước anh dũng, các phong trào khởi nghĩa nổ ra liên tiếp. Từ phong trào Cần Vương của sĩ phu phong kiến, khởi nghĩa nông dân Yên Thế, đến khuynh hướng dân chủ tư sản như Đông Du, Việt Nam Quang phục Hội. Tuy nhiên, tất cả đều thất bại và bị dìm trong biển máu do thiếu một đường lối chính trị đúng đắn, thiếu tổ chức chặt chẽ và không có cơ sở rộng rãi trong quần chúng.",
          caption: "Đêm dài thuộc địa và sự bế tắc của những con đường cứu nước đầu thế kỷ XX",
          gallery: [
            {
              src: "assets/story/level1/colonial-exploitation.png",
              alt: "Người dân Việt Nam lao động khổ cực dưới ách bóc lột của thực dân Pháp",
              caption: "Người dân Việt Nam bị bóc lột nặng nề dưới ách thống trị của thực dân Pháp.",
            },
            {
              src: "assets/story/level1/patriotic-scholars.png",
              alt: "Hai chí sĩ yêu nước Phan Bội Châu và Phan Châu Trinh",
              caption: "Các chí sĩ yêu nước tiêu biểu đầu thế kỷ XX: Phan Bội Châu và Phan Châu Trinh.",
            },
          ],
        },
      },
      {
        id: "scholar-desk",
        x: 618,
        y: 286,
        width: 24,
        height: 18,
        kind: "object",
        variant: "desk",
        prompt: "xem chiếc bàn học bỏ hoang",
        slide: {
          kicker: "Màn 1",
          title: "Khủng hoảng đường lối",
          text:
            "Nhân dân bế tắc, xã hội phân hóa sâu sắc. Nếu cứ tiếp diễn, dân tộc sẽ mãi cam chịu kiếp nô lệ.",
          caption: "Bàn học đổ nát gợi lên một ngã rẽ lịch sử chưa tìm thấy lối ra",
          art: "desk",
        },
      },
      {
        id: "flame-relic",
        x: 854,
        y: 470,
        width: 28,
        height: 34,
        kind: "object",
        variant: "story-relic",
        prompt: "nhặt Hỏa ấn Dân tộc",
        interactionType: "pickup",
        itemId: "flame-of-the-people",
      },
      {
        id: "forsaken-idol",
        x: 150,
        y: 430,
        width: 34,
        height: 44,
        kind: "object",
        variant: "corrupt-obelisk",
        prompt: "chạm vào tượng đen nứt vỡ",
        interactionType: "corrupt",
        saDoaDelta: 18,
      },
    ],
    monsters: [
      {
        id: "village-wraith",
        name: "Bóng đói khát",
        variant: "wraith",
        x: 726,
        y: 380,
        width: 18,
        height: 26,
        maxHealth: 3,
        damage: 1,
        aggroRadius: 128,
        patrolRadius: 20,
      },
    ],
    colliders: createVillageColliders(decorations),
    decorations,
  };
}

function createVillageColliders(decorations) {
  const houseColliders = decorations.houses.map((house) => {
    const scale = house.spriteScale ?? 1;
    const drawWidth = Math.round(128 * scale);
    const drawHeight = Math.round(128 * scale);
    const spriteX = house.spriteX ?? house.x + house.width / 2;
    const spriteY = house.spriteY ?? house.y + house.height;
    const x = Math.round(spriteX - drawWidth / 2 + 10);
    const y = Math.round(spriteY - drawHeight + 12);
    const width = Math.max(24, drawWidth - 20);
    const height = drawHeight + 16;

    return { x, y, width, height };
  });

  const fenceColliders = decorations.fenceSegments.map((segment) => ({
    x: segment.x - 8,
    y: segment.y + 18,
    width: segment.posts * 14 + 8,
    height: 28,
  }));

  const cartColliders = decorations.brokenCarts.map((cart) => ({
    x: cart.x - Math.round(cart.width / 2) - 5,
    y: cart.y - 8,
    width: cart.width + 12,
    height: 22,
  }));

  return [
    ...houseColliders,
    ...fenceColliders,
    ...cartColliders,
    { x: WORLD.width - 78, y: 266, width: 14, height: 64 },
    { x: WORLD.width - 40, y: 274, width: 14, height: 58 },
  ];
}

function createArchiveLevel() {
  const decorations = createArchiveDecorations();

  return {
    id: "archive",
    label: "Màn 2: Hồ sơ năm 1930",
    canvasLabel: "Màn chơi 2: Hồ sơ năm 1930",
    pauseTitle: "Hồ sơ năm 1930",
    spawn: { x: 110, y: 438, direction: "right" },
    bounds: { minX: 92, maxX: 868, minY: 88, maxY: 562 },
    aboutSlide: {
      kicker: "Màn 2",
      title: "Hồ sơ năm 1930",
      text:
        "Trong căn phòng tài liệu tối, những mảnh tư tưởng rời rạc bắt đầu hội tụ. Đây là nơi câu chuyện chuyển từ chia rẽ sang thống nhất và tìm thấy bàn chỉ nam lịch sử.",
      caption: "Một không gian lặng im, nơi khủng hoảng đường lối dần nhường chỗ cho sự hợp nhất",
      art: "compass",
    },
    exits: [
      {
        id: "north-door",
        kind: "rect",
        prompt: "Cửa phía bắc -> Màn 3",
        x: 430,
        y: 68,
        width: 100,
        height: 64,
        target: "crossroads",
        spawn: { x: 480, y: 548, direction: "up" },
        guide: {
          color: "#f0c56c",
          glowAlpha: 0.26,
          markers: [
            { x: 250, y: 476, direction: "right" },
            { x: 344, y: 476, direction: "right" },
            { x: 438, y: 476, direction: "right" },
            { x: 480, y: 392, direction: "up" },
            { x: 480, y: 308, direction: "up" },
          ],
        },
      },
    ],
    interactables: [
      {
        id: "glowing-fragments",
        x: 390,
        y: 314,
        width: 46,
        height: 34,
        kind: "object",
        variant: "fragment-table",
        prompt: "nghiên cứu những mảnh tài liệu",
        slide: {
          kicker: "Màn 2",
          title: "SỰ HỘI TỤ 1930 & BÀN CHỈ NAM CỦA LỊCH SỬ",
          text:
            "- Nguy cơ chia rẽ: Cuối năm 1929, phong trào cách mạng lên cao dẫn đến sự ra đời của 3 tổ chức cộng sản hoạt động biệt lập: Đông Dương Cộng sản Đảng, An Nam Cộng sản Đảng, Đông Dương Cộng sản Liên đoàn. Sự tồn tại biệt lập này có nguy cơ dẫn đến chia rẽ lớn, công kích lẫn nhau, làm suy yếu sức mạnh dân tộc.\n\n- Sự hợp nhất vĩ đại: Ngày 3/2/1930 tại Hương Cảng, lãnh tụ Nguyễn Ái Quốc với tư cách phái viên Quốc tế Cộng sản đã chủ trì hội nghị, gạt bỏ thành kiến, thống nhất các tổ chức thành Đảng Cộng sản Việt Nam. Cương lĩnh chính trị đầu tiên do Người soạn thảo đã xác định mục tiêu làm cách mạng tư sản dân quyền và thổ địa cách mạng để đi tới xã hội cộng sản.\n\n- Chiếc la bàn dẫn đường: Chủ tịch Hồ Chí Minh khẳng định: \"Đảng mà không có chủ nghĩa cũng như tàu không có bàn chỉ nam\". Sự ra đời của Đảng Cộng sản Việt Nam là một bước ngoặt vĩ đại, chấm dứt thời kỳ khủng hoảng đường lối, đáp ứng khát vọng giải phóng dân tộc của nhân dân ta.",
          caption: "Từ nguy cơ chia rẽ đến sự hợp nhất lịch sử và chiếc la bàn lý luận cho cách mạng Việt Nam",
          gallery: [
            {
              src: "assets/story/level2/party-unification-1930.png",
              alt: "Nguyễn Ái Quốc chủ trì hội nghị hợp nhất ba tổ chức cộng sản tại Hương Cảng năm 1930",
              caption: "Hội nghị do Nguyễn Ái Quốc chủ trì tại Hương Cảng, hợp nhất ba tổ chức cộng sản thành Đảng Cộng sản Việt Nam.",
            },
            {
              src: "assets/story/level2/duong-kach-menh.png",
              alt: "Tác phẩm Đường Kách Mệnh",
              caption: "Tác phẩm Đường Kách Mệnh - nền tảng lý luận cách mạng, một bàn chỉ nam cho phong trào giải phóng dân tộc.",
            },
          ],
        },
      },
      {
        id: "guiding-compass",
        x: 694,
        y: 292,
        width: 38,
        height: 46,
        kind: "object",
        variant: "compass-pedestal",
        prompt: "xem chiếc la bàn phát sáng",
        slide: {
          kicker: "Màn 2",
          title: "Bàn Chỉ Nam Của Lịch Sử",
          text:
            "Bác Hồ từng nói: Đảng mà không có chủ nghĩa cũng như tàu không có bàn chỉ nam. Sự ra đời của Đảng đã chấm dứt thời kỳ khủng hoảng đường lối, là bước ngoặt vĩ đại của lịch sử dân tộc.",
          caption: "Chiếc bàn chỉ nam phát sáng giữa căn phòng gỗ trầm ấm",
          art: "compass",
        },
      },
      {
        id: "archive-seal-1",
        x: 244,
        y: 478,
        width: 28,
        height: 30,
        kind: "object",
        variant: "memory-seal",
        prompt: "kích hoạt ấn tín thứ nhất",
        interactionType: "puzzle",
        puzzleKey: "archive-sequence",
        puzzleOrder: 0,
      },
      {
        id: "archive-seal-2",
        x: 480,
        y: 236,
        width: 28,
        height: 30,
        kind: "object",
        variant: "memory-seal",
        prompt: "kích hoạt ấn tín thứ hai",
        interactionType: "puzzle",
        puzzleKey: "archive-sequence",
        puzzleOrder: 1,
      },
      {
        id: "archive-seal-3",
        x: 706,
        y: 478,
        width: 28,
        height: 30,
        kind: "object",
        variant: "memory-seal",
        prompt: "kích hoạt ấn tín cuối",
        interactionType: "puzzle",
        puzzleKey: "archive-sequence",
        puzzleOrder: 2,
      },
    ],
    colliders: [
      { x: 102, y: 128, width: 70, height: 268 },
      { x: 790, y: 128, width: 70, height: 268 },
      { x: 112, y: 438, width: 94, height: 84 },
      { x: 364, y: 312, width: 54, height: 12 },
      { x: 686, y: 296, width: 18, height: 18 },
    ],
    decorations,
  };
}

function createCrossroadsLevel() {
  const decorations = createCrossroadsDecorations();

  return {
    id: "crossroads",
    label: "Màn 3: Hai ngả lịch sử",
    canvasLabel: "Màn chơi 3: Hai ngả lịch sử",
    pauseTitle: "Hai ngả lịch sử",
    spawn: { x: 480, y: 548, direction: "up" },
    bounds: { minX: 24, maxX: 936, minY: 20, maxY: 620 },
    aboutSlide: {
      kicker: "Màn 3",
      title: "Hai ngả lịch sử",
      text:
        "Vùng đất này tách làm hai nửa sáng - tối. Một bên là sức mạnh quần chúng làm nên Cách mạng Tháng Tám, bên kia là hiểm họa chia cắt và quyết tâm thống nhất đất nước.",
      caption: "Từ hai nhánh đối lập, lịch sử đi tới lựa chọn quyết định vận mệnh dân tộc",
      art: "crowd",
    },
    exits: [
      {
        id: "final-path",
        kind: "rect",
        prompt: "Lối phát sáng -> Màn 4",
        x: 440,
        y: 14,
        width: 80,
        height: 120,
        target: "spring",
        spawn: { x: 480, y: 546, direction: "up" },
        guide: {
          color: "#fff09e",
          glowAlpha: 0.36,
          markers: [
            { x: 480, y: 522, direction: "up" },
            { x: 480, y: 434, direction: "up" },
            { x: 480, y: 346, direction: "up" },
          ],
        },
      },
    ],
    interactables: [
      {
        id: "united-gathering",
        x: 714,
        y: 360,
        width: 48,
        height: 28,
        kind: "object",
        variant: "crowd-gathering",
        prompt: "bước vào khối đoàn kết",
        slide: {
          kicker: "Màn 3",
          title: "MẶT TRẬN VIỆT MINH & KỲ TÍCH CÁCH MẠNG THÁNG TÁM",
          text:
            "- Quy tụ sức mạnh quần chúng: Chủ nghĩa Mác - Lênin khẳng định: Cách mạng là sự nghiệp của quần chúng nhân dân. Tại Hội nghị Trung ương 8 (tháng 5/1941), Đảng quyết định đặt nhiệm vụ giải phóng dân tộc lên hàng đầu và thành lập Mặt trận Việt Nam Độc lập Đồng minh (Việt Minh) để quy tụ khối đại đoàn kết toàn dân tộc.\n\n- Nghệ thuật chớp thời cơ: Khi phát xít Nhật đầu hàng Đồng minh, Đảng đã kịp thời phát động cuộc Tổng khởi nghĩa Tháng Tám năm 1945. Lệnh Tổng khởi nghĩa nhấn mạnh nguyên tắc \"tập trung - thống nhất - kịp thời\".\n\n- Thành quả vĩ đại: Chỉ 15 năm sau khi thành lập, một Đảng Cộng sản non trẻ đã lãnh đạo nhân dân làm nên kỳ tích, xóa bỏ tận gốc chế độ thuộc địa nửa phong kiến, lập ra nước Việt Nam Dân chủ Cộng hòa, mở ra kỷ nguyên độc lập tự do.",
          caption: "Từ Mặt trận Việt Minh đến kỳ tích Tháng Tám 1945: sức mạnh quần chúng được tổ chức thành sức mạnh cách mạng",
          gallery: [
            {
              src: "assets/story/level3/viet-minh-1941.png",
              alt: "Lực lượng Việt Minh trong những năm đầu thành lập năm 1941",
              caption: "Mặt trận Việt Minh năm 1941 - hạt nhân quy tụ khối đại đoàn kết toàn dân vì mục tiêu giải phóng dân tộc.",
            },
            {
              src: "assets/story/level3/august-revolution-1945.png",
              alt: "Quần chúng và lực lượng cách mạng trong Cách mạng Tháng Tám năm 1945",
              caption: "Cách mạng Tháng Tám 1945 - cuộc tổng khởi nghĩa giành chính quyền, mở ra kỷ nguyên độc lập cho dân tộc.",
            },
          ],
        },
      },
      {
        id: "broken-bridge",
        x: 242,
        y: 314,
        width: 44,
        height: 28,
        kind: "object",
        variant: "broken-bridge",
        prompt: "xem vùng đất bị chia cắt",
        slide: {
          kicker: "Màn 3",
          title: "VƯỢT QUA GIỚI TUYẾN - VIỄN CẢNH CHIA CẮT VÀ SỰ THỐNG NHẤT",
          text:
            "- Hiểm hoạ chia cắt vĩnh viễn: Sau cuộc kháng chiến chống Pháp, theo Hiệp định Giơnevơ (1954), đất nước ta bị chia cắt làm 2 miền, lấy vĩ tuyến 17 làm giới tuyến quân sự tạm thời. Tuy nhiên, đế quốc Mỹ đã hất cẳng Pháp hòng độc chiếm miền Nam, âm mưu biến nơi đây thành thuộc địa kiểu mới, chia cắt lâu dài đất nước ta.\n\n- Đường lối sáng tạo cứu vãn dân tộc: Đứng trước nguy cơ mất nước một nửa, Đại hội III của Đảng (1960) đã vạch ra đường lối chiến lược vô cùng độc đáo: tiến hành đồng thời hai nhiệm vụ chiến lược là cách mạng XHCN ở miền Bắc và cách mạng dân tộc dân chủ nhân dân ở miền Nam. Cả hai nhiệm vụ này đều phục vụ mục đích chung duy nhất: giải phóng miền Nam, thống nhất đất nước.",
          caption: "Từ giới tuyến chia cắt tạm thời đến quyết tâm chiến lược vì một Việt Nam thống nhất",
          gallery: [
            {
              src: "assets/story/level3/vietnam-divided-17th-parallel.png",
              alt: "Bản đồ Việt Nam bị chia cắt bởi vĩ tuyến 17 sau Hiệp định Giơnevơ năm 1954",
              caption: "Bản đồ Việt Nam tạm thời bị chia cắt tại vĩ tuyến 17 sau Hiệp định Giơnevơ năm 1954.",
            },
          ],
        },
      },
      {
        id: "split-obelisk",
        x: 124,
        y: 206,
        width: 34,
        height: 44,
        kind: "object",
        variant: "corrupt-obelisk",
        prompt: "đụng vào trụ đá méo mó",
        interactionType: "corrupt",
        saDoaDelta: 24,
      },
    ],
    monsters: [
      {
        id: "bridge-devourer",
        name: "Thú nuốt ranh giới",
        variant: "devourer",
        x: 286,
        y: 354,
        width: 22,
        height: 24,
        maxHealth: 4,
        damage: 1,
        aggroRadius: 150,
        patrolRadius: 24,
        dropItemId: "unity-seal",
      },
    ],
    colliders: [
      { x: 188, y: 306, width: 116, height: 16 },
      { x: 672, y: 356, width: 88, height: 28 },
      { x: 594, y: 184, width: 74, height: 42 },
      { x: 780, y: 182, width: 72, height: 44 },
      { x: 398, y: 222, width: 20, height: 34 },
    ],
    decorations,
  };
}

function createSpringLevel() {
  const decorations = createSpringDecorations();

  return {
    id: "spring",
    label: "Màn 4: Mùa xuân Đổi Mới",
    canvasLabel: "Màn chơi 4: Mùa xuân Đổi Mới",
    pauseTitle: "Mùa xuân Đổi Mới",
    spawn: { x: 480, y: 546, direction: "up" },
    bounds: { minX: 28, maxX: 932, minY: 18, maxY: 618 },
    aboutSlide: {
      kicker: "Màn 4",
      title: "Mùa xuân Đổi Mới",
      text:
        "Chặng cuối mở ra trong một thung lũng sáng, nơi hòa bình, phát triển và đổi mới thay cho đổ nát. Đây là câu chuyện về bản lĩnh người cầm lái và con đường hướng tới tương lai.",
      caption: "Một miền sáng của đổi mới, nơi thành quả lịch sử hiện lên bằng nhịp sống và sức sống mới",
      art: "spring",
    },
    exits: [],
    interactables: [
      {
        id: "grand-tree",
        x: 480,
        y: 316,
        interactionOffsetY: 34,
        interactionRadius: 44,
        width: 44,
        height: 56,
        kind: "object",
        variant: "grand-tree",
        prompt: "đứng trước cây đại thụ",
        slide: {
          kicker: "Màn 4",
          title: "KHỞI XƯỚNG ĐỔI MỚI & BẢN LĨNH NGƯỜI CẦM LÁI",
          text:
            "- Vượt qua khủng hoảng: Sau năm 1975, cả nước đi lên Chủ nghĩa Xã hội nhưng gặp phải vô vàn khó khăn do hậu quả chiến tranh và cơ chế tập trung quan liêu, bao cấp, dẫn đến cuộc khủng hoảng kinh tế - xã hội trầm trọng.\n\n- Công cuộc Đổi Mới toàn diện: Với bản lĩnh kiên cường dám nhìn thẳng vào sự thật, Đại hội VI của Đảng (1986) đã đề ra đường lối Đổi mới toàn diện, trọng tâm là đổi mới tư duy kinh tế.\n\n- Vững bước tương lai: Chuyển sang nền kinh tế thị trường định hướng XHCN và chủ động hội nhập quốc tế, Đảng đã đưa đất nước thoát khỏi khủng hoảng. Thực tiễn lịch sử chứng minh: Sự lãnh đạo đúng đắn của Đảng là nhân tố hàng đầu bảo đảm mọi thắng lợi của cách mạng Việt Nam, hướng tới mục tiêu \"Dân giàu, nước mạnh, xã hội công bằng, dân chủ, văn minh\".",
          caption: "Từ bản lĩnh đổi mới đến một Việt Nam hiện đại, hội nhập và vững bước trong tương lai",
          gallery: [
            {
              src: "assets/story/level4/doi-moi-typography.png",
              alt: "Typography cổ động với thông điệp dân giàu nước mạnh, dân chủ, công bằng, văn minh",
              caption: "Hình ảnh cổ động thể hiện khát vọng xây dựng một Việt Nam dân giàu, nước mạnh, dân chủ, công bằng, văn minh.",
            },
            {
              src: "assets/story/level4/modern-infrastructure.png",
              alt: "Cơ sở hạ tầng đô thị hiện đại của Việt Nam ngày nay",
              caption: "Diện mạo hạ tầng hiện đại hôm nay là một minh chứng cho chặng đường đổi mới, phát triển và hội nhập của đất nước.",
            },
          ],
        },
      },
      {
        id: "renewal-altar",
        x: 480,
        y: 392,
        width: 26,
        height: 22,
        kind: "object",
        variant: "ending-altar",
        prompt: "đặt các tín vật vào bệ kết ấn",
        interactionType: "ending",
      },
    ],
    monsters: [
      {
        id: "future-blight",
        name: "Tàn dư hỗn mang",
        variant: "blight",
        x: 692,
        y: 314,
        width: 24,
        height: 28,
        maxHealth: 4,
        damage: 1,
        aggroRadius: 150,
        patrolRadius: 26,
        dropItemId: "renewal-seed",
      },
    ],
    colliders: [
      { x: 458, y: 328, width: 44, height: 24 },
      { x: 120, y: 420, width: 118, height: 58 },
      { x: 720, y: 420, width: 122, height: 58 },
      { x: 650, y: 190, width: 138, height: 76 },
    ],
    decorations,
  };
}

function createVillageDecorations() {
  const houses = [
    { x: 78, y: 174, width: 82, height: 62, breakSide: "right", spriteIndex: 0, spriteX: 122, spriteY: 324, spriteScale: 0.88 },
    { x: 224, y: 168, width: 90, height: 66, breakSide: "left", spriteIndex: 3, spriteX: 268, spriteY: 320, spriteScale: 0.9 },
    { x: 384, y: 172, width: 94, height: 64, breakSide: "middle", spriteIndex: 5, spriteX: 430, spriteY: 322, spriteScale: 0.88 },
    { x: 552, y: 174, width: 86, height: 60, breakSide: "right", spriteIndex: 4, spriteX: 596, spriteY: 324, spriteScale: 0.86 },
    { x: 724, y: 176, width: 78, height: 58, breakSide: "left", spriteIndex: 2, spriteX: 764, spriteY: 320, spriteScale: 0.88 },
  ];

  const deadTrees = [
    { x: 156, y: 238, height: 44, spread: 18 },
    { x: 282, y: 214, height: 34, spread: 14 },
    { x: 456, y: 242, height: 48, spread: 20 },
    { x: 682, y: 224, height: 40, spread: 18 },
    { x: 836, y: 248, height: 42, spread: 16 },
  ];

  const dryGrass = [
    { x: 86, y: 320, variant: 0, scale: 0.82 },
    { x: 142, y: 312, variant: 1, scale: 0.86 },
    { x: 324, y: 322, variant: 2, scale: 0.78 },
    { x: 414, y: 304, variant: 4, scale: 0.92 },
    { x: 598, y: 322, variant: 0, scale: 0.86 },
    { x: 706, y: 296, variant: 1, scale: 0.82 },
    { x: 860, y: 324, variant: 2, scale: 0.76 },
    { x: 250, y: 446, variant: 3, scale: 0.92 },
    { x: 398, y: 486, variant: 0, scale: 0.88 },
    { x: 748, y: 486, variant: 1, scale: 0.84 },
  ];

  const branchDebris = [
    { x: 126, y: 308, variant: 1, scale: 0.44, rotation: -0.26 },
    { x: 222, y: 286, variant: 0, scale: 0.48, rotation: 0.22 },
    { x: 384, y: 326, variant: 1, scale: 0.42, rotation: -0.12 },
    { x: 494, y: 286, variant: 2, scale: 0.36, rotation: 0.18 },
    { x: 592, y: 352, variant: 0, scale: 0.46, rotation: -0.3 },
    { x: 734, y: 286, variant: 1, scale: 0.4, rotation: 0.08 },
    { x: 812, y: 414, variant: 2, scale: 0.34, rotation: -0.16 },
  ];

  const brokenCarts = [
    { x: 236, y: 408, width: 30, height: 16, brokenSide: "left" },
    { x: 548, y: 408, width: 28, height: 16, brokenSide: "right" },
    { x: 790, y: 430, width: 30, height: 16, brokenSide: "left" },
  ];

  const fenceSegments = [
    { x: 104, y: 298, posts: 5, brokenIndex: 2 },
    { x: 168, y: 300, posts: 4, brokenIndex: 1 },
    { x: 404, y: 454, posts: 6, brokenIndex: 4 },
    { x: 664, y: 284, posts: 5, brokenIndex: 3 },
    { x: 736, y: 452, posts: 4, brokenIndex: 1 },
  ];

  const puddles = [
    { x: 92, y: 348, width: 34, height: 12 },
    { x: 274, y: 332, width: 46, height: 14 },
    { x: 458, y: 352, width: 42, height: 12 },
    { x: 640, y: 336, width: 54, height: 14 },
    { x: 812, y: 354, width: 36, height: 12 },
  ];

  const rubble = [];

  for (let i = 0; i < 56; i += 1) {
    rubble.push({
      x: 26 + ((i * 53) % (WORLD.width - 52)),
      y: VILLAGE_SKYLINE_Y + 18 + ((i * 31) % (WORLD.height - VILLAGE_SKYLINE_Y - 42)),
      size: 2 + (i % 3),
      tone: i % 2,
    });
  }

  const rain = Array.from({ length: 160 }, (_, index) => ({
    x: (index * 17) % (VIEWPORT.width + 34),
    y: (index * 11) % (VIEWPORT.height + 28),
    speed: 1.08 + (index % 5) * 0.24,
    drift: 0.9 + (index % 4) * 0.2,
    length: 13 + (index % 5) * 2,
    alpha: 0.22 + (index % 4) * 0.08,
  }));

  const clouds = [
    { x: 46, y: 34, width: 100, height: 18 },
    { x: 204, y: 52, width: 146, height: 20 },
    { x: 442, y: 28, width: 124, height: 18 },
    { x: 658, y: 48, width: 158, height: 22 },
  ];

  return {
    houses,
    deadTrees,
    dryGrass,
    branchDebris,
    brokenCarts,
    fenceSegments,
    puddles,
    rubble,
    rain,
    clouds,
  };
}

function createArchiveDecorations() {
  const shelves = [
    { x: 102, y: 128, width: 70, height: 268 },
    { x: 790, y: 128, width: 70, height: 268 },
  ];

  const embers = Array.from({ length: 22 }, (_, index) => ({
    x: 124 + (index % 6) * 10,
    y: 498 + Math.floor(index / 6) * 6,
    rise: 0.8 + (index % 4) * 0.18,
    drift: 3 + (index % 3),
    alpha: 0.22 + (index % 3) * 0.08,
    size: 2 + (index % 2),
    offset: index * 0.7,
  }));

  const bookStacks = [
    { x: 244, y: 482, width: 22, height: 16 },
    { x: 614, y: 472, width: 20, height: 18 },
    { x: 738, y: 436, width: 16, height: 14 },
  ];

  const candles = [
    { x: 304, y: 248, height: 18 },
    { x: 544, y: 224, height: 16 },
  ];

  return {
    shelves,
    embers,
    bookStacks,
    candles,
    room: { x: 74, y: 62, width: 812, height: 516 },
    rug: { x: 246, y: 384, width: 468, height: 122 },
    fireplace: { x: 112, y: 438, width: 94, height: 84 },
    entry: { x: 76, y: 414, width: 44, height: 88 },
    northDoor: { x: 434, y: 68, width: 92, height: 62 },
    beams: [118, 286, 478, 670, 838],
  };
}

function createCrossroadsDecorations() {
  const cracks = [
    { x: 66, y: 242, width: 122, branch: 24 },
    { x: 124, y: 394, width: 164, branch: 18 },
    { x: 218, y: 502, width: 144, branch: 22 },
    { x: 300, y: 286, width: 92, branch: 16 },
  ];

  const rocks = [
    { x: 96, y: 222, size: 12 },
    { x: 142, y: 472, size: 16 },
    { x: 208, y: 548, size: 10 },
    { x: 314, y: 212, size: 14 },
    { x: 356, y: 430, size: 18 },
  ];

  const dryGrass = [
    { x: 74, y: 282, variant: 0, scale: 0.8, rotation: -0.08 },
    { x: 132, y: 346, variant: 1, scale: 0.76, rotation: 0.12 },
    { x: 198, y: 520, variant: 2, scale: 0.74, rotation: -0.05 },
    { x: 258, y: 308, variant: 3, scale: 0.9, rotation: 0.16 },
    { x: 324, y: 452, variant: 0, scale: 0.78, rotation: -0.1 },
    { x: 386, y: 274, variant: 1, scale: 0.72, rotation: 0.06 },
    { x: 428, y: 404, variant: 4, scale: 0.82, rotation: -0.18 },
  ];

  const flags = [
    { x: 622, y: 214, height: 54, width: 24 },
    { x: 746, y: 196, height: 62, width: 26 },
    { x: 842, y: 232, height: 50, width: 22 },
  ];

  const crowdOffsets = [
    {
      x: -28,
      y: 6,
      spriteKey: "npc01",
      direction: "downleft",
      animation: "idle",
      frameOffset: 0.1,
      scale: 0.88,
      shirt: "#8d6a42",
      pants: "#2e3440",
    },
    {
      x: -16,
      y: 0,
      spriteKey: "npc02",
      direction: "down",
      animation: "walk",
      frameOffset: 0.8,
      scale: 0.88,
      shirt: "#486b91",
      pants: "#28303a",
    },
    {
      x: -4,
      y: 8,
      spriteKey: "npc03",
      direction: "right",
      animation: "idle",
      frameOffset: 1.3,
      scale: 0.9,
      shirt: "#7f4a68",
      pants: "#2d2d38",
    },
    {
      x: 8,
      y: -2,
      spriteKey: "npc04",
      direction: "down",
      animation: "walk",
      frameOffset: 2.2,
      scale: 0.92,
      shirt: "#6c8446",
      pants: "#29323b",
    },
    {
      x: 20,
      y: 6,
      spriteKey: "npc05",
      direction: "left",
      animation: "idle",
      frameOffset: 0.5,
      scale: 0.9,
      shirt: "#a35f46",
      pants: "#2c3140",
    },
    {
      x: 30,
      y: 1,
      spriteKey: "npc06",
      direction: "downright",
      animation: "walk",
      frameOffset: 3.1,
      scale: 0.9,
      shirt: "#4c6f8a",
      pants: "#2a2e36",
    },
    {
      x: -22,
      y: 16,
      spriteKey: "npc03",
      direction: "up",
      animation: "idle",
      frameOffset: 1.9,
      scale: 0.84,
      shirt: "#597747",
      pants: "#242b31",
    },
    {
      x: -8,
      y: 18,
      spriteKey: "npc04",
      direction: "downleft",
      animation: "walk",
      frameOffset: 2.8,
      scale: 0.84,
      shirt: "#8d6b3e",
      pants: "#282d35",
    },
    {
      x: 8,
      y: 16,
      spriteKey: "npc01",
      direction: "upright",
      animation: "idle",
      frameOffset: 0.4,
      scale: 0.84,
      shirt: "#6e4b79",
      pants: "#242933",
    },
    {
      x: 24,
      y: 17,
      spriteKey: "npc06",
      direction: "upleft",
      animation: "walk",
      frameOffset: 4.2,
      scale: 0.84,
      shirt: "#54718b",
      pants: "#252b35",
    },
  ];

  const motes = Array.from({ length: 32 }, (_, index) => ({
    x: 420 + (index % 6) * 18,
    y: 456 - Math.floor(index / 6) * 34,
    rise: 0.7 + (index % 4) * 0.16,
    drift: 2 + (index % 3),
    alpha: 0.16 + (index % 3) * 0.08,
    size: 2 + (index % 2),
    offset: index * 0.6,
  }));

  return {
    cracks,
    rocks,
    dryGrass,
    flags,
    crowdOffsets,
    motes,
    splitX: 480,
    barrenTree: { x: 404, y: 252, height: 62, spread: 26 },
    brokenBridge: { x: 244, y: 314, width: 146, gap: 36 },
    square: { x: 562, y: 238, width: 316, height: 264 },
    glowingPath: { x: 442, y: 24, width: 76, height: 540 },
    finalArch: { x: 434, y: 16, width: 92, height: 54 },
    villageHouses: [
      { x: 594, y: 172, width: 74, height: 54 },
      { x: 780, y: 168, width: 72, height: 58 },
    ],
  };
}

function createSpringDecorations() {
  const clouds = [
    { x: 88, y: 36, width: 96, height: 18 },
    { x: 286, y: 52, width: 118, height: 20 },
    { x: 578, y: 40, width: 138, height: 22 },
    { x: 766, y: 64, width: 92, height: 18 },
  ];

  const blossomTrees = [
    { x: 150, y: 286, height: 44, bloom: "#f1b8cb", leaf: "#72b25c" },
    { x: 244, y: 212, height: 40, bloom: "#f7c6d8", leaf: "#7cbc61" },
    { x: 688, y: 238, height: 42, bloom: "#f5c2d5", leaf: "#78b95f" },
    { x: 820, y: 282, height: 48, bloom: "#e9afc4", leaf: "#75af56" },
  ];

  const cropPlots = [
    { x: 112, y: 414, width: 136, height: 64, soil: "#9a6d41", crop: "#7fb74b" },
    { x: 716, y: 414, width: 138, height: 64, soil: "#8f643b", crop: "#78b149" },
  ];

  const flowers = Array.from({ length: 56 }, (_, index) => ({
    x: 46 + ((index * 47) % (WORLD.width - 92)),
    y: 278 + ((index * 29) % 292),
    tone: index % 3,
  }));

  const petals = Array.from({ length: 42 }, (_, index) => ({
    x: (index * 19) % (VIEWPORT.width + 36),
    y: (index * 23) % (VIEWPORT.height + 24),
    speed: 0.45 + (index % 4) * 0.15,
    drift: 0.7 + (index % 3) * 0.22,
    size: 2 + (index % 2),
    alpha: 0.18 + (index % 3) * 0.06,
  }));

  return {
    clouds,
    blossomTrees,
    cropPlots,
    flowers,
    petals,
    pond: { x: 648, y: 188, width: 142, height: 80 },
    path: { x: 434, y: 344, width: 92, height: 270 },
    plaza: { x: 404, y: 290, width: 152, height: 96 },
  };
}

function createHubLevel() {
  const decorations = createHubDecorations();

  return {
    id: "hub",
    label: "Trung tâm: Cánh Cửa Lịch Sử",
    canvasLabel: "Trung tâm thế giới: Cánh Cửa Lịch Sử",
    pauseTitle: "Cánh Cửa Lịch Sử",
    spawn: { x: 480, y: 548, direction: "up" },
    bounds: { minX: 40, maxX: 920, minY: 34, maxY: 606 },
    aboutSlide: {
      kicker: "World Map",
      title: "Trung tâm của lịch sử",
      text:
        "Bốn khu vực lớn của hành trình đều nối về quảng trường trung tâm. Cánh Cửa Lịch Sử ở giữa sẽ chỉ mở khi bạn thu thập đủ 5 vật phẩm then chốt và giữ thanh Tha hóa ở mức an toàn.",
      caption: "Bốn cổng chuyển cảnh bao quanh một cánh cửa bị phong ấn",
      art: "bridge",
    },
    exits: [
      {
        id: "to-fog-port",
        kind: "rect",
        prompt: "Cổng Sương Mù -> Khu vực 1",
        x: 166,
        y: 194,
        width: 104,
        height: 124,
        target: "village",
        spawn: { x: 124, y: 104, direction: "down" },
        guide: {
          color: "#d7ebff",
          glowAlpha: 0.36,
          size: 4,
          markers: [
            { x: 392, y: 332, direction: "left" },
            { x: 324, y: 332, direction: "left" },
            { x: 258, y: 332, direction: "left" },
            { x: 218, y: 294, direction: "up" },
            { x: 218, y: 248, direction: "up" },
          ],
        },
      },
      {
        id: "to-three-room-house",
        kind: "rect",
        prompt: "Nhà gỗ ba gian -> Khu vực 2",
        x: 690,
        y: 194,
        width: 104,
        height: 124,
        target: "archive",
        spawn: { x: 480, y: 560, direction: "up" },
        guide: {
          color: "#f4d9af",
          glowAlpha: 0.36,
          size: 4,
          markers: [
            { x: 568, y: 332, direction: "right" },
            { x: 636, y: 332, direction: "right" },
            { x: 702, y: 332, direction: "right" },
            { x: 740, y: 294, direction: "up" },
            { x: 740, y: 248, direction: "up" },
          ],
        },
      },
      {
        id: "to-red-square",
        kind: "rect",
        prompt: "Quảng trường đỏ -> Khu vực 3",
        x: 228,
        y: 390,
        width: 104,
        height: 140,
        target: "crossroads",
        spawn: { x: 482, y: 88, direction: "down" },
        guide: {
          color: "#f3dc7f",
          glowAlpha: 0.36,
          size: 4,
          markers: [
            { x: 392, y: 404, direction: "left" },
            { x: 328, y: 404, direction: "left" },
            { x: 280, y: 404, direction: "left" },
            { x: 280, y: 438, direction: "down" },
            { x: 280, y: 472, direction: "down" },
          ],
        },
      },
      {
        id: "to-doi-moi-valley",
        kind: "rect",
        prompt: "Thung lũng Đổi Mới -> Khu vực 4",
        x: 628,
        y: 390,
        width: 104,
        height: 140,
        target: "spring",
        spawn: { x: 482, y: 560, direction: "up" },
        guide: {
          color: "#d7efab",
          glowAlpha: 0.36,
          size: 4,
          markers: [
            { x: 568, y: 404, direction: "right" },
            { x: 632, y: 404, direction: "right" },
            { x: 680, y: 404, direction: "right" },
            { x: 680, y: 438, direction: "down" },
            { x: 680, y: 472, direction: "down" },
          ],
        },
      },
    ],
    interactables: [
      {
        id: "final-history-gate",
        x: 480,
        y: 246,
        width: 72,
        height: 88,
        kind: "object",
        variant: "final-history-gate",
        prompt: "đặt 5 vật phẩm lên Cánh Cửa Lịch Sử",
        interactionType: "ending",
        interactionRadius: 76,
        interactionOffsetY: 18,
      },
    ],
    colliders: [
      { x: 450, y: 198, width: 60, height: 86 },
      { x: 352, y: 246, width: 28, height: 30 },
      { x: 584, y: 246, width: 28, height: 30 },
      { x: 314, y: 414, width: 52, height: 18 },
      { x: 598, y: 414, width: 52, height: 18 },
    ],
    decorations,
  };
}

function createPortMazeLevel() {
  const decorations = createPortMazeDecorations();

  return {
    id: "village",
    label: "Khu vực 1: Mê cung sương mù & Bến cảng",
    canvasLabel: "Khu vực 1: Mê cung sương mù và Bến cảng",
    pauseTitle: "Mê cung sương mù & Bến cảng",
    spawn: { x: 124, y: 104, direction: "down" },
    bounds: { minX: 24, maxX: 936, minY: 24, maxY: 616 },
    aboutSlide: {
      kicker: "Khu vực 1",
      title: "Bế tắc trước 1930",
      text:
        "Khu rừng sương mù với những lối cụt tượng trưng cho sự bế tắc của các phong trào cứu nước cũ, còn bến cảng phơi bày cảnh bóc lột, sưu cao thuế nặng dưới ách thực dân.",
      caption: "Từ mê cung bế tắc tới bến cảng của những người lao động bị áp bức",
      art: "peasant",
    },
    exits: [
      {
        id: "back-to-hub-1",
        kind: "rect",
        prompt: "Lối quay lại trung tâm",
        x: 70,
        y: 36,
        width: 96,
        height: 70,
        target: "hub",
        spawn: { x: 218, y: 356, direction: "down" },
        portal: { label: "Trung tam", labelOffsetY: 34, drawSize: 54, auraRadius: 42 },
        guide: {
          color: "#f3d777",
          glowAlpha: 0.34,
          size: 3,
          visibleWhen: () => state.quests.zone1RewardClaimed,
          markers: [
            { x: 204, y: 176, direction: "left", size: 2 },
            { x: 154, y: 136, direction: "up", size: 2 },
            { x: 122, y: 86, direction: "up", size: 2 },
          ],
        },
      },
    ],
    interactables: [
      {
        id: "nguyen-ai-quoc",
        x: 536,
        y: 516,
        width: 22,
        height: 40,
        kind: "npc",
        spriteKey: "npc06",
        direction: "left",
        animation: "idle",
        prompt: "trò chuyện với Nguyễn Ái Quốc",
        slide: {
          kicker: "Khu vực 1",
          title: "Người mang ngọn đèn dẫn đường",
          text:
            "Nguyễn Ái Quốc đem đến cho những người lao động bị áp bức một con đường mới: cách mạng vô sản, tổ chức quần chúng và giác ngộ bằng báo chí cách mạng.",
          caption: "Le Paria đến tay công nhân như một ánh lửa mở đường",
          art: "desk",
        },
      },
      {
        id: "le-paria-stack",
        x: 490,
        y: 548,
        width: 28,
        height: 34,
        kind: "object",
        variant: "paper-bundle",
        prompt: "nhận các tờ báo Người Cùng Khổ",
        interactionType: "startPapers",
      },
      {
        id: "worker-harbor-1",
        x: 414,
        y: 528,
        width: 20,
        height: 38,
        kind: "npc",
        spriteKey: "npc01",
        direction: "right",
        animation: "idle",
        prompt: "đưa báo cho công nhân bốc vác",
        interactionType: "deliverPaper",
        workerId: "worker-1",
      },
      {
        id: "worker-harbor-2",
        x: 684,
        y: 530,
        width: 20,
        height: 38,
        kind: "npc",
        spriteKey: "npc03",
        direction: "left",
        animation: "idle",
        prompt: "đưa báo cho công nhân bến tàu",
        interactionType: "deliverPaper",
        workerId: "worker-2",
      },
      {
        id: "worker-harbor-3",
        x: 764,
        y: 510,
        width: 20,
        height: 38,
        kind: "npc",
        spriteKey: "npc05",
        direction: "left",
        animation: "idle",
        prompt: "đưa báo cho người phu khuân vác",
        interactionType: "deliverPaper",
        workerId: "worker-3",
      },
      {
        id: "red-compass-reward",
        x: 560,
        y: 476,
        width: 18,
        height: 18,
        kind: "object",
        variant: "story-relic",
        prompt: "nhận Chiếc La Bàn Đỏ",
        interactionType: "rewardCompass",
      },
      {
        id: "puppet-mandarin",
        x: 832,
        y: 210,
        width: 22,
        height: 40,
        kind: "npc",
        spriteKey: "npc04",
        direction: "left",
        animation: "idle",
        prompt: "nghe lời dụ dỗ của quan lại bù nhìn",
        interactionType: "offerBribe",
      },
      {
        id: "tenant-farmer",
        x: 786,
        y: 296,
        width: 20,
        height: 38,
        kind: "npc",
        spriteKey: "npc02",
        direction: "down",
        animation: "idle",
        prompt: "an ủi người nông dân bị bóc lột",
        attackPenalty: 18,
        attackPenaltyMessage: "Bạn quay lưng với dân nghèo đang trông chờ được giải cứu.",
      },
    ],
    monsters: [
      {
        id: "colonial-overseer",
        name: "Lính canh thực dân",
        variant: "devourer",
        x: 700,
        y: 498,
        width: 22,
        height: 24,
        maxHealth: 3,
        damage: 1,
        aggroRadius: 116,
        patrolRadius: 18,
      },
    ],
    colliders: [
      { x: 86, y: 96, width: 22, height: 350 },
      { x: 90, y: 454, width: 232, height: 20 },
      { x: 184, y: 136, width: 186, height: 20 },
      { x: 350, y: 136, width: 20, height: 160 },
      { x: 184, y: 282, width: 160, height: 20 },
      { x: 444, y: 94, width: 20, height: 194 },
      { x: 444, y: 270, width: 136, height: 20 },
      { x: 564, y: 180, width: 20, height: 164 },
      { x: 226, y: 382, width: 236, height: 18 },
      { x: 0, y: 562, width: WORLD.width, height: 24 },
      { x: 766, y: 150, width: 138, height: 104 },
    ],
    decorations,
  };
}

function createUnityHouseLevel() {
  const decorations = createUnityHouseDecorations();

  return {
    id: "archive",
    label: "Khu vực 2: Căn nhà gỗ ba gian",
    canvasLabel: "Khu vực 2: Căn nhà gỗ ba gian",
    pauseTitle: "Căn nhà gỗ ba gian",
    spawn: { x: 480, y: 560, direction: "up" },
    bounds: { minX: 76, maxX: 884, minY: 64, maxY: 578 },
    aboutSlide: {
      kicker: "Khu vực 2",
      title: "Ba tổ chức và một bàn tròn",
      text:
        "Ba căn phòng khóa kín tượng trưng cho ba tổ chức cộng sản hoạt động biệt lập. Chỉ bằng thuyết phục, gạt bỏ thành kiến và hợp nhất lực lượng, bạn mới tạo được biểu tượng thống nhất.",
      caption: "Ngôi nhà gỗ ba gian là thử thách của sự đoàn kết",
      art: "compass",
    },
    exits: [
      {
        id: "back-to-hub-2",
        kind: "rect",
        prompt: "Lối quay lại trung tâm",
        x: 430,
        y: 548,
        width: 100,
        height: 56,
        target: "hub",
        spawn: { x: 740, y: 356, direction: "down" },
        portal: { label: "Trung tam", labelOffsetY: -52, drawSize: 56, auraRadius: 44 },
        guide: {
          color: "#f3d777",
          glowAlpha: 0.34,
          size: 3,
          visibleWhen: () => state.quests.zone2RewardClaimed,
          markers: [
            { x: 480, y: 404, direction: "down", size: 2 },
            { x: 480, y: 468, direction: "down", size: 2 },
            { x: 480, y: 522, direction: "down", size: 2 },
          ],
        },
      },
    ],
    interactables: [
      {
        id: "delegate-east",
        x: 768,
        y: 248,
        width: 22,
        height: 40,
        kind: "npc",
        spriteKey: "npc01",
        direction: "left",
        animation: "idle",
        prompt: "thuyết phục nhóm An Nam Cộng sản Đảng",
        interactionType: "collectFragment",
        fragmentId: "east",
      },
      {
        id: "delegate-west",
        x: 192,
        y: 248,
        width: 22,
        height: 40,
        kind: "npc",
        spriteKey: "npc03",
        direction: "right",
        animation: "idle",
        prompt: "thuyết phục nhóm Đông Dương Cộng sản Đảng",
        interactionType: "collectFragment",
        fragmentId: "west",
      },
      {
        id: "delegate-north",
        x: 480,
        y: 152,
        width: 22,
        height: 40,
        kind: "npc",
        spriteKey: "npc05",
        direction: "down",
        animation: "idle",
        prompt: "thuyết phục nhóm Đông Dương Cộng sản Liên đoàn",
        interactionType: "collectFragment",
        fragmentId: "north",
      },
      {
        id: "unity-round-table",
        x: 480,
        y: 294,
        width: 34,
        height: 18,
        kind: "object",
        variant: "unity-table",
        prompt: "đặt ba mảnh vỡ lên bàn tròn",
        interactionType: "rewardEmblem",
      },
      {
        id: "split-blade",
        x: 760,
        y: 486,
        width: 34,
        height: 44,
        kind: "object",
        variant: "corrupt-obelisk",
        prompt: "dùng vũ lực để chia rẽ ba tổ chức",
        interactionType: "splitChoice",
      },
    ],
    monsters: [],
    colliders: [
      { x: 110, y: 88, width: 154, height: 16 },
      { x: 110, y: 88, width: 16, height: 214 },
      { x: 248, y: 88, width: 16, height: 214 },
      { x: 110, y: 286, width: 63, height: 16 },
      { x: 201, y: 286, width: 63, height: 16 },
      { x: 704, y: 88, width: 154, height: 16 },
      { x: 704, y: 88, width: 16, height: 214 },
      { x: 842, y: 88, width: 16, height: 214 },
      { x: 704, y: 286, width: 63, height: 16 },
      { x: 795, y: 286, width: 63, height: 16 },
      { x: 372, y: 74, width: 214, height: 16 },
      { x: 372, y: 74, width: 16, height: 126 },
      { x: 570, y: 74, width: 16, height: 126 },
      { x: 372, y: 184, width: 93, height: 16 },
      { x: 493, y: 184, width: 93, height: 16 },
      { x: 294, y: 230, width: 28, height: 194 },
      { x: 640, y: 230, width: 28, height: 194 },
      { x: 178, y: 452, width: 228, height: 26 },
      { x: 554, y: 452, width: 244, height: 26 },
    ],
    decorations,
  };
}

function createRedSquareLevel() {
  const decorations = createRedSquareDecorations();

  return {
    id: "crossroads",
    label: "Khu vực 3: Quảng trường đỏ & Chiếc cầu gãy",
    canvasLabel: "Khu vực 3: Quảng trường đỏ và Chiếc cầu gãy",
    pauseTitle: "Quảng trường đỏ & Chiếc cầu gãy",
    spawn: { x: 482, y: 88, direction: "down" },
    bounds: { minX: 26, maxX: 934, minY: 24, maxY: 618 },
    aboutSlide: {
      kicker: "Khu vực 3",
      title: "Vĩ tuyến 17 và khối đại đoàn kết",
      text:
        "Đây là khu vực rộng lớn nhất: nửa trên là quảng trường Việt Minh quy tụ toàn dân, nửa dưới là miền Nam bị đàn áp, ấp chiến lược và một lời dụ dỗ chia cắt vĩnh viễn đất nước.",
      caption: "Một dòng sông xiết chia đôi đất nước tại vĩ tuyến 17",
      art: "crowd",
    },
    exits: [
      {
        id: "back-to-hub-3",
        kind: "rect",
        prompt: "Lối quay lại trung tâm",
        x: 432,
        y: 28,
        width: 96,
        height: 56,
        target: "hub",
        spawn: { x: 280, y: 368, direction: "up" },
        portal: { label: "Trung tam", labelOffsetY: 34, drawSize: 54, auraRadius: 42 },
        guide: {
          color: "#f3d777",
          glowAlpha: 0.34,
          size: 3,
          visibleWhen: () => state.quests.zone3ThreadClaimed && state.quests.zone3MapClaimed,
          markers: [
            { x: 480, y: 180, direction: "up", size: 2 },
            { x: 480, y: 124, direction: "up", size: 2 },
            { x: 480, y: 74, direction: "up", size: 2 },
          ],
        },
      },
    ],
    interactables: [
      {
        id: "vietminh-cadre",
        x: 480,
        y: 176,
        width: 22,
        height: 40,
        kind: "npc",
        spriteKey: "npc06",
        direction: "down",
        animation: "idle",
        prompt: "gặp cán bộ Mặt trận",
        interactionType: "rewardThread",
      },
      {
        id: "recruit-farmer",
        x: 184,
        y: 174,
        width: 20,
        height: 38,
        kind: "npc",
        spriteKey: "npc02",
        direction: "right",
        animation: "idle",
        prompt: "mời người nông dân về Quảng trường Đỏ",
        interactionType: "recruit",
        recruitId: "farmer",
      },
      {
        id: "recruit-worker",
        x: 756,
        y: 184,
        width: 20,
        height: 38,
        kind: "npc",
        spriteKey: "npc01",
        direction: "left",
        animation: "idle",
        prompt: "mời người công nhân gia nhập khối đoàn kết",
        interactionType: "recruit",
        recruitId: "worker",
      },
      {
        id: "recruit-intellectual",
        x: 330,
        y: 110,
        width: 20,
        height: 38,
        kind: "npc",
        spriteKey: "npc05",
        direction: "down",
        animation: "idle",
        prompt: "thuyết phục trí thức yêu nước",
        interactionType: "recruit",
        recruitId: "intellectual",
      },
      {
        id: "recruit-bourgeois",
        x: 628,
        y: 110,
        width: 20,
        height: 38,
        kind: "npc",
        spriteKey: "npc03",
        direction: "down",
        animation: "idle",
        prompt: "mời tư sản dân tộc đứng vào mặt trận",
        interactionType: "recruit",
        recruitId: "bourgeois",
      },
      {
        id: "landlord-patriot",
        x: 160,
        y: 246,
        width: 20,
        height: 38,
        kind: "npc",
        spriteKey: "npc04",
        direction: "right",
        animation: "idle",
        prompt: "liên hiệp với địa chủ kháng chiến",
        attackPenalty: 32,
        attackPenaltyMessage: "Bạn mắc sai lầm tả khuynh, tấn công cả lực lượng có thể liên hiệp.",
      },
      {
        id: "middle-peasant",
        x: 804,
        y: 246,
        width: 20,
        height: 38,
        kind: "npc",
        spriteKey: "npc05",
        direction: "left",
        animation: "idle",
        prompt: "trấn an trung nông đang hoang mang",
        attackPenalty: 24,
        attackPenaltyMessage: "Bạn đàn áp sai người và làm tổn hại niềm tin của quần chúng.",
      },
      {
        id: "hamlet-1",
        x: 210,
        y: 478,
        width: 28,
        height: 24,
        kind: "object",
        variant: "strategic-hamlet",
        prompt: "phá một ấp chiến lược",
        interactionType: "rescueHamlet",
        hamletId: "hamlet-1",
      },
      {
        id: "hamlet-2",
        x: 482,
        y: 468,
        width: 28,
        height: 24,
        kind: "object",
        variant: "strategic-hamlet",
        prompt: "phá ấp chiến lược gần vĩ tuyến",
        interactionType: "rescueHamlet",
        hamletId: "hamlet-2",
      },
      {
        id: "hamlet-3",
        x: 784,
        y: 474,
        width: 28,
        height: 24,
        kind: "object",
        variant: "strategic-hamlet",
        prompt: "giải cứu dân khỏi ấp chiến lược",
        interactionType: "rescueHamlet",
        hamletId: "hamlet-3",
      },
      {
        id: "resistance-commander",
        x: 816,
        y: 524,
        width: 22,
        height: 40,
        kind: "npc",
        spriteKey: "npc06",
        direction: "left",
        animation: "idle",
        prompt: "nhận Bản đồ hàn gắn",
        interactionType: "rewardMap",
      },
      {
        id: "foreign-advisor",
        x: 146,
        y: 530,
        width: 22,
        height: 40,
        kind: "npc",
        spriteKey: "npc01",
        direction: "right",
        animation: "idle",
        prompt: "ký hiệp ước chia cắt vĩnh viễn",
        interactionType: "permanentDivision",
      },
    ],
    monsters: [
      {
        id: "southern-tyrant",
        name: "Bộ máy áp bức miền Nam",
        variant: "blight",
        x: 588,
        y: 476,
        width: 28,
        height: 28,
        maxHealth: 5,
        damage: 1,
        aggroRadius: 150,
        patrolRadius: 30,
      },
    ],
    colliders: [
      { x: 0, y: 262, width: 446, height: 92 },
      { x: 514, y: 262, width: WORLD.width - 514, height: 92 },
      { x: 178, y: 456, width: 84, height: 34, hamletId: "hamlet-1" },
      { x: 440, y: 446, width: 84, height: 34, hamletId: "hamlet-2" },
      { x: 742, y: 452, width: 84, height: 34, hamletId: "hamlet-3" },
      { x: 422, y: 36, width: 116, height: 24 },
    ],
    decorations,
  };
}

function createDoiMoiValleyLevel() {
  const decorations = createDoiMoiValleyDecorations();

  return {
    id: "spring",
    label: "Khu vực 4: Thung lũng Đổi Mới",
    canvasLabel: "Khu vực 4: Thung lũng Đổi Mới",
    pauseTitle: "Thung lũng Đổi Mới",
    spawn: { x: 482, y: 560, direction: "up" },
    bounds: { minX: 26, maxX: 934, minY: 26, maxY: 618 },
    aboutSlide: {
      kicker: "Khu vực 4",
      title: "Phá rào bao cấp, mở đường đổi mới",
      text:
        "Thung lũng sáng bừng lên bởi ruộng đồng, nhà máy và chợ mới. Nhưng ở góc cũ kỹ vẫn còn khu chợ tem phiếu, lạm phát và hàng rào cơ chế quan liêu bao cấp cản lối phát triển.",
      caption: "Khoảnh khắc chuyển mình từ trì trệ sang tự chủ sản xuất",
      art: "spring",
    },
    exits: [
      {
        id: "back-to-hub-4",
        kind: "rect",
        prompt: "Lối quay lại trung tâm",
        x: 434,
        y: 550,
        width: 96,
        height: 56,
        target: "hub",
        spawn: { x: 680, y: 368, direction: "up" },
        portal: { label: "Trung tam", labelOffsetY: -52, drawSize: 56, auraRadius: 44 },
        guide: {
          color: "#f3d777",
          glowAlpha: 0.34,
          size: 3,
          visibleWhen: () => state.quests.zone4GearClaimed,
          markers: [
            { x: 480, y: 422, direction: "down", size: 2 },
            { x: 480, y: 482, direction: "down", size: 2 },
            { x: 480, y: 536, direction: "down", size: 2 },
          ],
        },
      },
    ],
    interactables: [
      {
        id: "bao-cap-wall-1",
        x: 388,
        y: 392,
        width: 26,
        height: 22,
        kind: "object",
        variant: "bureaucracy-wall",
        prompt: "phá hàng rào cơ chế quan liêu",
        interactionType: "breakBarrier",
        barrierId: "wall-1",
      },
      {
        id: "bao-cap-wall-2",
        x: 480,
        y: 386,
        width: 26,
        height: 22,
        kind: "object",
        variant: "bureaucracy-wall",
        prompt: "tháo một rào cản bao cấp",
        interactionType: "breakBarrier",
        barrierId: "wall-2",
      },
      {
        id: "bao-cap-wall-3",
        x: 572,
        y: 392,
        width: 26,
        height: 22,
        kind: "object",
        variant: "bureaucracy-wall",
        prompt: "dỡ bỏ cơ chế trì trệ",
        interactionType: "breakBarrier",
        barrierId: "wall-3",
      },
      {
        id: "farmer-khoan-1",
        x: 208,
        y: 452,
        width: 20,
        height: 38,
        kind: "npc",
        spriteKey: "npc02",
        direction: "right",
        animation: "idle",
        prompt: "trao Khoán 10 cho hộ nông dân",
        interactionType: "deliverKhoan10",
        farmerId: "farmer-1",
      },
      {
        id: "farmer-khoan-2",
        x: 698,
        y: 318,
        width: 20,
        height: 38,
        kind: "npc",
        spriteKey: "npc03",
        direction: "left",
        animation: "idle",
        prompt: "trao Khoán 10 cho người sản xuất",
        interactionType: "deliverKhoan10",
        farmerId: "farmer-2",
      },
      {
        id: "farmer-khoan-3",
        x: 824,
        y: 110,
        width: 20,
        height: 38,
        kind: "npc",
        spriteKey: "npc01",
        direction: "left",
        animation: "idle",
        prompt: "phát Khoán 10 cho hộ nông dân cuối",
        interactionType: "deliverKhoan10",
        farmerId: "farmer-3",
      },
      {
        id: "doi-moi-leader",
        x: 480,
        y: 338,
        width: 22,
        height: 40,
        kind: "npc",
        spriteKey: "npc06",
        direction: "down",
        animation: "idle",
        prompt: "gặp nhà lãnh đạo để nhận Bánh răng Đổi Mới",
        interactionType: "rewardGear",
        slide: {
          kicker: "Khu vực 4",
          title: "Khoán 10 và bước ngoặt Đổi Mới",
          text:
            "Phá bỏ cơ chế quan liêu bao cấp, giao quyền chủ động sản xuất cho nông dân và giải phóng sức sản xuất là bước mở đầu để nền kinh tế bung ra và Đổi Mới thành công.",
          caption: "Từ kho tem phiếu sang cánh đồng tự chủ sản xuất",
          art: "spring",
        },
      },
      {
        id: "ration-market",
        x: 196,
        y: 330,
        width: 24,
        height: 22,
        kind: "object",
        variant: "ration-market",
        prompt: "xem khu chợ tem phiếu cũ",
      },
      {
        id: "corrupt-official",
        x: 286,
        y: 170,
        width: 22,
        height: 40,
        kind: "npc",
        spriteKey: "npc04",
        direction: "right",
        animation: "idle",
        prompt: "tham nhũng, bòn rút của công",
        interactionType: "fillCorruption",
      },
      {
        id: "pluralism-broker",
        x: 676,
        y: 424,
        width: 22,
        height: 40,
        kind: "npc",
        spriteKey: "npc05",
        direction: "left",
        animation: "idle",
        prompt: "nghe lời dụ dỗ từ bỏ con đường xã hội chủ nghĩa",
        interactionType: "ideologyTrap",
      },
    ],
    monsters: [],
    colliders: [
      { x: 120, y: 286, width: 204, height: 76 },
      { x: 88, y: 100, width: 284, height: 132 },
      { x: 560, y: 324, width: 196, height: 136 },
      { x: 354, y: 394, width: 68, height: 24, barrierId: "wall-1" },
      { x: 446, y: 388, width: 68, height: 24, barrierId: "wall-2" },
      { x: 538, y: 394, width: 68, height: 24, barrierId: "wall-3" },
    ],
    decorations,
  };
}

function createHubDecorations() {
  return {
    stars: Array.from({ length: 44 }, (_, index) => ({
      x: 48 + ((index * 73) % 860),
      y: 42 + ((index * 37) % 180),
      size: 1 + (index % 2),
    })),
    portals: [
      { x: 218, y: 262, color: "#cdd7ef", glow: "#7ea3d7", title: "Khu 1", subtitle: "Sương mù", labelOffsetY: 44 },
      { x: 740, y: 262, color: "#efd6ab", glow: "#d59f62", title: "Khu 2", subtitle: "Nha go", labelOffsetY: 44 },
      { x: 280, y: 476, color: "#f3d85b", glow: "#bf4739", title: "Khu 3", subtitle: "Cau gay", labelOffsetY: -74 },
      { x: 680, y: 476, color: "#d9f0a7", glow: "#6db05a", title: "Khu 4", subtitle: "Doi Moi", labelOffsetY: -74 },
    ],
    plaza: { x: 238, y: 146, width: 484, height: 354 },
    gate: { x: 445, y: 198, width: 70, height: 82 },
    cainosProps: [
      { sprite: "statue", x: 342, y: 216, scale: 0.62 },
      { sprite: "statue", x: 582, y: 216, scale: 0.62 },
      { sprite: "bench", x: 314, y: 382, scale: 0.72 },
      { sprite: "bench", x: 598, y: 382, scale: 0.72 },
    ],
  };
}

function createPortMazeDecorations() {
  return {
    fogBands: Array.from({ length: 10 }, (_, index) => ({
      x: -60 + index * 108,
      y: 72 + ((index * 31) % 270),
      width: 150 + (index % 3) * 30,
      height: 34 + (index % 3) * 12,
      alpha: 0.035 + (index % 3) * 0.018,
    })),
    mazeShrubs: [
      { x: 106, y: 106, width: 282, height: 30 },
      { x: 106, y: 250, width: 248, height: 26 },
      { x: 202, y: 394, width: 282, height: 24 },
      { x: 428, y: 104, width: 24, height: 192 },
      { x: 542, y: 172, width: 24, height: 184 },
      { x: 438, y: 246, width: 146, height: 24 },
      { x: 94, y: 90, width: 24, height: 372 },
    ],
    port: { x: 322, y: 472, width: 514, height: 90 },
    mansion: { x: 740, y: 126, width: 178, height: 142 },
    lampPosts: [
      { x: 410, y: 482 },
      { x: 586, y: 480 },
      { x: 736, y: 476 },
    ],
    crawlerBushes: [
      { x: 62, y: 176, variant: 0, scale: 0.72 },
      { x: 612, y: 154, variant: 5, scale: 0.66 },
      { x: 704, y: 284, variant: 8, scale: 0.58 },
      { x: 916, y: 282, variant: 7, scale: 0.6 },
      { x: 274, y: 446, variant: 2, scale: 0.68 },
    ],
    crawlerTrees: [
      { x: 646, y: 222, variant: 0, scale: 0.76 },
      { x: 922, y: 342, variant: 1, scale: 0.74 },
      { x: 56, y: 422, variant: 3, scale: 0.72 },
    ],
    crawlerTools: [
      { x: 356, y: 554, variant: 0, scale: 0.32, alpha: 0.78 },
      { x: 804, y: 552, variant: 1, scale: 0.3, alpha: 0.72 },
      { x: 880, y: 292, variant: 0, scale: 0.26, alpha: 0.68 },
    ],
    cainosProps: [
      { sprite: "cargoStack", x: 334, y: 500, scale: 0.62 },
      { sprite: "barrel", x: 456, y: 532, scale: 0.82 },
      { sprite: "cargoStack", x: 598, y: 502, scale: 0.62 },
      { sprite: "barrel", x: 724, y: 532, scale: 0.82 },
      { sprite: "bench", x: 794, y: 190, scale: 0.58 },
    ],
  };
}

function createUnityHouseDecorations() {
  return {
    house: { x: 98, y: 74, width: 760, height: 472 },
    rooms: [
      { x: 110, y: 88, width: 154, height: 214 },
      { x: 704, y: 88, width: 154, height: 214 },
      { x: 372, y: 74, width: 214, height: 126 },
    ],
    beams: [146, 320, 482, 644, 810],
    rugs: [
      { x: 160, y: 320, width: 186, height: 84 },
      { x: 612, y: 320, width: 186, height: 84 },
    ],
    limezuFloorProps: [
      { sprite: "rugGold", x: 418, y: 336, scale: 0.84 },
    ],
    houseInteriorFurnitureProps: [
      { sprite: "cabinetTall", x: 126, y: 100, scale: 1.34, filter: "brightness(0.96) saturate(0.9)" },
      { sprite: "writingTable", x: 126, y: 188, scale: 1.24, filter: "brightness(0.97) saturate(0.9)" },
      { sprite: "chairDark", x: 198, y: 194, scale: 1.08, filter: "brightness(0.94) saturate(0.88)" },
      { sprite: "bookStack", x: 128, y: 246, scale: 1.02, filter: "brightness(1.02) saturate(0.92)" },
      { sprite: "drawerCabinet", x: 198, y: 242, scale: 1.04, filter: "brightness(0.97) saturate(0.9)" },

      { sprite: "cupboard", x: 718, y: 98, scale: 1.26, filter: "brightness(0.97) saturate(0.88)" },
      { sprite: "writingTable", x: 710, y: 188, scale: 1.24, filter: "brightness(0.97) saturate(0.9)" },
      { sprite: "chairWood", x: 780, y: 194, scale: 1.08, filter: "brightness(0.97) saturate(0.9)" },
      { sprite: "bookStack", x: 716, y: 246, scale: 1.02, filter: "brightness(1.02) saturate(0.92)" },
      { sprite: "chestLarge", x: 778, y: 242, scale: 1.04, filter: "brightness(0.98) saturate(0.9)" },

      { sprite: "cabinetTall", x: 392, y: 96, scale: 1.26, filter: "brightness(0.97) saturate(0.88)" },
      { sprite: "writingTable", x: 436, y: 106, scale: 1.2, filter: "brightness(0.97) saturate(0.9)" },
      { sprite: "chairScarlet", x: 516, y: 112, scale: 1.08, filter: "brightness(1.02) saturate(0.94)" },
      { sprite: "cupboard", x: 560, y: 96, scale: 1.18, filter: "brightness(0.97) saturate(0.88)" },

      { sprite: "bench", x: 196, y: 366, scale: 1.14, filter: "brightness(0.98) saturate(0.88)" },
      { sprite: "crateOpen", x: 430, y: 364, scale: 1.04, filter: "brightness(0.98) saturate(0.9)" },
      { sprite: "doorPanel", x: 480, y: 362, scale: 1.04, filter: "brightness(0.98) saturate(0.88)" },
      { sprite: "bench", x: 648, y: 366, scale: 1.14, filter: "brightness(0.98) saturate(0.88)" },
      { sprite: "barrel", x: 744, y: 364, scale: 1.02, filter: "brightness(0.97) saturate(0.9)" },
    ],
  };
}

function createRedSquareDecorations() {
  return {
    splitY: 360,
    river: { x: 0, y: 246, width: WORLD.width, height: 106 },
    bridge: { x: 452, y: 236, width: 56, height: 176 },
    northSquare: { x: 96, y: 48, width: 768, height: 214 },
    southTown: { x: 72, y: 392, width: 816, height: 188 },
    flags: [
      { x: 226, y: 102, height: 50 },
      { x: 480, y: 90, height: 68 },
      { x: 732, y: 110, height: 46 },
    ],
    crawlerBushes: [
      { x: 166, y: 438, variant: 5, scale: 0.82 },
      { x: 296, y: 554, variant: 8, scale: 0.76 },
      { x: 652, y: 552, variant: 9, scale: 0.76 },
      { x: 832, y: 438, variant: 4, scale: 0.82 },
    ],
    crawlerTrees: [
      { x: 156, y: 566, variant: 4, scale: 1.04 },
      { x: 860, y: 562, variant: 5, scale: 1.04 },
      { x: 92, y: 286, variant: 2, scale: 0.92 },
    ],
    crawlerTools: [
      { x: 290, y: 560, variant: 1, scale: 0.66 },
      { x: 654, y: 560, variant: 0, scale: 0.66 },
    ],
    cainosProps: [
      { sprite: "statue", x: 184, y: 126, scale: 0.86 },
      { sprite: "statue", x: 714, y: 126, scale: 0.86 },
      { sprite: "bench", x: 250, y: 236, scale: 0.84 },
      { sprite: "bench", x: 612, y: 236, scale: 0.84 },
      { sprite: "cargoStack", x: 190, y: 430, scale: 0.84 },
      { sprite: "barrel", x: 736, y: 454, scale: 1.08 },
    ],
  };
}

function createDoiMoiValleyDecorations() {
  return {
    clouds: [
      { x: 90, y: 56, width: 122, height: 18 },
      { x: 340, y: 38, width: 146, height: 22 },
      { x: 636, y: 64, width: 124, height: 18 },
    ],
    hills: [
      { x: 0, y: 196, width: 320, height: 120, color: "#8ecb66" },
      { x: 212, y: 170, width: 360, height: 146, color: "#77b751" },
      { x: 560, y: 190, width: 400, height: 126, color: "#92ce67" },
    ],
    factories: [
      { x: 104, y: 124, width: 136, height: 88 },
      { x: 232, y: 104, width: 142, height: 100 },
    ],
    rationMarket: { x: 120, y: 292, width: 204, height: 92 },
    riceFields: [
      { x: 98, y: 430, width: 172, height: 102 },
      { x: 358, y: 438, width: 240, height: 94 },
      { x: 650, y: 430, width: 194, height: 102 },
    ],
    crawlerBushes: [
      { x: 80, y: 316, variant: 1, scale: 0.78 },
      { x: 276, y: 370, variant: 0, scale: 0.76 },
      { x: 590, y: 360, variant: 2, scale: 0.78 },
      { x: 882, y: 360, variant: 3, scale: 0.74 },
      { x: 126, y: 556, variant: 10, scale: 0.82 },
      { x: 836, y: 556, variant: 11, scale: 0.82 },
    ],
    crawlerTrees: [
      { x: 62, y: 308, variant: 0, scale: 1.06 },
      { x: 302, y: 296, variant: 1, scale: 1.04 },
      { x: 578, y: 308, variant: 4, scale: 1.04 },
    ],
    crawlerTools: [
      { x: 238, y: 416, variant: 0, scale: 0.7 },
      { x: 570, y: 420, variant: 1, scale: 0.72 },
      { x: 724, y: 416, variant: 0, scale: 0.72 },
    ],
  };
}

function createStoryRegistry(levelMap) {
  const registry = {};

  for (const level of Object.values(levelMap)) {
    for (const item of level.interactables ?? []) {
      if (!item.slide) {
        continue;
      }

      registry[item.id] = {
        id: item.id,
        levelId: level.id,
        ...item.slide,
      };
    }
  }

  return registry;
}

function initializeLevelRuntime() {
  for (const level of Object.values(levels)) {
    for (const item of level.interactables ?? []) {
      item.collected = false;
      item.used = false;
      item.purified = false;
      item.activated = false;
    }

    for (const monster of level.monsters ?? []) {
      monster.homeX = monster.x;
      monster.homeY = monster.y;
      monster.health = monster.maxHealth;
      monster.defeated = false;
      monster.hitFlashUntil = 0;
      monster.lastContactAt = 0;
      monster.attackStartedAt = 0;
      monster.attackEndsAt = 0;
      monster.attackDirection = "down";
      monster.animationState = "idle";
      monster.phase = monster.phase ?? Math.random() * Math.PI * 2;
    }
  }
}

function resetGameplayProgress() {
  state.health = PLAYER_MAX_HEALTH;
  state.saDoa = 0;
  state.inventory.clear();
  state.skillCooldowns.strikeReadyAt = 0;
  state.skillCooldowns.purifyReadyAt = 0;
  state.invulnerableUntil = 0;
  state.activeSkillEffect = null;
  state.endingId = null;
  state.endingSummary = "";
  state.endingCinematic = null;
  state.puzzleState.archiveSequence = 0;
  state.puzzleState.archiveSolved = false;
  state.quests = createQuestState();
  initializeLevelRuntime();
  updateProgressHud();
}

function updateProgressHud() {
  const hpPercent = (state.health / PLAYER_MAX_HEALTH) * 100;
  const saDoaPercent = (state.saDoa / SA_DOA_MAX) * 100;
  const strikeCooldown = getRemainingCooldownMs(state.skillCooldowns.strikeReadyAt);
  const purifyCooldown = getRemainingCooldownMs(state.skillCooldowns.purifyReadyAt);

  hpFill.style.width = `${hpPercent}%`;
  hpValue.textContent = `${state.health} / ${PLAYER_MAX_HEALTH}`;
  saDoaFill.style.width = `${saDoaPercent}%`;
  saDoaValue.textContent = `${state.saDoa}%`;
  inventoryValue.textContent = `${state.inventory.size} / ${RELIC_TARGET_COUNT}`;
  skillValue.textContent = strikeCooldown <= 0 && purifyCooldown <= 0
    ? "J/K OK"
    : `${formatCooldownLabel("J", strikeCooldown)} | ${formatCooldownLabel("K", purifyCooldown)}`;
}

function getRemainingCooldownMs(readyAt) {
  return Math.max(0, Math.ceil(readyAt - state.lastTimestamp));
}

function formatCooldownLabel(key, remainingMs) {
  if (remainingMs <= 0) {
    return `${key} OK`;
  }

  return `${key} ${(remainingMs / 1000).toFixed(1)}s`;
}

function currentLevel() {
  return levels[state.currentLevelId];
}

function getDebugEndingIdFromUrl() {
  const requestedEnding = new URLSearchParams(window.location.search).get("debugEnding");
  return requestedEnding === "good" || requestedEnding === "bad" ? requestedEnding : null;
}

function getDebugLevelIdFromUrl() {
  const requestedLevel = new URLSearchParams(window.location.search).get("debugLevel");
  return requestedLevel && levels[requestedLevel] ? requestedLevel : null;
}

function applyDebugLevelFromUrl() {
  const levelId = getDebugLevelIdFromUrl();

  if (!levelId || getDebugEndingIdFromUrl()) {
    return;
  }

  state.mode = "playing";
  state.aboutFromPause = false;
  state.openingStep = 0;
  keys.clear();
  hideEndOverlay();
  hideDialogue();
  hideOpeningIntro();
  hideStoryToast();
  startScreen.classList.add("hidden");
  startScreen.setAttribute("aria-hidden", "true");
  pauseMenu.classList.add("hidden");
  slideModal.classList.add("hidden");
  interactionPrompt.classList.add("hidden");
  pauseMenu.setAttribute("aria-hidden", "true");
  slideModal.setAttribute("aria-hidden", "true");
  resetStoryProgress();
  loadLevel(levelId);
}

function applyDebugEndingFromUrl() {
  const endingId = getDebugEndingIdFromUrl();

  if (!endingId) {
    return;
  }

  state.aboutFromPause = false;
  state.pendingEnding = false;
  state.endingId = endingId;
  state.endingSummary =
    endingId === "good"
      ? "Preview Good Ending duoc mo bang ?debugEnding=good."
      : "Preview Bad Ending duoc mo bang ?debugEnding=bad.";

  state.inventory.clear();

  if (endingId === "good") {
    for (const relicId of REQUIRED_RELIC_IDS) {
      state.inventory.add(relicId);
    }
    state.saDoa = 18;
  } else {
    state.saDoa = SA_DOA_MAX;
  }

  keys.clear();
  hideDialogue();
  hideOpeningIntro();
  hideStoryToast();
  startScreen.classList.add("hidden");
  startScreen.setAttribute("aria-hidden", "true");
  pauseMenu.classList.add("hidden");
  slideModal.classList.add("hidden");
  interactionPrompt.classList.add("hidden");
  pauseMenu.setAttribute("aria-hidden", "true");
  slideModal.setAttribute("aria-hidden", "true");
  updateProgressHud();
  showEndOverlay();
}

function frame(timestamp) {
  const deltaSeconds = Math.min((timestamp - state.lastTimestamp) / 1000 || 0, 0.033);
  state.lastTimestamp = timestamp;

  if (state.mode === "playing") {
    updatePlayer(deltaSeconds);
    updateMonsters(deltaSeconds);
    updateInteractionPrompt();
  }

  if (state.activeSkillEffect && state.lastTimestamp >= state.activeSkillEffect.endsAt) {
    state.activeSkillEffect = null;
  }

  updateProgressHud();
  render();
  renderEndingArtCinematic();
  renderEndingSceneOverlay();
  requestAnimationFrame(frame);
}

function resetStoryProgress() {
  state.activeSlide = null;
  state.activeDialogue = null;
  state.activeDialogueIndex = 0;
  state.activeStoryIds = [];
  state.activeStoryIndex = 0;
  state.unlockedStoryIds.clear();
  state.pendingEnding = false;
  state.endingId = null;
  hideDialogue();
  hideStoryToast();
  resetGameplayProgress();
  updateBookControls();
  updateStoryBookButton();
}

function updateStoryBookButton() {
  const unlockedCount = state.unlockedStoryIds.size;
  const shouldShow = unlockedCount > 0 && state.mode === "playing";

  storyBookCount.textContent = String(unlockedCount);
  storyBookButton.classList.toggle("hidden", !shouldShow);
  storyBookButton.setAttribute("aria-hidden", shouldShow ? "false" : "true");
}

function updateBookControls() {
  const hasUnlockedBook = state.activeStoryIds.length > 0;

  bookControls.classList.toggle("hidden", !hasUnlockedBook);
  bookControls.setAttribute("aria-hidden", hasUnlockedBook ? "false" : "true");

  if (!hasUnlockedBook) {
    storyPrevButton.disabled = true;
    storyNextButton.disabled = true;
    bookPageIndicator.textContent = "1 / 1";
    return;
  }

  storyPrevButton.disabled = state.activeStoryIndex === 0;
  storyNextButton.disabled = state.activeStoryIndex === state.activeStoryIds.length - 1;
  bookPageIndicator.textContent = `${state.activeStoryIndex + 1} / ${state.activeStoryIds.length}`;
}

function showStoryToast(message) {
  window.clearTimeout(storyToastTimeoutId);
  storyToast.textContent = message;
  storyToast.classList.remove("hidden");
  storyToast.setAttribute("aria-hidden", "false");

  storyToastTimeoutId = window.setTimeout(() => {
    hideStoryToast();
  }, STORY_UNLOCK_TOAST_MS);
}

function hideStoryToast() {
  window.clearTimeout(storyToastTimeoutId);
  storyToast.classList.add("hidden");
  storyToast.setAttribute("aria-hidden", "true");
}

function hideDialogue() {
  dialogueBox.classList.add("hidden");
  dialogueBox.setAttribute("aria-hidden", "true");
}

function hideOpeningIntro() {
  openingIntro.classList.add("hidden");
  openingIntro.setAttribute("aria-hidden", "true");
}

function renderOpeningIntro() {
  const entry = OPENING_DIALOGUE[state.openingStep];

  if (!entry) {
    return;
  }

  openingCard.style.animation = "none";
  openingCard.offsetHeight;
  openingCard.style.animation = "";
  openingSpeaker.textContent = entry.speaker;
  openingProgress.textContent = `${state.openingStep + 1} / ${OPENING_DIALOGUE.length}`;
  openingText.textContent = entry.text;
  openingNextButton.textContent = state.openingStep === OPENING_DIALOGUE.length - 1
    ? "Bắt đầu"
    : "Tiếp tục";
  openingIntro.classList.remove("hidden");
  openingIntro.setAttribute("aria-hidden", "false");
}

function getLegacyInteractionDialogue(item) {
  return INTERACTION_DIALOGUES[item.id] ?? {
    speaker: item.kind === "npc" ? "Nhân chứng" : "Dấu tích",
    lines: [item.slide.caption, item.slide.text],
  };
}

function getInteractionDialogue(item) {
  const scriptedDialogue = INTERACTION_DIALOGUES[item.id];

  if (scriptedDialogue) {
    return scriptedDialogue;
  }

  const lines = [
    item.slide?.caption,
    item.slide?.text,
    item.prompt ? `Ban dung lai de ${item.prompt}.` : "",
    item.kind === "npc"
      ? "Nhan vat nay van con mot manh cau chuyen, du chua co hoi thoai rieng."
      : "Dau tich nay van con gia an va chua kip ke het cau chuyen cua minh.",
  ].filter(Boolean);

  return {
    speaker: item.kind === "npc" ? "Nhan chung" : "Dau tich",
    lines: lines.slice(0, 2),
  };
}

function renderDialogue() {
  const dialogue = state.activeDialogue;

  if (!dialogue) {
    hideDialogue();
    return;
  }

  const currentLine = dialogue.lines[state.activeDialogueIndex];
  const lastLineIndex = dialogue.lines.length - 1;
  const storySeen = state.unlockedStoryIds.has(dialogue.storyId);

  dialogueSpeaker.textContent = dialogue.speaker;
  dialogueProgress.textContent = `${state.activeDialogueIndex + 1} / ${dialogue.lines.length}`;
  dialogueText.textContent = currentLine;
  dialogueNextButton.textContent = state.activeDialogueIndex === lastLineIndex
    ? (storySeen ? "Đóng" : "Mở khóa chuyện")
    : "Tiếp tục";
  dialogueBox.classList.remove("hidden");
  dialogueBox.setAttribute("aria-hidden", "false");
}

function unlockStory(storyId) {
  if (state.unlockedStoryIds.has(storyId)) {
    return false;
  }

  const story = storyRegistry[storyId];

  state.unlockedStoryIds.add(storyId);
  updateStoryBookButton();

  if (story) {
    showStoryToast(`Đã mở khóa: ${story.title}`);
  }

  return true;
}

function startDialogue(item) {
  const dialogue = getInteractionDialogue(item);

  state.mode = "dialogue";
  state.activeDialogue = {
    storyId: item.id,
    speaker: dialogue.speaker,
    lines: dialogue.lines.filter(Boolean),
  };
  state.activeDialogueIndex = 0;
  interactionPrompt.classList.add("hidden");
  hideStoryToast();
  renderDialogue();
  updateStoryBookButton();
}

function finishDialogue() {
  const storyId = state.activeDialogue?.storyId;

  if (storyId) {
    unlockStory(storyId);
  }

  state.activeDialogue = null;
  state.activeDialogueIndex = 0;
  hideDialogue();
  state.mode = "playing";
  updateInteractionPrompt();
  updateStoryBookButton();
}

function advanceDialogue() {
  const dialogue = state.activeDialogue;

  if (!dialogue) {
    return;
  }

  if (state.activeDialogueIndex < dialogue.lines.length - 1) {
    state.activeDialogueIndex += 1;
    renderDialogue();
    return;
  }

  finishDialogue();
}

function cancelDialogue() {
  state.activeDialogue = null;
  state.activeDialogueIndex = 0;
  hideDialogue();

  if (state.mode !== "start") {
    state.mode = "playing";
    updateInteractionPrompt();
  }

  updateStoryBookButton();
}

function getActiveStorySlide() {
  const storyId = state.activeStoryIds[state.activeStoryIndex];

  return storyId ? storyRegistry[storyId] : null;
}

function openStoryBook(preferredStoryId = null) {
  const unlockedStoryIds = Array.from(state.unlockedStoryIds);

  if (unlockedStoryIds.length === 0 || state.mode !== "playing") {
    return;
  }

  const preferredIndex = preferredStoryId ? unlockedStoryIds.indexOf(preferredStoryId) : -1;

  state.activeStoryIds = unlockedStoryIds;
  state.activeStoryIndex = preferredIndex >= 0 ? preferredIndex : unlockedStoryIds.length - 1;

  openSlide(getActiveStorySlide());
}

function showStoryBookEntry(direction) {
  if (state.activeStoryIds.length === 0) {
    return;
  }

  const nextIndex = clamp(state.activeStoryIndex + direction, 0, state.activeStoryIds.length - 1);

  if (nextIndex === state.activeStoryIndex) {
    return;
  }

  state.activeStoryIndex = nextIndex;
  openSlide(getActiveStorySlide());
}

function legacyStartGame() {
  state.mode = "playing";
  state.aboutFromPause = false;
  keys.clear();
  hideEndOverlay();
  startScreen.classList.add("hidden");
  pauseMenu.classList.add("hidden");
  slideModal.classList.add("hidden");
  interactionPrompt.classList.add("hidden");
  pauseMenu.setAttribute("aria-hidden", "true");
  slideModal.setAttribute("aria-hidden", "true");
  resetStoryProgress();
  loadLevel("hub");
  showStoryToast("Mục tiêu mới: đi qua 4 khu vực, tìm đủ 5 vật phẩm và giữ thanh Tha hóa ở mức an toàn.");
}

function legacyReturnToStartScreen() {
  state.mode = "start";
  state.activeInteractionId = null;
  state.aboutFromPause = false;
  keys.clear();
  hideEndOverlay();
  slideModal.classList.add("hidden");
  pauseMenu.classList.add("hidden");
  interactionPrompt.classList.add("hidden");
  slideModal.setAttribute("aria-hidden", "true");
  pauseMenu.setAttribute("aria-hidden", "true");
  resetStoryProgress();
  loadLevel("hub");
  startScreen.classList.remove("hidden");
}

function advanceOpeningIntro() {
  if (state.mode !== "opening") {
    return;
  }

  if (state.openingStep < OPENING_DIALOGUE.length - 1) {
    state.openingStep += 1;
    renderOpeningIntro();
    return;
  }

  beginGameSession();
}

function beginGameSession() {
  state.mode = "playing";
  state.aboutFromPause = false;
  state.openingStep = 0;
  keys.clear();
  hideEndOverlay();
  hideOpeningIntro();
  startScreen.classList.add("hidden");
  startScreen.setAttribute("aria-hidden", "true");
  pauseMenu.classList.add("hidden");
  slideModal.classList.add("hidden");
  interactionPrompt.classList.add("hidden");
  pauseMenu.setAttribute("aria-hidden", "true");
  slideModal.setAttribute("aria-hidden", "true");
  resetStoryProgress();
  loadLevel("hub");
  showStoryToast("Mục tiêu mới: đi qua 4 khu vực, tìm đủ 5 vật phẩm và giữ thanh Tha hóa ở mức an toàn.");
}

function startGame() {
  state.mode = "opening";
  state.aboutFromPause = false;
  state.openingStep = 0;
  keys.clear();
  hideEndOverlay();
  hideDialogue();
  hideStoryToast();
  hideOpeningIntro();
  startScreen.classList.add("hidden");
  startScreen.setAttribute("aria-hidden", "true");
  pauseMenu.classList.add("hidden");
  slideModal.classList.add("hidden");
  interactionPrompt.classList.add("hidden");
  pauseMenu.setAttribute("aria-hidden", "true");
  slideModal.setAttribute("aria-hidden", "true");
  renderOpeningIntro();
  updateStoryBookButton();
}

function returnToStartScreen() {
  state.mode = "start";
  state.activeInteractionId = null;
  state.aboutFromPause = false;
  state.openingStep = 0;
  keys.clear();
  hideEndOverlay();
  hideOpeningIntro();
  slideModal.classList.add("hidden");
  pauseMenu.classList.add("hidden");
  interactionPrompt.classList.add("hidden");
  slideModal.setAttribute("aria-hidden", "true");
  pauseMenu.setAttribute("aria-hidden", "true");
  resetStoryProgress();
  loadLevel("hub");
  startScreen.classList.remove("hidden");
  startScreen.setAttribute("aria-hidden", "false");
}

function togglePause() {
  if (state.mode === "playing") {
    state.mode = "paused";
    pauseMenu.classList.remove("hidden");
    pauseMenu.setAttribute("aria-hidden", "false");
    updateStoryBookButton();
    return;
  }

  if (state.mode === "paused") {
    resumeGame();
  }
}

function resumeGame() {
  state.mode = "playing";
  state.aboutFromPause = false;
  pauseMenu.classList.add("hidden");
  pauseMenu.setAttribute("aria-hidden", "true");
  updateInteractionPrompt();
  syncAmbienceAudio();
  updateStoryBookButton();
}

function restartGame() {
  state.mode = "playing";
  state.activeInteractionId = null;
  state.aboutFromPause = false;
  state.openingStep = 0;
  keys.clear();
  hideEndOverlay();
  hideOpeningIntro();
  startScreen.classList.add("hidden");
  startScreen.setAttribute("aria-hidden", "true");
  pauseMenu.classList.add("hidden");
  slideModal.classList.add("hidden");
  interactionPrompt.classList.add("hidden");
  pauseMenu.setAttribute("aria-hidden", "true");
  slideModal.setAttribute("aria-hidden", "true");
  resetStoryProgress();
  loadLevel("hub");
  showStoryToast("Hành trình khởi động lại. Hãy giữ vững chính khí, tránh Tha hóa và tìm đủ 5 vật phẩm.");
}

function loadLevel(levelId, spawnOverride) {
  state.currentLevelId = levelId;
  state.activeInteractionId = null;
  state.pendingEnding = false;

  const level = currentLevel();
  const spawn = spawnOverride ?? level.spawn;

  player.x = spawn.x;
  player.y = spawn.y;
  player.direction = spawn.direction ?? "down";
  player.walkTime = 0;
  player.isMoving = false;
  state.blockedExitIds = new Set(
    level.exits
      .filter((exit) => exit.target && isPointInsideExit(player.x, player.y, exit))
      .map((exit) => exit.id)
  );

  updateCamera();
  updateLevelChrome();
  updateInteractionPrompt();
  syncAmbienceAudio();
  updateStoryBookButton();
  updateProgressHud();
}

function updateLevelChrome() {
  const level = currentLevel();

  levelChip.textContent = level.label;
  pauseTitle.textContent = level.pauseTitle;
  canvas.setAttribute("aria-label", level.canvasLabel);
}

function renderSlideGallery(galleryItems) {
  slideGallery.replaceChildren();

  for (const item of galleryItems) {
    const figure = document.createElement("figure");
    figure.className = "slide-gallery-item";

    const image = document.createElement("img");
    image.className = "slide-gallery-image";
    image.src = item.src;
    image.alt = item.alt ?? item.caption ?? "";

    const caption = document.createElement("p");
    caption.className = "slide-gallery-caption";
    caption.textContent = item.caption ?? "";

    figure.append(image, caption);
    slideGallery.append(figure);
  }
}

function openSlide(slideData) {
  if (!slideData) {
    return;
  }

  state.activeSlide = slideData;
  state.pendingEnding = Boolean(slideData.endsGame);
  state.mode = "modal";
  slideKicker.textContent = slideData.kicker;
  slideTitle.textContent = slideData.title;
  slideText.textContent = slideData.text;
  slideCaption.textContent = slideData.caption;
  slideImage.className = "slide-image";
  slideGallery.replaceChildren();

  const hasGallery = Array.isArray(slideData.gallery) && slideData.gallery.length > 0;

  slideGallery.classList.toggle("hidden", !hasGallery);
  slideGallery.setAttribute("aria-hidden", hasGallery ? "false" : "true");
  slideImageFrame.classList.toggle("hidden", hasGallery);
  slideCaption.classList.toggle("hidden", hasGallery);

  if (hasGallery) {
    renderSlideGallery(slideData.gallery);
  }

  if (!hasGallery && slideData.art) {
    slideImage.classList.add(`art-${slideData.art}`);
  }

  playUiSound(uiSounds.bookPageFlip);
  slideModal.classList.remove("hidden");
  slideModal.setAttribute("aria-hidden", "false");
  pauseMenu.classList.add("hidden");
  pauseMenu.setAttribute("aria-hidden", "true");
  interactionPrompt.classList.add("hidden");
  updateBookControls();
  updateStoryBookButton();
}

function closeSlide() {
  const shouldEnd = state.pendingEnding;

  playUiSound(uiSounds.bookPageFlip);
  slideModal.classList.add("hidden");
  slideModal.setAttribute("aria-hidden", "true");
  state.activeSlide = null;
  state.activeStoryIds = [];
  state.activeStoryIndex = 0;
  state.pendingEnding = false;
  updateBookControls();

  if (state.aboutFromPause) {
    state.mode = "paused";
    pauseMenu.classList.remove("hidden");
    pauseMenu.setAttribute("aria-hidden", "false");
    return;
  }

  if (shouldEnd) {
    showEndOverlay();
    return;
  }

  state.mode = "playing";
  updateInteractionPrompt();
  updateStoryBookButton();
}

function handleReturnFromEnding() {
  if (!isEndingCinematicComplete()) {
    return;
  }

  returnToStartScreen();
}

function createEndingCinematicState(endingId) {
  const definition = ENDING_CINEMATIC_DEFINITIONS[endingId] ?? ENDING_CINEMATIC_DEFINITIONS.bad;

  return {
    endingId,
    startedAt: state.lastTimestamp,
    duration: definition.duration,
    completed: false,
    hasStarted: false,
  };
}

function isEndingCinematicComplete() {
  return !state.endingCinematic || state.endingCinematic.completed;
}

function updateEndingCinematicUiState() {
  if (state.mode !== "ending") {
    returnStartButton.disabled = false;
    delete endOverlay.dataset.cinematic;
    return;
  }

  const cinematicState = isEndingCinematicComplete() ? "complete" : "running";
  endOverlay.dataset.cinematic = cinematicState;
  returnStartButton.disabled = cinematicState === "running";
}

function showEndOverlay() {
  const ending = ENDING_DEFINITIONS[state.endingId] ?? ENDING_DEFINITIONS.bad;

  state.mode = "ending";
  state.endingCinematic = createEndingCinematicState(state.endingId ?? "bad");
  interactionPrompt.classList.add("hidden");
  endTitle.textContent = ending.title;
  endCopy.textContent = ending.copy;
  endSummary.textContent =
    state.endingSummary || `Tín vật: ${state.inventory.size}/${RELIC_TARGET_COUNT} • Tha hóa: ${state.saDoa}%`;
  updateEndingArt(ending);
  endOverlay.dataset.ending = state.endingId ?? "bad";
  endOverlay.classList.remove("hidden");
  endOverlay.setAttribute("aria-hidden", "false");
  syncEndingArtCinematicCanvas();
  syncEndingSceneOverlayCanvas();
  updateEndingCinematicUiState();
  updateStoryBookButton();
}

function hideEndOverlay() {
  if (endArtFrame && endArtImage) {
    endArtFrame.classList.add("hidden");
    endArtFrame.setAttribute("aria-hidden", "true");
    endArtImage.removeAttribute("src");
    endArtImage.alt = "";
  }
  state.endingCinematic = null;
  clearEndingArtCinematic();
  clearEndingSceneOverlay();
  updateEndingCinematicUiState();
  delete endOverlay.dataset.ending;
  endOverlay.classList.add("hidden");
  endOverlay.setAttribute("aria-hidden", "true");
  updateStoryBookButton();
}

function updateEndingArt(ending) {
  if (!endArtFrame || !endArtImage) {
    return;
  }

  if (!ending?.artSrc) {
    endArtFrame.classList.add("hidden");
    endArtFrame.setAttribute("aria-hidden", "true");
    endArtImage.removeAttribute("src");
    endArtImage.alt = "";
    return;
  }

  endArtImage.src = ending.artSrc;
  endArtImage.alt = ending.artAlt ?? "";
  endArtFrame.classList.remove("hidden");
  endArtFrame.setAttribute("aria-hidden", "false");
}

function syncEndingArtSurface(canvasElement, surfaceContext) {
  if (!canvasElement || !surfaceContext || !endArtFrame || !endArtImage) {
    return null;
  }

  const width = Math.round(endArtImage.clientWidth);
  const height = Math.round(endArtImage.clientHeight);

  if (!width || !height || !endArtImage.complete || !endArtImage.naturalWidth) {
    canvasElement.style.width = "0px";
    canvasElement.style.height = "0px";
    return null;
  }

  const left = Math.round(endArtImage.offsetLeft);
  const top = Math.round(endArtImage.offsetTop);

  if (canvasElement.width !== width) {
    canvasElement.width = width;
  }

  if (canvasElement.height !== height) {
    canvasElement.height = height;
  }

  canvasElement.style.left = `${left}px`;
  canvasElement.style.top = `${top}px`;
  canvasElement.style.width = `${width}px`;
  canvasElement.style.height = `${height}px`;

  return { context: surfaceContext, width, height };
}

function syncEndingArtCinematicCanvas() {
  return syncEndingArtSurface(endArtCinematic, endArtCinematicCtx);
}

function syncEndingSceneOverlayCanvas() {
  return syncEndingArtSurface(endArtOverlay, endArtOverlayCtx);
}

function clearEndingArtSurface(canvasElement, surfaceContext) {
  if (!canvasElement || !surfaceContext) {
    return;
  }

  surfaceContext.setTransform(1, 0, 0, 1, 0, 0);
  surfaceContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasElement.width = 0;
  canvasElement.height = 0;
  canvasElement.style.width = "0px";
  canvasElement.style.height = "0px";
}

function clearEndingArtCinematic() {
  clearEndingArtSurface(endArtCinematic, endArtCinematicCtx);
}

function clearEndingSceneOverlay() {
  clearEndingArtSurface(endArtOverlay, endArtOverlayCtx);
}

function easeInOutCubic(value) {
  if (value < 0.5) {
    return 4 * value * value * value;
  }

  return 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function easeOutQuad(value) {
  return 1 - (1 - value) * (1 - value);
}

function sampleEndingCinematicKeyframes(keyframes, progress) {
  if (progress <= keyframes[0].at) {
    return keyframes[0];
  }

  for (let index = 0; index < keyframes.length - 1; index += 1) {
    const current = keyframes[index];
    const next = keyframes[index + 1];

    if (progress > next.at) {
      continue;
    }

    const segmentProgress = clamp((progress - current.at) / (next.at - current.at), 0, 1);
    const eased = easeInOutCubic(segmentProgress);

    return {
      x: current.x + (next.x - current.x) * eased,
      y: current.y + (next.y - current.y) * eased,
      zoom: current.zoom + (next.zoom - current.zoom) * eased,
    };
  }

  return keyframes[keyframes.length - 1];
}

function computeEndingCinematicFrame(image, width, height, cinematicState) {
  const definition =
    ENDING_CINEMATIC_DEFINITIONS[cinematicState.endingId] ?? ENDING_CINEMATIC_DEFINITIONS.bad;
  const progress = clamp((state.lastTimestamp - cinematicState.startedAt) / cinematicState.duration, 0, 1);
  const keyframe = sampleEndingCinematicKeyframes(definition.keyframes, progress);
  const revealProgress = easeInOutCubic(clamp((progress - 0.72) / 0.28, 0, 1));
  const targetAspect = width / height;
  let cropWidth = image.naturalWidth / keyframe.zoom;
  let cropHeight = cropWidth / targetAspect;

  if (cropHeight > image.naturalHeight) {
    cropHeight = image.naturalHeight;
    cropWidth = cropHeight * targetAspect;
  }

  const focusX = keyframe.x * image.naturalWidth;
  const focusY = keyframe.y * image.naturalHeight;
  const cropX = clamp(focusX - cropWidth / 2, 0, image.naturalWidth - cropWidth);
  const cropY = clamp(focusY - cropHeight / 2, 0, image.naturalHeight - cropHeight);

  return {
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    fadeAlpha: 1 - easeOutQuad(clamp(progress / 0.16, 0, 1)),
    matteHeight: Math.round((1 - revealProgress) * Math.min(26, height * 0.11)),
    vignetteAlpha: 0.24 - revealProgress * 0.14,
    flareAlpha: cinematicState.endingId === "good" ? 0.16 * (1 - revealProgress * 0.5) : 0.08 * (1 - revealProgress * 0.5),
    revealProgress,
    complete: progress >= 1,
  };
}

function renderEndingArtCinematic() {
  if (state.mode !== "ending" || !state.endingId) {
    clearEndingArtCinematic();
    return;
  }

  const cinematicState =
    state.endingCinematic ?? createEndingCinematicState(state.endingId ?? "bad");
  state.endingCinematic = cinematicState;

  if (!endArtImage?.complete || !endArtImage?.naturalWidth) {
    return;
  }

  if (!cinematicState.hasStarted) {
    cinematicState.hasStarted = true;
    cinematicState.startedAt = state.lastTimestamp;
  }

  const surface = syncEndingArtCinematicCanvas();

  if (!surface) {
    return;
  }

  const { context, width, height } = surface;
  const frame = computeEndingCinematicFrame(endArtImage, width, height, cinematicState);

  context.clearRect(0, 0, width, height);
  context.save();
  context.drawImage(
    endArtImage,
    Math.round(frame.cropX),
    Math.round(frame.cropY),
    Math.round(frame.cropWidth),
    Math.round(frame.cropHeight),
    0,
    0,
    width,
    height
  );

  if (frame.flareAlpha > 0) {
    context.save();
    context.globalCompositeOperation = cinematicState.endingId === "good" ? "screen" : "multiply";
    context.fillStyle =
      cinematicState.endingId === "good"
        ? `rgba(255, 222, 138, ${frame.flareAlpha})`
        : `rgba(76, 12, 16, ${frame.flareAlpha + 0.06})`;
    context.fillRect(0, 0, width, height);
    context.restore();
  }

  if (frame.vignetteAlpha > 0) {
    const gradient = context.createRadialGradient(
      width * 0.5,
      height * 0.48,
      width * 0.08,
      width * 0.5,
      height * 0.52,
      width * 0.72
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, `rgba(4, 6, 10, ${frame.vignetteAlpha})`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
  }

  if (frame.matteHeight > 0) {
    context.fillStyle = "rgba(4, 6, 10, 0.92)";
    context.fillRect(0, 0, width, frame.matteHeight);
    context.fillRect(0, height - frame.matteHeight, width, frame.matteHeight);
  }

  if (frame.fadeAlpha > 0) {
    context.fillStyle = `rgba(4, 6, 10, ${frame.fadeAlpha})`;
    context.fillRect(0, 0, width, height);
  }

  context.restore();

  if (frame.complete && !cinematicState.completed) {
    cinematicState.completed = true;
    updateEndingCinematicUiState();
  }
}

function renderEndingSceneOverlay() {
  if (state.mode !== "ending" || !state.endingId) {
    clearEndingSceneOverlay();
    return;
  }

  if (!isEndingCinematicComplete()) {
    clearEndingSceneOverlay();
    return;
  }

  const scene = ENDING_OVERLAY_SCENES[state.endingId];

  if (!scene) {
    clearEndingSceneOverlay();
    return;
  }

  const surface = syncEndingSceneOverlayCanvas();

  if (!surface) {
    return;
  }

  const { context, width, height } = surface;
  context.clearRect(0, 0, width, height);
  context.save();

  if (state.endingId === "good") {
    renderGoodEndingSceneOverlay(context, width, height, scene);
  } else {
    renderBadEndingSceneOverlay(context, width, height, scene);
  }

  context.restore();
}

function renderGoodEndingSceneOverlay(context, width, height, scene) {
  const timestamp = state.lastTimestamp;
  const pulse = 0.82 + Math.sin(timestamp * 0.0024) * 0.08;

  context.save();
  context.globalCompositeOperation = "screen";
  context.fillStyle = `rgba(255, 227, 123, ${0.08 + pulse * 0.06})`;
  context.fillRect(width * 0.32, height * 0.58, width * 0.36, height * 0.3);
  context.restore();

  for (const mote of scene.motes) {
    const sway = Math.sin(timestamp * mote.speed + mote.x * 22) * mote.drift;
    const lift = Math.cos(timestamp * mote.speed * 1.6 + mote.y * 18) * mote.drift;
    const x = width * mote.x + sway;
    const y = height * mote.y + lift;
    const size = mote.size * (0.92 + Math.sin(timestamp * mote.speed * 1.9) * 0.08);

    context.save();
    context.globalAlpha = mote.alpha;
    context.fillStyle = "#ffd86b";
    context.beginPath();
    context.arc(x, y, size * 0.34, 0, Math.PI * 2);
    context.fill();

    if (canDrawSprite(effectSprites.sparkle)) {
      context.drawImage(
        effectSprites.sparkle,
        Math.round(x - size / 2),
        Math.round(y - size / 2),
        size,
        size
      );
    }
    context.restore();
  }

  drawEndingSceneFigures(context, width, height, scene.figures);
}

function renderBadEndingSceneOverlay(context, width, height, scene) {
  const timestamp = state.lastTimestamp;

  context.save();
  context.fillStyle = "rgba(39, 8, 10, 0.18)";
  context.fillRect(width * 0.28, height * 0.66, width * 0.44, height * 0.22);
  context.restore();

  for (let index = 0; index < 26; index += 1) {
    const seed = index * 37.17;
    const x = (seed * 23 + timestamp * 0.04) % (width + 30) - 15;
    const y = (seed * 17 + timestamp * 0.18) % (height + 60) - 30;
    const length = 10 + (index % 4) * 3;

    context.save();
    context.strokeStyle =
      index % 3 === 0 ? "rgba(146, 255, 128, 0.2)" : "rgba(208, 226, 255, 0.18)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(Math.round(x), Math.round(y));
    context.lineTo(Math.round(x - 3), Math.round(y + length));
    context.stroke();
    context.restore();
  }

  for (let index = 0; index < 8; index += 1) {
    const angle = timestamp * 0.0022 + index * 0.76;
    const emberX = width * 0.5 + Math.sin(angle) * (28 + index * 3);
    const emberY = height * (0.58 + index * 0.026) + Math.cos(angle * 1.5) * 4;
    const size = 6 + (index % 3) * 2;

    context.save();
    context.globalAlpha = 0.16 + (index % 3) * 0.04;
    context.fillStyle = "#f05446";
    context.beginPath();
    context.arc(emberX, emberY, size * 0.3, 0, Math.PI * 2);
    context.fill();

    if (canDrawSprite(effectSprites.ember)) {
      context.drawImage(
        effectSprites.ember,
        Math.round(emberX - size / 2),
        Math.round(emberY - size / 2),
        size,
        size
      );
    }
    context.restore();
  }

  drawEndingSceneFigures(context, width, height, scene.figures);
}

function drawEndingSceneFigures(context, width, height, figures) {
  const timestamp = state.lastTimestamp;
  const sortedFigures = [...figures].sort((left, right) => left.y - right.y);

  for (const figure of sortedFigures) {
    const swaySpeed = figure.swaySpeed ?? 0.0018;
    const sway =
      Math.sin(timestamp * swaySpeed + (figure.frameOffset ?? 0) * Math.PI * 2) *
      (figure.swayAmplitude ?? 0);
    const bob = Math.cos(timestamp * (swaySpeed * 1.8) + figure.x * 16) * (figure.bobAmplitude ?? 0);
    const x = width * figure.x + sway;
    const y = height * figure.y + bob;
    const shadowWidth = 8 + (figure.scale ?? 1) * 10;

    context.save();
    context.globalAlpha = 0.22;
    context.fillStyle = "#091014";
    context.fillRect(Math.round(x - shadowWidth / 2), Math.round(y + 5), Math.round(shadowWidth), 3);
    context.restore();

    if (figure.kind === "player") {
      drawPlayerSpriteActorToContext(context, { ...figure, x, y }, timestamp);
      continue;
    }

    drawNpcSpriteActorToContext(context, { ...figure, x, y }, timestamp);
  }
}

function useStrikeSkill() {
  if (state.lastTimestamp < state.skillCooldowns.strikeReadyAt) {
    return;
  }

  state.skillCooldowns.strikeReadyAt = state.lastTimestamp + STRIKE_COOLDOWN_MS;
  state.activeSkillEffect = {
    type: "strike",
    direction: player.direction,
    x: player.x,
    y: player.y,
    startedAt: state.lastTimestamp,
    endsAt: state.lastTimestamp + PLAYER_ATTACK_ANIMATION_MS,
  };

  let hitMonster = false;

  for (const monster of currentLevel().monsters ?? []) {
    if (monster.defeated || !isTargetInRange(monster, STRIKE_RANGE)) {
      continue;
    }

    hitMonster = true;
    damageMonster(monster, 1);
  }

  if (!hitMonster) {
    for (const item of currentLevel().interactables ?? []) {
      if (item.kind !== "npc") {
        continue;
      }

      if (isTargetInRange(item, STRIKE_RANGE)) {
        adjustSaDoa(
          item.attackPenalty ?? 10,
          item.attackPenaltyMessage ?? "Bạn ra đòn thiếu kiểm soát và làm hại người vô tội."
        );
        break;
      }
    }
  }
}

function usePurifySkill() {
  if (state.lastTimestamp < state.skillCooldowns.purifyReadyAt) {
    return;
  }

  state.skillCooldowns.purifyReadyAt = state.lastTimestamp + PURIFY_COOLDOWN_MS;
  state.activeSkillEffect = {
    type: "purify",
    x: player.x,
    y: player.y,
    endsAt: state.lastTimestamp + 280,
  };

  let affected = false;

  for (const monster of currentLevel().monsters ?? []) {
    if (monster.defeated) {
      continue;
    }

    const distance = Math.hypot(player.x - monster.x, player.y - monster.y);

    if (distance <= PURIFY_RANGE) {
      affected = true;
      damageMonster(monster, 2);
    }
  }

  for (const item of currentLevel().interactables ?? []) {
    if (
      item.used ||
      item.purified ||
      !["offerBribe", "splitChoice", "fillCorruption", "ideologyTrap"].includes(item.interactionType)
    ) {
      continue;
    }

    const distance = Math.hypot(player.x - item.x, player.y - item.y);

    if (distance <= PURIFY_RANGE) {
      item.purified = true;
      affected = true;
      adjustSaDoa(-8, "Bạn đã thanh tẩy được một mầm Tha hóa.");
    }
  }

  if (!affected) {
    showStoryToast("Quầng thanh tẩy lan ra nhưng chưa chạm tới mục tiêu nào.");
  }
}

function isTargetInRange(target, range) {
  const point = getInteractionPoint(target);
  const dx = point.x - player.x;
  const dy = point.y - player.y;
  const distance = Math.hypot(dx, dy);

  if (distance > range) {
    return false;
  }

  if (player.direction === "left") {
    return dx <= 14;
  }
  if (player.direction === "right") {
    return dx >= -14;
  }
  if (player.direction === "up") {
    return dy <= 14;
  }

  return dy >= -14;
}

function updateMonsters(deltaSeconds) {
  for (const monster of currentLevel().monsters ?? []) {
    if (monster.defeated) {
      continue;
    }

    const dx = player.x - monster.x;
    const dy = player.y - monster.y;
    const distance = Math.hypot(dx, dy);
    let targetX = monster.homeX + Math.cos(state.lastTimestamp * 0.001 + monster.phase) * (monster.patrolRadius ?? 18);
    let targetY = monster.homeY + Math.sin(state.lastTimestamp * 0.0012 + monster.phase) * (monster.patrolRadius ?? 18);

    if (distance < (monster.aggroRadius ?? 120)) {
      targetX = player.x;
      targetY = player.y;
    }

    const moveX = targetX - monster.x;
    const moveY = targetY - monster.y;
    const moveLength = Math.hypot(moveX, moveY);
    const isAttacking = state.lastTimestamp < (monster.attackEndsAt ?? 0);
    monster.animationState = isAttacking ? "attack" : moveLength > 1 ? "run" : "idle";

    if (!isAttacking && moveLength > 1) {
      const step = Math.min(moveLength, MONSTER_SPEED * deltaSeconds);
      monster.x += (moveX / moveLength) * step;
      monster.y += (moveY / moveLength) * step;
    }

    monster.x = clamp(monster.x, currentLevel().bounds.minX, currentLevel().bounds.maxX);
    monster.y = clamp(monster.y, currentLevel().bounds.minY, currentLevel().bounds.maxY);

    if (
      distance <= MONSTER_TOUCH_RANGE &&
      state.lastTimestamp - monster.lastContactAt >= MONSTER_CONTACT_DAMAGE_COOLDOWN_MS
    ) {
      monster.lastContactAt = state.lastTimestamp;
      monster.attackStartedAt = state.lastTimestamp;
      monster.attackEndsAt = state.lastTimestamp + MONSTER_ATTACK_ANIMATION_MS;
      monster.attackDirection = getDirectionFromVector(player.x - monster.x, player.y - monster.y);
      monster.animationState = "attack";
      damagePlayer(monster.damage ?? 1, monster.name);
    }
  }
}

function damageMonster(monster, amount) {
  monster.health = Math.max(0, monster.health - amount);
  monster.hitFlashUntil = state.lastTimestamp + 180;

  if (monster.health > 0) {
    return;
  }

  monster.defeated = true;

  if (monster.dropItemId) {
    collectRelic(monster.dropItemId);
    return;
  }

  showStoryToast(`${monster.name} đã bị đánh bại.`);
}

function damagePlayer(amount, sourceName = "bóng tối") {
  if (state.lastTimestamp < state.invulnerableUntil) {
    return;
  }

  state.invulnerableUntil = state.lastTimestamp + 820;
  state.health = Math.max(0, state.health - amount);
  updateProgressHud();

  if (state.health > 0) {
    showStoryToast(`${sourceName} gây ${amount} sát thương.`);
    return;
  }

  adjustSaDoa(8, "Bạn gục ngã trước bóng tối và bị đẩy lùi trên hành trình.");
  state.health = PLAYER_MAX_HEALTH;
  loadLevel(state.currentLevelId);
}

function updatePlayer(deltaSeconds) {
  let moveX = 0;
  let moveY = 0;

  if (keys.has("w") || keys.has("arrowup")) {
    moveY -= 1;
  }
  if (keys.has("s") || keys.has("arrowdown")) {
    moveY += 1;
  }
  if (keys.has("a") || keys.has("arrowleft")) {
    moveX -= 1;
  }
  if (keys.has("d") || keys.has("arrowright")) {
    moveX += 1;
  }

  const length = Math.hypot(moveX, moveY);
  player.isMoving = length > 0;

  if (length > 0) {
    moveX /= length;
    moveY /= length;

    if (Math.abs(moveX) > Math.abs(moveY)) {
      player.direction = moveX > 0 ? "right" : "left";
    } else {
      player.direction = moveY > 0 ? "down" : "up";
    }

    const deltaX = moveX * PLAYER_SPEED * deltaSeconds;
    const deltaY = moveY * PLAYER_SPEED * deltaSeconds;

    player.x += deltaX;
    applyLevelBounds();
    resolveLevelCollisions("x", deltaX);

    player.y += deltaY;
    applyLevelBounds();
    resolveLevelCollisions("y", deltaY);

    player.walkTime += deltaSeconds * 10.5;
  } else {
    player.walkTime = 0;
  }

  updateCamera();

  if (handleLevelTransitions()) {
    return;
  }
}

function applyLevelBounds() {
  const bounds = currentLevel().bounds;

  player.x = clamp(player.x, bounds.minX, bounds.maxX);
  player.y = clamp(player.y, bounds.minY, bounds.maxY);
}

function resolveLevelCollisions(axis, delta) {
  if (delta === 0) {
    return;
  }

  const colliders = getActiveColliders();
  const halfWidth = PLAYER_FOOTPRINT.width / 2;
  const halfHeight = PLAYER_FOOTPRINT.height / 2;

  for (const collider of colliders) {
    if (!rectsOverlap(getPlayerFootprint(player.x, player.y), collider)) {
      continue;
    }

    if (axis === "x") {
      if (delta > 0) {
        player.x = collider.x - halfWidth;
      } else {
        player.x = collider.x + collider.width + halfWidth;
      }
    } else if (delta > 0) {
      player.y = collider.y - halfHeight - PLAYER_FOOTPRINT.offsetY;
    } else {
      player.y = collider.y + collider.height + halfHeight - PLAYER_FOOTPRINT.offsetY;
    }
  }

  applyLevelBounds();
}

function getActiveColliders(level = currentLevel()) {
  return (level.colliders ?? []).filter((collider) => {
    if (collider.barrierId && state.quests.zone4Barriers.has(collider.barrierId)) {
      return false;
    }

    if (collider.hamletId && state.quests.zone3HamletsFreed.has(collider.hamletId)) {
      return false;
    }

    return true;
  });
}

function getPlayerFootprint(x, y) {
  const halfWidth = PLAYER_FOOTPRINT.width / 2;
  const halfHeight = PLAYER_FOOTPRINT.height / 2;

  return {
    x: x - halfWidth,
    y: y + PLAYER_FOOTPRINT.offsetY - halfHeight,
    width: PLAYER_FOOTPRINT.width,
    height: PLAYER_FOOTPRINT.height,
  };
}

function updateCamera() {
  camera.x = clamp(player.x - VIEWPORT.width / 2, 0, WORLD.width - VIEWPORT.width);
  camera.y = clamp(player.y - VIEWPORT.height / 2, 0, WORLD.height - VIEWPORT.height);
}

function handleLevelTransitions() {
  refreshBlockedExits();

  for (const exit of currentLevel().exits) {
    if (!exit.target) {
      continue;
    }

    if (state.blockedExitIds.has(exit.id)) {
      continue;
    }

    if (isExitTriggered(exit)) {
      loadLevel(exit.target, exit.spawn);
      return true;
    }
  }

  return false;
}

function updateInteractionPrompt() {
  updateQuestChip();
  const candidate = getNearestInteractable();

  if (candidate) {
    state.activeInteractionId = candidate.id;
    interactionPrompt.textContent = `Nhấn E để ${candidate.prompt}`;
    interactionPrompt.classList.remove("hidden");
    return;
  }

  state.activeInteractionId = null;
  const nearbyMonster = getNearestMonster(72);

  if (nearbyMonster) {
    interactionPrompt.textContent = `J tấn công • K thanh tẩy ${nearbyMonster.name}`;
    interactionPrompt.classList.remove("hidden");
    return;
  }

  const exitHint = getActiveExitHint();

  if (exitHint) {
    interactionPrompt.textContent = exitHint.prompt;
    interactionPrompt.classList.remove("hidden");
    return;
  }

  interactionPrompt.classList.add("hidden");
}

function getActiveExitHint() {
  for (const exit of currentLevel().exits) {
    if (state.blockedExitIds.has(exit.id)) {
      continue;
    }

    if (isExitNear(exit)) {
      return exit;
    }
  }

  return null;
}

function updateQuestChip() {
  if (!questChip) {
    return;
  }

  const objective = getNavigationObjective();

  questChip.textContent = objective
    ? `${objective.label} - ${formatNavigationDistance(objective.distance)}`
    : "Tu do tham hiem";
}

function isExitNear(exit) {
  if (exit.kind === "edge-right") {
    return player.x > exit.hintMinX && player.y > exit.minY && player.y < exit.maxY;
  }

  if (exit.kind === "rect") {
    return pointInRect(player.x, player.y, exit);
  }

  return false;
}

function isExitTriggered(exit) {
  return isPointInsideExit(player.x, player.y, exit);
}

function isPointInsideExit(x, y, exit) {
  if (exit.kind === "edge-right") {
    return x >= exit.triggerX && y > exit.minY && y < exit.maxY;
  }

  if (exit.kind === "rect") {
    return pointInRect(x, y, exit);
  }

  return false;
}

function refreshBlockedExits() {
  if (state.blockedExitIds.size === 0) {
    return;
  }

  const activeExitIds = new Set();

  for (const exit of currentLevel().exits) {
    if (!state.blockedExitIds.has(exit.id)) {
      continue;
    }

    if (isPointInsideExit(player.x, player.y, exit)) {
      activeExitIds.add(exit.id);
    }
  }

  state.blockedExitIds = activeExitIds;
}

function isLevelReadyToReturn(levelId) {
  switch (levelId) {
    case "village":
      return state.quests.zone1RewardClaimed;
    case "archive":
      return state.quests.zone2RewardClaimed;
    case "crossroads":
      return state.quests.zone3ThreadClaimed && state.quests.zone3MapClaimed;
    case "spring":
      return state.quests.zone4GearClaimed;
    default:
      return false;
  }
}

function getReturnGuidanceForLevel(levelId) {
  if (!isLevelReadyToReturn(levelId)) {
    return "";
  }

  switch (levelId) {
    case "village":
      return "Đã có tín vật của Khu vực 1. Hãy theo mũi tên vàng quay lại trung tâm.";
    case "archive":
      return "Đã có tín vật của Khu vực 2. Hãy theo mũi tên vàng quay lại trung tâm.";
    case "crossroads":
      return "Đã thu đủ tín vật của Khu vực 3. Hãy theo mũi tên vàng quay lại trung tâm.";
    case "spring":
      return "Đã có tín vật của Khu vực 4. Hãy theo mũi tên vàng quay lại trung tâm.";
    default:
      return "";
  }
}

function formatNavigationDistance(distance) {
  return `${Math.max(1, Math.round(distance / 18))} bước`;
}

function getDirectionFromVector(dx, dy) {
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
}

function getDirectionUnit(direction) {
  if (direction === "left") {
    return { x: -1, y: 0 };
  }
  if (direction === "right") {
    return { x: 1, y: 0 };
  }
  if (direction === "up") {
    return { x: 0, y: -1 };
  }

  return { x: 0, y: 1 };
}

function getTimedProgress(startedAt = 0, endsAt = 0) {
  const duration = Math.max(1, endsAt - startedAt);
  return clamp((state.lastTimestamp - startedAt) / duration, 0, 1);
}

function getAttackLungeOffset(direction, progress, distance = ATTACK_LUNGE_DISTANCE) {
  const unit = getDirectionUnit(direction);
  const amount = Math.sin(progress * Math.PI) * distance;

  return {
    x: unit.x * amount,
    y: unit.y * amount,
  };
}

function getLevelInteractable(id) {
  return currentLevel().interactables.find((item) => item.id === id) ?? null;
}

function getLevelMonster(id) {
  return currentLevel().monsters?.find((monster) => monster.id === id) ?? null;
}

function getLevelExit(id) {
  return currentLevel().exits.find((exit) => exit.id === id) ?? null;
}

function createInteractableNavigationTarget(item, label, color = "#f3d777") {
  if (!item || item.collected || item.used) {
    return null;
  }

  const point = getInteractionPoint(item);

  return {
    id: item.id,
    type: "interactable",
    label,
    color,
    x: point.x,
    y: point.y,
  };
}

function createMonsterNavigationTarget(monster, label, color = "#e96558") {
  if (!monster || monster.defeated) {
    return null;
  }

  return {
    id: monster.id,
    type: "monster",
    label,
    color,
    x: monster.x,
    y: monster.y,
  };
}

function createExitNavigationTarget(exit, label, color = "#f3d777") {
  if (!exit || state.blockedExitIds.has(exit.id)) {
    return null;
  }

  const center = getExitCenter(exit);

  return {
    id: exit.id,
    type: "exit",
    label,
    color: exit.guide?.color ?? color,
    x: center.x,
    y: center.y,
  };
}

function pickNearestNavigationTarget(targets) {
  let nearest = null;
  let nearestDistance = Infinity;

  for (const target of targets) {
    if (!target) {
      continue;
    }

    const distance = Math.hypot(target.x - player.x, target.y - player.y);

    if (distance < nearestDistance) {
      nearest = target;
      nearestDistance = distance;
    }
  }

  return nearest;
}

function getNextHubExitId() {
  if (!state.quests.zone1RewardClaimed) {
    return "to-fog-port";
  }

  if (!state.quests.zone2RewardClaimed) {
    return "to-three-room-house";
  }

  if (!state.quests.zone3ThreadClaimed || !state.quests.zone3MapClaimed) {
    return "to-red-square";
  }

  if (!state.quests.zone4GearClaimed) {
    return "to-doi-moi-valley";
  }

  return null;
}

function getHubNavigationTarget() {
  const hasAllRelics = REQUIRED_RELIC_IDS.every((itemId) => state.inventory.has(itemId));

  if (hasAllRelics) {
    return createInteractableNavigationTarget(
      getLevelInteractable("final-history-gate"),
      "Dat 5 tin vat len Canh Cua Lich Su",
      "#f3d777"
    );
  }

  const nextExitId = getNextHubExitId();

  switch (nextExitId) {
    case "to-fog-port":
      return createExitNavigationTarget(getLevelExit(nextExitId), "Tiến vào Khu vực 1", "#d7ebff");
    case "to-three-room-house":
      return createExitNavigationTarget(getLevelExit(nextExitId), "Tiến vào Khu vực 2", "#f4d9af");
    case "to-red-square":
      return createExitNavigationTarget(getLevelExit(nextExitId), "Tiến vào Khu vực 3", "#f3dc7f");
    case "to-doi-moi-valley":
      return createExitNavigationTarget(getLevelExit(nextExitId), "Tiến vào Khu vực 4", "#d7efab");
    default:
      return null;
  }
}

function getVillageNavigationTarget() {
  if (state.quests.zone1RewardClaimed) {
    return createExitNavigationTarget(getLevelExit("back-to-hub-1"), "Quay ve trung tam", "#f3d777");
  }

  if (!state.quests.zone1Started) {
    return createInteractableNavigationTarget(getLevelInteractable("le-paria-stack"), "Nhan bao Le Paria", "#d7ebff");
  }

  const workerTargets = pickNearestNavigationTarget([
    state.quests.zone1Delivered.has("worker-1")
      ? null
      : createInteractableNavigationTarget(getLevelInteractable("worker-harbor-1"), "Dua bao cho cong nhan 1", "#d7ebff"),
    state.quests.zone1Delivered.has("worker-2")
      ? null
      : createInteractableNavigationTarget(getLevelInteractable("worker-harbor-2"), "Dua bao cho cong nhan 2", "#d7ebff"),
    state.quests.zone1Delivered.has("worker-3")
      ? null
      : createInteractableNavigationTarget(getLevelInteractable("worker-harbor-3"), "Dua bao cho cong nhan 3", "#d7ebff"),
  ]);

  if (workerTargets) {
    return workerTargets;
  }

  return createInteractableNavigationTarget(getLevelInteractable("red-compass-reward"), "Nhan Chiec La Ban Do", "#f3d777");
}

function getArchiveNavigationTarget() {
  if (state.quests.zone2RewardClaimed) {
    return createExitNavigationTarget(getLevelExit("back-to-hub-2"), "Quay ve trung tam", "#f3d777");
  }

  if (state.quests.zone2Fragments.size < 3) {
    return pickNearestNavigationTarget([
      state.quests.zone2Fragments.has("west")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("delegate-west"), "Hoa giai phong phia Tay", "#f4d9af"),
      state.quests.zone2Fragments.has("east")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("delegate-east"), "Hoa giai phong phia Dong", "#f4d9af"),
      state.quests.zone2Fragments.has("north")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("delegate-north"), "Hoa giai phong phia Bac", "#f4d9af"),
    ]);
  }

  return createInteractableNavigationTarget(getLevelInteractable("unity-round-table"), "Dat 3 manh vo len ban tron", "#f3d777");
}

function getCrossroadsNavigationTarget() {
  if (state.quests.zone3ThreadClaimed && state.quests.zone3MapClaimed) {
    return createExitNavigationTarget(getLevelExit("back-to-hub-3"), "Quay ve trung tam", "#f3d777");
  }

  const targets = [];

  if (!state.quests.zone3ThreadClaimed) {
    if (state.quests.zone3Recruits.size < 4) {
      targets.push(
        state.quests.zone3Recruits.has("farmer")
          ? null
          : createInteractableNavigationTarget(getLevelInteractable("recruit-farmer"), "Moi nong dan vao mat tran", "#f3dc7f"),
        state.quests.zone3Recruits.has("worker")
          ? null
          : createInteractableNavigationTarget(getLevelInteractable("recruit-worker"), "Moi cong nhan vao mat tran", "#f3dc7f"),
        state.quests.zone3Recruits.has("intellectual")
          ? null
          : createInteractableNavigationTarget(getLevelInteractable("recruit-intellectual"), "Moi tri thuc yeu nuoc", "#f3dc7f"),
        state.quests.zone3Recruits.has("bourgeois")
          ? null
          : createInteractableNavigationTarget(getLevelInteractable("recruit-bourgeois"), "Moi tu san dan toc", "#f3dc7f")
      );
    } else {
      targets.push(
        createInteractableNavigationTarget(getLevelInteractable("vietminh-cadre"), "Nhan Soi Chi Do Viet Minh", "#f3d777")
      );
    }
  }

  if (!state.quests.zone3MapClaimed) {
    if (state.quests.zone3HamletsFreed.size < 3) {
      targets.push(
        state.quests.zone3HamletsFreed.has("hamlet-1")
          ? null
          : createInteractableNavigationTarget(getLevelInteractable("hamlet-1"), "Pha ap chien luoc 1", "#f08a61"),
        state.quests.zone3HamletsFreed.has("hamlet-2")
          ? null
          : createInteractableNavigationTarget(getLevelInteractable("hamlet-2"), "Pha ap chien luoc 2", "#f08a61"),
        state.quests.zone3HamletsFreed.has("hamlet-3")
          ? null
          : createInteractableNavigationTarget(getLevelInteractable("hamlet-3"), "Pha ap chien luoc 3", "#f08a61")
      );
    } else {
      const boss = getLevelMonster("southern-tyrant");

      if (boss && !boss.defeated) {
        targets.push(createMonsterNavigationTarget(boss, "Danh bai bo may ap buc", "#e96558"));
      } else {
        targets.push(
          createInteractableNavigationTarget(getLevelInteractable("resistance-commander"), "Nhan Ban do Vi tuyen 17", "#f3d777")
        );
      }
    }
  }

  return pickNearestNavigationTarget(targets);
}

function getSpringNavigationTarget() {
  if (state.quests.zone4GearClaimed) {
    return createExitNavigationTarget(getLevelExit("back-to-hub-4"), "Quay ve trung tam", "#f3d777");
  }

  if (state.quests.zone4Barriers.size < 3) {
    return pickNearestNavigationTarget([
      state.quests.zone4Barriers.has("wall-1")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("bao-cap-wall-1"), "Pha hang rao 1", "#d7efab"),
      state.quests.zone4Barriers.has("wall-2")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("bao-cap-wall-2"), "Pha hang rao 2", "#d7efab"),
      state.quests.zone4Barriers.has("wall-3")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("bao-cap-wall-3"), "Pha hang rao 3", "#d7efab"),
    ]);
  }

  if (state.quests.zone4Farmers.size < 3) {
    return pickNearestNavigationTarget([
      state.quests.zone4Farmers.has("farmer-1")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("farmer-khoan-1"), "Trao Khoan 10 cho nong dan 1", "#d7efab"),
      state.quests.zone4Farmers.has("farmer-2")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("farmer-khoan-2"), "Trao Khoan 10 cho nong dan 2", "#d7efab"),
      state.quests.zone4Farmers.has("farmer-3")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("farmer-khoan-3"), "Trao Khoan 10 cho nong dan 3", "#d7efab"),
    ]);
  }

  return createInteractableNavigationTarget(getLevelInteractable("doi-moi-leader"), "Nhan Banh rang Doi Moi", "#f3d777");
}

function getNavigationObjective() {
  let target = null;

  switch (state.currentLevelId) {
    case "hub":
      target = getHubNavigationTarget();
      break;
    case "village":
      target = getVillageNavigationTarget();
      break;
    case "archive":
      target = getArchiveNavigationTarget();
      break;
    case "crossroads":
      target = getCrossroadsNavigationTarget();
      break;
    case "spring":
      target = getSpringNavigationTarget();
      break;
    default:
      target = null;
      break;
  }

  if (!target) {
    return null;
  }

  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const distance = Math.hypot(dx, dy);

  return {
    ...target,
    dx,
    dy,
    distance,
    direction: getDirectionFromVector(dx, dy),
  };
}

function getExitCenter(exit) {
  if (exit.kind === "rect") {
    return {
      x: exit.x + exit.width / 2,
      y: exit.y + exit.height / 2,
    };
  }

  return {
    x: exit.triggerX,
    y: (exit.minY + exit.maxY) / 2,
  };
}

function isWorldPointOnScreen(x, y, margin = 18) {
  const screenX = x - camera.x;
  const screenY = y - camera.y;

  return (
    screenX >= margin &&
    screenX <= VIEWPORT.width - margin &&
    screenY >= margin &&
    screenY <= VIEWPORT.height - margin
  );
}

function drawObjectiveBeacon(objective, pulse) {
  if (!isWorldPointOnScreen(objective.x, objective.y, 10)) {
    return;
  }

  const bob = Math.sin(state.lastTimestamp * 0.01) * 3;
  const markerX = Math.round(objective.x);
  const markerY = Math.round(objective.y - 20 + bob);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  drawWorldWarmGlow(markerX, markerY, NAVIGATION_ASSIST.objectiveGlowRadius, 0.14 * pulse);

  ctx.save();
  ctx.globalAlpha = 0.18 * pulse;
  drawPixelExitArrow(markerX + 1, markerY + 1, "down", NAVIGATION_ASSIST.objectiveCellSize, "#17120f");
  ctx.restore();

  drawPixelExitArrow(markerX, markerY, "down", NAVIGATION_ASSIST.objectiveCellSize, "#2b2019");
  drawPixelExitArrow(markerX, markerY, "down", NAVIGATION_ASSIST.playerCellSize, objective.color);
  ctx.restore();
}

function drawPlayerNavigationArrow(objective, pulse) {
  const offset = NAVIGATION_ASSIST.playerArrowOffset;
  const arrowX = player.x + (objective.dx / objective.distance) * offset;
  const arrowY = player.y + NAVIGATION_ASSIST.playerArrowYOffset + (objective.dy / objective.distance) * offset;

  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  drawWorldWarmGlow(arrowX, arrowY, NAVIGATION_ASSIST.playerGlowRadius, 0.12 * pulse);

  ctx.save();
  ctx.globalAlpha = 0.16 * pulse;
  drawPixelExitArrow(
    Math.round(arrowX + 1),
    Math.round(arrowY + 1),
    objective.direction,
    NAVIGATION_ASSIST.playerCellSize,
    "#17120f"
  );
  ctx.restore();

  drawPixelExitArrow(Math.round(arrowX), Math.round(arrowY), objective.direction, NAVIGATION_ASSIST.playerCellSize, objective.color);
  ctx.restore();
}

function drawScreenEdgeNavigationArrow(objective, pulse) {
  const margin = 18;
  const centerX = VIEWPORT.width / 2;
  const centerY = VIEWPORT.height / 2;
  const unitX = objective.dx / objective.distance;
  const unitY = objective.dy / objective.distance;
  const limitX = centerX - margin;
  const limitY = centerY - margin;
  const scaleX = Math.abs(unitX) < 0.001 ? Infinity : limitX / Math.abs(unitX);
  const scaleY = Math.abs(unitY) < 0.001 ? Infinity : limitY / Math.abs(unitY);
  const scale = Math.min(scaleX, scaleY);
  const arrowX = Math.round(centerX + unitX * scale);
  const arrowY = Math.round(centerY + unitY * scale);

  ctx.save();
  drawWorldWarmGlow(arrowX, arrowY, NAVIGATION_ASSIST.edgeGlowRadius, 0.12 * pulse);

  ctx.save();
  ctx.globalAlpha = 0.18 * pulse;
  drawPixelExitArrow(arrowX + 1, arrowY + 1, objective.direction, NAVIGATION_ASSIST.edgeCellSize, "#17120f");
  ctx.restore();

  drawPixelExitArrow(arrowX, arrowY, objective.direction, NAVIGATION_ASSIST.edgeCellSize, objective.color);
  ctx.restore();
}

function drawNavigationAssist() {
  const objective = getNavigationObjective();

  if (!objective) {
    return;
  }

  if (objective.distance < 8) {
    return;
  }

  const pulse = 0.86 + (Math.sin(state.lastTimestamp * 0.01) + 1) * 0.1;

  drawObjectiveBeacon(objective, pulse);

  if (isWorldPointOnScreen(objective.x, objective.y, 14)) {
    drawPlayerNavigationArrow(objective, pulse);
    return;
  }

  drawScreenEdgeNavigationArrow(objective, pulse);
}

function handleInteraction() {
  const candidate = getNearestInteractable();

  if (!candidate) {
    return;
  }

  if (candidate.interactionType) {
    handleSystemInteraction(candidate);
    return;
  }

  startDialogue(candidate);
}

function getInteractionPoint(item) {
  return {
    x: item.x + (item.interactionOffsetX ?? 0),
    y: item.y + (item.interactionOffsetY ?? 0),
  };
}

function getNearestInteractable() {
  let nearest = null;
  let nearestDistance = Infinity;

  for (const item of currentLevel().interactables) {
    if (!isInteractableAvailable(item)) {
      continue;
    }

    const point = getInteractionPoint(item);
    const dx = player.x - point.x;
    const dy = player.y - point.y;
    const distance = Math.hypot(dx, dy);
    const interactionRadius = item.interactionRadius ?? INTERACTION_RADIUS;

    if (distance < interactionRadius && distance < nearestDistance) {
      nearest = item;
      nearestDistance = distance;
    }
  }

  return nearest;
}

function isInteractableAvailable(item) {
  switch (item.interactionType) {
    case "startPapers":
      return !state.quests.zone1Started;
    case "deliverPaper":
      return state.quests.zone1Started && !state.quests.zone1Delivered.has(item.workerId);
    case "rewardCompass":
      return state.quests.zone1Delivered.size === 3 && !state.quests.zone1RewardClaimed;
    case "offerBribe":
      return !item.used && !item.purified;
    case "collectFragment":
      return !state.quests.zone2Fragments.has(item.fragmentId);
    case "rewardEmblem":
      return !state.quests.zone2RewardClaimed;
    case "splitChoice":
      return !item.used && !item.purified;
    case "recruit":
      return !state.quests.zone3Recruits.has(item.recruitId);
    case "rewardThread":
      return !state.quests.zone3ThreadClaimed;
    case "rescueHamlet":
      return !state.quests.zone3HamletsFreed.has(item.hamletId);
    case "rewardMap":
      return !state.quests.zone3MapClaimed;
    case "permanentDivision":
      return !item.used;
    case "breakBarrier":
      return !state.quests.zone4Barriers.has(item.barrierId);
    case "deliverKhoan10":
      return !state.quests.zone4Farmers.has(item.farmerId);
    case "rewardGear":
      return !state.quests.zone4GearClaimed;
    case "fillCorruption":
    case "ideologyTrap":
      return !item.used && !item.purified;
    default:
      return true;
  }
}

function getNearestMonster(maxDistance = Infinity) {
  let nearest = null;
  let nearestDistance = maxDistance;

  for (const monster of currentLevel().monsters ?? []) {
    if (monster.defeated) {
      continue;
    }

    const distance = Math.hypot(player.x - monster.x, player.y - monster.y);

    if (distance < nearestDistance) {
      nearest = monster;
      nearestDistance = distance;
    }
  }

  return nearest;
}

function handleSystemInteraction(item) {
  switch (item.interactionType) {
    case "startPapers":
      state.quests.zone1Started = true;
      item.used = true;
      item.collected = true;
      showStoryToast("Bạn nhận các tờ Le Paria. Hãy đem chúng tới ba người lao động ở bến cảng.");
      return;
    case "deliverPaper":
      if (!state.quests.zone1Started) {
        showStoryToast("Bạn cần nhận báo từ Nguyễn Ái Quốc trước.");
        return;
      }
      state.quests.zone1Delivered.add(item.workerId);
      showStoryToast(`Đã phát ${state.quests.zone1Delivered.size}/3 tờ báo cho công nhân.`);
      if (state.quests.zone1Delivered.size === 3) {
        showStoryToast("Khối công nhân đã thức tỉnh. Hãy quay lại gặp Nguyễn Ái Quốc.");
      }
      return;
    case "rewardCompass":
      if (state.quests.zone1Delivered.size < 3) {
        showStoryToast("Nguyễn Ái Quốc chỉ trao vật phẩm khi báo đã tới đủ tay người lao động.");
        return;
      }
      state.quests.zone1RewardClaimed = true;
      item.collected = true;
      collectRelic("red-compass", getReturnGuidanceForLevel("village"));
      return;
    case "offerBribe":
      item.used = true;
      adjustSaDoa(34, "Bạn nhận vinh hoa làm tay sai cho mẫu quốc. Tha hóa tăng mạnh.");
      return;
    case "collectFragment":
      state.quests.zone2Fragments.add(item.fragmentId);
      showStoryToast(`Bạn đã hòa giải được ${state.quests.zone2Fragments.size}/3 nhóm trong căn nhà ba gian.`);
      return;
    case "rewardEmblem":
      if (state.quests.zone2Fragments.size < 3) {
        showStoryToast("Bàn tròn vẫn thiếu những mảnh hợp nhất từ ba căn phòng.");
        return;
      }
      state.quests.zone2RewardClaimed = true;
      item.collected = true;
      collectRelic("unified-emblem", getReturnGuidanceForLevel("archive"));
      return;
    case "splitChoice":
      item.used = true;
      adjustSaDoa(28, "Bạn dùng chia rẽ nội bộ để áp đặt quyền lực, trái với tinh thần hợp nhất.");
      return;
    case "recruit":
      state.quests.zone3Recruits.add(item.recruitId);
      showStoryToast(`Khối đại đoàn kết đã quy tụ ${state.quests.zone3Recruits.size}/4 lực lượng.`);
      return;
    case "rewardThread":
      if (state.quests.zone3Recruits.size < 4) {
        showStoryToast("Quảng trường Đỏ cần đủ nông dân, công nhân, trí thức và tư sản dân tộc.");
        return;
      }
      state.quests.zone3ThreadClaimed = true;
      collectRelic("vietminh-thread", getReturnGuidanceForLevel("crossroads"));
      return;
    case "rescueHamlet":
      state.quests.zone3HamletsFreed.add(item.hamletId);
      item.collected = true;
      showStoryToast(`Bạn đã phá ${state.quests.zone3HamletsFreed.size}/3 ấp chiến lược.`);
      return;
    case "rewardMap": {
      const southernBoss = currentLevel().monsters?.find((monster) => monster.id === "southern-tyrant");

      if (state.quests.zone3HamletsFreed.size < 3) {
        showStoryToast("Người dân miền Nam vẫn còn mắc kẹt trong các ấp chiến lược.");
        return;
      }

      if (southernBoss && !southernBoss.defeated) {
        showStoryToast("Bạn phải đánh bại bộ máy áp bức trước khi nhận Bản đồ hàn gắn.");
        return;
      }

      state.quests.zone3MapClaimed = true;
      collectRelic("healed-map", getReturnGuidanceForLevel("crossroads"));
      return;
    }
    case "permanentDivision":
      item.used = true;
      triggerBadEnding("Bạn ký vào hiệp ước chia cắt vĩnh viễn đất nước.");
      return;
    case "breakBarrier":
      state.quests.zone4Barriers.add(item.barrierId);
      item.collected = true;
      showStoryToast(`Đã phá ${state.quests.zone4Barriers.size}/3 hàng rào cơ chế quan liêu bao cấp.`);
      return;
    case "deliverKhoan10":
      if (state.quests.zone4Barriers.size < 3) {
        showStoryToast("Bạn phải phá rào cản bao cấp trước khi trao Khoán 10.");
        return;
      }
      state.quests.zone4Farmers.add(item.farmerId);
      showStoryToast(`Khoán 10 đã tới ${state.quests.zone4Farmers.size}/3 hộ nông dân.`);
      return;
    case "rewardGear":
      if (state.quests.zone4Barriers.size < 3 || state.quests.zone4Farmers.size < 3) {
        showStoryToast("Hãy phá hết rào cản và trao đủ Khoán 10 cho nông dân.");
        return;
      }
      state.quests.zone4GearClaimed = true;
      collectRelic("doi-moi-gear", getReturnGuidanceForLevel("spring"));
      return;
    case "fillCorruption":
      item.used = true;
      triggerBadEnding("Bạn sa vào tham nhũng, quan liêu và đánh mất lòng dân.");
      return;
    case "ideologyTrap":
      item.used = true;
      triggerBadEnding("Bạn nghe theo lời dụ dỗ đa nguyên chính trị và làm chệch hướng đất nước.");
      return;
    case "ending":
      attemptEndingInteraction();
      return;
    default:
      return;
  }
}

function collectRelic(itemId, guidance = "") {
  if (!itemId || state.inventory.has(itemId)) {
    return false;
  }

  const relic = RELIC_DEFINITIONS[itemId];
  state.inventory.add(itemId);
  updateProgressHud();
  showStoryToast(
    guidance
      ? `Nhận được ${relic?.label ?? "tín vật lạ"}. ${guidance}`
      : `Nhận được ${relic?.label ?? "tín vật lạ"}`
  );
  return true;
}

function adjustSaDoa(delta, message = "") {
  state.saDoa = clamp(state.saDoa + delta, 0, SA_DOA_MAX);
  updateProgressHud();

  if (message) {
    showStoryToast(message);
  }

  if (state.saDoa >= SA_DOA_MAX) {
    triggerBadEnding("Thanh Tha hóa đã đầy, nhân dân quay lưng và lịch sử rơi vào bóng đen mới.");
  }
}

function triggerBadEnding(summary) {
  state.saDoa = SA_DOA_MAX;
  state.endingId = "bad";
  state.endingSummary = summary;
  updateProgressHud();
  showEndOverlay();
}

function attemptEndingInteraction() {
  if (state.saDoa >= SA_DOA_BAD_ENDING) {
    state.endingId = "bad";
    state.endingSummary = "Tha hóa đã vượt ngưỡng an toàn trước khi lịch sử kịp được mở khóa.";
    showEndOverlay();
    return;
  }

  const hasAllRelics = REQUIRED_RELIC_IDS.every((itemId) => state.inventory.has(itemId));

  if (!hasAllRelics) {
    showStoryToast("Cánh Cửa Lịch Sử vẫn bị khóa. Bạn cần đủ 5 vật phẩm then chốt.");
    return;
  }

  state.endingId = "good";
  state.endingSummary = "Năm vật phẩm hội tụ và thanh Tha hóa vẫn được giữ ở mức thấp.";
  showEndOverlay();
}

function render() {
  drawWorld();
  drawInteractables();
  drawPlayer();
  drawSkillEffect();
  drawAtmosphere();
  drawVignette();
  drawNavigationAssist();
}

function drawWorld() {
  ctx.clearRect(0, 0, VIEWPORT.width, VIEWPORT.height);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  if (state.currentLevelId === "hub") {
    drawHubWorld(currentLevel().decorations);
  } else if (state.currentLevelId === "village") {
    drawPortMazeWorld(currentLevel().decorations);
  } else if (state.currentLevelId === "archive") {
    drawUnityHouseWorld(currentLevel().decorations);
  } else if (state.currentLevelId === "crossroads") {
    drawRedSquareWorld(currentLevel().decorations);
  } else {
    drawDoiMoiValleyWorld(currentLevel().decorations);
  }

  drawLevelExitPortals(currentLevel().exits);

  ctx.restore();
}

function drawLevelExitPortals(exits) {
  for (const exit of exits) {
    if (!shouldDrawExitPortal(exit)) {
      continue;
    }

    drawLevelExitPortal(exit);
  }
}

function shouldDrawExitPortal(exit) {
  if (!exit.portal) {
    return false;
  }

  if (typeof exit.portal.visibleWhen === "function") {
    return exit.portal.visibleWhen();
  }

  if (typeof exit.portal.visibleWhen === "boolean") {
    return exit.portal.visibleWhen;
  }

  return true;
}

function drawLevelExitPortal(exit) {
  const portal = exit.portal;
  const centerX = portal.x ?? Math.round(exit.x + exit.width / 2);
  const centerY = portal.y ?? Math.round(exit.y + exit.height / 2);
  const pulse = 0.7 + (Math.sin(state.lastTimestamp * 0.0045 + centerX * 0.01 + centerY * 0.01) + 1) * 0.12;

  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = "rgba(8, 12, 18, 0.74)";
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + (portal.shadowOffsetY ?? 18), portal.shadowWidth ?? 24, portal.shadowHeight ?? 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  drawWorldWarmGlow(centerX, centerY - 4, portal.auraRadius ?? 42, (portal.auraAlpha ?? 0.12) + pulse * 0.08);
  drawHubPortalSprite({
    x: centerX,
    y: centerY,
    color: portal.color ?? "#dce4f3",
    glow: portal.glow ?? "#d8a65e",
    drawSize: portal.drawSize ?? 56,
    auraWidth: portal.auraWidth ?? 20,
    auraHeight: portal.auraHeight ?? 24,
    innerGlowAlpha: portal.innerGlowAlpha ?? 0.28,
    spriteAlpha: portal.spriteAlpha ?? 0.96,
  });

  if (portal.label) {
    drawLevelExitPortalLabel(portal, centerX, centerY, pulse);
  }
}

function drawLevelExitPortalLabel(portal, centerX, centerY, pulse) {
  const labelWidth = portal.labelWidth ?? 82;
  const labelHeight = portal.labelHeight ?? 18;
  const labelY = centerY + (portal.labelOffsetY ?? 34);

  ctx.save();
  ctx.globalAlpha = Math.min(1, 0.82 + pulse * 0.08);
  ctx.fillStyle = "rgba(18, 23, 31, 0.92)";
  ctx.fillRect(centerX - labelWidth / 2, labelY, labelWidth, labelHeight);
  ctx.strokeStyle = "rgba(245, 232, 195, 0.28)";
  ctx.lineWidth = 2;
  ctx.strokeRect(centerX - labelWidth / 2, labelY, labelWidth, labelHeight);
  ctx.fillStyle = "#f6ebca";
  ctx.font = '9px "Courier New", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(portal.label, centerX, labelY + labelHeight / 2 + 1);
  ctx.restore();
}

function drawExitGuides(exits) {
  for (const exit of exits) {
    if (!shouldDrawExitGuide(exit)) {
      continue;
    }

    for (let index = 0; index < exit.guide.markers.length; index += 1) {
      drawExitGuideMarker(exit.guide, exit.guide.markers[index], index);
    }
  }
}

function drawExitGuideMarker(guide, marker, index) {
  const direction = marker.direction ?? "right";
  const size = Math.min(marker.size ?? guide.size ?? 2, NAVIGATION_ASSIST.exitGuideMaxCellSize);
  const travel = 2 + (marker.travel ?? 0);
  const pulsePhase = state.lastTimestamp * 0.006 + index * 0.85;
  const pulse = 0.74 + (Math.sin(pulsePhase) + 1) * 0.13;
  const travelOffset = Math.round(Math.sin(pulsePhase) * travel);
  let drawX = marker.x;
  let drawY = marker.y;

  if (direction === "right") {
    drawX += travelOffset;
  } else if (direction === "left") {
    drawX -= travelOffset;
  } else if (direction === "up") {
    drawY -= travelOffset;
  } else {
    drawY += travelOffset;
  }

  const glowRadius = 14 + size * 4;
  const glowAlpha = guide.glowAlpha ?? 0.16;
  drawWorldWarmGlow(drawX, drawY, glowRadius, glowAlpha * pulse);

  ctx.save();
  ctx.globalAlpha = 0.18 * pulse;
  drawPixelExitArrow(drawX + 1, drawY + 1, direction, size, "#1a1614");
  ctx.restore();

  drawPixelExitArrow(drawX, drawY, direction, size, "#2b2019");
  drawPixelExitArrow(drawX, drawY, direction, size - 1, guide.color ?? "#f3d777");
}

function shouldDrawExitGuide(exit) {
  if (!exit.guide?.markers?.length) {
    return false;
  }

  if (typeof exit.guide.visibleWhen === "function") {
    return exit.guide.visibleWhen();
  }

  if (typeof exit.guide.visibleWhen === "boolean") {
    return exit.guide.visibleWhen;
  }

  return true;
}

function drawPixelExitArrow(centerX, centerY, direction, cellSize, color) {
  if (cellSize <= 0) {
    return;
  }

  const pattern = [
    "1100000000000",
    "1111000000000",
    "1111111000000",
    "1111111111111",
    "1111111000000",
    "1111000000000",
    "1100000000000",
  ];
  const width = pattern[0].length;
  const height = pattern.length;
  const originX = (width - 1) / 2;
  const originY = (height - 1) / 2;

  ctx.fillStyle = color;

  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      if (pattern[row][col] !== "1") {
        continue;
      }

      const localX = (col - originX) * cellSize;
      const localY = (row - originY) * cellSize;
      let drawX = centerX + localX;
      let drawY = centerY + localY;

      if (direction === "left") {
        drawX = centerX - localX;
      } else if (direction === "up") {
        drawX = centerX + localY;
        drawY = centerY - localX;
      } else if (direction === "down") {
        drawX = centerX + localY;
        drawY = centerY + localX;
      }

      ctx.fillRect(Math.round(drawX), Math.round(drawY), cellSize, cellSize);
    }
  }
}

function drawHubWorld(decorations) {
  ctx.fillStyle = "#0d1423";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  const hasHubHero = drawCoverImage(environmentSprites.generatedWorlds?.historyHub, 0, 0, WORLD.width, WORLD.height, {
    alpha: 0.92,
    filter: "saturate(0.82) brightness(0.7) contrast(1.03)",
    overlayColor: "rgba(9, 14, 24, 0.18)",
  });

  if (!hasHubHero) {
    ctx.fillStyle = "#18263a";
    ctx.fillRect(0, 160, WORLD.width, WORLD.height - 160);
    drawPixelCrawlerTerrainFill(PIXEL_CRAWLER_TERRAIN.stone, 0, 160, WORLD.width, WORLD.height - 160, {
      seed: 5,
      scale: 2.25,
      alpha: 0.18,
    });
    ctx.fillStyle = "rgba(13, 20, 35, 0.66)";
    ctx.fillRect(0, 160, WORLD.width, WORLD.height - 160);

    for (const star of decorations.stars) {
      ctx.fillStyle = "#e8f0ff";
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }

    ctx.fillStyle = "#314765";
    ctx.fillRect(decorations.plaza.x, decorations.plaza.y, decorations.plaza.width, decorations.plaza.height);
    drawPixelCrawlerTerrainFill(
      PIXEL_CRAWLER_TERRAIN.brick,
      decorations.plaza.x + 18,
      decorations.plaza.y + 18,
      decorations.plaza.width - 36,
      decorations.plaza.height - 36,
      { seed: 6, scale: 2.25, alpha: 0.24 }
    );
    ctx.fillStyle = "rgba(54, 76, 105, 0.64)";
    ctx.fillRect(decorations.plaza.x + 18, decorations.plaza.y + 18, decorations.plaza.width - 36, decorations.plaza.height - 36);
    ctx.fillStyle = "#506685";
    ctx.fillRect(454, 300, 52, 196);
    ctx.fillRect(246, 300, 468, 40);
    ctx.fillStyle = "#6b82a2";
    ctx.fillRect(464, 312, 32, 184);
    ctx.fillRect(264, 310, 432, 20);

    drawHistoryGateSprite(decorations.gate);
    drawCainosOutdoorProps(decorations.cainosProps);
  }

  for (const portal of decorations.portals) {
    drawHubPortal(portal);
  }
}

function drawHistoryGateSprite(gate) {
  drawWorldWarmGlow(gate.x + gate.width / 2, gate.y + 26, 46, 0.12);
  const onlineDoor = environmentSprites.openGameArt?.historyDoor;

  ctx.save();
  ctx.fillStyle = "rgba(8, 12, 19, 0.42)";
  ctx.fillRect(gate.x - 10, gate.y + gate.height - 2, gate.width + 20, 8);
  ctx.fillStyle = "#1b2638";
  ctx.fillRect(gate.x - 10, gate.y + 8, gate.width + 20, gate.height - 2);
  ctx.fillStyle = "#25364f";
  ctx.fillRect(gate.x - 4, gate.y + 14, gate.width + 8, gate.height - 12);
  ctx.fillStyle = "#111927";
  ctx.fillRect(gate.x + 8, gate.y + 24, gate.width - 16, gate.height - 24);
  ctx.restore();

  if (canDrawSprite(onlineDoor)) {
    return;
  }

  if (drawSpriteRect(
    environmentSprites.pixelCrawler?.buildingProps,
    PIXEL_CRAWLER_BUILDING_SPRITES.historyGateDoor,
    gate.x + 8,
    gate.y + 24,
    gate.width - 16,
    gate.height - 28,
    {
      filter: "brightness(1.22) saturate(0.78)",
    }
  )) {
    ctx.save();
    ctx.fillStyle = "rgba(192, 222, 250, 0.12)";
    ctx.fillRect(gate.x + 32, gate.y + 48, gate.width - 64, gate.height - 82);
    ctx.restore();
    return;
  }

  ctx.fillStyle = "#223046";
  ctx.fillRect(gate.x, gate.y, gate.width, gate.height);
  ctx.fillStyle = "#42526a";
  ctx.fillRect(gate.x + 8, gate.y + 12, gate.width - 16, gate.height - 12);
  ctx.fillStyle = "#1a2434";
  ctx.fillRect(gate.x + 20, gate.y + 22, gate.width - 40, gate.height - 26);
}

function drawHubPortal(portal) {
  ctx.save();
  drawWorldWarmGlow(portal.x, portal.y - 4, 54, 0.2);
  drawHubPortalSprite(portal);

  const labelY = portal.y + (portal.labelOffsetY ?? 38);
  ctx.fillStyle = "rgba(22, 27, 36, 0.92)";
  ctx.fillRect(portal.x - 42, labelY, 84, 28);
  ctx.strokeStyle = "rgba(245, 232, 195, 0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(portal.x - 42, labelY, 84, 28);
  ctx.fillStyle = "#f6ebca";
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(portal.title ?? "", portal.x, labelY + 4);
  ctx.fillStyle = "#d0d7e7";
  ctx.font = '9px "Courier New", monospace';
  ctx.fillText(portal.subtitle ?? "", portal.x, labelY + 16);
  ctx.restore();
}

function drawHubPortalSprite(portal) {
  const portalSheet = environmentSprites.hubPortalSheet;

  if (!canDrawSprite(portalSheet)) {
    drawFallbackHubPortal(portal);
    return;
  }

  const frameIndex = Math.floor(state.lastTimestamp / HUB_PORTAL_SPRITE.frameDuration) % HUB_PORTAL_SPRITE.frameCount;
  const sourceCol = frameIndex % HUB_PORTAL_SPRITE.columns;
  const sourceRow = Math.floor(frameIndex / HUB_PORTAL_SPRITE.columns);
  const sourceX = sourceCol * HUB_PORTAL_SPRITE.frameSize;
  const sourceY = sourceRow * HUB_PORTAL_SPRITE.frameSize;
  const drawSize = portal.drawSize ?? HUB_PORTAL_SPRITE.drawSize;
  const drawX = Math.round(portal.x - drawSize / 2);
  const drawY = Math.round(portal.y - drawSize / 2);
  const auraWidth = portal.auraWidth ?? Math.round(drawSize * 0.35);
  const auraHeight = portal.auraHeight ?? Math.round(drawSize * 0.41);

  ctx.save();
  ctx.globalAlpha = portal.innerGlowAlpha ?? 0.34;
  ctx.fillStyle = portal.glow;
  ctx.beginPath();
  ctx.ellipse(portal.x, portal.y, auraWidth, auraHeight, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = portal.spriteAlpha ?? 1;
  ctx.drawImage(
    portalSheet,
    sourceX,
    sourceY,
    HUB_PORTAL_SPRITE.frameSize,
    HUB_PORTAL_SPRITE.frameSize,
    drawX,
    drawY,
    drawSize,
    drawSize
  );
  ctx.restore();
}

function drawFallbackHubPortal(portal) {
  const drawSize = portal.drawSize ?? HUB_PORTAL_SPRITE.drawSize;
  const scale = drawSize / HUB_PORTAL_SPRITE.drawSize;
  const outerHalfWidth = Math.round(26 * scale);
  const outerHalfHeight = Math.round(18 * scale);
  const innerHalfWidth = Math.round(18 * scale);
  const innerHalfHeight = Math.round(26 * scale);
  const coreHalfWidth = Math.round(10 * scale);
  const coreHalfHeight = Math.round(18 * scale);

  ctx.fillStyle = "#2a3446";
  ctx.fillRect(portal.x - outerHalfWidth, portal.y - outerHalfHeight, outerHalfWidth * 2, outerHalfHeight * 2);
  ctx.fillStyle = portal.color;
  ctx.fillRect(portal.x - innerHalfWidth, portal.y - innerHalfHeight, innerHalfWidth * 2, innerHalfHeight * 2);
  ctx.fillStyle = portal.glow;
  ctx.fillRect(portal.x - coreHalfWidth, portal.y - coreHalfHeight, coreHalfWidth * 2, coreHalfHeight * 2);
}

function drawPixelCrawlerVegetation(patches = []) {
  const vegetationSheet = environmentSprites.pixelCrawler?.vegetation;

  if (!patches.length || !canDrawSprite(vegetationSheet)) {
    return;
  }

  const sortedPatches = [...patches].sort((left, right) => left.y - right.y);

  for (const patch of sortedPatches) {
    const sprite = PIXEL_CRAWLER_VEGETATION_SPRITES[patch.variant % PIXEL_CRAWLER_VEGETATION_SPRITES.length];
    const scale = patch.scale ?? 1;
    const drawWidth = Math.round(sprite.width * scale);
    const drawHeight = Math.round(sprite.height * scale);
    const drawX = Math.round(patch.x - drawWidth / 2);
    const drawY = Math.round(patch.y - drawHeight);

    ctx.save();
    ctx.globalAlpha = patch.alpha ?? 1;
    ctx.fillStyle = "rgba(10, 16, 13, 0.18)";
    ctx.fillRect(drawX + 6, drawY + drawHeight - 8, Math.max(10, drawWidth - 12), 6);
    ctx.drawImage(
      vegetationSheet,
      sprite.x,
      sprite.y,
      sprite.width,
      sprite.height,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    );
    ctx.restore();
  }
}

function drawPixelCrawlerTrees(trees = []) {
  const treeSheet = environmentSprites.pixelCrawler?.trees;

  if (!trees.length || !canDrawSprite(treeSheet)) {
    return;
  }

  const sortedTrees = [...trees].sort((left, right) => left.y - right.y);

  for (const tree of sortedTrees) {
    const displayVariants = PIXEL_CRAWLER_TREE_SPRITE.displayVariants;
    const variant = displayVariants[Math.abs(tree.variant ?? 0) % displayVariants.length];
    const sourceCol = variant % PIXEL_CRAWLER_TREE_SPRITE.columns;
    const sourceRow = Math.floor(variant / PIXEL_CRAWLER_TREE_SPRITE.columns);
    const sourceX = sourceCol * PIXEL_CRAWLER_TREE_SPRITE.frameWidth;
    const sourceY = sourceRow * PIXEL_CRAWLER_TREE_SPRITE.frameHeight;
    const scale = clamp(tree.scale ?? 1, 0.72, 0.92);
    const drawWidth = Math.round(PIXEL_CRAWLER_TREE_SPRITE.frameWidth * scale);
    const drawHeight = Math.round(PIXEL_CRAWLER_TREE_SPRITE.frameHeight * scale);
    const drawX = Math.round(tree.x - drawWidth / 2);
    const drawY = Math.round(tree.y - drawHeight);

    ctx.save();
    ctx.fillStyle = "rgba(10, 12, 14, 0.16)";
    ctx.fillRect(drawX + 8, drawY + drawHeight - 10, Math.max(12, drawWidth - 16), 7);
    ctx.drawImage(
      treeSheet,
      sourceX,
      sourceY,
      PIXEL_CRAWLER_TREE_SPRITE.frameWidth,
      PIXEL_CRAWLER_TREE_SPRITE.frameHeight,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    );
    ctx.restore();
  }
}

function drawPixelCrawlerToolClusters(clusters = []) {
  const toolsSheet = environmentSprites.pixelCrawler?.tools;

  if (!clusters.length || !canDrawSprite(toolsSheet)) {
    return;
  }

  const sortedClusters = [...clusters].sort((left, right) => left.y - right.y);

  for (const cluster of sortedClusters) {
    const sprite = PIXEL_CRAWLER_TOOL_CLUSTER_SPRITES[cluster.variant % PIXEL_CRAWLER_TOOL_CLUSTER_SPRITES.length];
    const scale = cluster.scale ?? 1;
    const drawWidth = Math.round(sprite.width * scale);
    const drawHeight = Math.round(sprite.height * scale);
    const drawX = Math.round(cluster.x - drawWidth / 2);
    const drawY = Math.round(cluster.y - drawHeight);

    ctx.save();
    ctx.globalAlpha = cluster.alpha ?? 0.96;
    ctx.fillStyle = "rgba(12, 10, 8, 0.18)";
    ctx.fillRect(drawX + 4, drawY + drawHeight - 8, Math.max(8, drawWidth - 8), 6);
    ctx.drawImage(
      toolsSheet,
      sprite.x,
      sprite.y,
      sprite.width,
      sprite.height,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    );
    ctx.restore();
  }
}

function drawPlacedSpriteClusters(image, spriteMap, placements = []) {
  if (!placements.length || !canDrawSprite(image)) {
    return;
  }

  const sortedPlacements = [...placements].sort((left, right) => left.y - right.y);

  for (const placement of sortedPlacements) {
    const sprite = spriteMap[placement.sprite];

    if (!sprite) {
      continue;
    }

    const scale = placement.scale ?? 1;
    const drawWidth = Math.round(sprite.width * scale);
    const drawHeight = Math.round(sprite.height * scale);
    const drawX = Math.round(placement.x);
    const drawY = Math.round(placement.y);

    if (!sprite.noShadow) {
      const shadowWidth = Math.round((sprite.shadowWidth ?? Math.max(14, sprite.width * 0.7)) * scale);
      const shadowHeight = Math.max(4, Math.round((sprite.shadowHeight ?? 6) * scale));
      const shadowOffsetY = Math.round((sprite.shadowOffsetY ?? sprite.height - 8) * scale);

      ctx.save();
      ctx.fillStyle = "rgba(12, 10, 8, 0.18)";
      ctx.fillRect(
        drawX + Math.round((drawWidth - shadowWidth) / 2),
        drawY + shadowOffsetY,
        shadowWidth,
        shadowHeight
      );
      ctx.restore();
    }

    drawSpriteRect(image, sprite, drawX, drawY, drawWidth, drawHeight, {
      alpha: placement.alpha ?? 1,
      filter: placement.filter ?? "none",
    });
  }
}

function drawCainosOutdoorProps(placements = []) {
  drawPlacedSpriteClusters(environmentSprites.cainos?.props, CAINOS_PROP_SPRITES, placements);
}

function drawKenneyLampPost(lamp) {
  drawWorldWarmGlow(lamp.x, lamp.y - 30, 24, 0.26);

  ctx.save();
  ctx.fillStyle = "rgba(10, 8, 6, 0.18)";
  ctx.fillRect(lamp.x - 9, lamp.y - 2, 18, 5);
  ctx.restore();

  const drewPost = drawKenneyRoguelikeSprite(
    KENNEY_ROGUELIKE_SPRITES.torch,
    lamp.x - 10,
    lamp.y - 34,
    20,
    32,
    { filter: "brightness(0.9) saturate(0.92)" }
  );

  if (drewPost) {
    drawKenneyRoguelikeSprite(KENNEY_ROGUELIKE_SPRITES.candle, lamp.x - 5, lamp.y - 41, 10, 14, {
      alpha: 0.82,
      filter: "brightness(1.25) saturate(1.1)",
    });
    return true;
  }

  return false;
}

function drawKenneyFenceSegment(segment) {
  const segmentWidth = segment.posts * 14 + 14;

  if (!canDrawSprite(environmentSprites.kenneyRoguelike?.spritesheet)) {
    return false;
  }

  ctx.save();
  ctx.fillStyle = "rgba(8, 10, 12, 0.2)";
  ctx.fillRect(segment.x - 8, segment.y + 19, segmentWidth - 8, 4);
  ctx.restore();

  for (let index = 0; index < segment.posts; index += 1) {
    if (index === segment.brokenIndex) {
      drawKenneyRoguelikeSprite(
        KENNEY_ROGUELIKE_SPRITES.crate,
        segment.x + index * 14 - 2,
        segment.y + 7,
        14,
        14,
        { alpha: 0.72, filter: "brightness(0.62) saturate(0.68)" }
      );
      continue;
    }

    const x = segment.x + index * 14 - 8;
    const y = segment.y + (index % 2);
    drawKenneyRoguelikeSprite(KENNEY_ROGUELIKE_SPRITES.fenceHorizontal, x, y, 24, 22, {
      filter: "brightness(0.78) saturate(0.84) contrast(1.06)",
    });

    if (index % 3 === 0) {
      drawKenneyRoguelikeSprite(KENNEY_ROGUELIKE_SPRITES.fencePost, x + 10, y + 1, 14, 20, {
        alpha: 0.86,
        filter: "brightness(0.72) saturate(0.82)",
      });
    }
  }

  return true;
}

function drawKenneyMicroTree(tree) {
  const variants = [
    KENNEY_ROGUELIKE_SPRITES.treeGreen,
    KENNEY_ROGUELIKE_SPRITES.treeOrange,
    KENNEY_ROGUELIKE_SPRITES.treeTeal,
    KENNEY_ROGUELIKE_SPRITES.treePineGreen,
    KENNEY_ROGUELIKE_SPRITES.treePineOrange,
  ];
  const sprite = variants[Math.abs(tree.variant ?? 0) % variants.length];
  const scale = tree.scale ?? 1;
  const width = Math.round(44 * scale);
  const height = Math.round(44 * scale);
  const x = Math.round(tree.x - width / 2);
  const y = Math.round(tree.y - height);

  ctx.save();
  ctx.fillStyle = "rgba(10, 12, 10, 0.16)";
  ctx.fillRect(x + 7, y + height - 8, Math.max(12, width - 14), 6);
  ctx.restore();

  return drawKenneyRoguelikeSprite(sprite, x, y, width, height, {
    alpha: tree.alpha ?? 0.98,
    filter: tree.filter ?? "brightness(0.98) saturate(0.94)",
  });
}

function drawLimezuInteriorProps(placements = []) {
  drawPlacedSpriteClusters(environmentSprites.limezu?.interiors, LIMEZU_INTERIOR_SPRITES, placements);
}

function drawArchiveHouseInteriorProps(placements = []) {
  drawPlacedSpriteClusters(environmentSprites.archiveHouseInterior, HOUSE_INTERIOR_A_SPRITES, placements);
}

function drawPortForestGround() {
  ctx.fillStyle = "#2a2c31";
  ctx.fillRect(0, 108, WORLD.width, 356);

  if (drawPixelCrawlerTerrainFill(PIXEL_CRAWLER_TERRAIN.stone, 0, 108, WORLD.width, 356, {
    seed: 21,
    scale: 2.75,
    alpha: 0.16,
  })) {
    ctx.fillStyle = "rgba(18, 22, 30, 0.54)";
    ctx.fillRect(0, 108, WORLD.width, 356);
  }

  ctx.save();
  ctx.globalAlpha = 0.28;
  for (let index = 0; index < 90; index += 1) {
    const x = 18 + ((index * 53) % (WORLD.width - 36));
    const y = 122 + ((index * 37) % 320);
    const tone = index % 3;
    ctx.fillStyle = tone === 0 ? "#4b4943" : tone === 1 ? "#2c2f34" : "#5a554d";
    ctx.fillRect(x, y, 12 + (index % 4) * 4, 2);
  }
  ctx.restore();
}

function drawPortMazeHedge(shrub) {
  ctx.save();
  ctx.fillStyle = "#181a1f";
  ctx.fillRect(shrub.x - 2, shrub.y - 2, shrub.width + 4, shrub.height + 4);
  ctx.fillStyle = "#49433c";
  ctx.fillRect(shrub.x, shrub.y, shrub.width, shrub.height);
  ctx.fillStyle = "#282522";
  ctx.fillRect(shrub.x + 5, shrub.y + 5, Math.max(4, shrub.width - 10), Math.max(4, shrub.height - 10));

  for (let x = shrub.x + 4; x < shrub.x + shrub.width - 4; x += 14) {
    const y = shrub.y + 3 + ((x + shrub.y) % Math.max(4, shrub.height - 8));
    ctx.fillStyle = (x / 14) % 2 < 1 ? "#62574d" : "#3a332d";
    ctx.fillRect(x, y, 8, 3);
  }

  ctx.restore();
}

function drawSoftFogBand(fog) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.filter = "blur(4px)";

  for (let index = 0; index < 4; index += 1) {
    const centerX = fog.x + fog.width * (0.18 + index * 0.22);
    const centerY = fog.y + fog.height * (0.45 + ((index % 2) - 0.5) * 0.28);
    const radiusX = fog.width * (0.18 + (index % 2) * 0.04);
    const radiusY = fog.height * (0.42 + (index % 3) * 0.08);
    const gradient = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, radiusX);
    gradient.addColorStop(0, `rgba(218, 235, 232, ${fog.alpha * 0.8})`);
    gradient.addColorStop(0.6, `rgba(218, 235, 232, ${fog.alpha * 0.36})`);
    gradient.addColorStop(1, "rgba(218, 235, 232, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawPortMazeWorld(decorations) {
  ctx.fillStyle = "#172235";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  drawPortForestGround();

  if (drawPixelCrawlerTerrainFill(PIXEL_CRAWLER_TERRAIN.stone, 0, 464, WORLD.width, 98, {
    seed: 32,
    scale: 2.25,
    alpha: 0.26,
  })) {
    ctx.fillStyle = "rgba(15, 26, 34, 0.5)";
    ctx.fillRect(0, 464, WORLD.width, 98);
  } else {
    ctx.fillStyle = "#213143";
    ctx.fillRect(0, 464, WORLD.width, 98);
  }

  ctx.fillStyle = "#0f1925";
  ctx.fillRect(0, 562, WORLD.width, 78);

  for (const shrub of decorations.mazeShrubs) {
    drawPortMazeHedge(shrub);
  }

  for (const fog of decorations.fogBands) {
    drawSoftFogBand(fog);
  }

  const hasHarborHero = drawCoverImage(
    environmentSprites.generatedWorlds?.colonialHarbor,
    286,
    88,
    646,
    474,
    {
      alpha: 0.92,
      filter: "saturate(0.9) brightness(0.86) contrast(1.02)",
    }
  );

  if (!hasHarborHero) {
    drawPixelCrawlerVegetation(decorations.crawlerBushes);
    drawPixelCrawlerTrees(decorations.crawlerTrees);

    ctx.fillStyle = "#485b68";
    ctx.fillRect(decorations.port.x, decorations.port.y, decorations.port.width, decorations.port.height);
    drawPixelCrawlerTerrainFill(
      PIXEL_CRAWLER_TERRAIN.brick,
      decorations.port.x,
      decorations.port.y,
      decorations.port.width,
      decorations.port.height,
      { seed: 43, scale: 1.5, alpha: 0.62 }
    );
    ctx.fillStyle = "rgba(22, 28, 33, 0.24)";
    ctx.fillRect(decorations.port.x, decorations.port.y, decorations.port.width, decorations.port.height);
    ctx.fillStyle = "#8c6a4c";
    ctx.fillRect(decorations.port.x, decorations.port.y + 12, decorations.port.width, 18);
    ctx.fillStyle = "#9b7858";
    ctx.fillRect(decorations.port.x, decorations.port.y + 42, decorations.port.width, 16);

    ctx.fillStyle = "#7d5c3d";
    ctx.fillRect(decorations.mansion.x, decorations.mansion.y, decorations.mansion.width, decorations.mansion.height);
    ctx.fillStyle = "#5e3c2e";
    ctx.fillRect(decorations.mansion.x - 10, decorations.mansion.y - 16, decorations.mansion.width + 20, 18);
    ctx.fillStyle = "#d1b38a";
    ctx.fillRect(decorations.mansion.x + 26, decorations.mansion.y + 40, 34, 54);
    ctx.fillRect(decorations.mansion.x + 104, decorations.mansion.y + 42, 42, 46);

    drawCainosOutdoorProps(decorations.cainosProps);

    for (const lamp of decorations.lampPosts) {
      if (drawKenneyLampPost(lamp)) {
        continue;
      }

      drawWorldWarmGlow(lamp.x, lamp.y - 30, 24, 0.28);
      ctx.fillStyle = "#44382d";
      ctx.fillRect(lamp.x - 2, lamp.y - 26, 4, 30);
      ctx.fillStyle = "#f0db8f";
      ctx.fillRect(lamp.x - 5, lamp.y - 34, 10, 8);
    }

    drawPixelCrawlerToolClusters(decorations.crawlerTools);
  }
}

function drawUnityHouseWorld(decorations) {
  ctx.fillStyle = "#191411";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  const hasArchiveHero = drawCoverImage(
    environmentSprites.generatedWorlds?.archiveInterior,
    decorations.house.x + 14,
    decorations.house.y + 12,
    decorations.house.width - 28,
    decorations.house.height - 18,
    {
      alpha: 0.97,
      filter: "saturate(0.96) brightness(0.96) contrast(1.02)",
    }
  );

  if (hasArchiveHero) {
    return;
  }

  ctx.fillStyle = "#4b372a";
  ctx.fillRect(decorations.house.x, decorations.house.y, decorations.house.width, decorations.house.height);
  ctx.fillStyle = "#6b5038";
  ctx.fillRect(decorations.house.x + 12, decorations.house.y + 12, decorations.house.width - 24, decorations.house.height - 24);
  if (drawPixelTextureFill(
    environmentSprites.archiveParquet,
    decorations.house.x + 12,
    decorations.house.y + 12,
    decorations.house.width - 24,
    decorations.house.height - 24,
    {
      sampleSize: 28,
      tileDrawSize: 64,
      alpha: 0.46,
    }
  )) {
    ctx.fillStyle = "rgba(82, 55, 35, 0.42)";
    ctx.fillRect(decorations.house.x + 12, decorations.house.y + 12, decorations.house.width - 24, decorations.house.height - 24);
  }

  for (const room of decorations.rooms) {
    ctx.fillStyle = "#5e4432";
    ctx.fillRect(room.x, room.y, room.width, room.height);
    if (drawPixelTextureFill(environmentSprites.archiveParquet, room.x + 10, room.y + 10, room.width - 20, room.height - 20, {
      sampleSize: 28,
      tileDrawSize: 48,
      alpha: 0.38,
    })) {
      ctx.fillStyle = "rgba(86, 59, 39, 0.38)";
      ctx.fillRect(room.x + 10, room.y + 10, room.width - 20, room.height - 20);
    } else {
      ctx.fillStyle = "#7a5a42";
      ctx.fillRect(room.x + 10, room.y + 10, room.width - 20, room.height - 20);
    }
    ctx.fillStyle = "#2a1f18";
    ctx.fillRect(room.x + Math.floor(room.width / 2) - 14, room.y + room.height - 20, 28, 20);
  }

  for (const beamX of decorations.beams) {
    ctx.fillStyle = "#2d1e15";
    ctx.fillRect(beamX, decorations.house.y, 10, decorations.house.height);
  }

  drawLimezuInteriorProps(decorations.limezuFloorProps);

  for (const rug of decorations.rugs) {
    ctx.fillStyle = "#7c2e2a";
    ctx.fillRect(rug.x, rug.y, rug.width, rug.height);
    ctx.fillStyle = "#d7bb79";
    ctx.fillRect(rug.x + 10, rug.y + 10, rug.width - 20, rug.height - 20);
  }

  drawArchiveHouseInteriorProps(decorations.houseInteriorFurnitureProps);
}

function drawRedSquareWorld(decorations) {
  ctx.fillStyle = "#d6d2c6";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  const hasRedSquareHero = drawCoverImage(environmentSprites.generatedWorlds?.revolutionSquare, 0, 0, WORLD.width, WORLD.height, {
    alpha: 0.96,
    filter: "saturate(0.96) brightness(0.98) contrast(1.01)",
  });

  if (hasRedSquareHero) {
    return;
  }

  ctx.fillStyle = "#a7d8f0";
  ctx.fillRect(0, 0, WORLD.width, 120);
  ctx.fillStyle = "#ccd1d5";
  ctx.fillRect(0, 120, WORLD.width, decorations.splitY - 120);
  ctx.fillStyle = "#7ba953";
  ctx.fillRect(0, decorations.splitY, WORLD.width, WORLD.height - decorations.splitY);
  drawPixelCrawlerTerrainFill(PIXEL_CRAWLER_TERRAIN.grass, 0, decorations.splitY, WORLD.width, WORLD.height - decorations.splitY, {
    seed: 61,
    scale: 1.5,
    alpha: 0.28,
  });
  ctx.fillStyle = "rgba(88, 132, 61, 0.2)";
  ctx.fillRect(0, decorations.splitY, WORLD.width, WORLD.height - decorations.splitY);

  ctx.fillStyle = "#c8b38c";
  ctx.fillRect(decorations.northSquare.x, decorations.northSquare.y, decorations.northSquare.width, decorations.northSquare.height);
  drawPixelCrawlerTerrainFill(
    PIXEL_CRAWLER_TERRAIN.stone,
    decorations.northSquare.x + 20,
    decorations.northSquare.y + 20,
    decorations.northSquare.width - 40,
    decorations.northSquare.height - 40,
    { seed: 62, scale: 1.5, alpha: 0.42 }
  );
  ctx.fillStyle = "rgba(220, 201, 160, 0.32)";
  ctx.fillRect(decorations.northSquare.x + 20, decorations.northSquare.y + 20, decorations.northSquare.width - 40, decorations.northSquare.height - 40);
  ctx.fillStyle = "#bfa16b";
  for (let x = decorations.northSquare.x + 40; x < decorations.northSquare.x + decorations.northSquare.width - 32; x += 38) {
    ctx.fillRect(x, decorations.northSquare.y + 138, 14, 26);
  }

  ctx.fillStyle = "#3f7fb1";
  ctx.fillRect(decorations.river.x, decorations.river.y, decorations.river.width, decorations.river.height);
  ctx.fillStyle = "#60a4d1";
  ctx.fillRect(decorations.river.x, decorations.river.y + 10, decorations.river.width, 12);
  ctx.fillStyle = "rgba(212, 239, 255, 0.34)";
  ctx.fillRect(decorations.river.x, decorations.river.y + 26, decorations.river.width, 6);
  ctx.fillStyle = "#6d5238";
  ctx.fillRect(decorations.bridge.x, decorations.bridge.y, decorations.bridge.width, decorations.bridge.height);
  ctx.fillStyle = "#9c7754";
  ctx.fillRect(decorations.bridge.x + 14, decorations.bridge.y + 12, decorations.bridge.width - 28, decorations.bridge.height - 24);

  ctx.fillStyle = "#9a815e";
  ctx.fillRect(decorations.southTown.x, decorations.southTown.y, decorations.southTown.width, decorations.southTown.height);
  drawPixelCrawlerTerrainFill(
    PIXEL_CRAWLER_TERRAIN.dirt,
    decorations.southTown.x + 24,
    decorations.southTown.y + 24,
    decorations.southTown.width - 48,
    decorations.southTown.height - 48,
    { seed: 63, scale: 1.5, alpha: 0.42 }
  );
  ctx.fillStyle = "rgba(92, 69, 48, 0.28)";
  ctx.fillRect(decorations.southTown.x + 24, decorations.southTown.y + 24, decorations.southTown.width - 48, decorations.southTown.height - 48);
  ctx.fillStyle = "#6f523c";
  for (let index = 0; index < 4; index += 1) {
    const hutX = decorations.southTown.x + 44 + index * 158;
    ctx.fillRect(hutX, decorations.southTown.y + 38, 72, 44);
    ctx.fillStyle = "#563d2d";
    ctx.fillRect(hutX - 6, decorations.southTown.y + 30, 84, 12);
    ctx.fillStyle = "#6f523c";
  }

  drawCainosOutdoorProps(decorations.cainosProps);
  drawPixelCrawlerVegetation(decorations.crawlerBushes);
  drawPixelCrawlerTrees(decorations.crawlerTrees);
  drawPixelCrawlerToolClusters(decorations.crawlerTools);

  for (const flag of decorations.flags) {
    ctx.fillStyle = "#684f35";
    ctx.fillRect(flag.x, flag.y, 4, flag.height);
    ctx.fillStyle = "#cf3c37";
    ctx.fillRect(flag.x + 4, flag.y + 4, 28, 14);
    ctx.fillStyle = "#f7d96f";
    ctx.fillRect(flag.x + 15, flag.y + 8, 6, 6);
  }
}

function drawDoiMoiValleyWorld(decorations) {
  ctx.fillStyle = "#d4dbc6";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  const hasFactoryValleyHero = drawCoverImage(environmentSprites.generatedWorlds?.factoryValley, 0, 0, WORLD.width, WORLD.height, {
    alpha: 0.96,
    filter: "saturate(0.96) brightness(0.98) contrast(1.01)",
  });

  if (hasFactoryValleyHero) {
    return;
  }

  ctx.fillStyle = "#98daf4";
  ctx.fillRect(0, 0, WORLD.width, 150);
  ctx.fillStyle = "#d4f1ff";
  ctx.fillRect(0, 150, WORLD.width, 70);

  for (const hill of decorations.hills) {
    ctx.fillStyle = hill.color;
    ctx.fillRect(hill.x, hill.y, hill.width, hill.height);
  }

  for (const cloud of decorations.clouds) {
    ctx.fillStyle = "#f8fdff";
    ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
    ctx.fillRect(cloud.x + 12, cloud.y - 6, cloud.width - 24, 8);
  }

  ctx.fillStyle = "#7abf53";
  ctx.fillRect(0, 220, WORLD.width, WORLD.height - 220);
  drawPixelCrawlerTerrainFill(PIXEL_CRAWLER_TERRAIN.grass, 0, 220, WORLD.width, WORLD.height - 220, {
    seed: 74,
    scale: 1.5,
    alpha: 0.36,
  });
  ctx.fillStyle = "rgba(91, 156, 65, 0.22)";
  ctx.fillRect(0, 220, WORLD.width, WORLD.height - 220);

  for (const plot of decorations.riceFields) {
    ctx.fillStyle = "#cba854";
    ctx.fillRect(plot.x, plot.y, plot.width, plot.height);
    drawPixelCrawlerTerrainFill(PIXEL_CRAWLER_TERRAIN.dirt, plot.x, plot.y, plot.width, plot.height, {
      seed: Math.round(plot.x + plot.y),
      scale: 1.5,
      alpha: 0.22,
    });
    ctx.fillStyle = "#efd77b";
    for (let row = 0; row < 5; row += 1) {
      ctx.fillRect(plot.x + 10, plot.y + 8 + row * 18, plot.width - 20, 4);
    }
  }

  drawPixelCrawlerVegetation(decorations.crawlerBushes);
  drawPixelCrawlerTrees(decorations.crawlerTrees);

  ctx.fillStyle = "#796053";
  ctx.fillRect(decorations.rationMarket.x, decorations.rationMarket.y, decorations.rationMarket.width, decorations.rationMarket.height);
  ctx.fillStyle = "#c7b69c";
  ctx.fillRect(decorations.rationMarket.x + 8, decorations.rationMarket.y + 24, decorations.rationMarket.width - 16, 18);
  ctx.fillStyle = "#4f423a";
  for (let index = 0; index < 4; index += 1) {
    ctx.fillRect(decorations.rationMarket.x + 12 + index * 18, decorations.rationMarket.y + 56, 8, 24);
  }

  for (const factory of decorations.factories) {
    ctx.fillStyle = "#88939c";
    ctx.fillRect(factory.x, factory.y, factory.width, factory.height);
    ctx.fillStyle = "#5d6a74";
    ctx.fillRect(factory.x + 18, factory.y - 30, 18, 30);
    ctx.fillRect(factory.x + 54, factory.y - 44, 20, 44);
    ctx.fillStyle = "#d8e1ea";
    ctx.fillRect(factory.x + 12, factory.y + 18, 18, 14);
    ctx.fillRect(factory.x + 42, factory.y + 22, 18, 14);
    ctx.fillStyle = "#f3f8fb";
    ctx.fillRect(factory.x + 21, factory.y - 36, 8, 6);
    ctx.fillRect(factory.x + 59, factory.y - 50, 8, 6);
  }

  drawPixelCrawlerToolClusters(decorations.crawlerTools);
}

function drawVillageWorld(decorations) {
  drawStormSky(decorations);
  drawVillageGroundBase();
  drawVillageRoads();
  drawVillageRuins(decorations);
  drawPuddles(decorations.puddles);
  drawDryGrassPatches(decorations.dryGrass);
  drawFenceRemains(decorations.fenceSegments);
  drawBrokenCarts(decorations.brokenCarts);
  drawDeadTrees(decorations.deadTrees);
  drawBranchDebris(decorations.branchDebris);
  drawRubble(decorations.rubble);
  drawVillageExitGate();
}

function drawStormSky(decorations) {
  ctx.fillStyle = "#0d121b";
  ctx.fillRect(0, 0, WORLD.width, 52);
  ctx.fillStyle = "#172132";
  ctx.fillRect(0, 52, WORLD.width, 46);
  ctx.fillStyle = "#283140";
  ctx.fillRect(0, 98, WORLD.width, VILLAGE_SKYLINE_Y - 98);

  ctx.fillStyle = "#94a0b2";
  ctx.fillRect(112, 38, 22, 22);
  ctx.fillStyle = "#1a2232";
  ctx.fillRect(120, 32, 22, 22);

  for (const cloud of decorations.clouds) {
    ctx.fillStyle = "#1d2532";
    ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
    ctx.fillRect(cloud.x + 10, cloud.y - 6, cloud.width - 36, 10);
    ctx.fillRect(cloud.x + 26, cloud.y + cloud.height - 4, cloud.width - 64, 6);

    ctx.fillStyle = "#252f3f";
    ctx.fillRect(cloud.x + 8, cloud.y + 4, cloud.width - 20, cloud.height - 8);
  }
}

function drawVillageGroundBase() {
  ctx.fillStyle = "#293039";
  ctx.fillRect(0, VILLAGE_SKYLINE_Y, WORLD.width, WORLD.height - VILLAGE_SKYLINE_Y);

  if (drawPixelCrawlerTerrainFill(PIXEL_CRAWLER_TERRAIN.stone, 0, VILLAGE_SKYLINE_Y, WORLD.width, WORLD.height - VILLAGE_SKYLINE_Y, {
    seed: 13,
    scale: 1.5,
    alpha: 0.34,
  })) {
    ctx.fillStyle = "rgba(18, 25, 31, 0.56)";
    ctx.fillRect(0, VILLAGE_SKYLINE_Y, WORLD.width, WORLD.height - VILLAGE_SKYLINE_Y);
  } else {
    drawVillageTexture(0, VILLAGE_SKYLINE_Y, WORLD.width, WORLD.height - VILLAGE_SKYLINE_Y, {
      seed: 3,
      step: 22,
      colors: ["#313a43", "#202831", "#3a4148", "#26303a"],
      alpha: 0.28,
    });
  }

  ctx.fillStyle = "rgba(16, 21, 27, 0.34)";
  ctx.fillRect(0, 500, WORLD.width, WORLD.height - 500);
  drawPixelCrawlerTerrainFill(PIXEL_CRAWLER_TERRAIN.dirt, 0, 500, WORLD.width, WORLD.height - 500, {
    seed: 18,
    scale: 1.5,
    alpha: 0.18,
  });

  ctx.fillStyle = "rgba(94, 81, 64, 0.14)";
  for (let x = 18; x < WORLD.width; x += 72) {
    ctx.fillRect(x, VILLAGE_SKYLINE_Y + 8 + ((x * 7) % 26), 20, 2);
  }
}

function drawVillageTexture(x, y, width, height, options = {}) {
  const step = options.step ?? 16;
  const seed = options.seed ?? 0;
  const colors = options.colors ?? ["#ffffff"];

  ctx.save();
  ctx.globalAlpha = options.alpha ?? 1;

  for (let drawY = y; drawY < y + height; drawY += step) {
    for (let drawX = x; drawX < x + width; drawX += step) {
      const hash = Math.abs((drawX * 17 + drawY * 31 + seed * 47) % 97);
      const color = colors[hash % colors.length];
      const chipWidth = 2 + (hash % 5);
      const chipHeight = 1 + (hash % 3);
      ctx.fillStyle = color;
      ctx.fillRect(drawX + (hash % Math.max(3, step - 4)), drawY + ((hash * 3) % Math.max(3, step - 4)), chipWidth, chipHeight);
    }
  }

  ctx.restore();
}

function drawVillageRuins(decorations) {
  for (const house of decorations.houses) {
    if (drawRuinedVillageBuilding(house)) {
      continue;
    }

    ctx.fillStyle = "#2f3741";
    ctx.fillRect(house.x, house.y, house.width, house.height);

    ctx.fillStyle = "#20262d";
    ctx.fillRect(house.x - 4, house.y - 8, house.width + 8, 10);

    if (house.breakSide === "left") {
      ctx.fillStyle = "#172132";
      ctx.fillRect(house.x - 4, house.y - 8, 18, 12);
    } else if (house.breakSide === "right") {
      ctx.fillStyle = "#172132";
      ctx.fillRect(house.x + house.width - 14, house.y - 8, 18, 12);
    } else {
      ctx.fillStyle = "#172132";
      ctx.fillRect(house.x + 20, house.y - 10, 14, 14);
    }

    ctx.fillStyle = "#11171e";
    ctx.fillRect(house.x + 8, house.y + 12, 10, 12);
    ctx.fillRect(house.x + house.width - 18, house.y + 10, 8, 10);
    ctx.fillRect(house.x + Math.floor(house.width / 2) - 6, house.y + 22, 12, 18);

    ctx.fillStyle = "#4b535e";
    ctx.fillRect(house.x + 4, house.y + house.height, 12, 4);
    ctx.fillRect(house.x + house.width - 18, house.y + house.height + 2, 14, 4);
  }
}

function drawRuinedVillageBuilding(house) {
  const sprite = environmentSprites.ruinedVillageBuildings?.[house.spriteIndex];

  if (!canDrawSprite(sprite)) {
    return false;
  }

  const scale = house.spriteScale ?? 1;
  const drawWidth = Math.round(sprite.naturalWidth * scale);
  const drawHeight = Math.round(sprite.naturalHeight * scale);
  const drawX = Math.round((house.spriteX ?? house.x + house.width / 2) - drawWidth / 2);
  const drawY = Math.round((house.spriteY ?? house.y + house.height) - drawHeight);

  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = "#080b0e";
  ctx.fillRect(drawX + 8, drawY + drawHeight - 18, drawWidth - 16, 12);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 1;
  ctx.filter = "brightness(0.92) saturate(0.82) contrast(1.06)";
  ctx.drawImage(sprite, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();

  return true;
}

function drawVillageRoads() {
  drawDirtPath(0, 328, WORLD.width, 64, 0);
  drawDirtPath(470, 226, 52, 108, 1);
  drawDirtPath(WORLD.width - 174, 312, 174, 96, 2);

  drawRoadRuts(118, 354, 46, 0);
  drawRoadRuts(286, 374, 62, 1);
  drawRoadRuts(430, 350, 54, 2);
  drawRoadRuts(612, 366, 60, 3);
  drawRoadRuts(804, 350, 54, 4);
}

function drawDirtPath(x, y, width, height, seed = 0) {
  ctx.fillStyle = "#6c5a45";
  ctx.fillRect(x, y + 6, width, height - 12);

  if (drawPixelCrawlerTerrainFill(PIXEL_CRAWLER_TERRAIN.dirt, x, y + 6, width, height - 12, {
    seed: seed + 52,
    scale: 1.5,
    alpha: 0.5,
  })) {
    ctx.fillStyle = "rgba(55, 43, 34, 0.36)";
    ctx.fillRect(x, y + 6, width, height - 12);
  } else {
    drawVillageTexture(x, y + 6, width, height - 12, {
      seed: seed + 12,
      step: 16,
      colors: ["#786448", "#584a3d", "#7f715d", "#453b34"],
      alpha: 0.42,
    });
  }

  for (let px = x; px < x + width; px += 16) {
    const topChip = 2 + Math.abs((px * 7 + seed * 13) % 4);
    const bottomChip = 2 + Math.abs((px * 11 + seed * 17) % 4);

    ctx.fillStyle = "#293039";
    ctx.fillRect(px, y + 2, 10, topChip);
    ctx.fillRect(px + 5, y + height - 4, 12, bottomChip);

    ctx.fillStyle = "rgba(41, 32, 27, 0.28)";
    ctx.fillRect(px + 2, y + 8, 8, 1);
    ctx.fillRect(px + 5, y + height - 9, 10, 1);
  }

  ctx.fillStyle = "rgba(31, 25, 23, 0.16)";
  ctx.fillRect(x, y + 12, width, 1);
  ctx.fillRect(x, y + height - 14, width, 1);
}

function drawRoadRuts(x, y, width, seed = 0) {
  ctx.fillStyle = "rgba(52, 42, 35, 0.5)";
  ctx.fillRect(x, y, width, 2);
  ctx.fillStyle = "rgba(132, 111, 87, 0.32)";
  ctx.fillRect(x + 5, y - 1, Math.max(8, width - 16), 1);

  for (let index = 0; index < 4; index += 1) {
    const stoneX = x + 8 + ((index * 13 + seed * 7) % Math.max(10, width - 14));
    const stoneY = y + 5 + ((index * 5 + seed) % 7);
    drawPixelStone(stoneX, stoneY, 4 + (index % 2), index);
  }
}

function drawPixelStone(x, y, size = 4, tone = 0) {
  ctx.fillStyle = tone % 2 === 0 ? "#4f5658" : "#3e474b";
  ctx.fillRect(x, y, size, Math.max(2, size - 1));
  ctx.fillStyle = "#20262a";
  ctx.fillRect(x, y + size - 1, size, 1);
  ctx.fillStyle = "rgba(150, 156, 150, 0.32)";
  ctx.fillRect(x + 1, y, Math.max(1, size - 2), 1);
}

function drawPuddles(puddles) {
  for (const puddle of puddles) {
    ctx.fillStyle = "rgba(26, 50, 62, 0.58)";
    ctx.fillRect(puddle.x, puddle.y + 2, puddle.width, Math.max(6, puddle.height - 4));

    ctx.fillStyle = "rgba(19, 34, 43, 0.42)";
    ctx.fillRect(puddle.x + 3, puddle.y + 1, Math.max(8, puddle.width - 8), 2);
    ctx.fillRect(puddle.x + 6, puddle.y + puddle.height - 3, Math.max(8, puddle.width - 14), 2);

    ctx.fillStyle = "rgba(92, 128, 142, 0.38)";
    ctx.fillRect(puddle.x + 6, puddle.y + 4, Math.max(6, puddle.width - 18), 1);
    ctx.fillRect(puddle.x + 14, puddle.y + 8, Math.max(4, puddle.width - 28), 1);
  }
}

function drawFenceRemains(fenceSegments) {
  for (const segment of fenceSegments) {
    const drawWidth = segment.posts * 14 + 14;
    const drawHeight = 22;

    if (drawKenneyFenceSegment(segment)) {
      continue;
    }

    if (drawSpriteRect(
      environmentSprites.villageProps?.fencesWallsGate,
      VILLAGE_PROP_SPRITES.fenceVine,
      segment.x - 8,
      segment.y - 3,
      drawWidth,
      drawHeight,
      {
        alpha: 0.9,
        filter: "brightness(0.72) saturate(0.72) contrast(1.08)",
      }
    )) {
      ctx.fillStyle = "rgba(8, 10, 12, 0.24)";
      ctx.fillRect(segment.x - 6, segment.y + 19, drawWidth - 10, 4);
      continue;
    }

    ctx.fillStyle = "rgba(8, 10, 12, 0.24)";
    ctx.fillRect(segment.x - 8, segment.y + 19, segment.posts * 12 + 8, 4);

    for (let index = 0; index < segment.posts; index += 1) {
      if (index === segment.brokenIndex) {
        continue;
      }

      const x = segment.x + index * 12;
      drawFencePost(x, segment.y, index);
      drawFencePlank(x - 5, segment.y + 6 + (index % 2), 13, 3);
      drawFencePlank(x - 3, segment.y + 12 - (index % 2), 12, 3);
    }

    const brokenX = segment.x + segment.brokenIndex * 12;
    drawFencePlank(brokenX - 3, segment.y + 15, 10, 3, -0.18);
    drawPixelStone(brokenX + 6, segment.y + 20, 3, segment.brokenIndex);
  }
}

function drawFencePost(x, y, tone = 0) {
  ctx.fillStyle = "#231d1c";
  ctx.fillRect(x - 1, y - 1, 6, 22);
  ctx.fillStyle = tone % 2 === 0 ? "#5f4c3d" : "#4c3b32";
  ctx.fillRect(x, y, 4, 19);
  ctx.fillStyle = "#8a6b51";
  ctx.fillRect(x + 1, y + 2, 1, 13);
  ctx.fillStyle = "#2f2725";
  ctx.fillRect(x, y + 18, 4, 2);
}

function drawFencePlank(x, y, width, height, rotation = 0) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate(rotation);
  ctx.fillStyle = "#241d1b";
  ctx.fillRect(-1, -1, width + 2, height + 2);
  ctx.fillStyle = "#604838";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#8a6950";
  ctx.fillRect(1, 0, Math.max(1, width - 3), 1);
  ctx.fillStyle = "#342925";
  ctx.fillRect(width - 3, height - 1, 2, 1);
  ctx.restore();
}

function drawBrokenCarts(brokenCarts) {
  for (let index = 0; index < brokenCarts.length; index += 1) {
    const cart = brokenCarts[index];
    const cartSprite = VILLAGE_PROP_SPRITES.carts[index % VILLAGE_PROP_SPRITES.carts.length];
    const crateSprite = VILLAGE_PROP_SPRITES.crates[index % VILLAGE_PROP_SPRITES.crates.length];

    if (drawSpriteRect(
      environmentSprites.villageProps?.fantasyVehicles,
      cartSprite,
      cart.x - 17,
      cart.y - 17,
      34,
      34,
      {
        alpha: 0.92,
        filter: "brightness(0.76) saturate(0.72) contrast(1.08)",
      }
    )) {
      ctx.fillStyle = "rgba(8, 9, 10, 0.28)";
      ctx.fillRect(cart.x - 17, cart.y + 9, 34, 5);
      drawSpriteRect(
        environmentSprites.villageProps?.boxesCrates,
        crateSprite,
        cart.x + 8,
        cart.y - 3,
        16,
        16,
        {
          alpha: 0.82,
          filter: "brightness(0.72) saturate(0.72)",
        }
      );
      continue;
    }

    const left = Math.round(cart.x - cart.width / 2);
    const top = cart.y - 8;

    ctx.fillStyle = "rgba(8, 9, 10, 0.28)";
    ctx.fillRect(left - 5, cart.y + 7, cart.width + 11, 5);

    ctx.fillStyle = "#241c1a";
    ctx.fillRect(left - 1, top - 1, cart.width + 2, 14);
    ctx.fillStyle = "#674b3d";
    ctx.fillRect(left, top, cart.width, 12);

    for (let plank = 0; plank < 3; plank += 1) {
      ctx.fillStyle = plank % 2 === 0 ? "#80604c" : "#563d34";
      ctx.fillRect(left + 3 + plank * 8, top + 2, 6, 8);
      ctx.fillStyle = "#9b775e";
      ctx.fillRect(left + 4 + plank * 8, top + 2, 4, 1);
    }

    ctx.fillStyle = "#352b2c";
    if (cart.brokenSide !== "left") {
      ctx.fillRect(left - 4, cart.y + 3, 7, 7);
      ctx.fillStyle = "#171313";
      ctx.fillRect(left - 2, cart.y + 5, 3, 3);
    }
    if (cart.brokenSide !== "right") {
      ctx.fillStyle = "#352b2c";
      ctx.fillRect(left + cart.width - 2, cart.y + 3, 7, 7);
      ctx.fillStyle = "#171313";
      ctx.fillRect(left + cart.width, cart.y + 5, 3, 3);
    }

    ctx.fillStyle = "#2b2425";
    ctx.fillRect(cart.x - 2, cart.y + 2, 12, 2);
    ctx.fillRect(left - 9, cart.y - 3, 9, 2);
    drawPixelStone(left + cart.width + 5, cart.y + 8, 4, cart.width);
  }
}

function drawDeadTrees(deadTrees) {
  for (let index = 0; index < deadTrees.length; index += 1) {
    const tree = deadTrees[index];
    ctx.fillStyle = "#292325";
    ctx.fillRect(tree.x - 3, tree.y - tree.height, 6, tree.height);
    drawBarkOverlay(tree.x - 3, tree.y - tree.height, 6, tree.height, 0.42);

    ctx.fillRect(tree.x - tree.spread + 2, tree.y - tree.height + 10, tree.spread, 3);
    ctx.fillRect(tree.x + 2, tree.y - tree.height + 16, tree.spread - 2, 3);
    ctx.fillRect(tree.x - tree.spread + 6, tree.y - tree.height + 20, 3, 12);
    ctx.fillRect(tree.x + tree.spread - 6, tree.y - tree.height + 6, 3, 14);

    ctx.fillStyle = "#3b3438";
    ctx.fillRect(tree.x - 1, tree.y - tree.height + 8, 2, tree.height - 8);

    const branchSprite = ENVIRONMENT_SPRITES.deadBranches[index % ENVIRONMENT_SPRITES.deadBranches.length];
    drawSheetSprite(
      environmentSprites.deadBranches,
      branchSprite,
      tree.x - 1,
      tree.y - tree.height + 28,
      0.46 + (index % 2) * 0.05,
      {
        alpha: 0.72,
        rotation: index % 2 === 0 ? -0.1 : 0.08,
      }
    );
  }
}

function drawDryGrassPatches(patches) {
  if (!patches?.length) {
    return;
  }

  for (const patch of patches) {
    const sprite = ENVIRONMENT_SPRITES.dryGrass[patch.variant % ENVIRONMENT_SPRITES.dryGrass.length];
    drawSheetSprite(environmentSprites.dryGrass, sprite, patch.x, patch.y, patch.scale ?? 1, {
      alpha: patch.alpha ?? 0.84,
      rotation: patch.rotation ?? 0,
    });
  }
}

function drawBranchDebris(branchDebris) {
  if (!branchDebris?.length) {
    return;
  }

  for (const branch of branchDebris) {
    const sprite = ENVIRONMENT_SPRITES.deadBranches[branch.variant % ENVIRONMENT_SPRITES.deadBranches.length];
    drawSheetSprite(environmentSprites.deadBranches, sprite, branch.x, branch.y, branch.scale ?? 1, {
      alpha: branch.alpha ?? 0.68,
      rotation: branch.rotation ?? 0,
    });
  }
}

function drawRubble(rubble) {
  for (const piece of rubble) {
    drawPixelStone(piece.x, piece.y, piece.size + 1, piece.tone);
  }

  for (let x = 40; x < WORLD.width; x += 54) {
    const y = 418 + ((x * 3) % 98);
    ctx.fillStyle = "#3e4b40";
    ctx.fillRect(x, y, 2, 7);
    ctx.fillStyle = "#596a52";
    ctx.fillRect(x - 2, y + 4, 2, 3);
    ctx.fillRect(x + 2, y + 2, 2, 4);
  }
}

function drawVillageExitGate() {
  const gateX = WORLD.width - 72;
  const gateY = 266;

  if (drawSpriteRect(
    environmentSprites.villageProps?.fencesWallsGate,
    VILLAGE_PROP_SPRITES.gate,
    gateX - 12,
    gateY - 4,
    70,
    40,
    {
      alpha: 0.92,
      filter: "brightness(0.72) saturate(0.7) contrast(1.08)",
    }
  )) {
    ctx.fillStyle = "rgba(7, 9, 11, 0.32)";
    ctx.fillRect(gateX - 8, gateY + 36, 74, 8);

    ctx.fillStyle = "#1d1817";
    ctx.fillRect(gateX + 47, gateY + 20, 20, 11);
    ctx.fillStyle = "#8a7b69";
    ctx.fillRect(gateX + 48, gateY + 20, 17, 8);
    ctx.fillStyle = "#c1aa86";
    ctx.fillRect(gateX + 57, gateY + 18, 7, 12);
    ctx.fillRect(gateX + 64, gateY + 22, 6, 5);
    ctx.fillStyle = "#5e4d3e";
    ctx.fillRect(gateX + 50, gateY + 24, 8, 2);
    return;
  }

  ctx.fillStyle = "rgba(7, 9, 11, 0.32)";
  ctx.fillRect(gateX - 8, gateY + 58, 74, 8);

  drawGatePillar(gateX, gateY, 12, 62, 0);
  drawGatePillar(gateX + 32, gateY + 8, 12, 54, 1);
  drawFencePlank(gateX - 5, gateY + 2, 54, 8);
  drawFencePlank(gateX + 7, gateY + 22, 38, 5, -0.08);

  ctx.fillStyle = "#1d1817";
  ctx.fillRect(gateX + 47, gateY + 20, 20, 11);
  ctx.fillStyle = "#8a7b69";
  ctx.fillRect(gateX + 48, gateY + 20, 17, 8);
  ctx.fillStyle = "#c1aa86";
  ctx.fillRect(gateX + 57, gateY + 18, 7, 12);
  ctx.fillRect(gateX + 64, gateY + 22, 6, 5);
  ctx.fillStyle = "#5e4d3e";
  ctx.fillRect(gateX + 50, gateY + 24, 8, 2);
}

function drawGatePillar(x, y, width, height, tone = 0) {
  ctx.fillStyle = "#17191d";
  ctx.fillRect(x - 2, y - 2, width + 4, height + 4);

  for (let blockY = y; blockY < y + height; blockY += 10) {
    ctx.fillStyle = tone % 2 === 0 ? "#3e454b" : "#373f45";
    ctx.fillRect(x, blockY, width, 9);
    ctx.fillStyle = "#5b6268";
    ctx.fillRect(x + 2, blockY + 1, width - 4, 1);
    ctx.fillStyle = "#252b31";
    ctx.fillRect(x, blockY + 8, width, 1);
  }
}

function drawArchiveWorld(decorations) {
  drawArchiveBackdrop(decorations);
  drawArchiveShelves(decorations);
  drawArchiveRug(decorations.rug);
  drawArchiveEntry(decorations.entry);
  drawArchiveFireplace(decorations.fireplace);
  drawArchiveDoor(decorations.northDoor);
  drawArchiveBookStacks(decorations.bookStacks);
  drawArchiveCandles(decorations.candles);
}

function drawArchiveBackdrop(decorations) {
  const { room, beams } = decorations;

  ctx.fillStyle = "#140f0d";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.fillStyle = "#3a281f";
  ctx.fillRect(room.x, room.y, room.width, room.height);

  for (let y = room.y; y < room.y + room.height; y += 22) {
    ctx.fillStyle = y % 44 === 0 ? "#482f24" : "#57392b";
    ctx.fillRect(room.x, y, room.width, 20);
  }

  ctx.fillStyle = "#241812";
  ctx.fillRect(room.x, room.y, room.width, 94);

  ctx.fillStyle = "#1b1310";
  ctx.fillRect(room.x, room.y + room.height - 26, room.width, 26);

  drawArchiveFloor(room, beams);

  for (const x of beams) {
    ctx.fillStyle = "#2b1d17";
    ctx.fillRect(x, room.y, 12, room.height);
    ctx.fillStyle = "#4d3327";
    ctx.fillRect(x + 3, room.y, 3, room.height);
  }
}

function drawArchiveShelves(decorations) {
  for (const shelf of decorations.shelves) {
    ctx.fillStyle = "#2c1d17";
    ctx.fillRect(shelf.x, shelf.y, shelf.width, shelf.height);

    for (let y = shelf.y + 20; y < shelf.y + shelf.height - 10; y += 54) {
      ctx.fillStyle = "#503728";
      ctx.fillRect(shelf.x + 6, y, shelf.width - 12, 4);
    }

    for (let row = 0; row < 4; row += 1) {
      const rowY = shelf.y + 10 + row * 54;

      for (let i = 0; i < 7; i += 1) {
        const x = shelf.x + 8 + i * 8;
        const bookHeight = 14 + ((row + i) % 3) * 4;
        const palette = ["#8f6846", "#b9955e", "#59718d", "#8b4d3e", "#6e8550"];

        ctx.fillStyle = palette[(row + i) % palette.length];
        ctx.fillRect(x, rowY + 16 - bookHeight, 6, bookHeight);

        ctx.fillStyle = "#d8c38a";
        ctx.fillRect(x + 1, rowY + 18 - bookHeight, 1, bookHeight - 4);
      }
    }
  }
}

function drawArchiveRug(rug) {
  ctx.fillStyle = "#3f1820";
  ctx.fillRect(rug.x, rug.y, rug.width, rug.height);
  ctx.fillStyle = "#6e2b33";
  ctx.fillRect(rug.x + 10, rug.y + 10, rug.width - 20, rug.height - 20);
  ctx.fillStyle = "#d0a85d";
  ctx.fillRect(rug.x + 28, rug.y + 18, rug.width - 56, 6);
  ctx.fillRect(rug.x + 28, rug.y + rug.height - 24, rug.width - 56, 6);
  ctx.fillRect(rug.x + 20, rug.y + 26, 6, rug.height - 52);
  ctx.fillRect(rug.x + rug.width - 26, rug.y + 26, 6, rug.height - 52);
}

function drawArchiveEntry(entry) {
  ctx.fillStyle = "#201510";
  ctx.fillRect(entry.x, entry.y, entry.width, entry.height);

  if (!drawPixelTextureFill(
    environmentSprites.archiveParquet,
    entry.x + 6,
    entry.y + 8,
    entry.width - 12,
    entry.height - 16,
    {
      sampleSize: 24,
      tileDrawSize: 24,
      alpha: 0.84,
    }
  )) {
    ctx.fillStyle = "#35241b";
    ctx.fillRect(entry.x + 6, entry.y + 8, entry.width - 12, entry.height - 16);
  } else {
    ctx.fillStyle = "rgba(44, 28, 19, 0.22)";
    ctx.fillRect(entry.x + 6, entry.y + 8, entry.width - 12, entry.height - 16);
  }

  ctx.fillStyle = "#704d34";
  ctx.fillRect(entry.x + entry.width - 6, entry.y + 28, 10, 6);
}

function drawArchiveFireplace(fireplace) {
  ctx.fillStyle = "#2d1f17";
  ctx.fillRect(fireplace.x, fireplace.y, fireplace.width, fireplace.height);
  ctx.fillStyle = "#4a3427";
  ctx.fillRect(fireplace.x + 8, fireplace.y + 8, fireplace.width - 16, fireplace.height - 16);
  ctx.fillStyle = "#1b120d";
  ctx.fillRect(fireplace.x + 18, fireplace.y + 20, fireplace.width - 36, fireplace.height - 28);

  ctx.fillStyle = "#7f5f42";
  ctx.fillRect(fireplace.x - 8, fireplace.y - 8, fireplace.width + 16, 10);

  ctx.fillStyle = "#cf7d2c";
  ctx.fillRect(fireplace.x + 28, fireplace.y + 46, 12, 16);
  ctx.fillRect(fireplace.x + 48, fireplace.y + 42, 10, 20);
  ctx.fillRect(fireplace.x + 60, fireplace.y + 48, 8, 14);

  ctx.fillStyle = "#ffd379";
  ctx.fillRect(fireplace.x + 34, fireplace.y + 40, 6, 10);
  ctx.fillRect(fireplace.x + 52, fireplace.y + 38, 4, 12);

  ctx.fillStyle = "rgba(255, 177, 84, 0.18)";
  ctx.fillRect(fireplace.x - 12, fireplace.y + 10, fireplace.width + 28, fireplace.height + 26);
}

function drawArchiveDoor(northDoor) {
  ctx.fillStyle = "#241913";
  ctx.fillRect(northDoor.x, northDoor.y, northDoor.width, northDoor.height);
  ctx.fillStyle = "#503627";
  ctx.fillRect(northDoor.x + 8, northDoor.y + 8, northDoor.width - 16, northDoor.height - 10);
  ctx.fillStyle = "#7d5c40";
  ctx.fillRect(northDoor.x + 16, northDoor.y + 14, northDoor.width - 32, 6);
  ctx.fillRect(northDoor.x + 16, northDoor.y + northDoor.height - 18, northDoor.width - 32, 6);
  ctx.fillStyle = "#d0a85d";
  ctx.fillRect(northDoor.x + northDoor.width - 18, northDoor.y + 30, 6, 6);
}

function drawArchiveBookStacks(bookStacks) {
  for (const stack of bookStacks) {
    ctx.fillStyle = "#3a261d";
    ctx.fillRect(stack.x, stack.y, stack.width, stack.height);
    ctx.fillStyle = "#8a5e46";
    ctx.fillRect(stack.x, stack.y + 2, stack.width, 4);
    ctx.fillStyle = "#5d7592";
    ctx.fillRect(stack.x + 2, stack.y + 8, stack.width - 4, 4);
    ctx.fillStyle = "#c4a36d";
    ctx.fillRect(stack.x + 1, stack.y + 12, stack.width - 2, 3);
  }
}

function drawArchiveCandles(candles) {
  for (const candle of candles) {
    const flicker = Math.sin(state.lastTimestamp * 0.006 + candle.x * 0.02) * 1.4;
    const flameHeight = 6 + Math.abs(flicker);
    const flameX = candle.x + 2;
    const flameY = candle.y - 8 - flicker;

    drawWorldWarmGlow(flameX, flameY, 18 + Math.abs(flicker) * 2, 0.42);

    const eternalCandleSheet = effectSprites.eternalCandleSheet;
    const eternalCandle = effectSprites.eternalCandle;

    if (canDrawSprite(eternalCandleSheet)) {
      const frameWidth = eternalCandleSheet.naturalHeight;
      const frameHeight = eternalCandleSheet.naturalHeight;
      const frameCount = Math.max(1, Math.floor(eternalCandleSheet.naturalWidth / frameWidth));
      const frameIndex = Math.floor((state.lastTimestamp + candle.x * 11) / 86) % frameCount;

      ctx.drawImage(
        eternalCandleSheet,
        frameIndex * frameWidth,
        0,
        frameWidth,
        frameHeight,
        candle.x - 12,
        candle.y + candle.height - 32,
        28,
        32
      );
    } else if (canDrawSprite(eternalCandle)) {
      ctx.drawImage(eternalCandle, candle.x - 11, candle.y + candle.height - 30, 26, 30);
    } else {
      ctx.fillStyle = "#ead8a8";
      ctx.fillRect(candle.x, candle.y, 4, candle.height);

      ctx.fillStyle = "#8a5e3d";
      ctx.fillRect(candle.x + 1, candle.y - 2, 2, 2);

      ctx.fillStyle = "#ffe08a";
      ctx.fillRect(candle.x + 1, candle.y - 4 - flicker, 2, flameHeight);

      ctx.fillStyle = "#ff9d2f";
      ctx.fillRect(candle.x + 1, candle.y - 5 - flicker, 2, 2);
    }

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(255, 188, 96, 0.75)";
    ctx.fillRect(flameX - 2, flameY - 4, 1, 1);
    ctx.fillRect(flameX + 4, flameY - 6, 1, 1);
    ctx.fillRect(flameX + 2, flameY - 8, 1, 1);
    ctx.restore();
  }
}

function drawWorldWarmGlow(x, y, radius, alpha) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(255, 230, 143, ${alpha})`);
  gradient.addColorStop(0.38, `rgba(255, 130, 35, ${alpha * 0.54})`);
  gradient.addColorStop(1, "rgba(255, 68, 0, 0)");

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}

function drawWorldAura(worldX, worldY, radius, innerColor, middleColor, outerColor, alpha = 1) {
  const x = worldX - camera.x;
  const y = worldY - camera.y;

  if (x < -radius || x > VIEWPORT.width + radius || y < -radius || y > VIEWPORT.height + radius) {
    return;
  }

  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, innerColor);
  gradient.addColorStop(0.52, middleColor);
  gradient.addColorStop(1, outerColor);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}

function drawCrossroadsWorld(decorations) {
  drawCrossroadsBackdrop(decorations);
  drawCrossroadsGlowPath(decorations.glowingPath, decorations.finalArch);
  drawCrossroadsLeftHalf(decorations);
  drawCrossroadsRightHalf(decorations);
}

function drawCrossroadsBackdrop(decorations) {
  const { splitX } = decorations;

  ctx.fillStyle = "#8595a2";
  ctx.fillRect(0, 0, splitX, 124);
  ctx.fillStyle = "#6c7882";
  ctx.fillRect(0, 124, splitX, 92);

  ctx.fillStyle = "#8cc2df";
  ctx.fillRect(splitX, 0, WORLD.width - splitX, 132);
  ctx.fillStyle = "#b7ddf1";
  ctx.fillRect(splitX, 132, WORLD.width - splitX, 84);

  if (drawTerrainFill(TILECRAFT_TERRAIN.stone, 0, 216, splitX, WORLD.height - 216, { seed: 6 })) {
    drawTerrainFill(TILECRAFT_TERRAIN.dirt, 0, 436, splitX, WORLD.height - 436, {
      seed: 8,
      alpha: 0.5,
    });
    drawTerrainFill(TILECRAFT_TERRAIN.grass, splitX, 216, WORLD.width - splitX, WORLD.height - 216, {
      seed: 3,
    });

    ctx.fillStyle = "rgba(54, 50, 45, 0.18)";
    ctx.fillRect(0, 216, splitX, WORLD.height - 216);
    ctx.fillStyle = "rgba(32, 29, 27, 0.22)";
    ctx.fillRect(0, 436, splitX, WORLD.height - 436);
    ctx.fillStyle = "rgba(61, 112, 48, 0.14)";
    ctx.fillRect(splitX, 216, WORLD.width - splitX, WORLD.height - 216);
    ctx.fillStyle = "rgba(45, 82, 32, 0.22)";
    ctx.fillRect(splitX, 470, WORLD.width - splitX, WORLD.height - 470);

    drawTerrainFill(TILECRAFT_TERRAIN.dirt, splitX - 28, 540, 56, 100, { seed: 1 });
    drawTerrainFill(TILECRAFT_TERRAIN.dirt, splitX - 12, 420, 24, 120, { seed: 2 });
  } else {
    ctx.fillStyle = "#8e968c";
    ctx.fillRect(0, 216, splitX, WORLD.height - 216);
    ctx.fillStyle = "#444039";
    ctx.fillRect(0, 436, splitX, WORLD.height - 436);

    ctx.fillStyle = "#7ea060";
    ctx.fillRect(splitX, 216, WORLD.width - splitX, WORLD.height - 216);
    ctx.fillStyle = "#5d8440";
    ctx.fillRect(splitX, 470, WORLD.width - splitX, WORLD.height - 470);

    ctx.fillStyle = "#b49a6d";
    ctx.fillRect(splitX - 28, 540, 56, 100);
    ctx.fillRect(splitX - 12, 420, 24, 120);
  }
}

function drawCrossroadsGlowPath(glowingPath, finalArch) {
  const glowSprite = effectSprites.glow;

  if (canDrawSprite(glowSprite)) {
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.globalCompositeOperation = "screen";
    ctx.drawImage(glowSprite, glowingPath.x - 132, glowingPath.y + 18, glowingPath.width + 264, glowingPath.height + 96);
    ctx.restore();
  }

  ctx.fillStyle = "#ffe391";
  ctx.fillRect(glowingPath.x, glowingPath.y + 34, glowingPath.width, glowingPath.height - 34);
  ctx.fillStyle = "#fff5c5";
  ctx.fillRect(glowingPath.x + 12, glowingPath.y + 48, glowingPath.width - 24, glowingPath.height - 68);
  ctx.fillStyle = "#ffd85a";
  ctx.fillRect(glowingPath.x + 26, glowingPath.y + 68, glowingPath.width - 52, glowingPath.height - 112);

  ctx.fillStyle = "rgba(255, 231, 136, 0.22)";
  ctx.fillRect(glowingPath.x - 18, glowingPath.y + 20, glowingPath.width + 36, glowingPath.height + 6);

  ctx.fillStyle = "#d3c4a0";
  ctx.fillRect(finalArch.x, finalArch.y, finalArch.width, finalArch.height);
  ctx.fillStyle = "#fff0b7";
  ctx.fillRect(finalArch.x + 10, finalArch.y + 10, finalArch.width - 20, finalArch.height - 10);
  ctx.fillStyle = "#cbb270";
  ctx.fillRect(finalArch.x + 24, finalArch.y + 22, finalArch.width - 48, 10);
}

function drawCrossroadsLeftHalf(decorations) {
  const { barrenTree, brokenBridge, cracks, rocks, dryGrass } = decorations;

  if (!canDrawSprite(environmentSprites.tilecraftGround)) {
    ctx.fillStyle = "#73766f";
    ctx.fillRect(0, 250, 452, 170);
    ctx.fillStyle = "#68635d";
    ctx.fillRect(0, 420, 452, 144);
  } else {
    ctx.fillStyle = "rgba(44, 42, 39, 0.18)";
    ctx.fillRect(0, 250, 452, 314);
  }

  drawDryGrassPatches(dryGrass);

  ctx.fillStyle = "#2e2b29";
  ctx.fillRect(brokenBridge.x - 60, brokenBridge.y + 30, brokenBridge.width + 40, 48);
  ctx.fillRect(brokenBridge.x + 48, brokenBridge.y + 20, brokenBridge.gap, 84);

  for (const crack of cracks) {
    ctx.fillStyle = "#3a3633";
    ctx.fillRect(crack.x, crack.y, crack.width, 8);
    ctx.fillRect(crack.x + 18, crack.y - crack.branch, 10, crack.branch + 8);
    ctx.fillRect(crack.x + 62, crack.y + 8, 8, crack.branch);
  }

  for (const rock of rocks) {
    ctx.fillStyle = "#5e5a55";
    ctx.fillRect(rock.x, rock.y, rock.size, rock.size - 2);
    ctx.fillStyle = "#403d39";
    ctx.fillRect(rock.x + 2, rock.y + rock.size - 1, rock.size - 4, 2);
  }

  ctx.fillStyle = "#2a2523";
  ctx.fillRect(barrenTree.x - 4, barrenTree.y - barrenTree.height, 8, barrenTree.height);
  drawBarkOverlay(barrenTree.x - 4, barrenTree.y - barrenTree.height, 8, barrenTree.height, 0.38);
  ctx.fillRect(barrenTree.x - barrenTree.spread, barrenTree.y - barrenTree.height + 14, barrenTree.spread, 4);
  ctx.fillRect(barrenTree.x + 4, barrenTree.y - barrenTree.height + 8, barrenTree.spread - 6, 4);
  ctx.fillRect(barrenTree.x - 18, barrenTree.y - barrenTree.height + 28, 4, 20);
  ctx.fillRect(barrenTree.x + 18, barrenTree.y - barrenTree.height + 18, 4, 16);

  drawSheetSprite(
    environmentSprites.deadBranches,
    ENVIRONMENT_SPRITES.deadBranches[2],
    barrenTree.x - 2,
    barrenTree.y - barrenTree.height + 34,
    0.52,
    {
      alpha: 0.7,
      rotation: -0.16,
    }
  );
}

function drawCrossroadsRightHalf(decorations) {
  const { square, villageHouses, flags } = decorations;

  if (drawTerrainFill(TILECRAFT_TERRAIN.grass, square.x, square.y, square.width, square.height, { seed: 9 })) {
    ctx.fillStyle = "rgba(114, 176, 83, 0.12)";
    ctx.fillRect(square.x, square.y, square.width, square.height);
    ctx.fillStyle = "rgba(146, 199, 103, 0.18)";
    ctx.fillRect(square.x + 10, square.y + 10, square.width - 20, square.height - 20);
  } else {
    ctx.fillStyle = "#7aa45d";
    ctx.fillRect(square.x, square.y, square.width, square.height);
    ctx.fillStyle = "#86b368";
    ctx.fillRect(square.x + 10, square.y + 10, square.width - 20, square.height - 20);
  }

  for (let x = square.x + 20; x < square.x + square.width - 20; x += 28) {
    ctx.fillStyle = "#94ba73";
    ctx.fillRect(x, square.y + 30, 12, square.height - 60);
  }

  if (drawTerrainFill(TILECRAFT_TERRAIN.dirt, square.x + 40, square.y + 156, square.width - 80, 60, { seed: 4 })) {
    ctx.fillStyle = "rgba(195, 160, 107, 0.18)";
    ctx.fillRect(square.x + 40, square.y + 156, square.width - 80, 60);
    ctx.fillStyle = "rgba(225, 199, 148, 0.2)";
    ctx.fillRect(square.x + 56, square.y + 172, square.width - 112, 24);
  } else {
    ctx.fillStyle = "#c6b08d";
    ctx.fillRect(square.x + 40, square.y + 156, square.width - 80, 60);
    ctx.fillStyle = "#d9c39a";
    ctx.fillRect(square.x + 56, square.y + 172, square.width - 112, 24);
  }

  for (const house of villageHouses) {
    ctx.fillStyle = "#c9b286";
    ctx.fillRect(house.x, house.y, house.width, house.height);
    ctx.fillStyle = "#8b3b35";
    ctx.fillRect(house.x - 4, house.y - 10, house.width + 8, 12);
    ctx.fillStyle = "#715a44";
    ctx.fillRect(house.x + 12, house.y + 22, 12, 20);
    ctx.fillRect(house.x + house.width - 24, house.y + 18, 10, 14);
  }

  for (const flag of flags) {
    ctx.fillStyle = "#7a5c38";
    ctx.fillRect(flag.x, flag.y, 4, flag.height);
    ctx.fillStyle = "#cf3a36";
    ctx.fillRect(flag.x + 4, flag.y + 6, flag.width, 14);
    ctx.fillStyle = "#f7d566";
    ctx.fillRect(flag.x + 10, flag.y + 10, 4, 4);
  }
}

function drawSpringWorld(decorations) {
  drawSpringSky(decorations.clouds);
  drawSpringGround();
  drawSpringPond(decorations.pond);
  drawSpringPath(decorations.path, decorations.plaza);
  drawSpringCropPlots(decorations.cropPlots);
  drawSpringFlowers(decorations.flowers);
  drawSpringBlossomTrees(decorations.blossomTrees);
}

function drawSpringSky(clouds) {
  ctx.fillStyle = "#95d6f1";
  ctx.fillRect(0, 0, WORLD.width, 98);
  ctx.fillStyle = "#c4ecfb";
  ctx.fillRect(0, 98, WORLD.width, 88);

  ctx.fillStyle = "#ffe68b";
  ctx.fillRect(782, 28, 28, 28);

  for (const cloud of clouds) {
    ctx.fillStyle = "#f8fcff";
    ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
    ctx.fillRect(cloud.x + 10, cloud.y - 6, cloud.width - 26, 10);
    ctx.fillRect(cloud.x + 20, cloud.y + cloud.height - 4, cloud.width - 40, 8);
  }
}

function drawSpringGround() {
  if (drawPixelCrawlerTerrainFill(PIXEL_CRAWLER_TERRAIN.grass, 0, 186, WORLD.width, WORLD.height - 186, {
    seed: 87,
    scale: 1.5,
    alpha: 0.54,
  })) {
    ctx.fillStyle = "rgba(101, 168, 74, 0.24)";
    ctx.fillRect(0, 186, WORLD.width, WORLD.height - 186);
    return;
  }

  if (drawTerrainFill(TILECRAFT_TERRAIN.grass, 0, 186, WORLD.width, WORLD.height - 186, { seed: 7 })) {
    ctx.fillStyle = "rgba(111, 180, 71, 0.14)";
    ctx.fillRect(0, 186, WORLD.width, WORLD.height - 186);
    return;
  }

  ctx.fillStyle = "#7fc35a";
  ctx.fillRect(0, 186, WORLD.width, WORLD.height - 186);

  for (let x = 0; x < WORLD.width; x += 24) {
    ctx.fillStyle = x % 48 === 0 ? "#8acc61" : "#73b94f";
    ctx.fillRect(x, 186, 24, WORLD.height - 186);
  }
}

function drawSpringPond(pond) {
  if (!drawTerrainFill(TILECRAFT_TERRAIN.water, pond.x, pond.y, pond.width, pond.height, { seed: 5 })) {
    ctx.fillStyle = "#71c8e8";
    ctx.fillRect(pond.x, pond.y, pond.width, pond.height);
  }

  ctx.fillStyle = "rgba(58, 144, 186, 0.18)";
  ctx.fillRect(pond.x, pond.y, pond.width, pond.height);
  ctx.fillStyle = "#bceefd";
  ctx.fillRect(pond.x + 12, pond.y + 12, pond.width - 28, 10);
  ctx.fillStyle = "#5fb2d5";
  ctx.fillRect(pond.x + 18, pond.y + 34, pond.width - 42, 8);
}

function drawSpringPath(path, plaza) {
  if (drawPixelCrawlerTerrainFill(PIXEL_CRAWLER_TERRAIN.dirt, path.x, path.y, path.width, path.height, {
    seed: 91,
    scale: 1.5,
    alpha: 0.52,
  })) {
    ctx.fillStyle = "rgba(207, 185, 129, 0.16)";
    ctx.fillRect(path.x, path.y, path.width, path.height);
    ctx.fillStyle = "rgba(177, 149, 100, 0.18)";
    ctx.fillRect(path.x + 12, path.y, path.width - 24, path.height);

    drawPixelCrawlerTerrainFill(PIXEL_CRAWLER_TERRAIN.stone, plaza.x, plaza.y, plaza.width, plaza.height, {
      seed: 92,
      scale: 1.5,
      alpha: 0.46,
    });
    ctx.fillStyle = "rgba(219, 209, 178, 0.18)";
    ctx.fillRect(plaza.x, plaza.y, plaza.width, plaza.height);
    ctx.fillStyle = "rgba(196, 179, 134, 0.16)";
    ctx.fillRect(plaza.x + 10, plaza.y + 10, plaza.width - 20, plaza.height - 20);
    return;
  }

  if (drawTerrainFill(TILECRAFT_TERRAIN.dirt, path.x, path.y, path.width, path.height, { seed: 10 })) {
    ctx.fillStyle = "rgba(207, 185, 129, 0.16)";
    ctx.fillRect(path.x, path.y, path.width, path.height);
    drawTerrainFill(TILECRAFT_TERRAIN.stone, plaza.x, plaza.y, plaza.width, plaza.height, { seed: 11 });
    return;
  }

  ctx.fillStyle = "#d7c59b";
  ctx.fillRect(path.x, path.y, path.width, path.height);
  ctx.fillStyle = "#c4b186";
  ctx.fillRect(path.x + 12, path.y, path.width - 24, path.height);

  ctx.fillStyle = "#ddd1b2";
  ctx.fillRect(plaza.x, plaza.y, plaza.width, plaza.height);
  ctx.fillStyle = "#cdbd9a";
  ctx.fillRect(plaza.x + 10, plaza.y + 10, plaza.width - 20, plaza.height - 20);
}

function drawSpringCropPlots(cropPlots) {
  for (const plot of cropPlots) {
    ctx.fillStyle = plot.soil;
    ctx.fillRect(plot.x, plot.y, plot.width, plot.height);
    drawPixelCrawlerTerrainFill(PIXEL_CRAWLER_TERRAIN.dirt, plot.x, plot.y, plot.width, plot.height, {
      seed: Math.round(plot.x + plot.y * 2),
      scale: 1.5,
      alpha: 0.24,
    });

    for (let row = 0; row < 4; row += 1) {
      const y = plot.y + 8 + row * 14;
      ctx.fillStyle = "#6c4a2f";
      ctx.fillRect(plot.x + 6, y, plot.width - 12, 2);

      for (let col = 0; col < 6; col += 1) {
        const x = plot.x + 10 + col * 20;
        ctx.fillStyle = plot.crop;
        ctx.fillRect(x, y - 5, 4, 7);
        ctx.fillRect(x - 2, y - 1, 2, 3);
        ctx.fillRect(x + 4, y - 2, 2, 4);
      }
    }
  }
}

function drawSpringFlowers(flowers) {
  for (const flower of flowers) {
    const palette =
      flower.tone === 0
        ? ["#f7d9ed", "#f09dc0"]
        : flower.tone === 1
          ? ["#fff1b3", "#ffd65f"]
          : ["#d5f1ff", "#94d3f5"];

    ctx.fillStyle = "#63a84a";
    ctx.fillRect(flower.x, flower.y + 2, 2, 4);
    ctx.fillStyle = palette[0];
    ctx.fillRect(flower.x - 1, flower.y, 2, 2);
    ctx.fillRect(flower.x + 1, flower.y, 2, 2);
    ctx.fillStyle = palette[1];
    ctx.fillRect(flower.x, flower.y - 1, 2, 2);
  }
}

function drawSpringBlossomTrees(blossomTrees) {
  for (let index = 0; index < blossomTrees.length; index += 1) {
    const tree = blossomTrees[index];
    const scale = Math.max(0.9, tree.height / 42);

    if (drawKenneyMicroTree({ ...tree, variant: index, scale, filter: "brightness(1.04) saturate(0.96)" })) {
      ctx.save();
      ctx.fillStyle = tree.bloom;
      const canopyY = tree.y - Math.round(36 * scale);
      const petalSize = Math.max(2, Math.round(3 * scale));
      const petalOffsets = [
        [-17, 4],
        [-6, -5],
        [9, 1],
        [18, 9],
        [-2, 11],
      ];

      for (const [offsetX, offsetY] of petalOffsets) {
        ctx.fillRect(
          Math.round(tree.x + offsetX * scale),
          Math.round(canopyY + offsetY * scale),
          petalSize + (offsetX % 2 === 0 ? 1 : 0),
          petalSize
        );
      }

      ctx.restore();
      continue;
    }

    drawFallbackBlossomTree(tree);
  }
}

function drawFallbackBlossomTree(tree) {
  ctx.fillStyle = "#6b4a2f";
  ctx.fillRect(tree.x - 4, tree.y - tree.height, 8, tree.height);
  ctx.fillRect(tree.x - 12, tree.y - tree.height + 20, 6, 12);
  ctx.fillRect(tree.x + 6, tree.y - tree.height + 14, 6, 16);

  ctx.fillStyle = tree.leaf;
  ctx.fillRect(tree.x - 22, tree.y - tree.height - 2, 44, 28);
  ctx.fillRect(tree.x - 28, tree.y - tree.height + 8, 56, 18);

  ctx.fillStyle = tree.bloom;
  ctx.fillRect(tree.x - 18, tree.y - tree.height + 2, 8, 6);
  ctx.fillRect(tree.x - 2, tree.y - tree.height - 4, 8, 6);
  ctx.fillRect(tree.x + 12, tree.y - tree.height + 4, 8, 6);
}

function drawInteractables() {
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  for (const item of currentLevel().interactables) {
    if (!shouldDrawInteractable(item)) {
      continue;
    }

    if (item.kind === "npc") {
      drawNpc(item);
    } else {
      drawObject(item);
    }

    if (item.id === state.activeInteractionId && state.mode === "playing") {
      drawInteractionMarker(item);
    }
  }

  for (const monster of currentLevel().monsters ?? []) {
    if (monster.defeated) {
      continue;
    }

    drawMonster(monster);
  }

  ctx.restore();
}

function shouldDrawInteractable(item) {
  if (item.interactionType === "rewardCompass") {
    return state.quests.zone1Delivered.size === 3 && !state.quests.zone1RewardClaimed;
  }

  if (item.interactionType === "rewardEmblem") {
    return state.quests.zone2Fragments.size === 3 && !state.quests.zone2RewardClaimed;
  }

  return !item.collected;
}

function drawNpc(npc) {
  ctx.fillStyle = "rgba(11, 13, 16, 0.35)";
  ctx.fillRect(npc.x - 7, npc.y + 8, 14, 4);

  if (drawNpcSpriteActor(npc)) {
    return;
  }

  ctx.fillStyle = "#35292b";
  ctx.fillRect(npc.x - 6, npc.y - 10, 12, 4);

  ctx.fillStyle = "#d5b59a";
  ctx.fillRect(npc.x - 4, npc.y - 8, 8, 6);

  ctx.fillStyle = "#6a635d";
  ctx.fillRect(npc.x - 6, npc.y - 2, 12, 8);

  ctx.fillStyle = "#4a4b50";
  ctx.fillRect(npc.x - 7, npc.y + 1, 4, 7);
  ctx.fillRect(npc.x + 3, npc.y + 3, 3, 6);

  ctx.fillStyle = "#2a2527";
  ctx.fillRect(npc.x - 4, npc.y + 6, 4, 7);
  ctx.fillRect(npc.x + 1, npc.y + 8, 4, 5);
}

function drawObject(item) {
  if (item.variant === "final-history-gate") {
    drawFinalHistoryGate(item);
    return;
  }

  if (item.variant === "paper-bundle") {
    drawPaperBundle(item);
    return;
  }

  if (item.variant === "unity-table") {
    drawUnityTable(item);
    return;
  }

  if (item.variant === "strategic-hamlet") {
    drawStrategicHamlet(item);
    return;
  }

  if (item.variant === "bureaucracy-wall") {
    drawBureaucracyWall(item);
    return;
  }

  if (item.variant === "ration-market") {
    drawRationMarket(item);
    return;
  }

  if (item.variant === "story-relic") {
    drawStoryRelic(item);
    return;
  }

  if (item.variant === "memory-seal") {
    drawMemorySeal(item);
    return;
  }

  if (item.variant === "corrupt-obelisk") {
    drawCorruptObelisk(item);
    return;
  }

  if (item.variant === "ending-altar") {
    drawEndingAltar(item);
    return;
  }

  if (item.variant === "desk") {
    drawRuinedDesk(item);
    return;
  }

  if (item.variant === "fragment-table") {
    drawFragmentTable(item);
    return;
  }

  if (item.variant === "compass-pedestal") {
    drawCompassPedestal(item);
    return;
  }

  if (item.variant === "crowd-gathering") {
    drawCrowdGathering(item);
    return;
  }

  if (item.variant === "broken-bridge") {
    drawBrokenBridge(item);
    return;
  }

  if (item.variant === "grand-tree") {
    drawGrandTree(item);
  }
}

function drawFinalHistoryGate(item) {
  const ready = REQUIRED_RELIC_IDS.every((itemId) => state.inventory.has(itemId)) && state.saDoa < SA_DOA_BAD_ENDING;
  const finalGate = environmentSprites.generatedObjects?.finalHistoryGate;
  const onlineDoor = environmentSprites.openGameArt?.historyDoor;

  if (canDrawSprite(finalGate)) {
    const drawHeight = 126;
    const drawWidth = Math.round(drawHeight * (finalGate.naturalWidth / finalGate.naturalHeight));

    drawWorldWarmGlow(item.x, item.y + 6, ready ? 66 : 54, ready ? 0.28 : 0.12);

    ctx.save();
    ctx.fillStyle = ready ? "rgba(255, 213, 110, 0.18)" : "rgba(88, 124, 168, 0.14)";
    ctx.fillRect(item.x - 46, item.y + 22, 92, 10);
    ctx.fillStyle = "rgba(10, 14, 20, 0.28)";
    ctx.fillRect(item.x - 58, item.y + 30, 116, 8);
    ctx.restore();

    drawLooseSprite(finalGate, item.x, item.y + 48, drawWidth, drawHeight, {
      filter: ready
        ? "brightness(1.06) saturate(1.04)"
        : "brightness(0.9) saturate(0.82) contrast(1.02)",
    });
    return;
  }

  if (canDrawSprite(onlineDoor)) {
    const doorHeight = 72;
    const doorWidth = Math.round(doorHeight * (onlineDoor.naturalWidth / onlineDoor.naturalHeight));
    const doorX = Math.round(item.x - doorWidth / 2);
    const doorY = Math.round(item.y - 32);

    drawWorldWarmGlow(item.x, item.y - 18, ready ? 46 : 38, ready ? 0.18 : 0.11);

    ctx.save();
    ctx.fillStyle = ready ? "rgba(255, 229, 142, 0.18)" : "rgba(116, 146, 184, 0.12)";
    ctx.fillRect(item.x - 30, item.y - 34, 60, 64);
    ctx.fillStyle = "#131b2a";
    ctx.fillRect(item.x - 25, item.y - 36, 50, 70);
    ctx.restore();

    ctx.save();
    ctx.filter = ready ? "brightness(1.18) saturate(1.02)" : "brightness(1.04) saturate(0.88)";
    ctx.drawImage(onlineDoor, doorX, doorY, doorWidth, doorHeight);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#7f6545";
    ctx.fillRect(item.x - 24, item.y + 26, 48, 6);
    ctx.fillStyle = "rgba(17, 20, 26, 0.22)";
    ctx.fillRect(item.x - 28, item.y + 32, 56, 4);
    ctx.restore();
    return;
  }

  ctx.fillStyle = ready ? "rgba(255, 229, 142, 0.28)" : "rgba(158, 186, 220, 0.18)";
  ctx.fillRect(item.x - 52, item.y - 72, 104, 120);
  ctx.fillStyle = "#2f3d54";
  ctx.fillRect(item.x - 34, item.y - 66, 68, 112);
  ctx.fillStyle = "#d6c39f";
  ctx.fillRect(item.x - 26, item.y - 58, 52, 96);
  ctx.fillStyle = ready ? "#ffe89b" : "#95abc8";
  ctx.fillRect(item.x - 10, item.y - 44, 20, 46);
  ctx.fillStyle = "#7f6545";
  ctx.fillRect(item.x - 40, item.y + 42, 80, 10);
}

function drawPaperBundle(item) {
  const paperBundle = environmentSprites.generatedObjects?.paperBundle;

  if (canDrawSprite(paperBundle)) {
    drawLooseSprite(paperBundle, item.x, item.y + 14, 38, 38, {
      filter: "brightness(1.02) saturate(0.92)",
    });
    return;
  }

  ctx.fillStyle = "#6a4834";
  ctx.fillRect(item.x - 8, item.y + 2, 16, 8);
  ctx.fillStyle = "#efe5c8";
  ctx.fillRect(item.x - 7, item.y - 6, 14, 10);
  ctx.fillRect(item.x - 4, item.y - 10, 12, 6);
  ctx.fillStyle = "#c23e37";
  ctx.fillRect(item.x - 1, item.y - 11, 2, 14);
}

function drawUnityTable(item) {
  const unityTable = environmentSprites.generatedObjects?.unityTable;
  const unified = state.quests.zone2Fragments.size === 3;

  if (canDrawSprite(unityTable)) {
    if (unified) {
      drawWorldWarmGlow(item.x, item.y + 6, 34, 0.12);
    }

    drawLooseSprite(unityTable, item.x, item.y + 18, 84, 84, {
      filter: unified
        ? "brightness(1.06) saturate(0.98)"
        : "brightness(0.94) saturate(0.82)",
    });
    return;
  }

  ctx.fillStyle = "#6b4a34";
  ctx.fillRect(item.x - 22, item.y - 6, 44, 12);
  ctx.fillStyle = "#8b6648";
  ctx.fillRect(item.x - 16, item.y - 12, 32, 8);
  ctx.fillStyle = unified ? "#ffd971" : "#9fb7c4";
  ctx.fillRect(item.x - 6, item.y - 16, 12, 6);
}

function drawStrategicHamlet(item) {
  const cleared = state.quests.zone3HamletsFreed.has(item.hamletId);
  const hamletSprite = environmentSprites.generatedObjects?.strategicHamlet;

  if (canDrawSprite(hamletSprite)) {
    drawLooseSprite(hamletSprite, item.x, item.y + 18, 82, 82, {
      alpha: cleared ? 0.82 : 1,
      filter: cleared
        ? "brightness(1.02) saturate(0.74) sepia(0.1)"
        : "brightness(0.94) saturate(0.88)",
    });

    if (cleared) {
      drawWorldWarmGlow(item.x, item.y + 8, 24, 0.08);
    }
    return;
  }

  ctx.fillStyle = cleared ? "#789f54" : "#6b5a4a";
  ctx.fillRect(item.x - 18, item.y - 10, 36, 20);
  ctx.fillStyle = cleared ? "#cfe7a0" : "#c2aa7a";
  ctx.fillRect(item.x - 12, item.y - 16, 24, 8);
  ctx.fillStyle = cleared ? "#4d7a37" : "#352920";
  ctx.fillRect(item.x - 20, item.y + 8, 40, 4);
}

function drawBureaucracyWall(item) {
  const broken = state.quests.zone4Barriers.has(item.barrierId);
  const wallSprite = environmentSprites.generatedObjects?.bureaucracyWall;

  if (canDrawSprite(wallSprite)) {
    drawLooseSprite(wallSprite, item.x, item.y + 12, 94, 63, {
      alpha: broken ? 0.62 : 1,
      filter: broken
        ? "brightness(1.04) saturate(0.62) sepia(0.12)"
        : "brightness(0.96) saturate(0.9)",
    });
    return;
  }

  ctx.fillStyle = broken ? "#8bc56a" : "#7d6757";
  ctx.fillRect(item.x - 16, item.y - 8, 32, 16);
  ctx.fillStyle = broken ? "#d7f1a8" : "#d2c1a2";
  ctx.fillRect(item.x - 10, item.y - 14, 20, 8);
  ctx.fillStyle = broken ? "#5d8c45" : "#4a3b31";
  ctx.fillRect(item.x - 18, item.y + 8, 36, 4);
}

function drawRationMarket(item) {
  const rationSprite = environmentSprites.generatedObjects?.rationMarket;

  if (canDrawSprite(rationSprite)) {
    drawLooseSprite(rationSprite, item.x, item.y + 20, 86, 86, {
      filter: "brightness(0.96) saturate(0.88)",
    });
    return;
  }

  ctx.fillStyle = "#6d4a36";
  ctx.fillRect(item.x - 18, item.y - 10, 36, 20);
  ctx.fillStyle = "#b88e62";
  ctx.fillRect(item.x - 20, item.y - 16, 40, 8);
  ctx.fillStyle = "#efe3be";
  ctx.fillRect(item.x - 10, item.y - 4, 20, 6);
}

function drawStoryRelic(item) {
  const glow = 0.42 + Math.sin(state.lastTimestamp * 0.008) * 0.14;
  const relicSprite = environmentSprites.generatedObjects?.storyRelic;

  if (canDrawSprite(relicSprite)) {
    drawWorldWarmGlow(item.x, item.y - 4, 24, glow * 0.2);
    drawLooseSprite(relicSprite, item.x, item.y + 16, 42, 42, {
      filter: `brightness(${1.02 + glow * 0.08}) saturate(1.02)`,
    });
    return;
  }

  ctx.fillStyle = `rgba(255, 218, 121, ${glow})`;
  ctx.fillRect(item.x - 10, item.y - 14, 20, 20);
  ctx.fillStyle = "#704631";
  ctx.fillRect(item.x - 6, item.y + 4, 12, 5);
  ctx.fillStyle = "#f0d17b";
  ctx.fillRect(item.x - 4, item.y - 10, 8, 12);
  ctx.fillStyle = "#fff5cf";
  ctx.fillRect(item.x - 2, item.y - 12, 4, 4);
  ctx.fillStyle = "#d44b3b";
  ctx.fillRect(item.x - 1, item.y - 6, 2, 6);
}

function drawMemorySeal(item) {
  const active = item.activated;
  const coreColor = active ? "#fff1a9" : "#9bb6cc";
  const glowColor = active ? "rgba(255, 230, 136, 0.26)" : "rgba(137, 199, 240, 0.14)";
  const sealSprite = environmentSprites.generatedObjects?.memorySeal;

  if (canDrawSprite(sealSprite)) {
    drawWorldWarmGlow(item.x, item.y + 2, active ? 28 : 20, active ? 0.16 : 0.08);
    drawLooseSprite(sealSprite, item.x, item.y + 18, 42, 42, {
      filter: active
        ? "brightness(1.08) saturate(1.02)"
        : "brightness(0.94) saturate(0.9)",
      alpha: active ? 1 : 0.92,
    });
    return;
  }

  ctx.fillStyle = glowColor;
  ctx.fillRect(item.x - 12, item.y - 18, 24, 30);
  ctx.fillStyle = "#5f4a37";
  ctx.fillRect(item.x - 8, item.y - 2, 16, 18);
  ctx.fillStyle = "#86634b";
  ctx.fillRect(item.x - 10, item.y - 8, 20, 8);
  ctx.fillStyle = coreColor;
  ctx.fillRect(item.x - 4, item.y - 12, 8, 8);
}

function drawCorruptObelisk(item) {
  const purified = item.purified;
  const used = item.used;
  const obeliskSprite = environmentSprites.generatedObjects?.corruptObelisk;

  if (canDrawSprite(obeliskSprite)) {
    if (purified) {
      drawWorldWarmGlow(item.x, item.y + 2, 26, 0.1);
    } else if (!used) {
      drawWorldWarmGlow(item.x, item.y + 4, 24, 0.12);
    }

    drawLooseSprite(obeliskSprite, item.x, item.y + 20, 58, 58, {
      alpha: used ? 0.76 : 1,
      filter: purified
        ? "hue-rotate(88deg) brightness(1.06) saturate(0.78)"
        : used
          ? "brightness(0.82) saturate(0.74)"
          : "brightness(0.98) saturate(1.02)",
    });
    return;
  }

  const glowColor = purified
    ? "rgba(164, 226, 174, 0.22)"
    : used
      ? "rgba(194, 67, 52, 0.16)"
      : "rgba(194, 67, 52, 0.24)";

  ctx.fillStyle = glowColor;
  ctx.fillRect(item.x - 14, item.y - 20, 28, 34);
  ctx.fillStyle = purified ? "#4d7c57" : "#322735";
  ctx.fillRect(item.x - 8, item.y - 14, 16, 26);
  ctx.fillStyle = purified ? "#9edaa7" : "#d04639";
  ctx.fillRect(item.x - 1, item.y - 10, 2, 18);
  ctx.fillStyle = purified ? "#c9f0d1" : "#6b2320";
  ctx.fillRect(item.x - 4, item.y - 16, 8, 4);
}

function drawEndingAltar(item) {
  const ready = REQUIRED_RELIC_IDS.every((itemId) => state.inventory.has(itemId));

  ctx.fillStyle = ready ? "rgba(255, 239, 168, 0.28)" : "rgba(231, 225, 197, 0.18)";
  ctx.fillRect(item.x - 22, item.y - 10, 44, 18);
  ctx.fillStyle = "#8a7252";
  ctx.fillRect(item.x - 18, item.y - 4, 36, 12);
  ctx.fillStyle = "#ddd0b4";
  ctx.fillRect(item.x - 12, item.y - 8, 24, 8);
  ctx.fillStyle = ready ? "#f8e281" : "#9db3c0";
  ctx.fillRect(item.x - 6, item.y - 14, 12, 6);
}

function drawMonster(monster) {
  const hitFlash = state.lastTimestamp < monster.hitFlashUntil;
  const spriteConfig = MONSTER_SPRITE_CONFIG[monster.variant];
  const shadowWidth = spriteConfig?.shadowWidth ?? 20;
  const isAttacking = state.lastTimestamp < (monster.attackEndsAt ?? 0);

  ctx.fillStyle = "rgba(12, 14, 18, 0.28)";
  ctx.fillRect(monster.x - shadowWidth / 2, monster.y + 10, shadowWidth, 4);

  if (!drawMonsterSprite(monster, hitFlash)) {
    const palette = getMonsterPalette(monster.variant, hitFlash);
    const attackProgress = isAttacking ? getTimedProgress(monster.attackStartedAt, monster.attackEndsAt) : 0;
    const attackOffset = getAttackLungeOffset(monster.attackDirection, attackProgress, ATTACK_LUNGE_DISTANCE * 0.8);
    const monsterX = monster.x + attackOffset.x;
    const monsterY = monster.y + attackOffset.y;

    ctx.fillStyle = palette.body;
    ctx.fillRect(monsterX - 8, monsterY - 10, 16, 18);
    ctx.fillStyle = palette.detail;
    ctx.fillRect(monsterX - 6, monsterY - 14, 12, 6);
    ctx.fillStyle = palette.eye;
    ctx.fillRect(monsterX - 4, monsterY - 8, 2, 2);
    ctx.fillRect(monsterX + 2, monsterY - 8, 2, 2);
    ctx.fillStyle = palette.crest;
    ctx.fillRect(monsterX - 10, monsterY - 6, 4, 8);
    ctx.fillRect(monsterX + 6, monsterY - 4, 4, 8);
  }

  if (isAttacking) {
    const progress = getTimedProgress(monster.attackStartedAt, monster.attackEndsAt);
    drawAttackSlash(monster.x, monster.y, monster.attackDirection, progress, {
      scale: 0.72,
      color: "rgba(255, 121, 91, 0.9)",
      highlightColor: "rgba(255, 225, 188, 0.78)",
      shadowColor: "rgba(76, 15, 18, 0.6)",
    });
  }

  drawMonsterHealthBar(monster);
}

function drawMonsterSprite(monster, hitFlash) {
  const config = MONSTER_SPRITE_CONFIG[monster.variant];
  const spriteSet = monsterSprites[monster.variant];
  const isAttacking = state.lastTimestamp < (monster.attackEndsAt ?? 0);
  const animationKey = monster.animationState === "run" || isAttacking ? "run" : "idle";
  const animation = config?.animations?.[animationKey] ?? config?.animations?.idle;
  const sprite = spriteSet?.[animationKey] ?? spriteSet?.idle;

  if (!config || !animation || !canDrawSprite(sprite)) {
    return false;
  }

  const frameIndex =
    Math.floor((state.lastTimestamp + (monster.phase ?? 0) * 1000) / animation.frameDuration) % animation.frameCount;
  const attackProgress = isAttacking ? getTimedProgress(monster.attackStartedAt, monster.attackEndsAt) : 0;
  const attackOffset = getAttackLungeOffset(monster.attackDirection, attackProgress, ATTACK_LUNGE_DISTANCE);
  const drawX = Math.round(monster.x + config.drawOffsetX + attackOffset.x);
  const drawY = Math.round(monster.y + config.drawOffsetY + attackOffset.y);

  ctx.drawImage(
    sprite,
    frameIndex * animation.frameWidth,
    0,
    animation.frameWidth,
    animation.frameHeight,
    drawX,
    drawY,
    config.drawWidth,
    config.drawHeight
  );

  if (hitFlash) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(255, 236, 212, 0.26)";
    ctx.fillRect(drawX + 3, drawY + 3, config.drawWidth - 6, config.drawHeight - 8);
    ctx.restore();
  }

  return true;
}

function getMonsterPalette(variant, hitFlash) {
  if (hitFlash) {
    return {
      body: "#f0d2a2",
      detail: "#fff2d6",
      eye: "#7d1e19",
      crest: "#f07d54",
    };
  }

  if (variant === "devourer") {
    return {
      body: "#4b4035",
      detail: "#786a52",
      eye: "#f1cb6d",
      crest: "#8b342f",
    };
  }

  if (variant === "blight") {
    return {
      body: "#31462d",
      detail: "#628a49",
      eye: "#f6d98e",
      crest: "#d95c48",
    };
  }

  return {
    body: "#302b3d",
    detail: "#5a5474",
    eye: "#ffdd8c",
    crest: "#c24338",
  };
}

function drawMonsterHealthBar(monster) {
  const width = 18;
  const ratio = monster.health / monster.maxHealth;

  ctx.fillStyle = "rgba(18, 20, 23, 0.84)";
  ctx.fillRect(monster.x - 9, monster.y - 18, width, 4);
  ctx.fillStyle = "#95cf5f";
  ctx.fillRect(monster.x - 8, monster.y - 17, Math.max(0, Math.round((width - 2) * ratio)), 2);
}

function drawRuinedDesk(item) {
  ctx.fillStyle = "rgba(11, 13, 16, 0.32)";
  ctx.fillRect(item.x - 10, item.y + 7, 22, 4);

  ctx.fillStyle = "#6b4d40";
  ctx.fillRect(item.x - 10, item.y - 5, 20, 8);
  ctx.fillRect(item.x - 8, item.y + 3, 3, 8);
  ctx.fillRect(item.x + 5, item.y + 1, 3, 10);

  ctx.fillStyle = "#8d755c";
  ctx.fillRect(item.x - 8, item.y - 7, 8, 2);
  ctx.fillRect(item.x + 2, item.y - 7, 5, 2);

  ctx.fillStyle = "#d8cfad";
  ctx.fillRect(item.x - 5, item.y - 8, 5, 3);
  ctx.fillRect(item.x + 2, item.y - 8, 3, 2);

  ctx.fillStyle = "#2f2422";
  ctx.fillRect(item.x + 8, item.y + 6, 5, 2);
}

function drawFragmentTable(item) {
  const fragmentTable = environmentSprites.generatedObjects?.fragmentTable;

  if (canDrawSprite(fragmentTable)) {
    drawWorldWarmGlow(item.x, item.y + 4, 28, 0.12);
    drawLooseSprite(fragmentTable, item.x, item.y + 18, 80, 80, {
      filter: "brightness(1.02) saturate(0.98)",
    });
    return;
  }

  ctx.fillStyle = "rgba(20, 11, 7, 0.24)";
  ctx.fillRect(item.x - 26, item.y + 10, 54, 5);

  ctx.fillStyle = "#6d4e36";
  ctx.fillRect(item.x - 26, item.y - 5, 52, 10);
  ctx.fillRect(item.x - 22, item.y + 5, 4, 12);
  ctx.fillRect(item.x + 18, item.y + 5, 4, 12);

  ctx.fillStyle = "#8a6647";
  ctx.fillRect(item.x - 20, item.y - 8, 40, 3);

  const fragments = [
    { x: item.x - 12, y: item.y - 10, color: "#7fe9ff" },
    { x: item.x - 1, y: item.y - 13, color: "#fff0a5" },
    { x: item.x + 12, y: item.y - 9, color: "#a7f5ff" },
  ];

  for (const fragment of fragments) {
    ctx.fillStyle = fragment.color;
    ctx.fillRect(fragment.x, fragment.y, 4, 4);
    ctx.fillRect(fragment.x + 1, fragment.y - 2, 2, 2);
    ctx.fillStyle = "rgba(135, 236, 255, 0.28)";
    ctx.fillRect(fragment.x - 2, fragment.y - 2, 8, 8);

    if (canDrawSprite(effectSprites.sparkle)) {
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(state.lastTimestamp * 0.005 + fragment.x) * 0.18;
      ctx.globalCompositeOperation = "screen";
      ctx.drawImage(effectSprites.sparkle, fragment.x - 6, fragment.y - 8, 16, 16);
      ctx.restore();
    }
  }
}

function drawCompassPedestal(item) {
  const compassPedestal = environmentSprites.generatedObjects?.compassPedestal;

  if (canDrawSprite(compassPedestal)) {
    drawWorldWarmGlow(item.x, item.y + 2, 28, 0.16);
    drawLooseSprite(compassPedestal, item.x, item.y + 22, 66, 66, {
      filter: "brightness(1.04) saturate(0.98)",
    });
    return;
  }

  ctx.fillStyle = "rgba(20, 11, 7, 0.22)";
  ctx.fillRect(item.x - 14, item.y + 11, 28, 5);

  ctx.fillStyle = "#6a4b34";
  ctx.fillRect(item.x - 7, item.y - 2, 14, 18);
  ctx.fillStyle = "#8d6848";
  ctx.fillRect(item.x - 10, item.y - 6, 20, 6);

  ctx.fillStyle = "#efd483";
  ctx.fillRect(item.x - 6, item.y - 14, 12, 12);
  ctx.fillStyle = "#8e6a36";
  ctx.fillRect(item.x - 4, item.y - 12, 8, 8);
  ctx.fillStyle = "#f4ecd3";
  ctx.fillRect(item.x - 1, item.y - 11, 2, 6);
  ctx.fillStyle = "#d44736";
  ctx.fillRect(item.x - 1, item.y - 12, 2, 3);

  ctx.fillStyle = "rgba(255, 212, 110, 0.22)";
  ctx.fillRect(item.x - 14, item.y - 18, 28, 24);
}

function drawCrowdGathering(item) {
  const crowdOffsets = currentLevel().decorations.crowdOffsets;

  ctx.fillStyle = "rgba(24, 33, 19, 0.22)";
  ctx.fillRect(item.x - 40, item.y + 14, 82, 6);

  ctx.fillStyle = "#7a342f";
  ctx.fillRect(item.x - 34, item.y - 28, 36, 8);
  ctx.fillRect(item.x - 32, item.y - 20, 2, 28);
  ctx.fillStyle = "#f5d76e";
  ctx.fillRect(item.x - 22, item.y - 24, 4, 4);

  for (const member of crowdOffsets) {
    const x = item.x + member.x;
    const y = item.y + member.y;

    ctx.fillStyle = "rgba(11, 13, 16, 0.28)";
    ctx.fillRect(x - 5, y + 7, 10, 3);

    const didDrawSprite = drawNpcSpriteActor({
      x,
      y,
      spriteKey: member.spriteKey,
      direction: member.direction,
      animation: member.animation,
      frameOffset: member.frameOffset,
      scale: member.scale,
    });

    if (!didDrawSprite) {
      ctx.fillStyle = "#ddb99a";
      ctx.fillRect(x - 2, y - 9, 4, 4);
      ctx.fillStyle = member.shirt;
      ctx.fillRect(x - 3, y - 5, 6, 6);
      ctx.fillStyle = member.pants;
      ctx.fillRect(x - 3, y + 1, 2, 5);
      ctx.fillRect(x + 1, y + 1, 2, 5);
    }
  }
}

function drawBrokenBridge(item) {
  ctx.fillStyle = "rgba(18, 16, 14, 0.24)";
  ctx.fillRect(item.x - 40, item.y + 20, 82, 6);

  ctx.fillStyle = "#5c493c";
  ctx.fillRect(item.x - 42, item.y - 4, 34, 10);
  ctx.fillRect(item.x + 12, item.y - 6, 30, 10);
  ctx.fillStyle = "#3d322c";
  ctx.fillRect(item.x - 4, item.y - 2, 16, 18);
  ctx.fillRect(item.x - 38, item.y + 6, 4, 10);
  ctx.fillRect(item.x + 32, item.y + 4, 4, 12);

  ctx.fillStyle = "#efe7d1";
  ctx.fillRect(item.x + 26, item.y - 26, 16, 12);
  ctx.fillStyle = "#d14437";
  ctx.fillRect(item.x + 28, item.y - 24, 12, 4);
  ctx.fillRect(item.x + 32, item.y - 20, 4, 8);
  ctx.fillStyle = "#473728";
  ctx.fillRect(item.x + 32, item.y - 12, 3, 18);
}

function drawGrandTree(item) {
  ctx.fillStyle = "rgba(24, 41, 17, 0.2)";
  ctx.fillRect(item.x - 38, item.y + 22, 76, 8);

  ctx.fillStyle = "#7e6d53";
  ctx.fillRect(item.x - 28, item.y + 10, 56, 12);
  ctx.fillStyle = "#c8baa2";
  ctx.fillRect(item.x - 20, item.y + 12, 40, 8);

  ctx.fillStyle = "#725033";
  ctx.fillRect(item.x - 8, item.y - 10, 16, 38);
  ctx.fillRect(item.x - 18, item.y + 8, 6, 14);
  ctx.fillRect(item.x + 12, item.y + 2, 6, 18);

  ctx.fillStyle = "#6bb14b";
  ctx.fillRect(item.x - 34, item.y - 56, 68, 34);
  ctx.fillRect(item.x - 42, item.y - 40, 84, 28);
  ctx.fillRect(item.x - 28, item.y - 74, 56, 24);

  ctx.fillStyle = "#8acb65";
  ctx.fillRect(item.x - 22, item.y - 62, 16, 8);
  ctx.fillRect(item.x + 10, item.y - 50, 12, 8);
  ctx.fillRect(item.x - 4, item.y - 72, 10, 8);

  ctx.fillStyle = "#f6c1d7";
  ctx.fillRect(item.x - 26, item.y - 54, 6, 4);
  ctx.fillRect(item.x - 6, item.y - 64, 6, 4);
  ctx.fillRect(item.x + 16, item.y - 46, 6, 4);
  ctx.fillRect(item.x + 6, item.y - 30, 6, 4);
}

function drawInteractionMarker(item) {
  const bob = Math.sin(state.lastTimestamp / 160) * 2;
  const markerX = Math.round(item.x);
  const markerY = Math.round(item.y - item.height - 10 + bob);

  let markerColor = "#dce8ff";

  if (state.currentLevelId === "archive") {
    markerColor = "#ffdca1";
  } else if (state.currentLevelId === "crossroads") {
    markerColor = "#fff29a";
  } else if (state.currentLevelId === "spring") {
    markerColor = "#ffd8f2";
  }

  ctx.fillStyle = markerColor;
  ctx.fillRect(markerX - 1, markerY, 2, 6);
  ctx.fillRect(markerX - 2, markerY + 8, 4, 4);
}

function getPlayerAttackProgress() {
  if (state.activeSkillEffect?.type !== "strike") {
    return 0;
  }

  return getTimedProgress(state.activeSkillEffect.startedAt, state.activeSkillEffect.endsAt);
}

function drawPlayer() {
  ctx.save();
  ctx.translate(Math.round(player.x - camera.x), Math.round(player.y - camera.y));

  ctx.fillStyle = "rgba(10, 12, 16, 0.32)";
  ctx.fillRect(-7, 9, 14, 4);

  const attackProgress = getPlayerAttackProgress();

  if (attackProgress > 0) {
    const attackOffset = getAttackLungeOffset(player.direction, attackProgress);
    const squash = Math.sin(attackProgress * Math.PI);
    ctx.translate(Math.round(attackOffset.x), Math.round(attackOffset.y));
    ctx.scale(1 + squash * 0.04, 1 - squash * 0.03);
  }

  const sheet = getPlayerSpriteSheet();

  if (sheet.complete && sheet.naturalWidth > 0) {
    const frameIndex = getPlayerFrameIndex();
    const sourceX = frameIndex * PLAYER_SPRITE.frameWidth + PLAYER_SPRITE.cropX;

    ctx.drawImage(
      sheet,
      sourceX,
      PLAYER_SPRITE.cropY,
      PLAYER_SPRITE.cropWidth,
      PLAYER_SPRITE.cropHeight,
      PLAYER_SPRITE.drawOffsetX,
      PLAYER_SPRITE.drawOffsetY,
      PLAYER_SPRITE.drawWidth,
      PLAYER_SPRITE.drawHeight
    );
    ctx.restore();
    return;
  }

  const walkFrame = player.isMoving ? Math.floor(player.walkTime % 2) : 0;
  const legOffset = player.isMoving ? (walkFrame === 0 ? -1 : 1) : 0;
  const armOffset = player.isMoving ? (walkFrame === 0 ? 1 : -1) : 0;

  ctx.fillStyle = "#443338";
  ctx.fillRect(-6, -11, 12, 4);

  ctx.fillStyle = "#e4c1a3";
  ctx.fillRect(-4, -9, 8, 6);

  if (player.direction === "up") {
    ctx.fillStyle = "#61748d";
    ctx.fillRect(-6, -2, 12, 8);
    ctx.fillStyle = "#2d3140";
    ctx.fillRect(-5, 6, 4, 7);
    ctx.fillRect(1, 6, 4, 7);
  } else if (player.direction === "left") {
    ctx.fillStyle = "#e4c1a3";
    ctx.fillRect(-5, -8, 2, 2);
    ctx.fillStyle = "#61748d";
    ctx.fillRect(-6, -2, 12, 8);
    ctx.fillStyle = "#9b876f";
    ctx.fillRect(-7, 0, 2, 6);
    ctx.fillRect(5, 0, 2, 6);
    ctx.fillStyle = "#2d3140";
    ctx.fillRect(-5, 6, 4, 7);
    ctx.fillRect(1, 6, 4, 7);
  } else if (player.direction === "right") {
    ctx.fillStyle = "#e4c1a3";
    ctx.fillRect(3, -8, 2, 2);
    ctx.fillStyle = "#61748d";
    ctx.fillRect(-6, -2, 12, 8);
    ctx.fillStyle = "#9b876f";
    ctx.fillRect(-7, 0, 2, 6);
    ctx.fillRect(5, 0, 2, 6);
    ctx.fillStyle = "#2d3140";
    ctx.fillRect(-5, 6, 4, 7);
    ctx.fillRect(1, 6, 4, 7);
  } else {
    ctx.fillStyle = "#61748d";
    ctx.fillRect(-6, -2, 12, 8);
    ctx.fillStyle = "#9b876f";
    ctx.fillRect(-7, armOffset, 2, 6);
    ctx.fillRect(5, -armOffset, 2, 6);
    ctx.fillStyle = "#2d3140";
    ctx.fillRect(-5, 6 + legOffset, 4, 7);
    ctx.fillRect(1, 6 - legOffset, 4, 7);
  }

  ctx.fillStyle = "#201f2a";
  ctx.fillRect(-5, 13, 4, 2);
  ctx.fillRect(1, 13, 4, 2);

  ctx.restore();
}

function drawAttackSlash(x, y, direction, progress, options = {}) {
  const unit = getDirectionUnit(direction);
  const scale = options.scale ?? 1;
  const alpha = (options.alpha ?? 1) * Math.sin(progress * Math.PI);
  const originX = x + unit.x * (18 * scale);
  const originY = y - 4 + unit.y * (18 * scale);
  const angle = direction === "left"
    ? Math.PI
    : direction === "up"
      ? -Math.PI / 2
      : direction === "down"
        ? Math.PI / 2
        : 0;

  if (alpha <= 0.01) {
    return;
  }

  ctx.save();
  ctx.translate(originX, originY);
  ctx.rotate(angle);

  if (options.spriteStyle === "sword" && drawSwordSlashSprite(progress, scale, alpha)) {
    ctx.restore();
    return;
  }

  ctx.scale(0.78 + progress * 0.34, 0.78 + progress * 0.2);
  ctx.globalAlpha = alpha;
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";

  ctx.strokeStyle = options.shadowColor ?? "rgba(48, 24, 16, 0.55)";
  ctx.lineWidth = Math.max(2, Math.round(5 * scale));
  ctx.beginPath();
  ctx.moveTo(-8 * scale, -12 * scale);
  ctx.quadraticCurveTo(18 * scale, -8 * scale, 28 * scale, 0);
  ctx.quadraticCurveTo(18 * scale, 8 * scale, -8 * scale, 12 * scale);
  ctx.stroke();

  ctx.strokeStyle = options.color ?? "rgba(255, 241, 178, 0.95)";
  ctx.lineWidth = Math.max(1, Math.round(3 * scale));
  ctx.beginPath();
  ctx.moveTo(-7 * scale, -10 * scale);
  ctx.quadraticCurveTo(16 * scale, -6 * scale, 24 * scale, 0);
  ctx.quadraticCurveTo(16 * scale, 6 * scale, -7 * scale, 10 * scale);
  ctx.stroke();

  ctx.strokeStyle = options.highlightColor ?? "rgba(255, 255, 236, 0.85)";
  ctx.lineWidth = Math.max(1, Math.round(1 * scale));
  ctx.beginPath();
  ctx.moveTo(0, -6 * scale);
  ctx.quadraticCurveTo(13 * scale, -3 * scale, 20 * scale, 0);
  ctx.stroke();
  ctx.restore();
}

function drawSwordSlashSprite(progress, scale, alpha) {
  const slashSheet = effectSprites.swordSlashSheet;

  if (!canDrawSprite(slashSheet)) {
    return false;
  }

  const frameIndex = Math.min(
    SWORD_SLASH_SPRITE.frames.length - 1,
    Math.floor(progress * SWORD_SLASH_SPRITE.frames.length)
  );
  const frame = SWORD_SLASH_SPRITE.frames[frameIndex];
  const pulse = 0.92 + Math.sin(progress * Math.PI) * 0.12;
  const drawScale = scale * pulse * (frame.scale ?? 1);
  const drawWidth = Math.max(1, Math.round(frame.width * drawScale));
  const drawHeight = Math.max(1, Math.round(frame.height * drawScale));
  const drawX = Math.round(-(frame.anchorX ?? 0) * drawScale);
  const drawY = Math.round(-(frame.anchorY ?? 0) * drawScale);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = "screen";
  ctx.filter = "brightness(1.08) contrast(1.04)";
  ctx.drawImage(
    slashSheet,
    frame.x,
    frame.y,
    frame.width,
    frame.height,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
  ctx.restore();

  return true;
}

function drawSkillEffect() {
  if (!state.activeSkillEffect) {
    return;
  }

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  if (state.activeSkillEffect.type === "strike") {
    const { x, y, direction } = state.activeSkillEffect;
    const progress = getTimedProgress(state.activeSkillEffect.startedAt, state.activeSkillEffect.endsAt);
    drawAttackSlash(x, y, direction, progress, { scale: 0.84, spriteStyle: "sword" });
  } else {
    const radius = 22 + Math.sin(state.lastTimestamp * 0.04) * 4;
    ctx.beginPath();
    ctx.arc(state.activeSkillEffect.x, state.activeSkillEffect.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(200, 244, 190, 0.22)";
    ctx.fill();
    ctx.strokeStyle = "rgba(245, 255, 221, 0.75)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.restore();
}

function drawAtmosphere() {
  const decorations = currentLevel().decorations ?? {};

  if (state.currentLevelId === "hub") {
    drawHubAtmosphere(decorations);
    return;
  }

  if (state.currentLevelId === "village") {
    drawFogDrift(decorations.fogBands ?? []);
    return;
  }

  if (state.currentLevelId === "archive") {
    drawUnityHouseAtmosphere(decorations);
    return;
  }

  if (state.currentLevelId === "crossroads") {
    drawRedSquareAtmosphere(decorations);
    return;
  }

  drawDoiMoiAtmosphere(decorations);
}

function drawHubAtmosphere(decorations) {
  const gateCenterX = decorations.gate.x + decorations.gate.width / 2;
  const gateCenterY = decorations.gate.y + decorations.gate.height / 2;

  drawWorldAura(
    gateCenterX,
    gateCenterY - 12,
    144,
    "rgba(217, 236, 255, 0.22)",
    "rgba(104, 154, 214, 0.14)",
    "rgba(14, 24, 37, 0)",
    1
  );

  for (let index = 0; index < decorations.portals.length; index += 1) {
    const portal = decorations.portals[index];
    const pulse = 0.6 + (Math.sin(state.lastTimestamp * 0.004 + index) + 1) * 0.14;
    drawWorldWarmGlow(portal.x, portal.y - 8, 38, 0.1 + pulse * 0.12);
  }

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (let index = 0; index < 18; index += 1) {
    const angle = state.lastTimestamp * 0.0012 + index * 0.35;
    const radius = 48 + (index % 3) * 16;
    const x = gateCenterX + Math.cos(angle) * radius - camera.x;
    const y = gateCenterY - 8 + Math.sin(angle * 1.6) * (22 + (index % 4) * 5) - camera.y;
    ctx.fillStyle = `rgba(234, 244, 255, ${0.12 + (index % 4) * 0.04})`;
    ctx.fillRect(Math.round(x), Math.round(y), 2 + (index % 2), 2 + (index % 2));
  }

  ctx.restore();
}

function drawFogDrift(fogBands) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (let index = 0; index < fogBands.length; index += 1) {
    const fog = fogBands[index];
    const sway = Math.sin(state.lastTimestamp * 0.00045 + index * 0.9) * (10 + (index % 3) * 4);
    const drift = Math.cos(state.lastTimestamp * 0.0003 + index * 0.6) * 3;
    const x = fog.x - camera.x + sway;
    const y = fog.y - camera.y + drift;
    const width = fog.width + 24;
    const height = fog.height;

    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, "rgba(226, 238, 242, 0)");
    gradient.addColorStop(0.3, `rgba(226, 238, 242, ${fog.alpha * 0.95})`);
    gradient.addColorStop(0.7, `rgba(250, 252, 255, ${fog.alpha * 0.62})`);
    gradient.addColorStop(1, "rgba(226, 238, 242, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(Math.round(x), Math.round(y), width, height);
  }

  ctx.restore();
}

function drawUnityHouseAtmosphere(decorations) {
  const shafts = [208, 480, 748];

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (const shaftX of shafts) {
    const x = shaftX - camera.x;
    const y = decorations.house.y - camera.y;
    const height = decorations.house.height;
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, "rgba(244, 221, 159, 0.18)");
    gradient.addColorStop(0.35, "rgba(214, 170, 92, 0.08)");
    gradient.addColorStop(1, "rgba(36, 22, 14, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 24, y, 48, height);
  }

  drawWorldAura(
    480,
    322,
    112,
    "rgba(255, 227, 156, 0.18)",
    "rgba(182, 117, 64, 0.12)",
    "rgba(42, 24, 12, 0)",
    1
  );

  for (let index = 0; index < 24; index += 1) {
    const travel = state.lastTimestamp * 0.02 + index * 13;
    const x = decorations.house.x + 40 + ((index * 67) % (decorations.house.width - 80)) - camera.x;
    const y = decorations.house.y + 40 + ((travel * 0.45 + index * 17) % (decorations.house.height - 80)) - camera.y;
    ctx.fillStyle = `rgba(255, 231, 190, ${0.08 + (index % 3) * 0.04})`;
    ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
  }

  ctx.restore();
}

function drawRedSquareAtmosphere(decorations) {
  drawWorldAura(
    decorations.bridge.x + decorations.bridge.width / 2,
    decorations.bridge.y + 20,
    96,
    "rgba(242, 226, 151, 0.14)",
    "rgba(196, 121, 52, 0.1)",
    "rgba(32, 24, 18, 0)",
    1
  );

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (let index = 0; index < 18; index += 1) {
    const x = decorations.northSquare.x + 36 + ((index * 41) % (decorations.northSquare.width - 72)) - camera.x;
    const y = decorations.northSquare.y + 34 + Math.sin(state.lastTimestamp * 0.0016 + index) * 16 - camera.y;
    ctx.fillStyle = `rgba(255, 231, 161, ${0.1 + (index % 2) * 0.06})`;
    ctx.fillRect(Math.round(x), Math.round(y), 2 + (index % 2), 2 + (index % 2));
  }

  for (let index = 0; index < 16; index += 1) {
    const travel = state.lastTimestamp * 0.018 + index * 19;
    const x = decorations.southTown.x + 24 + ((index * 57) % (decorations.southTown.width - 48)) - camera.x;
    const y = decorations.southTown.y + 22 + ((travel + index * 9) % 116) - camera.y;
    ctx.fillStyle = `rgba(116, 88, 62, ${0.08 + (index % 3) * 0.03})`;
    ctx.fillRect(Math.round(x), Math.round(y), 8, 4);
  }

  const shimmerOffset = (state.lastTimestamp * 0.05) % 120;
  ctx.fillStyle = "rgba(231, 247, 255, 0.12)";
  for (let x = -120; x < VIEWPORT.width + 120; x += 120) {
    ctx.fillRect(x + shimmerOffset, decorations.river.y - camera.y + 34, 44, 2);
  }

  ctx.restore();
}

function drawDoiMoiAtmosphere(decorations) {
  drawWorldAura(
    776,
    94,
    112,
    "rgba(255, 245, 194, 0.18)",
    "rgba(255, 209, 111, 0.1)",
    "rgba(86, 144, 177, 0)",
    1
  );

  ctx.save();

  for (const factory of decorations.factories) {
    const chimneys = [
      { x: factory.x + 27, y: factory.y - 30 },
      { x: factory.x + 64, y: factory.y - 44 },
    ];

    for (let smokeIndex = 0; smokeIndex < chimneys.length; smokeIndex += 1) {
      const chimney = chimneys[smokeIndex];

      for (let puff = 0; puff < 5; puff += 1) {
        const lift = (state.lastTimestamp * 0.026 + puff * 18 + smokeIndex * 12) % 74;
        const sway = Math.sin(state.lastTimestamp * 0.0014 + puff + smokeIndex) * 8;
        const x = chimney.x + sway - camera.x;
        const y = chimney.y - lift - camera.y;
        const size = 10 + puff * 3;
        ctx.fillStyle = `rgba(239, 246, 249, ${0.12 - puff * 0.018})`;
        ctx.fillRect(Math.round(x), Math.round(y), size, Math.max(4, size - 2));
      }
    }
  }

  ctx.globalCompositeOperation = "screen";
  for (let index = 0; index < 24; index += 1) {
    const travel = state.lastTimestamp * 0.03 + index * 11;
    const x = ((index * 53 + travel) % (VIEWPORT.width + 40)) - 20;
    const y = 260 + ((index * 37 + travel * 0.35) % 260);
    ctx.fillStyle = `rgba(255, 232, 150, ${0.08 + (index % 4) * 0.03})`;
    ctx.fillRect(Math.round(x), Math.round(y), 3, 2);
  }

  ctx.restore();
}

function drawRain(rain) {
  ctx.save();

  const rainSprites = effectSprites.rainDrops;
  const rainFrame = Math.floor(state.lastTimestamp / 120) % rainSprites.length;
  const rainSprite = rainSprites[rainFrame];

  for (const drop of rain) {
    const travel = state.lastTimestamp * 0.15 * drop.speed;
    const x = (drop.x + travel * drop.drift) % (VIEWPORT.width + 34) - 17;
    const y = (drop.y + travel) % (VIEWPORT.height + 34) - 17;

    if (canDrawSprite(rainSprite)) {
      const scale = Math.min(Math.max(drop.length / 24, 1.0), 1.75);
      const alpha = drop.alpha * 1.1;
      ctx.globalAlpha = alpha;
      ctx.drawImage(
        rainSprite,
        Math.round(x - 8 * scale),
        Math.round(y - 6 * scale),
        Math.round(16 * scale),
        Math.round(32 * scale)
      );
    } else {
      ctx.strokeStyle = `rgba(202, 220, 255, ${drop.alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.round(x), Math.round(y));
      ctx.lineTo(Math.round(x - 3), Math.round(y + drop.length));
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawArchiveLighting(decorations) {
  const { fireplace, candles } = decorations;
  const flicker = Math.sin(state.lastTimestamp * 0.008) * 0.04;

  ctx.save();
  ctx.globalCompositeOperation = "multiply";

  const coolShade = ctx.createLinearGradient(0, 0, VIEWPORT.width, VIEWPORT.height);
  coolShade.addColorStop(0, "rgba(20, 18, 52, 0.72)");
  coolShade.addColorStop(0.55, "rgba(43, 21, 39, 0.56)");
  coolShade.addColorStop(1, "rgba(65, 30, 24, 0.42)");
  ctx.fillStyle = coolShade;
  ctx.fillRect(0, 0, VIEWPORT.width, VIEWPORT.height);

  ctx.globalCompositeOperation = "screen";
  drawWarmLight(fireplace.x + fireplace.width * 0.66, fireplace.y + fireplace.height * 0.56, 126, 0.58 + flicker);
  drawWarmLight(fireplace.x + fireplace.width * 0.5, fireplace.y + fireplace.height * 0.82, 82, 0.26 + flicker);

  for (const candle of candles) {
    drawWarmLight(candle.x + 2, candle.y - 8, 84, 0.52 + Math.abs(flicker));
    drawScreenFireBloom(candle.x + 2, candle.y - 8, 34, 0.16);
  }

  ctx.globalCompositeOperation = "lighter";
  drawScreenFireBloom(fireplace.x + fireplace.width * 0.58, fireplace.y + fireplace.height * 0.62, 62, 0.14);
  ctx.restore();
}

function drawWarmLight(worldX, worldY, radius, alpha) {
  const x = worldX - camera.x;
  const y = worldY - camera.y;

  if (x < -radius || x > VIEWPORT.width + radius || y < -radius || y > VIEWPORT.height + radius) {
    return;
  }

  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(255, 216, 112, ${alpha})`);
  gradient.addColorStop(0.2, `rgba(255, 134, 38, ${alpha * 0.72})`);
  gradient.addColorStop(0.58, `rgba(193, 53, 31, ${alpha * 0.26})`);
  gradient.addColorStop(1, "rgba(35, 12, 8, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function drawScreenFireBloom(worldX, worldY, radius, alpha) {
  const x = worldX - camera.x;
  const y = worldY - camera.y;

  if (x < -radius || x > VIEWPORT.width + radius || y < -radius || y > VIEWPORT.height + radius) {
    return;
  }

  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `rgba(255, 238, 162, ${alpha})`);
  gradient.addColorStop(0.42, `rgba(255, 121, 18, ${alpha * 0.6})`);
  gradient.addColorStop(1, "rgba(255, 72, 0, 0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function drawEmbers(embers) {
  ctx.save();

  for (const ember of embers) {
    const lift = (state.lastTimestamp * 0.03 * ember.rise + ember.offset * 28) % 34;
    const sway = Math.sin(state.lastTimestamp * 0.002 + ember.offset) * ember.drift;
    const x = ember.x + sway;
    const y = ember.y - lift;

    if (canDrawSprite(effectSprites.ember)) {
      const size = 8 + ember.size * 3;
      ctx.globalAlpha = Math.min(0.85, ember.alpha * 2.4);
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(effectSprites.ember, Math.round(x - size / 2), Math.round(y - size / 2), size, size);
    } else {
      ctx.fillStyle = `rgba(255, 190, 96, ${ember.alpha})`;
      ctx.fillRect(Math.round(x), Math.round(y), ember.size, ember.size);
    }
  }

  ctx.restore();
}

function drawGlowMotes(motes) {
  ctx.save();

  for (const mote of motes) {
    const lift = (state.lastTimestamp * 0.028 * mote.rise + mote.offset * 22) % 40;
    const sway = Math.sin(state.lastTimestamp * 0.0017 + mote.offset) * mote.drift;
    const x = mote.x + sway;
    const y = mote.y - lift;

    if (canDrawSprite(effectSprites.magic)) {
      const size = 9 + mote.size * 4;
      ctx.globalAlpha = Math.min(0.72, mote.alpha * 2.1);
      ctx.globalCompositeOperation = "screen";
      ctx.drawImage(effectSprites.magic, Math.round(x - size / 2), Math.round(y - size / 2), size, size);
    } else {
      ctx.fillStyle = `rgba(255, 236, 140, ${mote.alpha})`;
      ctx.fillRect(Math.round(x), Math.round(y), mote.size, mote.size);
    }
  }

  ctx.restore();
}

function drawPetals(petals) {
  ctx.save();

  for (const petal of petals) {
    const travel = state.lastTimestamp * 0.045 * petal.speed;
    const x = (petal.x + Math.sin(travel * 0.08) * 6 + travel * petal.drift) % (VIEWPORT.width + 40) - 20;
    const y = (petal.y + travel) % (VIEWPORT.height + 36) - 18;

    if (canDrawSprite(effectSprites.petal)) {
      const size = 5 + petal.size * 3;
      ctx.save();
      ctx.globalAlpha = Math.min(0.9, petal.alpha * 2.5);
      ctx.translate(Math.round(x), Math.round(y));
      ctx.rotate(Math.sin(travel * 0.06 + petal.x) * 0.9);
      ctx.drawImage(effectSprites.petal, -size / 2, -size / 2, size, Math.round(size * 1.25));
      ctx.restore();
    } else {
      ctx.fillStyle = `rgba(247, 201, 222, ${petal.alpha})`;
      ctx.fillRect(Math.round(x), Math.round(y), petal.size, petal.size + 1);
    }
  }

  ctx.restore();
}

function drawVignette() {
  const gradient = ctx.createLinearGradient(0, 0, 0, VIEWPORT.height);

  if (state.currentLevelId === "hub") {
    gradient.addColorStop(0, "rgba(207, 226, 255, 0.04)");
    gradient.addColorStop(1, "rgba(3, 8, 16, 0.3)");
    ctx.strokeStyle = "rgba(162, 197, 255, 0.1)";
  } else if (state.currentLevelId === "village") {
    gradient.addColorStop(0, "rgba(241, 248, 255, 0.04)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.34)");
    ctx.strokeStyle = "rgba(208, 228, 244, 0.08)";
  } else if (state.currentLevelId === "archive") {
    gradient.addColorStop(0, "rgba(255, 219, 162, 0.05)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.24)");
    ctx.strokeStyle = "rgba(255, 229, 181, 0.08)";
  } else if (state.currentLevelId === "crossroads") {
    gradient.addColorStop(0, "rgba(255, 239, 181, 0.04)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.2)");
    ctx.strokeStyle = "rgba(255, 230, 146, 0.08)";
  } else if (state.currentLevelId === "spring") {
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.08)");
    gradient.addColorStop(1, "rgba(37, 82, 22, 0.12)");
    ctx.strokeStyle = "rgba(255, 247, 201, 0.12)";
  } else {
    gradient.addColorStop(0, "rgba(255,255,255,0.03)");
    gradient.addColorStop(1, "rgba(0,0,0,0.28)");
    ctx.strokeStyle = "rgba(226, 236, 255, 0.09)";
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEWPORT.width, VIEWPORT.height);

  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, VIEWPORT.width - 4, VIEWPORT.height - 4);
}

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function normalizeKey(key) {
  if (key === " ") {
    return "space";
  }

  return key.toLowerCase();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
