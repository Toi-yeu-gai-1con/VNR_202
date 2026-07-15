import { getOptionalChallengeDefinition } from "../data/optional-challenge-definitions.js";

function nonNegativeInteger(value) {
  return Math.max(0, Math.round(Number(value) || 0));
}

function positiveTrust(narrative) {
  return Object.values(narrative?.npcRelations ?? {})
    .reduce((total, relation) => total + Math.max(0, Number(relation) || 0), 0);
}

function result(id, status, progressLabel, failureLabel) {
  return { id, status, progressLabel, failureLabel };
}

export function evaluateOptionalChallenge(id, { runStats = {}, narrative = {}, isRunComplete = false } = {}) {
  const definition = getOptionalChallengeDefinition(id);
  if (!definition) {
    return null;
  }

  const damageTaken = nonNegativeInteger(runStats.damageTaken);
  const maxCorruption = nonNegativeInteger(runStats.maxCorruption);
  const strikes = nonNegativeInteger(runStats.strikes);
  const choicesMade = nonNegativeInteger(runStats.choicesMade);
  const trust = positiveTrust(narrative);
  const flags = narrative.branchFlags ?? {};

  if (id === "no-damage") {
    if (damageTaken > 0) {
      return result(id, "failed", `${damageTaken} thương tích đã nhận`, definition.failure);
    }
    return result(id, isRunComplete ? "completed" : "tracking", "Chưa nhận thương tích", definition.failure);
  }

  if (id === "low-corruption") {
    if (maxCorruption > definition.corruptionCap) {
      return result(id, "failed", `Tha hóa cao nhất ${maxCorruption}% / ${definition.corruptionCap}%`, definition.failure);
    }
    return result(
      id,
      isRunComplete ? "completed" : "tracking",
      `Tha hóa cao nhất ${maxCorruption}% / ${definition.corruptionCap}%`,
      definition.failure,
    );
  }

  if (id === "restraint") {
    if (strikes > definition.maximumStrikes) {
      return result(id, "failed", `${strikes}/${definition.maximumStrikes} đòn đánh`, definition.failure);
    }
    const ready = choicesMade >= definition.minimumChoices && trust >= definition.minimumTrust;
    return result(
      id,
      isRunComplete && ready ? "completed" : "tracking",
      `${choicesMade}/${definition.minimumChoices} điểm rẽ • niềm tin ${trust}/${definition.minimumTrust} • ${strikes}/${definition.maximumStrikes} đòn`,
      definition.failure,
    );
  }

  if (flags["zone3a.badConfirmed"]) {
    return result(id, "failed", "Đã xác nhận nhánh bỏ lỡ thời cơ", definition.failure);
  }
  return result(
    id,
    isRunComplete && flags["zone3a.momentProtected"] ? "completed" : "tracking",
    flags["zone3a.momentProtected"] ? "Đã bảo vệ thời cơ Khu 3A" : "Chưa bảo vệ thời cơ Khu 3A",
    definition.failure,
  );
}
