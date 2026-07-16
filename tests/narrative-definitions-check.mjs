import assert from "node:assert/strict";
import {
  NARRATIVE_CHAPTER_DEFINITIONS,
  NARRATIVE_CHOICE_DEFINITIONS,
  NARRATIVE_ENDING_DEFINITIONS,
  NARRATIVE_TVA_REACTION_DEFINITIONS,
} from "../src/data/narrative-definitions.js";

assert.equal(NARRATIVE_CHAPTER_DEFINITIONS.length, 5, "Five historical chapters own chronology and title-card data.");
assert.deepEqual(
  NARRATIVE_CHAPTER_DEFINITIONS.map((chapter) => chapter.id),
  ["zone1", "zone2", "zone3a", "zone3b", "zone4"],
  "Zone 3 remains two independent chapters in narrative data.",
);
assert.match(NARRATIVE_CHAPTER_DEFINITIONS.at(-1).period, /1986–1988/, "Zone 4 separates the 1986 and 1988 milestones.");
assert.equal(
  NARRATIVE_CHAPTER_DEFINITIONS.every((chapter) => chapter.historicalSource.url.startsWith("https://")),
  true,
  "Every chapter data definition carries a verifiable source URL.",
);

assert.equal(Object.keys(NARRATIVE_ENDING_DEFINITIONS).length, 8, "Narrative data defines good, neutral, five zone bad endings, and the secret ending.");
assert.equal(NARRATIVE_ENDING_DEFINITIONS["zone1-lost-compass"].branchLabel, "Nhánh giả định", "Bad endings are clearly labeled as hypothetical branches.");

const zone1Verdict = NARRATIVE_CHOICE_DEFINITIONS.zone1.find((choice) => choice.id === "compass-verdict");
const zone1PaperPlan = NARRATIVE_CHOICE_DEFINITIONS.zone1.find((choice) => choice.id === "dock-workers");
const burnOrHidePapers = zone1PaperPlan.options.find((option) => option.id === "abandon");
assert.equal(burnOrHidePapers.branchFlags?.["zone1.badConfirmed"], true, "Burning or hiding the papers immediately confirms Zone 1's bad ending.");
assert.equal(burnOrHidePapers.endingRisks?.zone1 >= 3, true, "Burning or hiding the papers reaches the Zone 1 bad-ending risk threshold immediately.");
assert.equal(zone1Verdict.options.some((option) => option.branchFlags?.["zone1.badConfirmed"]), true, "Zone 1 still keeps its final-verdict confirmation route for later compromises.");
assert.equal(
  NARRATIVE_CHOICE_DEFINITIONS.zone1.find((choice) => choice.id === "recruiter-offer").options.some((option) => option.endingRisks?.zone1 > 0),
  true,
  "Early dangerous choices raise risk without immediately setting the confirmation flag.",
);

assert.equal(
  typeof NARRATIVE_TVA_REACTION_DEFINITIONS.zone1.compromisedAndRepaired,
  "string",
  "David's Zone 1 debrief has a specific reaction for a repaired compromise.",
);

for (const zoneId of ["zone2", "zone3", "zone4"]) {
  assert.equal(
    Object.values(NARRATIVE_TVA_REACTION_DEFINITIONS[zoneId]).every((reaction) => typeof reaction === "string" && reaction.length > 20),
    true,
    `David has a data-owned debrief reaction for every completed ${zoneId} route.`,
  );
}

const zone2Verdict = NARRATIVE_CHOICE_DEFINITIONS.zone2.find((choice) => choice.id === "emblem-verdict");
assert.equal(
  zone2Verdict.options.some((option) => option.branchFlags?.["zone2.badConfirmed"]),
  true,
  "Zone 2 bad ending also requires an explicit final confirmation.",
);

for (const [zoneId, confirmationFlag] of [["zone3a", "zone3a.badConfirmed"], ["zone3b", "zone3b.badConfirmed"], ["zone4", "zone4.badConfirmed"]]) {
  assert.equal(
    NARRATIVE_CHOICE_DEFINITIONS[zoneId].some((choice) => choice.options.some((option) => option.branchFlags?.[confirmationFlag])),
    true,
    `${zoneId} keeps its own explicit bad-ending confirmation instead of sharing the other Zone 3 chapter.`,
  );
}

const zone3aPreparation = NARRATIVE_CHOICE_DEFINITIONS.zone3a
  .find((choice) => choice.id === "rally-strategy")
  .options.find((option) => option.id === "prepare-network");
assert.equal(zone3aPreparation.themeScores?.timing, 1, "Zone 3A preparation records the schema-owned timing theme score.");
assert.equal(zone3aPreparation.themeScores?.opportunity, undefined, "Zone 3A does not write an untracked opportunity score.");

console.log("PASS: chronology, choice consequences, ending catalog, and source links are data-owned.");
