import { expect, test } from "./support/game-fixture.mjs";
import { INTERACTABLE_COVERAGE } from "../coverage/game-content-manifest.mjs";

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

async function interact(page, id) {
  return page.evaluate((interactableId) => window.__CROSSROADS_DEBUG__.interactById(interactableId), id);
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

async function startZone1(page) {
  await interact(page, "le-paria-stack");
  await choose(page, "protect");
}

async function prepareInteraction(page, entry) {
  if (entry.id.startsWith("tva-returnee-")) {
    const route = {
      "tva-returnee-zone1": "village",
      "tva-returnee-zone2": "archive",
      "tva-returnee-zone3a": "crossroads",
      "tva-returnee-zone3b": "crossroads",
      "tva-returnee-zone4": "spring",
    }[entry.id];
    await page.evaluate((levelId) => window.__CROSSROADS_DEBUG__.completeTvaRoute(levelId), route);
  }
  await loadLevel(page, entry.levelId);

  if (["worker-harbor-1", "worker-harbor-2", "worker-harbor-3", "red-compass-reward"].includes(entry.id)) {
    await startZone1(page);
  }
  if (entry.id === "red-compass-reward") {
    for (const id of ["worker-harbor-1", "worker-harbor-2", "worker-harbor-3"]) await interact(page, id);
  }
  if (["archive-lens-console", "unity-round-table"].includes(entry.id)) {
    for (const id of ["delegate-east", "delegate-west", "delegate-north"]) await interact(page, id);
  }
  if (entry.id === "unity-round-table") await interact(page, "archive-lens-console");
  if (entry.id === "vietminh-cadre") {
    for (const id of ["recruit-farmer", "recruit-worker", "recruit-intellectual", "recruit-bourgeois"]) await interact(page, id);
  }
  if (entry.id === "resistance-commander") {
    for (const id of ["hamlet-1", "hamlet-2", "hamlet-3"]) await interact(page, id);
    await page.evaluate(() => window.__CROSSROADS_DEBUG__.damageMonster("southern-tyrant", 99));
  }
  if (entry.id.startsWith("farmer-khoan-")) {
    for (const id of ["bao-cap-wall-1", "bao-cap-wall-2", "bao-cap-wall-3"]) await interact(page, id);
  }
  if (entry.id === "doi-moi-leader") {
    for (const id of ["bao-cap-wall-1", "bao-cap-wall-2", "bao-cap-wall-3", "farmer-khoan-1", "farmer-khoan-2", "farmer-khoan-3"]) {
      await interact(page, id);
    }
  }
}

for (const entry of INTERACTABLE_COVERAGE) {
  test(`interaction coverage: ${entry.levelId}/${entry.id}`, async ({ page }) => {
    await openDebugSession(page);
    await prepareInteraction(page, entry);
    const before = await snapshot(page);
    const result = await interact(page, entry.id);
    expect(result, `${entry.levelId}/${entry.id} must resolve through the live runtime`).not.toBe(false);

    if (entry.assertionProfile === "archive") {
      await expect(page.locator("#tva-dossier-modal")).toBeVisible();
      return;
    }
    if (["choice", "reward-verdict", "hub-returnee", "scenic-lore", "attack-penalty"].includes(entry.assertionProfile)) {
      await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("dialogue");
      await expect(page.locator("#dialogue-box")).toBeVisible();
      return;
    }

    const after = await snapshot(page);
    expect(after.quests, `${entry.levelId}/${entry.id} must change its objective state`).not.toEqual(before.quests);
  });
}
