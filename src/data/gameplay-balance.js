function freezeBalance(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  Object.values(value).forEach(freezeBalance);
  return Object.freeze(value);
}

export const GAMEPLAY_BALANCE = freezeBalance({
  player: {
    speed: 92,
    interactionRadius: 30,
    maxHealth: 36,
    deathRespawnDelayMs: 650,
  },
  corruption: {
    max: 100,
    badEndingThreshold: 60,
    glitchThreshold: 50,
    deathPenalty: 12,
  },
  combat: {
    strike: { cooldownMs: 420, range: 48, chargedThresholdMs: 360, animationMs: 260, lungeDistance: 4 },
    parry: { cooldownMs: 760, windowMs: 260, staminaReward: 20 },
  },
  stamina: {
    max: 100,
    regenPerSecond: 32,
    dodgeCost: 28,
    dodgeDistance: 54,
    dodgeCooldownMs: 420,
  },
  mob: {
    baseSpeed: 38,
    projectileSpeed: 136,
    touchRange: 18,
    contactDamageCooldownMs: 900,
    respawnInvulnerabilityMs: 1400,
    attackAnimationMs: 260,
  },
  drops: {
    healthAmount: 6,
    staminaAmount: 34,
    healthPriorityThreshold: 0.55,
  },
  difficulty: {
    spawnBudgetOffset: { story: -1, normal: 0, challenge: 1 },
    profiles: {
      story: { enemyHealth: 0.75, enemyDamage: 0.65, enemySpeed: 0.82, dropChance: 0.5 },
      normal: { enemyHealth: 1, enemyDamage: 1, enemySpeed: 1, dropChance: 0.34 },
      challenge: { enemyHealth: 1.35, enemyDamage: 1.4, enemySpeed: 1.16, dropChance: 0.22 },
    },
  },
});

export function getDifficultySettings(difficulty) {
  return GAMEPLAY_BALANCE.difficulty.profiles[difficulty] ?? GAMEPLAY_BALANCE.difficulty.profiles.normal;
}
