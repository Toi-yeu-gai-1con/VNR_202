function getMiniMapBackground(levelId) {
  switch (levelId) {
    case "village":
      return "#263849";
    case "archive":
      return "#4c3529";
    case "crossroads":
      return "#793e37";
    case "spring":
      return "#4c7c45";
    default:
      return "#203849";
  }
}

export function createMiniMapRenderer({
  minimap,
  minimapCanvas,
  minimapCtx,
  world,
  viewport,
  getState,
  getCurrentLevel,
  getExitCenter,
  getInteractionPoint,
  shouldDrawInteractable,
  isMonsterActive,
  getNavigationObjective,
  getCamera,
  getVisibleWorldRect = () => {
    const camera = getCamera();
    return { x: camera.x, y: camera.y, width: viewport.width, height: viewport.height };
  },
  getPlayer,
}) {
  function drawLegend() {
    minimap.title = "Vàng: lối ra hoặc mục tiêu • xanh: tương tác • đỏ: quái • cam: boss";
    ["#f3d777", "#a7c7f3", "#e96558", "#f1b452"].forEach((color, index) => {
      minimapCtx.fillStyle = color;
      minimapCtx.fillRect(7 + index * 6, 7, 3, 3);
    });
  }

  function draw() {
    if (!minimap || !minimapCtx || !minimapCanvas) {
      return;
    }

    const state = getState();
    const shouldShow = state.mode === "playing";
    minimap.classList.toggle("hidden", !shouldShow);
    minimap.setAttribute("aria-hidden", String(!shouldShow));

    if (!shouldShow) {
      return;
    }

    const mapWidth = minimapCanvas.width;
    const mapHeight = minimapCanvas.height;
    const inset = 4;
    const drawableWidth = mapWidth - inset * 2;
    const drawableHeight = mapHeight - inset * 2;
    const scaleX = drawableWidth / world.width;
    const scaleY = drawableHeight / world.height;
    const level = getCurrentLevel();
    const visibleWorld = getVisibleWorldRect();
    const player = getPlayer();

    minimapCtx.clearRect(0, 0, mapWidth, mapHeight);
    minimapCtx.fillStyle = getMiniMapBackground(level.id);
    minimapCtx.fillRect(0, 0, mapWidth, mapHeight);
    minimapCtx.fillStyle = "rgba(8, 13, 20, 0.54)";
    minimapCtx.fillRect(inset, inset, drawableWidth, drawableHeight);
    minimapCtx.strokeStyle = "rgba(242, 225, 180, 0.52)";
    minimapCtx.lineWidth = 1;
    minimapCtx.strokeRect(inset + 0.5, inset + 0.5, drawableWidth - 1, drawableHeight - 1);

    const toMapPoint = (x, y) => ({
      x: Math.round(inset + x * scaleX),
      y: Math.round(inset + y * scaleY),
    });
    const drawPoint = (x, y, color, size = 3) => {
      const point = toMapPoint(x, y);
      const offset = Math.floor(size / 2);
      minimapCtx.fillStyle = color;
      minimapCtx.fillRect(point.x - offset, point.y - offset, size, size);
    };

    for (const exit of level.exits) {
      if (state.blockedExitIds.has(exit.id)) {
        continue;
      }

      const center = getExitCenter(exit);
      drawPoint(center.x, center.y, exit.guide?.color ?? "#f3d777", 3);
    }

    for (const item of level.interactables) {
      if (item.collected || item.used || !shouldDrawInteractable(item)) {
        continue;
      }

      const point = getInteractionPoint(item);
      const color = item.interactionType === "pickup"
        ? "#eec96d"
        : ["offerBribe", "splitChoice", "fillCorruption", "ideologyTrap"].includes(item.interactionType)
          ? "#e96b67"
          : "#a7c7f3";
      drawPoint(point.x, point.y, color, 2);
    }

    for (const monster of level.monsters ?? []) {
      if (!monster.defeated && isMonsterActive(monster)) {
        drawPoint(monster.x, monster.y, monster.isBoss ? "#f1b452" : "#e96558", monster.isBoss ? 4 : 2);
      }
    }

    const objective = getNavigationObjective();
    if (objective) {
      drawPoint(objective.x, objective.y, objective.color, 4);
    }

    minimapCtx.strokeStyle = "rgba(223, 241, 255, 0.82)";
    minimapCtx.lineWidth = 1;
    minimapCtx.strokeRect(
      Math.round(inset + visibleWorld.x * scaleX) + 0.5,
      Math.round(inset + visibleWorld.y * scaleY) + 0.5,
      Math.max(1, Math.round(visibleWorld.width * scaleX)),
      Math.max(1, Math.round(visibleWorld.height * scaleY))
    );

    drawPoint(player.x, player.y, "#fff5d2", 4);
    drawPoint(player.x, player.y, "#4aa8ff", 2);
    drawLegend();
  }

  return { draw };
}
