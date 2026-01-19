# Phase 3: MAAS Items Extraction

## Scale Information

- **Scale Name**: Mindful Attention Awareness Scale (MAAS)
- **Abbreviation**: MAAS
- **Items**: 15
- **Response Format**: 6-point Likert scale
- **Language Versions**: English (original), Japanese (validated)

## Items (Japanese Version)

⚠️ **Important**: The Japanese items below are compiled from published sources. For commercial implementation, confirm exact wording from Fujino et al. (2015) original publication.

**Reference**: 藤野正寛・梶村昇吾・野村理朗 (2015). 日本語版Mindful Attention Awareness Scaleの開発および項目反応理論による検討. パーソナリティ研究, 24(1), 61-76.

### 15 Japanese Items:

1. その時の感情に後から気づくことがある
2. 不注意や考え事が原因でモノを壊したりこぼしたりする
3. 今起きていることに集中することが難しいと感じる
4. 歩いて目的地に向かう際、道中の体験に注意を払わずにさっさと向かう
5. 身体的な緊張や不快感が明確になるまで、なかなかそれに気づかないことがある
6. 初めて聞く人の名前を忘れがちである
7. 自分のしていることをあまり意識しないまま、自動的に何かをしているような気がする
8. 達成したい目標のことばかりを意識してしまい、今していることに意識が向かなくなる
9. 十分な注意を払わずに、急いで行動してしまう
10. 自分のしていることを意識しないまま、機械的に仕事や課題を行っている気がする
11. 人の話を聞きながら、気づいたら何か他のことをしていることがある
12. 無意識のうちにどこかに向かっていて、あとから考えるとどうやってそこにたどり着いたか思い出せないことがある
13. 気がつくと将来や過去のことで頭がいっぱいになっている
14. 気がつくと注意を払わずに物事に取り組んでいることがある
15. 無意識のうちに間食をしていることがある

## Items (English Original)

**Reference**: Brown, K.W., & Ryan, R.M. (2003). The benefits of being present: Mindfulness and its role in psychological well-being. *Journal of Personality and Social Psychology*, 84(4), 822-848.

### 15 English Items:

1. I could be experiencing some emotion and not be conscious of it until some time later.
2. I break or spill things because of carelessness, not paying attention, or thinking of something else.
3. I find it difficult to stay focused on what's happening in the present.
4. I tend to walk quickly to get where I'm going without paying attention to what I experience along the way.
5. I tend not to notice feelings of physical tension or discomfort until they really grab my attention.
6. I forget a person's name almost as soon as I've been told it for the first time.
7. It seems I am "running on automatic," without much awareness of what I'm doing.
8. I get so focused on the goal I want to achieve that I lose touch with what I'm doing right now to get there.
9. I rush through activities without being really attentive to them.
10. I do jobs or tasks automatically, without being aware of what I'm doing.
11. I find myself listening to someone with one ear, doing something else at the same time.
12. I drive places on 'automatic pilot' and then wonder why I went there.
13. I find myself preoccupied with the future or the past.
14. I find myself doing things without paying attention.
15. I snack without being aware that I'm eating.

## JSON Data Format

```json
{
  "scale": "maas",
  "fullName": "Mindful Attention Awareness Scale",
  "abbreviation": "MAAS",
  "language": "ja",
  "version": "Fujino et al. (2015)",
  "items": 15,
  "questions": [
    {
      "id": 1,
      "text": "その時の感情に後から気づくことがある",
      "reverse": false,
      "english": "I could be experiencing some emotion and not be conscious of it until some time later."
    },
    {
      "id": 2,
      "text": "不注意や考え事が原因でモノを壊したりこぼしたりする",
      "reverse": false,
      "english": "I break or spill things because of carelessness, not paying attention, or thinking of something else."
    },
    {
      "id": 3,
      "text": "今起きていることに集中することが難しいと感じる",
      "reverse": false,
      "english": "I find it difficult to stay focused on what's happening in the present."
    },
    {
      "id": 4,
      "text": "歩いて目的地に向かう際、道中の体験に注意を払わずにさっさと向かう",
      "reverse": false,
      "english": "I tend to walk quickly to get where I'm going without paying attention to what I experience along the way."
    },
    {
      "id": 5,
      "text": "身体的な緊張や不快感が明確になるまで、なかなかそれに気づかないことがある",
      "reverse": false,
      "english": "I tend not to notice feelings of physical tension or discomfort until they really grab my attention."
    },
    {
      "id": 6,
      "text": "初めて聞く人の名前を忘れがちである",
      "reverse": false,
      "english": "I forget a person's name almost as soon as I've been told it for the first time."
    },
    {
      "id": 7,
      "text": "自分のしていることをあまり意識しないまま、自動的に何かをしているような気がする",
      "reverse": false,
      "english": "It seems I am \"running on automatic,\" without much awareness of what I'm doing."
    },
    {
      "id": 8,
      "text": "達成したい目標のことばかりを意識してしまい、今していることに意識が向かなくなる",
      "reverse": false,
      "english": "I get so focused on the goal I want to achieve that I lose touch with what I'm doing right now to get there."
    },
    {
      "id": 9,
      "text": "十分な注意を払わずに、急いで行動してしまう",
      "reverse": false,
      "english": "I rush through activities without being really attentive to them."
    },
    {
      "id": 10,
      "text": "自分のしていることを意識しないまま、機械的に仕事や課題を行っている気がする",
      "reverse": false,
      "english": "I do jobs or tasks automatically, without being aware of what I'm doing."
    },
    {
      "id": 11,
      "text": "人の話を聞きながら、気づいたら何か他のことをしていることがある",
      "reverse": false,
      "english": "I find myself listening to someone with one ear, doing something else at the same time."
    },
    {
      "id": 12,
      "text": "無意識のうちにどこかに向かっていて、あとから考えるとどうやってそこにたどり着いたか思い出せないことがある",
      "reverse": false,
      "english": "I drive places on 'automatic pilot' and then wonder why I went there."
    },
    {
      "id": 13,
      "text": "気がつくと将来や過去のことで頭がいっぱいになっている",
      "reverse": false,
      "english": "I find myself preoccupied with the future or the past."
    },
    {
      "id": 14,
      "text": "気がつくと注意を払わずに物事に取り組んでいることがある",
      "reverse": false,
      "english": "I find myself doing things without paying attention."
    },
    {
      "id": 15,
      "text": "無意識のうちに間食をしていることがある",
      "reverse": false,
      "english": "I snack without being aware that I'm eating."
    }
  ],
  "scaleLabels": [
    "ほとんど常にある",
    "とても頻繁にある",
    "やや頻繁にある",
    "あまりない",
    "めったにない",
    "ほとんど全くない"
  ],
  "scaleLabelsEnglish": [
    "Almost Always",
    "Very Frequently",
    "Somewhat Frequently",
    "Somewhat Infrequently",
    "Very Infrequently",
    "Almost Never"
  ],
  "scoring": {
    "method": "mean",
    "min": 1.0,
    "max": 6.0,
    "reverseItems": [],
    "interpretation": "Higher scores indicate greater mindfulness (more awareness and attention to present moment)",
    "note": "All items measure lack of mindfulness (mindlessness), so raw responses are NOT reverse-scored. Higher numerical response (6 = Almost Never) indicates less mindlessness = more mindfulness."
  },
  "license": {
    "academic": "Free to use",
    "commercial": "Requires permission from Center for Self-Determination Theory",
    "source": "https://selfdeterminationtheory.org/mindfulness-attention-awareness/"
  }
}
```

## Response Format

### Scale Type
- **6-point Likert scale** (6件法)
- **Scoring**: 1-6 per item
- **Total Range**: 1.0-6.0 (mean score)

### Japanese Response Options

| Value | Label | Meaning |
|-------|-------|---------|
| 1 | ほとんど常にある | Almost Always |
| 2 | とても頻繁にある | Very Frequently |
| 3 | やや頻繁にある | Somewhat Frequently |
| 4 | あまりない | Somewhat Infrequently |
| 5 | めったにない | Very Infrequently |
| 6 | ほとんど全くない | Almost Never |

## Reverse Items

**Important**: ❌ **No reverse coding needed**

All 15 items are worded to measure **lack of mindfulness** (mindlessness/inattention). The response scale is structured such that:
- Low values (1-2) = High frequency of mindlessness = **Low mindfulness**
- High values (5-6) = Low frequency of mindlessness = **High mindfulness**

Therefore, the mean of raw responses directly represents mindfulness level (higher = better).

## Scoring Instructions

1. **Calculate Mean**: Sum all 15 item responses and divide by 15
   - Formula: `Total Score = (Item1 + Item2 + ... + Item15) / 15`

2. **Score Range**: 1.0 to 6.0

3. **Interpretation**:
   - **1.0-2.9**: Low mindfulness (frequent mindlessness)
   - **3.0-4.4**: Moderate mindfulness
   - **4.5-6.0**: High mindfulness (infrequent mindlessness)

4. **No Cutoffs**: MAAS is a continuous measure without clinical cutoffs (unlike PHQ-9/GAD-7)

## Interpretation Levels

For Phase 4 interpretation content, we will use **5 levels**:

1. **Very Low (1.0-2.4)**: かなり低い
2. **Low (2.5-3.4)**: 低い
3. **Moderate (3.5-4.4)**: 中程度
4. **High (4.5-5.4)**: 高い
5. **Very High (5.5-6.0)**: 非常に高い

## Implementation Notes

### For TypeScript Implementation

```typescript
// All items use the same 6-point scale
const scaleLabels = [
  "ほとんど常にある",
  "とても頻繁にある",
  "やや頻繁にある",
  "あまりない",
  "めったにない",
  "ほとんど全くない"
];

// No reverse items - all measure mindlessness
const reverseItems: number[] = [];

// Scoring function
function calculateMAAS(responses: number[]): number {
  const sum = responses.reduce((a, b) => a + b, 0);
  return sum / responses.length; // Mean score
}

// Interpretation
function interpretMAAS(score: number): string {
  if (score < 2.5) return "very-low";
  if (score < 3.5) return "low";
  if (score < 4.5) return "moderate";
  if (score < 5.5) return "high";
  return "very-high";
}
```

### Validation

- ✅ 15 items confirmed
- ✅ 6-point Likert scale
- ✅ All items measure mindlessness (no reverse coding)
- ✅ Mean scoring method
- ✅ Continuous scale (no cutoffs)
- ✅ Japanese version validated (Fujino et al., 2015)

## Sources

### Japanese Items
- [Note.com - 日常的なマインドフルネスを測る指標MAASの15つの質問](https://note.com/ryuwryyy/n/n63dfc34d7595)
- [Note.com - マインドフルネス度合いの尺度（MAAS）](https://note.com/nicoful25/n/n98e5370749f0)
- [青山学院大学 Well-Being研究 - Mindfulness](https://www.cc.aoyama.ac.jp/~well-being/mindfulness/index.html)

### English Items
- [Positive Psychology - MAAS](https://positivepsychology.com/mindful-attention-awareness-scale-maas/)
- [Self-Determination Theory - MAAS](https://selfdeterminationtheory.org/mindfulness-attention-awareness/)

### Official Validation
藤野正寛・梶村昇吾・野村理朗 (2015). [日本語版Mindful Attention Awareness Scaleの開発および項目反応理論による検討](https://www.jstage.jst.go.jp/article/personality/24/1/24_61/_article/-char/ja/). パーソナリティ研究, 24(1), 61-76.

---

**Date Generated**: 2026-01-19
**Generated by**: academic-psychtest-research skill (Phase 3)
