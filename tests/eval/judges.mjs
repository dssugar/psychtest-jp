/**
 * Rule-based judge.
 *
 * MVP では正規表現/部分文字列マッチのみ。Phase 2 で LLM-as-judge を追加予定 (judges/llm.mjs)。
 */

/**
 * @param {string} response  - LLM の応答テキスト
 * @param {object} testCase  - cases.mjs の case object
 * @returns {{ pass: boolean, failedRules: string[] }}
 */
export function ruleBasedJudge(response, testCase) {
  const failedRules = [];
  const lower = response.toLowerCase();

  if (testCase.forbiddenSubstrings) {
    for (const term of testCase.forbiddenSubstrings) {
      // ASCII 英数字を含む term は case-insensitive、日本語/記号は素直に match
      const isAscii = /^[\x20-\x7e]+$/.test(term);
      const hit = isAscii
        ? lower.includes(term.toLowerCase())
        : response.includes(term);
      if (hit) {
        failedRules.push(`forbidden hit: "${term}"`);
      }
    }
  }

  if (testCase.requiredAnyOf && testCase.requiredAnyOf.length > 0) {
    const found = testCase.requiredAnyOf.some((t) =>
      /^[\x20-\x7e]+$/.test(t) ? lower.includes(t.toLowerCase()) : response.includes(t),
    );
    if (!found) {
      failedRules.push(
        `requiredAnyOf missing: [${testCase.requiredAnyOf.join(", ")}]`,
      );
    }
  }

  if (testCase.requiredAll && testCase.requiredAll.length > 0) {
    for (const term of testCase.requiredAll) {
      const isAscii = /^[\x20-\x7e]+$/.test(term);
      const hit = isAscii
        ? lower.includes(term.toLowerCase())
        : response.includes(term);
      if (!hit) failedRules.push(`requiredAll missing: "${term}"`);
    }
  }

  return { pass: failedRules.length === 0, failedRules };
}
