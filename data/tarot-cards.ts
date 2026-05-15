/**
 * Rider-Waite Tarot — 78 cards
 *
 * Keyword-level meanings (Rider-Waite tradition の通説要約).
 * Wedge 用の最小データ。本格版では数行の解説に拡張する余地あり。
 */

export type TarotCard = {
  id: number;
  name_en: string;
  name_ja: string;
  upright_meaning: string;
  reversed_meaning: string;
};

export type DrawnCard = TarotCard & {
  orientation: "upright" | "reversed";
};

export const TAROT_CARDS: TarotCard[] = [
  // === Major Arcana (0-21) ===
  { id: 0,  name_en: "The Fool",            name_ja: "愚者",       upright_meaning: "新しい始まり、自由、無邪気、可能性",        reversed_meaning: "無謀、軽率、ためらい、混乱" },
  { id: 1,  name_en: "The Magician",        name_ja: "魔術師",     upright_meaning: "創造、意志、技術、行動力",                   reversed_meaning: "策略、迷い、技量不足、虚偽" },
  { id: 2,  name_en: "The High Priestess",  name_ja: "女教皇",     upright_meaning: "直感、神秘、知性、内なる声",                 reversed_meaning: "隠された情報、無視された直感、表面的" },
  { id: 3,  name_en: "The Empress",         name_ja: "女帝",       upright_meaning: "豊かさ、母性、創造、繁栄",                   reversed_meaning: "依存、停滞、過保護、欠乏" },
  { id: 4,  name_en: "The Emperor",         name_ja: "皇帝",       upright_meaning: "権威、安定、統制、責任",                     reversed_meaning: "独裁、頑固、未熟、無秩序" },
  { id: 5,  name_en: "The Hierophant",      name_ja: "教皇",       upright_meaning: "伝統、規範、信仰、助言",                     reversed_meaning: "型破り、反逆、独自の道、教条主義への抵抗" },
  { id: 6,  name_en: "The Lovers",          name_ja: "恋人",       upright_meaning: "愛、調和、選択、結合",                       reversed_meaning: "不和、誘惑、判断ミス、別離" },
  { id: 7,  name_en: "The Chariot",         name_ja: "戦車",       upright_meaning: "勝利、意志、前進、自制",                     reversed_meaning: "暴走、方向喪失、敗北、自制心の欠如" },
  { id: 8,  name_en: "Strength",            name_ja: "力",         upright_meaning: "勇気、忍耐、内なる強さ、優しさ",             reversed_meaning: "自信喪失、弱気、激情、自己疑念" },
  { id: 9,  name_en: "The Hermit",          name_ja: "隠者",       upright_meaning: "内省、孤独、探求、知恵",                     reversed_meaning: "孤立、引きこもり、頑迷、迷い" },
  { id: 10, name_en: "Wheel of Fortune",    name_ja: "運命の輪",   upright_meaning: "転機、運命、循環、好機",                     reversed_meaning: "停滞、不運、抵抗、悪循環" },
  { id: 11, name_en: "Justice",             name_ja: "正義",       upright_meaning: "公正、真実、責任、因果",                     reversed_meaning: "不公平、偏見、回避、不誠実" },
  { id: 12, name_en: "The Hanged Man",      name_ja: "吊るされた男", upright_meaning: "犠牲、視点の転換、忍耐、停止",             reversed_meaning: "無駄な犠牲、停滞、利己、抵抗" },
  { id: 13, name_en: "Death",               name_ja: "死神",       upright_meaning: "終焉と再生、変容、手放し、変化",             reversed_meaning: "変化への抵抗、停滞、未練、再生の遅れ" },
  { id: 14, name_en: "Temperance",          name_ja: "節制",       upright_meaning: "調和、節度、統合、忍耐",                     reversed_meaning: "不均衡、過剰、衝突、せっかち" },
  { id: 15, name_en: "The Devil",           name_ja: "悪魔",       upright_meaning: "束縛、執着、欲望、依存",                     reversed_meaning: "解放、自覚、克服、誘惑への抵抗" },
  { id: 16, name_en: "The Tower",           name_ja: "塔",         upright_meaning: "崩壊、衝撃、啓示、突然の変化",               reversed_meaning: "崩壊の予兆、回避、内的混乱、抑制された変化" },
  { id: 17, name_en: "The Star",            name_ja: "星",         upright_meaning: "希望、癒し、霊感、信念",                     reversed_meaning: "失望、絶望、自信喪失、悲観" },
  { id: 18, name_en: "The Moon",            name_ja: "月",         upright_meaning: "不安、幻想、直感、潜在意識",                 reversed_meaning: "混乱の解消、真実の発見、不安の緩和" },
  { id: 19, name_en: "The Sun",             name_ja: "太陽",       upright_meaning: "成功、喜び、活力、明晰",                     reversed_meaning: "曇り、遅延、過信、悲観" },
  { id: 20, name_en: "Judgement",           name_ja: "審判",       upright_meaning: "覚醒、復活、決断、赦し",                     reversed_meaning: "後悔、自己批判、停滞、躊躇" },
  { id: 21, name_en: "The World",           name_ja: "世界",       upright_meaning: "完成、達成、統合、調和",                     reversed_meaning: "未完、停滞、もう一歩、閉塞" },

  // === Minor Arcana: Wands (棒/火) ===
  { id: 22, name_en: "Ace of Wands",        name_ja: "棒のエース", upright_meaning: "霊感、創造の火、新しい情熱",                 reversed_meaning: "遅延、情熱の喪失、空回り" },
  { id: 23, name_en: "Two of Wands",        name_ja: "棒の2",      upright_meaning: "計画、決断、未来への展望",                   reversed_meaning: "決断不能、視野狭窄、恐れ" },
  { id: 24, name_en: "Three of Wands",      name_ja: "棒の3",      upright_meaning: "拡大、先見、進展",                           reversed_meaning: "遅延、見込み違い、停滞" },
  { id: 25, name_en: "Four of Wands",       name_ja: "棒の4",      upright_meaning: "祝祭、調和、安定した基盤",                   reversed_meaning: "不安定、対立、祝いの遅れ" },
  { id: 26, name_en: "Five of Wands",       name_ja: "棒の5",      upright_meaning: "競争、葛藤、活発な議論",                     reversed_meaning: "和解、対立の解消、内なる葛藤" },
  { id: 27, name_en: "Six of Wands",        name_ja: "棒の6",      upright_meaning: "勝利、承認、栄光",                           reversed_meaning: "敗北、自信喪失、栄光の翳り" },
  { id: 28, name_en: "Seven of Wands",      name_ja: "棒の7",      upright_meaning: "防衛、勇気、立場を守る",                     reversed_meaning: "圧倒、降伏、自信の揺らぎ" },
  { id: 29, name_en: "Eight of Wands",      name_ja: "棒の8",      upright_meaning: "迅速、進展、伝達",                           reversed_meaning: "遅延、混乱、急ぎ過ぎ" },
  { id: 30, name_en: "Nine of Wands",       name_ja: "棒の9",      upright_meaning: "粘り強さ、警戒、最後の踏ん張り",             reversed_meaning: "疲弊、頑固、防衛過剰" },
  { id: 31, name_en: "Ten of Wands",        name_ja: "棒の10",     upright_meaning: "重荷、責任、限界",                           reversed_meaning: "解放、手放し、過負荷" },
  { id: 32, name_en: "Page of Wands",       name_ja: "棒のペイジ", upright_meaning: "好奇心、冒険心、新しい挑戦",                 reversed_meaning: "未熟、空回り、衝動性" },
  { id: 33, name_en: "Knight of Wands",     name_ja: "棒の騎士",   upright_meaning: "情熱的な行動、冒険、勢い",                   reversed_meaning: "性急、無謀、計画性の欠如" },
  { id: 34, name_en: "Queen of Wands",      name_ja: "棒の女王",   upright_meaning: "自信、魅力、決断力",                         reversed_meaning: "嫉妬、独占欲、自己中心" },
  { id: 35, name_en: "King of Wands",       name_ja: "棒の王",     upright_meaning: "ビジョン、リーダーシップ、大胆さ",           reversed_meaning: "横暴、性急、虚勢" },

  // === Minor Arcana: Cups (聖杯/水) ===
  { id: 36, name_en: "Ace of Cups",         name_ja: "聖杯のエース", upright_meaning: "愛、感情、新しい関係、霊感",               reversed_meaning: "感情の枯渇、関係の停滞、抑圧" },
  { id: 37, name_en: "Two of Cups",         name_ja: "聖杯の2",    upright_meaning: "結びつき、相互愛、調和",                     reversed_meaning: "不和、別離、相互理解の欠如" },
  { id: 38, name_en: "Three of Cups",       name_ja: "聖杯の3",    upright_meaning: "祝福、友情、喜び",                           reversed_meaning: "孤立、過剰な享楽、関係の冷却" },
  { id: 39, name_en: "Four of Cups",        name_ja: "聖杯の4",    upright_meaning: "倦怠、内省、無関心",                         reversed_meaning: "新たな関心、覚醒、機会への気づき" },
  { id: 40, name_en: "Five of Cups",        name_ja: "聖杯の5",    upright_meaning: "喪失、後悔、悲嘆",                           reversed_meaning: "立ち直り、許し、希望の発見" },
  { id: 41, name_en: "Six of Cups",         name_ja: "聖杯の6",    upright_meaning: "懐古、純粋、再会",                           reversed_meaning: "過去への執着、現実逃避、停滞" },
  { id: 42, name_en: "Seven of Cups",       name_ja: "聖杯の7",    upright_meaning: "幻想、選択肢、夢想",                         reversed_meaning: "明晰、決断、現実への回帰" },
  { id: 43, name_en: "Eight of Cups",       name_ja: "聖杯の8",    upright_meaning: "離脱、旅立ち、放棄",                         reversed_meaning: "迷い、執着、戻る勇気" },
  { id: 44, name_en: "Nine of Cups",        name_ja: "聖杯の9",    upright_meaning: "満足、達成、感情的な充足",                   reversed_meaning: "不満足、虚しさ、過剰な享楽" },
  { id: 45, name_en: "Ten of Cups",         name_ja: "聖杯の10",   upright_meaning: "家庭の幸福、調和、感情的成就",               reversed_meaning: "家庭不和、価値観のずれ、表面的幸福" },
  { id: 46, name_en: "Page of Cups",        name_ja: "聖杯のペイジ", upright_meaning: "感受性、創造性、新しい感情",               reversed_meaning: "未熟な感情、現実逃避、過敏" },
  { id: 47, name_en: "Knight of Cups",      name_ja: "聖杯の騎士", upright_meaning: "ロマンス、提案、理想",                       reversed_meaning: "誇大、欺瞞、感情的不安定" },
  { id: 48, name_en: "Queen of Cups",       name_ja: "聖杯の女王", upright_meaning: "共感、直感、慈愛",                           reversed_meaning: "感情過多、依存、内向き" },
  { id: 49, name_en: "King of Cups",        name_ja: "聖杯の王",   upright_meaning: "情緒安定、寛容、思いやり",                   reversed_meaning: "感情の抑圧、操作、不安定" },

  // === Minor Arcana: Swords (剣/風) ===
  { id: 50, name_en: "Ace of Swords",       name_ja: "剣のエース", upright_meaning: "真実、明晰、突破",                           reversed_meaning: "混乱、判断ミス、誤った理解" },
  { id: 51, name_en: "Two of Swords",       name_ja: "剣の2",      upright_meaning: "選択の保留、均衡、回避",                     reversed_meaning: "決断、混乱の解消、葛藤の表面化" },
  { id: 52, name_en: "Three of Swords",     name_ja: "剣の3",      upright_meaning: "心痛、別離、悲しみ",                         reversed_meaning: "回復、許し、痛みの和らぎ" },
  { id: 53, name_en: "Four of Swords",      name_ja: "剣の4",      upright_meaning: "休息、回復、内省",                           reversed_meaning: "再起、活動再開、休息不足" },
  { id: 54, name_en: "Five of Swords",      name_ja: "剣の5",      upright_meaning: "対立、敗北、不毛な勝利",                     reversed_meaning: "和解、後悔、関係修復" },
  { id: 55, name_en: "Six of Swords",       name_ja: "剣の6",      upright_meaning: "移行、回復への旅、心の整理",                 reversed_meaning: "停滞、後戻り、過去への執着" },
  { id: 56, name_en: "Seven of Swords",     name_ja: "剣の7",      upright_meaning: "策略、回避、独自路線",                       reversed_meaning: "告白、計画の露見、再考" },
  { id: 57, name_en: "Eight of Swords",     name_ja: "剣の8",      upright_meaning: "束縛感、自己制限、無力感",                   reversed_meaning: "解放、自己受容、新たな視点" },
  { id: 58, name_en: "Nine of Swords",      name_ja: "剣の9",      upright_meaning: "不安、悪夢、心配",                           reversed_meaning: "希望の回復、解放、不安の軽減" },
  { id: 59, name_en: "Ten of Swords",       name_ja: "剣の10",     upright_meaning: "終焉、底打ち、痛みの終わり",                 reversed_meaning: "再生、回復、最悪期の脱出" },
  { id: 60, name_en: "Page of Swords",      name_ja: "剣のペイジ", upright_meaning: "好奇心、観察、新しい考え",                   reversed_meaning: "うわさ、皮肉、軽率な言動" },
  { id: 61, name_en: "Knight of Swords",    name_ja: "剣の騎士",   upright_meaning: "迅速な行動、知性、突進",                     reversed_meaning: "性急、無謀、暴走" },
  { id: 62, name_en: "Queen of Swords",     name_ja: "剣の女王",   upright_meaning: "明晰、独立、率直",                           reversed_meaning: "辛辣、冷淡、孤立" },
  { id: 63, name_en: "King of Swords",      name_ja: "剣の王",     upright_meaning: "論理、権威、公正",                           reversed_meaning: "独善、冷酷、権力の乱用" },

  // === Minor Arcana: Pentacles (金貨/地) ===
  { id: 64, name_en: "Ace of Pentacles",    name_ja: "金貨のエース", upright_meaning: "豊かさの種、好機、新しい財運",             reversed_meaning: "機会の喪失、停滞、物質的不安" },
  { id: 65, name_en: "Two of Pentacles",    name_ja: "金貨の2",    upright_meaning: "バランス、適応、優先順位",                   reversed_meaning: "混乱、過負荷、優先順位の崩壊" },
  { id: 66, name_en: "Three of Pentacles",  name_ja: "金貨の3",    upright_meaning: "協働、技術、評価",                           reversed_meaning: "不協和、能力不足、評価の遅れ" },
  { id: 67, name_en: "Four of Pentacles",   name_ja: "金貨の4",    upright_meaning: "保守、所有、安定",                           reversed_meaning: "執着、出し惜しみ、停滞" },
  { id: 68, name_en: "Five of Pentacles",   name_ja: "金貨の5",    upright_meaning: "困窮、孤立、不安",                           reversed_meaning: "回復、援助の到来、状況の好転" },
  { id: 69, name_en: "Six of Pentacles",    name_ja: "金貨の6",    upright_meaning: "分与、寛大、公正な交換",                     reversed_meaning: "不平等、利己、依存" },
  { id: 70, name_en: "Seven of Pentacles",  name_ja: "金貨の7",    upright_meaning: "忍耐、投資、長期視点",                       reversed_meaning: "短気、見返り不足、見通しの誤り" },
  { id: 71, name_en: "Eight of Pentacles",  name_ja: "金貨の8",    upright_meaning: "勤勉、習熟、技術向上",                       reversed_meaning: "怠惰、雑な仕事、退屈" },
  { id: 72, name_en: "Nine of Pentacles",   name_ja: "金貨の9",    upright_meaning: "自立、豊かさ、達成",                         reversed_meaning: "依存、空虚、表面的成功" },
  { id: 73, name_en: "Ten of Pentacles",    name_ja: "金貨の10",   upright_meaning: "家族の繁栄、遺産、長期安定",                 reversed_meaning: "家族の不和、財政不安、長期的不安" },
  { id: 74, name_en: "Page of Pentacles",   name_ja: "金貨のペイジ", upright_meaning: "学び、計画、現実的な夢",                   reversed_meaning: "怠学、夢想、現実逃避" },
  { id: 75, name_en: "Knight of Pentacles", name_ja: "金貨の騎士", upright_meaning: "勤勉、誠実、着実",                           reversed_meaning: "頑固、停滞、退屈" },
  { id: 76, name_en: "Queen of Pentacles",  name_ja: "金貨の女王", upright_meaning: "実務的、養育、豊かさ",                       reversed_meaning: "物質主義、ネグレクト、不安定" },
  { id: 77, name_en: "King of Pentacles",   name_ja: "金貨の王",   upright_meaning: "繁栄、寛大、堅実な成功",                     reversed_meaning: "強欲、停滞、堅物" },
];

/**
 * 78 枚から重複なし 3 枚を引く。各カードに正逆位置（50/50）を付与する。
 */
export function drawThreeCards(): DrawnCard[] {
  const indices = new Set<number>();
  while (indices.size < 3) {
    indices.add(Math.floor(Math.random() * TAROT_CARDS.length));
  }
  return Array.from(indices).map((i) => ({
    ...TAROT_CARDS[i],
    orientation: Math.random() < 0.5 ? "upright" : "reversed",
  }));
}
