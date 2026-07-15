import { expect, test } from "./support/game-fixture.mjs";

async function snapshot(page) {
  return page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot());
}

async function openDebugSession(page) {
  await page.goto("/?debugTools=1");
  await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.beginSession());
  for (let step = 0; step < 3; step += 1) await page.locator("#tutorial-next-button").click();
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
}

async function finishDialogueLine(page) {
  const typing = await snapshot(page).then((state) => state.typewriter?.kind === "dialogue" && !state.typewriter.complete);
  if (typing) await page.locator("#dialogue-next-button").click();
}

async function loadLevel(page, levelId, options = undefined) {
  await page.evaluate(({ id, loadOptions }) => window.__CROSSROADS_DEBUG__.loadLevel(id, null, loadOptions), {
    id: levelId,
    loadOptions: options,
  });
  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe(levelId);
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe(options?.showTitleCard ? "modal" : "playing");
}

test("Zone 1 constructive last-issue choice awards the compass without asking for a second interaction", async ({ page }) => {
  await openDebugSession(page);
  await loadLevel(page, "village");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("le-paria-stack"));
  await finishDialogueLine(page);
  await page.locator('[data-dialogue-choice="protect"]').click();
  for (const workerId of ["worker-harbor-1", "worker-harbor-2", "worker-harbor-3"]) {
    await page.evaluate((id) => window.__CROSSROADS_DEBUG__.interactById(id), workerId);
  }
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("red-compass-reward"));
  await finishDialogueLine(page);
  await page.locator('[data-dialogue-choice="rescue"]').click();

  await expect.poll(() => snapshot(page).then((state) => state.quests.zone1RewardClaimed)).toBe(true);
  await expect.poll(() => snapshot(page).then((state) => state.inventory)).toContain("red-compass");
  await expect(page.locator("#zone-summary-overlay")).toBeVisible();
});

test("Zone 3 constructive rally choice awards the thread but keeps the unfinished lower mission active", async ({ page }) => {
  await openDebugSession(page);
  await loadLevel(page, "crossroads");
  for (const recruitId of ["recruit-farmer", "recruit-worker", "recruit-intellectual", "recruit-bourgeois"]) {
    await page.evaluate((id) => window.__CROSSROADS_DEBUG__.interactById(id), recruitId);
  }
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("vietminh-cadre"));
  await finishDialogueLine(page);
  await page.locator('[data-dialogue-choice="prepare-network"]').click();

  await expect.poll(() => snapshot(page).then((state) => state.quests.zone3ThreadClaimed)).toBe(true);
  await expect.poll(() => snapshot(page).then((state) => state.inventory)).toContain("vietminh-thread");
  await expect.poll(() => snapshot(page).then((state) => state.completedZones)).not.toContain("crossroads");
  await expect(page.locator("#zone-summary-overlay")).toBeHidden();
  await expect.poll(
    () => snapshot(page).then((state) => state.portalStates.find((portal) => portal.id === "back-to-hub-3")?.status),
  ).toBe("sealed");
});

test("Zone 3 summary appears only after the lower mission and second relic are complete", async ({ page }) => {
  await openDebugSession(page);
  await loadLevel(page, "crossroads");
  for (const recruitId of ["recruit-farmer", "recruit-worker", "recruit-intellectual", "recruit-bourgeois"]) {
    await page.evaluate((id) => window.__CROSSROADS_DEBUG__.interactById(id), recruitId);
  }
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("vietminh-cadre"));
  await finishDialogueLine(page);
  await page.locator('[data-dialogue-choice="prepare-network"]').click();
  for (const hamletId of ["hamlet-1", "hamlet-2", "hamlet-3"]) {
    await page.evaluate((id) => window.__CROSSROADS_DEBUG__.interactById(id), hamletId);
  }
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.damageMonster("southern-tyrant", 99));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("resistance-commander"));
  await finishDialogueLine(page);
  await page.locator('[data-dialogue-choice="restore-unity"]').click();

  await expect.poll(() => snapshot(page).then((state) => state.quests.zone3MapClaimed)).toBe(true);
  await expect.poll(() => snapshot(page).then((state) => state.completedZones)).toContain("crossroads");
  await expect(page.locator("#zone-summary-overlay")).toBeVisible();
  await expect.poll(
    () => snapshot(page).then((state) => state.portalStates.find((portal) => portal.id === "back-to-hub-3")?.status),
  ).toBe("complete");
});

test("Zone 3 reload resumes the final verdict instead of repeating rally strategy", async ({ page }) => {
  await openDebugSession(page);
  await loadLevel(page, "crossroads");
  for (const recruitId of ["recruit-farmer", "recruit-worker", "recruit-intellectual", "recruit-bourgeois"]) {
    await page.evaluate((id) => window.__CROSSROADS_DEBUG__.interactById(id), recruitId);
  }
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("vietminh-cadre"));
  await finishDialogueLine(page);
  await page.locator('[data-dialogue-choice="fragment-rally"]').click();
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
  await page.locator("#continue-button").click();
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("vietminh-cadre"));
  await finishDialogueLine(page);

  await expect(page.locator('[data-dialogue-choice="protect-moment"]')).toBeVisible();
  await expect(page.locator('[data-dialogue-choice="repair-fragment"]')).toBeVisible();
  await expect(page.locator('[data-dialogue-choice="prepare-network"]')).toBeHidden();
});

test("E activates the historical title-card CTA", async ({ page }) => {
  await openDebugSession(page);
  await loadLevel(page, "village", { showTitleCard: true });
  await expect(page.locator("#zone-title-overlay")).toBeVisible();
  await page.keyboard.press("e");
  await expect(page.locator("#zone-title-overlay")).toBeHidden();
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
});

test("E activates the zone-summary CTA", async ({ page }) => {
  await openDebugSession(page);
  await loadLevel(page, "archive");
  for (const delegateId of ["delegate-east", "delegate-west", "delegate-north"]) {
    await page.evaluate((id) => window.__CROSSROADS_DEBUG__.interactById(id), delegateId);
  }
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("archive-lens-console"));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("unity-round-table"));
  await finishDialogueLine(page);
  await page.locator('[data-dialogue-choice="unify"]').click();
  await expect(page.locator("#zone-summary-overlay")).toBeVisible();
  await page.keyboard.press("e");
  await expect(page.locator("#zone-summary-overlay")).toBeHidden();
  await expect.poll(() => snapshot(page).then((state) => state.mode)).not.toBe("summary");
});

test("earned TVA returnees remain readable beside the hub cast", async ({ page }, testInfo) => {
  await openDebugSession(page);
  for (const levelId of ["village", "archive", "crossroads", "spring"]) {
    await page.evaluate((id) => window.__CROSSROADS_DEBUG__.completeTvaRoute(id), levelId);
  }
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("hub"));
  await page.screenshot({ path: testInfo.outputPath("tva-returnees-scale.png"), fullPage: true });
  await page.setViewportSize({ width: 800, height: 720 });
  await page.screenshot({ path: testInfo.outputPath("tva-returnees-scale-compact.png"), fullPage: true });
});
