function setLayerVisibility(element, visible) {
  element?.classList.toggle("hidden", !visible);
  element?.setAttribute("aria-hidden", String(!visible));
}

function drawRect(ctx, rect, color) {
  const screenRect = rect;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(screenRect.x, screenRect.y, screenRect.width, screenRect.height);
}

function drawCircle(ctx, point, radius, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

export function createDebugOverlay({
  panel,
  canvas,
  values,
  ctx,
  viewport,
  getSnapshot,
  getGeometry,
  worldRectToScreenRect,
  worldToScreen,
}) {
  let visible = false;

  function renderText(snapshot) {
    if (!values) {
      return;
    }

    values.textContent = [
      `FPS ${snapshot.fps.toFixed(1)} • ${snapshot.suspended ? "SUSPENDED" : "RUNNING"}`,
      `Scene ${snapshot.mode} • ${snapshot.currentLevelId}`,
      `Player ${snapshot.player.x.toFixed(1)}, ${snapshot.player.y.toFixed(1)} → ${snapshot.player.screenX.toFixed(1)}, ${snapshot.player.screenY.toFixed(1)} (${snapshot.player.direction})`,
      `Camera ${snapshot.camera.x.toFixed(1)}, ${snapshot.camera.y.toFixed(1)} • zoom ${snapshot.camera.zoom.toFixed(2)}`,
      `Checkpoint ${snapshot.respawnLevelId} • ${snapshot.questSummary}`,
      `Quái đang hoạt động ${snapshot.activeMonsterCount}`,
    ].join("\n");
  }

  function renderGeometry() {
    if (!ctx || !canvas) {
      return;
    }

    const geometry = getGeometry();
    ctx.clearRect(0, 0, viewport.width, viewport.height);
    drawRect(ctx, worldRectToScreenRect(geometry.playerFootprint), "#f7ee9e");

    for (const collider of geometry.colliders) {
      drawRect(ctx, worldRectToScreenRect(collider), "#ef7467");
    }

    for (const exit of geometry.exits) {
      drawRect(ctx, worldRectToScreenRect(exit), "#78d7ff");
    }

    for (const item of geometry.interactables) {
      const point = worldToScreen(item);
      drawCircle(ctx, point, item.radius, "#8df0ae");
    }

    for (const monster of geometry.monsters) {
      const point = worldToScreen(monster);
      drawCircle(ctx, point, monster.aggroRadius, monster.isBoss ? "#ffa45a" : "#ef7467");
    }
  }

  function setVisible(nextVisible) {
    visible = Boolean(nextVisible);
    setLayerVisibility(panel, visible);
    setLayerVisibility(canvas, visible);
    if (!visible && ctx && canvas) {
      ctx.clearRect(0, 0, viewport.width, viewport.height);
    }
  }

  return {
    isVisible() {
      return visible;
    },
    setVisible,
    toggle() {
      setVisible(!visible);
      return visible;
    },
    update({ updateText = true } = {}) {
      if (!visible) {
        return;
      }

      if (updateText) {
        renderText(getSnapshot());
      }
      renderGeometry();
    },
  };
}
