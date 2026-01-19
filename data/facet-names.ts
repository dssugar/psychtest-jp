/**
 * IPIP-NEO 30ファセットの日本語名称と説明
 */

export const facetNames = {
  // Neuroticism (神経症傾向)
  n1_anxiety: "不安",
  n2_anger: "怒り",
  n3_depression: "抑うつ",
  n4_selfConsciousness: "自意識過剰",
  n5_immoderation: "衝動性",
  n6_vulnerability: "傷つきやすさ",

  // Extraversion (外向性)
  e1_friendliness: "親しみやすさ",
  e2_gregariousness: "群居性",
  e3_assertiveness: "自己主張",
  e4_activityLevel: "活動レベル",
  e5_excitementSeeking: "刺激希求",
  e6_cheerfulness: "快活さ",

  // Openness (開放性)
  o1_imagination: "想像力",
  o2_artisticInterests: "芸術的関心",
  o3_emotionality: "情動性",
  o4_adventurousness: "冒険心",
  o5_intellect: "知性",
  o6_liberalism: "リベラリズム",

  // Agreeableness (協調性)
  a1_trust: "信頼",
  a2_morality: "誠実さ",
  a3_altruism: "利他性",
  a4_cooperation: "協力",
  a5_modesty: "謙虚さ",
  a6_sympathy: "共感性",

  // Conscientiousness (誠実性)
  c1_selfEfficacy: "自己効力感",
  c2_orderliness: "秩序性",
  c3_dutifulness: "義務感",
  c4_achievementStriving: "達成努力",
  c5_selfDiscipline: "自己鍛錬",
  c6_cautiousness: "慎重さ",
} as const;

export const facetDescriptions = {
  // Neuroticism
  n1_anxiety: "心配性の度合い。将来への不安や恐れの強さ。",
  n2_anger: "怒りを感じやすい傾向。イライラしやすさ。",
  n3_depression: "憂鬱な気分になりやすさ。落ち込みやすさ。",
  n4_selfConsciousness: "他者の目を気にする傾向。恥ずかしがり屋の度合い。",
  n5_immoderation: "衝動を抑えられない傾向。自制心の低さ。",
  n6_vulnerability: "ストレスに対する脆弱性。対処能力の低さ。",

  // Extraversion
  e1_friendliness: "友好的で温かい性格。人との親密さを求める傾向。",
  e2_gregariousness: "集団や人混みを好む傾向。社交性の高さ。",
  e3_assertiveness: "リーダーシップを発揮する傾向。自己主張の強さ。",
  e4_activityLevel: "活動的でエネルギッシュな度合い。忙しさを好む傾向。",
  e5_excitementSeeking: "刺激や冒険を求める傾向。スリルを楽しむ度合い。",
  e6_cheerfulness: "楽観的で陽気な性格。ポジティブな感情を持ちやすさ。",

  // Openness
  o1_imagination: "空想や想像を楽しむ傾向。創造的思考の豊かさ。",
  o2_artisticInterests: "芸術や美への関心の高さ。審美眼の鋭さ。",
  o3_emotionality: "自分の感情を深く経験する傾向。感受性の高さ。",
  o4_adventurousness: "新しい経験への開放性。変化を楽しむ度合い。",
  o5_intellect: "知的好奇心の高さ。抽象的思考を楽しむ傾向。",
  o6_liberalism: "伝統に挑戦する傾向。既存の価値観を疑う度合い。",

  // Agreeableness
  a1_trust: "他者を信頼する傾向。人の善意を信じる度合い。",
  a2_morality: "正直で誠実である傾向。道徳的な行動をとる度合い。",
  a3_altruism: "他者を助けたい気持ちの強さ。思いやりの深さ。",
  a4_cooperation: "協力的で争いを避ける傾向。妥協する度合い。",
  a5_modesty: "謙虚で控えめな性格。自己顕示欲の低さ。",
  a6_sympathy: "他者への共感性の高さ。感情移入しやすさ。",

  // Conscientiousness
  c1_selfEfficacy: "自分の能力への自信。目標達成への確信の強さ。",
  c2_orderliness: "整理整頓を好む傾向。秩序を重視する度合い。",
  c3_dutifulness: "義務や責任を重視する傾向。約束を守る度合い。",
  c4_achievementStriving: "高い目標を持ち努力する傾向。向上心の強さ。",
  c5_selfDiscipline: "計画を実行する能力。先延ばしにしない度合い。",
  c6_cautiousness: "慎重に決断する傾向。衝動的行動を避ける度合い。",
} as const;

/**
 * ドメインごとにファセットをグループ化
 */
export const facetsByDomain = {
  neuroticism: [
    "n1_anxiety",
    "n2_anger",
    "n3_depression",
    "n4_selfConsciousness",
    "n5_immoderation",
    "n6_vulnerability",
  ] as const,
  extraversion: [
    "e1_friendliness",
    "e2_gregariousness",
    "e3_assertiveness",
    "e4_activityLevel",
    "e5_excitementSeeking",
    "e6_cheerfulness",
  ] as const,
  openness: [
    "o1_imagination",
    "o2_artisticInterests",
    "o3_emotionality",
    "o4_adventurousness",
    "o5_intellect",
    "o6_liberalism",
  ] as const,
  agreeableness: [
    "a1_trust",
    "a2_morality",
    "a3_altruism",
    "a4_cooperation",
    "a5_modesty",
    "a6_sympathy",
  ] as const,
  conscientiousness: [
    "c1_selfEfficacy",
    "c2_orderliness",
    "c3_dutifulness",
    "c4_achievementStriving",
    "c5_selfDiscipline",
    "c6_cautiousness",
  ] as const,
};
