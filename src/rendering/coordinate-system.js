function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function createCoordinateSystem({ world, viewport, getCamera, getRenderOffset = () => ({ x: 0, y: 0 }) }) {
  function getZoom(camera = getCamera()) {
    return Math.max(Number(camera.zoom) || 1, 0.1);
  }

  function getVisibleWorldRect(camera = getCamera()) {
    const zoom = getZoom(camera);
    return {
      x: camera.x,
      y: camera.y,
      width: viewport.width / zoom,
      height: viewport.height / zoom,
    };
  }

  function clampCameraPosition(position) {
    const zoom = getZoom(position);
    const visibleWidth = viewport.width / zoom;
    const visibleHeight = viewport.height / zoom;
    return {
      x: clamp(position.x, 0, Math.max(0, world.width - visibleWidth)),
      y: clamp(position.y, 0, Math.max(0, world.height - visibleHeight)),
      zoom,
    };
  }

  function getOffset(includeRenderOffset) {
    return includeRenderOffset ? getRenderOffset() : { x: 0, y: 0 };
  }

  function worldToScreen(point, { includeRenderOffset = false } = {}) {
    const camera = getCamera();
    const zoom = getZoom(camera);
    const offset = getOffset(includeRenderOffset);
    return {
      x: (point.x - camera.x) * zoom + offset.x,
      y: (point.y - camera.y) * zoom + offset.y,
    };
  }

  function screenToWorld(point, { includeRenderOffset = false } = {}) {
    const camera = getCamera();
    const zoom = getZoom(camera);
    const offset = getOffset(includeRenderOffset);
    return {
      x: (point.x - offset.x) / zoom + camera.x,
      y: (point.y - offset.y) / zoom + camera.y,
    };
  }

  function worldRectToScreenRect(rect, options) {
    const point = worldToScreen(rect, options);
    const zoom = getZoom();
    return {
      x: point.x,
      y: point.y,
      width: rect.width * zoom,
      height: rect.height * zoom,
    };
  }

  return {
    getVisibleWorldRect,
    clampCameraPosition,
    worldToScreen,
    screenToWorld,
    worldRectToScreenRect,
  };
}
