const TVA_RELIC_PRESENTATION = Object.freeze([
  { id: "red-compass", color: "#f26b5e", x: -44, y: -62, phase: 0.15 },
  { id: "unified-emblem", color: "#f3cf72", x: -76, y: -12, phase: 1.32 },
  { id: "vietminh-thread", color: "#e99b65", x: 76, y: -12, phase: 2.44 },
  { id: "healed-map", color: "#74c9d2", x: -48, y: 46, phase: 3.56 },
  { id: "doi-moi-gear", color: "#91cf7c", x: 48, y: 46, phase: 4.68 },
]);

const TVA_EPILOGUES = Object.freeze({
  good: Object.freeze({
    kind: "good",
    label: "HỒ SƠ ĐÃ ỔN ĐỊNH",
    glow: "#f0cf79",
    overlay: "rgba(223, 186, 103, 0.14)",
    davidLine: "Hồ sơ đã ổn định. Cổng đã giữ một lối trở về cho cậu.",
  }),
  neutral: Object.freeze({
    kind: "neutral",
    label: "HỒ SƠ CẦN GHI NHỚ",
    glow: "#88c4c6",
    overlay: "rgba(87, 133, 141, 0.14)",
    davidLine: "Hồ sơ đã khép lại, nhưng vài vết nứt vẫn cần được ghi nhớ.",
  }),
  fractured: Object.freeze({
    kind: "fractured",
    label: "NHÁNH ĐÃ LƯU TRỮ",
    glow: "#c77970",
    overlay: "rgba(122, 55, 58, 0.16)",
    davidLine: "Tôi đã lưu lại nhánh đứt này để cậu biết mình đã quay về từ đâu.",
  }),
});

function getHubEpilogue(endingId) {
  if (!endingId) {
    return null;
  }

  if (endingId === "good") {
    return TVA_EPILOGUES.good;
  }

  if (endingId === "neutral") {
    return TVA_EPILOGUES.neutral;
  }

  return TVA_EPILOGUES.fractured;
}

export function getTvaHubPresentation({ inventory = new Set(), corruption = 0, endingId = null } = {}) {
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
    epilogue: getHubEpilogue(endingId),
  };
}

export const TVA_RELIC_PRESENTATION_IDS = Object.freeze(TVA_RELIC_PRESENTATION.map((relic) => relic.id));
