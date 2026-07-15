function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getParallaxOffset(camera, depth = 1, { reducedMotion = false } = {}) {
  const safeDepth = reducedMotion ? 1 : clamp(Number(depth) || 1, 0.55, 1);
  return {
    x: Math.round((Number(camera?.x) || 0) * safeDepth),
    y: Math.round((Number(camera?.y) || 0) * safeDepth),
  };
}
