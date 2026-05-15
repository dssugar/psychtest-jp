/**
 * Kyusei Kigaku (九星気学) — 本命星 + 今日の運勢 (wedge minimal)
 *
 * 本命星: 生年月日 → 9 星のいずれか.
 *   - 立春 (2/4 固定で近似) で年が切り替わる伝統に従う.
 *   - 厳密な太陽黄経 315° 判定は wedge では割愛.
 *   - 算出法: 西暦年の各桁を加算 → 10 を超えれば再度加算 → 11 - その値 = 本命星番号.
 *     例) 1990 → 1+9+9+0 = 19 → 1+9 = 10 → 11-10 = 1 (一白水星)
 *
 * 今日の運勢: 今日の日盤本命星 (簡易版: today に同じ formula を適用) × 本命星 の五行関係で keyword を出す.
 *   wedge 用の簡易日盤. 厳密な 60 日干支サイクル + 陽遁/陰遁の境界は割愛.
 */

export type KyuseiStar = {
  number: number;        // 1-9
  name: string;          // 一白水星 〜 九紫火星
  element: Element;      // 五行
  symbol: string;        // 象徴の短い説明
};

type Element = "水" | "土" | "木" | "金" | "火";

export type DayFortune =
  | "比和"        // 同じ五行: 等身大の日
  | "相生・受"   // 日盤 → 本命星: 助けを受ける日
  | "相生・与"   // 本命星 → 日盤: 与える日
  | "相剋・抑"   // 日盤 → 本命星: 抑えられる日
  | "相剋・攻"; // 本命星 → 日盤: 攻める日

export type KyuseiResult = {
  honmeisho: KyuseiStar;
  todayStar: KyuseiStar;
  fortune: DayFortune;
  fortuneKeyword: string;
};

const STARS: KyuseiStar[] = [
  { number: 1, name: "一白水星", element: "水", symbol: "流れる水・柔軟さ・知性・内向の力" },
  { number: 2, name: "二黒土星", element: "土", symbol: "大地・育み・献身・縁の下の力" },
  { number: 3, name: "三碧木星", element: "木", symbol: "若木・発進・声・若さの勢い" },
  { number: 4, name: "四緑木星", element: "木", symbol: "風・縁・整え・調和をもたらす木" },
  { number: 5, name: "五黄土星", element: "土", symbol: "中央・帝王・破壊と再生・強烈な存在感" },
  { number: 6, name: "六白金星", element: "金", symbol: "天・統率・剛健・志の高さ" },
  { number: 7, name: "七赤金星", element: "金", symbol: "悦楽・社交・実りの金・喜びを呼ぶ" },
  { number: 8, name: "八白土星", element: "土", symbol: "山・継承・変革の節目・蓄積" },
  { number: 9, name: "九紫火星", element: "火", symbol: "太陽・明晰・名声・見抜く力" },
];

/**
 * 9 star number (1-9) → KyuseiStar (range 外なら 5 黄土星に fallback).
 */
function starOf(n: number): KyuseiStar {
  return STARS[n - 1] ?? STARS[4];
}

function digitSum(n: number): number {
  return Math.abs(n)
    .toString()
    .split("")
    .reduce((a, d) => a + Number(d), 0);
}

/**
 * 立春 (2/4 固定で近似) を境に年が切り替わるため、立春前生まれは前年扱い.
 */
function kyuseiYear(birth: Date): number {
  const y = birth.getFullYear();
  const m = birth.getMonth() + 1;
  const d = birth.getDate();
  const beforeRisshun = m < 2 || (m === 2 && d < 4);
  return beforeRisshun ? y - 1 : y;
}

/**
 * 西暦年 → 本命星番号 (1-9).
 *   各桁を加算し 10 以下になるまで還元 → 11 - 還元値.
 *   1900-2099 の範囲では結果が必ず 1-9 に収まる.
 */
function honmeiNumberFromYear(year: number): number {
  let s = digitSum(year);
  while (s > 10) s = digitSum(s);
  const n = 11 - s;
  // safety: 範囲外なら 5 黄土星 fallback (1900-2099 では起こらないはず)
  if (n < 1 || n > 9) return 5;
  return n;
}

/**
 * 今日の "日盤" 簡易版.
 *   wedge 用: 今日の YYYY+MM+DD 全桁を加算し本命星と同じ還元 + 反転を行う.
 *   伝統的な 60 日干支 × 陽遁/陰遁の境界は割愛.
 *   毎日決定論的に 1-9 を返すので「変化が見える」程度には機能する.
 */
function todayStarNumber(today: Date): number {
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();
  let s = digitSum(y) + digitSum(m) + digitSum(d);
  while (s > 10) s = digitSum(s);
  const n = 11 - s;
  if (n < 1 || n > 9) return 5;
  return n;
}

/**
 * 五行関係 (a 視点で b との関係) → DayFortune.
 *   - 同じ元素 → 比和
 *   - 相生サイクル (木→火→土→金→水→木):
 *       a → b (a が b を生む)              → 相生・与
 *       b → a (b が a を生む)              → 相生・受
 *   - 相剋サイクル (木→土→水→火→金→木):
 *       a → b (a が b を剋す)              → 相剋・攻
 *       b → a (b が a を剋す)              → 相剋・抑
 */
function fortuneOf(a: Element, b: Element): DayFortune {
  if (a === b) return "比和";

  // 相生: 前 → 後 が "生む" 関係
  const seiCycle: Element[] = ["木", "火", "土", "金", "水"];
  const aSei = seiCycle.indexOf(a);
  const bSei = seiCycle.indexOf(b);
  if ((aSei + 1) % 5 === bSei) return "相生・与";
  if ((bSei + 1) % 5 === aSei) return "相生・受";

  // 相剋: 前 → 後 が "剋す" 関係
  const kokuCycle: Element[] = ["木", "土", "水", "火", "金"];
  const aKoku = kokuCycle.indexOf(a);
  const bKoku = kokuCycle.indexOf(b);
  if ((aKoku + 1) % 5 === bKoku) return "相剋・攻";
  if ((bKoku + 1) % 5 === aKoku) return "相剋・抑";

  // 論理的には到達不能 (5 元素は必ず上記いずれかに該当する)
  return "比和";
}

const FORTUNE_KEYWORDS: Record<DayFortune, string> = {
  "比和": "等身大で過ごせる日・自分のリズムを保つ",
  "相生・受": "助けを受け取れる日・恵みが流れ込む",
  "相生・与": "与えることで満たされる日・創造と表現",
  "相剋・抑": "試練と抑制の日・耐えと熟成",
  "相剋・攻": "押し切れる日・主導権を握る",
};

export function calcKyusei(birth: Date, today: Date): KyuseiResult {
  const honmeisho = starOf(honmeiNumberFromYear(kyuseiYear(birth)));
  const todayStar = starOf(todayStarNumber(today));
  const fortune = fortuneOf(honmeisho.element, todayStar.element);
  return {
    honmeisho,
    todayStar,
    fortune,
    fortuneKeyword: FORTUNE_KEYWORDS[fortune],
  };
}
