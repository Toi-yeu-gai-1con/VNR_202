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

test("presentation gate keeps the hub and David dialogue legible", async ({ page }, testInfo) => {
  await page.goto("/?debugTools=1");
  await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
  await page.screenshot({ path: testInfo.outputPath("start-screen.png"), fullPage: true });
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.beginSession());
  for (let step = 0; step < 3; step += 1) await page.locator("#tutorial-next-button").click();
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-clerk-placeholder"));
  await page.locator("#dialogue-next-button").click();
  await expect(page.locator("#dialogue-portrait")).toBeVisible();
  await expect(page.locator("#dialogue-text")).not.toBeEmpty();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("hub-david-dialogue.png"), fullPage: true });
});

test("presentation gate renders reset VFX safely with reduced motion", async ({ page }, testInfo) => {
  await openDebugSession(page);
  await page.locator("#pause-button").click();
  await page.locator("#settings-button").click();
  await page.locator("#reduced-motion-input").check();
  await page.locator("#close-settings-button").click();
  await page.locator("#resume-button").click();
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.triggerBadEnding());
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.completeEndingCinematic());
  const resetAt = await snapshot(page).then((state) => state.badEndingRecovery.timeline.resetAt);
  await page.evaluate((elapsed) => window.__CROSSROADS_DEBUG__.setBadEndingRecoveryElapsed(elapsed), resetAt + 1500);
  await expect.poll(() => snapshot(page).then((state) => state.badEndingRecovery?.phase)).toBe("reset");
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.reducedMotion)).toBe("true");
  await page.screenshot({ path: testInfo.outputPath("reset-reduced-motion.png"), fullPage: true });
});
