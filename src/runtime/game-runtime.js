import { createQuestState } from "../data/quests.js";
import { createNarrativeState, recordNarrativeChoice } from "../systems/narrative-state.js";
import { resolveEnding } from "../systems/ending-resolver.js";
import { NARRATIVE_CHAPTER_DEFINITIONS, NARRATIVE_CHOICE_DEFINITIONS, NARRATIVE_ENDING_DEFINITIONS, NARRATIVE_TVA_REACTION_DEFINITIONS } from "../data/narrative-definitions.js";
import { ZONE_PROFILES } from "../data/zone-profiles.js";
import { createAssetManager } from "../core/asset-manager.js";
import { createPageLifecycleController } from "../core/page-lifecycle.js";
import { createRuntimeLoop } from "../core/runtime-loop.js";
import { createSceneController } from "../core/scene-controller.js";
import { createDebugOverlay } from "../debug/debug-overlay.js";
import { createAudioSystem } from "../systems/audio-system.js";
import { createLevelDefinitions } from "../systems/level-definitions.js";
import { createSaveSystem } from "../systems/save-system.js";
import { INTERACTION_DIALOGUES, TVA_EMPLOYEE_DIALOGUES, RELIC_DEFINITIONS, RELIC_STORY_SLIDES, ENDING_DEFINITIONS, ENDING_OVERLAY_SCENES, ENDING_CINEMATIC_DEFINITIONS, BAD_ENDING_RECOVERY, OPENING_DIALOGUE } from "../data/story-content.js";
import { createMiniMapRenderer } from "../rendering/minimap-renderer.js";
import { createCoordinateSystem } from "../rendering/coordinate-system.js";
import { LEVEL_ASSET_GROUPS, getAssetGroupForSource, isCriticalAsset } from "../data/asset-manifest.js";
import { BOSS_DEFINITIONS, COMBAT_DENSITY, COMBAT_ROSTER } from "../data/combat-config.js";
import { MONSTER_ART_DEFINITIONS, MONSTER_ART_KEY_BY_ID, getMonsterStripSource, isDedicatedMonsterArtKey } from "../data/monster-art-definitions.js";
import { GAMEPLAY_BALANCE, getDifficultySettings } from "../data/gameplay-balance.js";
import { AUDIO_TRACKS, COMBAT_SFX, getAudioSourceCandidates, resolveAudioSource } from "../data/media-sources.js";
import { BUILD_VERSION, withAssetVersion } from "../data/build-info.js";
import { PLAYER_FOOTPRINT, PLAYER_SPRITE, PLAYER_ANIMATIONS, NPC_SPRITE, TVA_EMPLOYEE_SPRITE, M90_RESET_ANIMATION, ENVIRONMENT_SPRITES, TILECRAFT_TERRAIN, PIXEL_CRAWLER_TERRAIN, VILLAGE_SKYLINE_Y, VILLAGE_PROP_SPRITES, PIXEL_CRAWLER_BUILDING_SPRITES, HUB_PORTAL_SPRITE, SWORD_SLASH_SPRITE, PIXEL_CRAWLER_TREE_SPRITE, KENNEY_ROGUELIKE_TILE, KENNEY_ROGUELIKE_SPRITES, PIXEL_CRAWLER_VEGETATION_SPRITES, PIXEL_CRAWLER_TOOL_CLUSTER_SPRITES, CAINOS_PROP_SPRITES, LIMEZU_INTERIOR_SPRITES, HOUSE_INTERIOR_A_SPRITES, MONSTER_SPRITE_CONFIG } from "../data/render-config.js";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const debugCanvas = document.getElementById("debug-canvas");
const debugCtx = debugCanvas?.getContext("2d") ?? null;
const debugOverlayPanel = document.getElementById("debug-overlay");
const debugValues = document.getElementById("debug-values");
const minimap = document.getElementById("minimap");
const minimapCanvas = document.getElementById("minimap-canvas");
const minimapCtx = minimapCanvas?.getContext("2d") ?? null;
const gameShell = document.querySelector(".game-shell");
const gameFrame = document.querySelector(".game-frame");

ctx.imageSmoothingEnabled = false;
if (debugCtx) {
  debugCtx.imageSmoothingEnabled = false;
}

if (minimapCtx) {
  minimapCtx.imageSmoothingEnabled = false;
}

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
const corruptionWarning = document.getElementById("corruption-warning");
const hud = document.getElementById("hud");
const dialogueBox = document.getElementById("dialogue-box");
const dialogueSpeaker = document.getElementById("dialogue-speaker");
const dialogueProgress = document.getElementById("dialogue-progress");
const dialogueText = document.getElementById("dialogue-text");
const dialogueChoiceList = document.getElementById("dialogue-choice-list");
const dialogueHint = document.getElementById("dialogue-hint");
const dialogueNextButton = document.getElementById("dialogue-next-button");
const dialoguePortrait = document.getElementById("dialogue-portrait");
const dialoguePortraitCtx = dialoguePortrait?.getContext("2d") ?? null;
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
const buildVersionLabel = document.getElementById("build-version");

const startButton = document.getElementById("start-button");
const continueButton = document.getElementById("continue-button");
const pauseButton = document.getElementById("pause-button");
const soundButton = document.getElementById("sound-button");
const fullscreenButton = document.getElementById("fullscreen-button");
const resumeButton = document.getElementById("resume-button");
const restartButton = document.getElementById("restart-button");
const aboutButton = document.getElementById("about-button");
const closeSlideButton = document.getElementById("close-slide-button");
const returnStartButton = document.getElementById("return-start-button");
const actionHint = document.getElementById("action-hint");
const tutorialOverlay = document.getElementById("tutorial-overlay");
const tutorialCopy = document.getElementById("tutorial-copy");
const tutorialNextButton = document.getElementById("tutorial-next-button");
const zoneSummaryOverlay = document.getElementById("zone-summary-overlay");
const zoneSummaryTitle = document.getElementById("zone-summary-title");
const zoneSummaryCopy = document.getElementById("zone-summary-copy");
const zoneSummaryStats = document.getElementById("zone-summary-stats");
const zoneSummaryCloseButton = document.getElementById("zone-summary-close-button");
const zoneTitleOverlay = document.getElementById("zone-title-overlay");
const zoneTitlePeriod = document.getElementById("zone-title-period");
const zoneTitleTitle = document.getElementById("zone-title-title");
const zoneTitleQuestion = document.getElementById("zone-title-question");
const zoneTitleSource = document.getElementById("zone-title-source");
const zoneTitleContinueButton = document.getElementById("zone-title-continue-button");
const combatStatus = document.getElementById("combat-status");
const difficultyControls = document.getElementById("difficulty-controls");

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
const endTitle = document.getElementById("end-title");
const endCopy = document.getElementById("end-copy");
const endSummary = document.getElementById("end-summary");
const endArtFrame = document.getElementById("end-art-frame");
const endArtCinematic = document.getElementById("end-art-cinematic");
const endArtImage = document.getElementById("end-art-image");
const endArtCinematicCtx = endArtCinematic?.getContext("2d") ?? null;
const endArtOverlay = document.getElementById("end-art-overlay");
const endArtOverlayCtx = endArtOverlay?.getContext("2d") ?? null;
const badEndingRecoveryDialogue = document.getElementById("bad-ending-recovery-dialogue");
const badEndingRecoverySpeaker = document.getElementById("bad-ending-recovery-speaker");
const badEndingRecoveryText = document.getElementById("bad-ending-recovery-text");
const assetLoadingOverlay = document.getElementById("asset-loading-overlay");
const assetLoadingTitle = document.getElementById("asset-loading-title");
const assetLoadingCopy = document.getElementById("asset-loading-copy");
const assetRetryButton = document.getElementById("asset-retry-button");
const assetReturnButton = document.getElementById("asset-return-button");

if (endArtCinematicCtx) {
  endArtCinematicCtx.imageSmoothingEnabled = false;
}

if (endArtOverlayCtx) {
  endArtOverlayCtx.imageSmoothingEnabled = false;
}

const VIEWPORT = { width: canvas.width, height: canvas.height };
const WORLD = { width: 960, height: 640 };
const PORT_MAZE_DOOR = {
  x: 122,
  y: 154,
  width: 48,
  height: 48,
  portalX: 146,
  portalY: 178,
  spawnX: 178,
  spawnY: 238,
};
const PLAYER_SPEED = GAMEPLAY_BALANCE.player.speed;
const INTERACTION_RADIUS = GAMEPLAY_BALANCE.player.interactionRadius;
const STORY_UNLOCK_TOAST_MS = 2800;
const RELIC_BOOK_OPEN_DELAY_MS = 900;
const PLAYER_MAX_HEALTH = GAMEPLAY_BALANCE.player.maxHealth;
const DEATH_RESPAWN_DELAY_MS = GAMEPLAY_BALANCE.player.deathRespawnDelayMs;
const SA_DOA_MAX = GAMEPLAY_BALANCE.corruption.max;
const SA_DOA_BAD_ENDING = GAMEPLAY_BALANCE.corruption.badEndingThreshold;
const CORRUPTION_GLITCH_THRESHOLD = GAMEPLAY_BALANCE.corruption.glitchThreshold;
const CORRUPTION_WARNING_MS = 2600;
const DEATH_SA_DOA_PENALTY = GAMEPLAY_BALANCE.corruption.deathPenalty;
const STRIKE_COOLDOWN_MS = GAMEPLAY_BALANCE.combat.strike.cooldownMs;
const PARRY_COOLDOWN_MS = GAMEPLAY_BALANCE.combat.parry.cooldownMs;
const PARRY_WINDOW_MS = GAMEPLAY_BALANCE.combat.parry.windowMs;
const STRIKE_RANGE = GAMEPLAY_BALANCE.combat.strike.range;
const MONSTER_SPEED = GAMEPLAY_BALANCE.mob.baseSpeed;
const STAMINA_MAX = GAMEPLAY_BALANCE.stamina.max;
const STAMINA_REGEN_PER_SECOND = GAMEPLAY_BALANCE.stamina.regenPerSecond;
const DODGE_COST = GAMEPLAY_BALANCE.stamina.dodgeCost;
const DODGE_DISTANCE = GAMEPLAY_BALANCE.stamina.dodgeDistance;
const DODGE_COOLDOWN_MS = GAMEPLAY_BALANCE.stamina.dodgeCooldownMs;
const CHARGED_STRIKE_THRESHOLD_MS = GAMEPLAY_BALANCE.combat.strike.chargedThresholdMs;
const PROJECTILE_SPEED = GAMEPLAY_BALANCE.mob.projectileSpeed;
const MONSTER_TOUCH_RANGE = GAMEPLAY_BALANCE.mob.touchRange;
const MONSTER_CONTACT_DAMAGE_COOLDOWN_MS = GAMEPLAY_BALANCE.mob.contactDamageCooldownMs;
const RESPAWN_INVULNERABILITY_MS = GAMEPLAY_BALANCE.mob.respawnInvulnerabilityMs;
const RELIC_TARGET_COUNT = 5;
const SAVE_STORAGE_KEY = "crossroads-save-v1";
const SAVE_VERSION = 2;
const PLAYER_ATTACK_ANIMATION_MS = GAMEPLAY_BALANCE.combat.strike.animationMs;
const MONSTER_ATTACK_ANIMATION_MS = GAMEPLAY_BALANCE.mob.attackAnimationMs;
const ATTACK_LUNGE_DISTANCE = GAMEPLAY_BALANCE.combat.strike.lungeDistance;
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
const TVA_DISPATCH_ROUTES = [
  {
    levelId: "village",
    label: "Mê cung sương mù và Bến cảng",
    coordinate: "VN-1930-A / NHÁNH 01",
    relicIds: ["red-compass"],
  },
  {
    levelId: "archive",
    label: "Ngôi nhà ba gian",
    coordinate: "VN-1930-B / NHÁNH 02",
    relicIds: ["unified-emblem"],
  },
  {
    levelId: "crossroads",
    label: "Quảng trường và Vĩ tuyến 17",
    coordinate: "VN-1945-1975 / NHÁNH 03",
    relicIds: ["vietminh-thread", "healed-map"],
  },
  {
    levelId: "spring",
    label: "Thung lũng Đổi Mới",
    coordinate: "VN-1986 / NHÁNH 04",
    relicIds: ["doi-moi-gear"],
  },
];
const TVA_ACTOR_SCALE = 1.85;
const TVA_ACTOR_SCALE_COMPACT = 1.5;
function configureOpeningCopy() {
  buildVersionLabel.textContent = `Phiên bản ${BUILD_VERSION}`;
  startQuestion.textContent = "HỒ SƠ THẤT LẠC NGOÀI DÒNG THỜI GIAN";
  startCopy.textContent =
    "Một cú rơi ngoài dự kiến đưa bạn vào văn phòng hành chính vô tận, nơi mọi biến động lịch sử đều bị biến thành hồ sơ và những ca tăng giờ không có điểm kết thúc.";
  startControls.textContent = "WASD di chuyển • E tương tác • J tấn công • K phản đòn • B mở sách";

  const objectiveLabels = [
    "Tìm hiểu văn phòng kỳ lạ",
    "Đi theo hành lang hồ sơ",
    "Nói chuyện với người nhân viên đang OT",
  ];

  startObjectiveItems.forEach((item, index) => {
    item.textContent = objectiveLabels[index] ?? "";
  });

  openingKicker.textContent = "SỰ CỐ DỊCH CHUYỂN";
  openingHint.textContent = "Tiếp tục câu chuyện";
}

const keys = new Set();
const assetManager = createAssetManager({});
const playerSprites = loadPlayerSprites();
const npcSprites = loadVillageNpcSprites();
const environmentSprites = loadEnvironmentSprites();
const effectSprites = loadEffectSprites();
const monsterSprites = loadMonsterSprites();
const uiSounds = loadUiSounds();
const combatSfx = loadCombatSfx();
const ambienceSounds = loadAmbienceSounds();
const musicSounds = loadMusicSounds();
let storyToastTimeoutId = 0;
let corruptionWarningTimeoutId = 0;
let relicBookOpenTimeoutId = 0;
let pendingAssetLoad = null;
let audioLoadWarningShown = false;
let debugOverlay = null;
let smoothedFps = 0;
let lastDebugTextUpdateAt = 0;
let pendingRespawnResolve = null;

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
  soundMuted: false,
  health: PLAYER_MAX_HEALTH,
  saDoa: 0,
  inventory: new Set(),
  skillCooldowns: {
    strikeReadyAt: 0,
    parryReadyAt: 0,
  },
  skillReadySoundArmed: {
    strike: false,
    parry: false,
  },
  stamina: STAMINA_MAX,
  dodgeReadyAt: 0,
  dodgeEndsAt: 0,
  parryEndsAt: 0,
  strikeChargeStartedAt: 0,
  comboStep: 0,
  comboExpiresAt: 0,
  difficulty: "normal",
  weakenedUntil: 0,
  enemyProjectiles: [],
  invulnerableUntil: 0,
  activeSkillEffect: null,
  activePlayerAnimation: null,
  pendingRespawn: null,
  endingId: null,
  endingSummary: "",
  endingCinematic: null,
  badEndingRecovery: null,
  tutorialStep: 0,
  tutorialSeen: false,
  completedZones: new Set(),
  zoneSummaryLevelId: null,
  zoneTitleChapterId: null,
  cameraShakeUntil: 0,
  cameraShakeStrength: 0,
  hitStopUntil: 0,
  combatFlashUntil: 0,
  combatImpacts: [],
  highCorruptionWarningShown: false,
  respawnLevelId: "hub",
  respawnSpawn: null,
  blockedExitIds: new Set(),
  puzzleState: {
    archiveSequence: 0,
    archiveSolved: false,
  },
  quests: createQuestState(),
  narrative: createNarrativeState(),
  zoneActorMoveStartedAt: {},
  lastTimestamp: 0,
};

const sceneController = createSceneController(state.mode);
Object.defineProperty(state, "mode", {
  configurable: false,
  enumerable: true,
  get() {
    return sceneController.current;
  },
  set(nextScene) {
    if (nextScene === sceneController.current) {
      return;
    }

    if (!sceneController.transition(nextScene)) {
      throw new Error(`Invalid scene transition: ${sceneController.current} -> ${nextScene}`);
    }
  },
});

const player = createPlayer();
const camera = { x: 0, y: 0, zoom: 1 };
const levels = createLevelDefinitions({
  world: WORLD,
  viewport: VIEWPORT,
  portMazeDoor: PORT_MAZE_DOOR,
  getState: () => state,
});

const coordinateSystem = createCoordinateSystem({
  world: WORLD,
  viewport: VIEWPORT,
  getCamera: () => camera,
  getRenderOffset: getCameraShakeOffset,
});

const saveSystem = createSaveSystem({
  storage: {
    getItem: (...args) => localStorage.getItem(...args),
    setItem: (...args) => localStorage.setItem(...args),
    removeItem: (...args) => localStorage.removeItem(...args),
  },
  saveKey: SAVE_STORAGE_KEY,
  version: SAVE_VERSION,
  getState: () => state,
  getLevels: () => levels,
  getPlayer: () => player,
  cloneSpawnPoint,
  clamp,
});

const audioSystem = createAudioSystem({
  state,
  uiSounds,
  sfxSounds: combatSfx,
  ambienceSounds,
  musicSounds,
  getZoneProfile,
  getCurrentLevel: currentLevel,
  getPlayer: () => player,
});

const frameLoop = createRuntimeLoop({
  onFrame: frame,
});

const pageLifecycle = createPageLifecycleController({
  clearInput: clearPressedKeys,
  suspendRuntime: () => frameLoop.suspend(),
  resumeRuntime: () => frameLoop.resume(),
  suspendAudio: () => audioSystem.suspend(),
  resumeAudio: () => audioSystem.resume(),
});

const miniMapRenderer = createMiniMapRenderer({
  minimap,
  minimapCanvas,
  minimapCtx,
  world: WORLD,
  viewport: VIEWPORT,
  getState: () => state,
  getCurrentLevel: currentLevel,
  getExitCenter,
  getInteractionPoint,
  shouldDrawInteractable,
  isMonsterActive,
  getNavigationObjective,
  getCamera: () => camera,
  getVisibleWorldRect: () => coordinateSystem.getVisibleWorldRect(),
  getPlayer: () => player,
});

function getZoneProfile(levelId = state.currentLevelId) {
  return Object.values(ZONE_PROFILES).find((profile) => profile.levelId === levelId) ?? null;
}

function getZonePresentation(levelId) {
  if (!getZoneProfile(levelId)) {
    return "neutral";
  }

  return state.completedZones.has(levelId) ? "completed" : "active";
}

function getZonePresentationDetails(levelId = state.currentLevelId) {
  const profile = getZoneProfile(levelId);
  if (!profile) {
    return null;
  }

  return profile[getZonePresentation(levelId)];
}

function getZoneProgressStage(levelId = state.currentLevelId) {
  if (getZonePresentation(levelId) === "completed") {
    return 3;
  }

  switch (levelId) {
    case "village":
      return state.quests.zone1Delivered.size;
    case "archive":
      return state.quests.zone2Fragments.size;
    case "crossroads":
      return Math.min(3, Math.floor((state.quests.zone3Recruits.size + state.quests.zone3HamletsFreed.size) / 2));
    case "spring":
      return Math.min(3, Math.floor((state.quests.zone4Barriers.size + state.quests.zone4Farmers.size) / 2));
    default:
      return 0;
  }
}

function getZoneNpcDisplay(npc) {
  const profile = getZoneProfile();
  if (!profile || getZonePresentation() !== "completed" || npc.id !== profile.npcId) {
    return npc;
  }

  return {
    ...npc,
    x: npc.x + profile.npcOffset.x,
    y: npc.y + profile.npcOffset.y,
    animation: "walk",
    frameOffset: 0.35,
  };
}

function startZoneNpcMove(npcId) {
  state.zoneActorMoveStartedAt[npcId] = state.lastTimestamp;
}

function getZoneRecoveryNpcDisplay(npc) {
  const profile = getZoneProfile();
  if (!profile?.progress) {
    return npc;
  }

  let destination = null;
  let recovered = false;

  if (npc.interactionType === "deliverPaper" && state.quests.zone1Delivered.has(npc.workerId)) {
    destination = profile.progress.workerPositions?.[npc.id] ?? null;
    recovered = Boolean(destination);
  } else if (npc.interactionType === "collectFragment" && state.quests.zone2Fragments.has(npc.fragmentId)) {
    destination = profile.progress.delegatePositions?.[npc.id] ?? null;
    recovered = Boolean(destination);
  } else if (npc.interactionType === "recruit" && state.quests.zone3Recruits.has(npc.recruitId)) {
    destination = profile.progress.crowdPositions?.[npc.id] ?? null;
    recovered = Boolean(destination);
  } else if (npc.interactionType === "deliverKhoan10" && state.quests.zone4Farmers.has(npc.farmerId)) {
    destination = profile.progress.farmerPositions?.[npc.id] ?? null;
    recovered = Boolean(destination);
  }

  if (!recovered || !destination) {
    return npc;
  }

  const startedAt = state.zoneActorMoveStartedAt[npc.id];
  const progress = Number.isFinite(startedAt) ? clamp((state.lastTimestamp - startedAt) / 1250, 0, 1) : 1;
  const eased = 1 - (1 - progress) * (1 - progress);
  const dx = destination.x - npc.x;
  const dy = destination.y - npc.y;

  return {
    ...npc,
    x: npc.x + dx * eased,
    y: npc.y + dy * eased,
    direction: getDirectionFromVector(dx, dy),
    animation: progress < 1 ? "walk" : "idle",
    frameOffset: Math.abs(dx) + Math.abs(dy),
  };
}

function ensureBosses() {
  for (const [levelId, definition] of Object.entries(BOSS_DEFINITIONS)) {
    const level = levels[levelId];
    if (!level) {
      continue;
    }

    level.monsters ??= [];
    const existingBoss = level.monsters.find((monster) => monster.id === definition.id);
    if (existingBoss) {
      Object.assign(existingBoss, definition, {
        isBoss: true,
        maxHealth: Math.max(existingBoss.maxHealth, definition.maxHealth ?? 12),
        damage: Math.max(existingBoss.damage, definition.damage ?? 2),
      });
      continue;
    }

    level.monsters.push({
      ...definition,
      width: 32,
      height: 32,
      maxHealth: definition.maxHealth ?? 12,
      damage: definition.damage ?? 2,
      aggroRadius: 150,
      patrolRadius: 22,
      isBoss: true,
    });
  }
}

ensureBosses();

function ensureCombatRoster() {
  for (const [levelId, roster] of Object.entries(COMBAT_ROSTER)) {
    const level = levels[levelId];
    level.monsters ??= [];
    roster.forEach((entry, index) => {
      if (level.monsters.some((monster) => monster.id === entry.id)) {
        return;
      }
      level.monsters.push({
        ...entry,
        spawnRank: index + 1,
        width: entry.archetype === "support" ? 20 : 24,
        height: 28,
        maxHealth: entry.elite ? 7 : 5,
        damage: entry.elite ? 2 : 1,
        aggroRadius: entry.archetype === "ranged" ? 190 : 138,
        patrolRadius: 18,
      });
    });

    level.drops ??= [];
    level.traps ??= [{ id: `${levelId}-trap`, x: 470, y: 372, radius: 22, cooldownUntil: 0 }];
    level.breakables ??= [{ id: `${levelId}-crate`, x: 430, y: 446, width: 24, height: 22, health: 3, maxHealth: 3, destroyed: false }];
  }
}

function isMonsterActive(monster) {
  if (!monster.spawnRank) {
    return true;
  }
  const difficultyBonus = GAMEPLAY_BALANCE.difficulty.spawnBudgetOffset[state.difficulty] ?? 0;
  const budget = Math.max(1, (COMBAT_DENSITY[state.currentLevelId] ?? 3) + difficultyBonus);
  return monster.spawnRank <= budget;
}

ensureCombatRoster();

function serializeQuestState() {
  return saveSystem.serializeQuestState();
}

function restoreQuestState(savedQuests = {}) {
  saveSystem.restoreQuestState(savedQuests);
}

function getRuntimeSaveState() {
  return saveSystem.getRuntimeState();
}

function restoreRuntimeSaveState(runtime = {}) {
  saveSystem.restoreRuntimeState(runtime);
}

function restoreNarrativeSaveState(savedNarrative = {}) {
  saveSystem.restoreNarrativeSaveState(savedNarrative);
}

function saveGameProgress() {
  return saveSystem.save();
}

function loadSavedProgress() {
  return saveSystem.load();
}

function refreshContinueButton() {
  const hasSave = Boolean(loadSavedProgress());
  continueButton.classList.toggle("hidden", !hasSave);
  continueButton.disabled = !hasSave;
}

function clearSavedProgress() {
  saveSystem.clear();
  refreshContinueButton();
}

function setDifficulty(difficulty) {
  if (!['story', 'normal', 'challenge'].includes(difficulty)) {
    return;
  }

  state.difficulty = difficulty;
  difficultyControls.querySelectorAll('[data-difficulty]').forEach((button) => {
    button.classList.toggle('is-selected', button.dataset.difficulty === difficulty);
    button.setAttribute('aria-pressed', String(button.dataset.difficulty === difficulty));
  });
}

function continueSavedGame() {
  const saved = loadSavedProgress();
  if (!saved) {
    refreshContinueButton();
    return;
  }

  restoreQuestState(saved.quests);
  restoreNarrativeSaveState(saved.narrative);
  restoreRuntimeSaveState(saved.runtime);
  state.inventory = new Set(saved.inventory ?? []);
  state.unlockedStoryIds = new Set(saved.unlockedStoryIds ?? []);
  state.completedZones = new Set(saved.completedZones ?? []);
  setDifficulty(saved.difficulty ?? "normal");
  state.tutorialSeen = Boolean(saved.tutorialSeen);
  state.health = clamp(Number(saved.health) || PLAYER_MAX_HEALTH, 1, PLAYER_MAX_HEALTH);
  state.stamina = clamp(Number(saved.stamina) || STAMINA_MAX, 0, STAMINA_MAX);
  state.saDoa = clamp(Number(saved.saDoa) || 0, 0, SA_DOA_MAX);
  state.respawnLevelId = levels[saved.respawnLevelId] ? saved.respawnLevelId : saved.currentLevelId;
  state.respawnSpawn = cloneSpawnPoint(saved.respawnSpawn ?? levels[state.respawnLevelId].spawn);
  state.mode = "playing";
  startScreen.classList.add("hidden");
  startScreen.setAttribute("aria-hidden", "true");
  hideOpeningIntro();
  hideTutorial();
  loadLevel(saved.currentLevelId, saved.player, { updateRespawnCheckpoint: false, save: false });
  showStoryToast("Đã khôi phục hành trình từ điểm lưu gần nhất.");
  syncAmbienceAudio();
}

function showTutorial() {
  if (state.tutorialSeen) {
    return;
  }

  state.tutorialStep = 0;
  state.mode = "tutorial";
  tutorialCopy.textContent = "Di chuyển bằng WASD hoặc phím mũi tên. Đi theo mũi tên vàng để tới mục tiêu.";
  tutorialNextButton.textContent = "Tiếp tục";
  tutorialOverlay.classList.remove("hidden");
  tutorialOverlay.setAttribute("aria-hidden", "false");
}

function advanceTutorial() {
  const steps = [
    "Di chuyển bằng WASD hoặc phím mũi tên. Đi theo mũi tên vàng để tới mục tiêu.",
    "Khi đứng gần nhân vật hoặc vật thể, nhấn E để tương tác. Các điểm có thể tương tác sẽ phát sáng.",
    "Nhấn J để tấn công. Khi quái lóe đỏ và sắp trúng đòn, nhấn K để phản đòn, làm choáng chúng.",
  ];

  state.tutorialStep += 1;
  if (state.tutorialStep >= steps.length) {
    state.tutorialSeen = true;
    hideTutorial();
    state.mode = "playing";
    saveGameProgress();
    return;
  }

  tutorialCopy.textContent = steps[state.tutorialStep];
  tutorialNextButton.textContent = state.tutorialStep === steps.length - 1 ? "Vào hành trình" : "Tiếp tục";
}

function hideTutorial() {
  tutorialOverlay.classList.add("hidden");
  tutorialOverlay.setAttribute("aria-hidden", "true");
}

function showZoneSummary(levelId, relicId) {
  const level = levels[levelId];
  if (!level || state.completedZones.has(levelId)) {
    return;
  }

  state.completedZones.add(levelId);
  state.zoneSummaryLevelId = levelId;
  state.mode = "summary";
  zoneSummaryTitle.textContent = `${level.label} đã được bảo toàn`;
  zoneSummaryCopy.textContent = `Bạn đã giành lại ${RELIC_DEFINITIONS[relicId]?.label ?? "một tín vật"} và mở thêm một chương lịch sử.`;
  zoneSummaryStats.textContent = `Tín vật ${state.inventory.size}/${RELIC_TARGET_COUNT} • Tha hóa ${state.saDoa}% • Điểm lưu đã cập nhật`;
  zoneSummaryOverlay.classList.remove("hidden");
  zoneSummaryOverlay.setAttribute("aria-hidden", "false");
  saveGameProgress();
}

function closeZoneSummary() {
  zoneSummaryOverlay.classList.add("hidden");
  zoneSummaryOverlay.setAttribute("aria-hidden", "true");
  state.zoneSummaryLevelId = null;
  state.mode = "playing";
  updateInteractionPrompt();
  saveGameProgress();
}

function getNarrativeChapterForLevel(levelId) {
  return NARRATIVE_CHAPTER_DEFINITIONS.find((chapter) => chapter.levelId === levelId) ?? null;
}

function showZoneTitleCard(levelId) {
  const chapter = getNarrativeChapterForLevel(levelId);
  const seenFlag = chapter ? `chapter.${chapter.id}.titleSeen` : null;

  if (!chapter || !seenFlag || state.narrative.branchFlags[seenFlag]) {
    return false;
  }

  state.zoneTitleChapterId = chapter.id;
  state.mode = "modal";
  clearPressedKeys();
  zoneTitlePeriod.textContent = chapter.period;
  zoneTitleTitle.textContent = chapter.title;
  zoneTitleQuestion.textContent = chapter.question;
  zoneTitleSource.textContent = `Nguồn kiểm chứng: ${chapter.historicalSource.label}`;
  zoneTitleOverlay.classList.remove("hidden");
  zoneTitleOverlay.setAttribute("aria-hidden", "false");
  zoneTitleContinueButton.focus();
  return true;
}

function closeZoneTitleCard() {
  const chapterId = state.zoneTitleChapterId;
  if (chapterId) {
    state.narrative.branchFlags[`chapter.${chapterId}.titleSeen`] = true;
  }

  state.zoneTitleChapterId = null;
  zoneTitleOverlay.classList.add("hidden");
  zoneTitleOverlay.setAttribute("aria-hidden", "true");
  state.mode = "playing";
  updateInteractionPrompt();
  saveGameProgress();
}
const storyRegistry = createStoryRegistry(levels);
initializeLevelRuntime();
configureOpeningCopy();
updateProgressHud();

startButton.addEventListener("click", withUiClickSound(startGame));
continueButton.addEventListener("click", withUiClickSound(continueSavedGame));
pauseButton.addEventListener("click", withUiClickSound(togglePause));
soundButton.addEventListener("click", toggleSound);
fullscreenButton.addEventListener("click", withUiClickSound(toggleFullscreen));
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
dialogueChoiceList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-dialogue-choice]");

  if (button) {
    playUiSound(uiSounds.pixelClick);
    resolveDialogueChoice(button.dataset.dialogueChoice);
  }
});
openingNextButton.addEventListener("click", withUiClickSound(advanceOpeningIntro));
storyPrevButton.addEventListener("click", withUiClickSound(() => showStoryBookEntry(-1)));
storyNextButton.addEventListener("click", withUiClickSound(() => showStoryBookEntry(1)));
returnStartButton.addEventListener("click", withUiClickSound(handleReturnFromEnding));
tutorialNextButton.addEventListener("click", withUiClickSound(advanceTutorial));
zoneSummaryCloseButton.addEventListener("click", withUiClickSound(closeZoneSummary));
zoneTitleContinueButton.addEventListener("click", withUiClickSound(closeZoneTitleCard));
assetRetryButton.addEventListener("click", withUiClickSound(retryPendingAssetLoad));
assetReturnButton.addEventListener("click", withUiClickSound(returnFromAssetFailure));
difficultyControls.addEventListener("click", (event) => {
  const button = event.target.closest("[data-difficulty]");
  if (button) {
    setDifficulty(button.dataset.difficulty);
  }
});
document.addEventListener("fullscreenchange", updateFullscreenButton);
updateFullscreenButton();
updateSoundButton();
refreshContinueButton();

assetManager.subscribe((event) => {
  if (event.type === "failed" && event.entry.type === "audio" && !audioLoadWarningShown) {
    audioLoadWarningShown = true;
    showStoryToast("Âm thanh chưa sẵn sàng. Nhấn nút âm thanh để thử lại.");
  }

  if (event.type === "loaded" && event.entry.type === "audio" && !assetManager.getFailedEntries({ type: "audio" }).length) {
    audioLoadWarningShown = false;
  }

  updateSoundButton();
});

function toggleFullscreen() {
  if (!gameShell || !document.fullscreenEnabled) {
    return;
  }

  const fullscreenAction = document.fullscreenElement === gameShell
    ? document.exitFullscreen()
    : gameShell.requestFullscreen();

  fullscreenAction?.catch(() => updateFullscreenButton());
}

function updateFullscreenButton() {
  if (!fullscreenButton) {
    return;
  }

  const isFullscreen = document.fullscreenElement === gameShell;
  fullscreenButton.setAttribute("aria-pressed", String(isFullscreen));
  fullscreenButton.setAttribute("aria-label", isFullscreen ? "Thoát toàn màn hình" : "Mở toàn màn hình");
  fullscreenButton.title = isFullscreen ? "Thoát toàn màn hình" : "Mở toàn màn hình";
  fullscreenButton.textContent = isFullscreen ? "×" : "⛶";
}

function toggleSound() {
  audioSystem.setMuted(!state.soundMuted);

  updateSoundButton();

  if (!state.soundMuted) {
    playUiSound(uiSounds.pixelClick);
    void retryFailedAudioAssets();
  }
}

function updateSoundButton() {
  if (!soundButton) {
    return;
  }

  const soundEnabled = !state.soundMuted;
  const audioHasFailed = assetManager.getFailedEntries({ type: "audio" }).length > 0;
  soundButton.setAttribute("aria-pressed", String(soundEnabled));
  soundButton.classList.toggle("has-load-warning", audioHasFailed);
  soundButton.setAttribute("aria-label", soundEnabled ? "Tắt âm thanh" : "Bật âm thanh");
  soundButton.title = soundEnabled ? "Tắt âm thanh" : "Bật âm thanh";
  soundButton.textContent = soundEnabled ? "♫" : "×";
}

async function retryFailedAudioAssets() {
  const failedGroups = [...new Set(assetManager.getFailedEntries({ type: "audio" }).map((entry) => entry.group))];
  if (!failedGroups.length) {
    return true;
  }

  await Promise.all(failedGroups.map((groupId) => assetManager.retryGroup(groupId)));
  syncAmbienceAudio();
  updateSoundButton();
  return assetManager.getFailedEntries({ type: "audio" }).length === 0;
}

function clearPressedKeys() {
  keys.clear();
  player.isMoving = false;
}

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

  if (state.mode === "dialogue") {
    const choices = getPendingDialogueChoices();

    if (choices.length > 0) {
      const choiceIndex = key === "1" ? 0 : key === "2" ? 1 : -1;

      if (choiceIndex >= 0 && choices[choiceIndex]) {
        playUiSound(uiSounds.pixelClick);
        resolveDialogueChoice(choices[choiceIndex].id);
      }
      return;
    }

    if (key === "enter" || key === "e" || key === "space") {
      playUiSound(uiSounds.pixelClick);
      advanceDialogue();
    }
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

  if (state.mode === "playing" && key === "l") {
    useDodge();
    return;
  }

  if (state.mode === "playing" && key === "j") {
    startStrikeCharge();
    return;
  }

  if (state.mode === "playing" && key === "k") {
    useParrySkill();
    return;
  }

  if (state.mode === "playing" && (key === "e" || key === "space")) {
    handleInteraction();
    return;
  }

  keys.add(key);
});

window.addEventListener("keyup", (event) => {
  const key = normalizeKey(event.key);
  keys.delete(key);

  if (state.mode === "playing" && key === "j") {
    releaseStrikeCharge();
  }
});

void bootGame();

async function bootGame() {
  showAssetLoading("Đang chuẩn bị văn phòng", "Đang tải hành lang hồ sơ và các thiết bị điều phối dòng thời gian.");
  const core = await assetManager.loadGroup("core");
  const hub = await assetManager.loadGroup("hub");

  if (!core.ready || !hub.ready) {
    pendingAssetLoad = {
      groupId: !core.ready ? "core" : "hub",
      levelId: "hub",
      spawnOverride: null,
      options: { assetsReady: true },
      previousMode: "start",
    };
    showAssetLoading("Không thể chuẩn bị hành trình", "Một asset bắt buộc chưa tải được. Hãy kiểm tra kết nối rồi thử lại.", true);
    return;
  }

  hideAssetLoading();
  loadLevel("hub", undefined, { assetsReady: true });
  applyDebugLevelFromUrl();
  applyDebugEndingFromUrl();
  installDebugTools();
  frameLoop.start();
  pageLifecycle.install();
  preloadNextZoneAssets();
}

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
    attack1: loadDirectionalSprites("attack1"),
    attack2: loadDirectionalSprites("attack2"),
    parry: loadDirectionalSprites("parry"),
    dash: loadDirectionalSprites("dash"),
    heal: loadDirectionalSprites("heal"),
    hurt: loadDirectionalSprites("hurt"),
    death: loadDirectionalSprites("death"),
  };
}

function loadVillageNpcSprites() {
  return {
    tvaEmployee: loadTvaEmployeeSpriteSet(),
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
      colonialHarbor: loadSprite("assets/environment/generated-worlds/colonial-harbor-hero.webp"),
      archiveInterior: loadSprite("assets/environment/generated-worlds/archive-interior-hero.webp"),
      revolutionSquare: loadSprite("assets/environment/generated-worlds/revolution-square-hero.webp"),
      factoryValley: loadSprite("assets/environment/generated-worlds/factory-valley-hero.webp"),
      historyHub: loadSprite("assets/environment/generated-worlds/history-hub-hero.webp"),
      tvaOffice: loadSprite("assets/environment/generated-worlds/tva-office-hub.webp"),
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
    landmarks: {
      stormShelterBeacon: loadSprite("assets/landmarks/storm-shelter-beacon.png"),
      archiveLensTower: loadSprite("assets/landmarks/archive-lens-tower.png"),
      factionStandard: loadSprite("assets/landmarks/faction-standard.png"),
      restorationEngine: loadSprite("assets/landmarks/restoration-engine.png"),
    },
    landmarkAnimationFrames: {
      stormShelterBeacon: [
        loadSprite("assets/landmarks/frames/storm-shelter-beacon/01.png"),
        loadSprite("assets/landmarks/frames/storm-shelter-beacon/02.png"),
        loadSprite("assets/landmarks/frames/storm-shelter-beacon/03.png"),
        loadSprite("assets/landmarks/frames/storm-shelter-beacon/04.png"),
      ],
      archiveLensTower: [
        loadSprite("assets/landmarks/frames/archive-lens-tower/01.png"),
        loadSprite("assets/landmarks/frames/archive-lens-tower/02.png"),
        loadSprite("assets/landmarks/frames/archive-lens-tower/03.png"),
        loadSprite("assets/landmarks/frames/archive-lens-tower/04.png"),
      ],
      factionStandard: [
        loadSprite("assets/landmarks/frames/faction-standard/01.png"),
        loadSprite("assets/landmarks/frames/faction-standard/02.png"),
        loadSprite("assets/landmarks/frames/faction-standard/03.png"),
        loadSprite("assets/landmarks/frames/faction-standard/04.png"),
      ],
      restorationEngine: [
        loadSprite("assets/landmarks/frames/restoration-engine/01.png"),
        loadSprite("assets/landmarks/frames/restoration-engine/02.png"),
        loadSprite("assets/landmarks/frames/restoration-engine/03.png"),
        loadSprite("assets/landmarks/frames/restoration-engine/04.png"),
      ],
    },
    recovery: {
      doiMoiIrrigationStation: loadSprite("assets/recovery/doi-moi-irrigation-station.png"),
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
    ...loadDedicatedMonsterSprites(),
    zone1Captain: {
      south: {
        idle: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-south-idle.png"),
        run: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-south-walk.png"),
        attack: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-south-attack.png"),
        hurt: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-south-hurt.png"),
        death: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-south-death.png"),
      },
      north: {
        idle: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-north-idle.png"),
        run: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-north-walk.png"),
        attack: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-north-attack.png"),
        hurt: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-north-hurt.png"),
        death: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-north-death.png"),
      },
      east: {
        idle: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-east-idle.png"),
        run: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-east-walk.png"),
        attack: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-east-attack.png"),
        hurt: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-east-hurt.png"),
        death: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-east-death.png"),
      },
      west: {
        idle: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-east-idle.png"),
        run: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-east-walk.png"),
        attack: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-east-attack.png"),
        hurt: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-east-hurt.png"),
        death: loadSprite("assets/monsters/zone1-enforcer-captain/enforcer-captain-east-death.png"),
      },
    },
    zone1Raider: {
      south: loadZone1DirectionalSprites("assets/monsters/zone1-night-raider/night-raider"),
      north: loadZone1DirectionalSprites("assets/monsters/zone1-night-raider/night-raider", "north"),
      east: loadZone1DirectionalSprites("assets/monsters/zone1-night-raider/night-raider", "east"),
      west: loadZone1DirectionalSprites("assets/monsters/zone1-night-raider/night-raider", "east"),
    },
    zone1Rifleman: {
      south: loadZone1DirectionalSprites("assets/monsters/zone1-colonial-soldier/colonial-patrol"),
      north: loadZone1DirectionalSprites("assets/monsters/zone1-colonial-soldier/colonial-patrol", "north"),
      east: loadZone1DirectionalSprites("assets/monsters/zone1-colonial-soldier/colonial-patrol", "east"),
      west: loadZone1DirectionalSprites("assets/monsters/zone1-colonial-soldier/colonial-patrol", "east"),
    },
    zone1Signalman: {
      south: loadZone1DirectionalSprites("assets/monsters/zone1-signalman/signalman"),
      north: loadZone1DirectionalSprites("assets/monsters/zone1-signalman/signalman", "north"),
      east: loadZone1DirectionalSprites("assets/monsters/zone1-signalman/signalman", "east"),
      west: loadZone1DirectionalSprites("assets/monsters/zone1-signalman/signalman", "east"),
    },
    frenchColonialSoldier: {
      east: {
        idle: loadSprite("assets/enemies/french-colonial-soldier/idle-right.png"),
        run: loadSprite("assets/enemies/french-colonial-soldier/walk-right.png"),
        attack: loadSprite("assets/enemies/french-colonial-soldier/attack-right.png"),
      },
      west: {
        idle: loadSprite("assets/enemies/french-colonial-soldier/idle-left.png"),
        run: loadSprite("assets/enemies/french-colonial-soldier/walk-left.png"),
        attack: loadSprite("assets/enemies/french-colonial-soldier/attack-left.png"),
      },
    },
    rifleman: {
      south: {
        idle: loadSprite("assets/monsters/military-soldier/soldier-idle.png"),
        run: loadSprite("assets/monsters/military-soldier/soldier-walk-down.png"),
      },
      north: {
        idle: loadSprite("assets/monsters/military-soldier/soldier-idle.png"),
        run: loadSprite("assets/monsters/military-soldier/soldier-walk-up.png"),
      },
      west: {
        idle: loadSprite("assets/monsters/military-soldier/soldier-idle.png"),
        run: loadSprite("assets/monsters/military-soldier/soldier-walk-left.png"),
      },
      east: {
        idle: loadSprite("assets/monsters/military-soldier/soldier-idle.png"),
        run: loadSprite("assets/monsters/military-soldier/soldier-walk-right.png"),
      },
    },
    pixellabRaider: {
      south: loadSprite("assets/monsters/pixellab/shadow-raider-south.png"),
      east: loadSprite("assets/monsters/pixellab/shadow-raider-east.png"),
      north: loadSprite("assets/monsters/pixellab/shadow-raider-north.png"),
      west: loadSprite("assets/monsters/pixellab/shadow-raider-west.png"),
    },
    pixellabChanter: {
      south: loadSprite("assets/monsters/pixellab/corrupted-chanter-south.png"),
      east: loadSprite("assets/monsters/pixellab/corrupted-chanter-east.png"),
      north: loadSprite("assets/monsters/pixellab/corrupted-chanter-north.png"),
      west: loadSprite("assets/monsters/pixellab/corrupted-chanter-west.png"),
    },
    pixellabWarden: {
      south: loadSprite("assets/monsters/pixellab/corrupted-warden-south.png"),
      east: loadSprite("assets/monsters/pixellab/corrupted-warden-east.png"),
      north: loadSprite("assets/monsters/pixellab/corrupted-warden-north.png"),
      west: loadSprite("assets/monsters/pixellab/corrupted-warden-west.png"),
    },
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

function loadDedicatedMonsterSprites() {
  const directions = ["south", "north", "east", "west"];
  return Object.fromEntries(
    Object.entries(MONSTER_ART_DEFINITIONS).map(([artKey, definition]) => [
      artKey,
      Object.fromEntries(
        directions.map((direction) => [
          direction,
          Object.fromEntries(
            Object.keys(definition.animations).map((animationState) => [
              animationState,
              loadSprite(getMonsterStripSource(artKey, direction, animationState)),
            ]),
          ),
        ]),
      ),
    ]),
  );
}

function loadZone1DirectionalSprites(prefix, direction = "south") {
  return {
    idle: loadSprite(`${prefix}-${direction}-idle.png`),
    run: loadSprite(`${prefix}-${direction}-walk.png`),
    attack: loadSprite(`${prefix}-${direction}-attack.png`),
    hurt: loadSprite(`${prefix}-${direction}-hurt.png`),
    death: loadSprite(`${prefix}-${direction}-death.png`),
  };
}

function loadEffectSprites() {
  return {
    m90ResetActivate: loadSprite("assets/time-archive/characters/agent-m90/actions/reset-activate/reset-activate.png"),
    m90ResetWave: loadSprite("assets/time-archive/effects/reset-wave-sheet.png"),
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
    attack1: loadSound("assets/audio/sfx/player-attack1.mp3", 0.34),
    attack2: loadSound("assets/audio/sfx/player-attack2.mp3", 0.32),
    parry: loadSound("assets/audio/sfx/player-parry.mp3", 0.38),
    dash: loadSound("assets/audio/sfx/player-dash.wav", 0.22),
    heal: loadSound("assets/audio/sfx/player-heal.wav", 0.24),
    hurt: loadSound("assets/audio/sfx/player-hurt.wav", 0.2),
    death: loadSound("assets/audio/sfx/player-death.wav", 0.28),
  };
}

function loadCombatSfx() {
  return {
    strikeSwing: loadSound(COMBAT_SFX.strikeSwing, 0.52),
    batonHit: loadSound(COMBAT_SFX.batonHit, 0.36),
    rifleShot: loadSound(COMBAT_SFX.rifleShot, 0.34),
    lanternPulse: loadSound(COMBAT_SFX.lanternPulse, 0.26),
    captainCommand: loadSound(COMBAT_SFX.captainCommand, 0.32),
    captainSlam: loadSound(COMBAT_SFX.captainSlam, 0.38),
    hurt: loadSound(COMBAT_SFX.hurt, 0.25),
    playerHurt: loadSound(COMBAT_SFX.playerHurt, 0.62),
    death: loadSound(COMBAT_SFX.death, 0.3),
    parry: loadSound(COMBAT_SFX.parry, 0.34),
  };
}

function loadAmbienceSounds() {
  return {
    rain: loadSound(AUDIO_TRACKS.rain, 0.18, { loop: true }),
    fireplace: loadSound(AUDIO_TRACKS.fireplace, 0.14, { loop: true }),
  };
}

function loadMusicSounds() {
  return {
    hub: loadSound(AUDIO_TRACKS.hub, 0.24, { loop: true }),
    portMaze: loadSound(AUDIO_TRACKS.portMaze, 0.24, { loop: true }),
    archive: loadSound(AUDIO_TRACKS.archive, 0.26, { loop: true }),
    crossroads: loadSound(AUDIO_TRACKS.crossroads, 0.22, { loop: true }),
    spring: loadSound(AUDIO_TRACKS.spring, 0.26, { loop: true }),
    badEnding: loadSound(AUDIO_TRACKS.badEnding, 0.28, { loop: true }),
    goodEnding: loadSound(AUDIO_TRACKS.goodEnding, 0.3, { loop: true }),
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

function loadTvaEmployeeSpriteSet() {
  const basePath = "assets/npcs/tva-employee";
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
  const group = getAssetGroupForSource(src);
  const entry = assetManager.register({
    key: `image:${src}`,
    type: "image",
    src: withAssetVersion(src),
    group,
    critical: isCriticalAsset(src, group),
    handle: image,
  });
  return entry.handle ?? image;
}

function loadSound(src, volume = 1, options = {}) {
  const sound = new Audio();
  const sources = getAudioSourceCandidates(src);
  const selectedSource = resolveAudioSource(sources, sound);
  sound.preload = "auto";
  sound.volume = volume;
  sound.loop = Boolean(options.loop);
  const entry = assetManager.register({
    key: `audio:${src}`,
    type: "audio",
    src: withAssetVersion(selectedSource.src),
    sources: sources.map((source) => ({ ...source, src: withAssetVersion(source.src) })),
    group: getAssetGroupForSource(selectedSource.src),
    critical: false,
    handle: sound,
    volume,
    loop: Boolean(options.loop),
  });
  return entry.handle ?? sound;
}

function playUiSound(sound) {
  audioSystem.playUiSound(sound);
}

function playCombatSfx(key, options) {
  audioSystem.playSfx(key, options);
}

function withUiClickSound(action) {
  return audioSystem.withUiClickSound(action);
}

function resetSound(sound) {
  audioSystem.resetSound(sound);
}

function resetMusicForNewSession() {
  audioSystem.resetMusicForNewSession();
}

function syncAmbienceAudio() {
  audioSystem.syncAmbienceAudio();
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

function getNpcSpriteConfig(actor) {
  return actor.spriteKey === "tvaEmployee" ? TVA_EMPLOYEE_SPRITE : NPC_SPRITE;
}

function getNpcFrameAt(actor, timestamp = state.lastTimestamp) {
  const spriteConfig = getNpcSpriteConfig(actor);
  const animation = actor.animation === "walk" ? "walk" : "idle";
  const frameCount = animation === "walk"
    ? actor.walkFrameCount ?? spriteConfig.walkFrames
    : actor.idleFrameCount ?? spriteConfig.idleFrames;
  const duration =
    animation === "walk" ? spriteConfig.walkFrameDuration : spriteConfig.idleFrameDuration;
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
  const spriteConfig = getNpcSpriteConfig(actor);

  if (!canDrawSprite(sheet)) {
    return false;
  }

  const frame = getNpcFrameAt(actor, timestamp);
  const scale = actor.scale ?? 1;
  const sourceY = frame.animation === "walk" ? spriteConfig.frameHeight : 0;
  const sourceX = frame.index * spriteConfig.frameWidth + spriteConfig.cropX;
  const drawWidth = Math.max(1, Math.round(spriteConfig.drawWidth * scale));
  const drawHeight = Math.max(1, Math.round(spriteConfig.drawHeight * scale));

  context.save();
  context.imageSmoothingEnabled = spriteConfig.smoothing ?? false;
  if (spriteConfig.smoothing) {
    context.imageSmoothingQuality = "high";
  }
  context.globalAlpha = actor.opacity ?? 1;
  context.translate(Math.round(actor.x), Math.round(actor.y));
  context.scale(direction.flipX ? -1 : 1, 1);
  context.drawImage(
    sheet,
    sourceX,
    sourceY + spriteConfig.cropY,
    spriteConfig.cropWidth,
    spriteConfig.cropHeight,
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

function getPlayerAnimationDuration(animationName) {
  const animation = PLAYER_ANIMATIONS[animationName] ?? PLAYER_ANIMATIONS.idle;
  if (animation.frameDurations) {
    return animation.frameDurations.reduce((total, duration) => total + duration, 0);
  }

  return animation.frameCount * animation.frameDuration;
}

function startPlayerAnimation(animationName, options = {}) {
  const animation = PLAYER_ANIMATIONS[animationName];
  if (!animation) {
    return false;
  }

  if (state.activePlayerAnimation?.name === "death" && animationName !== "death") {
    return false;
  }

  const startedAt = options.startedAt ?? state.lastTimestamp;
  state.activePlayerAnimation = {
    name: animationName,
    direction: options.direction ?? player.direction,
    startedAt,
    endsAt: startedAt + getPlayerAnimationDuration(animationName),
  };
  return true;
}

function getPlayerAnimationFrame() {
  const active = state.activePlayerAnimation;
  const animationName = active?.name ?? (player.isMoving ? "run" : "idle");
  const animation = PLAYER_ANIMATIONS[animationName] ?? PLAYER_ANIMATIONS.idle;
  const direction = active?.direction ?? player.direction;

  if (!active) {
    const frameIndex = player.isMoving
      ? Math.floor(player.walkTime) % animation.frameCount
      : Math.floor(state.lastTimestamp / animation.frameDuration) % animation.frameCount;
    return { animationName, animation, direction, frameIndex };
  }

  let elapsed = Math.max(0, state.lastTimestamp - active.startedAt);
  if (animation.frameDurations) {
    let frameIndex = animation.frameCount - 1;
    let cursor = 0;
    for (let index = 0; index < animation.frameDurations.length; index += 1) {
      cursor += animation.frameDurations[index];
      if (elapsed < cursor) {
        frameIndex = index;
        break;
      }
    }
    return { animationName, animation, direction, frameIndex };
  }

  return {
    animationName,
    animation,
    direction,
    frameIndex: Math.min(animation.frameCount - 1, Math.floor(elapsed / animation.frameDuration)),
  };
}

function getActivePlayerAnimationName() {
  return getPlayerAnimationFrame().animationName;
}

function updatePlayerAnimation() {
  const active = state.activePlayerAnimation;
  if (active && state.lastTimestamp >= active.endsAt) {
    const completedName = active.name;
    state.activePlayerAnimation = null;
    if (completedName === "death" && state.pendingRespawn) {
      state.pendingRespawn.respawnAt ??= state.lastTimestamp + DEATH_RESPAWN_DELAY_MS;
    }
  }

  if (!state.activePlayerAnimation && state.pendingRespawn?.respawnAt && state.lastTimestamp >= state.pendingRespawn.respawnAt) {
    completePlayerRespawn();
  }
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

  for (const [itemId, slide] of Object.entries(RELIC_STORY_SLIDES)) {
    const relic = RELIC_DEFINITIONS[itemId];

    if (!relic?.storyId) {
      continue;
    }

    registry[relic.storyId] = {
      id: relic.storyId,
      itemId,
      ...slide,
    };
  }

  return registry;
}

function initializeLevelRuntime() {
  const difficulty = getDifficultySettings(state.difficulty);
  for (const level of Object.values(levels)) {
    level.drops = [];
    for (const trap of level.traps ?? []) {
      trap.cooldownUntil = 0;
    }
    for (const breakable of level.breakables ?? []) {
      breakable.health = breakable.maxHealth;
      breakable.destroyed = false;
    }
    for (const item of level.interactables ?? []) {
      item.collected = false;
      item.used = false;
      item.purified = false;
      item.activated = false;
    }

    for (const monster of level.monsters ?? []) {
      monster.homeX = monster.x;
      monster.homeY = monster.y;
      monster.runtimeMaxHealth = Math.ceil(monster.maxHealth * difficulty.enemyHealth);
      monster.health = monster.runtimeMaxHealth;
      monster.defeated = false;
      monster.hitFlashUntil = 0;
      monster.lastContactAt = 0;
      monster.attackStartedAt = 0;
      monster.attackEndsAt = 0;
      monster.attackImpactAt = 0;
      monster.telegraphStartsAt = 0;
      monster.telegraphEndsAt = 0;
      monster.attackDirection = monster.facing ?? "down";
      monster.moveDirection = monster.facing ?? "down";
      monster.horizontalFacing = monster.facing === "left" ? "left" : "right";
      monster.animationState = "idle";
      monster.facingDirection = "down";
      monster.hurtEndsAt = 0;
      monster.hurtStartedAt = 0;
      monster.deathStartedAt = 0;
      monster.deathEndsAt = 0;
      monster.attackVariant = "sweep";
      monster.attackCount = 0;
      monster.comboFollowUpAt = 0;
      monster.isComboFollowUp = false;
      monster.commandPulseAt = state.lastTimestamp + (monster.combatProfile?.commandPulse?.intervalMs ?? Infinity);
      monster.commandBuffUntil = 0;
      monster.slowedUntil = 0;
      monster.weakenedUntil = 0;
      monster.stunnedUntil = 0;
      monster.bossPhase = 0;
      monster.supportPulseUntil = 0;
      monster.phase = monster.phase ?? Math.random() * Math.PI * 2;
    }
  }
}

function cloneSpawnPoint(spawn) {
  return spawn
    ? {
        x: spawn.x,
        y: spawn.y,
        direction: spawn.direction,
      }
    : null;
}

function setRespawnCheckpoint(levelId, spawnOverride = null) {
  const fallbackLevelId = levels[levelId] ? levelId : "hub";
  const fallbackSpawn = spawnOverride ?? levels[fallbackLevelId]?.spawn ?? levels.hub.spawn;
  state.respawnLevelId = fallbackLevelId;
  state.respawnSpawn = cloneSpawnPoint(fallbackSpawn);
}

function shouldPreserveMonsterDefeatOnRespawn(monster) {
  if (monster.dropItemId && state.inventory.has(monster.dropItemId)) {
    return true;
  }

  if (monster.isBoss && monster.defeated) {
    return true;
  }

  return monster.id === "southern-tyrant" && state.quests.zone3BossDefeated;
}

function resetLevelMonstersForRespawn(levelId) {
  const level = levels[levelId];

  if (!level) {
    return;
  }

  for (const monster of level.monsters ?? []) {
    const preserveDefeat = shouldPreserveMonsterDefeatOnRespawn(monster);
    monster.x = monster.homeX;
    monster.y = monster.homeY;
    monster.health = preserveDefeat ? 0 : (monster.runtimeMaxHealth ?? monster.maxHealth);
    monster.defeated = preserveDefeat;
    monster.hitFlashUntil = 0;
    monster.lastContactAt = 0;
    monster.attackStartedAt = 0;
    monster.attackEndsAt = 0;
    monster.attackImpactAt = 0;
    monster.telegraphStartsAt = 0;
    monster.telegraphEndsAt = 0;
    monster.slowedUntil = 0;
    monster.weakenedUntil = 0;
    monster.stunnedUntil = 0;
    monster.bossPhase = 0;
    monster.attackDirection = monster.facing ?? "down";
    monster.moveDirection = monster.facing ?? "down";
    monster.horizontalFacing = monster.facing === "left" ? "left" : "right";
    monster.animationState = "idle";
    monster.facingDirection = "down";
    monster.hurtEndsAt = 0;
    monster.hurtStartedAt = 0;
    monster.deathStartedAt = 0;
    monster.deathEndsAt = 0;
    monster.attackVariant = "sweep";
    monster.attackCount = 0;
    monster.comboFollowUpAt = 0;
    monster.isComboFollowUp = false;
    monster.commandPulseAt = state.lastTimestamp + (monster.combatProfile?.commandPulse?.intervalMs ?? Infinity);
    monster.commandBuffUntil = 0;
  }
}

function resetGameplayProgress() {
  state.health = PLAYER_MAX_HEALTH;
  state.saDoa = 0;
  state.inventory.clear();
  state.skillCooldowns.strikeReadyAt = 0;
  state.skillCooldowns.parryReadyAt = 0;
  state.skillReadySoundArmed.strike = false;
  state.skillReadySoundArmed.parry = false;
  state.stamina = STAMINA_MAX;
  state.dodgeReadyAt = 0;
  state.dodgeEndsAt = 0;
  state.parryEndsAt = 0;
  state.strikeChargeStartedAt = 0;
  state.comboStep = 0;
  state.comboExpiresAt = 0;
  state.weakenedUntil = 0;
  state.enemyProjectiles = [];
  state.invulnerableUntil = 0;
  state.activeSkillEffect = null;
  state.activePlayerAnimation = null;
  state.pendingRespawn = null;
  pendingRespawnResolve = null;
  state.endingId = null;
  state.endingSummary = "";
  state.endingCinematic = null;
  state.badEndingRecovery = null;
  state.completedZones.clear();
  state.zoneSummaryLevelId = null;
  state.zoneTitleChapterId = null;
  zoneTitleOverlay.classList.add("hidden");
  zoneTitleOverlay.setAttribute("aria-hidden", "true");
  state.cameraShakeUntil = 0;
  state.cameraShakeStrength = 0;
  state.hitStopUntil = 0;
  state.combatFlashUntil = 0;
  state.combatImpacts = [];
  state.highCorruptionWarningShown = false;
  state.puzzleState.archiveSequence = 0;
  state.puzzleState.archiveSolved = false;
  state.quests = createQuestState();
  state.narrative = createNarrativeState();
  initializeLevelRuntime();
  setRespawnCheckpoint("hub");
  updateProgressHud();
}

function updateProgressHud() {
  const hpPercent = (state.health / PLAYER_MAX_HEALTH) * 100;
  const saDoaPercent = (state.saDoa / SA_DOA_MAX) * 100;

  hpFill.style.width = `${hpPercent}%`;
  hpValue.textContent = `${state.health} / ${PLAYER_MAX_HEALTH}`;
  saDoaFill.style.width = `${saDoaPercent}%`;
  saDoaValue.textContent = `${state.saDoa}%`;
  inventoryValue.textContent = `${state.inventory.size} / ${RELIC_TARGET_COUNT}`;
  updateCombatStatus();
  updateCorruptionEffects();
}

function updateCombatStatus() {
  if (!combatStatus) {
    return;
  }
  const dodgeReady = state.lastTimestamp >= state.dodgeReadyAt;
  const strikeReady = state.lastTimestamp >= state.skillCooldowns.strikeReadyAt;
  const parryReady = state.lastTimestamp >= state.skillCooldowns.parryReadyAt;
  if (state.skillReadySoundArmed.strike && strikeReady) {
    state.skillReadySoundArmed.strike = false;
    playUiSound(uiSounds.pixelClick);
  }
  if (state.skillReadySoundArmed.parry && parryReady) {
    state.skillReadySoundArmed.parry = false;
    playUiSound(uiSounds.pixelClick);
  }
  const charged = state.strikeChargeStartedAt ? " • Đang tích lực" : "";
  const parrying = state.lastTimestamp < state.parryEndsAt ? " • ĐỠ ĐÒN!" : "";
  combatStatus.textContent = `Thể lực ${Math.round(state.stamina)}/${STAMINA_MAX} • L ${dodgeReady ? "sẵn sàng" : "hồi"} • J ${strikeReady ? "sẵn sàng" : "hồi"} • K ${parryReady ? "phản đòn" : "hồi"}${charged}${parrying}`;
}

function currentLevel() {
  return levels[state.currentLevelId];
}

function shouldEnableDebugTools() {
  return new URLSearchParams(window.location.search).get("debugTools") === "1";
}

function createDebugSnapshot() {
  const playerScreen = coordinateSystem.worldToScreen(player);
  return {
    fps: smoothedFps,
    suspended: frameLoop.isSuspended(),
    mode: state.mode,
    currentLevelId: state.currentLevelId,
    respawnLevelId: state.respawnLevelId,
    endingId: state.endingId,
    badEndingRecovery: state.badEndingRecovery
      ? {
          phase: state.badEndingRecovery.phase,
          elapsed: Math.max(0, state.lastTimestamp - state.badEndingRecovery.startedAt),
        }
      : null,
    health: state.health,
    saDoa: state.saDoa,
    inventory: Array.from(state.inventory),
    narrative: {
      choices: { ...state.narrative.choices },
      branchFlags: { ...state.narrative.branchFlags },
      npcRelations: { ...state.narrative.npcRelations },
      themeScores: { ...state.narrative.themeScores },
      endingRisks: { ...state.narrative.endingRisks },
      endingsUnlocked: Array.from(state.narrative.endingsUnlocked),
      endingCandidate: resolveEnding({
        inventory: state.inventory,
        saDoa: state.saDoa,
        narrative: state.narrative,
      }),
    },
    player: {
      x: player.x,
      y: player.y,
      screenX: playerScreen.x,
      screenY: playerScreen.y,
      direction: player.direction,
      animation: getActivePlayerAnimationName(),
    },
    camera: { ...camera },
    questSummary: getZoneProgressText(state.currentLevelId),
    activeMonsterCount: (currentLevel().monsters ?? []).filter((monster) => isMonsterActive(monster)).length,
    monsters: (currentLevel().monsters ?? []).map((monster) => ({
      id: monster.id,
      artKey: getMonsterArtKey(monster),
      health: monster.health,
      defeated: monster.defeated,
      bossPhase: monster.bossPhase,
      attackCount: monster.attackCount ?? 0,
      attackVariant: monster.attackVariant,
      comboFollowUpAt: monster.comboFollowUpAt ?? 0,
    })),
    quests: {
      tvaBriefingAccepted: state.quests.tvaBriefingAccepted,
      tvaPortalTarget: state.quests.tvaPortalTarget,
      tvaReportedRelics: Array.from(state.quests.tvaReportedRelics),
      zone1Started: state.quests.zone1Started,
      zone1Delivered: Array.from(state.quests.zone1Delivered),
      zone1RewardClaimed: state.quests.zone1RewardClaimed,
      zone1SoldierDecision: state.quests.zone1SoldierDecision,
      zone2Fragments: Array.from(state.quests.zone2Fragments),
      zone2TowerActivated: state.quests.zone2TowerActivated,
      zone2RewardClaimed: state.quests.zone2RewardClaimed,
      zone3Recruits: Array.from(state.quests.zone3Recruits),
      zone3ThreadClaimed: state.quests.zone3ThreadClaimed,
      zone3HamletsFreed: Array.from(state.quests.zone3HamletsFreed),
      zone3BossDefeated: state.quests.zone3BossDefeated,
      zone3MapClaimed: state.quests.zone3MapClaimed,
      zone4Barriers: Array.from(state.quests.zone4Barriers),
      zone4Farmers: Array.from(state.quests.zone4Farmers),
      zone4GearClaimed: state.quests.zone4GearClaimed,
    },
    audio: {
      muted: state.soundMuted,
      music: Object.fromEntries(
        Object.entries(musicSounds).map(([id, sound]) => [id, {
          paused: sound.paused,
          readyState: sound.readyState,
          currentTime: Number(sound.currentTime.toFixed(2)),
        }])
      ),
    },
    combat: {
      stamina: Number(state.stamina.toFixed(1)),
      dodgeReadyAt: state.dodgeReadyAt,
      parryReadyAt: state.skillCooldowns.parryReadyAt,
      parryEndsAt: state.parryEndsAt,
      strikeChargeStartedAt: state.strikeChargeStartedAt,
      comboStep: state.comboStep,
      difficulty: state.difficulty,
      projectileCount: state.enemyProjectiles.length,
    },
  };
}

function getDebugGeometry() {
  return {
    playerFootprint: getPlayerFootprint(player.x, player.y),
    colliders: getActiveColliders(),
    exits: currentLevel().exits.filter(isExitAvailable).map((exit) => exit.kind === "rect"
      ? { x: exit.x, y: exit.y, width: exit.width, height: exit.height }
      : { x: exit.triggerX - 2, y: exit.minY, width: 4, height: exit.maxY - exit.minY }),
    interactables: currentLevel().interactables
      .filter((item) => !item.collected && !item.used && shouldDrawInteractable(item))
      .map((item) => ({ ...getInteractionPoint(item), radius: item.interactionRadius ?? INTERACTION_RADIUS })),
    monsters: (currentLevel().monsters ?? [])
      .filter((monster) => isMonsterActive(monster))
      .map((monster) => ({ x: monster.x, y: monster.y, aggroRadius: monster.aggroRadius ?? 120, isBoss: monster.isBoss })),
  };
}

function installDebugTools() {
  if (!shouldEnableDebugTools()) {
    return;
  }

  debugOverlay = createDebugOverlay({
    panel: debugOverlayPanel,
    canvas: debugCanvas,
    values: debugValues,
    ctx: debugCtx,
    viewport: VIEWPORT,
    getSnapshot: createDebugSnapshot,
    getGeometry: getDebugGeometry,
    worldRectToScreenRect: (rect) => coordinateSystem.worldRectToScreenRect(rect),
    worldToScreen: (point) => coordinateSystem.worldToScreen(point),
  });

  window.addEventListener("keydown", (event) => {
    if (normalizeKey(event.key) !== "f3") {
      return;
    }

    event.preventDefault();
    debugOverlay.toggle();
    debugOverlay.update();
  });

  window.__CROSSROADS_DEBUG__ = {
    beginSession() {
      beginGameSession();
      return createDebugSnapshot();
    },
    getSnapshot() {
      return createDebugSnapshot();
    },
    loadLevel(levelId, spawnOverride = null, options = {}) {
      loadLevel(levelId, spawnOverride, options);
      return createDebugSnapshot();
    },
    async triggerExit(exitId) {
      const exit = currentLevel().exits.find((entry) => entry.id === exitId);
      const target = getExitTarget(exit);
      if (!target) {
        return { transitioned: false, reason: "missing-exit", ...createDebugSnapshot() };
      }

      const group = await assetManager.loadGroup(getAssetGroupForLevel(target));
      if (!group.ready) {
        return { transitioned: false, reason: "assets-unavailable", ...createDebugSnapshot() };
      }

      const center = getExitCenter(exit);
      player.x = center.x;
      player.y = center.y;
      state.blockedExitIds.delete(exit.id);
      updateCamera();
      const transitioned = handleLevelTransitions();
      return { transitioned, ...createDebugSnapshot() };
    },
    setPlayerPosition(x, y) {
      player.x = clamp(x, currentLevel().bounds.minX, currentLevel().bounds.maxX);
      player.y = clamp(y, currentLevel().bounds.minY, currentLevel().bounds.maxY);
      updateCamera();
      updateInteractionPrompt();
      return createDebugSnapshot();
    },
    setSaDoa(amount) {
      state.saDoa = clamp(Math.round(amount), 0, SA_DOA_MAX);
      updateProgressHud();
      return createDebugSnapshot();
    },
    completeTvaRoute(levelId) {
      const route = getTvaRoute(levelId);
      if (!route) {
        return { completed: false, ...createDebugSnapshot() };
      }

      for (const relicId of route.relicIds) {
        state.inventory.add(relicId);
      }
      state.completedZones.add(levelId);
      state.quests.tvaPortalTarget = null;
      if (levelId === "village") state.quests.zone1RewardClaimed = true;
      if (levelId === "archive") state.quests.zone2RewardClaimed = true;
      if (levelId === "crossroads") {
        state.quests.zone3ThreadClaimed = true;
        state.quests.zone3MapClaimed = true;
      }
      if (levelId === "spring") state.quests.zone4GearClaimed = true;
      updateProgressHud();
      saveGameProgress();
      return { completed: true, ...createDebugSnapshot() };
    },
    interactById(interactableId) {
      const item = currentLevel().interactables.find((entry) => entry.id === interactableId);

      if (!item) {
        return false;
      }

      if (item.interactionType) {
        handleSystemInteraction(item);
      } else {
        startDialogue(item);
      }

      return createDebugSnapshot();
    },
    async damagePlayer(amount = PLAYER_MAX_HEALTH, sourceName = "debug") {
      await damagePlayer(amount, sourceName);
      return createDebugSnapshot();
    },
    triggerBadEnding(summary = "Nhánh thời gian thử nghiệm đã sụp đổ.") {
      triggerBadEnding(summary);
      return createDebugSnapshot();
    },
    completeEndingCinematic() {
      if (!state.endingCinematic) {
        return createDebugSnapshot();
      }

      state.endingCinematic.hasStarted = true;
      state.endingCinematic.completed = true;
      state.endingCinematic.startedAt = state.lastTimestamp - state.endingCinematic.duration;
      beginBadEndingRecovery();
      updateEndingCinematicUiState();
      return createDebugSnapshot();
    },
    setBadEndingRecoveryElapsed(elapsed) {
      beginBadEndingRecovery();
      if (state.badEndingRecovery) {
        state.badEndingRecovery.startedAt = state.lastTimestamp - Math.max(0, Number(elapsed) || 0);
        updateBadEndingRecovery();
      }
      return createDebugSnapshot();
    },
    damageMonster(monsterId, amount = 1) {
      const monster = currentLevel().monsters.find((entry) => entry.id === monsterId);
      if (!monster || monster.defeated) {
        return false;
      }
      damageMonster(monster, amount, { ignoreWeakness: true });
      return createDebugSnapshot();
    },
    saveNow() {
      return saveGameProgress();
    },
    dodge() {
      useDodge();
      return createDebugSnapshot();
    },
    parry() {
      useParrySkill();
      return createDebugSnapshot();
    },
    parryIncomingProjectile(monsterId) {
      const monster = currentLevel().monsters.find((entry) => entry.id === monsterId);
      if (!monster || monster.defeated) {
        return false;
      }

      spawnEnemyProjectile(monster);
      const projectile = state.enemyProjectiles.at(-1);
      const distance = Math.hypot(player.x - projectile.x, player.y - projectile.y) || 1;
      const targetDistance = 12;
      projectile.x = player.x - ((player.x - projectile.x) / distance) * targetDistance;
      projectile.y = player.y - ((player.y - projectile.y) / distance) * targetDistance;
      useParrySkill();
      return createDebugSnapshot();
    },
    strike(charged = false) {
      useStrikeSkill(charged);
      return createDebugSnapshot();
    },
    playPlayerAnimation(animationName) {
      startPlayerAnimation(animationName);
      return createDebugSnapshot();
    },
  };
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
      ? "Preview Good Ending được mở bằng ?debugEnding=good."
      : "Preview Bad Ending được mở bằng ?debugEnding=bad.";

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

function frame({ now: timestamp, deltaSeconds }) {
  state.lastTimestamp = timestamp;
  if (deltaSeconds > 0) {
    const instantFps = 1 / deltaSeconds;
    smoothedFps = smoothedFps === 0 ? instantFps : smoothedFps * 0.86 + instantFps * 0.14;
  }

  if (state.mode === "playing" && timestamp >= state.hitStopUntil) {
    updatePlayerAnimation();
    updatePlayer(deltaSeconds);
    updateMonsters(deltaSeconds);
    updateEnemyProjectiles(deltaSeconds);
    updateWorldDrops();
    updateLevelHazards();
    updateInteractionPrompt();
  }

  if (state.activeSkillEffect && state.lastTimestamp >= state.activeSkillEffect.endsAt) {
    state.activeSkillEffect = null;
  }

  updateProgressHud();
  render();
  renderEndingArtCinematic();
  updateBadEndingRecovery();
  renderEndingSceneOverlay();
  if (debugOverlay?.isVisible()) {
    const updateText = timestamp - lastDebugTextUpdateAt >= 250;
    debugOverlay.update({ updateText });
    if (updateText) {
      lastDebugTextUpdateAt = timestamp;
    }
  }
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
  clearScheduledRelicBookOpen();
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

function showCorruptionWarning() {
  if (!corruptionWarning) {
    return;
  }

  window.clearTimeout(corruptionWarningTimeoutId);
  corruptionWarning.classList.remove("hidden");
  corruptionWarning.setAttribute("aria-hidden", "false");
  corruptionWarning.classList.remove("is-visible");
  corruptionWarning.offsetWidth;
  corruptionWarning.classList.add("is-visible");

  corruptionWarningTimeoutId = window.setTimeout(() => {
    hideCorruptionWarning();
  }, CORRUPTION_WARNING_MS);
}

function hideCorruptionWarning() {
  if (!corruptionWarning) {
    return;
  }

  window.clearTimeout(corruptionWarningTimeoutId);
  corruptionWarningTimeoutId = 0;
  corruptionWarning.classList.remove("is-visible");
  corruptionWarning.classList.add("hidden");
  corruptionWarning.setAttribute("aria-hidden", "true");
}

function updateCorruptionEffects() {
  const shouldShowEffects =
    state.saDoa >= CORRUPTION_GLITCH_THRESHOLD &&
    state.mode !== "start" &&
    state.mode !== "opening" &&
    state.mode !== "ending";

  gameFrame?.classList.toggle("glitch-active", shouldShowEffects);

  if (!shouldShowEffects) {
    hideCorruptionWarning();

    if (state.saDoa < CORRUPTION_GLITCH_THRESHOLD) {
      state.highCorruptionWarningShown = false;
    }

    return;
  }

  if (!state.highCorruptionWarningShown) {
    state.highCorruptionWarningShown = true;
    showCorruptionWarning();
  }
}

function clearScheduledRelicBookOpen() {
  window.clearTimeout(relicBookOpenTimeoutId);
  relicBookOpenTimeoutId = 0;
}

function scheduleRelicBookOpen(storyId) {
  clearScheduledRelicBookOpen();

  relicBookOpenTimeoutId = window.setTimeout(() => {
    relicBookOpenTimeoutId = 0;

    if (state.mode !== "playing" || !state.unlockedStoryIds.has(storyId)) {
      return;
    }

    openStoryBook(storyId);
  }, RELIC_BOOK_OPEN_DELAY_MS);
}

function hideDialogue() {
  dialogueBox.classList.add("hidden");
  dialogueBox.setAttribute("aria-hidden", "true");
  dialogueBox.classList.remove("has-portrait");
  dialoguePortrait?.classList.add("hidden");
  delete dialogueBox.dataset.context;
  dialogueChoiceList.replaceChildren();
  dialogueChoiceList.classList.add("hidden");
  dialogueNextButton.classList.remove("hidden");
}

function hideOpeningIntro() {
  openingIntro.classList.add("hidden");
  openingIntro.setAttribute("aria-hidden", "true");
  delete openingIntro.dataset.stage;
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
  openingIntro.dataset.stage = entry.stage ?? "orient";
  openingNextButton.textContent = state.openingStep === OPENING_DIALOGUE.length - 1
    ? "Đi vào văn phòng"
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
  if (item.interactionType === "tvaBriefing") {
    return getTvaEmployeeDialogue();
  }

  const scriptedDialogue = INTERACTION_DIALOGUES[item.dialogueKey ?? item.id];

  if (scriptedDialogue) {
    return scriptedDialogue;
  }

  const lines = [
    item.slide?.caption,
    item.slide?.text,
    item.prompt ? `Bạn dừng lại để ${item.prompt}.` : "",
    item.kind === "npc"
      ? "Nhân vật này vẫn còn một mảnh câu chuyện, dù chưa có hội thoại riêng."
      : "Dấu tích này vẫn còn giấu ẩn và chưa kịp kể hết câu chuyện của mình.",
  ].filter(Boolean);

  return {
    speaker: item.kind === "npc" ? "Nhân chứng" : "Dấu tích",
    lines: lines.slice(0, 2),
  };
}

function getTvaEmployeeDialogue() {
  if (!state.quests.tvaBriefingAccepted) {
    return TVA_EMPLOYEE_DIALOGUES.introduction;
  }

  const activeRoute = getTvaRoute(state.quests.tvaPortalTarget);
  if (activeRoute) {
    return {
      ...TVA_EMPLOYEE_DIALOGUES.portalActive,
      lines: [
        {
          speaker: "David",
          text: `Tọa độ ${activeRoute.coordinate} vẫn ổn định. Cổng tới ${activeRoute.label} ở ngay bên cạnh; bước qua khi cậu sẵn sàng.`,
        },
      ],
    };
  }

  const pendingRelicIds = getPendingTvaRelicIds();
  const nextRoute = getNextTvaRoute();

  if (pendingRelicIds.length > 0) {
    return createTvaRelicReportDialogue(pendingRelicIds, nextRoute);
  }

  if (nextRoute) {
    return createTvaDispatchPrompt(nextRoute);
  }

  return createTvaCompletionDialogue();
}

function createTvaDispatchPrompt(route) {
  return {
    ...TVA_EMPLOYEE_DIALOGUES.dispatchPrompt,
    storyId: null,
    context: { routeLevelId: route.levelId },
    lines: [
      {
        speaker: "David",
        text: `Hồ sơ tiếp theo dẫn tới ${route.label}. Cậu muốn xuất phát ngay chưa?`,
      },
    ],
  };
}

function createTvaRelicReportDialogue(relicIds, nextRoute) {
  const relicLabels = relicIds.map((relicId) => RELIC_DEFINITIONS[relicId]?.label ?? relicId);
  const joinedLabels = relicLabels.join(relicLabels.length > 1 ? " và " : "");
  const lines = [
    { speaker: "Nhà du hành", text: "Tôi đã hoàn thành hồ sơ và mang tín vật trở về." },
    { speaker: "David", text: "Đưa tôi xem. Máy kiểm định này cũ hơn cả phòng ban của tôi, nhưng nó chưa từng đọc sai một chữ ký thời gian." },
    { speaker: "David", text: `${joinedLabels}. Tần số lịch sử khớp hoàn toàn; hồ sơ này được xác nhận.` },
  ];

  if (relicIds.includes("red-compass")) {
    lines.push({ speaker: "David", text: getZone1TvaReaction() });
  }

  if (nextRoute) {
    lines.push({
      speaker: "David",
      text: `Tuyến kế tiếp là ${nextRoute.label}. Cậu muốn tôi nhập tọa độ ngay chứ?`,
    });
  } else {
    lines.push(
      { speaker: "David", text: "Đủ năm tín vật. Các nhánh lịch sử đã ổn định và hồ sơ trở về của cậu cuối cùng cũng có thể được xử lý." },
      { speaker: "Nhà du hành", text: "Vậy lần này anh thật sự có thể đưa tôi về nhà chứ?" }
    );
  }

  return {
    speaker: "David",
    storyId: null,
    lines,
    choices: nextRoute
      ? TVA_EMPLOYEE_DIALOGUES.dispatchPrompt.choices
      : [
          { id: "finish-history", label: "Hoàn tất hồ sơ trở về" },
          { id: "dispatch-later", label: "Để tôi xem lại tín vật" },
        ],
    context: {
      pendingRelicIds: relicIds,
      routeLevelId: nextRoute?.levelId ?? null,
    },
  };
}

function createTvaCompletionDialogue() {
  return {
    speaker: "David",
    storyId: null,
    lines: [
      { speaker: "David", text: "Năm tín vật đã được đóng dấu. Khi cậu sẵn sàng, tôi sẽ hoàn tất hồ sơ trở về dòng thời gian của cậu." },
    ],
    choices: [
      { id: "finish-history", label: "Tôi sẵn sàng về nhà" },
      { id: "dispatch-later", label: "Tôi cần thêm thời gian" },
    ],
  };
}

function renderDialogue() {
  const dialogue = state.activeDialogue;

  if (!dialogue) {
    hideDialogue();
    return;
  }

  const currentEntry = dialogue.lines[state.activeDialogueIndex];
  const currentLine = typeof currentEntry === "string" ? currentEntry : currentEntry.text;
  const currentSpeaker = typeof currentEntry === "string" ? dialogue.speaker : currentEntry.speaker ?? dialogue.speaker;
  const lastLineIndex = dialogue.lines.length - 1;
  const storySeen = state.unlockedStoryIds.has(dialogue.storyId);
  const choices = state.activeDialogueIndex === lastLineIndex ? dialogue.choices ?? [] : [];
  const hasChoices = choices.length > 0;

  dialogueBox.dataset.speaker = currentSpeaker === "David"
    ? "david"
    : currentSpeaker === "Nhà du hành"
      ? "traveler"
      : "other";
  dialogueBox.dataset.portraitSpeaker = currentSpeaker;
  dialogueSpeaker.textContent = currentSpeaker;
  dialogueProgress.textContent = `${state.activeDialogueIndex + 1} / ${dialogue.lines.length}`;
  dialogueText.textContent = currentLine;
  dialogueNextButton.textContent = state.activeDialogueIndex === lastLineIndex
    ? (dialogue.closeLabel ?? (dialogue.storyId ? (storySeen ? "Đóng" : "Mở khóa chuyện") : "Đóng"))
    : "Tiếp tục";
  dialogueHint.textContent = dialogueBox.dataset.context === "tva"
    ? (hasChoices ? "Chọn phương án xử lý" : "Tiếp tục biên bản")
    : hasChoices
      ? "Chọn một câu trả lời • Phím 1 / 2"
      : "E / Phím cách để tiếp tục";
  dialogueNextButton.classList.toggle("hidden", hasChoices);
  dialogueChoiceList.replaceChildren(...choices.map(createDialogueChoiceButton));
  dialogueChoiceList.classList.toggle("hidden", !hasChoices);
  dialogueBox.classList.remove("hidden");
  dialogueBox.setAttribute("aria-hidden", "false");
}

function createDialogueChoiceButton(choice, index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "pixel-button dialogue-choice-button";
  button.dataset.dialogueChoice = choice.id;
  button.textContent = `${index + 1}. ${choice.label}`;

  if (choice.tone === "danger") {
    button.classList.add("is-danger");
  }

  return button;
}

function getPendingDialogueChoices() {
  const dialogue = state.activeDialogue;

  if (!dialogue || state.activeDialogueIndex !== dialogue.lines.length - 1) {
    return [];
  }

  return dialogue.choices ?? [];
}

function unlockStory(storyId, options = {}) {
  if (!storyId || state.unlockedStoryIds.has(storyId)) {
    return false;
  }

  const story = storyRegistry[storyId];

  state.unlockedStoryIds.add(storyId);
  updateStoryBookButton();

  if (story && !options.silent) {
    showStoryToast(`Đã mở khóa: ${story.title}`);
  }

  return true;
}

function startDialogue(item) {
  const dialogue = getInteractionDialogue(item);

  state.mode = "dialogue";
  setActiveDialogue(item, dialogue);
  interactionPrompt.classList.add("hidden");
  hideStoryToast();
  updateStoryBookButton();
}

function setActiveDialogue(item, dialogue) {
  const hasExplicitStoryId = Object.prototype.hasOwnProperty.call(dialogue, "storyId");
  state.activeDialogue = {
    storyId: hasExplicitStoryId ? dialogue.storyId : dialogue.choices?.length ? null : item.id,
    interactionId: item.id,
    speaker: dialogue.speaker,
    lines: dialogue.lines.filter(Boolean),
    choices: dialogue.choices ?? [],
    context: dialogue.context ?? null,
    closeLabel: dialogue.closeLabel,
  };
  state.activeDialogueIndex = 0;
  dialogueBox.dataset.context = item.interactionType === "tvaBriefing" ? "tva" : "default";
  renderDialogue();
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

  if (getPendingDialogueChoices().length > 0) {
    return;
  }

  finishDialogue();
}

function getNarrativeChoiceOption(chapterId, decisionId, optionId) {
  const decision = NARRATIVE_CHOICE_DEFINITIONS[chapterId]?.find((entry) => entry.id === decisionId);
  const option = decision?.options.find((entry) => entry.id === optionId);

  if (!decision || !option) {
    return null;
  }

  return { decision, option };
}

function getZone1TvaReaction() {
  const reactions = NARRATIVE_TVA_REACTION_DEFINITIONS.zone1;
  const flags = state.narrative.branchFlags;

  if (flags["zone1.acceptedRecruiter"] && flags["zone1.repairAccepted"]) {
    return reactions.compromisedAndRepaired;
  }

  if (flags["zone1.acceptedRecruiter"] || flags["zone1.lastIssueSurrendered"]) {
    return reactions.compromised;
  }

  if (flags["zone1.soughtEvidence"] || flags["zone1.usedEvidence"]) {
    return reactions.gatheredEvidence;
  }

  return reactions.protectedRoute;
}

function applyNarrativeChoice(chapterId, decisionId, optionId) {
  const resolved = getNarrativeChoiceOption(chapterId, decisionId, optionId);

  if (!resolved) {
    return null;
  }

  const { decision, option } = resolved;
  recordNarrativeChoice(state.narrative, {
    ...option,
    id: `${chapterId}.${decision.id}`,
    chapterId,
  });

  if (option.corruption) {
    adjustSaDoa(option.corruption);
  } else {
    saveGameProgress();
  }

  return option;
}

function closeDialogueForChoice() {
  state.activeDialogue = null;
  state.activeDialogueIndex = 0;
  hideDialogue();
  state.mode = "playing";
}

function resolveZone1PaperPlanChoice(choiceId, item) {
  const option = applyNarrativeChoice("zone1", "dock-workers", choiceId);

  if (!option) {
    return;
  }

  state.quests.zone1Started = true;
  item.used = true;
  item.collected = true;
  closeDialogueForChoice();
  updateQuestChip();
  updateInteractionPrompt();
  showStoryToast(
    choiceId === "abandon"
      ? "Bạn giữ báo lại vì an toàn cá nhân. Vẫn còn thời gian để sửa sai và đưa tiếng nói ấy đến người lao động."
      : "Bạn đã chọn một cách đưa báo phù hợp. Hãy đem Le Paria tới ba người lao động ở bến cảng."
  );
  saveGameProgress();
}

function resolveZone1RecruiterChoice(choiceId, item) {
  const option = applyNarrativeChoice("zone1", "recruiter-offer", choiceId);

  if (!option) {
    return;
  }

  state.quests.zone1SoldierDecision = choiceId === "refuse" ? "refused" : choiceId;
  item.used = true;
  closeDialogueForChoice();
  updateInteractionPrompt();

  const messages = {
    refuse: "Bạn từ chối lời dụ dỗ. Người lao động biết rằng các tờ báo vẫn sẽ đến tay họ.",
    accept: "Bạn nhận khoản tiền nhưng chưa giao nộp báo. Đây là một vết lệch nguy hiểm, không phải điểm kết thúc: hãy sửa sai bằng hành động kế tiếp.",
    stall: "Bạn kéo dài cuộc nói chuyện để quan sát lộ trình tuần tra, rồi giữ báo an toàn cho công nhân.",
  };
  showStoryToast(messages[choiceId] ?? "Lựa chọn của bạn đã được ghi lại.");
  saveGameProgress();
}

function resolveZone1CompassVerdictChoice(choiceId, item) {
  const option = applyNarrativeChoice("zone1", "compass-verdict", choiceId);

  if (!option) {
    return;
  }

  closeDialogueForChoice();
  item.collected = true;
  state.quests.zone1RewardClaimed = true;
  const candidate = resolveEnding({ narrative: state.narrative, inventory: state.inventory, saDoa: state.saDoa });

  if (candidate.id === "zone1-lost-compass") {
    triggerNarrativeEnding(candidate, "Bạn đã xác nhận lợi ích cá nhân sau một chuỗi thỏa hiệp, để con đường chung bị đánh mất.");
    return;
  }

  collectRelic("red-compass", getReturnGuidanceForLevel("village"));
  showStoryToast(
    choiceId === "repair-harm"
      ? "Bạn thừa nhận phần sai và chọn sửa chữa. La Bàn Đỏ đã ổn định trở lại."
      : "La Bàn Đỏ đã chỉ về con đường chung. Hãy trở về TVA để báo cáo với David."
  );
}

function resolveZone2UnityChoice(choiceId, item) {
  const option = applyNarrativeChoice("zone2", "archive-unity-choice", choiceId);
  if (!option) return;

  item.used = true;
  closeDialogueForChoice();
  updateInteractionPrompt();
  showStoryToast(
    choiceId === "divide"
      ? "Bạn đã để nghi kỵ lan rộng. Đây là nguy cơ có thể sửa trước khi hồ sơ được chốt."
      : "Bạn đã giữ các nhóm ở trong cùng một cuộc đối thoại."
  );
  saveGameProgress();
}

function resolveZone2EmblemVerdictChoice(choiceId, item) {
  const option = applyNarrativeChoice("zone2", "emblem-verdict", choiceId);
  if (!option) return;

  closeDialogueForChoice();
  item.collected = true;
  state.quests.zone2RewardClaimed = true;
  const candidate = resolveEnding({ narrative: state.narrative, inventory: state.inventory, saDoa: state.saDoa });
  if (candidate.id === "zone2-fading-fires") {
    triggerNarrativeEnding(candidate, "Bạn đã xác nhận sự chia rẽ sau khi để nghi kỵ lan rộng, khiến các ngọn lửa cùng mục tiêu dần lụi tàn.");
    return;
  }

  collectRelic("unified-emblem", getReturnGuidanceForLevel("archive"));
  showStoryToast(
    choiceId === "repair-division"
      ? "Bạn đã sửa lại vết nứt. Huy hiệu Thống nhất ổn định trở lại."
      : "Huy hiệu Thống nhất đã được xác nhận. Hãy trở về TVA báo cáo với David."
  );
}

function resolveZone3RallyChoice(choiceId, item) {
  const option = applyNarrativeChoice("zone3a", "rally-strategy", choiceId);
  if (!option) return;

  item.interactionType = "augustVerdict";
  item.dialogueKey = "august-verdict";
  item.prompt = "chốt cách gìn giữ thời cơ Tháng Tám";
  closeDialogueForChoice();
  updateInteractionPrompt();
  showStoryToast(
    choiceId === "fragment-rally"
      ? "Sự phân tán đã thành một nguy cơ. Hãy quay lại Sợi Chỉ Đỏ để quyết định có hàn gắn nó hay không."
      : "Cuộc tập hợp đã có một hướng chuẩn bị rõ ràng. Hãy quay lại Sợi Chỉ Đỏ để chốt hồ sơ."
  );
  saveGameProgress();
}

function resolveZone3AugustVerdictChoice(choiceId, item) {
  const option = applyNarrativeChoice("zone3a", "august-verdict", choiceId);
  if (!option) return;

  closeDialogueForChoice();
  item.collected = true;
  state.quests.zone3ThreadClaimed = true;
  const candidate = resolveEnding({ narrative: state.narrative, inventory: state.inventory, saDoa: state.saDoa });
  if (candidate.id === "zone3a-missed-moment") {
    triggerNarrativeEnding(candidate, "Bạn đã xác nhận để lực lượng phân tán sau khi bỏ qua công việc chuẩn bị, khiến thời cơ Tháng Tám vụt qua.");
    return;
  }

  collectRelic("vietminh-thread", getReturnGuidanceForLevel("crossroads"));
  showStoryToast(
    choiceId === "repair-fragment"
      ? "Bạn đã hàn gắn sự phân tán. Sợi Chỉ Đỏ Việt Minh bền lại trong tay bạn."
      : "Sợi Chỉ Đỏ Việt Minh đã được ghi nhận. Nửa dưới của khu vực vẫn cần được hàn gắn."
  );
}

function resolveZone3TemporaryLineChoice(choiceId, item) {
  const option = applyNarrativeChoice("zone3b", "temporary-line-choice", choiceId);
  if (!option) return;

  item.used = true;
  closeDialogueForChoice();
  updateInteractionPrompt();
  showStoryToast(
    choiceId === "normalize-separation"
      ? "Bạn đã để sự chia cắt bị xem như điều bình thường. Vẫn còn cơ hội sửa lại khi hàn gắn bản đồ."
      : "Bạn đã ghi nhận rõ tính tạm thời của giới tuyến và những mối liên hệ cần được giữ gìn."
  );
  saveGameProgress();
}

function resolveZone3BorderVerdictChoice(choiceId, item) {
  const option = applyNarrativeChoice("zone3b", "border-verdict", choiceId);
  if (!option) return;

  closeDialogueForChoice();
  item.collected = true;
  state.quests.zone3MapClaimed = true;
  const candidate = resolveEnding({ narrative: state.narrative, inventory: state.inventory, saDoa: state.saDoa });
  if (candidate.id === "zone3b-divided-border") {
    triggerNarrativeEnding(candidate, "Bạn đã xác nhận biến giới tuyến tạm thời thành chia cắt lâu dài, làm những liên hệ của người dân hai miền bị đứt gãy.");
    return;
  }

  collectRelic("healed-map", getReturnGuidanceForLevel("crossroads"));
  showStoryToast(
    choiceId === "repair-separation"
      ? "Bạn đã sửa lại vết rạn. Bản đồ hàn gắn khôi phục những mối liên hệ bị đứt đoạn."
      : "Bản đồ hàn gắn đã hoàn chỉnh. Hãy trở về TVA báo cáo với David."
  );
}

function resolveZone4EarlyChoice(decisionId, choiceId, item) {
  const option = applyNarrativeChoice("zone4", decisionId, choiceId);
  if (!option) return;

  item.used = true;
  closeDialogueForChoice();
  updateInteractionPrompt();
  const isRisk = choiceId === "protect-private-privilege" || choiceId === "freeze-production";
  showStoryToast(
    isRisk
      ? "Bạn đã tạo thêm một nguy cơ cho Đổi Mới. Vẫn còn cơ hội sửa lại khi chốt Bánh răng Đổi Mới."
      : "Lựa chọn của bạn đã mở một hướng đổi mới đặt sản xuất và trách nhiệm ở trung tâm."
  );
  saveGameProgress();
}

function resolveZone4VerdictChoice(choiceId, item) {
  const option = applyNarrativeChoice("zone4", "doi-moi-verdict", choiceId);
  if (!option) return;

  closeDialogueForChoice();
  item.collected = true;
  state.quests.zone4GearClaimed = true;
  const candidate = resolveEnding({ narrative: state.narrative, inventory: state.inventory, saDoa: state.saDoa });
  if (candidate.id === "zone4-stalled-machine") {
    triggerNarrativeEnding(candidate, "Bạn đã xác nhận giữ đặc quyền sau khi để sản xuất bị bế tắc, khiến guồng máy đổi mới tiếp tục đứng im.");
    return;
  }

  collectRelic("doi-moi-gear", getReturnGuidanceForLevel("spring"));
  showStoryToast(
    choiceId === "repair-privilege"
      ? "Bạn đã sửa phần đặc quyền gây bế tắc. Bánh răng Đổi Mới quay trở lại."
      : "Bánh răng Đổi Mới đã sẵn sàng. Hãy trở về TVA báo cáo với David."
  );
}

function resolveDialogueChoice(choiceId) {
  const dialogue = state.activeDialogue;
  const choice = getPendingDialogueChoices().find((entry) => entry.id === choiceId);
  const item = currentLevel().interactables.find((entry) => entry.id === dialogue?.interactionId);
  const supportedInteraction = ["colonialRecruitment", "tvaBriefing", "startPapers", "compassVerdict", "splitChoice", "emblemVerdict", "rallyChoice", "augustVerdict", "temporaryLineChoice", "borderVerdict", "productionChoice", "stalledMechanismChoice", "doiMoiVerdict"].includes(item?.interactionType);

  if (!dialogue || !choice || !item || !supportedInteraction) {
    return;
  }

  if (item.interactionType === "tvaBriefing") {
    resolveTvaDialogueChoice(choice.id, item, dialogue);
    return;
  }

  if (item.interactionType === "startPapers") {
    resolveZone1PaperPlanChoice(choice.id, item);
    return;
  }

  if (item.interactionType === "colonialRecruitment") {
    resolveZone1RecruiterChoice(choice.id, item);
    return;
  }

  if (item.interactionType === "splitChoice") {
    resolveZone2UnityChoice(choice.id, item);
    return;
  }

  if (item.interactionType === "emblemVerdict") {
    resolveZone2EmblemVerdictChoice(choice.id, item);
    return;
  }

  if (item.interactionType === "rallyChoice") {
    resolveZone3RallyChoice(choice.id, item);
    return;
  }

  if (item.interactionType === "augustVerdict") {
    resolveZone3AugustVerdictChoice(choice.id, item);
    return;
  }

  if (item.interactionType === "temporaryLineChoice") {
    resolveZone3TemporaryLineChoice(choice.id, item);
    return;
  }

  if (item.interactionType === "borderVerdict") {
    resolveZone3BorderVerdictChoice(choice.id, item);
    return;
  }

  if (item.interactionType === "productionChoice") {
    resolveZone4EarlyChoice("production-choice", choice.id, item);
    return;
  }

  if (item.interactionType === "stalledMechanismChoice") {
    resolveZone4EarlyChoice("stalled-mechanism-choice", choice.id, item);
    return;
  }

  if (item.interactionType === "doiMoiVerdict") {
    resolveZone4VerdictChoice(choice.id, item);
    return;
  }

  resolveZone1CompassVerdictChoice(choice.id, item);
}

function resolveTvaDialogueChoice(choiceId, item, dialogue) {
  if (choiceId === "refuse-assignment") {
    setActiveDialogue(item, TVA_EMPLOYEE_DIALOGUES.refusal);
    return;
  }

  if (["accept-assignment", "forced-accept-assignment"].includes(choiceId)) {
    state.quests.tvaBriefingAccepted = true;
    item.used = false;
    saveGameProgress();
    const route = getNextTvaRoute();
    setActiveDialogue(item, route ? createTvaDispatchPrompt(route) : createTvaCompletionDialogue());
    updateQuestChip();
    return;
  }

  markTvaRelicsReported(dialogue.context?.pendingRelicIds ?? []);

  if (choiceId === "dispatch-later") {
    finishDialogue();
    showStoryToast("David giữ hồ sơ trên bàn và chờ bạn quay lại xác nhận xuất phát.");
    saveGameProgress();
    return;
  }

  if (choiceId === "finish-history") {
    finishDialogue();
    saveGameProgress();
    attemptEndingInteraction();
    return;
  }

  if (choiceId !== "dispatch-ready") {
    return;
  }

  const route = getTvaRoute(dialogue.context?.routeLevelId) ?? getNextTvaRoute();
  if (!route) {
    finishDialogue();
    attemptEndingInteraction();
    return;
  }

  state.quests.tvaPortalTarget = route.levelId;
  void assetManager.preloadGroup(getAssetGroupForLevel(route.levelId));
  saveGameProgress();
  updateQuestChip();
  setActiveDialogue(item, {
    speaker: "David",
    storyId: null,
    closeLabel: "Đến cổng",
    lines: [
      { speaker: "David", text: `Đang nhập tọa độ không-thời gian: ${route.coordinate}...` },
      { speaker: "David", text: `Đồng bộ hoàn tất. Cổng tới ${route.label} đã mở; đừng chạm vào mép sáng nếu không muốn để lại một phần cơ thể ở thập niên khác.` },
    ],
  });
}

function markTvaRelicsReported(relicIds) {
  for (const relicId of relicIds) {
    state.quests.tvaReportedRelics.add(relicId);
  }
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
  showTutorial();
  showStoryToast("Bạn không biết đây là đâu. Hãy đi dọc hành lang và tìm người đang nói ở phía trước.");
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
  resetMusicForNewSession();
  clearSavedProgress();
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
  showTutorial();
  showStoryToast("Bạn không biết đây là đâu. Hãy đi dọc hành lang và tìm người đang nói ở phía trước.");
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
  resetMusicForNewSession();
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
  showStoryToast("Bạn lại tỉnh dậy ở điểm rơi. Hãy đi dọc hành lang và tìm người nhân viên.");
}

function getAssetGroupForLevel(levelId) {
  return LEVEL_ASSET_GROUPS[levelId] ?? "hub";
}

function getAssetGroupLabel(groupId) {
  return {
    core: "nhân vật và hiệu ứng cốt lõi",
    hub: "Văn phòng TVA",
    zone1: "Khu 1: Đêm mưa thuộc địa",
    zone2: "Khu 2: Kho lưu trữ",
    zone3: "Khu 3: Quảng trường",
    zone4: "Khu 4: Thung lũng Đổi Mới",
    ending: "đoạn kết lịch sử",
  }[groupId] ?? "cảnh quan";
}

function showAssetLoading(title, copy, failed = false) {
  assetLoadingTitle.textContent = title;
  assetLoadingCopy.textContent = copy;
  assetRetryButton.classList.toggle("hidden", !failed);
  assetReturnButton.classList.toggle("hidden", !failed || pendingAssetLoad?.groupId === "hub" || pendingAssetLoad?.groupId === "core");
  assetLoadingOverlay.classList.remove("hidden");
  assetLoadingOverlay.setAttribute("aria-hidden", "false");
}

function hideAssetLoading() {
  assetLoadingOverlay.classList.add("hidden");
  assetLoadingOverlay.setAttribute("aria-hidden", "true");
  assetRetryButton.classList.add("hidden");
  assetReturnButton.classList.add("hidden");
}

async function ensureLevelAssets(levelId, spawnOverride, options = {}, retry = false) {
  const groupId = getAssetGroupForLevel(levelId);
  const result = retry ? await assetManager.retryGroup(groupId) : await assetManager.loadGroup(groupId);

  if (!result.ready) {
    showAssetLoading(
      `Không thể tải ${getAssetGroupLabel(groupId)}`,
      "Asset bắt buộc chưa sẵn sàng. Trò chơi sẽ không thay bằng hình tạm; hãy thử tải lại hoặc quay về trung tâm.",
      true
    );
    return false;
  }

  const pending = pendingAssetLoad;
  pendingAssetLoad = null;
  hideAssetLoading();
  state.mode = pending?.previousMode === "loading" ? "playing" : (pending?.previousMode ?? state.mode);
  loadLevel(levelId, spawnOverride, { ...options, assetsReady: true });
  preloadNextZoneAssets();
  return true;
}

function retryPendingAssetLoad() {
  if (!pendingAssetLoad) {
    return;
  }

  showAssetLoading(`Đang tải lại ${getAssetGroupLabel(pendingAssetLoad.groupId)}`, "Đang kiểm tra lại các asset bắt buộc.");
  void ensureLevelAssets(
    pendingAssetLoad.levelId,
    pendingAssetLoad.spawnOverride,
    pendingAssetLoad.options,
    true
  );
}

function returnFromAssetFailure() {
  pendingAssetLoad = null;
  hideAssetLoading();
  state.mode = "playing";
  loadLevel("hub", undefined, { assetsReady: true });
}

function preloadNextZoneAssets() {
  const nextLevelId = ["village", "archive", "crossroads", "spring"].find(
    (levelId) => levelId !== state.currentLevelId && !state.completedZones.has(levelId)
  );

  if (!nextLevelId) {
    void assetManager.preloadGroup("ending");
    return;
  }

  void assetManager.preloadGroup(getAssetGroupForLevel(nextLevelId));
}

function loadLevel(levelId, spawnOverride, options = {}) {
  const groupId = getAssetGroupForLevel(levelId);
  const groupStatus = assetManager.getGroupStatus(groupId);

  if (!options.assetsReady && !groupStatus.ready) {
    pendingAssetLoad = {
      groupId,
      levelId,
      spawnOverride,
      options,
      previousMode: state.mode,
    };
    state.mode = "loading";
    clearPressedKeys();
    showAssetLoading(`Đang tải ${getAssetGroupLabel(groupId)}`, "Đang chuẩn bị các sprite, âm thanh và hiệu ứng của khu vực này.");
    void ensureLevelAssets(levelId, spawnOverride, options);
    return false;
  }

  const previousLevelId = state.currentLevelId;
  if (previousLevelId === "hub" && state.quests.tvaPortalTarget === levelId) {
    state.quests.tvaPortalTarget = null;
  }

  state.currentLevelId = levelId;
  state.activeInteractionId = null;
  state.pendingEnding = false;
  state.enemyProjectiles = [];
  state.activePlayerAnimation = null;

  const level = currentLevel();
  const spawn = cloneSpawnPoint(spawnOverride ?? level.spawn) ?? level.spawn;

  if (options.updateRespawnCheckpoint !== false) {
    setRespawnCheckpoint(levelId, spawn);
    if (levelId !== "hub" && state.mode === "playing") {
      showStoryToast(`Điểm lưu mới: ${level.label}.`);
    }
  }

  player.x = spawn.x;
  player.y = spawn.y;
  player.direction = spawn.direction ?? "down";
  player.walkTime = 0;
  player.isMoving = false;
  camera.zoom = level.cameraZoom ?? 1;
  state.blockedExitIds = new Set(
    level.exits
      .filter((exit) => isExitAvailable(exit) && isPointInsideExit(player.x, player.y, exit))
      .map((exit) => exit.id)
  );

  updateCamera();
  updateLevelChrome();
  const presentation = getZonePresentationDetails(levelId);
  if (presentation && getZonePresentation(levelId) === "completed" && options.announcePresentation !== false) {
    showStoryToast(presentation.copy);
  }
  updateInteractionPrompt();
  syncAmbienceAudio();
  updateStoryBookButton();
  updateProgressHud();
  if (options.save !== false) {
    saveGameProgress();
  }

  if (options.showTitleCard) {
    showZoneTitleCard(levelId);
  }
}

function updateLevelChrome() {
  const level = currentLevel();

  levelChip.textContent = level.label;
  pauseTitle.textContent = level.pauseTitle;
  canvas.setAttribute("aria-label", level.canvasLabel);
}

function renderSlideGallery(galleryItems) {
  slideGallery.replaceChildren();
  slideGallery.dataset.count = String(galleryItems.length);

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
  delete slideGallery.dataset.count;

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
  if (!isEndingCinematicComplete() || isBadEndingId(state.endingId)) {
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

function getBadEndingRecoveryTimeline() {
  const blackoutAt = BAD_ENDING_RECOVERY.lingerDuration;
  const walkAt = blackoutAt + BAD_ENDING_RECOVERY.blackoutDuration;
  const complaintAt = walkAt + BAD_ENDING_RECOVERY.walkDuration;
  const resetAt = complaintAt + BAD_ENDING_RECOVERY.complaintDuration;

  return {
    blackoutAt,
    walkAt,
    complaintAt,
    resetAt,
    completeAt: resetAt + BAD_ENDING_RECOVERY.resetDuration,
  };
}

function getBadEndingRecoveryFrame(recovery = state.badEndingRecovery) {
  const timeline = getBadEndingRecoveryTimeline();
  const elapsed = Math.max(0, state.lastTimestamp - recovery.startedAt);
  let phase = "linger";
  let phaseProgress = clamp(elapsed / BAD_ENDING_RECOVERY.lingerDuration, 0, 1);

  if (elapsed >= timeline.resetAt) {
    phase = "reset";
    phaseProgress = clamp(
      (elapsed - timeline.resetAt) / BAD_ENDING_RECOVERY.resetDuration,
      0,
      1
    );
  } else if (elapsed >= timeline.complaintAt) {
    phase = "complaint";
    phaseProgress = clamp(
      (elapsed - timeline.complaintAt) / BAD_ENDING_RECOVERY.complaintDuration,
      0,
      1
    );
  } else if (elapsed >= timeline.walkAt) {
    phase = "walk";
    phaseProgress = clamp(
      (elapsed - timeline.walkAt) / BAD_ENDING_RECOVERY.walkDuration,
      0,
      1
    );
  } else if (elapsed >= timeline.blackoutAt) {
    phase = "blackout";
    phaseProgress = clamp(
      (elapsed - timeline.blackoutAt) / BAD_ENDING_RECOVERY.blackoutDuration,
      0,
      1
    );
  }

  const lineIndex = Math.min(
    BAD_ENDING_RECOVERY.lines.length - 1,
    Math.floor(
      (phase === "complaint" ? phaseProgress : phase === "reset" ? 1 : 0) *
        BAD_ENDING_RECOVERY.lines.length
    )
  );

  return {
    elapsed,
    phase,
    phaseProgress,
    lineIndex,
    complete: elapsed >= timeline.completeAt,
  };
}

function syncBadEndingRecoveryUi(frame = null) {
  if (!state.badEndingRecovery || !frame) {
    delete endOverlay.dataset.recoveryPhase;
    badEndingRecoveryDialogue?.classList.add("hidden");
    badEndingRecoveryDialogue?.setAttribute("aria-hidden", "true");
    if (badEndingRecoveryText) {
      badEndingRecoveryText.textContent = "";
    }
    return;
  }

  endOverlay.dataset.recoveryPhase = frame.phase;
  const showDialogue = frame.phase === "complaint" || frame.phase === "reset";
  badEndingRecoveryDialogue?.classList.toggle("hidden", !showDialogue);
  badEndingRecoveryDialogue?.setAttribute("aria-hidden", showDialogue ? "false" : "true");

  if (badEndingRecoverySpeaker) {
    badEndingRecoverySpeaker.textContent = BAD_ENDING_RECOVERY.speaker;
  }
  if (badEndingRecoveryText) {
    badEndingRecoveryText.textContent = BAD_ENDING_RECOVERY.lines[frame.lineIndex] ?? "";
  }
}

function beginBadEndingRecovery() {
  if (
    state.mode !== "ending" ||
    !isBadEndingId(state.endingId) ||
    !isEndingCinematicComplete() ||
    state.badEndingRecovery
  ) {
    return;
  }

  state.badEndingRecovery = {
    startedAt: state.lastTimestamp,
    phase: "linger",
  };
  syncBadEndingRecoveryUi(getBadEndingRecoveryFrame());
  updateEndingCinematicUiState();
}

function updateBadEndingRecovery() {
  if (state.mode !== "ending" || !isBadEndingId(state.endingId) || !isEndingCinematicComplete()) {
    return;
  }

  beginBadEndingRecovery();
  if (!state.badEndingRecovery) {
    return;
  }

  const frame = getBadEndingRecoveryFrame();
  state.badEndingRecovery.phase = frame.phase;
  syncBadEndingRecoveryUi(frame);

  if (frame.complete) {
    restoreBadEndingCheckpoint();
  }
}

function restoreBadEndingCheckpoint() {
  const checkpointLevelId = levels[state.respawnLevelId] ? state.respawnLevelId : "hub";
  const checkpointSpawn = cloneSpawnPoint(
    state.respawnSpawn ?? levels[checkpointLevelId]?.spawn ?? levels.hub.spawn
  );

  state.health = PLAYER_MAX_HEALTH;
  state.stamina = STAMINA_MAX;
  state.saDoa = Math.min(BAD_ENDING_RECOVERY.corruptionAfterReset, SA_DOA_BAD_ENDING - 1);
  state.skillCooldowns.strikeReadyAt = 0;
  state.skillCooldowns.parryReadyAt = 0;
  state.skillReadySoundArmed.strike = false;
  state.skillReadySoundArmed.parry = false;
  state.dodgeReadyAt = 0;
  state.dodgeEndsAt = 0;
  state.parryEndsAt = 0;
  state.strikeChargeStartedAt = 0;
  state.comboStep = 0;
  state.comboExpiresAt = 0;
  state.weakenedUntil = 0;
  state.enemyProjectiles = [];
  state.activeSkillEffect = null;
  state.invulnerableUntil = state.lastTimestamp + RESPAWN_INVULNERABILITY_MS;
  state.highCorruptionWarningShown = false;
  clearPressedKeys();
  resetLevelMonstersForRespawn(checkpointLevelId);
  hideEndOverlay();
  state.endingId = null;
  state.endingSummary = "";
  state.mode = "playing";
  returnStartButton.disabled = false;
  loadLevel(checkpointLevelId, checkpointSpawn, {
    updateRespawnCheckpoint: false,
    announcePresentation: false,
  });
  showStoryToast("TVA đã đưa bạn trở lại điểm kiểm soát gần nhất.");
}

function updateEndingCinematicUiState() {
  if (state.mode !== "ending") {
    returnStartButton.disabled = false;
    delete endOverlay.dataset.cinematic;
    return;
  }

  const cinematicState = isEndingCinematicComplete() ? "complete" : "running";
  endOverlay.dataset.cinematic = cinematicState;
  returnStartButton.disabled = cinematicState === "running" || isBadEndingId(state.endingId);
}

function showEndOverlay() {
  const endingId = state.endingId ?? "bad";
  const musicEndingId = endingId === "good" ? "good" : "bad";
  const endingAssetsReady = assetManager.loadGroup("ending");
  const ending = ENDING_DEFINITIONS[state.endingId] ?? ENDING_DEFINITIONS.bad;
  resetSound(musicSounds[musicEndingId === "good" ? "goodEnding" : "badEnding"]);

  state.mode = "ending";
  state.endingCinematic = createEndingCinematicState(state.endingId ?? "bad");
  state.badEndingRecovery = null;
  syncBadEndingRecoveryUi();
  hideDialogue();
  hideStoryToast();
  hideCorruptionWarning();
  interactionPrompt.classList.add("hidden");
  hud?.classList.add("hidden");
  pauseButton.classList.add("hidden");
  storyBookButton.classList.add("hidden");
  storyBookButton.setAttribute("aria-hidden", "true");
  endTitle.textContent = ending.title;
  endCopy.textContent = ending.copy;
  endSummary.textContent =
    state.endingSummary || `Tín vật: ${state.inventory.size}/${RELIC_TARGET_COUNT} • Tha hóa: ${state.saDoa}%`;
  updateEndingArt(ending);
  endOverlay.dataset.ending = state.endingId ?? "bad";
  endOverlay.setAttribute("aria-label", ending.title);
  endOverlay.classList.remove("hidden");
  endOverlay.setAttribute("aria-hidden", "false");
  syncAmbienceAudio();
  void endingAssetsReady.then(() => {
    if (state.mode === "ending" && state.endingId === endingId) {
      syncAmbienceAudio();
    }
  });
  syncEndingArtCinematicCanvas();
  syncEndingSceneOverlayCanvas();
  updateEndingCinematicUiState();
  updateStoryBookButton();
  updateCorruptionEffects();
}

function hideEndOverlay() {
  if (endArtFrame && endArtImage) {
    endArtFrame.classList.add("hidden");
    endArtFrame.setAttribute("aria-hidden", "true");
    endArtImage.removeAttribute("src");
    endArtImage.alt = "";
  }
  state.endingCinematic = null;
  state.badEndingRecovery = null;
  syncBadEndingRecoveryUi();
  clearEndingArtCinematic();
  clearEndingSceneOverlay();
  updateEndingCinematicUiState();
  delete endOverlay.dataset.ending;
  endOverlay.removeAttribute("aria-label");
  endOverlay.classList.add("hidden");
  endOverlay.setAttribute("aria-hidden", "true");
  hud?.classList.remove("hidden");
  pauseButton.classList.remove("hidden");
  updateStoryBookButton();
  updateCorruptionEffects();
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
    beginBadEndingRecovery();
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
  } else if (state.badEndingRecovery) {
    renderBadEndingRecoveryScene(context, width, height, scene);
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

function renderBadEndingRecoveryScene(context, width, height, scene) {
  const frame = getBadEndingRecoveryFrame();

  if (frame.phase === "linger") {
    renderBadEndingSceneOverlay(context, width, height, scene);
    return;
  }

  if (frame.phase === "blackout") {
    renderBadEndingSceneOverlay(context, width, height, scene);
    context.save();
    context.fillStyle = `rgba(2, 2, 3, ${easeInOutCubic(frame.phaseProgress)})`;
    context.fillRect(0, 0, width, height);
    context.restore();
    return;
  }

  context.save();
  context.fillStyle = "#020203";
  context.fillRect(0, 0, width, height);

  const walkProgress = frame.phase === "walk" ? easeInOutCubic(frame.phaseProgress) : 1;
  const actorX = -width * 0.1 + width * 0.52 * walkProgress;
  const actorY = height * 0.78;
  const actorScale = clamp((height * 0.4) / TVA_EMPLOYEE_SPRITE.drawHeight, 2.4, 7.5);
  const actorOpacity = frame.phase === "reset"
    ? 1 - easeInOutCubic(clamp((frame.phaseProgress - 0.9) / 0.1, 0, 1))
    : 1;

  context.globalAlpha = actorOpacity * 0.24;
  context.fillStyle = "#5b4730";
  context.beginPath();
  context.ellipse(actorX, actorY + 7, 13 * actorScale, 2.4 * actorScale, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();

  if (frame.phase === "reset") {
    const resetScale = clamp((height * 0.4) / M90_RESET_ANIMATION.drawHeight, 2.4, 7.5);
    drawM90ResetSequence(context, actorX, actorY, resetScale, frame.phaseProgress, actorOpacity);
  } else {
    drawNpcSpriteActorToContext(
      context,
      {
        spriteKey: "tvaEmployee",
        x: actorX,
        y: actorY,
        direction: frame.phase === "walk" ? "right" : "downleft",
        animation: frame.phase === "walk" ? "walk" : "idle",
        idleFrameCount: 2,
        scale: actorScale,
        opacity: actorOpacity,
      },
      state.lastTimestamp
    );
  }
}

function drawM90ResetSequence(context, x, y, scale, phaseProgress, opacity) {
  const elapsed = phaseProgress * BAD_ENDING_RECOVERY.resetDuration;
  const actionDuration = M90_RESET_ANIMATION.frameDurations.reduce((total, duration) => total + duration, 0);
  let frameIndex = M90_RESET_ANIMATION.frameDurations.length - 1;
  let cursor = 0;
  for (let index = 0; index < M90_RESET_ANIMATION.frameDurations.length; index += 1) {
    cursor += M90_RESET_ANIMATION.frameDurations[index];
    if (elapsed < cursor) {
      frameIndex = index;
      break;
    }
  }

  if (canDrawSprite(effectSprites.m90ResetActivate)) {
    const drawWidth = Math.round(M90_RESET_ANIMATION.drawWidth * scale);
    const drawHeight = Math.round(M90_RESET_ANIMATION.drawHeight * scale);
    context.save();
    context.globalAlpha = opacity;
    context.imageSmoothingEnabled = false;
    context.drawImage(
      effectSprites.m90ResetActivate,
      frameIndex * M90_RESET_ANIMATION.frameWidth + M90_RESET_ANIMATION.cropX,
      M90_RESET_ANIMATION.cropY,
      M90_RESET_ANIMATION.cropWidth,
      M90_RESET_ANIMATION.cropHeight,
      Math.round(x - drawWidth / 2),
      Math.round(y - drawHeight),
      drawWidth,
      drawHeight
    );
    context.restore();
  }

  const waveElapsed = elapsed - actionDuration;
  if (waveElapsed < 0 || !canDrawSprite(effectSprites.m90ResetWave)) {
    return;
  }
  const waveFrame = Math.min(
    M90_RESET_ANIMATION.effectFrameCount - 1,
    Math.floor(waveElapsed / M90_RESET_ANIMATION.effectFrameDuration)
  );
  const waveSize = Math.round(Math.min(context.canvas.width, context.canvas.height) * 0.52);
  context.save();
  context.globalCompositeOperation = "screen";
  context.globalAlpha = opacity * 0.9;
  context.imageSmoothingEnabled = false;
  context.drawImage(
    effectSprites.m90ResetWave,
    waveFrame * M90_RESET_ANIMATION.effectFrameWidth,
    0,
    M90_RESET_ANIMATION.effectFrameWidth,
    M90_RESET_ANIMATION.effectFrameHeight,
    Math.round(x - waveSize / 2),
    Math.round(y - waveSize * 0.72),
    waveSize,
    waveSize
  );
  context.restore();
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

function startStrikeCharge() {
  if (state.lastTimestamp < state.skillCooldowns.strikeReadyAt || state.strikeChargeStartedAt) {
    return;
  }

  state.strikeChargeStartedAt = state.lastTimestamp;
}

function releaseStrikeCharge() {
  if (!state.strikeChargeStartedAt) {
    return;
  }

  const heldFor = state.lastTimestamp - state.strikeChargeStartedAt;
  state.strikeChargeStartedAt = 0;
  useStrikeSkill(heldFor >= CHARGED_STRIKE_THRESHOLD_MS);
}

function useStrikeSkill(isCharged = false) {
  if (state.lastTimestamp < state.skillCooldowns.strikeReadyAt) {
    return;
  }

  state.skillCooldowns.strikeReadyAt = state.lastTimestamp + STRIKE_COOLDOWN_MS;
  state.skillReadySoundArmed.strike = true;
  state.comboStep = state.lastTimestamp <= state.comboExpiresAt ? (state.comboStep % 3) + 1 : 1;
  state.comboExpiresAt = state.lastTimestamp + 700;
  const strikeDamage = isCharged ? 4 : state.comboStep === 3 ? 2 : 1;
  const strikeAnimation = isCharged ? "attack2" : state.comboStep % 2 === 0 ? "attack2" : "attack1";
  startPlayerAnimation(strikeAnimation, { direction: player.direction });
  state.activeSkillEffect = {
    type: isCharged ? "chargedStrike" : "strike",
    direction: player.direction,
    x: player.x,
    y: player.y,
    startedAt: state.lastTimestamp,
    endsAt: state.lastTimestamp + (isCharged ? PLAYER_ATTACK_ANIMATION_MS + 120 : PLAYER_ATTACK_ANIMATION_MS),
  };
  playCombatSfx("strikeSwing", { volume: isCharged ? 0.62 : 0.48, playbackRate: isCharged ? 0.82 : 0.96 + state.comboStep * 0.035 });

  let hitMonster = false;

  for (const monster of currentLevel().monsters ?? []) {
    if (monster.defeated || !isMonsterActive(monster) || !isTargetInRange(monster, STRIKE_RANGE)) {
      continue;
    }

    hitMonster = true;
    damageMonster(monster, strikeDamage, { knockback: isCharged || state.comboStep === 3, stun: isCharged });
  }

  for (const breakable of currentLevel().breakables ?? []) {
    if (!breakable.destroyed && isTargetInRange(breakable, STRIKE_RANGE)) {
      damageBreakable(breakable, isCharged ? 3 : 1);
      hitMonster = true;
    }
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

function useDodge() {
  if (state.lastTimestamp < state.dodgeReadyAt || state.stamina < DODGE_COST) {
    return;
  }

  state.stamina -= DODGE_COST;
  state.dodgeReadyAt = state.lastTimestamp + DODGE_COOLDOWN_MS;
  state.dodgeEndsAt = state.lastTimestamp + 180;
  state.invulnerableUntil = Math.max(state.invulnerableUntil, state.dodgeEndsAt);
  const direction = getDirectionUnit(player.direction);
  const original = { x: player.x, y: player.y };
  player.x += direction.x * DODGE_DISTANCE;
  player.y += direction.y * DODGE_DISTANCE;
  applyLevelBounds();
  resolveLevelCollisions("x", player.x - original.x);
  resolveLevelCollisions("y", player.y - original.y);
  state.activeSkillEffect = { type: "dodge", x: original.x, y: original.y, direction: player.direction, startedAt: state.lastTimestamp, endsAt: state.dodgeEndsAt };
  startPlayerAnimation("dash", { direction: player.direction });
  playUiSound(uiSounds.dash);
}

function useParrySkill() {
  if (state.lastTimestamp < state.skillCooldowns.parryReadyAt) {
    return;
  }

  state.skillCooldowns.parryReadyAt = state.lastTimestamp + PARRY_COOLDOWN_MS;
  state.skillReadySoundArmed.parry = true;
  state.parryEndsAt = state.lastTimestamp + PARRY_WINDOW_MS;
  startPlayerAnimation("parry", { direction: player.direction });
  state.activeSkillEffect = {
    type: "parry",
    x: player.x,
    y: player.y,
    startedAt: state.lastTimestamp,
    endsAt: state.parryEndsAt,
  };
}

function resolveParry(sourceName, sourceMonster = null, options = {}) {
  if (state.lastTimestamp >= state.parryEndsAt) {
    return false;
  }

  state.parryEndsAt = 0;
  state.invulnerableUntil = Math.max(state.invulnerableUntil, state.lastTimestamp + 140);
  state.stamina = Math.min(STAMINA_MAX, state.stamina + GAMEPLAY_BALANCE.combat.parry.staminaReward);
  state.activeSkillEffect = {
    type: "parryHit",
    x: player.x,
    y: player.y,
    startedAt: state.lastTimestamp,
    endsAt: state.lastTimestamp + 260,
  };
  playUiSound(uiSounds.parry);

  if (sourceMonster && !sourceMonster.defeated && !options.projectile) {
    damageMonster(sourceMonster, sourceMonster.isBoss ? 2 : 3, { knockback: true, stun: true });
  }

  showStoryToast(`Phản đòn ${sourceName} thành công!`);
  return true;
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
    const deathStillVisible = monster.defeated && state.lastTimestamp < (monster.deathEndsAt ?? 0);
    if ((!deathStillVisible && monster.defeated) || (!monster.defeated && !isMonsterActive(monster))) {
      continue;
    }

    const dx = player.x - monster.x;
    const dy = player.y - monster.y;
    const distance = Math.hypot(dx, dy);
    const settings = getDifficultySettings(state.difficulty);
    const isStunned = state.lastTimestamp < (monster.stunnedUntil ?? 0);
    const isHurt = state.lastTimestamp < (monster.hurtEndsAt ?? 0);
    const combatProfile = monster.combatProfile;
    const isCommanded = state.lastTimestamp < (monster.commandBuffUntil ?? 0);
    let targetX = monster.homeX + Math.cos(state.lastTimestamp * 0.001 + monster.phase) * (monster.patrolRadius ?? 18);
    let targetY = monster.patrolAxis === "horizontal"
      ? monster.homeY
      : monster.homeY + Math.sin(state.lastTimestamp * 0.0012 + monster.phase) * (monster.patrolRadius ?? 18);

    if (monster.attackImpactAt && state.lastTimestamp >= monster.attackImpactAt) {
      if (state.lastTimestamp < (monster.attackEndsAt ?? 0) && monster.archetype === "ranged") {
        spawnEnemyProjectile(monster);
      }
      monster.attackImpactAt = 0;
    }

    if (distance < (monster.aggroRadius ?? 120)) {
      if (monster.archetype === "ranged" && distance < 104) {
        targetX = monster.x - dx;
        targetY = monster.y - dy;
      } else if (monster.archetype !== "support") {
        targetX = player.x;
        targetY = player.y;
      }
    }

    const moveX = targetX - monster.x;
    const moveY = targetY - monster.y;
    const moveLength = Math.hypot(moveX, moveY);
    const isAttacking = state.lastTimestamp < (monster.attackEndsAt ?? 0);
    monster.animationState = isAttacking ? "attack" : isHurt || isStunned ? "hurt" : moveLength > 1 ? "run" : "idle";

    if (!isAttacking && !isStunned && !isHurt && moveLength > 1) {
      monster.facingDirection = getDirectionFromVector(moveX, moveY);
      const slowMultiplier = state.lastTimestamp < (monster.slowedUntil ?? 0) ? 0.58 : 1;
      const commandSpeed = isCommanded ? combatProfile?.commandPulse?.speedMultiplier ?? 1 : 1;
      const step = Math.min(moveLength, MONSTER_SPEED * settings.enemySpeed * (monster.phaseSpeedMultiplier ?? 1) * commandSpeed * slowMultiplier * deltaSeconds);
      monster.moveDirection = getDirectionFromVector(moveX, moveY);
      if (Math.abs(moveX) > 0.2) {
        monster.horizontalFacing = moveX < 0 ? "left" : "right";
      }
      monster.x += (moveX / moveLength) * step;
      monster.y += (moveY / moveLength) * step;
    }

    monster.x = clamp(monster.x, currentLevel().bounds.minX, currentLevel().bounds.maxX);
    monster.y = clamp(monster.y, currentLevel().bounds.minY, currentLevel().bounds.maxY);

    if (monster.isBoss && combatProfile && distance < (monster.aggroRadius ?? 150) && state.lastTimestamp >= (monster.commandPulseAt ?? Infinity)) {
      triggerCaptainCommandPulse(monster);
    }

    const attackProfile = monster.attackVariant === "slam" ? combatProfile?.slam : combatProfile?.sweep;
    const telegraphRange = monster.archetype === "ranged" ? 170 : attackProfile?.range ?? MONSTER_TOUCH_RANGE + (monster.isBoss ? 48 : 30);
    const comboFollowUpReady = monster.isBoss && monster.bossPhase >= 2 && state.lastTimestamp >= (monster.comboFollowUpAt ?? Infinity);
    const canStartAttack = comboFollowUpReady || state.lastTimestamp - monster.lastContactAt >= MONSTER_CONTACT_DAMAGE_COOLDOWN_MS;

    if (!isAttacking && !isStunned && !monster.telegraphEndsAt && distance <= telegraphRange && canStartAttack) {
      if (comboFollowUpReady) {
        monster.comboFollowUpAt = 0;
        monster.attackVariant = "sweep";
        monster.isComboFollowUp = true;
      } else {
        monster.attackCount = (monster.attackCount ?? 0) + 1;
        monster.attackVariant = monster.isBoss && monster.bossPhase >= 2 && monster.attackCount % (combatProfile?.comboEvery ?? Infinity) === 0 ? "slam" : "sweep";
        monster.isComboFollowUp = false;
      }
      const selectedAttack = monster.attackVariant === "slam" ? combatProfile?.slam : combatProfile?.sweep;
      monster.telegraphStartsAt = state.lastTimestamp;
      monster.telegraphEndsAt = state.lastTimestamp + (comboFollowUpReady ? 180 : selectedAttack?.telegraphMs ?? (monster.isBoss ? 520 : 340));
      monster.attackDirection = getDirectionFromVector(player.x - monster.x, player.y - monster.y);
      if (Math.abs(player.x - monster.x) > 0.2) {
        monster.horizontalFacing = player.x < monster.x ? "left" : "right";
      }
      monster.animationState = "telegraph";
    }

    if (monster.telegraphEndsAt && state.lastTimestamp >= monster.telegraphEndsAt) {
      monster.lastContactAt = state.lastTimestamp;
      monster.attackStartedAt = state.lastTimestamp;
      const selectedAttack = monster.attackVariant === "slam" ? combatProfile?.slam : combatProfile?.sweep;
      const attackSpeed = state.lastTimestamp < (monster.commandBuffUntil ?? 0) ? combatProfile?.commandPulse?.attackDurationMultiplier ?? 1 : 1;
      const attackDuration = monster.attackAnimationMs ?? selectedAttack?.attackMs ?? MONSTER_ATTACK_ANIMATION_MS;
      monster.attackEndsAt = state.lastTimestamp + Math.round(attackDuration * attackSpeed);
      monster.telegraphStartsAt = 0;
      monster.telegraphEndsAt = 0;
      monster.animationState = "attack";

      if (monster.archetype === "ranged") {
        playCombatSfx("rifleShot", { volume: 0.64, playbackRate: 0.96 + Math.random() * 0.08 });
        if ((monster.attackImpactDelayMs ?? 0) > 0) {
          monster.attackImpactAt = state.lastTimestamp + monster.attackImpactDelayMs;
        } else {
          spawnEnemyProjectile(monster);
        }
      } else if (monster.archetype === "support") {
        playCombatSfx("lanternPulse", { volume: 0.54, playbackRate: 0.96 + Math.random() * 0.08 });
        applySupportPulse(monster);
      } else if (monster.attackVariant === "slam" && distance <= (selectedAttack?.radius ?? 70)) {
        playCombatSfx("captainSlam", { volume: 0.66 });
        damagePlayer(Math.max(1, Math.round((monster.damage ?? 1) * settings.enemyDamage)), monster.name, monster);
      } else if (distance <= MONSTER_TOUCH_RANGE + 10) {
        playCombatSfx("batonHit", { volume: monster.isBoss ? 0.68 : 0.6, playbackRate: 0.94 + Math.random() * 0.1 });
        damagePlayer(Math.max(1, Math.round((monster.damage ?? 1) * settings.enemyDamage)), monster.name, monster);
      }

      if (monster.isBoss && monster.bossPhase >= 2 && monster.attackVariant === "sweep" && !monster.isComboFollowUp) {
        monster.comboFollowUpAt = monster.attackEndsAt + 90;
      }
    }
  }
}

function triggerCaptainCommandPulse(monster) {
  const pulse = monster.combatProfile?.commandPulse;
  if (!pulse) {
    return;
  }

  monster.commandPulseAt = state.lastTimestamp + pulse.intervalMs;
  monster.supportPulseUntil = state.lastTimestamp + 380;
  playCombatSfx("captainCommand", { volume: 0.32 });
  for (const ally of currentLevel().monsters ?? []) {
    if (ally === monster || ally.defeated || Math.hypot(ally.x - monster.x, ally.y - monster.y) > pulse.radius) {
      continue;
    }
    ally.commandBuffUntil = state.lastTimestamp + pulse.durationMs;
  }
  showStoryToast("Mệnh lệnh áp chế khiến đồng bọn tăng tốc!");
}

function spawnEnemyProjectile(monster) {
  const config = MONSTER_SPRITE_CONFIG[getMonsterArtKey(monster)];
  const spriteDirection = getMonsterSpriteDirection(monster, config);
  const projectileOffset = config?.projectileOffsets?.[spriteDirection];
  const originX = monster.x + (projectileOffset?.x ?? 0);
  const originY = monster.y + (projectileOffset?.y ?? -4);
  const dx = player.x - originX;
  const dy = player.y - originY;
  const length = Math.max(1, Math.hypot(dx, dy));
  state.enemyProjectiles.push({
    x: originX,
    y: originY,
    velocityX: (dx / length) * PROJECTILE_SPEED,
    velocityY: (dy / length) * PROJECTILE_SPEED,
    expiresAt: state.lastTimestamp + 1800,
    damage: Math.max(1, Math.round((monster.damage ?? 1) * getDifficultySettings(state.difficulty).enemyDamage)),
    sourceName: monster.name,
    sourceMonster: monster,
  });
}

function applySupportPulse(monster) {
  monster.supportPulseUntil = state.lastTimestamp + 340;
  for (const ally of currentLevel().monsters ?? []) {
    if (ally.defeated || ally === monster || Math.hypot(ally.x - monster.x, ally.y - monster.y) > 92) {
      continue;
    }
    ally.health = Math.min(ally.runtimeMaxHealth ?? ally.maxHealth, ally.health + 1);
    ally.supportBuffUntil = state.lastTimestamp + 1400;
  }
  if (Math.hypot(player.x - monster.x, player.y - monster.y) < 116) {
    state.weakenedUntil = state.lastTimestamp + 1200;
    showStoryToast("Lời tụng niệm làm ý chí của bạn chao đảo.");
  }
}

function updateEnemyProjectiles(deltaSeconds) {
  for (let index = state.enemyProjectiles.length - 1; index >= 0; index -= 1) {
    const projectile = state.enemyProjectiles[index];
    projectile.x += projectile.velocityX * deltaSeconds;
    projectile.y += projectile.velocityY * deltaSeconds;

    if (state.lastTimestamp >= projectile.expiresAt || !isWorldPointInBounds(projectile.x, projectile.y)) {
      state.enemyProjectiles.splice(index, 1);
      continue;
    }

    if (projectile.reflected) {
      const target = projectile.sourceMonster;
      if (!target || target.defeated) {
        state.enemyProjectiles.splice(index, 1);
        continue;
      }

      if (Math.hypot(target.x - projectile.x, target.y - projectile.y) < 18) {
        damageMonster(target, projectile.damage, { knockback: true, stun: true });
        state.enemyProjectiles.splice(index, 1);
      }
      continue;
    }

    if (Math.hypot(player.x - projectile.x, player.y - projectile.y) < 14) {
      if (resolveParry(projectile.sourceName, projectile.sourceMonster, { projectile })) {
        reflectEnemyProjectile(projectile);
        continue;
      }

      damagePlayer(projectile.damage, projectile.sourceName, projectile.sourceMonster);
      state.enemyProjectiles.splice(index, 1);
    }
  }
}

function reflectEnemyProjectile(projectile) {
  const target = projectile.sourceMonster;
  if (!target || target.defeated) {
    projectile.expiresAt = state.lastTimestamp;
    return;
  }

  const dx = target.x - projectile.x;
  const dy = target.y - projectile.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const reflectedSpeed = PROJECTILE_SPEED * 1.2;
  projectile.velocityX = (dx / length) * reflectedSpeed;
  projectile.velocityY = (dy / length) * reflectedSpeed;
  projectile.reflected = true;
  projectile.expiresAt = state.lastTimestamp + 1200;
  projectile.damage = Math.max(projectile.damage, Math.round(projectile.damage * 1.5));
  state.invulnerableUntil = Math.max(state.invulnerableUntil, state.lastTimestamp + 140);
  showStoryToast(`Phản đòn ${projectile.sourceName}!`);
}

function isWorldPointInBounds(x, y) {
  const bounds = currentLevel().bounds;
  return x >= bounds.minX && x <= bounds.maxX && y >= bounds.minY && y <= bounds.maxY;
}

function spawnMonsterDrop(monster) {
  const guaranteed = monster.isBoss;
  if (!guaranteed && Math.random() > getDifficultySettings(state.difficulty).dropChance) {
    return;
  }
  currentLevel().drops.push({
    x: monster.x,
    y: monster.y,
    type: monster.isBoss || state.health < PLAYER_MAX_HEALTH * GAMEPLAY_BALANCE.drops.healthPriorityThreshold ? "health" : "stamina",
    expiresAt: state.lastTimestamp + 12000,
  });
}

function updateWorldDrops() {
  const drops = currentLevel().drops ?? [];
  for (let index = drops.length - 1; index >= 0; index -= 1) {
    const drop = drops[index];
    if (state.lastTimestamp >= drop.expiresAt) {
      drops.splice(index, 1);
      continue;
    }
    if (Math.hypot(player.x - drop.x, player.y - drop.y) < 20) {
      if (drop.type === "health") {
        const previousHealth = state.health;
        state.health = Math.min(PLAYER_MAX_HEALTH, state.health + GAMEPLAY_BALANCE.drops.healthAmount);
        if (state.health > previousHealth) {
          startPlayerAnimation("heal", { direction: player.direction });
          playUiSound(uiSounds.heal);
        }
      } else {
        state.stamina = Math.min(STAMINA_MAX, state.stamina + GAMEPLAY_BALANCE.drops.staminaAmount);
      }
      drops.splice(index, 1);
      showStoryToast(drop.type === "health" ? "Nhặt được hồi phục sinh lực." : "Nhặt được năng lượng chiến đấu.");
    }
  }
}

function updateLevelHazards() {
  for (const trap of currentLevel().traps ?? []) {
    if (state.lastTimestamp < trap.cooldownUntil || Math.hypot(player.x - trap.x, player.y - trap.y) > trap.radius) {
      continue;
    }
    trap.cooldownUntil = state.lastTimestamp + 1100;
    damagePlayer(1, "bẫy môi trường");
  }
}

function damageBreakable(breakable, amount) {
  breakable.health = Math.max(0, breakable.health - amount);
  if (breakable.health > 0) {
    return;
  }
  breakable.destroyed = true;
  currentLevel().drops.push({ x: breakable.x, y: breakable.y, type: "stamina", expiresAt: state.lastTimestamp + 12000 });
  showStoryToast("Chướng ngại đã vỡ, để lại năng lượng chiến đấu.");
}

function damageMonster(monster, amount, effects = {}) {
  if (monster.weakenedUntil > state.lastTimestamp && !effects.ignoreWeakness) {
    amount += 1;
  }
  monster.health = Math.max(0, monster.health - amount);
  monster.hitFlashUntil = state.lastTimestamp + 110;
  monster.hurtStartedAt = state.lastTimestamp;
  monster.hurtEndsAt = state.lastTimestamp + 180;
  playCombatSfx("hurt", { volume: monster.isBoss ? 0.7 : 0.62, playbackRate: 0.94 + Math.random() * 0.1 });
  state.cameraShakeUntil = state.lastTimestamp + (monster.isBoss ? 150 : 90);
  state.cameraShakeStrength = monster.isBoss ? 4 : 2;
  state.hitStopUntil = Math.max(state.hitStopUntil, state.lastTimestamp + (monster.isBoss ? 42 : 35));
  state.combatImpacts.push({ x: monster.x, y: monster.y - 10, startedAt: state.lastTimestamp, endsAt: state.lastTimestamp + 180 });

  if (effects.stun) {
    monster.stunnedUntil = state.lastTimestamp + (monster.isBoss ? 180 : 520);
  }

  if (effects.knockback) {
    const direction = getDirectionUnit(getDirectionFromVector(monster.x - player.x, monster.y - player.y));
    monster.x += direction.x * (monster.isBoss ? 12 : 24);
    monster.y += direction.y * (monster.isBoss ? 12 : 24);
  }

  const phaseTwoThreshold = monster.combatProfile?.phaseTwoThreshold ?? 0.5;
  if (monster.isBoss && !monster.bossPhase && monster.health > 0 && monster.health <= (monster.runtimeMaxHealth ?? monster.maxHealth) * phaseTwoThreshold) {
    monster.bossPhase = 2;
    monster.damage += 1;
    monster.phaseSpeedMultiplier = 1.25;
    showStoryToast(`${monster.name} bước vào giai đoạn hai!`);
  }

  if (monster.health > 0) {
    return;
  }

  monster.defeated = true;
  monster.deathStartedAt = state.lastTimestamp;
  const deathAnimation = MONSTER_SPRITE_CONFIG[getMonsterArtKey(monster)]?.animations?.death;
  monster.deathEndsAt = state.lastTimestamp + (deathAnimation?.frameCount ?? 6) * (deathAnimation?.frameDuration ?? 90);
  playCombatSfx("death", { volume: monster.isBoss ? 0.36 : 0.26, playbackRate: monster.isBoss ? 0.82 : 1 });
  saveGameProgress();

  spawnMonsterDrop(monster);

  if (monster.id === "southern-tyrant") {
    state.quests.zone3BossDefeated = true;
  }

  if (monster.dropItemId) {
    collectRelic(monster.dropItemId);
    return;
  }

  showStoryToast(`${monster.name} đã bị đánh bại.`);
}

function damagePlayer(amount, sourceName = "bóng tối", sourceMonster = null) {
  if (resolveParry(sourceName, sourceMonster)) {
    return Promise.resolve();
  }

  if (state.lastTimestamp < state.invulnerableUntil) {
    return Promise.resolve();
  }

  state.invulnerableUntil = state.lastTimestamp + 820;
  state.health = Math.max(0, state.health - amount);
  state.cameraShakeUntil = state.lastTimestamp + 180;
  state.cameraShakeStrength = 5;
  state.combatFlashUntil = state.lastTimestamp + 150;
  updateProgressHud();
  playCombatSfx("playerHurt", { volume: 0.68, playbackRate: 0.96 + Math.random() * 0.08 });

  if (state.health > 0) {
    startPlayerAnimation("hurt", { direction: player.direction });
    playUiSound(uiSounds.hurt);
    showStoryToast(`${sourceName} gây ${amount} sát thương.`);
    return Promise.resolve();
  }

  state.activeSkillEffect = null;

  const respawnLevelId = state.respawnLevelId ?? state.currentLevelId;
  const respawnLevel = levels[respawnLevelId] ?? currentLevel();
  const respawnSpawn = cloneSpawnPoint(state.respawnSpawn ?? respawnLevel.spawn);
  state.pendingRespawn = {
    levelId: respawnLevelId,
    spawn: respawnSpawn,
    respawnAt: state.lastTimestamp + getPlayerAnimationDuration("death") + DEATH_RESPAWN_DELAY_MS,
  };
  state.invulnerableUntil = state.pendingRespawn.respawnAt + RESPAWN_INVULNERABILITY_MS;
  clearPressedKeys();
  startPlayerAnimation("death", { direction: player.direction });
  playUiSound(uiSounds.death);

  adjustSaDoa(
    DEATH_SA_DOA_PENALTY,
    `Bạn gục ngã trước ${sourceName}. Tha hóa dâng lên và bạn bị đẩy lùi về ${respawnLevel.label}.`
  );

  if (state.mode === "ending") {
    state.health = PLAYER_MAX_HEALTH;
    state.pendingRespawn = null;
    state.activePlayerAnimation = null;
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    pendingRespawnResolve = resolve;
  });
}

function completePlayerRespawn() {
  const pendingRespawn = state.pendingRespawn;
  if (!pendingRespawn) {
    return;
  }

  state.health = PLAYER_MAX_HEALTH;
  state.pendingRespawn = null;
  state.invulnerableUntil = state.lastTimestamp + RESPAWN_INVULNERABILITY_MS;
  resetLevelMonstersForRespawn(pendingRespawn.levelId);
  loadLevel(pendingRespawn.levelId, pendingRespawn.spawn, { updateRespawnCheckpoint: false });
  const resolve = pendingRespawnResolve;
  pendingRespawnResolve = null;
  resolve?.();
}

function updatePlayer(deltaSeconds) {
  if (state.pendingRespawn) {
    player.isMoving = false;
    player.walkTime = 0;
    updateCamera();
    return;
  }

  if (state.lastTimestamp >= state.dodgeEndsAt) {
    state.stamina = Math.min(STAMINA_MAX, state.stamina + STAMINA_REGEN_PER_SECOND * deltaSeconds);
  }

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

    const weakenedMultiplier = state.lastTimestamp < state.weakenedUntil ? 0.76 : 1;
    const deltaX = moveX * PLAYER_SPEED * weakenedMultiplier * deltaSeconds;
    const deltaY = moveY * PLAYER_SPEED * weakenedMultiplier * deltaSeconds;

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
  const visibleWorld = coordinateSystem.getVisibleWorldRect();
  const nextCamera = coordinateSystem.clampCameraPosition({
    x: player.x - visibleWorld.width / 2,
    y: player.y - visibleWorld.height / 2,
    zoom: camera.zoom,
  });
  camera.x = nextCamera.x;
  camera.y = nextCamera.y;
  camera.zoom = nextCamera.zoom;
}

function getCameraShakeOffset() {
  const isShaking = state.lastTimestamp < state.cameraShakeUntil;
  const magnitude = isShaking ? state.cameraShakeStrength : 0;
  return {
    x: magnitude ? Math.round(Math.sin(state.lastTimestamp * 0.19) * magnitude) : 0,
    y: magnitude ? Math.round(Math.cos(state.lastTimestamp * 0.27) * magnitude * 0.6) : 0,
  };
}

function applyCameraTransform() {
  const origin = coordinateSystem.worldToScreen({ x: 0, y: 0 }, { includeRenderOffset: true });
  ctx.translate(origin.x, origin.y);
  ctx.scale(camera.zoom, camera.zoom);
}

function handleLevelTransitions() {
  refreshBlockedExits();

  for (const exit of currentLevel().exits) {
    if (!isExitAvailable(exit)) {
      continue;
    }

    const target = getExitTarget(exit);

    if (state.blockedExitIds.has(exit.id)) {
      continue;
    }

    if (isExitTriggered(exit)) {
      loadLevel(target, exit.spawn, { showTitleCard: true });
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
    updateContextualControls("interact");
    return;
  }

  state.activeInteractionId = null;
  const nearbyMonster = getNearestMonster(72);

  if (nearbyMonster) {
    interactionPrompt.textContent = `J tấn công • K phản đòn ${nearbyMonster.name}`;
    interactionPrompt.classList.remove("hidden");
    updateContextualControls("combat");
    return;
  }

  const exitHint = getActiveExitHint();

  if (exitHint) {
    interactionPrompt.textContent = exitHint.prompt;
    interactionPrompt.classList.remove("hidden");
    updateContextualControls("exit");
    return;
  }

  interactionPrompt.classList.add("hidden");
  updateContextualControls("move");
}

function updateContextualControls(context) {
  if (!actionHint) {
    return;
  }

  const hints = {
    interact: "E tương tác • J tấn công • K phản đòn • B sách",
    combat: "J tấn công/tích lực • L lướt • K phản đòn",
    exit: "Theo lối ra • E khi có điểm tương tác",
    move: "WASD di chuyển • L lướt • J tấn công • K phản đòn • B sách",
  };
  actionHint.textContent = hints[context] ?? hints.move;
}

function getActiveExitHint() {
  for (const exit of currentLevel().exits) {
    if (!isExitAvailable(exit)) {
      continue;
    }

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

  const progress = getZoneProgressText(state.currentLevelId);
  questChip.textContent = objective
    ? `${progress} • ${objective.label} - ${formatNavigationDistance(objective.distance)}`
    : `${progress} • Tự do thám hiểm`;
}

function getZoneProgressText(levelId) {
  switch (levelId) {
    case "hub": {
      if (!state.quests.tvaBriefingAccepted) return "Chưa rõ nơi chốn";
      if (state.quests.tvaPortalTarget) return "Cổng đã mở";
      if (getPendingTvaRelicIds().length > 0) return "Có tín vật mới";
      if (!getNextTvaRoute()) return `Tín vật ${state.inventory.size}/${RELIC_TARGET_COUNT}`;
      return "Chờ điều phối";
    }
    case "village": return `Công nhân ${state.quests.zone1Delivered.size}/3`;
    case "archive": return `Mảnh ghép ${state.quests.zone2Fragments.size}/3`;
    case "crossroads": return `Lực lượng ${state.quests.zone3Recruits.size}/4`;
    case "spring": return `Nông hộ ${state.quests.zone4Farmers.size}/3`;
    default: return `Tín vật ${state.inventory.size}/${RELIC_TARGET_COUNT}`;
  }
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
  if (!item || item.collected || (item.used && item.interactionType !== "tvaBriefing")) {
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
  if (!monster || monster.defeated || !isMonsterActive(monster)) {
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
  if (!exit || !isExitAvailable(exit) || state.blockedExitIds.has(exit.id)) {
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

function getHubNavigationTarget() {
  if (state.quests.tvaPortalTarget) {
    const route = getTvaRoute(state.quests.tvaPortalTarget);
    return createExitNavigationTarget(
      getLevelExit("tva-dispatch-portal"),
      `Bước qua cổng tới ${route?.label ?? "tọa độ đã chọn"}`,
      "#9fe3ba"
    );
  }

  const pendingRelics = getPendingTvaRelicIds();
  const label = !state.quests.tvaBriefingAccepted
    ? "Đi theo hành lang tới người nhân viên"
    : pendingRelics.length > 0
      ? "Mang tín vật cho David"
      : getNextTvaRoute()
        ? "Hỏi David về tọa độ tiếp theo"
        : "Hoàn tất hồ sơ với David";

  return createInteractableNavigationTarget(
    getLevelInteractable("tva-clerk-placeholder"),
    label,
    "#e6c36d"
  );
}

function getTvaRoute(levelId) {
  return TVA_DISPATCH_ROUTES.find((route) => route.levelId === levelId) ?? null;
}

function isTvaRouteComplete(route) {
  return Boolean(route) && (
    state.completedZones.has(route.levelId) ||
    route.relicIds.every((relicId) => state.inventory.has(relicId))
  );
}

function getNextTvaRoute() {
  return TVA_DISPATCH_ROUTES.find((route) => !isTvaRouteComplete(route)) ?? null;
}

function getPendingTvaRelicIds() {
  return REQUIRED_RELIC_IDS.filter(
    (relicId) => state.inventory.has(relicId) && !state.quests.tvaReportedRelics.has(relicId)
  );
}

function getExitTarget(exit) {
  if (!exit) {
    return null;
  }

  if (typeof exit.targetFromState === "function") {
    return exit.targetFromState() ?? null;
  }

  return exit.target ?? null;
}

function isExitAvailable(exit) {
  if (typeof exit?.availableWhen === "function" && !exit.availableWhen()) {
    return false;
  }

  if (typeof exit?.availableWhen === "boolean" && !exit.availableWhen) {
    return false;
  }

  return Boolean(getExitTarget(exit));
}

function getVillageNavigationTarget() {
  if (state.quests.zone1RewardClaimed) {
    return createExitNavigationTarget(getLevelExit("back-to-hub-1"), "Quay về trung tâm", "#f3d777");
  }

  if (!state.quests.zone1Started) {
    return createInteractableNavigationTarget(getLevelInteractable("le-paria-stack"), "Nhận báo Le Paria", "#d7ebff");
  }

  const workerTargets = pickNearestNavigationTarget([
    state.quests.zone1Delivered.has("worker-1")
      ? null
      : createInteractableNavigationTarget(getLevelInteractable("worker-harbor-1"), "Đưa báo cho công nhân 1", "#d7ebff"),
    state.quests.zone1Delivered.has("worker-2")
      ? null
      : createInteractableNavigationTarget(getLevelInteractable("worker-harbor-2"), "Đưa báo cho công nhân 2", "#d7ebff"),
    state.quests.zone1Delivered.has("worker-3")
      ? null
      : createInteractableNavigationTarget(getLevelInteractable("worker-harbor-3"), "Đưa báo cho công nhân 3", "#d7ebff"),
  ]);

  if (workerTargets) {
    return workerTargets;
  }

  return createInteractableNavigationTarget(getLevelInteractable("red-compass-reward"), "Nhận Chiếc La Bàn Đỏ", "#f3d777");
}

function getArchiveNavigationTarget() {
  if (state.quests.zone2RewardClaimed) {
    return createExitNavigationTarget(getLevelExit("back-to-hub-2"), "Quay về trung tâm", "#f3d777");
  }

  if (state.quests.zone2Fragments.size < 3) {
    return pickNearestNavigationTarget([
      state.quests.zone2Fragments.has("west")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("delegate-west"), "Thuyết phục nhóm phía Tây", "#f4d9af"),
      state.quests.zone2Fragments.has("east")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("delegate-east"), "Thuyết phục nhóm phía Đông", "#f4d9af"),
      state.quests.zone2Fragments.has("north")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("delegate-north"), "Thuyết phục nhóm phía Bắc", "#f4d9af"),
    ]);
  }

  if (!state.quests.zone2TowerActivated) {
    return createInteractableNavigationTarget(getLevelInteractable("archive-lens-console"), "Kích hoạt Tháp lưu trữ", "#f3d777");
  }

  return createInteractableNavigationTarget(getLevelInteractable("unity-round-table"), "Nhận Biểu trưng Thống nhất", "#f3d777");
}

function getCrossroadsNavigationTarget() {
  if (state.quests.zone3ThreadClaimed && state.quests.zone3MapClaimed) {
    return createExitNavigationTarget(getLevelExit("back-to-hub-3"), "Quay về trung tâm", "#f3d777");
  }

  const targets = [];

  if (!state.quests.zone3ThreadClaimed) {
    if (state.quests.zone3Recruits.size < 4) {
      targets.push(
        state.quests.zone3Recruits.has("farmer")
          ? null
          : createInteractableNavigationTarget(getLevelInteractable("recruit-farmer"), "Mời nông dân vào mặt trận", "#f3dc7f"),
        state.quests.zone3Recruits.has("worker")
          ? null
          : createInteractableNavigationTarget(getLevelInteractable("recruit-worker"), "Mời công nhân vào mặt trận", "#f3dc7f"),
        state.quests.zone3Recruits.has("intellectual")
          ? null
          : createInteractableNavigationTarget(getLevelInteractable("recruit-intellectual"), "Mời trí thức yêu nước", "#f3dc7f"),
        state.quests.zone3Recruits.has("bourgeois")
          ? null
          : createInteractableNavigationTarget(getLevelInteractable("recruit-bourgeois"), "Mời tư sản dân tộc", "#f3dc7f")
      );
    } else {
      targets.push(
        createInteractableNavigationTarget(getLevelInteractable("vietminh-cadre"), "Nhận Sợi Chỉ Đỏ Việt Minh", "#f3d777")
      );
    }
  }

  if (!state.quests.zone3MapClaimed) {
    if (state.quests.zone3HamletsFreed.size < 3) {
      targets.push(
        state.quests.zone3HamletsFreed.has("hamlet-1")
          ? null
          : createInteractableNavigationTarget(getLevelInteractable("hamlet-1"), "Phá ấp chiến lược 1", "#f08a61"),
        state.quests.zone3HamletsFreed.has("hamlet-2")
          ? null
          : createInteractableNavigationTarget(getLevelInteractable("hamlet-2"), "Phá ấp chiến lược 2", "#f08a61"),
        state.quests.zone3HamletsFreed.has("hamlet-3")
          ? null
          : createInteractableNavigationTarget(getLevelInteractable("hamlet-3"), "Phá ấp chiến lược 3", "#f08a61")
      );
    } else {
      const boss = getLevelMonster("southern-tyrant");

      if (boss && !boss.defeated) {
        targets.push(createMonsterNavigationTarget(boss, "Đánh bại bộ máy áp bức", "#e96558"));
      } else {
        targets.push(
          createInteractableNavigationTarget(getLevelInteractable("resistance-commander"), "Nhận Bản đồ Vĩ tuyến 17", "#f3d777")
        );
      }
    }
  }

  return pickNearestNavigationTarget(targets);
}

function getSpringNavigationTarget() {
  if (state.quests.zone4GearClaimed) {
    return createExitNavigationTarget(getLevelExit("back-to-hub-4"), "Quay về trung tâm", "#f3d777");
  }

  if (state.quests.zone4Barriers.size < 3) {
    return pickNearestNavigationTarget([
      state.quests.zone4Barriers.has("wall-1")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("bao-cap-wall-1"), "Phá hàng rào 1", "#d7efab"),
      state.quests.zone4Barriers.has("wall-2")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("bao-cap-wall-2"), "Phá hàng rào 2", "#d7efab"),
      state.quests.zone4Barriers.has("wall-3")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("bao-cap-wall-3"), "Phá hàng rào 3", "#d7efab"),
    ]);
  }

  if (state.quests.zone4Farmers.size < 3) {
    return pickNearestNavigationTarget([
      state.quests.zone4Farmers.has("farmer-1")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("farmer-khoan-1"), "Trao Khoán 10 cho nông dân 1", "#d7efab"),
      state.quests.zone4Farmers.has("farmer-2")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("farmer-khoan-2"), "Trao Khoán 10 cho nông dân 2", "#d7efab"),
      state.quests.zone4Farmers.has("farmer-3")
        ? null
        : createInteractableNavigationTarget(getLevelInteractable("farmer-khoan-3"), "Trao Khoán 10 cho nông dân 3", "#d7efab"),
    ]);
  }

  return createInteractableNavigationTarget(getLevelInteractable("doi-moi-leader"), "Nhận Bánh răng Đổi Mới", "#f3d777");
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
  const point = coordinateSystem.worldToScreen({ x, y });
  const screenX = point.x;
  const screenY = point.y;

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
  applyCameraTransform();
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
  applyCameraTransform();
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
    saveGameProgress();
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
    case "tvaBriefing":
      return true;
    case "colonialRecruitment":
      return state.quests.zone1Started &&
        state.quests.zone1Delivered.size < 3 &&
        state.quests.zone1SoldierDecision === null;
    case "collectFragment":
      return !state.quests.zone2Fragments.has(item.fragmentId);
    case "activateArchiveLens":
      return state.quests.zone2Fragments.size === 3 && !state.quests.zone2TowerActivated;
    case "rewardEmblem":
      return state.quests.zone2TowerActivated && !state.quests.zone2RewardClaimed;
    case "emblemVerdict":
      return state.quests.zone2TowerActivated && !state.quests.zone2RewardClaimed;
    case "splitChoice":
      return !item.used && !item.purified;
    case "recruit":
      return !state.quests.zone3Recruits.has(item.recruitId);
    case "rewardThread":
      return !state.quests.zone3ThreadClaimed;
    case "rallyChoice":
    case "augustVerdict":
      return !state.quests.zone3ThreadClaimed;
    case "rescueHamlet":
      return !state.quests.zone3HamletsFreed.has(item.hamletId);
    case "rewardMap":
      return !state.quests.zone3MapClaimed;
    case "borderVerdict":
      return !state.quests.zone3MapClaimed;
    case "temporaryLineChoice":
      return !item.used;
    case "permanentDivision":
      return !item.used;
    case "breakBarrier":
      return !state.quests.zone4Barriers.has(item.barrierId);
    case "deliverKhoan10":
      return !state.quests.zone4Farmers.has(item.farmerId);
    case "rewardGear":
      return !state.quests.zone4GearClaimed;
    case "doiMoiVerdict":
      return !state.quests.zone4GearClaimed;
    case "productionChoice":
    case "stalledMechanismChoice":
      return !item.used && !item.purified;
    default:
      return true;
  }
}

function getNearestMonster(maxDistance = Infinity) {
  let nearest = null;
  let nearestDistance = maxDistance;

  for (const monster of currentLevel().monsters ?? []) {
    if (monster.defeated || !isMonsterActive(monster)) {
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
      startDialogue(item);
      return;
    case "deliverPaper":
      if (!state.quests.zone1Started) {
        showStoryToast("Bạn cần nhận báo từ người liên lạc trước.");
        return;
      }
      state.quests.zone1Delivered.add(item.workerId);
      startZoneNpcMove(item.id);
      showStoryToast(`Đã phát ${state.quests.zone1Delivered.size}/3 tờ báo cho công nhân.`);
      if (state.quests.zone1Delivered.size === 3) {
        showStoryToast("Khối công nhân đã thức tỉnh. Hãy quay lại gặp người liên lạc.");
      }
      return;
    case "rewardCompass":
      if (state.quests.zone1Delivered.size < 3) {
        showStoryToast("Người liên lạc chỉ trao vật phẩm khi báo đã tới đủ tay người lao động.");
        return;
      }
      item.interactionType = "compassVerdict";
      startDialogue(item);
      return;
    case "offerBribe":
      item.used = true;
      adjustSaDoa(34, "Bạn nhận vinh hoa làm tay sai cho mẫu quốc. Tha hóa tăng mạnh.");
      return;
    case "tvaBriefing":
      startDialogue(item);
      return;
    case "colonialRecruitment":
      startDialogue(item);
      return;
    case "collectFragment":
      state.quests.zone2Fragments.add(item.fragmentId);
      startZoneNpcMove(item.id);
      showStoryToast(`Bạn đã hòa giải được ${state.quests.zone2Fragments.size}/3 nhóm trong căn nhà ba gian.`);
      return;
    case "activateArchiveLens":
      state.quests.zone2TowerActivated = true;
      item.collected = true;
      showStoryToast("Tháp lưu trữ đã ghép ba nguồn tư liệu. Hãy trở về bàn tròn để nhận biểu trưng thống nhất.");
      return;
    case "rewardEmblem":
      if (!state.quests.zone2TowerActivated) {
        showStoryToast("Ba nguồn tư liệu cần được kích hoạt tại Tháp lưu trữ trước.");
        return;
      }
      item.interactionType = "emblemVerdict";
      startDialogue(item);
      return;
    case "splitChoice":
      startDialogue(item);
      return;
    case "recruit":
      state.quests.zone3Recruits.add(item.recruitId);
      startZoneNpcMove(item.id);
      showStoryToast(`Khối đại đoàn kết đã quy tụ ${state.quests.zone3Recruits.size}/4 lực lượng.`);
      return;
    case "rewardThread":
      if (state.quests.zone3Recruits.size < 4) {
        showStoryToast("Quảng trường Đỏ cần đủ nông dân, công nhân, trí thức và tư sản dân tộc.");
        return;
      }
      item.interactionType = "rallyChoice";
      item.dialogueKey = "vietminh-rally";
      startDialogue(item);
      return;
    case "rallyChoice":
    case "augustVerdict":
      startDialogue(item);
      return;
    case "rescueHamlet":
      state.quests.zone3HamletsFreed.add(item.hamletId);
      item.collected = true;
      showStoryToast(`Bạn đã phá ${state.quests.zone3HamletsFreed.size}/3 ấp chiến lược.`);
      return;
    case "rewardMap": {
      if (state.quests.zone3HamletsFreed.size < 3) {
        showStoryToast("Người dân miền Nam vẫn còn mắc kẹt trong các ấp chiến lược.");
        return;
      }

      if (!state.quests.zone3BossDefeated) {
        showStoryToast("Bạn phải đánh bại bộ máy áp bức trước khi nhận Bản đồ hàn gắn.");
        return;
      }

      item.interactionType = "borderVerdict";
      item.dialogueKey = "border-verdict";
      startDialogue(item);
      return;
    }
    case "borderVerdict":
    case "temporaryLineChoice":
      startDialogue(item);
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
      startZoneNpcMove(item.id);
      showStoryToast(`Khoán 10 đã tới ${state.quests.zone4Farmers.size}/3 hộ nông dân.`);
      return;
    case "rewardGear":
      if (state.quests.zone4Barriers.size < 3 || state.quests.zone4Farmers.size < 3) {
        showStoryToast("Hãy phá hết rào cản và trao đủ Khoán 10 cho nông dân.");
        return;
      }
      item.interactionType = "doiMoiVerdict";
      item.dialogueKey = "doi-moi-verdict";
      startDialogue(item);
      return;
    case "productionChoice":
    case "stalledMechanismChoice":
    case "doiMoiVerdict":
      startDialogue(item);
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
  const storyUnlocked = unlockStory(relic?.storyId, { silent: true });
  const relicLabel = relic?.label ?? "tín vật lạ";
  const bookHint = storyUnlocked
    ? "Đã thêm vào Sách lịch sử và sẽ mở đúng chương thuyết trình."
    : "";
  state.inventory.add(itemId);
  updateProgressHud();
  saveGameProgress();

  showStoryToast(
    [
      `Nhận được ${relicLabel}.`,
      bookHint,
      guidance,
    ]
      .filter(Boolean)
      .join(" ")
  );

  if (storyUnlocked) {
    scheduleRelicBookOpen(relic.storyId);
  }

  if (state.currentLevelId !== "hub") {
    window.setTimeout(() => showZoneSummary(state.currentLevelId, itemId), 180);
  }

  return true;
}

function adjustSaDoa(delta, message = "") {
  state.saDoa = clamp(state.saDoa + delta, 0, SA_DOA_MAX);
  updateProgressHud();
  saveGameProgress();

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

function isBadEndingId(endingId) {
  return endingId === "bad" || NARRATIVE_ENDING_DEFINITIONS[endingId]?.kind === "bad";
}

function triggerNarrativeEnding(candidate, summary) {
  const ending = NARRATIVE_ENDING_DEFINITIONS[candidate?.id];

  if (!ending || ending.kind !== "bad") {
    triggerBadEnding(summary);
    return;
  }

  state.narrative.endingsUnlocked.add(candidate.id);
  state.endingId = candidate.id;
  state.endingSummary = summary;
  saveGameProgress();
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
  drawCombatFeedback();
  drawNavigationAssist();
  drawMiniMap();
  drawDialoguePortrait();
}

function drawDialoguePortrait() {
  if (!dialoguePortrait || !dialoguePortraitCtx || state.mode !== "dialogue") {
    dialoguePortrait?.classList.add("hidden");
    dialogueBox.classList.remove("has-portrait");
    return;
  }

  dialoguePortraitCtx.clearRect(0, 0, dialoguePortrait.width, dialoguePortrait.height);
  dialoguePortraitCtx.imageSmoothingEnabled = false;
  const speaker = dialogueBox.dataset.portraitSpeaker;
  const interactionId = state.activeDialogue?.interactionId;
  let drawn = false;

  if (speaker === "David") {
    drawn = drawNpcSpriteActorToContext(dialoguePortraitCtx, {
      spriteKey: "tvaEmployee",
      direction: "left",
      x: 73,
      y: 118,
      scale: 2.42,
      animation: "idle",
    });
  } else if (speaker === "Nhà du hành") {
    drawn = drawPlayerSpriteActorToContext(dialoguePortraitCtx, {
      direction: "down",
      x: 73,
      y: 118,
      scale: 2.7,
      animation: "idle",
    });
  } else if (!["colonial-recruiter"].includes(interactionId)) {
    const spriteKey = interactionId === "nguyen-ai-quoc" || interactionId === "le-paria-stack"
      ? "npc06"
      : interactionId === "tenant-farmer" || interactionId === "old-peasant"
        ? "npc02"
        : "npc01";
    drawn = drawNpcSpriteActorToContext(dialoguePortraitCtx, {
      spriteKey,
      direction: "down",
      x: 73,
      y: 118,
      scale: 2.7,
      animation: "idle",
    });
  }

  dialoguePortrait.classList.toggle("hidden", !drawn);
  dialogueBox.classList.toggle("has-portrait", drawn);
}

function drawCombatFeedback() {
  if (state.lastTimestamp < state.combatFlashUntil) {
    const progress = (state.combatFlashUntil - state.lastTimestamp) / 150;
    ctx.fillStyle = `rgba(221, 73, 73, ${0.16 * clamp(progress, 0, 1)})`;
    ctx.fillRect(0, 0, VIEWPORT.width, VIEWPORT.height);
  }

  state.combatImpacts = state.combatImpacts.filter((impact) => state.lastTimestamp < impact.endsAt);
  for (const impact of state.combatImpacts) {
    const progress = clamp((state.lastTimestamp - impact.startedAt) / (impact.endsAt - impact.startedAt), 0, 1);
    const size = Math.round(8 + progress * 16);
    const screen = coordinateSystem.worldToScreen(impact);
    ctx.save();
    ctx.globalAlpha = 1 - progress;
    if (canDrawSprite(effectSprites.sparkle)) {
      ctx.drawImage(effectSprites.sparkle, Math.round(screen.x - size / 2), Math.round(screen.y - size / 2), size, size);
    }
    ctx.restore();
  }
}

function drawMiniMap() {
  miniMapRenderer.draw();
}

function drawWorld() {
  ctx.clearRect(0, 0, VIEWPORT.width, VIEWPORT.height);

  ctx.save();
  applyCameraTransform();

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

  const profile = getZoneProfile();

  if (profile) {
    drawZoneLandmark(profile);
    drawZoneProgressScene(profile);
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
  if (!exit.portal || !isExitAvailable(exit)) {
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
  ctx.fillStyle = "#26231e";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  const hasOfficeBackground = drawCoverImage(environmentSprites.generatedWorlds?.tvaOffice, 0, 0, WORLD.width, WORLD.height, {
    alpha: 1,
    filter: "saturate(0.9) brightness(0.88) contrast(1.05)",
    overlayColor: "rgba(23, 18, 12, 0.04)",
  });

  if (!hasOfficeBackground) {
    ctx.fillStyle = "#3c3932";
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    ctx.fillStyle = "#7c6b4b";
    ctx.fillRect(250, 0, 460, WORLD.height);
    ctx.fillStyle = "#292720";
    ctx.fillRect(0, 0, 250, WORLD.height);
    ctx.fillRect(710, 0, 250, WORLD.height);
  }

  const arrivalMark = decorations.arrivalMark;
  if (arrivalMark) {
    ctx.save();
    ctx.globalAlpha = state.quests.tvaBriefingAccepted ? 0.16 : 0.34;
    ctx.strokeStyle = "#9c895f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(arrivalMark.x, arrivalMark.y, arrivalMark.radiusX, arrivalMark.radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  for (const signal of decorations.crtSignals ?? []) {
    const pulse = 0.55 + (Math.sin(state.lastTimestamp * 0.005 + signal.phase) + 1) * 0.18;
    ctx.fillStyle = `rgba(151, 190, 91, ${pulse})`;
    ctx.fillRect(signal.x - 2, signal.y - 1, 4, 3);
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

  const hasHarborHero = drawCoverImage(
    environmentSprites.generatedWorlds?.colonialHarbor,
    0,
    0,
    WORLD.width,
    WORLD.height,
    {
      alpha: 0.94,
      filter: "saturate(0.9) brightness(0.86) contrast(1.02)",
    }
  );

  if (hasHarborHero) {
    return;
  }

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

function drawUnityHouseWorld(decorations) {
  ctx.fillStyle = "#191411";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  const hasArchiveHero = drawCoverImage(
    environmentSprites.generatedWorlds?.archiveInterior,
    0,
    0,
    WORLD.width,
    WORLD.height,
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
  applyCameraTransform();

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
    if (monster.defeated || !isMonsterActive(monster)) {
      continue;
    }

    drawMonster(monster);
  }

  drawWorldDrops();
  drawLevelHazards();
  drawBreakables();
  drawEnemyProjectiles();

  ctx.restore();
}

function drawWorldDrops() {
  for (const drop of currentLevel().drops ?? []) {
    const bob = Math.sin((state.lastTimestamp + drop.x * 13) / 180) * 2;
    ctx.fillStyle = drop.type === "health" ? "#ef7c6d" : "#8fd8d0";
    ctx.fillRect(drop.x - 4, drop.y - 8 + bob, 8, 8);
    ctx.fillStyle = "rgba(255,255,235,0.78)";
    ctx.fillRect(drop.x - 2, drop.y - 10 + bob, 4, 3);
  }
}

function drawLevelHazards() {
  for (const trap of currentLevel().traps ?? []) {
    const active = state.lastTimestamp < trap.cooldownUntil + 180;
    ctx.save();
    ctx.globalAlpha = active ? 0.78 : 0.4;
    ctx.strokeStyle = active ? "#ff775f" : "#b75a51";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(trap.x, trap.y, trap.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawBreakables() {
  for (const [index, breakable] of (currentLevel().breakables ?? []).entries()) {
    if (breakable.destroyed) {
      continue;
    }
    drawBreakableSprite(breakable, index);
  }
}

function drawBreakableSprite(breakable, index) {
  const width = Math.max(18, breakable.width + 6);
  const height = Math.max(18, breakable.height + 6);
  const left = Math.round(breakable.x - width / 2);
  const top = Math.round(breakable.y - height / 2);
  const sprite = index % 3 === 1 ? KENNEY_ROGUELIKE_SPRITES.barrel : KENNEY_ROGUELIKE_SPRITES.crate;
  const damaged = breakable.health < (breakable.maxHealth ?? 2);

  ctx.fillStyle = "rgba(12, 14, 18, 0.28)";
  ctx.fillRect(left + 3, top + height - 3, width - 6, 3);

  if (!drawKenneyRoguelikeSprite(sprite, left, top, width, height, { filter: damaged ? "brightness(0.82) saturate(0.76)" : "brightness(1.05) saturate(1.02)" })) {
    ctx.fillStyle = "#76523b";
    ctx.fillRect(left, top, width, height);
    ctx.strokeStyle = "#cf9f62";
    ctx.strokeRect(left + 1, top + 1, width - 2, height - 2);
  }

  if (damaged) {
    ctx.strokeStyle = "rgba(55, 28, 24, 0.86)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left + 5, top + 4);
    ctx.lineTo(left + width / 2, top + height - 5);
    ctx.lineTo(left + width - 5, top + 6);
    ctx.stroke();
  }
}

function drawEnemyProjectiles() {
  for (const projectile of state.enemyProjectiles) {
    ctx.fillStyle = projectile.reflected ? "#ffe39a" : "#d9e9ff";
    ctx.fillRect(projectile.x - 3, projectile.y - 3, 6, 6);
    ctx.fillStyle = projectile.reflected ? "#e58d42" : "#6b85d5";
    ctx.fillRect(projectile.x - 1, projectile.y - 5, 2, 10);
  }
}

function shouldDrawInteractable(item) {
  if (item.interactionType === "rewardCompass") {
    return state.quests.zone1Delivered.size === 3 && !state.quests.zone1RewardClaimed;
  }

  if (item.interactionType === "rewardEmblem") {
    return state.quests.zone2TowerActivated && !state.quests.zone2RewardClaimed;
  }

  if (item.interactionType === "activateArchiveLens") {
    return state.quests.zone2Fragments.size === 3 && !state.quests.zone2TowerActivated;
  }

  return !item.collected;
}

function getTvaEmployeeDisplay(npc) {
  if (npc.id !== "tva-clerk-placeholder") {
    return npc;
  }

  const scale = getTvaActorScale();

  if (state.quests.tvaBriefingAccepted) {
    return { ...npc, scale };
  }

  const approachProgress = clamp((380 - player.y) / 100, 0, 1);
  const startY = npc.approachFromY ?? npc.y;

  return {
    ...npc,
    y: startY + (npc.y - startY) * approachProgress,
    direction: "down",
    animation: approachProgress > 0 && approachProgress < 1 ? "walk" : "idle",
    frameOffset: 0.42,
    scale,
  };
}

function getTvaActorScale() {
  return window.innerWidth <= 820 ? TVA_ACTOR_SCALE_COMPACT : TVA_ACTOR_SCALE;
}

function drawNpc(npc) {
  const recoveredNpc = getZoneRecoveryNpcDisplay(getZoneNpcDisplay(getTvaEmployeeDisplay(npc)));
  const monsterSpriteConfig = MONSTER_SPRITE_CONFIG[recoveredNpc.artKey];
  const shadowWidth = monsterSpriteConfig?.shadowWidth ?? 14;
  ctx.fillStyle = "rgba(11, 13, 16, 0.35)";
  ctx.fillRect(recoveredNpc.x - shadowWidth / 2, recoveredNpc.y + 8, shadowWidth, 4);

  if (monsterSpriteConfig && drawMonsterSprite({
    ...recoveredNpc,
    animationState: "idle",
    moveDirection: recoveredNpc.direction,
    horizontalFacing: recoveredNpc.direction,
    phase: 0,
  }, false)) {
    return;
  }

  if (drawNpcSpriteActor(recoveredNpc)) {
    return;
  }

  ctx.fillStyle = "#35292b";
  ctx.fillRect(recoveredNpc.x - 6, recoveredNpc.y - 10, 12, 4);

  ctx.fillStyle = "#d5b59a";
  ctx.fillRect(recoveredNpc.x - 4, recoveredNpc.y - 8, 8, 6);

  ctx.fillStyle = "#6a635d";
  ctx.fillRect(recoveredNpc.x - 6, recoveredNpc.y - 2, 12, 8);

  ctx.fillStyle = "#4a4b50";
  ctx.fillRect(recoveredNpc.x - 7, recoveredNpc.y + 1, 4, 7);
  ctx.fillRect(recoveredNpc.x + 3, recoveredNpc.y + 3, 3, 6);

  ctx.fillStyle = "#2a2527";
  ctx.fillRect(recoveredNpc.x - 4, recoveredNpc.y + 6, 4, 7);
  ctx.fillRect(recoveredNpc.x + 1, recoveredNpc.y + 8, 4, 5);
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

  if (item.variant === "archive-lens-console") {
    drawArchiveLensConsole(item);
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

function drawArchiveLensConsole(item) {
  const pulse = 0.65 + (Math.sin(state.lastTimestamp * 0.006) + 1) * 0.16;
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = `rgba(255, 225, 138, ${pulse})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(item.x, item.y + 6, 24 + Math.sin(state.lastTimestamp * 0.004) * 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 230, 144, 0.28)";
  ctx.fillRect(item.x - 5, item.y + 1, 10, 10);
  ctx.restore();
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
  const artKey = getMonsterArtKey(monster);
  const spriteConfig = MONSTER_SPRITE_CONFIG[artKey] ?? MONSTER_SPRITE_CONFIG[monster.variant];
  const shadowWidth = spriteConfig?.shadowWidth ?? 20;
  const isAttacking = state.lastTimestamp < (monster.attackEndsAt ?? 0);

  if (monster.telegraphEndsAt && state.lastTimestamp < monster.telegraphEndsAt) {
    drawMonsterTelegraph(monster);
  }

  ctx.fillStyle = "rgba(12, 14, 18, 0.28)";
  ctx.fillRect(monster.x - shadowWidth / 2, monster.y + 10, shadowWidth, 4);

  const drewSprite = drawMonsterSprite(monster, hitFlash);
  if (!drewSprite && !artKey.startsWith("zone1") && !isDedicatedMonsterArtKey(artKey)) {
    const palette = getMonsterPalette(monster.variant, hitFlash);
    const attackProgress = isAttacking ? getTimedProgress(monster.attackStartedAt, monster.attackEndsAt) : 0;
    const attackOffset = getAttackLungeOffset(monster.attackDirection, attackProgress, ATTACK_LUNGE_DISTANCE * 0.8);
    const monsterX = monster.x + attackOffset.x;
    const monsterY = monster.y + attackOffset.y;

    if (drawArchetypeMonster(monster, palette, monsterX, monsterY)) {
      drawMonsterHealthBar(monster);
      return;
    }

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

  if (isAttacking && monster.archetype !== "ranged") {
    const progress = getTimedProgress(monster.attackStartedAt, monster.attackEndsAt);
    drawAttackSlash(monster.x, monster.y, monster.attackDirection, progress, {
      scale: 0.72,
      color: "rgba(255, 121, 91, 0.9)",
      highlightColor: "rgba(255, 225, 188, 0.78)",
      shadowColor: "rgba(76, 15, 18, 0.6)",
    });
  }

  if (!monster.defeated) {
    drawMonsterHealthBar(monster);
  }
}

function drawArchetypeMonster(monster, palette, x, y) {
  if (!monster.archetype) {
    return false;
  }

  ctx.save();
  if (monster.elite) {
    ctx.fillStyle = "rgba(245, 195, 95, 0.24)";
    ctx.beginPath();
    ctx.arc(x, y, 19, 0, Math.PI * 2);
    ctx.fill();
  }

  if (monster.archetype === "ranged") {
    ctx.fillStyle = palette.body;
    ctx.fillRect(x - 5, y - 12, 10, 20);
    ctx.fillStyle = palette.detail;
    ctx.fillRect(x - 4, y - 17, 8, 6);
    ctx.fillStyle = "#c8d8ef";
    ctx.fillRect(x + 4, y - 5, 12, 3);
    ctx.fillRect(x + 13, y - 7, 3, 7);
  } else if (monster.archetype === "support") {
    ctx.fillStyle = palette.body;
    ctx.beginPath();
    ctx.moveTo(x, y - 17);
    ctx.lineTo(x - 12, y + 12);
    ctx.lineTo(x + 12, y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = palette.detail;
    ctx.fillRect(x - 4, y - 18, 8, 7);
    ctx.fillStyle = "#d69ee8";
    ctx.fillRect(x + 10, y - 16, 3, 24);
    ctx.fillRect(x + 7, y - 19, 9, 4);
  } else {
    ctx.fillStyle = palette.body;
    ctx.fillRect(x - 10, y - 10, 20, 20);
    ctx.fillStyle = palette.detail;
    ctx.fillRect(x - 7, y - 16, 14, 7);
    ctx.fillStyle = palette.crest;
    ctx.fillRect(x - 14, y - 5, 4, 12);
    ctx.fillRect(x + 10, y - 5, 4, 12);
  }

  ctx.fillStyle = palette.eye;
  ctx.fillRect(x - 2, y - 12, 4, 2);
  if (monster.elite) {
    ctx.fillStyle = "#f5cf73";
    ctx.fillRect(x - 5, y - 23, 10, 3);
  }
  ctx.restore();
  return true;
}

function drawMonsterTelegraph(monster) {
  const duration = Math.max(1, monster.telegraphEndsAt - monster.telegraphStartsAt);
  const progress = clamp((state.lastTimestamp - monster.telegraphStartsAt) / duration, 0, 1);
  const radius = (monster.isBoss ? 30 : 20) + progress * (monster.isBoss ? 18 : 10);

  ctx.save();
  ctx.globalAlpha = 0.18 + progress * 0.28;
  ctx.fillStyle = "#e95d59";
  ctx.beginPath();
  ctx.arc(monster.x, monster.y + 8, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = "#fff1c4";
  ctx.lineWidth = monster.isBoss ? 2 : 1;
  ctx.stroke();
  ctx.restore();
}

function drawMonsterSprite(monster, hitFlash) {
  const artKey = getMonsterArtKey(monster);
  const config = MONSTER_SPRITE_CONFIG[artKey];
  const spriteSet = monsterSprites[artKey];
  const isAttacking = state.lastTimestamp < (monster.attackEndsAt ?? 0);
  const isDying = monster.defeated && state.lastTimestamp < (monster.deathEndsAt ?? 0);
  const isHurt = !isDying && state.lastTimestamp < (monster.hurtEndsAt ?? 0);
  const isHeavyAttack = isAttacking && monster.attackVariant === "slam" && config?.animations?.heavyAttack;
  const animationKey = isDying ? "death" : isHurt ? "hurt" : isHeavyAttack ? "heavyAttack" : isAttacking ? "attack" : monster.animationState === "run" ? "run" : "idle";
  const animation = config?.animations?.[animationKey] ?? config?.animations?.idle;
  const direction = getMonsterSpriteDirection(monster, config);
  const sprite = config?.directional
    ? config.directionalAnimation
      ? spriteSet?.[direction]?.[animationKey]
      : spriteSet?.[direction]
    : spriteSet?.[animationKey] ?? spriteSet?.idle;

  if (!config || !animation || !canDrawSprite(sprite)) {
    return false;
  }

  const startedAt = isDying
    ? monster.deathStartedAt
    : isHurt
      ? monster.hurtStartedAt
      : monster.attackStartedAt;
  const isOneShot = isAttacking || isHurt || isDying;
  const animationTime = isOneShot
    ? Math.max(0, state.lastTimestamp - (startedAt ?? state.lastTimestamp))
    : state.lastTimestamp + (monster.phase ?? 0) * 1000;
  const frameIndex = isOneShot
    ? Math.min(animation.frameCount - 1, Math.floor(animationTime / animation.frameDuration))
    : Math.floor(animationTime / animation.frameDuration) % animation.frameCount;
  const attackProgress = isAttacking ? getTimedProgress(monster.attackStartedAt, monster.attackEndsAt) : 0;
  const attackOffset = monster.archetype === "ranged"
    ? { x: 0, y: 0 }
    : getAttackLungeOffset(monster.attackDirection, attackProgress, ATTACK_LUNGE_DISTANCE);
  const directionalOffset = config.directionalOffsets?.[direction];
  const drawX = Math.round(monster.x + (directionalOffset?.x ?? config.drawOffsetX) + attackOffset.x);
  const drawY = Math.round(monster.y + (directionalOffset?.y ?? config.drawOffsetY) + attackOffset.y);

  const flipX = Boolean(config.flipForFacing && direction === "west");
  ctx.save();
  if (flipX) {
    ctx.translate(drawX + config.drawWidth, drawY);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(
    sprite,
    frameIndex * animation.frameWidth,
    0,
    animation.frameWidth,
    animation.frameHeight,
    flipX ? 0 : drawX,
    flipX ? 0 : drawY,
    config.drawWidth,
    config.drawHeight
  );
  ctx.restore();

  if (hitFlash) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(255, 236, 212, 0.26)";
    ctx.fillRect(drawX + 3, drawY + 3, config.drawWidth - 6, config.drawHeight - 8);
    ctx.restore();
  }

  return true;
}

function getMonsterArtKey(monster) {
  if (monster.artKey && MONSTER_SPRITE_CONFIG[monster.artKey]) {
    return monster.artKey;
  }
  const dedicatedArtKey = MONSTER_ART_KEY_BY_ID[monster.id];
  if (dedicatedArtKey) {
    return dedicatedArtKey;
  }
  if (state.currentLevelId === "village" && monster.isBoss) {
    return "zone1Captain";
  }
  if (state.currentLevelId === "village" && monster.archetype === "melee") {
    return "zone1Raider";
  }
  if (state.currentLevelId === "village" && monster.archetype === "ranged") {
    return "zone1Rifleman";
  }
  if (state.currentLevelId === "village" && monster.archetype === "support") {
    return "zone1Signalman";
  }
  if (monster.isBoss) {
    return "pixellabWarden";
  }
  if (monster.archetype === "melee") {
    return "pixellabRaider";
  }
  if (monster.archetype === "support") {
    return "pixellabChanter";
  }
  if (monster.archetype === "ranged") {
    return "rifleman";
  }
  return monster.variant;
}

function getMonsterSpriteDirection(monster, config = null) {
  const isEngaged = Boolean(monster.telegraphEndsAt) || state.lastTimestamp < (monster.attackEndsAt ?? 0);
  const direction = isEngaged
    ? monster.attackDirection
    : monster.moveDirection ?? monster.facingDirection ?? monster.attackDirection ?? getDirectionFromVector(player.x - monster.x, player.y - monster.y);

  if (config?.horizontalOnly) {
    const horizontalDirection = direction === "left" || direction === "right"
      ? direction
      : monster.horizontalFacing ?? "right";
    return horizontalDirection === "left" ? "west" : "east";
  }
  return { down: "south", up: "north", left: "west", right: "east" }[direction] ?? "south";
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
  const spriteConfig = MONSTER_SPRITE_CONFIG[getMonsterArtKey(monster)];
  const width = monster.isBoss ? 34 : spriteConfig?.healthBarWidth ?? 18;
  const ratio = monster.health / (monster.runtimeMaxHealth ?? monster.maxHealth);
  const y = monster.y + (monster.isBoss ? -26 : spriteConfig?.healthBarOffsetY ?? -18);
  const height = monster.isBoss ? 5 : 4;

  ctx.fillStyle = "rgba(18, 20, 23, 0.84)";
  ctx.fillRect(monster.x - width / 2, y, width, height);
  ctx.fillStyle = monster.isBoss ? "#f1b452" : "#95cf5f";
  ctx.fillRect(monster.x - width / 2 + 1, y + 1, Math.max(0, Math.round((width - 2) * ratio)), Math.max(1, height - 2));
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

  ctx.save();
  ctx.globalAlpha = 0.18 + (Math.sin(state.lastTimestamp / 140) + 1) * 0.08;
  ctx.fillStyle = "#ffe38b";
  ctx.beginPath();
  ctx.arc(item.x, item.y + 8, 19, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

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
  if (state.activeSkillEffect?.type !== "strike" && state.activeSkillEffect?.type !== "chargedStrike") {
    return 0;
  }

  return getTimedProgress(state.activeSkillEffect.startedAt, state.activeSkillEffect.endsAt);
}

function drawPlayer() {
  ctx.save();
  const playerScreen = coordinateSystem.worldToScreen(player, { includeRenderOffset: true });
  const actorScale = state.currentLevelId === "hub" ? getTvaActorScale() : 1;
  const isInvulnerable = state.lastTimestamp < state.invulnerableUntil;
  ctx.globalAlpha = isInvulnerable && Math.floor(state.lastTimestamp / 80) % 2 === 0 ? 0.48 : 1;
  ctx.translate(Math.round(playerScreen.x), Math.round(playerScreen.y));
  ctx.scale(actorScale * camera.zoom, actorScale * camera.zoom);

  ctx.fillStyle = "rgba(10, 12, 16, 0.32)";
  ctx.fillRect(-7, 9, 14, 4);

  const attackProgress = getPlayerAttackProgress();

  if (attackProgress > 0) {
    const attackDirection = state.activePlayerAnimation?.direction ?? player.direction;
    const attackOffset = getAttackLungeOffset(attackDirection, attackProgress);
    const squash = Math.sin(attackProgress * Math.PI);
    ctx.translate(Math.round(attackOffset.x), Math.round(attackOffset.y));
    ctx.scale(1 + squash * 0.04, 1 - squash * 0.03);
  }

  const animationFrame = getPlayerAnimationFrame();
  const sheet = playerSprites[animationFrame.animationName]?.[animationFrame.direction]
    ?? playerSprites[animationFrame.animationName]?.down;

  if (sheet?.complete && sheet.naturalWidth > 0) {
    const sourceX = animationFrame.frameIndex * PLAYER_SPRITE.frameWidth;

    ctx.drawImage(
      sheet,
      sourceX,
      0,
      PLAYER_SPRITE.frameWidth,
      PLAYER_SPRITE.frameHeight,
      PLAYER_SPRITE.drawCanvasOffsetX,
      PLAYER_SPRITE.drawCanvasOffsetY,
      PLAYER_SPRITE.frameWidth,
      PLAYER_SPRITE.frameHeight
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

function drawSkillEffect() {}

function drawAtmosphere() {
  const decorations = currentLevel().decorations ?? {};

  if (state.currentLevelId === "hub") {
    drawHubAtmosphere(decorations);
    return;
  }

  if (state.currentLevelId === "village") {
    drawFogDrift(decorations.fogBands ?? []);
    drawRain(decorations.rain ?? []);
    drawZoneAtmosphere(getZoneProfile());
    return;
  }

  if (state.currentLevelId === "archive") {
    drawUnityHouseAtmosphere(decorations);
    drawZoneAtmosphere(getZoneProfile());
    return;
  }

  if (state.currentLevelId === "crossroads") {
    drawRedSquareAtmosphere(decorations);
    drawZoneAtmosphere(getZoneProfile());
    return;
  }

  drawDoiMoiAtmosphere(decorations);
  drawZoneAtmosphere(getZoneProfile());
}

function drawZoneLandmark(profile) {
  const presentation = getZonePresentation(profile.levelId);
  const details = profile[presentation];
  const landmark = environmentSprites.landmarks?.[profile.landmark];
  const animatedFrames = environmentSprites.landmarkAnimationFrames?.[profile.landmark];
  const { x, y } = profile.landmarkPosition;
  const { width, height } = profile.landmarkSize;
  const pulse = 0.78 + (Math.sin(state.lastTimestamp * 0.003 + x) + 1) * 0.08;

  ctx.save();
  ctx.globalAlpha = presentation === "completed" ? 1 : 0.86;
  ctx.fillStyle = "rgba(9, 13, 18, 0.24)";
  ctx.fillRect(Math.round(x - width * 0.28), Math.round(y + height * 0.34), Math.round(width * 0.56), 7);
  const glowRadius = Math.max(width, height) * 0.82;
  const glow = ctx.createRadialGradient(x, y - height * 0.1, 0, x, y - height * 0.1, glowRadius);
  glow.addColorStop(0, details.tint);
  glow.addColorStop(0.55, "rgba(255, 224, 150, 0.06)");
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = pulse;
  ctx.fillStyle = glow;
  ctx.fillRect(Math.round(x - glowRadius), Math.round(y - height * 0.1 - glowRadius), Math.round(glowRadius * 2), Math.round(glowRadius * 2));
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = presentation === "completed" ? 1 : 0.86;

  if (animatedFrames?.every(canDrawSprite)) {
    drawZoneLandmarkAnimationFrame(animatedFrames, x, y, width, height);
  } else if (canDrawSprite(landmark)) {
    ctx.drawImage(landmark, Math.round(x - width / 2), Math.round(y - height), width, height);
  } else {
    ctx.fillStyle = presentation === "completed" ? "#e8c670" : "#8d9bae";
    ctx.fillRect(Math.round(x - 5), Math.round(y - height), 10, height);
    ctx.fillRect(Math.round(x - width / 2), Math.round(y - 10), width, 10);
  }

  ctx.restore();
}

function drawZoneLandmarkAnimationFrame(frames, x, y, width, height) {
  const frame = frames[Math.floor(state.lastTimestamp / 180) % frames.length];
  ctx.drawImage(frame, Math.round(x - width / 2), Math.round(y - height), width, height);
}

function drawZoneProgressScene(profile) {
  const stage = getZoneProgressStage(profile.levelId);

  ctx.save();
  if (profile.levelId === "village") {
    drawVillageRecoveryScene(profile, stage);
  } else if (profile.levelId === "archive") {
    drawArchiveRecoveryScene(profile, stage);
  } else if (profile.levelId === "crossroads") {
    drawCrossroadsRecoveryScene(profile, stage);
  } else if (profile.levelId === "spring") {
    drawSpringRecoveryScene(profile, stage);
  }
  ctx.restore();
}

function drawVillageRecoveryScene(profile, stage) {
  const beacon = profile.landmarkPosition;
  if (stage > 0) {
    drawWorldWarmGlow(beacon.x + 82, beacon.y + 40, 42, 0.12 + stage * 0.035);
  }
}

function drawArchiveRecoveryScene(profile, stage) {
  const center = profile.landmarkPosition;
  const gatheredCount = state.quests.zone2Fragments.size;

  if (gatheredCount > 0) {
    drawWorldWarmGlow(center.x, center.y - 10, 34 + gatheredCount * 8, 0.1 + gatheredCount * 0.03);
  }

  if (gatheredCount === 3 && !state.quests.zone2TowerActivated) {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 228, 148, 0.86)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -state.lastTimestamp * 0.02;
    ctx.beginPath();
    ctx.arc(center.x, center.y + 4, 32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawCrossroadsRecoveryScene(profile, stage) {
  const freedHamlets = state.quests.zone3HamletsFreed.size;

  for (let index = 0; index < freedHamlets; index += 1) {
    const hamlet = profile.progress.hamletPositions[index];
    ctx.fillStyle = "rgba(244, 210, 111, 0.18)";
    ctx.fillRect(hamlet.x - 20, hamlet.y - 16, 40, 22);
    ctx.fillStyle = "#d9ba5c";
    ctx.fillRect(hamlet.x - 1, hamlet.y - 21, 2, 20);
    ctx.fillStyle = "#d94d42";
    ctx.fillRect(hamlet.x + 1, hamlet.y - 21, 11, 6);
  }

  if (stage === 3) {
    ctx.fillStyle = "rgba(236, 196, 86, 0.24)";
    ctx.fillRect(profile.landmarkPosition.x - 112, profile.landmarkPosition.y + 32, 224, 5);
  }
}

function drawSpringRecoveryScene(profile, stage) {
  drawDoiMoiStation(profile);
}

function drawDoiMoiStation(profile) {
  const station = profile.progress.irrigationStation;
  const asset = environmentSprites.recovery?.doiMoiIrrigationStation;
  const restored = state.quests.zone4GearClaimed;

  if (canDrawSprite(asset)) {
    ctx.save();
    ctx.globalAlpha = restored ? 0.92 : 0.74;
    ctx.filter = restored
      ? "brightness(1.03) saturate(1.04)"
      : "grayscale(0.62) brightness(0.68) saturate(0.5) contrast(1.04)";
    ctx.drawImage(asset, station.x - station.width / 2, station.y - station.height, station.width, station.height);
    ctx.restore();

    if (!restored) {
      ctx.save();
      ctx.strokeStyle = "rgba(42, 27, 21, 0.72)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(station.x - 44, station.y - 72);
      ctx.lineTo(station.x - 20, station.y - 46);
      ctx.lineTo(station.x - 4, station.y - 64);
      ctx.moveTo(station.x + 16, station.y - 82);
      ctx.lineTo(station.x + 34, station.y - 55);
      ctx.stroke();
      ctx.restore();
      return;
    }

    drawDoiMoiWaterwheel(station);
  }
}

function drawDoiMoiWaterwheel(station) {
  const wheelX = station.x - station.width * 0.28;
  const wheelY = station.y - station.height * 0.45;
  const radius = station.width * 0.11;
  const rotation = state.lastTimestamp * 0.006;

  ctx.save();
  ctx.translate(wheelX, wheelY);
  ctx.rotate(rotation);
  ctx.strokeStyle = "rgba(246, 214, 142, 0.74)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
  for (let spoke = 0; spoke < 4; spoke += 1) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(0, radius);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = "rgba(147, 219, 242, 0.6)";
  for (let drop = 0; drop < 3; drop += 1) {
    const x = wheelX + 8 + drop * 4;
    const y = wheelY + radius + ((state.lastTimestamp * 0.05 + drop * 9) % 12);
    ctx.fillRect(Math.round(x), Math.round(y), 2, 5);
  }
  ctx.restore();
}

function drawZoneAtmosphere(profile) {
  if (!profile) {
    return;
  }

  const presentation = getZonePresentation(profile.levelId);
  const details = profile[presentation];
  const count = details.particleCount;
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (let index = 0; index < count; index += 1) {
    const travel = state.lastTimestamp * (profile.atmosphere === "storm" ? 0.075 : 0.026) + index * 19;
    const x = ((index * 67 + travel * (profile.atmosphere === "storm" ? 1.8 : 0.62)) % (VIEWPORT.width + 30)) - 15;
    const y = ((index * 41 + travel) % (VIEWPORT.height + 26)) - 13;
    let color = "rgba(255, 228, 165, 0.16)";
    let width = 2;
    let height = 2;

    if (profile.atmosphere === "storm") {
      color = presentation === "completed" ? "rgba(255, 222, 142, 0.16)" : "rgba(181, 219, 246, 0.18)";
      width = presentation === "completed" ? 2 : 8;
      height = 1;
    } else if (profile.atmosphere === "paper") {
      color = "rgba(255, 228, 177, 0.17)";
      width = 3;
      height = 2;
    } else if (profile.atmosphere === "smoke") {
      color = presentation === "completed" ? "rgba(255, 216, 126, 0.17)" : "rgba(159, 118, 94, 0.14)";
      width = 5;
      height = 3;
    } else {
      color = presentation === "completed" ? "rgba(182, 236, 152, 0.18)" : "rgba(239, 222, 150, 0.13)";
      width = 3;
      height = 2;
    }

    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), width, height);
  }

  ctx.restore();
}

function drawHubAtmosphere(decorations) {
  ctx.save();
  const fluorescentFlicker = 0.018 + (Math.sin(state.lastTimestamp * 0.012) + 1) * 0.007;
  ctx.fillStyle = `rgba(244, 218, 159, ${fluorescentFlicker})`;
  ctx.fillRect(0, 0, VIEWPORT.width, VIEWPORT.height);
  ctx.globalCompositeOperation = "screen";

  for (const paper of decorations.paperMotes ?? []) {
    const travel = state.lastTimestamp * paper.speed * 0.01;
    const worldX = paper.x + Math.sin(travel + paper.phase) * paper.sway;
    const worldY = paper.y + ((travel + paper.phase * 24) % 42) - 21;
    const point = coordinateSystem.worldToScreen({ x: worldX, y: worldY });
    const alpha = 0.1 + (Math.sin(travel * 0.7 + paper.phase) + 1) * 0.035;
    ctx.fillStyle = `rgba(238, 222, 184, ${alpha})`;
    ctx.fillRect(Math.round(point.x), Math.round(point.y), paper.size + 1, paper.size);
  }

  if (!state.quests.tvaBriefingAccepted && decorations.arrivalMark) {
    const arrival = coordinateSystem.worldToScreen(decorations.arrivalMark);
    const pulse = 0.1 + (Math.sin(state.lastTimestamp * 0.0038) + 1) * 0.025;
    ctx.strokeStyle = `rgba(230, 183, 91, ${pulse})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(arrival.x, arrival.y, 38, 11, 0, 0, Math.PI * 2);
    ctx.stroke();
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

  if (canDrawSprite(rainSprite)) {
    const sourceWidth = 28;
    const sourceHeight = 44;
    const maxSourceX = Math.max(1, rainSprite.naturalWidth - sourceWidth);
    const maxSourceY = Math.max(1, rainSprite.naturalHeight - sourceHeight);
    ctx.globalCompositeOperation = "screen";

    for (let index = 0; index < rain.length; index += 1) {
      const drop = rain[index];
      const travel = state.lastTimestamp * 0.15 * drop.speed;
      const x = (drop.x + travel * drop.drift) % (VIEWPORT.width + 34) - 17;
      const y = (drop.y + travel) % (VIEWPORT.height + 34) - 17;
      const sourceX = Math.floor((drop.x * 5 + drop.y * 3 + index * 19) % maxSourceX);
      const sourceY = Math.floor((drop.y * 7 + drop.x * 2 + index * 13) % maxSourceY);
      const scale = 0.64 + (index % 4) * 0.09;
      const drawWidth = Math.round(sourceWidth * scale);
      const drawHeight = Math.round(sourceHeight * scale);

      ctx.globalAlpha = Math.min(0.18, drop.alpha * 0.44);
      ctx.drawImage(
        rainSprite,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        Math.round(x - drawWidth / 2),
        Math.round(y - drawHeight / 2),
        drawWidth,
        drawHeight
      );
    }

    ctx.restore();
    return;
  }

  for (const drop of rain) {
    const travel = state.lastTimestamp * 0.15 * drop.speed;
    const x = (drop.x + travel * drop.drift) % (VIEWPORT.width + 34) - 17;
    const y = (drop.y + travel) % (VIEWPORT.height + 34) - 17;

    ctx.strokeStyle = `rgba(202, 220, 255, ${drop.alpha})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.round(x), Math.round(y));
    ctx.lineTo(Math.round(x - 3), Math.round(y + drop.length));
    ctx.stroke();
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
    gradient.addColorStop(0, "rgba(244, 217, 162, 0.03)");
    gradient.addColorStop(1, "rgba(18, 13, 9, 0.28)");
    ctx.strokeStyle = "rgba(222, 183, 112, 0.09)";
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
