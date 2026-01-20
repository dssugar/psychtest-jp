# Phase 3: Rosenberg Self-Esteem Scale - Items Extraction

## Items (Japanese Version - Yamamoto et al., 1982)

```json
{
  "scale": "rosenberg",
  "fullName": "Rosenberg Self-Esteem Scale",
  "abbreviation": "RSES",
  "questions": [
    {
      "id": 1,
      "text": "少なくとも人並みには、価値のある人間である。",
      "english": "On the whole, I am satisfied with myself.",
      "reverse": false,
      "dimension": "self-worth"
    },
    {
      "id": 2,
      "text": "いろいろな良い素質をもっている。",
      "english": "I feel that I have a number of good qualities.",
      "reverse": false,
      "dimension": "self-worth"
    },
    {
      "id": 3,
      "text": "敗北者だと思うことがある。",
      "english": "All in all, I am inclined to feel that I am a failure.",
      "reverse": true,
      "dimension": "self-derogation"
    },
    {
      "id": 4,
      "text": "物事を人並みには、うまくやれる。",
      "english": "I am able to do things as well as most other people.",
      "reverse": false,
      "dimension": "self-worth"
    },
    {
      "id": 5,
      "text": "自分には、自慢できるところがあまりない。",
      "english": "I feel I do not have much to be proud of.",
      "reverse": true,
      "dimension": "self-derogation"
    },
    {
      "id": 6,
      "text": "自分に対して肯定的である。",
      "english": "I take a positive attitude toward myself.",
      "reverse": false,
      "dimension": "self-worth"
    },
    {
      "id": 7,
      "text": "だいたいにおいて、自分に満足している。",
      "english": "On the whole, I am satisfied with myself.",
      "reverse": false,
      "dimension": "self-worth"
    },
    {
      "id": 8,
      "text": "もっと自分自身を尊敬できるようになりたい。",
      "english": "I wish I could have more respect for myself.",
      "reverse": true,
      "dimension": "self-derogation"
    },
    {
      "id": 9,
      "text": "自分は全くだめな人間だと思うことがある。",
      "english": "I certainly feel useless at times.",
      "reverse": true,
      "dimension": "self-derogation"
    },
    {
      "id": 10,
      "text": "何かにつけて、自分は役に立たない人間だと思う。",
      "english": "At times I think I am no good at all.",
      "reverse": true,
      "dimension": "self-derogation"
    }
  ],
  "scaleLabels": [
    "まったくそう思わない",
    "そう思わない",
    "そう思う",
    "非常にそう思う"
  ],
  "scoring": {
    "min": 10,
    "max": 40,
    "neutral": 25,
    "cutoffs": {
      "very_low": {
        "range": [10, 14],
        "label": "非常に低い自尊心",
        "labelEn": "Very Low Self-Esteem"
      },
      "low": {
        "range": [15, 19],
        "label": "低い自尊心",
        "labelEn": "Low Self-Esteem"
      },
      "medium": {
        "range": [20, 29],
        "label": "平均的な自尊心",
        "labelEn": "Medium Self-Esteem"
      },
      "high": {
        "range": [30, 34],
        "label": "高い自尊心",
        "labelEn": "High Self-Esteem"
      },
      "very_high": {
        "range": [35, 40],
        "label": "非常に高い自尊心",
        "labelEn": "Very High Self-Esteem"
      }
    },
    "reverseItems": [3, 5, 8, 9, 10],
    "reverseFormula": "5 - answer"
  },
  "license": "Public Domain / Free to Use"
}
```

## Response Format

- **Type**: 4-point Likert scale
- **Score Range**: 1-4 per item
- **Total Range**: 10-40 points
- **Scoring Direction**: Higher scores = Higher self-esteem

### Scale Labels (Japanese):
1. まったくそう思わない (Strongly Disagree)
2. そう思わない (Disagree)
3. そう思う (Agree)
4. 非常にそう思う (Strongly Agree)

## Reverse Items

**5 items require reverse scoring** (Items 3, 5, 8, 9, 10)

### Reverse Items (Negatively Worded):
- **Item 3**: 敗北者だと思うことがある。
- **Item 5**: 自分には、自慢できるところがあまりない。
- **Item 8**: もっと自分自身を尊敬できるようになりたい。
- **Item 9**: 自分は全くだめな人間だと思うことがある。
- **Item 10**: 何かにつけて、自分は役に立たない人間だと思う。

### Reverse Scoring Formula:
```
Reversed Score = 5 - Original Answer
```

**Example**:
- Original answer: 4 (非常にそう思う) → Reversed score: 1
- Original answer: 1 (まったくそう思わない) → Reversed score: 4

## Cutoff Values

### Level Classification:

| Level | Range | Label (Japanese) | Label (English) | Interpretation |
|-------|-------|------------------|-----------------|----------------|
| Very Low | 10-14 | 非常に低い自尊心 | Very Low Self-Esteem | 自尊心が著しく低い状態。専門家への相談推奨 |
| Low | 15-19 | 低い自尊心 | Low Self-Esteem | 自尊心が低い状態。セルフケアと支援が有益 |
| Medium | 20-29 | 平均的な自尊心 | Medium Self-Esteem | 平均的な自尊心。多くの人がこの範囲 |
| High | 30-34 | 高い自尊心 | High Self-Esteem | 高い自尊心。精神的健康の基盤 |
| Very High | 35-40 | 非常に高い自尊心 | Very High Self-Esteem | 非常に高い自尊心。強い自己価値感 |

### Distribution:
- **Mean**: ~20-25 (population average)
- **Standard Deviation**: ~5-6 points
- **Median**: ~25 points

## Two-Factor Structure

While the scale is primarily **uni-dimensional**, factor analysis often reveals a two-factor structure based on item wording:

### Factor 1: Self-Worth (Positively Worded)
- Items: 1, 2, 4, 6, 7
- Measures: Positive self-evaluation, self-acceptance

### Factor 2: Self-Derogation (Negatively Worded - Reversed)
- Items: 3, 5, 8, 9, 10
- Measures: Self-criticism, negative self-view

**Note**: This two-factor structure reflects **method effects** (response patterns to positive vs. negative wording) rather than distinct psychological constructs. The scale should be interpreted as measuring a single construct: **global self-esteem**.

## Psychometric Note

### Reverse Item Handling:
The 5 reverse items (negatively worded) are designed to:
1. Reduce acquiescence bias (tendency to agree with all items)
2. Ensure respondents read each item carefully
3. Provide balanced measurement of self-esteem

### Administration Note:
Respondents should be instructed to respond honestly to each item, as some items are worded positively and others negatively.

## License

✅ **Public Domain / Free to Use**

No permission required for research, clinical, or commercial use. The scale is freely available worldwide.

---

**Document Created**: 2026-01-20
**Status**: ✅ Phase 3 Complete - Items Extracted
**Next Step**: Phase 3.5 - Literature Deep Dive (NEW)
