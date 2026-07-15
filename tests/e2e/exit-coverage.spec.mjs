import { expect, test } from "./support/game-fixture.mjs";
import { EXIT_COVERAGE } from "../coverage/game-content-manifest.mjs";

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

async function loadLevel(page, levelId) {
  await page.evaluate((id) => window.__CROSSROADS_DEBUG__.loadLevel(id), levelId);
  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe(levelId);
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
}

async function choose(page, optionId) {
  const option = page.locator(`[data-dialogue-choice="${optionId}"]`);
  for (let step = 0; step < 30; step += 1) {
    if (await option.isVisible()) {
      await option.click();
      return;
    }
    const next = page.locator("#dialogue-next-button");
    if (await next.isVisible()) await next.click();
    else await page.waitForTimeout(16);
  }
  await expect(option).toBeVisible();
}

async function closeDialogue(page) {
  for (let step = 0; step < 12; step += 1) {
    if ((await snapshot(page)).mode !== "dialogue") return;
    const next = page.locator("#dialogue-next-button");
    if (await next.isVisible()) await next.click();
    else await page.waitForTimeout(16);
  }
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
}

for (const entry of EXIT_COVERAGE) {
  test(`exit coverage: ${entry.levelId}/${entry.id}`, async ({ page }, testInfo) => {
    await openDebugSession(page);
    await loadLevel(page, entry.levelId);

    const locked = await page.evaluate((exitId) => window.__CROSSROADS_DEBUG__.triggerExit(exitId), entry.id);
    expect(locked.transitioned).toBe(false);
    expect(locked.currentLevelId).toBe(entry.levelId);
    await page.evaluate(() => window.__CROSSROADS_DEBUG__.setPlayerPosition(480, 320));

    let expectedTarget = "hub";
    if (entry.levelId === "hub") {
      await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-clerk-placeholder"));
      await choose(page, "accept-assignment");
      await choose(page, "dispatch-ready");
      await closeDialogue(page);
      expectedTarget = "village";
    } else {
      await page.evaluate((levelId) => window.__CROSSROADS_DEBUG__.completeTvaRoute(levelId), entry.levelId);
      await loadLevel(page, entry.levelId);
    }

    await page.screenshot({ path: testInfo.outputPath(`${entry.levelId}-exit-open.png`), fullPage: true });
    const opened = await page.evaluate((exitId) => window.__CROSSROADS_DEBUG__.triggerExit(exitId), entry.id);
    expect(opened.transitioned).toBe(true);
    expect(opened.currentLevelId).toBe(entry.levelId);
    expect(opened.portalTransition?.targetLevelId).toBe(expectedTarget);
    await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe(expectedTarget);
    await expect.poll(() => snapshot(page).then((state) => state.portalTransition)).toBeNull();
  });
}
