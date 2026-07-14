import { expect, test } from "@playwright/test";

async function openDebugSession(page, difficulty = null) {
  await page.goto("/?debugTools=1");
  await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
  if (difficulty) {
    await page.locator(`[data-difficulty="${difficulty}"]`).click();
  }
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.beginSession());
  await expect(page.locator("#tutorial-overlay")).toBeVisible();
  for (let step = 0; step < 3; step += 1) {
    await page.locator("#tutorial-next-button").click();
  }
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().mode)).toBe("playing");
}

async function snapshot(page) {
  return page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot());
}

test("an optional challenge is selected before the run and reports a clear failure in the HUD", async ({ page }, testInfo) => {
  await page.goto("/?debugTools=1");
  await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
  await page.locator("#optional-challenge-controls summary").click();
  const challengeButton = page.locator('[data-optional-challenge="no-damage"]');
  await challengeButton.click();
  await expect(challengeButton).toHaveAttribute("aria-pressed", "true");

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.beginSession());
  await expect(page.locator("#tutorial-overlay")).toBeVisible();
  for (let step = 0; step < 3; step += 1) {
    await page.locator("#tutorial-next-button").click();
  }

  const challengeChip = page.locator("#challenge-chip");
  await expect(challengeChip).toBeVisible();
  await expect(challengeChip).toContainText("Không một vết thương");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.damagePlayer(1, "Playwright"));
  await expect(challengeChip).toContainText("Thất bại");
  await page.screenshot({ path: testInfo.outputPath("optional-challenge-hud.png"), fullPage: true });
});

test("optional challenge selection remains usable on a compact viewport", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?debugTools=1");
  await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
  await page.locator("#optional-challenge-controls summary").click();
  await page.locator('[data-optional-challenge="low-corruption"]').click();
  await expect(page.locator('[data-optional-challenge="low-corruption"]')).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({ path: testInfo.outputPath("optional-challenge-mobile-select.png"), fullPage: true });
});

test("ending case files show when their TVA record was first opened", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem("crossroads-ending-collection-v1", JSON.stringify({
      version: 2,
      endings: [{ id: "neutral", unlockedAt: "2026-07-14T12:00:00.000Z" }],
    }));
  });
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setPlayerPosition(630, 318));
  await page.keyboard.press("e");
  await expect(page.locator("#tva-dossier-modal")).toBeVisible();
  await expect(page.locator("#tva-dossier-content")).toContainText("Dòng lịch sử còn vết nứt");
  await expect(page.locator('[data-case-file-date="true"]')).toContainText("Đã mở 14/07/2026");
  await page.screenshot({ path: testInfo.outputPath("ending-case-file-date.png"), fullPage: true });
});

test("the TVA dossier keeps ending, enemy, and achievement records out of the historical book", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem("crossroads-ending-collection-v1", JSON.stringify({
      version: 2,
      endings: [{ id: "neutral", unlockedAt: "2026-07-14T12:00:00.000Z" }],
    }));
    localStorage.setItem("crossroads-monster-codex-collection-v1", JSON.stringify({
      version: 1,
      monsterIds: ["archive-raider"],
    }));
    localStorage.setItem("crossroads-achievement-collection-v1", JSON.stringify({
      version: 1,
      achievementIds: ["bridge-builder"],
    }));
  });
  await openDebugSession(page);
  await expect(page.locator("#story-book-button")).toBeHidden();

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setPlayerPosition(630, 318));
  await page.keyboard.press("e");
  await expect(page.locator("#tva-dossier-modal")).toBeVisible();
  await expect(page.locator("#tva-dossier-title")).toContainText("Hồ sơ TVA");
  await page.locator('[data-tva-dossier-tab="monsters"]').click();
  await expect(page.locator(".monster-codex-preview-canvas")).toBeVisible();
  await page.locator('[data-tva-dossier-tab="achievements"]').click();
  await expect(page.locator("#tva-dossier-content")).toContainText("Dấu mốc");
  await page.screenshot({ path: testInfo.outputPath("tva-dossier-separate-from-history.png"), fullPage: true });
});

async function advanceDialogueToChoice(page, choiceId) {
  const choice = page.locator(`[data-dialogue-choice="${choiceId}"]`);

  for (let step = 0; step < 12; step += 1) {
    if (await choice.isVisible()) {
      return choice;
    }
    await page.locator("#dialogue-next-button").click();
  }

  await expect(choice).toBeVisible();
  return choice;
}

test("TVA dialogue freezes gameplay without pausing the hub music", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await expect.poll(
    () => snapshot(page).then((state) => state.audio.music.hub.readyState),
    { timeout: 10_000 },
  ).toBeGreaterThan(0);
  await expect.poll(() => snapshot(page).then((state) => state.audio.music.hub.paused)).toBe(false);
  await expect.poll(() => snapshot(page).then((state) => state.audio.music.hub.currentTime)).toBeGreaterThan(0);
  const beforeDialogue = await snapshot(page).then((state) => state.audio.music.hub.currentTime);

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-clerk-placeholder"));
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("dialogue");
  await expect.poll(() => snapshot(page).then((state) => state.audio.music.hub.paused)).toBe(false);
  const dialoguePosition = await snapshot(page).then((state) => state.player);
  await page.keyboard.down("d");
  await page.waitForTimeout(150);
  await page.keyboard.up("d");
  const heldInputPosition = await snapshot(page).then((state) => state.player);
  expect(heldInputPosition.x).toBeCloseTo(dialoguePosition.x, 1);
  expect(heldInputPosition.y).toBeCloseTo(dialoguePosition.y, 1);
  await expect.poll(() => snapshot(page).then((state) => state.audio.music.hub.currentTime)).toBeGreaterThan(beforeDialogue);
  await page.screenshot({ path: testInfo.outputPath("david-dialogue-keeps-hub-music.png"), fullPage: true });
});

test("corruption HUD offers a keyboard-accessible explanation without revealing secret ending thresholds", async ({ page }, testInfo) => {
  await openDebugSession(page);

  const helpButton = page.locator("#corruption-help-button");
  const helpTooltip = page.locator("#corruption-help-tooltip");

  await expect(helpButton).toBeVisible();
  await helpButton.focus();
  await page.keyboard.press("Enter");
  await expect(helpButton).toHaveAttribute("aria-expanded", "true");
  await expect(helpTooltip).toBeVisible();
  await expect(helpTooltip).toContainText("Tha hóa");
  await expect(helpTooltip).not.toContainText("100%");
  await page.screenshot({ path: testInfo.outputPath("corruption-help-tooltip.png"), fullPage: true });

  await page.keyboard.press("Space");
  await expect(helpButton).toHaveAttribute("aria-expanded", "false");
  await expect(helpTooltip).toBeHidden();
});

test("F3 reveals debug geometry only in an explicit debug session", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator("#start-screen")).toBeVisible();
  await page.keyboard.press("F3");
  await expect(page.locator("#debug-overlay")).toHaveClass(/hidden/);

  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village"));
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().currentLevelId)).toBe("village");
  await page.keyboard.press("F3");
  await expect(page.locator("#debug-overlay")).not.toHaveClass(/hidden/);
  await expect(page.locator("#debug-canvas")).not.toHaveClass(/hidden/);
  await expect(page.locator("#debug-values")).toContainText("FPS");
  await page.screenshot({ path: testInfo.outputPath("debug-overlay.png"), fullPage: true });
  await page.keyboard.press("F3");
  await expect(page.locator("#debug-overlay")).toHaveClass(/hidden/);
});

test("debug overlay remains legible at a wide desktop viewport", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village"));
  await page.keyboard.press("F3");
  const overlayBox = await page.locator("#debug-overlay").boundingBox();
  expect(overlayBox?.width).toBeLessThan(480);
  expect(overlayBox?.height).toBeLessThan(180);
  await page.screenshot({ path: testInfo.outputPath("debug-overlay-wide.png"), fullPage: true });
});

test("entering Zone 1 through a portal route presents its historical title card once", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village", null, { showTitleCard: true }));
  await expect(page.locator("#zone-title-overlay")).toBeVisible();
  await expect(page.locator("#zone-title-period")).toHaveText("1922–1929");
  await expect(page.locator("#zone-title-title")).toContainText("Người cùng khổ");
  const playerBefore = await snapshot(page).then((state) => ({ x: state.player.x, y: state.player.y }));
  await page.keyboard.down("d");
  await page.waitForTimeout(180);
  await page.keyboard.up("d");
  const playerDuringCard = await snapshot(page).then((state) => state.player);
  expect(playerDuringCard.x).toBeCloseTo(playerBefore.x, 1);
  expect(playerDuringCard.y).toBeCloseTo(playerBefore.y, 1);
  await page.screenshot({ path: testInfo.outputPath("zone1-title-card.png"), fullPage: true });
  await page.locator("#zone-title-continue-button").click();
  await expect(page.locator("#zone-title-overlay")).toBeHidden();
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
  await expect.poll(() => snapshot(page).then((state) => state.narrative.branchFlags["chapter.zone1.titleSeen"])).toBe(true);
});

test("portal handoff locks gameplay until the time warp reaches its destination", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village"));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeTvaRoute("village"));

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.triggerExit("back-to-hub-1"));
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("transition");
  await expect.poll(() => snapshot(page).then((state) => state.portalTransition?.targetLevelId)).toBe("hub");
  const transitionStart = await snapshot(page).then((state) => ({ x: state.player.x, y: state.player.y }));

  await page.keyboard.down("d");
  await page.waitForTimeout(150);
  await page.keyboard.up("d");
  const during = await snapshot(page).then((state) => state.player);
  expect(during.x).toBeCloseTo(transitionStart.x, 1);
  expect(during.y).toBeCloseTo(transitionStart.y, 1);
  await page.screenshot({ path: testInfo.outputPath("portal-time-warp.png"), fullPage: true });

  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId), { timeout: 2_000 }).toBe("hub");
  await expect.poll(() => snapshot(page).then((state) => state.mode), { timeout: 2_000 }).toBe("playing");
  await expect.poll(() => snapshot(page).then((state) => state.portalTransition)).toBeNull();
});

test("Zone 1 animated enemy roster renders in the village", async ({ page }, testInfo) => {
  await openDebugSession(page, "challenge");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village"));
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().currentLevelId)).toBe("village");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setPlayerPosition(690, 380));
  await page.waitForTimeout(260);
  await page.screenshot({ path: testInfo.outputPath("zone1-animated-frontline.png"), fullPage: true });

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village"));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setPlayerPosition(720, 250));
  await page.waitForTimeout(260);
  await page.screenshot({ path: testInfo.outputPath("zone1-animated-backline.png"), fullPage: true });
});

test("Zone 1 combat uses the dedicated attack animation", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village"));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setPlayerPosition(660, 426));
  await page.waitForTimeout(410);
  await page.screenshot({ path: testInfo.outputPath("zone1-raider-attack.png"), fullPage: true });
});

test("player combat emits the authored attack and incoming-hit cues", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    window.__playedAudioSources = [];
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function trackedPlay(...args) {
      window.__playedAudioSources.push(this.currentSrc || this.src);
      return originalPlay.apply(this, args);
    };
  });
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village"));

  await page.keyboard.press("j");
  await expect.poll(() => page.evaluate(() => window.__playedAudioSources.some((source) => source.includes("player-attack1") || source.includes("player-attack2")))).toBe(true);
  await page.waitForTimeout(450);
  await page.keyboard.press("j");
  await expect.poll(() => page.evaluate(() => window.__playedAudioSources.some((source) => source.includes("player-attack2")))).toBe(true);
  const strikeSources = await page.evaluate(() => window.__playedAudioSources.filter(
    (source) => source.includes("player-attack1") || source.includes("player-attack2")
  ));
  expect(strikeSources).toHaveLength(2);

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.damagePlayer(1, "Playwright"));
  await expect.poll(() => page.evaluate(() => window.__playedAudioSources.some((source) => source.includes("player-hurt")))).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("combat-audio-cues.png"), fullPage: true });
});

test("parry reflects a live projectile back into its ranged attacker", async ({ page }, testInfo) => {
  await openDebugSession(page, "challenge");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("archive"));
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().currentLevelId)).toBe("archive");
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().mode)).toBe("playing");
  // AI attack scheduling and retreat are covered elsewhere. This atomic debug
  // fixture invokes the production spawn + parry functions, then positions the
  // live projectile one frame from the player for collision/reflection coverage.
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setPlayerPosition(650, 352));
  const initialHealth = await page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().monsters.find((monster) => monster.id === "archive-marksman")?.health);

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.parryIncomingProjectile("archive-marksman"));
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().combat.projectileCount)).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().combat.parryEndsAt)).toBe(0);
  await page.screenshot({ path: testInfo.outputPath("projectile-parry-reflect.png"), fullPage: true });
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().monsters.find((monster) => monster.id === "archive-marksman")?.health)).toBeLessThan(initialHealth);
});

test("Zone 1 captain exposes its phase-two combat profile", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village"));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.damageMonster("village-corruption-guard", 9));
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().monsters.find((monster) => monster.id === "village-corruption-guard")?.bossPhase)).toBe(2);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setPlayerPosition(748, 456));
  await page.waitForTimeout(760);
  await page.screenshot({ path: testInfo.outputPath("zone1-captain-phase-two.png"), fullPage: true });
});

test("encountering a monster unlocks an animated TVA dossier record", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("archive"));
  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe("archive");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setPlayerPosition(270, 392));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("hub"));
  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe("hub");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-memory-archive"));
  await expect(page.locator("#tva-dossier-modal")).toBeVisible();
  await page.locator('[data-tva-dossier-tab="monsters"]').click();
  await expect(page.locator("#tva-dossier-content")).toContainText("Hồ sơ đối thủ");
  const codexPreview = page.locator(".monster-codex-preview-canvas");
  await expect(codexPreview).toBeVisible();
  await expect(page.locator("#tva-dossier-content")).toContainText("Dấu hiệu:");
  const firstPreviewFrame = await codexPreview.evaluate((canvas) => canvas.toDataURL());
  await page.waitForTimeout(440);
  const secondPreviewFrame = await codexPreview.evaluate((canvas) => canvas.toDataURL());
  expect(secondPreviewFrame).not.toBe(firstPreviewFrame);
  await page.screenshot({ path: testInfo.outputPath("monster-codex-preview.png"), fullPage: true });
});

test("monster dossier preview remains legible on a compact viewport", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("crossroads-monster-codex-collection-v1", JSON.stringify({
      version: 1,
      monsterIds: ["archive-raider"],
    }));
  });
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-memory-archive"));
  await expect(page.locator("#tva-dossier-modal")).toBeVisible();
  await page.locator('[data-tva-dossier-tab="monsters"]').click();
  await expect(page.locator("#tva-dossier-content")).toContainText("Hồ sơ đối thủ");
  await expect(page.locator(".monster-codex-preview-canvas")).toBeVisible();
  await expect(page.locator("#tva-dossier-close-button")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("monster-codex-preview-mobile.png"), fullPage: true });
});

test("boss combat panel names the threat and makes phase two legible", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village"));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setPlayerPosition(748, 456));

  await expect(page.locator("#boss-status")).toBeVisible();
  await expect(page.locator("#boss-status-name")).toHaveText("Kẻ Canh Gác Tha Hóa");
  await expect(page.locator("#boss-health-value")).toHaveText("18 / 18");
  await expect(page.locator("#boss-phase-label")).toContainText("PHA I");

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.damageMonster("village-corruption-guard", 9));
  await expect.poll(() => page.locator("#boss-phase-label").textContent()).toContain("PHA II");
  await expect(page.locator("#boss-health-value")).toHaveText("9 / 18");
  await page.screenshot({ path: testInfo.outputPath("boss-combat-panel-phase-two.png"), fullPage: true });

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setSaDoa(70));
  await expect(page.locator("#corruption-warning")).toBeVisible();
  await expect(page.locator("#boss-status")).toHaveAttribute("data-corruption-warning", "true");
  await expect(page.locator("#boss-status")).toHaveCSS("top", "72px");
});

test("Zone 2 archive preserves the curator's phase-two combat flow", async ({ page }, testInfo) => {
  await openDebugSession(page, "challenge");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("archive"));
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().currentLevelId)).toBe("archive");
  await expect.poll(() => page.evaluate(() => Object.fromEntries(
    window.__CROSSROADS_DEBUG__.getSnapshot().monsters.map(({ id, artKey }) => [id, artKey]),
  ))).toEqual({
    "archive-raider": "zone2ArchiveSaboteur",
    "archive-marksman": "zone2CipherMarksman",
    "archive-chanter": "zone2CorruptedArchivist",
    "archive-shadow-curator": "zone2ShadowCurator",
  });
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setPlayerPosition(520, 286));
  await page.waitForTimeout(260);
  await page.screenshot({ path: testInfo.outputPath("zone2-archive-combat-pack.png"), fullPage: true });

  await page.evaluate(() => {
    const curator = window.__CROSSROADS_DEBUG__.getSnapshot().monsters.find((monster) => monster.id === "archive-shadow-curator");
    window.__CROSSROADS_DEBUG__.damageMonster("archive-shadow-curator", Math.ceil(curator.health / 2));
  });
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().monsters.find((monster) => monster.id === "archive-shadow-curator")?.bossPhase)).toBe(2);
  await page.waitForTimeout(760);
  await page.screenshot({ path: testInfo.outputPath("zone2-curator-heavy-attack.png"), fullPage: true });
});

test("Zone 3 crossroads preserves its phase-aware boss flow", async ({ page }, testInfo) => {
  await openDebugSession(page, "challenge");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("crossroads"));
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().currentLevelId)).toBe("crossroads");
  await expect.poll(() => page.evaluate(() => Object.fromEntries(
    window.__CROSSROADS_DEBUG__.getSnapshot().monsters.map(({ id, artKey }) => [id, artKey]),
  ))).toEqual({
    "crossroads-raider": "zone3BridgeRaider",
    "crossroads-marksman": "zone3FactionSkirmisher",
    "crossroads-chanter": "zone3WhisperPropagandist",
    "southern-tyrant": "zone3SouthernTyrant",
  });
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setPlayerPosition(590, 450));
  await page.waitForTimeout(300);
  await page.screenshot({ path: testInfo.outputPath("zone3-crossroads-combat-pack.png"), fullPage: true });
  await page.evaluate(() => {
    const tyrant = window.__CROSSROADS_DEBUG__.getSnapshot().monsters.find((monster) => monster.id === "southern-tyrant");
    window.__CROSSROADS_DEBUG__.damageMonster("southern-tyrant", Math.ceil(tyrant.health / 2));
  });
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().monsters.find((monster) => monster.id === "southern-tyrant")?.bossPhase)).toBe(2);
});

test("Zone 4 spring preserves its phase-aware boss flow", async ({ page }, testInfo) => {
  await openDebugSession(page, "challenge");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("spring"));
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().currentLevelId)).toBe("spring");
  await expect.poll(() => page.evaluate(() => Object.fromEntries(
    window.__CROSSROADS_DEBUG__.getSnapshot().monsters.map(({ id, artKey }) => [id, artKey]),
  ))).toEqual({
    "spring-raider": "zone4CropSaboteur",
    "spring-marksman": "zone4BureauMarksman",
    "spring-chanter": "zone4RationChanter",
    "spring-bureaucracy-beast": "zone4BureaucracyBeast",
  });
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setPlayerPosition(500, 330));
  await page.waitForTimeout(300);
  await page.screenshot({ path: testInfo.outputPath("zone4-spring-combat-pack.png"), fullPage: true });
  await page.evaluate(() => {
    const beast = window.__CROSSROADS_DEBUG__.getSnapshot().monsters.find((monster) => monster.id === "spring-bureaucracy-beast");
    window.__CROSSROADS_DEBUG__.damageMonster("spring-bureaucracy-beast", Math.ceil(beast.health / 2));
  });
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().monsters.find((monster) => monster.id === "spring-bureaucracy-beast")?.bossPhase)).toBe(2);
});

test("held movement stops on blur and paused scenes ignore movement", async ({ page }) => {
  await openDebugSession(page);
  const start = await snapshot(page);

  await page.keyboard.down("d");
  await expect.poll(async () => (await snapshot(page)).player.x).toBeGreaterThan(start.player.x + 4);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  const afterBlur = await snapshot(page);
  await page.waitForTimeout(180);
  expect((await snapshot(page)).player.x).toBeCloseTo(afterBlur.player.x, 4);
  await page.keyboard.up("d");

  await page.locator("#pause-button").click();
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().mode)).toBe("paused");
  const paused = await snapshot(page);
  await page.keyboard.press("d");
  await page.waitForTimeout(180);
  expect((await snapshot(page)).player.x).toBeCloseTo(paused.player.x, 4);

  await page.locator("#resume-button").click();
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
  await page.keyboard.down("d");
  await page.waitForTimeout(100);
  await page.locator("#pause-button").click();
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("paused");
  const pausedWithHeldKey = await snapshot(page);
  await page.locator("#resume-button").click();
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
  await page.waitForTimeout(180);
  expect((await snapshot(page)).player.x).toBeCloseTo(pausedWithHeldKey.player.x, 4);
  await page.keyboard.up("d");
});

test("restart requires explicit confirmation before replacing the current journey", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village"));
  const beforeRestart = await snapshot(page);

  await page.locator("#pause-button").click();
  await page.locator("#restart-button").click();
  await expect(page.locator("#progress-confirm-dialog")).toBeVisible();
  await expect(page.locator("#progress-confirm-copy")).toContainText("thay thế");
  await expect(page.locator("#cancel-progress-action")).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath("restart-confirmation.png"), fullPage: true });

  await page.keyboard.press("Escape");
  await expect(page.locator("#progress-confirm-dialog")).toBeHidden();
  expect((await snapshot(page)).currentLevelId).toBe(beforeRestart.currentLevelId);
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("paused");

  await page.locator("#restart-button").click();
  await page.locator("#confirm-progress-action").click();
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
  expect((await snapshot(page)).currentLevelId).toBe("hub");
});

test("the employee forces the TVA briefing choice and opens the first dispatch portal", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("hub", { x: 480, y: 260, direction: "up" }));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-clerk-placeholder"));
  await expect(page.locator("#dialogue-speaker")).toHaveText("David");
  await expect(page.locator("#dialogue-box")).toHaveAttribute("data-speaker", "david");
  await expect(page.locator("#dialogue-portrait")).toBeVisible();
  await expect(page.locator("#dialogue-text")).toContainText("intake list");
  await page.locator("#dialogue-next-button").click();
  await expect(page.locator("#dialogue-speaker")).toHaveText("Nhà du hành");
  await expect(page.locator("#dialogue-box")).toHaveAttribute("data-speaker", "traveler");
  await expect(page.locator("#dialogue-portrait")).toBeVisible();
  await expect(page.locator("#dialogue-text")).toContainText("Đây là đâu");
  for (let line = 0; line < 9; line += 1) {
    await page.locator("#dialogue-next-button").click();
  }
  await expect(page.locator("#dialogue-choice-list")).toBeVisible();
  await expect(page.locator(".dialogue-choice-button")).toHaveCount(2);
  await page.screenshot({ path: testInfo.outputPath("tva-office-briefing.png"), fullPage: true });

  await page.locator('[data-dialogue-choice="refuse-assignment"]').click();
  await expect(page.locator("#dialogue-speaker")).toHaveText("Nhà du hành");
  for (let line = 0; line < 3; line += 1) {
    await page.locator("#dialogue-next-button").click();
  }
  await page.locator('[data-dialogue-choice="forced-accept-assignment"]').click();
  await expect.poll(() => snapshot(page).then((state) => state.quests.tvaBriefingAccepted)).toBe(true);

  await page.locator('[data-dialogue-choice="dispatch-ready"]').click();
  await expect.poll(() => snapshot(page).then((state) => state.quests.tvaPortalTarget)).toBe("village");
  await expect(page.locator("#dialogue-text")).toContainText("tọa độ không-thời gian");
  await page.screenshot({ path: testInfo.outputPath("tva-dispatch-portal.png"), fullPage: true });
  await page.locator("#dialogue-next-button").click();
  await page.locator("#dialogue-next-button").click();
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");

  const result = await page.evaluate(() => window.__CROSSROADS_DEBUG__.triggerExit("tva-dispatch-portal"));
  expect(result.transitioned).toBe(true);
  expect(result.currentLevelId).toBe("hub");
  expect(result.portalTransition?.targetLevelId).toBe("village");
  expect(result.quests.tvaPortalTarget).toBe("village");
  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe("village");
  await expect.poll(() => snapshot(page).then((state) => state.portalTransition)).toBeNull();
  await expect.poll(() => snapshot(page).then((state) => state.quests.tvaPortalTarget)).toBeNull();
  await expect(page.locator("#zone-title-overlay")).toBeVisible();
  await page.locator("#zone-title-continue-button").click();
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
  await page.screenshot({ path: testInfo.outputPath("zone1-return-portal-locked.png"), fullPage: true });

  const lockedReturn = await page.evaluate(() => window.__CROSSROADS_DEBUG__.triggerExit("back-to-hub-1"));
  expect(lockedReturn.transitioned).toBe(false);
  expect(lockedReturn.currentLevelId).toBe("village");

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setPlayerPosition(250, 260));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeTvaRoute("village"));
  await page.screenshot({ path: testInfo.outputPath("zone1-return-portal-open.png"), fullPage: true });
  const openReturn = await page.evaluate(() => window.__CROSSROADS_DEBUG__.triggerExit("back-to-hub-1"));
  expect(openReturn.transitioned).toBe(true);
  expect(openReturn.currentLevelId).toBe("village");
  expect(openReturn.portalTransition?.targetLevelId).toBe("hub");
  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe("hub");
  await expect.poll(() => snapshot(page).then((state) => state.portalTransition)).toBeNull();
});

test("the TVA caseboard reveals only the authorized file and tracks it", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("hub", { x: 480, y: 260, direction: "up" }));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-clerk-placeholder"));
  for (let line = 0; line < 10; line += 1) await page.locator("#dialogue-next-button").click();
  await page.locator('[data-dialogue-choice="accept-assignment"]').click();
  await page.locator('[data-dialogue-choice="dispatch-later"]').click();
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-caseboard"));
  await expect(page.locator("#dialogue-speaker")).toHaveText("Bảng hồ sơ TVA");
  await expect(page.locator("#dialogue-text")).toContainText("Khu 1");
  await expect(page.locator("#dialogue-text")).not.toContainText("Khu 2");
  await expect(page.locator('[data-dialogue-choice="track:zone1"]')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("tva-caseboard-zone1.png"), fullPage: true });

  await page.locator('[data-dialogue-choice="track:zone1"]').click();
  await expect.poll(() => snapshot(page).then((state) => state.quests.tvaTrackedChapterId)).toBe("zone1");
  await expect(page.locator("#quest-chip")).toContainText("Hồ sơ: Báo Người cùng khổ");
});

test("zone return anchors distinguish sealed and completed states without opening collision early", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village", { x: 146, y: 178, direction: "down" }));
  await expect.poll(() => snapshot(page).then((state) => state.portalStates[0]?.status)).toBe("sealed");
  await page.screenshot({ path: testInfo.outputPath("zone1-return-anchor-sealed.png"), fullPage: true });
  const lockedExit = await page.evaluate(() => window.__CROSSROADS_DEBUG__.triggerExit("back-to-hub-1"));
  expect(lockedExit.transitioned).toBe(false);
  expect(lockedExit.currentLevelId).toBe("village");

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setPlayerPosition(320, 360));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeTvaRoute("village"));
  await expect.poll(() => snapshot(page).then((state) => state.portalStates[0]?.status)).toBe("complete");
  await page.screenshot({ path: testInfo.outputPath("zone1-return-anchor-open.png"), fullPage: true });
});

test("collected relics visibly converge around the TVA dispatch portal", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeTvaRoute("crossroads"));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("hub", { x: 480, y: 260, direction: "up" }));
  await expect.poll(() => snapshot(page).then((state) => state.inventory.length)).toBe(2);
  await page.waitForTimeout(220);
  await page.screenshot({ path: testInfo.outputPath("tva-relic-convergence.png"), fullPage: true });
});

test("five relics activate the TVA convergence state without reopening the portal", async ({ page }, testInfo) => {
  await openDebugSession(page);
  for (const levelId of ["village", "archive", "crossroads", "spring"]) {
    await page.evaluate((id) => window.__CROSSROADS_DEBUG__.completeTvaRoute(id), levelId);
  }
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("hub", { x: 480, y: 260, direction: "up" }));
  await expect.poll(() => snapshot(page).then((state) => state.inventory.length)).toBe(5);
  await page.waitForTimeout(260);
  await page.screenshot({ path: testInfo.outputPath("tva-five-relic-convergence.png"), fullPage: true });
  expect((await snapshot(page)).quests.tvaPortalTarget).toBeNull();
});

test("the TVA memory archive opens only earned history", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeTvaRoute("village"));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("hub", { x: 480, y: 260, direction: "up" }));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-memory-archive"));
  await expect(page.locator("#tva-dossier-modal")).toBeVisible();
  await expect(page.locator("#tva-dossier-content")).not.toContainText("LA BÀN ĐỎ");
  await page.locator("#tva-dossier-close-button").click();
  await page.locator("#story-book-button").click();
  await expect(page.locator("#slide-modal")).toBeVisible();
  await expect(page.locator("#slide-title")).toContainText("LA BÀN ĐỎ");
  await page.screenshot({ path: testInfo.outputPath("tva-memory-archive.png"), fullPage: true });
});

test("constructive achievements persist as TVA memory records without revealing endings", async ({ page }, testInfo) => {
  await openDebugSession(page, "challenge");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("archive"));
  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe("archive");

  for (let count = 0; count < 3; count += 1) {
    await page.evaluate(() => window.__CROSSROADS_DEBUG__.parryIncomingProjectile("archive-marksman"));
    await page.waitForTimeout(820);
  }

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("hub", { x: 630, y: 318, direction: "up" }));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-memory-archive"));
  await expect(page.locator("#tva-dossier-modal")).toBeVisible();
  await page.locator('[data-tva-dossier-tab="achievements"]').click();
  await expect(page.locator("#tva-dossier-content")).toContainText("Nhịp phản đòn");
  await expect(page.locator("#tva-dossier-content")).not.toContainText("ending");
  await page.screenshot({ path: testInfo.outputPath("achievement-memory-record.png"), fullPage: true });
});

test("the TVA hub has no obsolete training-room route", async ({ page }) => {
  await openDebugSession(page);
  const hub = await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("hub"));
  expect(hub.currentLevelId).toBe("hub");
  const interaction = await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-training-console"));
  expect(interaction).toBe(false);
});

test("David remains interactable in the TVA hub", async ({ page }) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("hub", { x: 384, y: 286, direction: "up" }));
  await page.keyboard.press("e");
  await expect(page.locator("#dialogue-box")).toBeVisible();
  await expect(page.locator("#dialogue-speaker")).toHaveText("David");
});

test("reported relics unlock each later TVA coordinate in campaign order", async ({ page }) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("hub", { x: 480, y: 260, direction: "up" }));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-clerk-placeholder"));
  for (let line = 0; line < 10; line += 1) await page.locator("#dialogue-next-button").click();
  await page.locator('[data-dialogue-choice="accept-assignment"]').click();
  await page.locator('[data-dialogue-choice="dispatch-later"]').click();

  const routes = ["village", "archive", "crossroads", "spring"];
  const nextRoutes = ["archive", "crossroads", "spring"];

  for (let index = 0; index < routes.length; index += 1) {
    await page.evaluate((levelId) => window.__CROSSROADS_DEBUG__.completeTvaRoute(levelId), routes[index]);
    await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("hub", { x: 480, y: 260, direction: "up" }));
    await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
    await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-clerk-placeholder"));

    if (index < nextRoutes.length) {
      await (await advanceDialogueToChoice(page, "dispatch-ready")).click();
      await expect.poll(() => snapshot(page).then((state) => state.quests.tvaPortalTarget)).toBe(nextRoutes[index]);
      await page.locator("#dialogue-next-button").click();
      await page.locator("#dialogue-next-button").click();
      await page.evaluate(() => window.__CROSSROADS_DEBUG__.triggerExit("tva-dispatch-portal"));
      await expect(page.locator("#zone-title-overlay")).toBeVisible();
      await expect.poll(() => snapshot(page).then((state) => state.portalTransition)).toBeNull();
      await page.locator("#zone-title-continue-button").click();
      await expect(page.locator("#zone-title-overlay")).toBeHidden();
      await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
      continue;
    }

    await (await advanceDialogueToChoice(page, "finish-history")).click();
    await expect(page.locator("#end-overlay")).toBeVisible();
    await expect.poll(() => snapshot(page).then((state) => state.endingId)).toBe("good");
    await expect.poll(
      () => snapshot(page).then((state) => state.audio.music.goodEnding.readyState),
      { timeout: 10_000 },
    ).toBeGreaterThan(0);
    await expect.poll(() => snapshot(page).then((state) => state.audio.music.goodEnding.paused)).toBe(false);
    await expect.poll(() => snapshot(page).then((state) => state.audio.music.goodEnding.currentTime)).toBeGreaterThan(0);
  }

  await expect.poll(() => snapshot(page).then((state) => state.quests.tvaReportedRelics.length)).toBe(5);
});

test("David reports the Zone 1 relic and dispatches Zone 2 after a recovered bad ending", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem("crossroads-save-v1", JSON.stringify({
      version: 2,
      currentLevelId: "hub",
      player: { x: 384, y: 286, direction: "up" },
      respawnLevelId: "hub",
      respawnSpawn: { x: 384, y: 286, direction: "up" },
      health: 36,
      stamina: 100,
      saDoa: 0,
      inventory: ["red-compass"],
      unlockedStoryIds: [],
      completedZones: ["village"],
      difficulty: "normal",
      activeChallengeId: null,
      tutorialSeen: true,
      hubEpilogueEndingId: "zone1-lost-compass",
      runStats: {},
      quests: {
        tvaBriefingAccepted: true,
        tvaPortalTarget: null,
        tvaTrackedChapterId: null,
        tvaReportedRelics: [],
        zone1Started: true,
        zone1Delivered: ["worker-harbor-1", "worker-harbor-2", "worker-harbor-3"],
        zone1RewardClaimed: true,
      },
      narrative: {},
      runtime: {},
    }));
  });
  await page.goto("/?debugTools=1");
  await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
  await page.locator("#continue-button").click();
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-clerk-placeholder"));
  await expect(page.locator("#dialogue-progress")).toHaveText("1 / 6");
  await expect(page.locator("#dialogue-text")).toContainText("nhánh đứt");
  await expect(page.locator("#dialogue-next-button")).toHaveText("Tiếp tục");
  await expect(await advanceDialogueToChoice(page, "dispatch-ready")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("zone2-dispatch-after-zone1-epilogue.png"), fullPage: true });
  await page.locator('[data-dialogue-choice="dispatch-ready"]').click();
  await expect.poll(() => snapshot(page).then((state) => state.quests.tvaPortalTarget)).toBe("archive");
  await expect.poll(() => snapshot(page).then((state) => state.quests.tvaReportedRelics)).toContain("red-compass");
  await page.locator("#dialogue-next-button").click();
  await page.locator("#dialogue-next-button").click();

  const dispatch = await page.evaluate(() => window.__CROSSROADS_DEBUG__.triggerExit("tva-dispatch-portal"));
  expect(dispatch.transitioned).toBe(true);
  expect(dispatch.portalTransition?.targetLevelId).toBe("archive");
  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe("archive");
  await expect.poll(() => snapshot(page).then((state) => state.portalTransition)).toBeNull();
  await expect.poll(() => snapshot(page).then((state) => state.quests.tvaPortalTarget)).toBeNull();
  await expect(page.locator("#zone-title-overlay")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("zone2-entered-after-zone1-epilogue.png"), fullPage: true });
});

test("David offers the final return after a high-corruption reset with all five relics", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem("crossroads-save-v1", JSON.stringify({
      version: 2,
      currentLevelId: "hub",
      player: { x: 384, y: 286, direction: "up" },
      respawnLevelId: "hub",
      respawnSpawn: { x: 384, y: 286, direction: "up" },
      health: 36,
      stamina: 100,
      saDoa: 0,
      inventory: ["red-compass", "unified-emblem", "vietminh-thread", "healed-map", "doi-moi-gear"],
      unlockedStoryIds: [],
      completedZones: ["village", "archive", "crossroads", "spring"],
      difficulty: "normal",
      activeChallengeId: null,
      tutorialSeen: true,
      hubEpilogueEndingId: "bad",
      runStats: { maxCorruption: 75 },
      quests: {
        tvaBriefingAccepted: true,
        tvaPortalTarget: null,
        tvaTrackedChapterId: null,
        tvaReportedRelics: ["red-compass", "unified-emblem", "vietminh-thread", "healed-map", "doi-moi-gear"],
        zone1RewardClaimed: true,
        zone2RewardClaimed: true,
        zone3ThreadClaimed: true,
        zone3MapClaimed: true,
        zone4GearClaimed: true,
      },
      narrative: {},
      runtime: {},
    }));
  });
  await page.goto("/?debugTools=1");
  await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
  await page.locator("#continue-button").click();
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-clerk-placeholder"));
  const finishChoice = await advanceDialogueToChoice(page, "finish-history");
  await expect(finishChoice).toBeVisible();
  await expect(page.locator("#dialogue-text")).toContainText("Năm tín vật");
  await page.screenshot({ path: testInfo.outputPath("final-return-after-high-corruption-reset.png"), fullPage: true });
  await finishChoice.click();
  await expect(page.locator("#end-overlay")).toBeVisible();
  await expect.poll(() => snapshot(page).then((state) => state.endingId)).toBe("good");
});

test("ending recap shows an explainable run score after the cinematic", async ({ page }, testInfo) => {
  await page.goto("/?debugTools=1&debugEnding=good");
  await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
  await expect(page.locator("#end-overlay")).toBeVisible();
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeEndingCinematic());
  await expect(page.locator("#end-overlay")).toHaveAttribute("data-cinematic", "complete");
  await expect(page.locator("#end-run-score")).toContainText("điểm");
  await expect(page.locator("#end-run-details")).toContainText("Tha hóa");
  await page.locator("#end-run-report-toggle").click();
  await expect(page.locator("#end-run-report")).toHaveAttribute("open", "");
  await expect(page.locator("#end-run-resolution")).toContainText("điểm rẽ đối thoại");
  await expect(page.locator("#end-run-people")).toContainText("Công nhân bến cảng");
  await page.screenshot({ path: testInfo.outputPath("ending-run-summary.png"), fullPage: true });
});

test("detailed ending report remains readable on a compact viewport", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?debugTools=1&debugEnding=good");
  await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeEndingCinematic());
  await expect(page.locator("#end-overlay")).toHaveAttribute("data-cinematic", "complete");
  await page.locator("#end-run-report-toggle").click();
  await expect(page.locator("#end-run-report-content")).toBeVisible();
  await expect(page.locator("#return-start-button")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("ending-run-report-mobile.png"), fullPage: true });
});

test("checkpoint survives lethal damage and persisted progress survives reload", async ({ page }) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village"));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.damagePlayer(999, "Playwright"));
  const afterRespawn = await snapshot(page);
  expect(afterRespawn.currentLevelId).toBe("village");
  expect(afterRespawn.respawnLevelId).toBe("village");

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.saveNow());
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
  await expect(page.locator("#continue-button")).toBeVisible();
  await page.locator("#continue-button").click();
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().mode)).toBe("playing");
  expect((await snapshot(page)).currentLevelId).toBe("village");
});

test("a bad ending is interrupted by the TVA employee and restores the checkpoint", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() =>
    window.__CROSSROADS_DEBUG__.loadLevel("village", { x: 312, y: 268, direction: "left" })
  );
  const checkpoint = await snapshot(page);

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.triggerBadEnding());
  await expect.poll(
    () => snapshot(page).then((state) => state.audio.music.badEnding.readyState),
    { timeout: 10_000 },
  ).toBeGreaterThan(0);
  await expect.poll(() => snapshot(page).then((state) => state.audio.music.badEnding.paused)).toBe(false);
  await expect.poll(() => snapshot(page).then((state) => state.audio.music.badEnding.currentTime)).toBeGreaterThan(0);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeEndingCinematic());
  await expect.poll(() => snapshot(page).then((state) => state.badEndingRecovery?.phase)).toBe("linger");

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setBadEndingRecoveryElapsed(4700));
  await expect(page.locator("#bad-ending-recovery-dialogue")).toBeVisible();
  await expect(page.locator("#bad-ending-recovery-text")).not.toBeEmpty();
  await expect.poll(() => snapshot(page).then((state) => state.badEndingRecovery?.phase)).toBe("complaint");
  await page.screenshot({ path: testInfo.outputPath("bad-ending-tva-recovery.png"), fullPage: true });

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setBadEndingRecoveryElapsed(8600));
  await expect.poll(() => snapshot(page).then((state) => state.badEndingRecovery?.phase)).toBe("reset");
  await page.screenshot({ path: testInfo.outputPath("bad-ending-m90-reset-action.png"), fullPage: true });

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setBadEndingRecoveryElapsed(9400));
  await expect.poll(() => snapshot(page).then((state) => state.badEndingRecovery?.phase)).toBe("reset");
  await page.screenshot({ path: testInfo.outputPath("bad-ending-m90-reset-wave.png"), fullPage: true });

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setBadEndingRecoveryElapsed(11000));
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
  const restored = await snapshot(page);
  expect(restored.currentLevelId).toBe(checkpoint.respawnLevelId);
  expect(restored.player.x).toBeCloseTo(checkpoint.player.x, 1);
  expect(restored.player.y).toBeCloseTo(checkpoint.player.y, 1);
  expect(restored.endingId).toBe(null);
  expect(restored.saDoa).toBe(0);
});

test("Zone 1 choices record a recoverable risk and only trigger its bad ending after explicit confirmation", async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village", { x: 832, y: 244, direction: "up" }));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("le-paria-stack"));
  await page.locator('[data-dialogue-choice="cargo-route"]').click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: testInfo.outputPath("colonial-recruiter-scale.png"), fullPage: true });

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("colonial-recruiter"));
  await expect(page.locator("#dialogue-speaker")).toHaveText("Lính tuần tra Pháp");
  await page.locator("#dialogue-next-button").click();
  await page.locator("#dialogue-next-button").click();
  await expect(page.locator("#dialogue-choice-list")).toBeVisible();
  await expect(page.locator(".dialogue-choice-button")).toHaveCount(3);
  await page.screenshot({ path: testInfo.outputPath("colonial-recruiter-dialogue.png"), fullPage: true });

  await page.locator('[data-dialogue-choice="refuse"]').click();
  await expect.poll(() => snapshot(page).then((state) => state.quests.zone1SoldierDecision)).toBe("refused");
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.beginSession());
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village", { x: 832, y: 244, direction: "up" }));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("le-paria-stack"));
  await page.locator('[data-dialogue-choice="cargo-route"]').click();
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("colonial-recruiter"));
  await page.locator("#dialogue-next-button").click();
  await page.locator("#dialogue-next-button").click();
  await page.locator('[data-dialogue-choice="accept"]').click();
  await expect(page.locator("#end-overlay")).toBeHidden();
  await expect.poll(() => snapshot(page).then((state) => state.narrative.endingRisks.zone1)).toBe(1);
  await expect.poll(() => snapshot(page).then((state) => state.endingId)).toBeNull();

  for (const workerId of ["worker-harbor-1", "worker-harbor-2", "worker-harbor-3"]) {
    await page.evaluate((interactableId) => window.__CROSSROADS_DEBUG__.interactById(interactableId), workerId);
  }
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("red-compass-reward"));
  await expect(page.locator("#dialogue-choice-list")).toBeVisible();
  await page.locator('[data-dialogue-choice="confirm-personal-gain"]').click();
  await expect(page.locator("#end-overlay")).toBeVisible();
  await expect(page.locator("#end-title")).toContainText("CON TÀU KHÔNG LA BÀN");
  await expect.poll(() => snapshot(page).then((state) => state.endingId)).toBe("zone1-lost-compass");
  await expect.poll(() => snapshot(page).then((state) => state.audio.music.zone1LostCompass.readyState)).toBeGreaterThan(0);
  await expect.poll(() => snapshot(page).then((state) => state.audio.music.zone1LostCompass.paused)).toBe(false);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeEndingCinematic());
  await expect(page.locator("#end-overlay")).toHaveAttribute("data-cinematic", "complete");
  await page.screenshot({ path: testInfo.outputPath("zone1-lost-compass-ending.png"), fullPage: true });

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setBadEndingRecoveryElapsed(11_000));
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
  const retry = await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("red-compass-reward"));
  expect(retry.currentLevelId).toBe("village");
  expect(retry.quests.zone1RewardClaimed).toBe(false);
  expect(retry.saDoa).toBe(0);
  expect(retry.mode).toBe("dialogue");
  await expect(page.locator("#dialogue-choice-list")).toBeVisible();

});

test("pause settings persist audio, accessibility, and minimap preferences", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.locator("#pause-button").click();
  await expect(page.locator("#pause-menu")).toBeVisible();
  await page.locator("#settings-button").click();
  await expect(page.locator("#settings-menu")).toBeVisible();

  await page.locator("#music-volume-input").fill("42");
  await page.locator("#sfx-volume-input").fill("67");
  await page.locator("#dialogue-volume-input").fill("31");
  await page.locator("#reduced-motion-input").check();
  await page.locator("#large-text-input").check();
  await page.locator("#minimap-input").uncheck();
  await page.locator("#minimap-size-input").selectOption("large");
  await page.locator("#minimap-opacity-input").selectOption("soft");
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.reducedMotion)).toBe("true");
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.textScale)).toBe("large");
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.minimapSize)).toBe("large");
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.minimapOpacity)).toBe("soft");
  await page.screenshot({ path: testInfo.outputPath("pause-settings.png"), fullPage: true });

  await page.locator("#close-settings-button").click();
  await expect(page.locator("#pause-menu")).toBeVisible();
  await page.locator("#resume-button").click();
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
  await expect(page.locator("#minimap")).toHaveClass(/hidden/);

  await page.reload();
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.reducedMotion)).toBe("true");
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.textScale)).toBe("large");
  await expect(page.locator("#minimap-size-input")).toHaveValue("large");
  await expect(page.locator("#minimap-opacity-input")).toHaveValue("soft");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("crossroads-settings-v1")).settings.dialogueVolume)).toBe(0.31);
});

test("minimap appearance preferences resize the live panel without taking gameplay input", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.locator("#pause-button").click();
  await page.locator("#settings-button").click();
  await page.locator("#minimap-size-input").selectOption("large");
  await page.locator("#minimap-opacity-input").selectOption("soft");
  await page.locator("#close-settings-button").click();
  await page.locator("#resume-button").click();

  await expect(page.locator("#minimap")).toBeVisible();
  const minimapBox = await page.locator("#minimap").boundingBox();
  const hudBox = await page.locator("#hud").boundingBox();
  expect(minimapBox?.width).toBeGreaterThan(160);
  expect((minimapBox?.y ?? 0) + (minimapBox?.height ?? 0)).toBeLessThan(hudBox?.y ?? 0);
  await expect(page.locator("#minimap")).toHaveCSS("opacity", "0.72");
  await page.screenshot({ path: testInfo.outputPath("large-soft-minimap.png"), fullPage: true });
});

test("key binding settings reject conflicts and persist an updated combat prompt", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.locator("#pause-button").click();
  await page.locator("#settings-button").click();
  await page.locator('[data-key-binding="attack"]').click();
  await page.keyboard.press("k");
  await expect(page.locator("#key-binding-status")).toContainText("đang dùng");
  await page.keyboard.press("f");
  await expect(page.locator('[data-key-binding="attack"]')).toContainText("F");
  await page.screenshot({ path: testInfo.outputPath("key-bindings.png"), fullPage: true });
  await page.locator("#close-settings-button").click();
  await page.locator("#resume-button").click();
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
  await page.keyboard.press("f");
  await expect.poll(() => snapshot(page).then((state) => state.player.animation)).toMatch(/attack/);
  await page.reload();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("crossroads-settings-v1")).settings.keyBindings.attack)).toBe("f");
});

test("Zone 2 division risk needs a separate emblem confirmation before its ending", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("archive"));
  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe("archive");
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("split-blade"));
  await expect(page.locator("#dialogue-choice-list")).toBeVisible();
  await page.locator('[data-dialogue-choice="divide"]').click();
  await expect.poll(() => snapshot(page).then((state) => state.narrative.endingRisks.zone2)).toBe(1);
  await expect(page.locator("#end-overlay")).toBeHidden();

  for (const delegateId of ["delegate-east", "delegate-west", "delegate-north"]) {
    await page.evaluate((interactableId) => window.__CROSSROADS_DEBUG__.interactById(interactableId), delegateId);
  }
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("archive-lens-console"));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("unity-round-table"));
  await page.locator('[data-dialogue-choice="confirm-factionalism"]').click();
  await expect(page.locator("#end-overlay")).toBeVisible();
  await expect.poll(() => snapshot(page).then((state) => state.endingId)).toBe("zone2-fading-fires");
  await expect.poll(() => snapshot(page).then((state) => state.inventory)).not.toContain("unified-emblem");
  await expect.poll(() => snapshot(page).then((state) => state.quests.zone2RewardClaimed)).toBe(false);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeEndingCinematic());
  await expect(page.locator("#end-overlay")).toHaveAttribute("data-cinematic", "complete");
  await page.screenshot({ path: testInfo.outputPath("zone2-fading-fires-ending.png"), fullPage: true });
});

test("a Zone 2 verdict that reaches maximum corruption cannot award its relic before recovery", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("archive"));
  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe("archive");
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("split-blade"));
  await expect(page.locator("#dialogue-choice-list")).toBeVisible();
  await page.locator('[data-dialogue-choice="divide"]').click();

  for (const delegateId of ["delegate-east", "delegate-west", "delegate-north"]) {
    await page.evaluate((interactableId) => window.__CROSSROADS_DEBUG__.interactById(interactableId), delegateId);
  }
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("archive-lens-console"));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setSaDoa(90));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("unity-round-table"));
  await page.locator('[data-dialogue-choice="confirm-factionalism"]').click();

  await expect.poll(() => snapshot(page).then((state) => state.endingId)).toBe("secret-corruption");
  await expect.poll(() => snapshot(page).then((state) => state.inventory)).not.toContain("unified-emblem");
  await expect.poll(() => snapshot(page).then((state) => state.quests.zone2RewardClaimed)).toBe(false);
  await expect.poll(
    () => snapshot(page).then((state) => state.portalStates.find((portal) => portal.id === "back-to-hub-2")?.status),
  ).toBe("sealed");
  await page.screenshot({ path: testInfo.outputPath("zone2-max-corruption-relic-sealed.png"), fullPage: true });

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeEndingCinematic());
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setBadEndingRecoveryElapsed(9400));
  await expect.poll(() => snapshot(page).then((state) => state.badEndingRecovery?.phase)).toBe("reset");
  await page.screenshot({ path: testInfo.outputPath("zone2-max-corruption-reset-wave.png"), fullPage: true });
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setBadEndingRecoveryElapsed(11000));
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe("archive");
  await expect.poll(() => snapshot(page).then((state) => state.inventory)).not.toContain("unified-emblem");
  await expect.poll(() => snapshot(page).then((state) => state.quests.zone2RewardClaimed)).toBe(false);

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("unity-round-table"));
  await page.locator('[data-dialogue-choice="repair-division"]').click();
  await expect.poll(() => snapshot(page).then((state) => state.inventory)).toContain("unified-emblem");
  await expect.poll(() => snapshot(page).then((state) => state.quests.zone2RewardClaimed)).toBe(true);
  await expect.poll(
    () => snapshot(page).then((state) => state.portalStates.find((portal) => portal.id === "back-to-hub-2")?.status),
  ).toBe("complete");
  await page.screenshot({ path: testInfo.outputPath("zone2-relic-awarded-after-recovery-choice.png"), fullPage: true });
});

test("Zone 3A fragmentation needs an August confirmation before its ending", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("crossroads"));
  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe("crossroads");

  for (const recruitId of ["recruit-farmer", "recruit-worker", "recruit-intellectual", "recruit-bourgeois"]) {
    await page.evaluate((interactableId) => window.__CROSSROADS_DEBUG__.interactById(interactableId), recruitId);
  }
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("vietminh-cadre"));
  await page.locator('[data-dialogue-choice="fragment-rally"]').click();
  await expect.poll(() => snapshot(page).then((state) => state.narrative.endingRisks.zone3a)).toBe(1);
  await expect(page.locator("#end-overlay")).toBeHidden();

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("vietminh-cadre"));
  await page.locator('[data-dialogue-choice="confirm-delay"]').click();
  await expect(page.locator("#end-overlay")).toBeVisible();
  await expect.poll(() => snapshot(page).then((state) => state.endingId)).toBe("zone3a-missed-moment");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeEndingCinematic());
  await expect(page.locator("#end-overlay")).toHaveAttribute("data-cinematic", "complete");
  await page.screenshot({ path: testInfo.outputPath("zone3a-missed-moment-ending.png"), fullPage: true });
});

for (const recoveryChoice of ["protect-moment", "repair-fragment"]) {
  test(`Zone 3A recovery accepts ${recoveryChoice} after reset wave`, async ({ page }, testInfo) => {
    await openDebugSession(page);
    await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("crossroads"));
    await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe("crossroads");

    for (const recruitId of ["recruit-farmer", "recruit-worker", "recruit-intellectual", "recruit-bourgeois"]) {
      await page.evaluate((interactableId) => window.__CROSSROADS_DEBUG__.interactById(interactableId), recruitId);
    }
    await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("vietminh-cadre"));
    await page.locator('[data-dialogue-choice="fragment-rally"]').click();
    await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("vietminh-cadre"));
    await page.locator('[data-dialogue-choice="confirm-delay"]').click();
    await expect.poll(() => snapshot(page).then((state) => state.endingId)).toBe("zone3a-missed-moment");

    await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeEndingCinematic());
    await page.evaluate(() => window.__CROSSROADS_DEBUG__.setBadEndingRecoveryElapsed(11000));
    await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
    await expect.poll(() => snapshot(page).then((state) => state.narrative.branchFlags["zone3a.badConfirmed"] ?? false)).toBe(false);
    await expect.poll(() => snapshot(page).then((state) => state.narrative.endingRisks.zone3a)).toBe(1);
    await expect.poll(() => snapshot(page).then((state) => state.inventory)).not.toContain("vietminh-thread");
    await expect.poll(() => snapshot(page).then((state) => state.quests.zone3ThreadClaimed)).toBe(false);

    await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("vietminh-cadre"));
    await page.locator(`[data-dialogue-choice="${recoveryChoice}"]`).click();
    await expect.poll(() => snapshot(page).then((state) => state.endingId)).toBeNull();
    await expect.poll(() => snapshot(page).then((state) => state.inventory)).toContain("vietminh-thread");
    await expect.poll(() => snapshot(page).then((state) => state.quests.zone3ThreadClaimed)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`zone3a-${recoveryChoice}-after-reset.png`), fullPage: true });
  });
}

for (const recoveryChoice of ["protect-moment", "repair-fragment"]) {
  test(`Zone 3A ${recoveryChoice} repairs a save with a stale bad-ending confirmation`, async ({ page }, testInfo) => {
    await page.addInitScript(() => {
      localStorage.setItem("crossroads-save-v1", JSON.stringify({
        version: 2,
        currentLevelId: "crossroads",
        player: { x: 480, y: 320, direction: "up" },
        respawnLevelId: "crossroads",
        respawnSpawn: { x: 480, y: 320, direction: "up" },
        health: 36,
        stamina: 100,
        saDoa: 0,
        inventory: ["red-compass", "unified-emblem"],
        unlockedStoryIds: [],
        completedZones: ["village", "archive"],
        difficulty: "normal",
        activeChallengeId: null,
        tutorialSeen: true,
        runStats: {},
        quests: {
          tvaBriefingAccepted: true,
          tvaPortalTarget: null,
          tvaTrackedChapterId: null,
          tvaReportedRelics: ["red-compass", "unified-emblem"],
          zone3Recruits: ["farmer", "worker", "intellectual", "bourgeois"],
          zone3ThreadClaimed: false,
        },
        narrative: {
          choices: {},
          choiceHistory: [],
          branchFlags: {
            "zone3a.fragmentedRally": true,
            "zone3a.badConfirmed": true,
            "zone2.badConfirmed": true,
          },
          endingRisks: { zone2: 3, zone3a: 3 },
          endingsUnlocked: ["zone3a-missed-moment"],
        },
        runtime: {},
      }));
    });
    await page.goto("/?debugTools=1");
    await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
    await page.locator("#continue-button").click();
    await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
    await expect.poll(() => snapshot(page).then((state) => state.narrative.branchFlags["zone2.badConfirmed"] ?? false)).toBe(false);

    await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("vietminh-cadre"));
    await page.locator('[data-dialogue-choice="prepare-network"]').click();
    await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("vietminh-cadre"));
    await page.locator(`[data-dialogue-choice="${recoveryChoice}"]`).click();

    await expect.poll(() => snapshot(page).then((state) => state.endingId)).toBeNull();
    await expect.poll(() => snapshot(page).then((state) => state.narrative.branchFlags["zone3a.badConfirmed"] ?? false)).toBe(false);
    await expect.poll(() => snapshot(page).then((state) => state.inventory)).toContain("vietminh-thread");
    await expect.poll(() => snapshot(page).then((state) => state.quests.zone3ThreadClaimed)).toBe(true);
    await expect(page.locator("#zone-summary-overlay")).toBeVisible();
    await page.waitForTimeout(750);
    await page.screenshot({ path: testInfo.outputPath(`zone3a-${recoveryChoice}-stale-save-repaired.png`), fullPage: true });
  });
}

test("Zone 3B separation needs a border confirmation before its ending", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("crossroads"));
  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe("crossroads");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("foreign-advisor"));
  await page.locator('[data-dialogue-choice="normalize-separation"]').click();
  await expect.poll(() => snapshot(page).then((state) => state.narrative.endingRisks.zone3b)).toBe(1);
  await expect(page.locator("#end-overlay")).toBeHidden();

  for (const hamletId of ["hamlet-1", "hamlet-2", "hamlet-3"]) {
    await page.evaluate((interactableId) => window.__CROSSROADS_DEBUG__.interactById(interactableId), hamletId);
  }
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.damageMonster("southern-tyrant", 99));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("resistance-commander"));
  await page.locator('[data-dialogue-choice="confirm-permanent-division"]').click();
  await expect(page.locator("#end-overlay")).toBeVisible();
  await expect.poll(() => snapshot(page).then((state) => state.endingId)).toBe("zone3b-divided-border");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeEndingCinematic());
  await expect(page.locator("#end-overlay")).toHaveAttribute("data-cinematic", "complete");
  await page.screenshot({ path: testInfo.outputPath("zone3b-divided-border-ending.png"), fullPage: true });
});

test("Zone 4 stagnation needs a Doi Moi confirmation before its ending", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("spring"));
  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe("spring");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("corrupt-official"));
  await page.locator('[data-dialogue-choice="protect-private-privilege"]').click();
  await expect.poll(() => snapshot(page).then((state) => state.narrative.endingRisks.zone4)).toBe(1);
  await expect(page.locator("#end-overlay")).toBeHidden();

  for (const wallId of ["bao-cap-wall-1", "bao-cap-wall-2", "bao-cap-wall-3"]) {
    await page.evaluate((interactableId) => window.__CROSSROADS_DEBUG__.interactById(interactableId), wallId);
  }
  for (const farmerId of ["farmer-khoan-1", "farmer-khoan-2", "farmer-khoan-3"]) {
    await page.evaluate((interactableId) => window.__CROSSROADS_DEBUG__.interactById(interactableId), farmerId);
  }
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("doi-moi-leader"));
  await page.locator('[data-dialogue-choice="confirm-stagnation"]').click();
  await expect(page.locator("#end-overlay")).toBeVisible();
  await expect.poll(() => snapshot(page).then((state) => state.endingId)).toBe("zone4-stalled-machine");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeEndingCinematic());
  await expect(page.locator("#end-overlay")).toHaveAttribute("data-cinematic", "complete");
  await page.screenshot({ path: testInfo.outputPath("zone4-stalled-machine-ending.png"), fullPage: true });
});

for (const endingId of ["good", "neutral", "bad", "secret-corruption"]) {
  test(`${endingId} ending renders from its explicit debug route`, async ({ page }, testInfo) => {
    await page.goto(`/?debugTools=1&debugEnding=${endingId}`);
    await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
    await expect(page.locator("#end-overlay")).toBeVisible();
    expect((await snapshot(page)).mode).toBe("ending");
    expect((await snapshot(page)).endingId).toBe(endingId);
    if (endingId === "neutral") {
      await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeEndingCinematic());
      await expect(page.locator("#end-overlay")).toHaveAttribute("data-cinematic", "complete");
    }
    await page.screenshot({ path: testInfo.outputPath(`${endingId}-ending.png`), fullPage: true });
  });
}

test("a completed good ending returns to the TVA epilogue instead of silently resetting to the title screen", async ({ page }, testInfo) => {
  await page.goto("/?debugTools=1&debugEnding=good");
  await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeEndingCinematic());
  await expect(page.locator("#end-overlay")).toHaveAttribute("data-cinematic", "complete");
  await expect(page.locator("#return-start-button")).toHaveText("Về TVA");

  await page.locator("#return-start-button").click();
  await expect(page.locator("#end-overlay")).toBeHidden();
  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe("hub");
  await expect.poll(() => snapshot(page).then((state) => state.hubEpilogue?.kind)).toBe("good");
  await page.screenshot({ path: testInfo.outputPath("good-ending-tva-epilogue.png"), fullPage: true });
});
