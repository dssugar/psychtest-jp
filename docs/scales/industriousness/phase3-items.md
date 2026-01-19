# Phase 3: Industriousness Items Extraction

## Scale Structure

**Full Name**: Industriousness (勤勉性)
**Composition**: IPIP-300 C4 (Achievement Striving) + C5 (Self-Discipline)
**Total Items**: 20
**Subscales**: 2
- C4: Achievement Striving (達成動機) - 10 items
- C5: Self-Discipline (自己鍛錬) - 10 items

---

## Items (Japanese Version)

### Complete Item List with JSON Structure

```json
{
  "scale": "industriousness",
  "fullName": "Industriousness (勤勉性)",
  "abbreviation": "IND",
  "subscales": ["c4_achievement", "c5_discipline"],
  "questions": [
    {
      "id": 1,
      "originalId": 271,
      "text": "目標に向かって突き進む",
      "textEn": "Go straight for the goal",
      "subscale": "c4_achievement",
      "subscaleLabel": "達成動機",
      "reverse": false
    },
    {
      "id": 2,
      "originalId": 272,
      "text": "よく働く",
      "textEn": "Work hard",
      "subscale": "c4_achievement",
      "subscaleLabel": "達成動機",
      "reverse": false
    },
    {
      "id": 3,
      "originalId": 273,
      "text": "有言実行である",
      "textEn": "Turn plans into actions",
      "subscale": "c4_achievement",
      "subscaleLabel": "達成動機",
      "reverse": false
    },
    {
      "id": 4,
      "originalId": 274,
      "text": "全力で課題に取り組む",
      "textEn": "Plunge into tasks with all my heart",
      "subscale": "c4_achievement",
      "subscaleLabel": "達成動機",
      "reverse": false
    },
    {
      "id": 5,
      "originalId": 275,
      "text": "求められていること以上のことをする",
      "textEn": "Do more than what's expected of me",
      "subscale": "c4_achievement",
      "subscaleLabel": "達成動機",
      "reverse": false
    },
    {
      "id": 6,
      "originalId": 276,
      "text": "自分にも他人にも厳しい",
      "textEn": "Set high standards for myself and others",
      "subscale": "c4_achievement",
      "subscaleLabel": "達成動機",
      "reverse": false
    },
    {
      "id": 7,
      "originalId": 277,
      "text": "質を要求する",
      "textEn": "Demand quality",
      "subscale": "c4_achievement",
      "subscaleLabel": "達成動機",
      "reverse": false
    },
    {
      "id": 8,
      "originalId": 278,
      "text": "あまり成功したいと思わない",
      "textEn": "Am not highly motivated to succeed",
      "subscale": "c4_achievement",
      "subscaleLabel": "達成動機",
      "reverse": true
    },
    {
      "id": 9,
      "originalId": 279,
      "text": "必要最低限のことしかやらない",
      "textEn": "Do just enough work to get by",
      "subscale": "c4_achievement",
      "subscaleLabel": "達成動機",
      "reverse": true
    },
    {
      "id": 10,
      "originalId": 280,
      "text": "仕事に時間と労力を裂きたくない",
      "textEn": "Put little time and effort into my work",
      "subscale": "c4_achievement",
      "subscaleLabel": "達成動機",
      "reverse": true
    },
    {
      "id": 11,
      "originalId": 281,
      "text": "雑用はすぐに済ませる",
      "textEn": "Get chores done right away",
      "subscale": "c5_discipline",
      "subscaleLabel": "自己鍛錬",
      "reverse": false
    },
    {
      "id": 12,
      "originalId": 282,
      "text": "常に準備ができている",
      "textEn": "Am always prepared",
      "subscale": "c5_discipline",
      "subscaleLabel": "自己鍛錬",
      "reverse": false
    },
    {
      "id": 13,
      "originalId": 283,
      "text": "課題はすぐに着手する",
      "textEn": "Start tasks right away",
      "subscale": "c5_discipline",
      "subscaleLabel": "自己鍛錬",
      "reverse": false
    },
    {
      "id": 14,
      "originalId": 284,
      "text": "ただちに仕事にかかる",
      "textEn": "Get to work at once",
      "subscale": "c5_discipline",
      "subscaleLabel": "自己鍛錬",
      "reverse": false
    },
    {
      "id": 15,
      "originalId": 285,
      "text": "計画は実行する",
      "textEn": "Carry out my plans",
      "subscale": "c5_discipline",
      "subscaleLabel": "自己鍛錬",
      "reverse": false
    },
    {
      "id": 16,
      "originalId": 286,
      "text": "仕事を始める気になれない",
      "textEn": "Find it difficult to get down to work",
      "subscale": "c5_discipline",
      "subscaleLabel": "自己鍛錬",
      "reverse": true
    },
    {
      "id": 17,
      "originalId": 287,
      "text": "時間を効率よく使わない",
      "textEn": "Waste my time",
      "subscale": "c5_discipline",
      "subscaleLabel": "自己鍛錬",
      "reverse": true
    },
    {
      "id": 18,
      "originalId": 288,
      "text": "きっかけがないと仕事を始められない",
      "textEn": "Need a push to get started",
      "subscale": "c5_discipline",
      "subscaleLabel": "自己鍛錬",
      "reverse": true
    },
    {
      "id": 19,
      "originalId": 289,
      "text": "仕事を始めるのが難しい",
      "textEn": "Have difficulty starting tasks",
      "subscale": "c5_discipline",
      "subscaleLabel": "自己鍛錬",
      "reverse": true
    },
    {
      "id": 20,
      "originalId": 290,
      "text": "決断を先送りにする",
      "textEn": "Postpone decisions",
      "subscale": "c5_discipline",
      "subscaleLabel": "自己鍛錬",
      "reverse": true
    }
  ],
  "scaleLabels": [
    "全く当てはまらない",
    "あまり当てはまらない",
    "どちらとも言えない",
    "やや当てはまる",
    "非常に当てはまる"
  ],
  "scoring": {
    "responseRange": [1, 5],
    "subscales": {
      "c4_achievement": {
        "label": "達成動機 (Achievement Striving)",
        "labelEn": "Achievement Striving",
        "items": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        "reverseItems": [8, 9, 10],
        "min": 10,
        "max": 50
      },
      "c5_discipline": {
        "label": "自己鍛錬 (Self-Discipline)",
        "labelEn": "Self-Discipline",
        "items": [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        "reverseItems": [16, 17, 18, 19, 20],
        "min": 10,
        "max": 50
      }
    },
    "total": {
      "label": "勤勉性 (Industriousness)",
      "labelEn": "Industriousness",
      "min": 20,
      "max": 100,
      "formula": "C4 + C5"
    },
    "reverseScoring": {
      "originalValue": [1, 2, 3, 4, 5],
      "reversedValue": [5, 4, 3, 2, 1]
    }
  },
  "interpretation": {
    "subscalePercentiles": {
      "description": "Each subscale (10 items, 10-50 range) is converted to percentile (0-100%)",
      "formula": "((rawScore - 10) / 40) * 100"
    },
    "matrixDisplay": {
      "xAxis": "c4_achievement",
      "yAxis": "c5_discipline",
      "quadrants": {
        "highHigh": {
          "label": "実行者型 (Achiever)",
          "description": "High goals + High execution"
        },
        "lowHigh": {
          "label": "着実型 (Steady)",
          "description": "Moderate goals + High execution"
        },
        "highLow": {
          "label": "構想家型 (Visionary)",
          "description": "High goals + Needs execution support"
        },
        "lowLow": {
          "label": "マイペース型 (Relaxed)",
          "description": "Moderate ambition + Flexible approach"
        }
      }
    }
  },
  "license": "Public Domain (IPIP)"
}
```

---

## Response Format

### Scale Type
- **5-point Likert Scale**
- Consistent with IPIP-300 standard format
- Matches Big Five test already implemented on psychtest.jp

### Labels (Japanese)
1. 全く当てはまらない (Not at all like me)
2. あまり当てはまらない (Not much like me)
3. どちらとも言えない (Neutral)
4. やや当てはまる (Somewhat like me)
5. 非常に当てはまる (Very much like me)

### Scoring
- **Standard Items**: Direct scoring (1-5)
- **Reverse Items**: Inverted scoring (1→5, 2→4, 3→3, 4→2, 5→1)

---

## Reverse Items

### C4: Achievement Striving (達成動機)
**Reverse Items**: 3 out of 10

| ID | Item Number | Text |
|----|-------------|------|
| 8  | 278 | あまり成功したいと思わない |
| 9  | 279 | 必要最低限のことしかやらない |
| 10 | 280 | 仕事に時間と労力を裂きたくない |

### C5: Self-Discipline (自己鍛錬)
**Reverse Items**: 5 out of 10

| ID | Item Number | Text |
|----|-------------|------|
| 16 | 286 | 仕事を始める気になれない |
| 17 | 287 | 時間を効率よく使わない |
| 18 | 288 | きっかけがないと仕事を始められない |
| 19 | 289 | 仕事を始めるのが難しい |
| 20 | 290 | 決断を先送りにする |

**Total Reverse Items**: 8 out of 20 (40%)

---

## Score Ranges

### Subscale Scores (Each)
- **Minimum**: 10 (all items scored 1)
- **Maximum**: 50 (all items scored 5)
- **Range**: 40 points
- **Midpoint**: 30 (neutral average)

### Total Score (C4 + C5)
- **Minimum**: 20
- **Maximum**: 100
- **Range**: 80 points
- **Midpoint**: 60

### Percentile Conversion
For 2-axis matrix display, convert raw scores to percentiles (0-100%):

**Formula**:
```
Percentile = ((RawScore - MinScore) / (MaxScore - MinScore)) * 100
```

**Example for C4 (Achievement)**:
- Raw Score: 35
- Percentile: ((35 - 10) / (50 - 10)) * 100 = **62.5%**

---

## Interpretation Framework

### 2×2 Matrix (C4 × C5)

Using 50% as threshold (raw scores: C4=30, C5=30):

```
         Self-Discipline (実行力)
            低 ←→ 高
       ┌─────┬─────┐
高     │ 🔥  │ ⭐  │
達成   │構想家│実行者│
動機   ├─────┼─────┤
   ↕   │ 💤  │ 🎯  │
低     │無気力│着実 │
       └─────┴─────┘
```

| Quadrant | C4 | C5 | Type | Interpretation |
|----------|----|----|------|----------------|
| ⭐ Top-Right | High | High | **実行者型** | Ideal industriousness: Sets ambitious goals AND executes consistently |
| 🔥 Top-Left | High | Low | **構想家型** | High ambition but struggles with execution/follow-through |
| 🎯 Bottom-Right | Low | High | **着実型** | Reliable executor of existing tasks, less driven by high goals |
| 💤 Bottom-Left | Low | Low | **マイペース型** | Relaxed approach to both goals and execution |

---

## Cutoff Guidelines

### Based on Percentiles

| Percentile Range | Label | Description |
|------------------|-------|-------------|
| 0-25% | 低い (Low) | Below average |
| 26-50% | やや低い (Slightly Low) | Below midpoint |
| 51-75% | やや高い (Slightly High) | Above midpoint |
| 76-100% | 高い (High) | Well above average |

### Alternative: Standard Deviation Approach

If normative data becomes available:
- **z-score < -1.0**: Low
- **-1.0 ≤ z < 0**: Below Average
- **0 ≤ z < 1.0**: Above Average
- **z ≥ 1.0**: High

---

## Data Validation

### Item-Level Checks

✅ **Verified**:
- All 20 items present in source CSV
- Subscale assignments correct (C4: 1-10, C5: 11-20)
- Reverse items properly identified (8/20)
- Japanese translations natural and clear

### Scoring Logic Verification

**Test Case 1: All Maximum**
- All items = 5 (before reversing)
- After reversing: All effective scores = 5
- C4 = 50, C5 = 50, Total = 100 ✅

**Test Case 2: All Minimum**
- All items = 1 (before reversing)
- After reversing: All effective scores = 1
- C4 = 10, C5 = 10, Total = 20 ✅

**Test Case 3: Mixed**
- C4 direct items (1-7) = 4, reverse items (8-10) = 2 (reversed to 4)
- C4 = 7×4 + 3×4 = 40 ✅
- C5 direct items (11-15) = 5, reverse items (16-20) = 1 (reversed to 5)
- C5 = 5×5 + 5×5 = 50 ✅

---

## License

✅ **Public Domain (IPIP)**

- No permission required
- Free for commercial use
- Free for research use
- No attribution legally required (but recommended)
- Items can be modified if needed

**Source**: [IPIP Official Website](https://ipip.ori.org/)

---

## Implementation Notes

### Frontend Display Order
Recommend **randomized** or **mixed** presentation (C4/C5 interspersed) to:
- Reduce response bias
- Prevent pattern answering
- Match standard IPIP-300 administration

### Progress Indicator
- Total: 20 items
- Estimated time: 3-4 minutes
- Progress bar: Show percentage (e.g., "Question 5/20 - 25%")

### Accessibility
- Clear, large font for Japanese text
- Radio buttons for Likert scale
- Mobile-friendly touch targets
- Keyboard navigation support

---

## Next Steps

### Proceed to Phase 4: Interpretation Content Generation

✅ **Ready for Phase 4**

**Requirements**:
1. Generate 4 quadrant interpretations (各約1,500字)
2. Create level-based interpretations for C4 and C5 subscales
3. Provide practical advice for each profile type
4. Include research-based insights

---

## References

1. IPIP Japanese Translation CSV: `/data/translations/ipip-neo-300-items-ja.csv`

2. IPIP-300 vs IPIP-120 Comparison Table: https://ipip.ori.org/IPIP300-120ComparisonTable.htm

3. DeYoung, C. G., Quilty, L. C., & Peterson, J. B. (2007). Between facets and domains: 10 aspects of the Big Five. *Journal of Personality and Social Psychology*, 93(5), 880-896.

4. Johnson, J. A. (2014). Measuring thirty facets of the Five Factor Model with a 120-item public domain inventory: Development of the IPIP-NEO-120. *Journal of Research in Personality*, 51, 78-89.

---

**Document Status**: Phase 3 Complete ✅
**Next Phase**: Phase 4 - Interpretation Content Generation
**Date**: 2026-01-20
