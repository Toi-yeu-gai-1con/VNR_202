import assert from "node:assert/strict";

const challengeDataModule = await import("../src/data/optional-challenge-definitions.js").catch(() => null);
const challengeSystemModule = await import("../src/systems/optional-challenge.js").catch(() => null);

assert.ok(challengeDataModule, "Optional challenge definitions are available as data.");
assert.ok(challengeSystemModule, "Optional challenges are evaluated by a dedicated, testable system.");

const { OPTIONAL_CHALLENGE_DEFINITIONS, getOptionalChallengeDefinition } = challengeDataModule;
const { evaluateOptionalChallenge } = challengeSystemModule;

assert.deepEqual(
  OPTIONAL_CHALLENGE_DEFINITIONS.map((challenge) => challenge.id),
  ["no-damage", "low-corruption", "restraint", "zone3a-timing"],
  "Optional challenges are a small, explicit set rather than hidden difficulty modifiers.",
);
assert.equal(
  OPTIONAL_CHALLENGE_DEFINITIONS.every((challenge) => challenge.rule && challenge.failure),
  true,
  "Every optional challenge explains both its rule and its failure condition before the run begins.",
);
assert.equal(getOptionalChallengeDefinition("unknown"), null, "Unknown saved challenge ids are safely ignored.");

assert.deepEqual(
  evaluateOptionalChallenge("no-damage", { runStats: { damageTaken: 0 } }),
  {
    id: "no-damage",
    status: "tracking",
    progressLabel: "Chưa nhận thương tích",
    failureLabel: "Thất bại nếu nhận bất kỳ thương tích nào.",
  },
  "The no-damage challenge shows positive live progress without claiming completion early.",
);
assert.equal(
  evaluateOptionalChallenge("no-damage", { runStats: { damageTaken: 1 } }).status,
  "failed",
  "Taking damage fails the no-damage challenge immediately and transparently.",
);
assert.equal(
  evaluateOptionalChallenge("low-corruption", { runStats: { maxCorruption: 26 } }).status,
  "failed",
  "Crossing the corruption cap fails the corruption challenge even if the current meter later falls.",
);

const restraint = evaluateOptionalChallenge("restraint", {
  runStats: { strikes: 8, choicesMade: 3 },
  narrative: { npcRelations: { "dock-workers": 3 } },
  isRunComplete: true,
});
assert.equal(restraint.status, "completed", "The restraint challenge rewards dialogue and trust without changing combat balance.");
assert.equal(
  evaluateOptionalChallenge("restraint", { runStats: { strikes: 9, choicesMade: 3 } }).status,
  "failed",
  "The restraint challenge exposes its strike cap as a clear failure condition.",
);

assert.equal(
  evaluateOptionalChallenge("zone3a-timing", {
    narrative: { branchFlags: { "zone3a.momentProtected": true } },
    isRunComplete: true,
  }).status,
  "completed",
  "Protecting the Zone 3A moment completes the timing challenge at the end of a run.",
);
assert.equal(
  evaluateOptionalChallenge("zone3a-timing", {
    narrative: { branchFlags: { "zone3a.badConfirmed": true } },
  }).status,
  "failed",
  "The explicit Zone 3A bad-ending confirmation fails the timing challenge.",
);

console.log("PASS: optional challenges have explicit rules, live progress, and fair failure states.");
