# Phase 3: IPIP-NEO-120 Items Data

## Implementation Status

### ✅ すでに実装済み

**ファイル**: `data/bigfive-questions.ts`
**実装日**: 2026-01-18以前
**ソース**: @alheimsins/b5-johnson-120-ipip-neo-pi-r (Japanese translation)

## Items Overview

**Total Items**: 120
**Dimensions**: 5 (各24項目)
**Facets**: 30 (各4項目)
**Reverse Items**: 55 (45.8%)
**Normal Items**: 65 (54.2%)

## Response Format

**Type**: 5-point Likert scale
**Score Range**: 1-5 per item
**Total Range**:
- **Domains**: 24-120 points each
- **Facets**: 4-20 points each

### Scale Labels (Japanese)

```json
{
  "scaleOptions": [
    {"label": "まったく当てはまらない", "value": 1},
    {"label": "あまり当てはまらない", "value": 2},
    {"label": "どちらとも言えない", "value": 3},
    {"label": "やや当てはまる", "value": 4},
    {"label": "とても当てはまる", "value": 5}
  ]
}
```

## 30 Facets Structure

### Neuroticism (N) - 神経症傾向

| Facet Code | Facet Name | Japanese | Items | Reverse |
|------------|------------|----------|-------|---------|
| N1 | n1_anxiety | 不安 | Q1, 31, 61, 91 | 0 reverse |
| N2 | n2_anger | 怒り | Q6, 36, 66, 96 | 1 reverse |
| N3 | n3_depression | 抑うつ | Q11, 41, 71, 101 | 1 reverse |
| N4 | n4_selfConsciousness | 自意識過剰 | Q16, 46, 76, 106 | 1 reverse |
| N5 | n5_immoderation | 衝動性 | Q21, 51, 81, 111 | 3 reverse |
| N6 | n6_vulnerability | 脆弱性 | Q26, 56, 86, 116 | 1 reverse |

### Extraversion (E) - 外向性

| Facet Code | Facet Name | Japanese | Items | Reverse |
|------------|------------|----------|-------|---------|
| E1 | e1_friendliness | 親しみやすさ | Q2, 32, 62, 92 | 2 reverse |
| E2 | e2_gregariousness | 社交性 | Q7, 37, 67, 97 | 2 reverse |
| E3 | e3_assertiveness | 自己主張 | Q12, 42, 72, 102 | 1 reverse |
| E4 | e4_activityLevel | 活動性 | Q17, 47, 77, 107 | 1 reverse |
| E5 | e5_excitementSeeking | 刺激追求 | Q22, 52, 82, 112 | 0 reverse |
| E6 | e6_cheerfulness | 陽気さ | Q27, 57, 87, 117 | 0 reverse |

### Openness (O) - 開放性

| Facet Code | Facet Name | Japanese | Items | Reverse |
|------------|------------|----------|-------|---------|
| O1 | o1_imagination | 想像力 | Q3, 33, 63, 93 | 0 reverse |
| O2 | o2_artisticInterests | 芸術的関心 | Q8, 38, 68, 98 | 2 reverse |
| O3 | o3_emotionality | 感情性 | Q13, 43, 73, 103 | 2 reverse |
| O4 | o4_adventurousness | 冒険心 | Q18, 48, 78, 108 | 3 reverse |
| O5 | o5_intellect | 知性 | Q23, 53, 83, 113 | 3 reverse |
| O6 | o6_liberalism | リベラリズム | Q28, 58, 88, 118 | 2 reverse |

### Agreeableness (A) - 協調性

| Facet Code | Facet Name | Japanese | Items | Reverse |
|------------|------------|----------|-------|---------|
| A1 | a1_trust | 信頼 | Q4, 34, 64, 94 | 1 reverse |
| A2 | a2_morality | 道徳性 | Q9, 39, 69, 99 | 4 reverse |
| A3 | a3_altruism | 利他性 | Q14, 44, 74, 104 | 2 reverse |
| A4 | a4_cooperation | 協力 | Q19, 49, 79, 109 | 4 reverse |
| A5 | a5_modesty | 謙虚さ | Q24, 54, 84, 114 | 4 reverse |
| A6 | a6_sympathy | 共感 | Q29, 59, 89, 119 | 2 reverse |

### Conscientiousness (C) - 誠実性

| Facet Code | Facet Name | Japanese | Items | Reverse |
|------------|------------|----------|-------|---------|
| C1 | c1_selfEfficacy | 自己効力感 | Q5, 35, 65, 95 | 0 reverse |
| C2 | c2_orderliness | 秩序性 | Q10, 40, 70, 100 | 3 reverse |
| C3 | c3_dutifulness | 誠実さ | Q15, 45, 75, 105 | 2 reverse |
| C4 | c4_achievementStriving | 達成志向 | Q20, 50, 80, 110 | 2 reverse |
| C5 | c5_selfDiscipline | 自己統制 | Q25, 55, 85, 115 | 2 reverse |
| C6 | c6_cautiousness | 慎重性 | Q30, 60, 90, 120 | 4 reverse |

## Reverse Items Distribution

**Total Reverse Items**: 55 out of 120 (45.8%)

### By Dimension

| Dimension | Reverse Items | Percentage |
|-----------|---------------|------------|
| Neuroticism (N) | 7 out of 24 | 29.2% |
| Extraversion (E) | 6 out of 24 | 25.0% |
| Openness (O) | 12 out of 24 | 50.0% |
| Agreeableness (A) | 17 out of 24 | 70.8% |
| Conscientiousness (C) | 13 out of 24 | 54.2% |

**解釈**: Agreeable性（協調性）とOpenness（開放性）で逆転項目が多い。これは、これらの特性が社会的望ましさの影響を受けやすいため、回答バイアスを防ぐために逆転項目を多用していると考えられる。

## Scoring Logic

### Direct Items (reverse: false)
```
Score = User's response (1-5)
```

### Reverse Items (reverse: true)
```
Score = 6 - User's response
Example: If user selects 1, score = 6 - 1 = 5
         If user selects 5, score = 6 - 5 = 1
```

### Domain Scores (24-120 points)
```
Domain Score = Sum of 24 items in that dimension
```

### Facet Scores (4-20 points)
```
Facet Score = Sum of 4 items in that facet
```

## Sample Items by Dimension

### Neuroticism (N1: Anxiety)

| ID | Text (Japanese) | Text (English) | Reverse |
|----|-----------------|----------------|---------|
| 1 | 心配性だ | Worry about things | No |
| 31 | 最悪の結果を恐れがちだ | Fear for the worst | No |
| 61 | さまざまなことに対して不安がある | Am afraid of many things | No |
| 91 | ストレスを感じやすい | Get stressed out easily | No |

### Extraversion (E1: Friendliness)

| ID | Text (Japanese) | Text (English) | Reverse |
|----|-----------------|----------------|---------|
| 2 | 友達を作るのは簡単だ | Make friends easily | No |
| 32 | 人が周りにいると安心できる | Feel comfortable around people | No |
| 62 | 他人との接触を避けがちだ | Avoid contacts with others | **Yes** |
| 92 | 他人と距離をとりがちだ | Keep others at a distance | **Yes** |

### Openness (O1: Imagination)

| ID | Text (Japanese) | Text (English) | Reverse |
|----|-----------------|----------------|---------|
| 3 | 想像力が豊かだ | Have a vivid imagination | No |
| 33 | 自分の世界に没頭するのが好きだ | Enjoy wild flights of fantasy | No |
| 63 | 空想することが好きだ | Love to daydream | No |
| 93 | 思索に耽ることが好きだ | Like to get lost in thought | No |

### Agreeableness (A2: Morality) - 高比率の逆転項目

| ID | Text (Japanese) | Text (English) | Reverse |
|----|-----------------|----------------|---------|
| 9 | 自分のために他人を利用するほうだ | Use others for my own ends | **Yes** |
| 39 | 出世のためには不正も厭わない | Cheat to get ahead | **Yes** |
| 69 | 他人を利用しがちだ | Take advantage of others | **Yes** |
| 99 | 他人の計画を妨害しがちだ | Obstruct others' plans | **Yes** |

**Note**: A2 (Morality) は4項目すべてが逆転項目。これは、道徳性の低さを直接測定する設計。

### Conscientiousness (C6: Cautiousness) - 全て逆転項目

| ID | Text (Japanese) | Text (English) | Reverse |
|----|-----------------|----------------|---------|
| 30 | 考えなしに行動しがちだ | Jump into things without thinking | **Yes** |
| 60 | 衝動的な意思決定をしがちだ | Make rash decisions | **Yes** |
| 90 | 慌てて行動しがちだ | Rush into things | **Yes** |
| 120 | 考えなしに行動するほうだ | Act without thinking | **Yes** |

**Note**: C6 (Cautiousness) も4項目すべてが逆転項目。慎重性の欠如（衝動性）を測定。

## Full Items JSON

```json
{
  "scale": "bigfive",
  "version": "IPIP-NEO-120",
  "language": "ja",
  "totalItems": 120,
  "dimensions": {
    "neuroticism": {
      "code": "N",
      "nameJa": "神経症傾向",
      "nameEn": "Neuroticism",
      "items": 24,
      "range": [24, 120],
      "facets": [
        {"code": "N1", "name": "n1_anxiety", "nameJa": "不安", "items": [1, 31, 61, 91]},
        {"code": "N2", "name": "n2_anger", "nameJa": "怒り", "items": [6, 36, 66, 96]},
        {"code": "N3", "name": "n3_depression", "nameJa": "抑うつ", "items": [11, 41, 71, 101]},
        {"code": "N4", "name": "n4_selfConsciousness", "nameJa": "自意識過剰", "items": [16, 46, 76, 106]},
        {"code": "N5", "name": "n5_immoderation", "nameJa": "衝動性", "items": [21, 51, 81, 111]},
        {"code": "N6", "name": "n6_vulnerability", "nameJa": "脆弱性", "items": [26, 56, 86, 116]}
      ]
    },
    "extraversion": {
      "code": "E",
      "nameJa": "外向性",
      "nameEn": "Extraversion",
      "items": 24,
      "range": [24, 120],
      "facets": [
        {"code": "E1", "name": "e1_friendliness", "nameJa": "親しみやすさ", "items": [2, 32, 62, 92]},
        {"code": "E2", "name": "e2_gregariousness", "nameJa": "社交性", "items": [7, 37, 67, 97]},
        {"code": "E3", "name": "e3_assertiveness", "nameJa": "自己主張", "items": [12, 42, 72, 102]},
        {"code": "E4", "name": "e4_activityLevel", "nameJa": "活動性", "items": [17, 47, 77, 107]},
        {"code": "E5", "name": "e5_excitementSeeking", "nameJa": "刺激追求", "items": [22, 52, 82, 112]},
        {"code": "E6", "name": "e6_cheerfulness", "nameJa": "陽気さ", "items": [27, 57, 87, 117]}
      ]
    },
    "openness": {
      "code": "O",
      "nameJa": "開放性",
      "nameEn": "Openness to Experience",
      "items": 24,
      "range": [24, 120],
      "facets": [
        {"code": "O1", "name": "o1_imagination", "nameJa": "想像力", "items": [3, 33, 63, 93]},
        {"code": "O2", "name": "o2_artisticInterests", "nameJa": "芸術的関心", "items": [8, 38, 68, 98]},
        {"code": "O3", "name": "o3_emotionality", "nameJa": "感情性", "items": [13, 43, 73, 103]},
        {"code": "O4", "name": "o4_adventurousness", "nameJa": "冒険心", "items": [18, 48, 78, 108]},
        {"code": "O5", "name": "o5_intellect", "nameJa": "知性", "items": [23, 53, 83, 113]},
        {"code": "O6", "name": "o6_liberalism", "nameJa": "リベラリズム", "items": [28, 58, 88, 118]}
      ]
    },
    "agreeableness": {
      "code": "A",
      "nameJa": "協調性",
      "nameEn": "Agreeableness",
      "items": 24,
      "range": [24, 120],
      "facets": [
        {"code": "A1", "name": "a1_trust", "nameJa": "信頼", "items": [4, 34, 64, 94]},
        {"code": "A2", "name": "a2_morality", "nameJa": "道徳性", "items": [9, 39, 69, 99]},
        {"code": "A3", "name": "a3_altruism", "nameJa": "利他性", "items": [14, 44, 74, 104]},
        {"code": "A4", "name": "a4_cooperation", "nameJa": "協力", "items": [19, 49, 79, 109]},
        {"code": "A5", "name": "a5_modesty", "nameJa": "謙虚さ", "items": [24, 54, 84, 114]},
        {"code": "A6", "name": "a6_sympathy", "nameJa": "共感", "items": [29, 59, 89, 119]}
      ]
    },
    "conscientiousness": {
      "code": "C",
      "nameJa": "誠実性",
      "nameEn": "Conscientiousness",
      "items": 24,
      "range": [24, 120],
      "facets": [
        {"code": "C1", "name": "c1_selfEfficacy", "nameJa": "自己効力感", "items": [5, 35, 65, 95]},
        {"code": "C2", "name": "c2_orderliness", "nameJa": "秩序性", "items": [10, 40, 70, 100]},
        {"code": "C3", "name": "c3_dutifulness", "nameJa": "誠実さ", "items": [15, 45, 75, 105]},
        {"code": "C4", "name": "c4_achievementStriving", "nameJa": "達成志向", "items": [20, 50, 80, 110]},
        {"code": "C5", "name": "c5_selfDiscipline", "nameJa": "自己統制", "items": [25, 55, 85, 115]},
        {"code": "C6", "name": "c6_cautiousness", "nameJa": "慎重性", "items": [30, 60, 90, 120]}
      ]
    }
  },
  "scaleLabels": [
    {"value": 1, "label": "まったく当てはまらない"},
    {"value": 2, "label": "あまり当てはまらない"},
    {"value": 3, "label": "どちらとも言えない"},
    {"value": 4, "label": "やや当てはまる"},
    {"value": 5, "label": "とても当てはまる"}
  ],
  "scoring": {
    "perItem": {
      "min": 1,
      "max": 5
    },
    "perDomain": {
      "min": 24,
      "max": 120,
      "neutral": 72
    },
    "perFacet": {
      "min": 4,
      "max": 20,
      "neutral": 12
    },
    "reverseScoring": "6 - response",
    "reverseItems": 55
  },
  "license": "Public Domain (IPIP Project)",
  "source": "@alheimsins/b5-johnson-120-ipip-neo-pi-r"
}
```

## Implementation Files

### Current Implementation

1. **Questions**: `data/bigfive-questions.ts`
   - All 120 items with Japanese + English text
   - Dimension, facet, reverse flags

2. **Scoring**: `lib/tests/bigfive.ts`
   - `calculateBigFiveScore()`: Main scoring function
   - Reverse item handling: `score = question.reverse ? 6 - answer : answer`
   - Domain aggregation: Sum of 24 items
   - Facet aggregation: Sum of 4 items

3. **Configuration**: `lib/tests/bigfive.ts`
   - `bigFiveConfig`: TestConfig object
   - Scale info, options, validation

## Quality Check

### ✅ All Items Verified

- [x] 120 items total
- [x] 30 facets (4 items each)
- [x] 5 domains (24 items each)
- [x] 55 reverse items correctly flagged
- [x] Japanese translation from @alheimsins package
- [x] English reference text included

### ✅ Scoring Logic Verified

- [x] 5-point Likert scale (1-5)
- [x] Reverse scoring: `6 - answer`
- [x] Domain range: 24-120
- [x] Facet range: 4-20
- [x] Neutral point: 72 (domains), 12 (facets)

---

## Sources

- [IPIP-NEO-120 Items (Official)](https://ipip.ori.org/30FacetNEO-PI-RItems.htm)
- [@alheimsins/b5-johnson-120-ipip-neo-pi-r (npm)](https://www.npmjs.com/package/@alheimsins/b5-johnson-120-ipip-neo-pi-r)
- [GitHub Repository](https://github.com/Alheimsins/b5-johnson-120-ipip-neo-pi-r)
- Current implementation: `data/bigfive-questions.ts`, `lib/tests/bigfive.ts`
