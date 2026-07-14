import { expect, test } from "@playwright/test";

async function openDebugSession(page) {
  await page.goto("/?debugTools=1");
  await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
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

test("the employee forces the TVA briefing choice and opens the first dispatch portal", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("hub", { x: 480, y: 260, direction: "up" }));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-clerk-placeholder"));
  await expect(page.locator("#dialogue-speaker")).toHaveText("Nhân viên TVA");
  for (let line = 0; line < 7; line += 1) {
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
  expect(result.currentLevelId).toBe("village");
  expect(result.quests.tvaPortalTarget).toBe(null);
});

test("reported relics unlock each later TVA coordinate in campaign order", async ({ page }) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("hub", { x: 480, y: 260, direction: "up" }));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-clerk-placeholder"));
  for (let line = 0; line < 7; line += 1) await page.locator("#dialogue-next-button").click();
  await page.locator('[data-dialogue-choice="accept-assignment"]').click();
  await page.locator('[data-dialogue-choice="dispatch-later"]').click();

  const routes = ["village", "archive", "crossroads", "spring"];
  const nextRoutes = ["archive", "crossroads", "spring"];

  for (let index = 0; index < routes.length; index += 1) {
    await page.evaluate((levelId) => window.__CROSSROADS_DEBUG__.completeTvaRoute(levelId), routes[index]);
    await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("hub", { x: 480, y: 260, direction: "up" }));
    await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-clerk-placeholder"));

    const lineCount = index === routes.length - 1 ? 5 : 4;
    for (let line = 1; line < lineCount; line += 1) await page.locator("#dialogue-next-button").click();

    if (index < nextRoutes.length) {
      await page.locator('[data-dialogue-choice="dispatch-ready"]').click();
      await expect.poll(() => snapshot(page).then((state) => state.quests.tvaPortalTarget)).toBe(nextRoutes[index]);
      await page.locator("#dialogue-next-button").click();
      await page.locator("#dialogue-next-button").click();
      await page.evaluate(() => window.__CROSSROADS_DEBUG__.triggerExit("tva-dispatch-portal"));
      continue;
    }

    await page.locator('[data-dialogue-choice="finish-history"]').click();
    await expect(page.locator("#end-overlay")).toBeVisible();
    await expect.poll(() => snapshot(page).then((state) => state.endingId)).toBe("good");
  }

  await expect.poll(() => snapshot(page).then((state) => state.quests.tvaReportedRelics.length)).toBe(5);
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
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeEndingCinematic());
  await expect.poll(() => snapshot(page).then((state) => state.badEndingRecovery?.phase)).toBe("linger");

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setBadEndingRecoveryElapsed(4700));
  await expect(page.locator("#bad-ending-recovery-dialogue")).toBeVisible();
  await expect(page.locator("#bad-ending-recovery-text")).not.toBeEmpty();
  await expect.poll(() => snapshot(page).then((state) => state.badEndingRecovery?.phase)).toBe("complaint");
  await page.screenshot({ path: testInfo.outputPath("bad-ending-tva-recovery.png"), fullPage: true });

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.setBadEndingRecoveryElapsed(9000));
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
  const restored = await snapshot(page);
  expect(restored.currentLevelId).toBe(checkpoint.respawnLevelId);
  expect(restored.player.x).toBeCloseTo(checkpoint.player.x, 1);
  expect(restored.player.y).toBeCloseTo(checkpoint.player.y, 1);
  expect(restored.endingId).toBe(null);
  expect(restored.saDoa).toBeLessThan(60);
});

test("Zone 1 soldier offers a persistent choice and betrayal triggers the bad ending", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village", { x: 832, y: 244, direction: "up" }));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("le-paria-stack"));
  await page.waitForTimeout(250);
  await page.screenshot({ path: testInfo.outputPath("colonial-recruiter-scale.png"), fullPage: true });

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("colonial-recruiter"));
  await expect(page.locator("#dialogue-speaker")).toHaveText("Lính tuần tra Pháp");
  await page.locator("#dialogue-next-button").click();
  await page.locator("#dialogue-next-button").click();
  await expect(page.locator("#dialogue-choice-list")).toBeVisible();
  await expect(page.locator(".dialogue-choice-button")).toHaveCount(2);
  await page.screenshot({ path: testInfo.outputPath("colonial-recruiter-dialogue.png"), fullPage: true });

  await page.locator('[data-dialogue-choice="refuse"]').click();
  await expect.poll(() => snapshot(page).then((state) => state.quests.zone1SoldierDecision)).toBe("refused");
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");

  await page.evaluate(() => window.__CROSSROADS_DEBUG__.beginSession());
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village", { x: 832, y: 244, direction: "up" }));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("le-paria-stack"));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("colonial-recruiter"));
  await page.locator("#dialogue-next-button").click();
  await page.locator("#dialogue-next-button").click();
  await page.locator('[data-dialogue-choice="accept"]').click();
  await expect(page.locator("#end-overlay")).toBeVisible();
  await expect.poll(() => snapshot(page).then((state) => state.endingId)).toBe("bad");
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
