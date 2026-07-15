function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function createPortalTransition({
  targetLevelId,
  spawn,
  startedAt = 0,
  duration = 560,
  swapProgress = 0.56,
  showTitleCard = true,
} = {}) {
  const safeDuration = Math.max(1, Number(duration) || 560);
  const safeSwapProgress = clamp(Number(swapProgress) || 0.56, 0.1, 0.9);

  function getFrame(timestamp) {
    const progress = clamp(((Number(timestamp) || 0) - startedAt) / safeDuration, 0, 1);
    return {
      progress,
      phase: progress < safeSwapProgress ? "depart" : "arrive",
      shouldSwapLevel: progress >= safeSwapProgress,
      complete: progress >= 1,
    };
  }

  return Object.freeze({
    targetLevelId,
    spawn,
    startedAt,
    duration: safeDuration,
    swapProgress: safeSwapProgress,
    showTitleCard,
    getFrame,
  });
}
