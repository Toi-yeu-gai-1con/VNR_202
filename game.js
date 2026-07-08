const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const startScreen = document.getElementById("start-screen");
const pauseMenu = document.getElementById("pause-menu");
const slideModal = document.getElementById("slide-modal");
const endOverlay = document.getElementById("end-overlay");
const interactionPrompt = document.getElementById("interaction-prompt");
const levelChip = document.getElementById("level-chip");
const pauseTitle = document.getElementById("pause-title");
const storyBookButton = document.getElementById("story-book-button");
const storyBookCount = document.getElementById("story-book-count");
const storyToast = document.getElementById("story-toast");
const dialogueBox = document.getElementById("dialogue-box");
const dialogueSpeaker = document.getElementById("dialogue-speaker");
const dialogueProgress = document.getElementById("dialogue-progress");
const dialogueText = document.getElementById("dialogue-text");
const dialogueNextButton = document.getElementById("dialogue-next-button");

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

const VIEWPORT = { width: canvas.width, height: canvas.height };
const WORLD = { width: 960, height: 640 };
const PLAYER_SPEED = 92;
const INTERACTION_RADIUS = 30;
const STORY_UNLOCK_TOAST_MS = 2800;
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

const keys = new Set();
const playerSprites = loadPlayerSprites();
const npcSprites = loadVillageNpcSprites();
const environmentSprites = loadEnvironmentSprites();
const effectSprites = loadEffectSprites();
const uiSounds = loadUiSounds();
const ambienceSounds = loadAmbienceSounds();
let storyToastTimeoutId = 0;

const state = {
  mode: "start",
  currentLevelId: "village",
  activeSlide: null,
  activeDialogue: null,
  activeDialogueIndex: 0,
  activeStoryIds: [],
  activeStoryIndex: 0,
  unlockedStoryIds: new Set(),
  activeInteractionId: null,
  aboutFromPause: false,
  pendingEnding: false,
  lastTimestamp: 0,
};

const player = createPlayer();
const camera = { x: 0, y: 0 };
const levels = {
  village: createVillageLevel(),
  archive: createArchiveLevel(),
  crossroads: createCrossroadsLevel(),
  spring: createSpringLevel(),
};
const storyRegistry = createStoryRegistry(levels);

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
storyPrevButton.addEventListener("click", withUiClickSound(() => showStoryBookEntry(-1)));
storyNextButton.addEventListener("click", withUiClickSound(() => showStoryBookEntry(1)));
returnStartButton.addEventListener("click", withUiClickSound(returnToStartScreen));

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
    event.preventDefault();
  }

  if (event.repeat) {
    return;
  }

  const key = normalizeKey(event.key);

  if (key === "escape") {
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

  if (state.mode === "ending" && (key === "enter" || key === "space")) {
    playUiSound(uiSounds.pixelClick);
    returnToStartScreen();
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

  if (state.mode === "playing" && (key === "e" || key === "space")) {
    handleInteraction();
    return;
  }

  keys.add(key);
});

window.addEventListener("keyup", (event) => {
  keys.delete(normalizeKey(event.key));
});

loadLevel("village");
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
    ruinedVillageBuildings: Array.from({ length: 7 }, (_, index) =>
      loadSprite(`assets/environment/mutterpixel-ruined-village/spr_old_building_${index + 1}.png`)
    ),
    villageProps: {
      fencesWallsGate: loadSprite("assets/environment/village-props/fences-walls-gate.png"),
      boxesCrates: loadSprite("assets/environment/village-props/boxes-crates.png"),
      fantasyVehicles: loadSprite("assets/environment/village-props/fantasy-vehicles.png"),
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

  if (state.mode !== "start") {
    if (state.currentLevelId === "village") {
      activeAmbience = ambienceSounds.rain;
    } else if (state.currentLevelId === "archive") {
      activeAmbience = ambienceSounds.fireplace;
    }
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
  const animation = actor.animation === "walk" ? "walk" : "idle";
  const frameCount = animation === "walk" ? NPC_SPRITE.walkFrames : NPC_SPRITE.idleFrames;
  const duration =
    animation === "walk" ? NPC_SPRITE.walkFrameDuration : NPC_SPRITE.idleFrameDuration;
  const frameOffset = actor.frameOffset ?? 0;
  const frameTime = state.lastTimestamp + frameOffset * duration * 4;

  return {
    animation,
    index: Math.floor(frameTime / duration) % frameCount,
  };
}

function drawNpcSpriteActor(actor) {
  const spriteSet = npcSprites[actor.spriteKey];

  if (!spriteSet) {
    return false;
  }

  const direction = resolveNpcDirection(actor.direction);
  const sheet = spriteSet[direction.key];

  if (!canDrawSprite(sheet)) {
    return false;
  }

  const frame = getNpcFrame(actor);
  const scale = actor.scale ?? 1;
  const sourceY = frame.animation === "walk" ? NPC_SPRITE.frameHeight : 0;
  const sourceX = frame.index * NPC_SPRITE.frameWidth + NPC_SPRITE.cropX;
  const drawWidth = Math.max(1, Math.round(NPC_SPRITE.drawWidth * scale));
  const drawHeight = Math.max(1, Math.round(NPC_SPRITE.drawHeight * scale));

  ctx.save();
  ctx.translate(Math.round(actor.x), Math.round(actor.y));
  ctx.scale(direction.flipX ? -1 : 1, 1);
  ctx.drawImage(
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
  ctx.restore();
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
        width: 30,
        height: 18,
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
        width: 22,
        height: 28,
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
          endsGame: true,
        },
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

function createStoryRegistry(levelMap) {
  const registry = {};

  for (const level of Object.values(levelMap)) {
    for (const item of level.interactables ?? []) {
      registry[item.id] = {
        id: item.id,
        levelId: level.id,
        ...item.slide,
      };
    }
  }

  return registry;
}

function currentLevel() {
  return levels[state.currentLevelId];
}

function frame(timestamp) {
  const deltaSeconds = Math.min((timestamp - state.lastTimestamp) / 1000 || 0, 0.033);
  state.lastTimestamp = timestamp;

  if (state.mode === "playing") {
    updatePlayer(deltaSeconds);
    updateInteractionPrompt();
  }

  render();
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
  hideDialogue();
  hideStoryToast();
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

function getInteractionDialogue(item) {
  return INTERACTION_DIALOGUES[item.id] ?? {
    speaker: item.kind === "npc" ? "Nhân chứng" : "Dấu tích",
    lines: [item.slide.caption, item.slide.text],
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

function startGame() {
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
  loadLevel("village");
}

function returnToStartScreen() {
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
  loadLevel("village");
  startScreen.classList.remove("hidden");
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
  keys.clear();
  hideEndOverlay();
  startScreen.classList.add("hidden");
  pauseMenu.classList.add("hidden");
  slideModal.classList.add("hidden");
  interactionPrompt.classList.add("hidden");
  pauseMenu.setAttribute("aria-hidden", "true");
  slideModal.setAttribute("aria-hidden", "true");
  resetStoryProgress();
  loadLevel("village");
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

  updateCamera();
  updateLevelChrome();
  updateInteractionPrompt();
  syncAmbienceAudio();
  updateStoryBookButton();
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

function showEndOverlay() {
  state.mode = "ending";
  interactionPrompt.classList.add("hidden");
  endOverlay.classList.remove("hidden");
  endOverlay.setAttribute("aria-hidden", "false");
  updateStoryBookButton();
}

function hideEndOverlay() {
  endOverlay.classList.add("hidden");
  endOverlay.setAttribute("aria-hidden", "true");
  updateStoryBookButton();
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

  const colliders = currentLevel().colliders ?? [];
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
  for (const exit of currentLevel().exits) {
    if (!exit.target) {
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
  const candidate = getNearestInteractable();

  if (candidate) {
    state.activeInteractionId = candidate.id;
    interactionPrompt.textContent = `Nhấn E để ${candidate.prompt}`;
    interactionPrompt.classList.remove("hidden");
    return;
  }

  state.activeInteractionId = null;

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
    if (isExitNear(exit)) {
      return exit;
    }
  }

  return null;
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
  if (exit.kind === "edge-right") {
    return player.x >= exit.triggerX && player.y > exit.minY && player.y < exit.maxY;
  }

  if (exit.kind === "rect") {
    return pointInRect(player.x, player.y, exit);
  }

  return false;
}

function handleInteraction() {
  const candidate = getNearestInteractable();

  if (!candidate) {
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

function render() {
  drawWorld();
  drawInteractables();
  drawPlayer();
  drawAtmosphere();
  drawVignette();
}

function drawWorld() {
  ctx.clearRect(0, 0, VIEWPORT.width, VIEWPORT.height);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  if (state.currentLevelId === "village") {
    drawVillageWorld(currentLevel().decorations);
  } else if (state.currentLevelId === "archive") {
    drawArchiveWorld(currentLevel().decorations);
  } else if (state.currentLevelId === "crossroads") {
    drawCrossroadsWorld(currentLevel().decorations);
  } else {
    drawSpringWorld(currentLevel().decorations);
  }

  drawExitGuides(currentLevel().exits);
  ctx.restore();
}

function drawExitGuides(exits) {
  for (const exit of exits) {
    if (!exit.guide?.markers?.length) {
      continue;
    }

    for (let index = 0; index < exit.guide.markers.length; index += 1) {
      drawExitGuideMarker(exit.guide, exit.guide.markers[index], index);
    }
  }
}

function drawExitGuideMarker(guide, marker, index) {
  const direction = marker.direction ?? "right";
  const size = marker.size ?? 3;
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

  const glowRadius = 16 + size * 6;
  const glowAlpha = guide.glowAlpha ?? 0.28;
  drawWorldWarmGlow(drawX, drawY, glowRadius, glowAlpha * pulse);

  ctx.save();
  ctx.globalAlpha = 0.28 * pulse;
  drawPixelExitArrow(drawX + size, drawY + size, direction, size, "#1a1614");
  ctx.restore();

  drawPixelExitArrow(drawX, drawY, direction, size, "#2b2019");
  drawPixelExitArrow(drawX, drawY, direction, size - 1, guide.color ?? "#f3d777");
  drawPixelExitArrow(drawX, drawY, direction, Math.max(1, size - 2), "#fff9d1");
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

  drawVillageTexture(0, VILLAGE_SKYLINE_Y, WORLD.width, WORLD.height - VILLAGE_SKYLINE_Y, {
    seed: 3,
    step: 18,
    colors: ["#313a43", "#202831", "#3a4148", "#26303a"],
    alpha: 0.42,
  });

  ctx.fillStyle = "rgba(16, 21, 27, 0.34)";
  ctx.fillRect(0, 500, WORLD.width, WORLD.height - 500);
  drawVillageTexture(0, 500, WORLD.width, WORLD.height - 500, {
    seed: 8,
    step: 20,
    colors: ["#252d34", "#171d24", "#30363a"],
    alpha: 0.5,
  });

  ctx.fillStyle = "rgba(94, 81, 64, 0.14)";
  for (let x = 18; x < WORLD.width; x += 48) {
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

  drawVillageTexture(x, y + 6, width, height - 12, {
    seed: seed + 12,
    step: 12,
    colors: ["#786448", "#584a3d", "#7f715d", "#453b34"],
    alpha: 0.72,
  });

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
  if (drawTerrainFill(TILECRAFT_TERRAIN.dirt, path.x, path.y, path.width, path.height, { seed: 10 })) {
    ctx.fillStyle = "rgba(207, 185, 129, 0.16)";
    ctx.fillRect(path.x, path.y, path.width, path.height);
    ctx.fillStyle = "rgba(177, 149, 100, 0.18)";
    ctx.fillRect(path.x + 12, path.y, path.width - 24, path.height);

    drawTerrainFill(TILECRAFT_TERRAIN.stone, plaza.x, plaza.y, plaza.width, plaza.height, { seed: 11 });
    ctx.fillStyle = "rgba(219, 209, 178, 0.18)";
    ctx.fillRect(plaza.x, plaza.y, plaza.width, plaza.height);
    ctx.fillStyle = "rgba(196, 179, 134, 0.16)";
    ctx.fillRect(plaza.x + 10, plaza.y + 10, plaza.width - 20, plaza.height - 20);
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
  for (const tree of blossomTrees) {
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
}

function drawInteractables() {
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  for (const item of currentLevel().interactables) {
    if (item.kind === "npc") {
      drawNpc(item);
    } else {
      drawObject(item);
    }

    if (item.id === state.activeInteractionId && state.mode === "playing") {
      drawInteractionMarker(item);
    }
  }

  ctx.restore();
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

function drawPlayer() {
  ctx.save();
  ctx.translate(Math.round(player.x - camera.x), Math.round(player.y - camera.y));

  ctx.fillStyle = "rgba(10, 12, 16, 0.32)";
  ctx.fillRect(-7, 9, 14, 4);

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

function drawAtmosphere() {
  if (state.currentLevelId === "village") {
    drawRain(currentLevel().decorations.rain);
    return;
  }

  if (state.currentLevelId === "archive") {
    drawArchiveLighting(currentLevel().decorations);
    drawEmbers(currentLevel().decorations.embers);
    return;
  }

  if (state.currentLevelId === "crossroads") {
    drawGlowMotes(currentLevel().decorations.motes);
    return;
  }

  drawPetals(currentLevel().decorations.petals);
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

  if (state.currentLevelId === "archive") {
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
