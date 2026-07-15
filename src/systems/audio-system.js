export function createAudioSystem({
  state,
  uiSounds,
  sfxSounds = {},
  ambienceSounds,
  musicSounds,
  getZoneProfile,
  getCurrentLevel,
  getPlayer,
  getSettings = () => ({ musicVolume: 1, sfxVolume: 1 }),
  eventTarget = window,
}) {
  let audioRetryQueued = false;
  let suspended = false;
  const activeSfx = new Set();
  const sourceVolumes = new WeakMap();

  function getSourceVolume(sound) {
    if (!sourceVolumes.has(sound)) {
      sourceVolumes.set(sound, Number.isFinite(sound.volume) ? sound.volume : 1);
    }
    return sourceVolumes.get(sound);
  }

  function getVolumeSetting(key) {
    const value = getSettings()?.[key];
    return typeof value === "number" && value >= 0 && value <= 1 ? value : 1;
  }

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
      sound.volume = getSourceVolume(sound) * getVolumeSetting("sfxVolume");
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
    sound.volume = Math.max(0, Math.min(1, (options.volume ?? getSourceVolume(source)) * getVolumeSetting("sfxVolume")));
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
      music.volume = baseVolume * (combatActive ? 0.82 : 1) * getVolumeSetting("musicVolume");
    }

    const ambience = profile.ambience.map((key) => ambienceSounds[key]).filter(Boolean);
    for (const sound of ambience) {
      sound.volume = (combatActive ? 0.1 : 0.16) * getVolumeSetting("musicVolume");
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
      const endingMusic = musicSounds.badEnding;
      if (endingMusic) {
        endingMusic.volume = getSourceVolume(endingMusic) * getVolumeSetting("musicVolume");
        activeMusic.push(endingMusic);
      }
    } else if (state.mode === "ending" && state.endingId === "good") {
      const endingMusic = musicSounds.goodEnding;
      if (endingMusic) {
        endingMusic.volume = getSourceVolume(endingMusic) * getVolumeSetting("musicVolume");
        activeMusic.push(endingMusic);
      }
    } else if (state.mode !== "start") {
      if (state.currentLevelId === "hub" || state.currentLevelId === "training") {
        const hubMusic = musicSounds.hub;
        if (hubMusic) {
          hubMusic.volume = getSourceVolume(hubMusic) * getVolumeSetting("musicVolume");
          activeMusic.push(hubMusic);
        }
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
