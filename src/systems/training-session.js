export function createTrainingSession(campaignState) {
  const savedCampaign = { ...campaignState };
  const safeTrainingState = { health: 36, stamina: 100, saDoa: 0, levelId: "training" };
  let current = null;

  return {
    enter() {
      current = { ...safeTrainingState };
      return { ...current };
    },
    takeHit(amount) {
      if (!current) return null;
      current.health = Math.max(0, current.health - Math.max(0, Number(amount) || 0));
      return { ...current };
    },
    addCorruption(amount) {
      if (!current) return null;
      current.saDoa = Math.max(0, Math.min(100, current.saDoa + (Number(amount) || 0)));
      return { ...current };
    },
    reset() {
      current = { ...safeTrainingState };
      return { ...current };
    },
    leave() {
      current = null;
      return { ...savedCampaign };
    },
  };
}
