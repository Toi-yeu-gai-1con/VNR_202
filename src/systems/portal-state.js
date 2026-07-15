const TVA_COORDINATES = Object.freeze({
  village: "VN-1930-A",
  archive: "VN-1930-B",
  crossroads: "VN-1945-1975",
  spring: "VN-1986",
});

const RISK_KEYS_BY_LEVEL = Object.freeze({
  village: ["zone1"],
  archive: ["zone2"],
  crossroads: ["zone3a", "zone3b"],
  spring: ["zone4"],
});

const PORTAL_STATES = Object.freeze({
  standby: Object.freeze({ status: "standby", icon: "standby", label: "ĐỢI ĐIỀU PHỐI", color: "#78909d", glow: "#5d7886", visible: false }),
  sealed: Object.freeze({ status: "sealed", icon: "lock", label: "CỔNG ĐANG NIÊM", color: "#75818b", glow: "#53616d", visible: true }),
  complete: Object.freeze({ status: "complete", icon: "return", label: "LỐI VỀ MỞ", color: "#f3d777", glow: "#b99452", visible: true }),
  safe: Object.freeze({ status: "safe", icon: "safe", label: "RỜI MÔ PHỎNG", color: "#b9e6f0", glow: "#77c5da", visible: true }),
});

function hasUnresolvedRisk(levelId, narrative = {}) {
  const risks = narrative?.endingRisks ?? {};
  return (RISK_KEYS_BY_LEVEL[levelId] ?? []).some((key) => Number(risks[key]) > 0);
}

export function getPortalState({ levelId, exitId, targetLevelId, available, narrative } = {}) {
  if (exitId === "tva-dispatch-portal") {
    if (!targetLevelId) {
      return PORTAL_STATES.standby;
    }

    if (hasUnresolvedRisk(targetLevelId, narrative)) {
      return {
        status: "danger",
        icon: "warning",
        label: "NHÁNH CẦN RÀ SOÁT",
        color: "#e69b6c",
        glow: "#b65f55",
        visible: true,
      };
    }

    return {
      status: "active",
      icon: "depart",
      label: `MỞ ${TVA_COORDINATES[targetLevelId] ?? "TỌA ĐỘ"}`,
      color: "#9fe3ba",
      glow: "#e0b75f",
      visible: true,
    };
  }

  if (levelId === "training") {
    return PORTAL_STATES.safe;
  }

  if (targetLevelId === "hub") {
    return available ? PORTAL_STATES.complete : PORTAL_STATES.sealed;
  }

  return available
    ? { status: "active", icon: "depart", label: "CỔNG ĐÃ MỞ", color: "#9fe3ba", glow: "#e0b75f", visible: true }
    : PORTAL_STATES.sealed;
}
