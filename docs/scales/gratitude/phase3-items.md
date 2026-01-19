# Phase 3: Gratitude (IPIP-VIA) Items Extraction

## Scale Information

- **Scale Name**: Gratitude (IPIP-VIA Character Strength)
- **Abbreviation**: Gratitude (IPIP-VIA)
- **Items**: 8
- **Response Format**: 5-point Likert scale
- **Language Versions**: English (original), Japanese (new translation)

## Items (Japanese Version)

⚠️ **Important**: The Japanese items below are newly created translations (IPIP allows free translation). No prior validated Japanese version exists for IPIP-VIA Gratitude.

**Translation Method**: Forward translation with cultural adaptation for Japanese context

### 8 Japanese Items:

1. 自分を気にかけてくれる人々に感謝の気持ちを伝えている
2. 人生において豊かな恵みを受けてきたと感じる
3. 立ち止まって、自分の恵まれている点を数えることがある
4. 非常に感謝深い人間である
5. 人生で受け取ったものに対して感謝の気持ちを感じる
6. 毎日、深い感謝の念を感じている
7. 自分に良くしてくれる人々に感謝する必要を感じない（逆転項目）
8. 人生において感謝すべきことがほとんど見つからない（逆転項目）

## Items (English Original)

**Source**: IPIP-VIA Character Strengths (https://ipip.ori.org/newVIAKey.htm)

### 8 English Items:

1. Express my thanks to those who care about me.
2. Have been richly blessed in my life.
3. Stop to count my blessings.
4. Am an extremely grateful person.
5. Feel thankful for what I have received in life.
6. Feel a profound sense of appreciation every day.
7. Do not see the need to acknowledge others who are good to me. (reverse)
8. Find few things in my life to be grateful for. (reverse)

## JSON Data Format

```json
{
  "scale": "gratitude",
  "fullName": "Gratitude (IPIP-VIA Character Strength)",
  "abbreviation": "Gratitude",
  "language": "ja",
  "version": "IPIP-VIA (Japanese translation v1.0)",
  "items": 8,
  "questions": [
    {
      "id": 1,
      "text": "自分を気にかけてくれる人々に感謝の気持ちを伝えている",
      "reverse": false,
      "english": "Express my thanks to those who care about me."
    },
    {
      "id": 2,
      "text": "人生において豊かな恵みを受けてきたと感じる",
      "reverse": false,
      "english": "Have been richly blessed in my life."
    },
    {
      "id": 3,
      "text": "立ち止まって、自分の恵まれている点を数えることがある",
      "reverse": false,
      "english": "Stop to count my blessings."
    },
    {
      "id": 4,
      "text": "非常に感謝深い人間である",
      "reverse": false,
      "english": "Am an extremely grateful person."
    },
    {
      "id": 5,
      "text": "人生で受け取ったものに対して感謝の気持ちを感じる",
      "reverse": false,
      "english": "Feel thankful for what I have received in life."
    },
    {
      "id": 6,
      "text": "毎日、深い感謝の念を感じている",
      "reverse": false,
      "english": "Feel a profound sense of appreciation every day."
    },
    {
      "id": 7,
      "text": "自分に良くしてくれる人々に感謝する必要を感じない",
      "reverse": true,
      "english": "Do not see the need to acknowledge others who are good to me."
    },
    {
      "id": 8,
      "text": "人生において感謝すべきことがほとんど見つからない",
      "reverse": true,
      "english": "Find few things in my life to be grateful for."
    }
  ],
  "scaleLabels": [
    "全く当てはまらない",
    "あまり当てはまらない",
    "どちらとも言えない",
    "やや当てはまる",
    "非常に当てはまる"
  ],
  "scaleLabelsEnglish": [
    "Very Inaccurate",
    "Moderately Inaccurate",
    "Neither Accurate nor Inaccurate",
    "Moderately Accurate",
    "Very Accurate"
  ],
  "scoring": {
    "method": "mean",
    "min": 1.0,
    "max": 5.0,
    "reverseItems": [7, 8],
    "interpretation": "Higher scores indicate greater gratitude (awareness and expression of thankfulness)",
    "note": "Items 7 and 8 are reverse-scored before calculating mean."
  },
  "license": {
    "status": "Public Domain",
    "commercial": "Free to use - no permission needed",
    "translation": "Free to translate - IPIP allows unrestricted translation",
    "source": "https://ipip.ori.org/newVIAKey.htm"
  }
}
```

## Response Format

### Scale Type
- **5-point Likert scale** (5件法)
- **Scoring**: 1-5 per item
- **Total Range**: 1.0-5.0 (mean score)

### Japanese Response Options

| Value | Label | Meaning |
|-------|-------|---------|
| 1 | 全く当てはまらない | Very Inaccurate |
| 2 | あまり当てはまらない | Moderately Inaccurate |
| 3 | どちらとも言えない | Neither Accurate nor Inaccurate |
| 4 | やや当てはまる | Moderately Accurate |
| 5 | 非常に当てはまる | Very Accurate |

## Reverse Items

**Important**: ✅ **Items 7 and 8 are reverse-scored**

Before calculating the mean score:
- Item 7: 自分に良くしてくれる人々に感謝する必要を感じない
- Item 8: 人生において感謝すべきことがほとんど見つからない

**Reverse scoring formula**: `reversed_score = 6 - original_score`

Example:
- If user selects "5 (非常に当てはまる)" for item 7 → reversed to 1
- If user selects "1 (全く当てはまらない)" for item 7 → reversed to 5

## Scoring Instructions

1. **Reverse Items 7 and 8**: Apply reverse scoring formula
   - Formula: `reversed_score = 6 - original_score`

2. **Calculate Mean**: Sum all 8 item responses (after reversing 7 and 8) and divide by 8
   - Formula: `Total Score = (Item1 + Item2 + ... + Item6 + Reversed_Item7 + Reversed_Item8) / 8`

3. **Score Range**: 1.0 to 5.0

4. **Interpretation**:
   - **1.0-2.0**: Low gratitude (below average)
   - **2.1-3.0**: Moderately low gratitude
   - **3.1-3.9**: Moderate gratitude (average)
   - **4.0-4.5**: High gratitude (above average)
   - **4.6-5.0**: Very high gratitude (exceptional)

5. **No Clinical Cutoffs**: Gratitude is a continuous trait measure without clinical cutoffs

## Interpretation Levels

For Phase 4 interpretation content, we will use **5 levels**:

1. **Low (1.0-2.0)**: 低い
2. **Moderately Low (2.1-3.0)**: やや低い
3. **Moderate (3.1-3.9)**: 中程度
4. **High (4.0-4.5)**: 高い
5. **Very High (4.6-5.0)**: 非常に高い

## Implementation Notes

### For TypeScript Implementation

```typescript
// Scale labels for 5-point Likert
const scaleLabels = [
  "全く当てはまらない",
  "あまり当てはまらない",
  "どちらとも言えない",
  "やや当てはまる",
  "非常に当てはまる"
];

// Reverse items (IDs 7 and 8)
const reverseItems: number[] = [7, 8];

// Reverse scoring function
function reverseScore(score: number): number {
  return 6 - score; // 1→5, 2→4, 3→3, 4→2, 5→1
}

// Scoring function
function calculateGratitude(responses: number[]): number {
  const processedResponses = responses.map((score, index) => {
    const itemId = index + 1;
    return reverseItems.includes(itemId) ? reverseScore(score) : score;
  });

  const sum = processedResponses.reduce((a, b) => a + b, 0);
  return sum / responses.length; // Mean score
}

// Interpretation
function interpretGratitude(score: number): string {
  if (score < 2.1) return "low";
  if (score < 3.1) return "moderately-low";
  if (score < 4.0) return "moderate";
  if (score < 4.6) return "high";
  return "very-high";
}
```

### Validation

- ✅ 8 items confirmed
- ✅ 5-point Likert scale
- ✅ 2 reverse items (7, 8) identified
- ✅ Mean scoring method
- ✅ Continuous scale (no cutoffs)
- ✅ Japanese translation completed (new, to be validated)

### Translation Validation Plan

Since this is a new Japanese translation (no prior validation):

**Initial Implementation**:
- Add disclaimer: "日本語翻訳版（検証中）"
- Collect reliability data from first 100+ users

**Validation Criteria** (After n ≥ 100):
- **Target Cronbach's α**: ≥ 0.70 (match or exceed original 0.79)
- **Item-total correlations**: All items r ≥ 0.30
- **Reverse items check**: Negative correlation with positive items

**Refinement** (If α < 0.70):
- Identify low-performing items
- Revise Japanese wording
- Re-validate with next 100 users

## Cultural Adaptation Notes

### Japanese Gratitude Expressions

**Key concepts used in translation**:
- **感謝 (kansha)**: Gratitude, thankfulness
- **恵み (megumi)**: Blessings, grace
- **感謝深い (kansha-bukai)**: Grateful (character trait)
- **感謝の念 (kansha no nen)**: Sense of gratitude

**Translation choices**:
- Item 1: "Express thanks" → "感謝の気持ちを伝える" (convey feelings of gratitude)
  - Natural Japanese phrasing for expressing gratitude

- Item 2: "Richly blessed" → "豊かな恵みを受けてきた" (have received abundant blessings)
  - "恵み" is culturally appropriate, avoiding overly religious connotations

- Item 3: "Count my blessings" → "恵まれている点を数える" (count the ways I am blessed)
  - Adapted idiom to natural Japanese expression

- Item 7 (reverse): "Do not see the need" → "必要を感じない" (do not feel the necessity)
  - Direct but natural Japanese negative expression

### Validation Against Cultural Norms

Japanese culture highly values gratitude:
- **お陰様で (okagesama de)**: "Thanks to you/others" (common phrase)
- **恩 (on)**: Debt of gratitude (cultural concept)
- **謙虚 (kenkyo)**: Humility intertwined with gratitude

**Expectation**: Japanese sample may score slightly higher on average due to cultural emphasis on gratitude expression.

## Sources

### English Items
- [IPIP-VIA Character Strengths](https://ipip.ori.org/newVIAKey.htm)

### VIA Framework
- Peterson, C., & Seligman, M. E. P. (2004). *Character Strengths and Virtues: A Handbook and Classification*. Oxford University Press.

### Cultural Research
- Shimai, S., Otake, K., Park, N., Peterson, C., & Seligman, M. E. P. (2006). Convergence of character strengths in American and Japanese young adults. *Journal of Happiness Studies*, 7, 311-322.

---

**Date Generated**: 2026-01-19
**Generated by**: academic-psychtest-research skill (Phase 3)
