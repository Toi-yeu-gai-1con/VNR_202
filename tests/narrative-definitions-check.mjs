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
assert.equal(zone1Verdict.options.some((option) => option.branchFlags?.["zone1.badConfirmed"]), true, "Zone 1 bad ending needs an explicit final confirmation.");
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

const zone2Verdict = NARRATIVE_CHOICE_DEFINITIONS.zone2.find((choice) => choice.id === "emblem-verdict");
assert.equal(
  zone2Verdict.options.some((option) => option.branchFlags?.["zone2.badConfirmed"]),
  true,
  "Zone 2 bad ending also requires an explicit final confirmation.",
);

for (const [zoneId, confirmationFlag] of [["zone3a", "zone3a.badConfirmed"], ["zone3b", "zone3b.badConfirmed"]]) {
  assert.equal(
    NARRATIVE_CHOICE_DEFINITIONS[zoneId].some((choice) => choice.options.some((option) => option.branchFlags?.[confirmationFlag])),
    true,
    `${zoneId} keeps its own explicit bad-ending confirmation instead of sharing the other Zone 3 chapter.`,
  );
}

console.log("PASS: chronology, choice consequences, ending catalog, and source links are data-owned.");
