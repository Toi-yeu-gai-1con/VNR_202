import { expect, test } from "./support/game-fixture.mjs";

const relics = ["red-compass", "unified-emblem", "vietminh-thread", "healed-map", "doi-moi-gear"];

async function snapshot(page) {
  return page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot());
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

async function openFinalVerdict(page, corruption) {
  await page.addInitScript(({ savedRelics, saDoa }) => {
    localStorage.setItem("crossroads-save-v1", JSON.stringify({
      version: 2,
      currentLevelId: "hub",
      player: { x: 384, y: 286, direction: "up" },
      respawnLevelId: "hub",
      respawnSpawn: { x: 384, y: 286, direction: "up" },
      health: 36,
      stamina: 100,
      saDoa,
      inventory: savedRelics,
      unlockedStoryIds: [],
      completedZones: ["village", "archive", "crossroads", "spring"],
      difficulty: "normal",
      activeChallengeId: null,
      tutorialSeen: true,
      runStats: { maxCorruption: saDoa },
      quests: {
        tvaBriefingAccepted: true,
        tvaPortalTarget: null,
        tvaTrackedChapterId: null,
        tvaReportedRelics: savedRelics,
        zone1RewardClaimed: true,
        zone2RewardClaimed: true,
        zone3ThreadClaimed: true,
        zone3MapClaimed: true,
        zone4GearClaimed: true,
      },
      narrative: {},
      runtime: {},
    }));
  }, { savedRelics: relics, saDoa: corruption });
  await page.goto("/?debugTools=1");
  await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
  await page.locator("#continue-button").click();
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.interactById("tva-clerk-placeholder"));
  await choose(page, "finish-history");
}

for (const [corruption, expectedEnding] of [
  [24, "good"],
  [25, "neutral"],
  [59, "neutral"],
  [60, "bad"],
  [99, "bad"],
  [100, "secret-corruption"],
]) {
  test(`final ending boundary: corruption ${corruption} resolves to ${expectedEnding}`, async ({ page }, testInfo) => {
    await openFinalVerdict(page, corruption);
    await expect(page.locator("#end-overlay")).toBeVisible();
    await expect.poll(() => snapshot(page).then((state) => state.endingId)).toBe(expectedEnding);
    await page.screenshot({ path: testInfo.outputPath(`corruption-${corruption}-${expectedEnding}.png`), fullPage: true });
  });
}
