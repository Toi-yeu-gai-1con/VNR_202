import { GAMEPLAY_BALANCE } from "../data/gameplay-balance.js";

export const REQUIRED_RELIC_IDS = Object.freeze([
  "red-compass",
  "unified-emblem",
  "vietminh-thread",
  "healed-map",
  "doi-moi-gear",
]);

const ZONE_ENDINGS = Object.freeze([
  { id: "zone1-lost-compass", riskKey: "zone1", confirmationFlag: "zone1.badConfirmed" },
  { id: "zone2-fading-fires", riskKey: "zone2", confirmationFlag: "zone2.badConfirmed" },
  { id: "zone3a-missed-moment", riskKey: "zone3a", confirmationFlag: "zone3a.badConfirmed" },
  { id: "zone3b-divided-border", riskKey: "zone3b", confirmationFlag: "zone3b.badConfirmed" },
  { id: "zone4-stalled-machine", riskKey: "zone4", confirmationFlag: "zone4.badConfirmed" },
]);

function getNarrative(input) {
  return input?.narrative && typeof input.narrative === "object" ? input.narrative : {};
}

function getInventory(input) {
  return input?.inventory instanceof Set ? input.inventory : new Set(input?.inventory ?? []);
}

function createResult(id, reason, details = {}) {
  return Object.freeze({ id, reason, ...details });
}

export function resolveEnding(input = {}) {
  const narrative = getNarrative(input);
  const endingRules = GAMEPLAY_BALANCE.narrative.ending;
  const corruption = Math.max(0, Number(input.saDoa) || 0);
  const risks = narrative.endingRisks ?? {};
  const flags = narrative.branchFlags ?? {};

  if (corruption >= endingRules.secretCorruption || risks.secret >= endingRules.secretRiskThreshold) {
    return createResult("secret-corruption", "extreme-corruption", { corruption, risk: risks.secret ?? 0 });
  }

  for (const ending of ZONE_ENDINGS) {
    const risk = Number(risks[ending.riskKey]) || 0;
    if (risk >= endingRules.zoneRiskThreshold && flags[ending.confirmationFlag]) {
      return createResult(ending.id, "confirmed-zone-risk", { chapter: ending.riskKey, risk });
    }
  }

  const inventory = getInventory(input);
  const missingRelics = REQUIRED_RELIC_IDS.filter((relicId) => !inventory.has(relicId));
  if (missingRelics.length > 0) {
    return createResult(null, "missing-relics", { missingRelics });
  }

  if (corruption > endingRules.goodMaxCorruption) {
    return createResult("neutral", "recoverable-negative-consequences", { corruption });
  }

  return createResult("good", "all-relics-low-corruption", { corruption });
}
