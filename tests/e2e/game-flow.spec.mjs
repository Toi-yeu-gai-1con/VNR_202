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

test("player combat emits audible swing and incoming-hit cues", async ({ page }, testInfo) => {
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
  await expect.poll(() => page.evaluate(() => window.__playedAudioSources.some((source) => source.includes("strike-swing")))).toBe(true);

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.damagePlayer(1, "Playwright"));
  await expect.poll(() => page.evaluate(() => window.__playedAudioSources.some((source) => source.includes("player-hurt")))).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("combat-audio-cues.png"), fullPage: true });
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
});

test("each hub gate transitions through the real exit and sets a checkpoint", async ({ page }) => {
  await openDebugSession(page);

  for (const exitId of ["to-fog-port", "to-three-room-house", "to-red-square", "to-doi-moi-valley"]) {
    const result = await page.evaluate((id) => window.__CROSSROADS_DEBUG__.triggerExit(id), exitId);
    expect(result.transitioned, `Expected ${exitId} to transition from the hub.`).toBe(true);
    expect(result.currentLevelId).not.toBe("hub");
    expect(result.respawnLevelId).toBe(result.currentLevelId);
    await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("hub"));
  }
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

for (const endingId of ["good", "bad"]) {
  test(`${endingId} ending renders from its explicit debug route`, async ({ page }, testInfo) => {
    await page.goto(`/?debugTools=1&debugEnding=${endingId}`);
    await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
    await expect(page.locator("#end-overlay")).toBeVisible();
    expect((await snapshot(page)).mode).toBe("ending");
    expect((await snapshot(page)).endingId).toBe(endingId);
    await page.screenshot({ path: testInfo.outputPath(`${endingId}-ending.png`), fullPage: true });
  });
}
