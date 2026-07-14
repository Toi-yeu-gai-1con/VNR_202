const TVA_RELIC_PRESENTATION = Object.freeze([
  { id: "red-compass", color: "#f26b5e", x: -44, y: -62, phase: 0.15 },
  { id: "unified-emblem", color: "#f3cf72", x: -76, y: -12, phase: 1.32 },
  { id: "vietminh-thread", color: "#e99b65", x: 76, y: -12, phase: 2.44 },
  { id: "healed-map", color: "#74c9d2", x: -48, y: 46, phase: 3.56 },
  { id: "doi-moi-gear", color: "#91cf7c", x: 48, y: 46, phase: 4.68 },
]);

export function getTvaHubPresentation({ inventory = new Set(), corruption = 0 } = {}) {
  const itemIds = inventory instanceof Set ? inventory : new Set(inventory ?? []);
  const relics = TVA_RELIC_PRESENTATION.filter((relic) => itemIds.has(relic.id));
  const normalizedCorruption = Math.max(0, Math.min(100, Number(corruption) || 0));
  const stability = normalizedCorruption >= 60
    ? "corrupted"
    : relics.length === 0
      ? "unstable"
      : relics.length === TVA_RELIC_PRESENTATION.length
        ? "converged"
        : "stabilizing";

  return {
    relics,
    stability,
    portalIntensity: relics.length / TVA_RELIC_PRESENTATION.length,
    corruption: normalizedCorruption,
  };
}

export const TVA_RELIC_PRESENTATION_IDS = Object.freeze(TVA_RELIC_PRESENTATION.map((relic) => relic.id));
