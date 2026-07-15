import { expect, test } from "./support/game-fixture.mjs";
import { CHOICE_COVERAGE } from "../coverage/game-content-manifest.mjs";

async function snapshot(page) {
  return page.evaluate(() => window.__CROSSROADS_DEBUG__.getSnapshot());
}

async function openDebugSession(page) {
  await page.goto("/?debugTools=1");
  await page.waitForFunction(() => Boolean(window.__CROSSROADS_DEBUG__));
  await page.evaluate(() => window.__CROSSROADS_DEBUG__.beginSession());
  for (let step = 0; step < 3; step += 1) {
    await page.locator("#tutorial-next-button").click();
  }
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
}

async function chooseDialogueOption(page, optionId) {
  const option = page.locator(`[data-dialogue-choice="${optionId}"]`);
  for (let step = 0; step < 30; step += 1) {
    if (await option.isVisible()) {
      await option.click();
      return;
    }
    const next = page.locator("#dialogue-next-button");
    if (await next.isVisible()) {
      await next.click();
      continue;
    }
    await page.waitForTimeout(16);
  }
  await expect(option).toBeVisible();
}

async function interact(page, id) {
  return page.evaluate((interactableId) => window.__CROSSROADS_DEBUG__.interactById(interactableId), id);
}

async function loadLevel(page, levelId) {
  await page.evaluate((targetLevelId) => window.__CROSSROADS_DEBUG__.loadLevel(targetLevelId), levelId);
  await expect.poll(() => snapshot(page).then((state) => state.currentLevelId)).toBe(levelId);
  await expect.poll(() => snapshot(page).then((state) => state.mode)).toBe("playing");
}

async function prepareZone1Deliveries(page, plan = "protect") {
  await loadLevel(page, "village");
  await interact(page, "le-paria-stack");
  await chooseDialogueOption(page, plan);
  for (const workerId of ["worker-harbor-1", "worker-harbor-2", "worker-harbor-3"]) {
    await interact(page, workerId);
  }
}

async function prepareDecision(page, entry) {
  const decisionKey = `${entry.chapterId}/${entry.decisionId}`;
  switch (decisionKey) {
    case "zone1/dock-workers":
      await loadLevel(page, "village");
      await interact(page, "le-paria-stack");
      return;
    case "zone1/recruiter-offer":
      await loadLevel(page, "village");
      await interact(page, "le-paria-stack");
      await chooseDialogueOption(page, "protect");
      await interact(page, "colonial-recruiter");
      return;
    case "zone1/last-issue":
      await prepareZone1Deliveries(page, entry.optionId === "return-after-compromise" ? "abandon" : "protect");
      await interact(page, "red-compass-reward");
      return;
    case "zone1/compass-verdict":
      await prepareZone1Deliveries(page);
      await interact(page, "red-compass-reward");
      await chooseDialogueOption(page, "surrender");
      await interact(page, "red-compass-reward");
      return;
    case "zone2/archive-unity-choice":
      await loadLevel(page, "archive");
      await interact(page, "split-blade");
      return;
    case "zone2/emblem-verdict":
      await loadLevel(page, "archive");
      for (const id of ["delegate-east", "delegate-west", "delegate-north"]) await interact(page, id);
      await interact(page, "archive-lens-console");
      await interact(page, "unity-round-table");
      return;
    case "zone3a/rally-strategy":
    case "zone3a/august-verdict":
      await loadLevel(page, "crossroads");
      for (const id of ["recruit-farmer", "recruit-worker", "recruit-intellectual", "recruit-bourgeois"]) await interact(page, id);
      await interact(page, "vietminh-cadre");
      if (entry.decisionId === "august-verdict") {
        await chooseDialogueOption(page, "fragment-rally");
        await interact(page, "vietminh-cadre");
      }
      return;
    case "zone3b/temporary-line-choice":
      await loadLevel(page, "crossroads");
      await interact(page, "foreign-advisor");
      return;
    case "zone3b/border-verdict":
      await loadLevel(page, "crossroads");
      for (const id of ["hamlet-1", "hamlet-2", "hamlet-3"]) await interact(page, id);
      await page.evaluate(() => window.__CROSSROADS_DEBUG__.damageMonster("southern-tyrant", 99));
      await interact(page, "resistance-commander");
      return;
    case "zone4/production-choice":
      await loadLevel(page, "spring");
      await interact(page, "corrupt-official");
      return;
    case "zone4/stalled-mechanism-choice":
      await loadLevel(page, "spring");
      await interact(page, "pluralism-broker");
      return;
    case "zone4/doi-moi-verdict":
      await loadLevel(page, "spring");
      for (const id of ["bao-cap-wall-1", "bao-cap-wall-2", "bao-cap-wall-3", "farmer-khoan-1", "farmer-khoan-2", "farmer-khoan-3"]) {
        await interact(page, id);
      }
      await interact(page, "doi-moi-leader");
      return;
    default:
      throw new Error(`No runtime setup for ${decisionKey}`);
  }
}

for (const entry of CHOICE_COVERAGE) {
  const coverageKey = `${entry.chapterId}/${entry.decisionId}/${entry.optionId}`;
  test(`choice coverage: ${coverageKey}`, async ({ page }) => {
    await openDebugSession(page);
    await prepareDecision(page, entry);
    await chooseDialogueOption(page, entry.optionId);

    const expectedEnding = {
      "zone1/compass-verdict/confirm-personal-gain": "zone1-lost-compass",
      "zone3a/august-verdict/confirm-delay": "zone3a-missed-moment",
    }[coverageKey];
    if (expectedEnding) {
      await expect.poll(() => snapshot(page).then((state) => state.endingId)).toBe(expectedEnding);
      return;
    }

    await expect.poll(() => snapshot(page).then((state) =>
      state.narrative.choiceHistory.find(
        (choice) =>
          choice.chapterId === entry.chapterId &&
          choice.decisionId === entry.decisionId &&
          choice.optionId === entry.optionId
      ) ?? null
    )).not.toBeNull();
  });
}
