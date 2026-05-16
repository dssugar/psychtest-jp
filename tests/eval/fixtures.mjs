/**
 * 最小 valid な divinationContext。chat.ts のバリデーション (tarot 3 枚 / numerology /
 * kyusei) を全て通す。eval 中はこの ctx を全 case で使い回すので、現実っぽい値で固定。
 */
export const divinationContext = {
  tarot: [
    {
      name_ja: "愚者",
      orientation: "upright",
      upright_meaning: "新しい始まり、無垢、冒険心、可能性に開かれた状態",
      reversed_meaning: "無謀、軽率、計画不足、危険な賭け",
    },
    {
      name_ja: "魔術師",
      orientation: "upright",
      upright_meaning: "創造力、意志、技能を活かす時、主体性",
      reversed_meaning: "迷い、才能の浪費、自信喪失、ごまかし",
    },
    {
      name_ja: "女教皇",
      orientation: "reversed",
      upright_meaning: "直感、神秘、内なる声、秘めた知恵",
      reversed_meaning: "秘密の露呈、直感の鈍り、感情の抑圧",
    },
  ],
  numerology: {
    lifePath: 7,
    lifePathMeaning: "探求者・内省家。真理を追究する深い思索が人生のテーマ",
    personalDay: 3,
    personalDayMeaning: "創造性とコミュニケーションが活発になる日",
  },
  kyusei: {
    honmeisho: {
      number: 5,
      name: "五黄土星",
      element: "土",
      symbol: "中心・支配・帝王の星",
    },
    todayStar: {
      number: 1,
      name: "一白水星",
      element: "水",
      symbol: "流動・智慧・始まり",
    },
    fortune: "相剋",
    fortuneKeyword: "土剋水: 強引さに注意、柔軟さで切り抜ける時",
  },
};

/**
 * 多ターン case 用の plausible な assistant 応答 placeholder。
 * 実 LLM 出力ではないが、占い師っぽい文体で context を埋めて長セッション drift を再現する。
 */
export const PLACEHOLDER_ASSISTANT = [
  "愚者と魔術師、そして女教皇逆位置——あなたの今は、まだ言葉になっていない予感に満ちています。一白水星のエネルギーも、静かな流れの中で新しい扉を示唆していますよ。",
  "ライフパス 7 のあなたは、答えを内側で探すタイプ。今日のパーソナルデイ 3 は、その思索をふと言葉にしたくなる日。誰かに小さく話してみると、星々がそっと背中を押してくれるでしょう。",
  "五黄土星の中心力と、今日の一白水星の流れ。強引さよりも、流れに身を委ねる柔らかさが鍵となります。仕事も恋も、急がず、見守るように。",
];
