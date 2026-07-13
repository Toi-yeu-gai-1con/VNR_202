export function createPageLifecycleController({
  documentTarget = document,
  windowTarget = window,
  clearInput,
  suspendRuntime,
  resumeRuntime,
  suspendAudio,
  resumeAudio,
}) {
  let installed = false;
  let suspended = false;

  function suspend() {
    if (suspended) {
      return;
    }

    suspended = true;
    clearInput();
    suspendRuntime();
    suspendAudio();
  }

  function resume() {
    if (!suspended) {
      return;
    }

    suspended = false;
    resumeRuntime();
    resumeAudio();
  }

  function handleVisibilityChange() {
    if (documentTarget.hidden) {
      suspend();
      return;
    }

    resume();
  }

  function handleBlur() {
    clearInput();
  }

  return {
    install() {
      if (installed) {
        return;
      }

      installed = true;
      windowTarget.addEventListener("blur", handleBlur);
      documentTarget.addEventListener("visibilitychange", handleVisibilityChange);
      handleVisibilityChange();
    },
    destroy() {
      if (!installed) {
        return;
      }

      installed = false;
      windowTarget.removeEventListener("blur", handleBlur);
      documentTarget.removeEventListener("visibilitychange", handleVisibilityChange);
    },
    isSuspended() {
      return suspended;
    },
  };
}
