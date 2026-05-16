/**
 * 最小 valid な divinationContext と sample profile.
 * chat.ts のバリデーション (tarot 3 枚 / numerology / kyusei) を全て通す.
 * eval 中はこれを全 case で使い回す.
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
 * 多ターン case 用の plausible な assistant 応答 placeholder.
 *
 * 注: α 以降は server 側が D1 hydrate するため、これら placeholder は eval runner 側で
 * 実際には送信されず (= 各 user turn ごとに server が生成した assistant reply が history
 * になる). 互換のため field は残してある.
 */
export const PLACEHOLDER_ASSISTANT = [
  "愚者と魔術師、そして女教皇逆位置——あなたの今は、まだ言葉になっていない予感に満ちています。",
  "ライフパス 7 のあなたは、答えを内側で探すタイプ。今日のパーソナルデイ 3 が背中をそっと押します。",
  "五黄土星の中心力と、今日の一白水星の流れ。強引さよりも、流れに身を委ねる柔らかさが鍵となります。",
];

/**
 * eval 時に D1 にシードする sample profile (bigfive facets を含む).
 *
 * - phq9 / k6 は含めず (= opt-in なしで context に流れないことを default で確認する)
 * - bigfive.facets で「想像力 高い / 達成努力 高い / 自己主張 低い」あたりが top に来るよう構築
 *
 * 各 facet の 0-20 範囲で 17 以上を高、4-8 を低、それ以外を中程度に置く.
 */
export const profileFixture = {
  tests: {
    bigfive: {
      result: {
        extraversion: 60,
        agreeableness: 90,
        conscientiousness: 95,
        neuroticism: 55,
        openness: 105,
        facets: {
          // Neuroticism
          n1_anxiety: 14, n2_anger: 8, n3_depression: 9, n4_selfConsciousness: 12,
          n5_immoderation: 6, n6_vulnerability: 11,
          // Extraversion
          e1_friendliness: 12, e2_gregariousness: 8, e3_assertiveness: 7,
          e4_activityLevel: 10, e5_excitementSeeking: 11, e6_cheerfulness: 13,
          // Openness — 全部高め
          o1_imagination: 19, o2_artisticInterests: 18, o3_emotionality: 17,
          o4_adventurousness: 17, o5_intellect: 18, o6_liberalism: 16,
          // Agreeableness
          a1_trust: 16, a2_morality: 17, a3_altruism: 15, a4_cooperation: 14,
          a5_modesty: 14, a6_sympathy: 16,
          // Conscientiousness — 達成系 facet を上に
          c1_selfEfficacy: 17, c2_orderliness: 14, c3_dutifulness: 16,
          c4_achievementStriving: 19, c5_selfDiscipline: 16, c6_cautiousness: 14,
        },
      },
      answers: [],
      completedAt: "2026-05-15T00:00:00Z",
      retakeCount: 0,
      testVersion: "ipip-120",
    },
    rosenberg: {
      result: { rawScore: 32, percentageScore: 73.3, level: "high" },
      answers: [],
      completedAt: "2026-05-15T00:00:00Z",
      retakeCount: 0,
    },
    swls: {
      result: { rawScore: 26, percentageScore: 70, level: "satisfied", levelLabel: "満足" },
      answers: [],
      completedAt: "2026-05-15T00:00:00Z",
      retakeCount: 0,
    },
  },
};
