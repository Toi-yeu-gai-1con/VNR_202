export function createRuntimeLoop({
  onFrame,
  requestFrame = (callback) => requestAnimationFrame(callback),
  cancelFrame = (frameId) => cancelAnimationFrame(frameId),
  maxDeltaSeconds = 0.033,
}) {
  let frameId = null;
  let running = false;
  let suspended = false;
  let lastWallTimestamp = null;
  let logicalTimestamp = 0;

  function schedule() {
    if (!running || suspended || frameId !== null) {
      return;
    }

    frameId = requestFrame(tick);
  }

  function tick(wallTimestamp) {
    frameId = null;
    if (!running || suspended) {
      return;
    }

    const deltaSeconds = lastWallTimestamp === null
      ? 0
      : Math.min(Math.max((wallTimestamp - lastWallTimestamp) / 1000, 0), maxDeltaSeconds);
    lastWallTimestamp = wallTimestamp;
    logicalTimestamp += deltaSeconds * 1000;
    onFrame({ now: logicalTimestamp, deltaSeconds });
    schedule();
  }

  function cancelPendingFrame() {
    if (frameId === null) {
      return;
    }

    cancelFrame(frameId);
    frameId = null;
  }

  return {
    start() {
      if (running) {
        return;
      }

      running = true;
      suspended = false;
      lastWallTimestamp = null;
      logicalTimestamp = 0;
      schedule();
    },
    stop() {
      running = false;
      suspended = false;
      lastWallTimestamp = null;
      cancelPendingFrame();
    },
    suspend() {
      if (!running || suspended) {
        return;
      }

      suspended = true;
      lastWallTimestamp = null;
      cancelPendingFrame();
    },
    resume() {
      if (!running || !suspended) {
        return;
      }

      suspended = false;
      lastWallTimestamp = null;
      schedule();
    },
    isSuspended() {
      return suspended;
    },
  };
}
