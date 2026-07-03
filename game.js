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
const slideImage = document.getElementById("slide-image");

const VIEWPORT = { width: canvas.width, height: canvas.height };
const WORLD = { width: 960, height: 640 };
const PLAYER_SPEED = 92;
const INTERACTION_RADIUS = 30;
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

const keys = new Set();
const playerSprites = loadPlayerSprites();
const npcSprites = loadVillageNpcSprites();
const environmentSprites = loadEnvironmentSprites();

const state = {
  mode: "start",
  currentLevelId: "village",
  activeSlide: null,
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

startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);
resumeButton.addEventListener("click", resumeGame);
restartButton.addEventListener("click", restartGame);
aboutButton.addEventListener("click", () => {
  state.aboutFromPause = true;
  openSlide(currentLevel().aboutSlide);
});
closeSlideButton.addEventListener("click", closeSlide);
returnStartButton.addEventListener("click", returnToStartScreen);

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
    event.preventDefault();
  }

  if (event.repeat) {
    return;
  }

  const key = normalizeKey(event.key);

  if (key === "escape") {
    if (state.mode === "modal") {
      closeSlide();
      return;
    }

    if (state.mode === "playing" || state.mode === "paused") {
      togglePause();
      return;
    }
  }

  if (state.mode === "start" && (key === "enter" || key === "space")) {
    startGame();
    return;
  }

  if (state.mode === "ending" && (key === "enter" || key === "space")) {
    returnToStartScreen();
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
    label: "Level 1: The Dark Village",
    canvasLabel: "The Dark Village game world",
    pauseTitle: "The Dark Village",
    spawn: { x: 128, y: 366, direction: "right" },
    bounds: { minX: 15, maxX: 945, minY: 21, maxY: 621 },
    aboutSlide: {
      kicker: "Level 1",
      title: "The Dark Village",
      text:
        "A rain-soaked ruined village frames the national crisis before 1930. Two key interactions reveal the darkness of colonial oppression and the dead end of leaderless struggle.",
      caption: "Cold rain, broken homes, and a road that pushes history forward",
      art: "peasant",
    },
    exits: [
      {
        id: "east-road",
        kind: "edge-right",
        prompt: "East road -> Level 2",
        target: "archive",
        hintMinX: WORLD.width - 128,
        triggerX: 944,
        minY: 294,
        maxY: 414,
        spawn: { x: 110, y: 438, direction: "right" },
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
        prompt: "speak with the tired peasant",
        slide: {
          kicker: "Level 1",
          title: "Đêm Đen Nô Lệ (Trước 1930)",
          text:
            "Đất nước chìm trong đêm đen nô lệ. Các phong trào yêu nước từ Cần Vương đến khuynh hướng tư sản đều thất bại vì thiếu một đường lối đúng đắn.",
          caption: "Người nông dân mệt mỏi đứng giữa làng hoang tàn",
          art: "peasant",
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
        prompt: "inspect the ruined scholar's desk",
        slide: {
          kicker: "Level 1",
          title: "Khủng hoảng đường lối",
          text:
            "Nhân dân bế tắc, xã hội phân hóa sâu sắc. Nếu cứ tiếp diễn, dân tộc sẽ mãi cam chịu kiếp nô lệ.",
          caption: "Bàn học đổ nát gợi lên một ngã rẽ lịch sử chưa tìm thấy lối ra",
          art: "desk",
        },
      },
    ],
    colliders: [
      { x: 78, y: 184, width: 66, height: 30 },
      { x: 204, y: 176, width: 70, height: 34 },
      { x: 360, y: 182, width: 64, height: 28 },
      { x: 528, y: 178, width: 70, height: 32 },
      { x: 700, y: 180, width: 68, height: 32 },
      { x: 232, y: 382, width: 30, height: 10 },
      { x: 520, y: 356, width: 30, height: 10 },
      { x: 770, y: 400, width: 32, height: 10 },
    ],
    decorations,
  };
}

function createArchiveLevel() {
  const decorations = createArchiveDecorations();

  return {
    id: "archive",
    label: "Level 2: The Secret Archive",
    canvasLabel: "The Secret Archive game world",
    pauseTitle: "The Secret Archive",
    spawn: { x: 110, y: 438, direction: "right" },
    bounds: { minX: 92, maxX: 868, minY: 88, maxY: 562 },
    aboutSlide: {
      kicker: "Level 2",
      title: "The Secret Archive",
      text:
        "Inside a dim wooden archive, scattered ideas begin to align. Glowing fragments gather on a study table, and a compass on its pedestal points toward a decisive historical direction.",
      caption: "A quiet room where confusion gives way to convergence",
      art: "compass",
    },
    exits: [
      {
        id: "north-door",
        kind: "rect",
        prompt: "North door -> Level 3",
        x: 430,
        y: 68,
        width: 100,
        height: 64,
        target: "crossroads",
        spawn: { x: 480, y: 548, direction: "up" },
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
        prompt: "study the glowing fragments",
        slide: {
          kicker: "Level 2",
          title: "Nguy cơ chia rẽ & Sự hội tụ",
          text:
            "Cuối 1929, 3 tổ chức cộng sản hoạt động biệt lập nguy cơ dẫn đến chia rẽ. Ngày 3/2/1930, lãnh tụ Nguyễn Ái Quốc đã hợp nhất họ thành Đảng Cộng sản Việt Nam.",
          caption: "Ba mảnh sáng tách rời rồi dần quy tụ trên cùng một mặt bàn",
          art: "fragments",
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
        prompt: "examine the glowing compass",
        slide: {
          kicker: "Level 2",
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
    label: "Level 3: The Crossroads",
    canvasLabel: "The Crossroads game world",
    pauseTitle: "The Crossroads",
    spawn: { x: 480, y: 548, direction: "up" },
    bounds: { minX: 24, maxX: 936, minY: 20, maxY: 620 },
    aboutSlide: {
      kicker: "Level 3",
      title: "The Crossroads",
      text:
        "Here the land visibly splits between despair and solidarity. One side warns of ruin and fragmentation, while the other shows how unity under revolutionary leadership reshaped the nation.",
      caption: "A divided map where history turns toward collective action",
      art: "crowd",
    },
    exits: [
      {
        id: "final-path",
        kind: "rect",
        prompt: "Glowing path -> Final level",
        x: 440,
        y: 14,
        width: 80,
        height: 120,
        target: "spring",
        spawn: { x: 480, y: 546, direction: "up" },
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
        prompt: "join the united gathering",
        slide: {
          kicker: "Level 3",
          title: "Khối Đại Đoàn Kết Toàn Dân",
          text:
            "Nhờ mặt trận Việt Minh do Đảng lãnh đạo, sức mạnh của toàn dân được quy tụ. Hàng triệu người chung một ý chí làm nên Cách mạng Tháng Tám 1945.",
          caption: "Nông dân, công nhân và quần chúng đứng cùng nhau dưới những lá cờ đỏ",
          art: "crowd",
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
        prompt: "inspect the broken bridge",
        slide: {
          kicker: "Level 3",
          title: "Viễn cảnh chia cắt vĩnh viễn",
          text:
            "Nếu không có Đảng chớp thời cơ và đường lối kháng chiến trường kỳ, đất nước có thể bị các cường quốc chia cắt vĩnh viễn trên bản đồ thế giới, hoặc mãi là thuộc địa kiểu mới.",
          caption: "Chiếc cầu gãy và biển báo dừng lại như một lời cảnh báo lịch sử",
          art: "bridge",
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
    label: "Level 4: The Spring Valley",
    canvasLabel: "The Spring Valley game world",
    pauseTitle: "The Spring Valley",
    spawn: { x: 480, y: 546, direction: "up" },
    bounds: { minX: 28, maxX: 932, minY: 18, maxY: 618 },
    aboutSlide: {
      kicker: "Level 4",
      title: "The Spring Valley",
      text:
        "The journey ends in a bright valley of peace, cultivation, and renewal. Blooming trees, healthy crops, and open sky reflect the prosperity built from hard-won independence and unity.",
      caption: "A peaceful valley where the future feels rooted and alive",
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
        prompt: "stand before the grand tree",
        slide: {
          kicker: "Level 4",
          title: "Trái Ngọt Độc Lập & Tương Lai",
          text:
            "Lịch sử đã chọn Đảng. Nhờ có Đảng, chúng ta mới có một Việt Nam hòa bình, thống nhất, đổi mới và đang hội nhập sâu rộng với quốc tế. Sự lãnh đạo của Đảng là nhân tố hàng đầu bảo đảm mọi thắng lợi của cách mạng Việt Nam.",
          caption: "Cội cây lớn đứng giữa mùa xuân như biểu tượng của hòa bình và tương lai",
          art: "spring",
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
    { x: 82, y: 172, width: 58, height: 40, breakSide: "right" },
    { x: 208, y: 162, width: 62, height: 46, breakSide: "left" },
    { x: 364, y: 170, width: 56, height: 40, breakSide: "middle" },
    { x: 532, y: 164, width: 62, height: 44, breakSide: "right" },
    { x: 704, y: 170, width: 60, height: 42, breakSide: "left" },
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
    { x: 236, y: 384, width: 30, height: 16, brokenSide: "left" },
    { x: 528, y: 360, width: 28, height: 16, brokenSide: "right" },
    { x: 776, y: 404, width: 30, height: 16, brokenSide: "left" },
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

  const rain = Array.from({ length: 88 }, (_, index) => ({
    x: (index * 23) % (VIEWPORT.width + 28),
    y: (index * 17) % (VIEWPORT.height + 24),
    speed: 0.8 + (index % 5) * 0.22,
    drift: 0.7 + (index % 4) * 0.18,
    length: 8 + (index % 4) * 2,
    alpha: 0.14 + (index % 3) * 0.05,
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

function startGame() {
  state.mode = "playing";
  state.aboutFromPause = false;
  state.pendingEnding = false;
  keys.clear();
  hideEndOverlay();
  startScreen.classList.add("hidden");
  pauseMenu.classList.add("hidden");
  slideModal.classList.add("hidden");
  interactionPrompt.classList.add("hidden");
  pauseMenu.setAttribute("aria-hidden", "true");
  slideModal.setAttribute("aria-hidden", "true");
  loadLevel("village");
}

function returnToStartScreen() {
  state.mode = "start";
  state.activeSlide = null;
  state.activeInteractionId = null;
  state.aboutFromPause = false;
  state.pendingEnding = false;
  keys.clear();
  hideEndOverlay();
  slideModal.classList.add("hidden");
  pauseMenu.classList.add("hidden");
  interactionPrompt.classList.add("hidden");
  slideModal.setAttribute("aria-hidden", "true");
  pauseMenu.setAttribute("aria-hidden", "true");
  loadLevel("village");
  startScreen.classList.remove("hidden");
}

function togglePause() {
  if (state.mode === "playing") {
    state.mode = "paused";
    pauseMenu.classList.remove("hidden");
    pauseMenu.setAttribute("aria-hidden", "false");
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
}

function restartGame() {
  state.mode = "playing";
  state.activeSlide = null;
  state.activeInteractionId = null;
  state.aboutFromPause = false;
  state.pendingEnding = false;
  keys.clear();
  hideEndOverlay();
  startScreen.classList.add("hidden");
  pauseMenu.classList.add("hidden");
  slideModal.classList.add("hidden");
  interactionPrompt.classList.add("hidden");
  pauseMenu.setAttribute("aria-hidden", "true");
  slideModal.setAttribute("aria-hidden", "true");
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
}

function updateLevelChrome() {
  const level = currentLevel();

  levelChip.textContent = level.label;
  pauseTitle.textContent = level.pauseTitle;
  canvas.setAttribute("aria-label", level.canvasLabel);
}

function openSlide(slideData) {
  state.activeSlide = slideData;
  state.pendingEnding = Boolean(slideData.endsGame);
  state.mode = "modal";
  slideKicker.textContent = slideData.kicker;
  slideTitle.textContent = slideData.title;
  slideText.textContent = slideData.text;
  slideCaption.textContent = slideData.caption;
  slideImage.className = "slide-image";

  if (slideData.art) {
    slideImage.classList.add(`art-${slideData.art}`);
  }

  slideModal.classList.remove("hidden");
  slideModal.setAttribute("aria-hidden", "false");
  pauseMenu.classList.add("hidden");
  pauseMenu.setAttribute("aria-hidden", "true");
  interactionPrompt.classList.add("hidden");
}

function closeSlide() {
  const shouldEnd = state.pendingEnding;

  slideModal.classList.add("hidden");
  slideModal.setAttribute("aria-hidden", "true");
  state.activeSlide = null;
  state.pendingEnding = false;

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
}

function showEndOverlay() {
  state.mode = "ending";
  interactionPrompt.classList.add("hidden");
  endOverlay.classList.remove("hidden");
  endOverlay.setAttribute("aria-hidden", "false");
}

function hideEndOverlay() {
  endOverlay.classList.add("hidden");
  endOverlay.setAttribute("aria-hidden", "true");
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
    interactionPrompt.textContent = `Press E to ${candidate.prompt}`;
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

  openSlide(candidate.slide);
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

  ctx.restore();
}

function drawVillageWorld(decorations) {
  drawStormSky(decorations);
  drawVillageGroundBase();
  drawVillageRuins(decorations);
  drawVillageRoads();
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
  if (drawTerrainFill(TILECRAFT_TERRAIN.stone, 0, VILLAGE_SKYLINE_Y, WORLD.width, WORLD.height - VILLAGE_SKYLINE_Y, { seed: 2 })) {
    drawTerrainFill(TILECRAFT_TERRAIN.dirt, 0, 500, WORLD.width, WORLD.height - 500, {
      seed: 4,
      alpha: 0.55,
    });

    ctx.fillStyle = "rgba(24, 31, 40, 0.48)";
    ctx.fillRect(0, VILLAGE_SKYLINE_Y, WORLD.width, WORLD.height - VILLAGE_SKYLINE_Y);
    ctx.fillStyle = "rgba(9, 12, 17, 0.18)";
    for (let x = 0; x < WORLD.width; x += 32) {
      ctx.fillRect(x, VILLAGE_SKYLINE_Y, 16, WORLD.height - VILLAGE_SKYLINE_Y);
    }
    ctx.fillStyle = "rgba(10, 12, 15, 0.26)";
    ctx.fillRect(0, 500, WORLD.width, WORLD.height - 500);
    return;
  }

  ctx.fillStyle = "#2a343d";
  ctx.fillRect(0, VILLAGE_SKYLINE_Y, WORLD.width, WORLD.height - VILLAGE_SKYLINE_Y);

  for (let x = 0; x < WORLD.width; x += 22) {
    ctx.fillStyle = x % 44 === 0 ? "#303b45" : "#263039";
    ctx.fillRect(x, VILLAGE_SKYLINE_Y, 22, WORLD.height - VILLAGE_SKYLINE_Y);
  }

  ctx.fillStyle = "#212930";
  ctx.fillRect(0, 500, WORLD.width, WORLD.height - 500);
}

function drawVillageRuins(decorations) {
  for (const house of decorations.houses) {
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

function drawVillageRoads() {
  if (canDrawSprite(environmentSprites.tilecraftGround)) {
    drawTerrainFill(TILECRAFT_TERRAIN.dirt, 0, 330, WORLD.width, 60, { seed: 0 });
    drawTerrainFill(TILECRAFT_TERRAIN.dirt, 474, 228, 44, 102, { seed: 1 });
    drawTerrainFill(TILECRAFT_TERRAIN.dirt, WORLD.width - 170, 314, 170, 92, { seed: 2 });

    ctx.fillStyle = "rgba(70, 57, 50, 0.3)";
    ctx.fillRect(0, 330, WORLD.width, 60);
    ctx.fillRect(474, 228, 44, 102);
    ctx.fillRect(WORLD.width - 170, 314, 170, 92);
  } else {
  ctx.fillStyle = "#50494d";
  ctx.fillRect(0, 330, WORLD.width, 60);
  ctx.fillRect(474, 228, 44, 102);
  ctx.fillRect(WORLD.width - 170, 314, 170, 92);
  }

  ctx.fillStyle = "#655d62";
  ctx.fillRect(0, 340, WORLD.width, 8);
  ctx.fillRect(0, 372, WORLD.width, 6);
  ctx.fillRect(WORLD.width - 118, 324, 118, 10);

  ctx.fillStyle = "#3d3639";
  ctx.fillRect(116, 352, 38, 4);
  ctx.fillRect(286, 372, 54, 4);
  ctx.fillRect(430, 348, 46, 4);
  ctx.fillRect(612, 364, 52, 4);
  ctx.fillRect(804, 348, 48, 4);
}

function drawPuddles(puddles) {
  for (const puddle of puddles) {
    if (!drawTerrainFill(TILECRAFT_TERRAIN.water, puddle.x, puddle.y, puddle.width, puddle.height, { seed: 3 })) {
      ctx.fillStyle = "#32465b";
      ctx.fillRect(puddle.x, puddle.y, puddle.width, puddle.height);
    }

    ctx.fillStyle = "rgba(38, 83, 110, 0.34)";
    ctx.fillRect(puddle.x, puddle.y, puddle.width, puddle.height);
    ctx.fillStyle = "#5f7a94";
    ctx.fillRect(puddle.x + 4, puddle.y + 2, puddle.width - 12, 2);
    ctx.fillRect(puddle.x + 10, puddle.y + 5, puddle.width - 18, 2);
  }
}

function drawFenceRemains(fenceSegments) {
  for (const segment of fenceSegments) {
    for (let index = 0; index < segment.posts; index += 1) {
      if (index === segment.brokenIndex) {
        continue;
      }

      const x = segment.x + index * 12;
      ctx.fillStyle = "#504240";
      ctx.fillRect(x, segment.y, 4, 18);
      ctx.fillRect(x - 4, segment.y + 6, 12, 3);
      ctx.fillRect(x - 2, segment.y + 11, 10, 3);
    }

    ctx.fillStyle = "#3b302f";
    ctx.fillRect(segment.x + segment.brokenIndex * 12, segment.y + 12, 8, 3);
  }
}

function drawBrokenCarts(brokenCarts) {
  for (const cart of brokenCarts) {
    ctx.fillStyle = "#65463b";
    ctx.fillRect(cart.x - cart.width / 2, cart.y - 7, cart.width, 12);

    ctx.fillStyle = "#8f6957";
    ctx.fillRect(cart.x - cart.width / 2 + 4, cart.y - 5, cart.width - 10, 3);

    ctx.fillStyle = "#352b2c";
    if (cart.brokenSide !== "left") {
      ctx.fillRect(cart.x - cart.width / 2 - 4, cart.y + 4, 6, 6);
    }
    if (cart.brokenSide !== "right") {
      ctx.fillRect(cart.x + cart.width / 2 - 2, cart.y + 4, 6, 6);
    }

    ctx.fillStyle = "#2b2425";
    ctx.fillRect(cart.x - 2, cart.y + 3, 10, 2);
    ctx.fillRect(cart.x - cart.width / 2 - 8, cart.y - 2, 8, 2);
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
    ctx.fillStyle = piece.tone === 0 ? "#3a444f" : "#4f5c67";
    ctx.fillRect(piece.x, piece.y, piece.size, piece.size);

    if (piece.size > 2) {
      ctx.fillStyle = "#1f262d";
      ctx.fillRect(piece.x + 1, piece.y + piece.size, piece.size + 1, 1);
    }
  }

  for (let x = 40; x < WORLD.width; x += 54) {
    const y = 418 + ((x * 3) % 98);
    ctx.fillStyle = "#485449";
    ctx.fillRect(x, y, 2, 8);
    ctx.fillRect(x - 2, y + 4, 2, 3);
    ctx.fillRect(x + 2, y + 2, 2, 4);
  }
}

function drawVillageExitGate() {
  const gateX = WORLD.width - 72;
  const gateY = 266;

  ctx.fillStyle = "#272a32";
  ctx.fillRect(gateX, gateY, 10, 58);
  ctx.fillRect(gateX + 30, gateY + 6, 10, 52);
  ctx.fillRect(gateX - 4, gateY, 48, 10);

  ctx.fillStyle = "#424955";
  ctx.fillRect(gateX + 2, gateY + 4, 4, 40);
  ctx.fillRect(gateX + 32, gateY + 10, 4, 30);

  ctx.fillStyle = "#9aa6bb";
  ctx.fillRect(gateX + 46, gateY + 18, 18, 8);
  ctx.fillRect(gateX + 58, gateY + 16, 6, 12);
  ctx.fillRect(gateX + 64, gateY + 19, 6, 6);
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
    ctx.fillStyle = "#ead8a8";
    ctx.fillRect(candle.x, candle.y, 4, candle.height);
    ctx.fillStyle = "#ffca61";
    ctx.fillRect(candle.x + 1, candle.y - 4, 2, 4);
    ctx.fillStyle = "rgba(255, 198, 88, 0.2)";
    ctx.fillRect(candle.x - 8, candle.y - 10, 20, 20);
  }
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
  ctx.lineWidth = 1;

  for (const drop of rain) {
    const travel = state.lastTimestamp * 0.15 * drop.speed;
    const x = (drop.x + travel * drop.drift) % (VIEWPORT.width + 30) - 15;
    const y = (drop.y + travel) % (VIEWPORT.height + 30) - 15;

    ctx.strokeStyle = `rgba(202, 220, 255, ${drop.alpha})`;
    ctx.beginPath();
    ctx.moveTo(Math.round(x), Math.round(y));
    ctx.lineTo(Math.round(x - 3), Math.round(y + drop.length));
    ctx.stroke();
  }

  ctx.restore();
}

function drawEmbers(embers) {
  ctx.save();

  for (const ember of embers) {
    const lift = (state.lastTimestamp * 0.03 * ember.rise + ember.offset * 28) % 34;
    const sway = Math.sin(state.lastTimestamp * 0.002 + ember.offset) * ember.drift;
    const x = ember.x + sway;
    const y = ember.y - lift;

    ctx.fillStyle = `rgba(255, 190, 96, ${ember.alpha})`;
    ctx.fillRect(Math.round(x), Math.round(y), ember.size, ember.size);
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

    ctx.fillStyle = `rgba(255, 236, 140, ${mote.alpha})`;
    ctx.fillRect(Math.round(x), Math.round(y), mote.size, mote.size);
  }

  ctx.restore();
}

function drawPetals(petals) {
  ctx.save();

  for (const petal of petals) {
    const travel = state.lastTimestamp * 0.045 * petal.speed;
    const x = (petal.x + Math.sin(travel * 0.08) * 6 + travel * petal.drift) % (VIEWPORT.width + 40) - 20;
    const y = (petal.y + travel) % (VIEWPORT.height + 36) - 18;

    ctx.fillStyle = `rgba(247, 201, 222, ${petal.alpha})`;
    ctx.fillRect(Math.round(x), Math.round(y), petal.size, petal.size + 1);
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
