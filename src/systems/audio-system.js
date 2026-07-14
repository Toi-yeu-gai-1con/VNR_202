export function createAudioSystem({
  state,
  uiSounds,
  sfxSounds = {},
  ambienceSounds,
  musicSounds,
  getZoneProfile,
  getCurrentLevel,
  getPlayer,
  eventTarget = window,
}) {
  let audioRetryQueued = false;
  let suspended = false;
  const activeSfx = new Set();

  function queueAudioRetry() {
    if (audioRetryQueued || state.soundMuted) {
      return;
    }

    audioRetryQueued = true;
    const retry = () => {
      eventTarget.removeEventListener("pointerdown", retry);
      eventTarget.removeEventListener("keydown", retry);
      audioRetryQueued = false;
      if (!state.soundMuted) {
        syncAmbienceAudio();
      }
    };

    eventTarget.addEventListener("pointerdown", retry, { once: true });
    eventTarget.addEventListener("keydown", retry, { once: true });
  }

  function playUiSound(sound) {
    if (!sound) {
      return;
    }

    try {
      sound.pause();
      sound.currentTime = 0;
      sound.play()?.catch(queueAudioRetry);
    } catch {
      queueAudioRetry();
    }
  }

  function playSfx(key, options = {}) {
    const source = sfxSounds[key];
    if (!source || state.soundMuted || suspended) {
      return;
    }

    const sound = typeof source.cloneNode === "function" ? source.cloneNode(true) : source;
    sound.volume = Math.max(0, Math.min(1, options.volume ?? source.volume ?? 1));
    sound.playbackRate = options.playbackRate ?? 1;
    sound.muted = state.soundMuted;
    activeSfx.add(sound);

    const release = () => activeSfx.delete(sound);
    if (typeof sound.addEventListener === "function") {
      sound.addEventListener("ended", release, { once: true });
    }
    try {
      sound.currentTime = 0;
      sound.play()?.catch(queueAudioRetry);
    } catch {
      release();
      queueAudioRetry();
    }
  }

  function withUiClickSound(action) {
    return (...args) => {
      playUiSound(uiSounds.pixelClick ?? uiSounds.click);
      action(...args);
    };
  }

  function playLoopingSound(sound) {
    if (suspended || !sound || !sound.paused) {
      return;
    }

    try {
      sound.play()?.catch(queueAudioRetry);
    } catch {
      queueAudioRetry();
    }
  }

  function pauseLoopingSound(sound) {
    if (!sound) {
      return;
    }

    try {
      sound.pause();
    } catch {
      // Browsers may reject a pause while a media element is being replaced.
    }
  }

  function resetSound(sound) {
    if (!sound) {
      return;
    }

    pauseLoopingSound(sound);
    try {
      sound.currentTime = 0;
    } catch {
      // Some browsers do not expose currentTime until media metadata is available.
    }
  }

  function syncLoopingSoundGroup(soundGroup, activeSounds) {
    const activeSet = new Set(activeSounds.filter(Boolean));
    for (const sound of Object.values(soundGroup)) {
      if (!activeSet.has(sound)) {
        pauseLoopingSound(sound);
      }
    }
    for (const sound of activeSet) {
      playLoopingSound(sound);
    }
  }

  function resetInactiveSounds(activeSounds, soundsToReset) {
    const activeSet = new Set(activeSounds.filter(Boolean));
    for (const sound of soundsToReset.filter(Boolean)) {
      if (!activeSet.has(sound)) {
        resetSound(sound);
      }
    }
  }

  function resetSoundGroup(soundGroup) {
    for (const sound of Object.values(soundGroup)) {
      resetSound(sound);
    }
  }

  function resetMusicForNewSession() {
    resetSoundGroup(musicSounds);
    resetSoundGroup(ambienceSounds);
  }

  function syncZoneAmbientAudio() {
    const profile = getZoneProfile();
    if (!profile) {
      return { ambience: [], music: [] };
    }

    const player = getPlayer();
    const level = getCurrentLevel();
    const combatActive = level.monsters.some(
      (monster) => !monster.defeated && Math.hypot(monster.x - player.x, monster.y - player.y) < (monster.aggroRadius ?? 100)
    );
    const music = musicSounds[profile.music];

    if (music) {
      const baseVolume = profile.music === "archive" || profile.music === "spring" ? 0.26 : 0.24;
      music.volume = baseVolume * (combatActive ? 0.82 : 1);
    }

    const ambience = profile.ambience.map((key) => ambienceSounds[key]).filter(Boolean);
    for (const sound of ambience) {
      sound.volume = combatActive ? 0.1 : 0.16;
    }

    return { ambience, music: music ? [music] : [] };
  }

  function syncAmbienceAudio() {
    if (suspended) {
      return;
    }

    const activeAmbience = [];
    const activeMusic = [];

    if (state.mode === "ending" && state.endingId === "bad") {
      activeMusic.push(musicSounds.badEnding);
    } else if (state.mode === "ending" && state.endingId === "good") {
      activeMusic.push(musicSounds.goodEnding);
    } else if (state.mode !== "start") {
      if (state.currentLevelId === "hub") {
        activeMusic.push(musicSounds.hub);
      } else {
        const zoneAudio = syncZoneAmbientAudio();
        activeAmbience.push(...zoneAudio.ambience);
        activeMusic.push(...zoneAudio.music);
      }
    }

    syncLoopingSoundGroup(ambienceSounds, activeAmbience);
    syncLoopingSoundGroup(musicSounds, activeMusic);
    resetInactiveSounds(activeMusic, [musicSounds.badEnding, musicSounds.goodEnding]);
  }

  function setMuted(muted) {
    state.soundMuted = Boolean(muted);
    for (const sound of [...Object.values(uiSounds), ...Object.values(sfxSounds), ...Object.values(ambienceSounds), ...Object.values(musicSounds), ...activeSfx]) {
      sound.muted = state.soundMuted;
    }
    if (!state.soundMuted) {
      syncAmbienceAudio();
    }
  }

  function suspend() {
    if (suspended) {
      return;
    }

    suspended = true;
    for (const sound of [...Object.values(ambienceSounds), ...Object.values(musicSounds)]) {
      pauseLoopingSound(sound);
    }
    for (const sound of activeSfx) {
      pauseLoopingSound(sound);
    }
  }

  function resume() {
    if (!suspended) {
      return;
    }

    suspended = false;
    if (!state.soundMuted) {
      syncAmbienceAudio();
    }
  }

  return {
    playUiSound,
    playSfx,
    withUiClickSound,
    playLoopingSound,
    pauseLoopingSound,
    resetSound,
    resetMusicForNewSession,
    syncAmbienceAudio,
    syncZoneAmbientAudio,
    setMuted,
    suspend,
    resume,
  };
}
