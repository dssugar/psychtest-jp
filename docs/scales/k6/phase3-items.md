# Phase 3: K6 Items Extraction

## Items (Japanese Version)

### Instruction Text
**過去30日の間に、どれくらいの頻度で次のことがありましたか。**

### Complete Items List

```json
{
  "scale": "k6",
  "fullName": "Kessler Psychological Distress Scale",
  "abbreviation": "K6",
  "version": "Japanese (Furukawa et al., 2008)",
  "items": 6,
  "timeframe": "過去30日間",
  "questions": [
    {
      "id": 1,
      "text": "神経過敏に感じましたか",
      "englishOriginal": "During the past 30 days, about how often did you feel nervous?",
      "reverse": false,
      "domain": "anxiety"
    },
    {
      "id": 2,
      "text": "絶望的だと感じましたか",
      "englishOriginal": "During the past 30 days, about how often did you feel hopeless?",
      "reverse": false,
      "domain": "depression"
    },
    {
      "id": 3,
      "text": "そわそわ、落ち着かなく感じましたか",
      "englishOriginal": "During the past 30 days, about how often did you feel restless or fidgety?",
      "reverse": false,
      "domain": "anxiety"
    },
    {
      "id": 4,
      "text": "気分が沈み込んで、何が起こっても気が晴れないように感じましたか",
      "englishOriginal": "During the past 30 days, about how often did you feel so depressed that nothing could cheer you up?",
      "reverse": false,
      "domain": "depression"
    },
    {
      "id": 5,
      "text": "何をするのも骨折りだと感じましたか",
      "englishOriginal": "During the past 30 days, about how often did you feel that everything was an effort?",
      "reverse": false,
      "domain": "fatigue"
    },
    {
      "id": 6,
      "text": "自分は価値のない人間だと感じましたか",
      "englishOriginal": "During the past 30 days, about how often did you feel worthless?",
      "reverse": false,
      "domain": "self-worth"
    }
  ],
  "responseOptions": [
    {
      "value": 0,
      "label": "まったくない",
      "englishLabel": "None of the time"
    },
    {
      "value": 1,
      "label": "少しだけ",
      "englishLabel": "A little of the time"
    },
    {
      "value": 2,
      "label": "ときどき",
      "englishLabel": "Some of the time"
    },
    {
      "value": 3,
      "label": "たいてい",
      "englishLabel": "Most of the time"
    },
    {
      "value": 4,
      "label": "いつも",
      "englishLabel": "All of the time"
    }
  ],
  "scoring": {
    "method": "sum",
    "min": 0,
    "max": 24,
    "reverseItems": [],
    "cutoffs": {
      "none": {
        "range": [0, 4],
        "label": "問題なし",
        "englishLabel": "No distress",
        "description": "心理的苦痛はほとんどありません。日常生活に支障なく、適切なストレス対処ができています。"
      },
      "mild": {
        "range": [5, 9],
        "label": "軽度の心理的苦痛",
        "englishLabel": "Mild distress",
        "description": "軽度の心理的苦痛があります。セルフケアや周囲のサポートで改善できる可能性があります。"
      },
      "moderate": {
        "range": [10, 12],
        "label": "中等度の心理的苦痛",
        "englishLabel": "Moderate distress",
        "description": "中等度の心理的苦痛があります。休息や娯楽を大切にし、必要に応じて専門家への相談を検討してください。"
      },
      "severe": {
        "range": [13, 24],
        "label": "重度の心理的苦痛",
        "englishLabel": "Severe distress / High probability of serious mental illness",
        "description": "重度の心理的苦痛があります。日常生活に支障が出ている可能性があります。医師や心理士などの専門家への相談をお勧めします。"
      }
    },
    "clinicalCutoff": 13,
    "clinicalCutoffNote": "13点以上は精神疾患の可能性が高く、専門家による評価が推奨されます。"
  },
  "psychometricProperties": {
    "cronbachAlpha": 0.89,
    "auc": 0.94,
    "sensitivity": 0.36,
    "specificity": 0.96,
    "accuracy": 0.92,
    "factorStructure": "Single-factor (unidimensional)"
  },
  "copyright": "Copyright © Ronald C. Kessler, PhD. All rights reserved",
  "citation": {
    "original": "Kessler, R. C., et al. (2002). Short screening scales to monitor population prevalences and trends in non-specific psychological distress. Psychological Medicine, 32(6), 959-976.",
    "japanese": "古川壽亮ら (2008). 国際的精神保健調査における日本版K6およびK10のパフォーマンス. International Journal of Methods in Psychiatric Research, 17(3), 152-158."
  },
  "license": "Copyright-free for non-commercial use. Attribution required."
}
```

## Response Format Details

### Scale Type
**5-point Likert scale** (0-4 points per item)

### Score Range
- **Per Item**: 0-4 points
- **Total**: 0-24 points

### No Reverse Items
All items are scored directly (higher scores = greater distress)

## Scoring Instructions

### Calculation:
1. Sum all 6 item responses
2. Total score = Q1 + Q2 + Q3 + Q4 + Q5 + Q6

### Example:
```
Q1: まったくない (0点)
Q2: 少しだけ (1点)
Q3: ときどき (2点)
Q4: まったくない (0点)
Q5: 少しだけ (1点)
Q6: まったくない (0点)

Total = 0 + 1 + 2 + 0 + 1 + 0 = 4点 (問題なし)
```

## Clinical Interpretation

### Severity Levels:

#### 0-4点: 問題なし
- **意味**: 心理的苦痛は正常範囲
- **推奨**: 現在のセルフケアを継続

#### 5-9点: 軽度の心理的苦痛
- **意味**: 軽度のストレス症状あり
- **推奨**: セルフケア強化、周囲のサポート活用

#### 10-12点: 中等度の心理的苦痛
- **意味**: 中等度のストレス症状あり
- **推奨**: 休息・娯楽を優先、必要に応じて専門家相談を検討
- **⚠️ 要注意**: この水準から注意が必要

#### 13-24点: 重度の心理的苦痛
- **意味**: 精神疾患の可能性が高い
- **推奨**: 速やかに専門家（医師・心理士）への相談を
- **⚠️ 専門家受診推奨**: AUC 0.94で精神疾患を高精度で検出

## Missing Data Handling

### Rule:
If any items are missing, the total score cannot be calculated validly.

### Implementation:
- All 6 items must be answered
- Do not allow progression to results unless all items completed
- Do not impute missing values (6-item scale is too short)

## National Survey Cutoffs (Japan)

### 国民生活基礎調査での分類:

#### 10点以上: 要注意
**メッセージ**: 休息や娯楽を大切にしてください

#### 13点以上: 専門家への相談推奨
**メッセージ**: 日常生活に支障が出ているかも。医師や心理士などの専門家に相談することをお勧めします

## Symptom Domains Covered

K6 captures 4 key domains of psychological distress:

1. **Anxiety** (Q1, Q3):
   - Nervousness
   - Restlessness/fidgetiness

2. **Depression** (Q2, Q4):
   - Hopelessness
   - Persistent low mood

3. **Fatigue** (Q5):
   - Effort required for activities

4. **Self-Worth** (Q6):
   - Feelings of worthlessness

### Non-Specific Nature:
K6 measures **general psychological distress** rather than specific disorders. High scores indicate need for further diagnostic evaluation, not a specific diagnosis.

## Implementation Notes for psychtest.jp

### UI Design:
1. **Progress Indicator**: Show "6問中 X問目" (Question X of 6)
2. **Response Format**: Radio buttons or button group (5 options)
3. **Required Validation**: All items must be answered before submission
4. **Mobile-Friendly**: Large tap targets for 5 response options

### Accessibility:
- Clear labels for screen readers
- Keyboard navigation support
- High contrast for button states

### Data Storage (localStorage):
```typescript
interface K6Result {
  answers: number[]; // [0-4, 0-4, 0-4, 0-4, 0-4, 0-4]
  totalScore: number; // 0-24
  level: 'none' | 'mild' | 'moderate' | 'severe';
  timestamp: string;
}
```

## License and Attribution

### Copyright Notice (Required):
```
Copyright © Ronald C. Kessler, PhD. All rights reserved.
```

### Citations (Required):
Must cite both original and Japanese version:

**Original**:
Kessler, R. C., et al. (2002). Short screening scales to monitor population prevalences and trends in non-specific psychological distress. *Psychological Medicine, 32*(6), 959-976.

**Japanese Version**:
古川壽亮, 川上憲人, 斎藤正彰, 他 (2008). 国際的精神保健調査における日本版K6およびK10のパフォーマンス. *International Journal of Methods in Psychiatric Research, 17*(3), 152-158.

### Usage:
✅ Free for non-commercial use (psychtest.jp qualifies)
⚠️ Commercial use requires permission from Harvard Medical School

---

**Phase 3 Status**: ✅ Complete
**Next Step**: Phase 4 - Interpretation Content Generation
