function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getGroundShadowMetrics({ width, height, activity = "idle", airborne = 0 } = {}) {
  const elevation = clamp(Number(airborne) || 0, 0, 1);
  const walking = activity === "walk" || activity === "run";
  const baseWidth = Math.max(2, Number(width) || 16);
  const baseHeight = Math.max(2, Number(height) || 4);
  const movementScale = walking ? 1.1 : 1;
  const elevationScale = 1 - elevation * 0.3;

  return {
    width: Math.round(baseWidth * movementScale * elevationScale),
    height: Math.max(2, Math.round(baseHeight * (walking ? 0.85 : 1) * (1 - elevation * 0.4))),
    offsetY: Math.round(baseHeight * elevation),
    alpha: Math.round((walking ? 0.2 : 0.24) * (1 - elevation * 0.58) * 100) / 100,
  };
}

export function drawGroundShadow(context, { x, y, width, height, activity, airborne, color = "12, 14, 18" } = {}) {
  const shadow = getGroundShadowMetrics({ width, height, activity, airborne });

  context.save();
  context.fillStyle = `rgba(${color}, ${shadow.alpha})`;
  context.beginPath();
  context.ellipse(Math.round(x), Math.round(y + shadow.offsetY), shadow.width / 2, shadow.height / 2, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}
