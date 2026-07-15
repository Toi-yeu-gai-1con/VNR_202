import { expect, test } from "./support/game-fixture.mjs";
import { CHALLENGE_COVERAGE } from "../coverage/game-content-manifest.mjs";

async function snapshot(page) {
  return page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot());
}

for (const { id } of CHALLENGE_COVERAGE) {
  test(`challenge coverage: ${id} can be selected and survives reload`, async ({ page }, testInfo) => {
    await page.goto("/?debugTools=1");
    await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
    await page.locator("#optional-challenge-controls summary").click();
    await page.locator(`[data-optional-challenge="${id}"]`).click();
    await expect(page.locator(`[data-optional-challenge="${id}"]`)).toHaveAttribute("aria-pressed", "true");
    await page.evaluate(() => window.__CROSSROADS_DEBUG__.beginSession());
    for (let step = 0; step < 3; step += 1) await page.locator("#tutorial-next-button").click();

    await expect.poll(() => snapshot(page).then((state) => state.optionalChallenge?.id)).toBe(id);
    await expect(page.locator("#challenge-chip")).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`${id}-active.png`), fullPage: true });

    await page.reload();
    await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
    await page.locator("#continue-button").click();
    await expect.poll(() => snapshot(page).then((state) => state.optionalChallenge?.id)).toBe(id);
  });
}
