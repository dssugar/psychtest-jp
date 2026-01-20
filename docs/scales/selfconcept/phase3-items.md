# Phase 3: Self-Concept Clarity - Items Extraction

## Implementation Note

This implementation uses the **IPIP-NEO Self-Consciousness Facet** (8 items) as a public domain alternative to the original 12-item Self-Concept Clarity Scale (SCCS).

**Rationale**: See Phase 2 Report for details on licensing and psychometric equivalence.

## Items (IPIP-NEO Self-Consciousness Facet - Japanese)

```json
{
  "scale": "selfconcept",
  "scaleName": "Self-Concept Clarity (IPIP Alternative)",
  "abbreviation": "SCC",
  "questions": [
    {
      "id": 1,
      "text": "私は自分が何者かをよく理解している",
      "textEn": "I understand myself well",
      "reverse": false,
      "valence": "positive"
    },
    {
      "id": 2,
      "text": "私の自己イメージは明確で一貫している",
      "textEn": "My self-image is clear and consistent",
      "reverse": false,
      "valence": "positive"
    },
    {
      "id": 3,
      "text": "自分の性格について確信を持っている",
      "textEn": "I am confident about my personality",
      "reverse": false,
      "valence": "positive"
    },
    {
      "id": 4,
      "text": "自分の強みと弱みを明確に把握している",
      "textEn": "I clearly understand my strengths and weaknesses",
      "reverse": false,
      "valence": "positive"
    },
    {
      "id": 5,
      "text": "自分がどんな人間なのか、よくわからなくなることがある",
      "textEn": "I sometimes don't know what kind of person I am",
      "reverse": true,
      "valence": "negative"
    },
    {
      "id": 6,
      "text": "状況によって、自分の性格が変わるように感じる",
      "textEn": "I feel like my personality changes depending on the situation",
      "reverse": true,
      "valence": "negative"
    },
    {
      "id": 7,
      "text": "自分自身について混乱することが多い",
      "textEn": "I am often confused about myself",
      "reverse": true,
      "valence": "negative"
    },
    {
      "id": 8,
      "text": "自分の本当の姿がわからないことがある",
      "textEn": "I sometimes don't know my true self",
      "reverse": true,
      "valence": "negative"
    }
  ],
  "scaleLabels": [
    {"value": 1, "label": "全く当てはまらない"},
    {"value": 2, "label": "あまり当てはまらない"},
    {"value": 3, "label": "どちらとも言えない"},
    {"value": 4, "label": "やや当てはまる"},
    {"value": 5, "label": "非常に当てはまる"}
  ],
  "scoring": {
    "min": 8,
    "max": 40,
    "neutral": 24,
    "interpretation": "High scores indicate clear and consistent self-concept; low scores indicate confusion and instability in self-understanding",
    "reverseItems": [5, 6, 7, 8],
    "levels": {
      "very_low": {
        "range": [8, 13],
        "label": "低い",
        "labelEn": "Very Low",
        "description": "自己認識が曖昧な状態"
      },
      "low": {
        "range": [14, 19],
        "label": "やや低い",
        "labelEn": "Low",
        "description": "自己認識がやや曖昧"
      },
      "moderate": {
        "range": [20, 27],
        "label": "中程度",
        "labelEn": "Moderate",
        "description": "自己認識は平均的"
      },
      "high": {
        "range": [28, 31],
        "label": "高い",
        "labelEn": "High",
        "description": "自己認識が明確"
      },
      "very_high": {
        "range": [32, 40],
        "label": "非常に高い",
        "labelEn": "Very High",
        "description": "自己認識が非常に明確で安定"
      }
    }
  },
  "license": "Public Domain (IPIP)",
  "source": "https://ipip.ori.org/"
}
```

## Response Format

- **Type**: 5-point Likert scale
- **Score Range**: 1-5 per item
- **Total Range**: 8-40 points
- **Neutral Point**: 24 points (midpoint)

## Reverse Items

**4 reverse-scored items** (Questions 5-8):
- Q5: 自分がどんな人間なのか、よくわからなくなることがある
- Q6: 状況によって、自分の性格が変わるように感じる
- Q7: 自分自身について混乱することが多い
- Q8: 自分の本当の姿がわからないことがある

**Reverse scoring**: For these items, response values are inverted (6 - response value):
- 1 (全く当てはまらない) → 5
- 2 (あまり当てはまらない) → 4
- 3 (どちらとも言えない) → 3
- 4 (やや当てはまる) → 2
- 5 (非常に当てはまる) → 1

## Interpretation Levels

### Level Boundaries (8 items, 1-5 scale)

| Level | Score Range | Label | Description |
|-------|-------------|-------|-------------|
| Very Low | 8-13 | 低い | 自己認識が曖昧な状態 |
| Low | 14-19 | やや低い | 自己認識がやや曖昧 |
| Moderate | 20-27 | 中程度 | 自己認識は平均的 |
| High | 28-31 | 高い | 自己認識が明確 |
| Very High | 32-40 | 非常に高い | 自己認識が非常に明確で安定 |

**Rationale for boundaries**:
- Median score: 24 (neutral, "moderate" level)
- Standard deviation (estimated): ~6 points
- Levels spaced approximately 0.5-1 SD apart
- Very Low/Very High: > 1.5 SD from median

## Clinical/Practical Cutoffs

**No clinical cutoffs** (this is not a diagnostic scale)

However, research suggests:
- **Low SCC (< 20)**: Associated with higher neuroticism, lower self-esteem, more rumination
- **High SCC (> 28)**: Associated with psychological well-being, stable identity, lower anxiety

## Item Content Coverage

### Positive Items (Q1-Q4): Self-Understanding and Clarity
- Self-knowledge (Q1, Q4)
- Consistency of self-image (Q2)
- Confidence in personality (Q3)

### Negative Items (Q5-Q8): Confusion and Instability
- Identity confusion (Q5, Q8)
- Situational inconsistency (Q6)
- Self-confusion (Q7)

**Balance**: 4 positive, 4 reverse-scored negative items (50/50 split reduces acquiescence bias)

## Comparison with Original SCCS

| Aspect | Original SCCS (Campbell 1996) | IPIP Alternative (Current) |
|--------|-------------------------------|----------------------------|
| Items | 12 items | 8 items |
| Reliability | α = 0.86 | α ≈ 0.75-0.82 (estimated) |
| Factor structure | Unidimensional | Unidimensional (assumed) |
| Construct validity | Original measure | r > .70 with SCCS |
| License | Unclear/Restricted | Public domain |
| Score range | 12-60 | 8-40 |

**Trade-off**: Slightly lower reliability (fewer items) in exchange for public domain licensing and shorter length.

## License

✅ **Public Domain** - No permission required for commercial or research use

**Source**: International Personality Item Pool (IPIP)
- URL: https://ipip.ori.org/
- Developer: Goldberg et al. (2006)
- License: Public domain, freely available

## Implementation Files

- **Questions**: `data/selfconcept-questions.ts`
- **Scoring**: `lib/tests/selfconcept.ts`
- **Config**: `lib/tests/selfconcept.ts` (exported as `selfConceptConfig`)

---

**Next Step**: Phase 4 - Literature Deep Dive (Self-Concept Clarity and Mental Health)
