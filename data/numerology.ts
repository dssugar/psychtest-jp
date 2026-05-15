/**
 * Numerology — Life Path & Personal Day (wedge minimal)
 *
 * 数秘術の伝統的なピタゴラス式計算:
 *   - Life Path Number: 生年月日(YYYY+MM+DD)の各桁を加算し単一桁まで還元
 *   - Personal Year: 誕生月 + 誕生日 + 今年 を還元
 *   - Personal Day:   Personal Year + 今月 + 今日 を還元
 *
 * Master Numbers (11 / 22 / 33) は還元せず保持する伝統に従う。
 * Wedge 用の簡易版: タロット/九星気学と並列に投げて LLM が統合解釈する素材。
 */

export type NumerologyResult = {
  lifePath: number;
  lifePathMeaning: string;
  personalDay: number;
  personalDayMeaning: string;
};

const MASTER_NUMBERS = new Set([11, 22, 33]);

/**
 * 数字の各桁を加算 (e.g. 1990 → 1+9+9+0 = 19).
 */
function digitSum(n: number): number {
  return Math.abs(n)
    .toString()
    .split("")
    .reduce((acc, d) => acc + Number(d), 0);
}

/**
 * Master Number (11/22/33) を保ったまま単一桁まで還元.
 */
function reduceWithMaster(n: number): number {
  let current = n;
  while (current > 9 && !MASTER_NUMBERS.has(current)) {
    current = digitSum(current);
  }
  return current;
}

/**
 * 生年月日 → ライフパスナンバー.
 * 例: 1990-04-15 → 1+9+9+0 + 4 + 1+5 = 29 → 2+9 = 11 (master、還元せず)
 */
export function calcLifePath(birth: Date): number {
  const y = birth.getFullYear();
  const m = birth.getMonth() + 1;
  const d = birth.getDate();
  return reduceWithMaster(digitSum(y) + digitSum(m) + digitSum(d));
}

/**
 * パーソナルデイ = (誕生月 + 誕生日 + 今年) → personal year → + 今月 → personal month → + 今日 → personal day.
 * 各段階で master 番号は還元しない。
 */
export function calcPersonalDay(birth: Date, today: Date): number {
  const personalYear = reduceWithMaster(
    digitSum(birth.getMonth() + 1) +
      digitSum(birth.getDate()) +
      digitSum(today.getFullYear()),
  );
  const personalMonth = reduceWithMaster(personalYear + digitSum(today.getMonth() + 1));
  return reduceWithMaster(personalMonth + digitSum(today.getDate()));
}

const LIFE_PATH_MEANINGS: Record<number, string> = {
  1: "独立・開拓者・始まりの数。自分の足で立ち、新しい道を切り開く魂",
  2: "調和・協調・橋渡しの数。他者との関係性の中で輝く魂",
  3: "創造・表現・喜びの数。言葉や芸術で世界に色を加える魂",
  4: "基盤・誠実・構築の数。地に足のついた営みで信頼を積み上げる魂",
  5: "変化・自由・冒険の数。経験を通して世界の広さを知る魂",
  6: "愛・責任・奉仕の数。人や場を慈しみ育てる魂",
  7: "探究・内省・神秘の数。物事の本質を独りで掘り下げる魂",
  8: "力・達成・物質的成功の数。現実世界を動かす実行力を持つ魂",
  9: "完成・博愛・手放しの数。多くを経験し、それを世界に還す魂",
  11: "(マスター) 直感・霊感・啓示の数。理屈を超えた光を運ぶ魂",
  22: "(マスター) 大建設・現実化・マスタービルダーの数。理想を地上に形作る魂",
  33: "(マスター) 無条件の愛・献身の数。最も高次の愛で人を支える魂",
};

const PERSONAL_DAY_MEANINGS: Record<number, string> = {
  1: "始動・着手・新しい一歩を踏み出すのに適した日",
  2: "協力・調整・人と歩調を合わせる日",
  3: "表現・遊び・創造性を解き放つ日",
  4: "土台作り・地道な作業・整理整頓に向く日",
  5: "変化・移動・予想外の出会いに開かれる日",
  6: "家族・愛情・他者の世話に心を傾ける日",
  7: "内省・休息・深い思索に向く日",
  8: "決断・実行・現実的な成果を取りに行く日",
  9: "区切り・手放し・浄化と完了の日",
  11: "(マスター) 直感が冴え、霊的気づきが訪れやすい日",
  22: "(マスター) 大きな構想を現実化に向けて動かす日",
  33: "(マスター) 慈愛を持って人と関わる、無償の奉仕に向く日",
};

export function lifePathMeaning(n: number): string {
  return LIFE_PATH_MEANINGS[n] ?? "意味不明な数(計算エラーの可能性あり)";
}

export function personalDayMeaning(n: number): string {
  return PERSONAL_DAY_MEANINGS[n] ?? "意味不明な数(計算エラーの可能性あり)";
}

export function calcNumerology(birth: Date, today: Date): NumerologyResult {
  const lifePath = calcLifePath(birth);
  const personalDay = calcPersonalDay(birth, today);
  return {
    lifePath,
    lifePathMeaning: lifePathMeaning(lifePath),
    personalDay,
    personalDayMeaning: personalDayMeaning(personalDay),
  };
}
