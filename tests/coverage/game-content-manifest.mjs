const decisionInteraction = Object.freeze({
  "zone1/recruiter-offer": "village/colonial-recruiter",
  "zone1/dock-workers": "village/le-paria-stack",
  "zone1/last-issue": "village/red-compass-reward",
  "zone1/compass-verdict": "village/red-compass-reward",
  "zone2/archive-unity-choice": "archive/split-blade",
  "zone2/emblem-verdict": "archive/unity-round-table",
  "zone3a/rally-strategy": "crossroads/vietminh-cadre",
  "zone3a/august-verdict": "crossroads/vietminh-cadre",
  "zone3b/temporary-line-choice": "crossroads/foreign-advisor",
  "zone3b/border-verdict": "crossroads/resistance-commander",
  "zone4/production-choice": "spring/corrupt-official",
  "zone4/stalled-mechanism-choice": "spring/pluralism-broker",
  "zone4/doi-moi-verdict": "spring/doi-moi-leader",
});

const riskyOptions = new Set([
  "zone1/recruiter-offer/accept",
  "zone1/dock-workers/abandon",
  "zone1/last-issue/surrender",
  "zone1/compass-verdict/confirm-personal-gain",
  "zone2/archive-unity-choice/divide",
  "zone2/emblem-verdict/confirm-factionalism",
  "zone3a/rally-strategy/fragment-rally",
  "zone3a/august-verdict/confirm-delay",
  "zone3b/temporary-line-choice/normalize-separation",
  "zone3b/border-verdict/confirm-permanent-division",
  "zone4/production-choice/protect-private-privilege",
  "zone4/stalled-mechanism-choice/freeze-production",
  "zone4/doi-moi-verdict/confirm-stagnation",
]);

const repairOptions = new Set([
  "zone1/last-issue/return-after-compromise",
  "zone1/compass-verdict/repair-harm",
  "zone2/emblem-verdict/repair-division",
  "zone3a/august-verdict/repair-fragment",
  "zone3b/border-verdict/repair-separation",
  "zone4/doi-moi-verdict/repair-privilege",
]);

const choiceTuples = [
  ["zone1", "recruiter-offer", "refuse"], ["zone1", "recruiter-offer", "accept"], ["zone1", "recruiter-offer", "stall"],
  ["zone1", "dock-workers", "protect"], ["zone1", "dock-workers", "evidence"], ["zone1", "dock-workers", "cargo-route"], ["zone1", "dock-workers", "abandon"],
  ["zone1", "last-issue", "rescue"], ["zone1", "last-issue", "divert"], ["zone1", "last-issue", "return-after-compromise"], ["zone1", "last-issue", "surrender"],
  ["zone1", "compass-verdict", "protect-common-path"], ["zone1", "compass-verdict", "repair-harm"], ["zone1", "compass-verdict", "confirm-personal-gain"],
  ["zone2", "archive-unity-choice", "listen"], ["zone2", "archive-unity-choice", "evidence"], ["zone2", "archive-unity-choice", "divide"],
  ["zone2", "emblem-verdict", "unify"], ["zone2", "emblem-verdict", "repair-division"], ["zone2", "emblem-verdict", "confirm-factionalism"],
  ["zone3a", "rally-strategy", "prepare-network"], ["zone3a", "rally-strategy", "coordinate-moment"], ["zone3a", "rally-strategy", "fragment-rally"],
  ["zone3a", "august-verdict", "protect-moment"], ["zone3a", "august-verdict", "repair-fragment"], ["zone3a", "august-verdict", "confirm-delay"],
  ["zone3b", "temporary-line-choice", "preserve-bonds"], ["zone3b", "temporary-line-choice", "document-temporary-line"], ["zone3b", "temporary-line-choice", "normalize-separation"],
  ["zone3b", "border-verdict", "restore-unity"], ["zone3b", "border-verdict", "repair-separation"], ["zone3b", "border-verdict", "confirm-permanent-division"],
  ["zone4", "production-choice", "open-ledger"], ["zone4", "production-choice", "listen-farmers"], ["zone4", "production-choice", "protect-private-privilege"],
  ["zone4", "stalled-mechanism-choice", "remove-bottlenecks"], ["zone4", "stalled-mechanism-choice", "test-local-initiative"], ["zone4", "stalled-mechanism-choice", "freeze-production"],
  ["zone4", "doi-moi-verdict", "put-producers-first"], ["zone4", "doi-moi-verdict", "repair-privilege"], ["zone4", "doi-moi-verdict", "confirm-stagnation"],
];

export const CHOICE_COVERAGE = Object.freeze(choiceTuples.map(([chapterId, decisionId, optionId]) => {
  const key = `${chapterId}/${decisionId}/${optionId}`;
  return Object.freeze({
    chapterId,
    decisionId,
    optionId,
    riskClass: riskyOptions.has(key) ? "risk" : repairOptions.has(key) ? "repair" : "constructive",
    runtimeInteractableId: decisionInteraction[`${chapterId}/${decisionId}`],
    coveredBy: Object.freeze(["pairwise:narrative", `e2e:choice:${key}`]),
  });
}));

const interactableTuples = [
  ["hub", "tva-clerk-placeholder", "choice"], ["hub", "tva-caseboard", "choice"], ["hub", "tva-memory-archive", "archive"],
  ["hub", "tva-returnee-zone1", "hub-returnee"], ["hub", "tva-returnee-zone2", "hub-returnee"], ["hub", "tva-returnee-zone3a", "hub-returnee"], ["hub", "tva-returnee-zone3b", "hub-returnee"], ["hub", "tva-returnee-zone4", "hub-returnee"],
  ["village", "nguyen-ai-quoc", "scenic-lore"], ["village", "le-paria-stack", "choice"], ["village", "worker-harbor-1", "objective-item"], ["village", "worker-harbor-2", "objective-item"], ["village", "worker-harbor-3", "objective-item"], ["village", "red-compass-reward", "reward-verdict"], ["village", "colonial-recruiter", "choice"], ["village", "tenant-farmer", "attack-penalty"],
  ["archive", "delegate-east", "objective-item"], ["archive", "delegate-west", "objective-item"], ["archive", "delegate-north", "objective-item"], ["archive", "unity-round-table", "reward-verdict"], ["archive", "archive-lens-console", "objective-item"], ["archive", "split-blade", "choice"],
  ["crossroads", "vietminh-cadre", "reward-verdict"], ["crossroads", "recruit-farmer", "objective-item"], ["crossroads", "recruit-worker", "objective-item"], ["crossroads", "recruit-intellectual", "objective-item"], ["crossroads", "recruit-bourgeois", "objective-item"], ["crossroads", "landlord-patriot", "attack-penalty"], ["crossroads", "middle-peasant", "attack-penalty"], ["crossroads", "hamlet-1", "objective-item"], ["crossroads", "hamlet-2", "objective-item"], ["crossroads", "hamlet-3", "objective-item"], ["crossroads", "resistance-commander", "reward-verdict"], ["crossroads", "foreign-advisor", "choice"],
  ["spring", "bao-cap-wall-1", "objective-item"], ["spring", "bao-cap-wall-2", "objective-item"], ["spring", "bao-cap-wall-3", "objective-item"], ["spring", "farmer-khoan-1", "objective-item"], ["spring", "farmer-khoan-2", "objective-item"], ["spring", "farmer-khoan-3", "objective-item"], ["spring", "doi-moi-leader", "reward-verdict"], ["spring", "ration-market", "scenic-lore"], ["spring", "corrupt-official", "choice"], ["spring", "pluralism-broker", "choice"],
];

export const INTERACTABLE_COVERAGE = Object.freeze(interactableTuples.map(([levelId, id, assertionProfile]) => Object.freeze({
  levelId,
  id,
  assertionProfile,
  coveredBy: Object.freeze([`e2e:interaction:${levelId}/${id}`]),
})));

export const EXIT_COVERAGE = Object.freeze([
  { levelId: "hub", id: "tva-dispatch-portal", target: "dynamic", coveredBy: ["e2e:exit:hub/tva-dispatch-portal"] },
  { levelId: "village", id: "back-to-hub-1", target: "hub", coveredBy: ["e2e:exit:village/back-to-hub-1"] },
  { levelId: "archive", id: "back-to-hub-2", target: "hub", coveredBy: ["e2e:exit:archive/back-to-hub-2"] },
  { levelId: "crossroads", id: "back-to-hub-3", target: "hub", coveredBy: ["e2e:exit:crossroads/back-to-hub-3"] },
  { levelId: "spring", id: "back-to-hub-4", target: "hub", coveredBy: ["e2e:exit:spring/back-to-hub-4"] },
].map(Object.freeze));

export const ENDING_COVERAGE = Object.freeze([
  { id: "good", triggerKind: "final-runtime", recoverable: false },
  { id: "bad", triggerKind: "runtime-threshold", recoverable: true },
  { id: "neutral", triggerKind: "final-runtime", recoverable: false },
  { id: "secret-corruption", triggerKind: "runtime-threshold", recoverable: true },
  { id: "zone1-lost-compass", triggerKind: "zone-verdict", recoverable: true },
  { id: "zone2-fading-fires", triggerKind: "zone-verdict", recoverable: true },
  { id: "zone3a-missed-moment", triggerKind: "zone-verdict", recoverable: true },
  { id: "zone3b-divided-border", triggerKind: "zone-verdict", recoverable: true },
  { id: "zone4-stalled-machine", triggerKind: "zone-verdict", recoverable: true },
].map((entry) => Object.freeze({ ...entry, coveredBy: Object.freeze([`e2e:ending:${entry.id}`]) })));

export const CHALLENGE_COVERAGE = Object.freeze([
  "no-damage", "low-corruption", "restraint", "zone3a-timing",
].map((id) => Object.freeze({ id, coveredBy: Object.freeze([`unit:challenge:${id}`, `e2e:challenge:${id}`]) })));
