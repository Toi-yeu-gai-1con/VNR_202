function pairKey(leftFactor, leftValue, rightFactor, rightValue) {
  return `${leftFactor}\u0000${leftValue}\u0000${rightFactor}\u0000${rightValue}`;
}

export function enumerateExpectedPairs(factors) {
  const pairs = new Set();
  for (let right = 1; right < factors.length; right += 1) {
    for (let left = 0; left < right; left += 1) {
      for (const leftValue of factors[left].values) {
        for (const rightValue of factors[right].values) {
          pairs.add(pairKey(left, leftValue, right, rightValue));
        }
      }
    }
  }
  return pairs;
}

function coverRowPairs(uncovered, row, rightFactor) {
  for (let leftFactor = 0; leftFactor < rightFactor; leftFactor += 1) {
    uncovered.delete(pairKey(leftFactor, row[leftFactor], rightFactor, row[rightFactor]));
  }
}

export function generatePairwiseRows(factors) {
  if (factors.length === 0) return [];
  if (factors.length === 1) return factors[0].values.map((value) => [value]);

  let rows = factors[0].values.flatMap((leftValue) =>
    factors[1].values.map((rightValue) => [leftValue, rightValue])
  );

  for (let rightFactor = 2; rightFactor < factors.length; rightFactor += 1) {
    const uncovered = new Set();
    for (let leftFactor = 0; leftFactor < rightFactor; leftFactor += 1) {
      for (const leftValue of factors[leftFactor].values) {
        for (const rightValue of factors[rightFactor].values) {
          uncovered.add(pairKey(leftFactor, leftValue, rightFactor, rightValue));
        }
      }
    }

    for (const row of rows) {
      let bestValue = factors[rightFactor].values[0];
      let bestScore = -1;
      for (const candidate of factors[rightFactor].values) {
        let score = 0;
        for (let leftFactor = 0; leftFactor < rightFactor; leftFactor += 1) {
          if (uncovered.has(pairKey(leftFactor, row[leftFactor], rightFactor, candidate))) score += 1;
        }
        if (score > bestScore) {
          bestValue = candidate;
          bestScore = score;
        }
      }
      row.push(bestValue);
      coverRowPairs(uncovered, row, rightFactor);
    }

    while (uncovered.size > 0) {
      const [seed] = uncovered;
      const [leftFactorText, leftValue, _rightFactorText, rightValue] = seed.split("\u0000");
      const seededLeftFactor = Number(leftFactorText);
      const row = factors.slice(0, rightFactor + 1).map((factor) => factor.values[0]);
      row[seededLeftFactor] = leftValue;
      row[rightFactor] = rightValue;

      for (let leftFactor = 0; leftFactor < rightFactor; leftFactor += 1) {
        if (leftFactor === seededLeftFactor) continue;
        let bestValue = factors[leftFactor].values[0];
        for (const candidate of factors[leftFactor].values) {
          if (uncovered.has(pairKey(leftFactor, candidate, rightFactor, rightValue))) {
            bestValue = candidate;
            break;
          }
        }
        row[leftFactor] = bestValue;
      }
      rows.push(row);
      coverRowPairs(uncovered, row, rightFactor);
    }
  }

  const uniqueRows = new Map(rows.map((row) => [row.join("\u0001"), row]));
  return [...uniqueRows.values()];
}

export function findMissingPairs(factors, rows) {
  const missing = enumerateExpectedPairs(factors);
  for (const row of rows) {
    for (let right = 1; right < factors.length; right += 1) {
      for (let left = 0; left < right; left += 1) {
        missing.delete(pairKey(left, row[left], right, row[right]));
      }
    }
  }
  return [...missing];
}
