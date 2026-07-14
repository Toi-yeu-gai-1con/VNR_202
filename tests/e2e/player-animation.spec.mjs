import { expect, test } from "@playwright/test";

async function openDebugSession(page) {
  await page.goto("/?debugTools=1");
  await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.beginSession());
  for (let step = 0; step < 3; step += 1) {
    await page.locator("#tutorial-next-button").click();
  }
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().mode)).toBe("playing");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.loadLevel("village"));
}

test("player action strips render the requested attack, dash, heal, hurt, and death states", async ({ page }, testInfo) => {
  await openDebugSession(page);

  const actions = ["attack1", "parry", "dash", "heal", "hurt", "death"];
  for (const action of actions) {
    await page.evaluate((animation) => window.__CROSSROADS_DEBUG__.playPlayerAnimation(animation), action);
    await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().player.animation)).toBe(action);
    await page.screenshot({ path: testInfo.outputPath(`player-${action}.png`), fullPage: true });
  }

  await page.waitForTimeout(2100);
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().player.animation)).toBe("idle");
});

test("keyboard combat verbs select the directional action strips", async ({ page }) => {
  await openDebugSession(page);

  await page.keyboard.down("j");
  await page.keyboard.up("j");
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().player.animation)).toBe("attack1");

  await page.waitForTimeout(450);
  await page.keyboard.down("j");
  await page.waitForTimeout(400);
  await page.keyboard.up("j");
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().player.animation)).toBe("attack2");

  await page.waitForTimeout(450);
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.strike());
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().player.animation)).toBe("attack2");

  await page.waitForTimeout(450);
  await page.keyboard.press("l");
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().player.animation)).toBe("dash");

  await page.waitForTimeout(450);
  await page.keyboard.press("k");
  await expect.poll(() => page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot().player.animation)).toBe("parry");
});
