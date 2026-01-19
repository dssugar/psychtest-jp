# Phase 3: SWLS Items Extraction

## Items (Japanese Version - 前野研究室版)

### 5項目

```json
{
  "scale": "swls",
  "fullName": "Satisfaction With Life Scale",
  "fullNameJa": "人生満足度尺度",
  "version": "Japanese Version (Maeno Lab, Keio University)",
  "questions": [
    {
      "id": 1,
      "text": "ほとんどの点で、私の人生は私の理想に近い",
      "textEn": "In most ways my life is close to my ideal.",
      "reverse": false
    },
    {
      "id": 2,
      "text": "私の人生は、とても素晴らしい時間だ",
      "textEn": "The conditions of my life are excellent.",
      "reverse": false
    },
    {
      "id": 3,
      "text": "私は現在の人生に満足している",
      "textEn": "I am satisfied with my life.",
      "reverse": false
    },
    {
      "id": 4,
      "text": "私はこれまで、人生で欲しかった大切なものを得ている",
      "textEn": "So far I have gotten the important things I want in life.",
      "reverse": false
    },
    {
      "id": 5,
      "text": "もし人生をやり直せるなら、ほとんど何も変わらないだろう",
      "textEn": "If I could live my life over, I would change almost nothing.",
      "reverse": false
    }
  ],
  "scaleLabels": [
    "全く当てはまらない",
    "ほとんど当てはまらない",
    "やや当てはまらない",
    "どちらとも言えない",
    "当てはまる",
    "かなり当てはまる",
    "とても当てはまる"
  ],
  "scaleLabelsEn": [
    "Strongly disagree",
    "Disagree",
    "Slightly disagree",
    "Neither agree nor disagree",
    "Slightly agree",
    "Agree",
    "Strongly agree"
  ],
  "scoring": {
    "method": "sum",
    "min": 5,
    "max": 35,
    "reverseItems": [],
    "interpretation": {
      "veryLow": {
        "range": [5, 9],
        "label": "極めて不満足",
        "labelEn": "Extremely dissatisfied",
        "description": "人生に対して極めて強い不満を感じている状態"
      },
      "low": {
        "range": [10, 14],
        "label": "不満足",
        "labelEn": "Dissatisfied",
        "description": "人生に対して不満を感じている状態"
      },
      "slightlyBelow": {
        "range": [15, 19],
        "label": "やや不満足",
        "labelEn": "Slightly dissatisfied",
        "description": "人生にやや不満を感じている状態"
      },
      "neutral": {
        "range": [20, 24],
        "label": "中程度",
        "labelEn": "Neutral",
        "description": "人生の満足度が平均的な状態"
      },
      "slightlyAbove": {
        "range": [25, 29],
        "label": "やや満足",
        "labelEn": "Slightly satisfied",
        "description": "人生にやや満足している状態"
      },
      "high": {
        "range": [30, 34],
        "label": "満足",
        "labelEn": "Satisfied",
        "description": "人生に満足している状態"
      },
      "veryHigh": {
        "range": [35, 35],
        "label": "極めて満足",
        "labelEn": "Extremely satisfied",
        "description": "人生に対して極めて高い満足を感じている状態"
      }
    },
    "normativeData": {
      "japan": {
        "source": "Maeno Lab (2012), n=1,500, ages 15-79",
        "mean": 18.9,
        "sd": 6.0,
        "note": "Original report stated SD=22.53 which appears to be an error"
      },
      "usa": {
        "source": "Diener et al. (1985)",
        "mean": 23.5,
        "sd": 6.43,
        "note": "College student sample"
      }
    }
  },
  "license": "Public Domain",
  "attribution": {
    "original": "Diener, E., Emmons, R.A., Larsen, R.J., & Griffin, S. (1985). The Satisfaction with Life Scale. Journal of Personality Assessment, 49, 71-75.",
    "japanese": "角野善司（1994）. 人生に対する満足尺度（SWLS）日本版作成の試み. 日本教育心理学会第36回総会発表論文集, 192.",
    "reference": "慶應義塾大学前野研究室 https://lab.sdm.keio.ac.jp/maenolab/questionnaire_about_happiness.htm"
  }
}
```

## Response Format

- **Type**: 7-point Likert scale
- **Score Range**: 1-7 per item
- **Total Range**: 5-35 points

### Scoring Examples

| 回答パターン | 合計スコア | 解釈 |
|------------|----------|------|
| 全て「1」 | 5点 | 極めて不満足 |
| 全て「3」 | 15点 | やや不満足 |
| 全て「4」 | 20点 | 中程度 |
| 全て「5」 | 25点 | やや満足 |
| 全て「6」 | 30点 | 満足 |
| 全て「7」 | 35点 | 極めて満足 |

## Reverse Items

✅ **None** - All items are scored directly (1-7)

SWLSには逆転項目がありません。全ての項目が人生満足度の高さを示す方向で記述されています。

## Cutoff Values & Interpretation Levels

SWLSは臨床尺度ではないため、明確な「カットオフ値」はありません。ただし、Diener et al. (1985) およびPavot & Diener (1993) の研究に基づき、以下の解釈ガイドラインが提案されています：

### 7段階解釈

| スコア範囲 | レベル | 解釈 |
|----------|--------|------|
| **31-35** | 極めて満足 | 人生に対して極めて高い満足を感じている。継続的な幸福感を維持できている理想的な状態。 |
| **26-30** | 満足 | 人生に満足している。ポジティブな評価が優勢だが、改善の余地もある。 |
| **21-25** | やや満足 | 平均よりやや高い満足度。部分的に満足しているが、不満な領域もある。 |
| **20** | 中立点 | 満足・不満足がほぼ均衡している状態。 |
| **15-19** | やや不満足 | 平均よりやや低い満足度。人生の一部に不満を感じている。 |
| **10-14** | 不満足 | 人生に不満を感じている。重要な領域で問題がある可能性。 |
| **5-9** | 極めて不満足 | 人生に対して極めて強い不満。専門家への相談を検討すべき状態。 |

### 参考: Pavot & Diener (1993) の解釈ガイドライン

| スコア | 解釈（英語） | 解釈（日本語） |
|-------|------------|--------------|
| 31-35 | Extremely satisfied; much above average | 極めて満足；平均を大きく上回る |
| 26-30 | Satisfied; above average | 満足；平均を上回る |
| 21-25 | Slightly satisfied; average for American adults | やや満足；米国成人の平均 |
| 20 | Neutral point | 中立点 |
| 15-19 | Slightly dissatisfied; a bit below average | やや不満足；平均をやや下回る |
| 10-14 | Dissatisfied; clearly below average | 不満足；平均を明らかに下回る |
| 5-9 | Extremely dissatisfied; vastly below average | 極めて不満足；平均を大きく下回る |

**注意**: これらの基準は米国のデータに基づいています。日本では文化的要因により、平均スコアがやや低い傾向があります（日本平均: 18.9点 vs 米国平均: 23.5点）。

## Cultural Normative Data

### 日本（Maeno Lab, 2012）

- **n = 1,500**
- **年齢**: 15-79歳
- **平均**: 18.9点
- **標準偏差**: 約6.0点（推定）
- **中央値**: 約19点
- **分布**: 正規分布に近い

### 米国（Diener et al., 1985）

- **サンプル**: 大学生
- **平均**: 23.5点
- **標準偏差**: 6.43点

### 文化差の解釈

日本と米国の平均スコアの差（約4-5点）は、以下の文化的要因によると考えられます：

1. **謙遜の文化**: 日本では自己評価を控えめにする傾向
2. **集団主義**: 個人の幸福よりも集団の調和を重視
3. **期待値の違い**: 人生の理想像に対する期待が異なる

## Administration Instructions

### 実施方法

**導入文**:
```
これから、あなたの人生全体に対する満足度について5つの質問をします。
それぞれの文章について、どの程度当てはまるかを7段階で評価してください。
正解・不正解はありませんので、直感的に答えてください。
```

**回答方法**:
```
各項目について、以下の7段階で評価してください：

1 = 全く当てはまらない
2 = ほとんど当てはまらない
3 = やや当てはまらない
4 = どちらとも言えない
5 = 当てはまる
6 = かなり当てはまる
7 = とても当てはまる
```

**所要時間**: 約1分

## Scoring Instructions

### 計算方法

1. **全5項目の得点を合計**する
2. **逆転項目なし** - 全て直接加算
3. **合計スコア範囲**: 5-35点

### 計算例

```
項目1: 5点 (当てはまる)
項目2: 6点 (かなり当てはまる)
項目3: 4点 (どちらとも言えない)
項目4: 5点 (当てはまる)
項目5: 3点 (やや当てはまらない)

合計 = 5 + 6 + 4 + 5 + 3 = 23点
解釈: やや満足（平均的）
```

## Implementation Notes

### TypeScript型定義例

```typescript
interface SWLSQuestion {
  id: number;
  text: string;
  textEn: string;
  reverse: boolean;
}

interface SWLSResponse {
  [questionId: number]: number; // 1-7
}

interface SWLSResult {
  totalScore: number; // 5-35
  level: 'veryLow' | 'low' | 'slightlyBelow' | 'neutral' | 'slightlyAbove' | 'high' | 'veryHigh';
  levelLabel: string;
  interpretation: string;
}

function calculateSWLS(responses: SWLSResponse): SWLSResult {
  const scores = Object.values(responses);
  const totalScore = scores.reduce((sum, score) => sum + score, 0);

  // Determine level based on totalScore
  let level: SWLSResult['level'];
  if (totalScore >= 31) level = 'veryHigh';
  else if (totalScore >= 26) level = 'high';
  else if (totalScore >= 21) level = 'slightlyAbove';
  else if (totalScore === 20) level = 'neutral';
  else if (totalScore >= 15) level = 'slightlyBelow';
  else if (totalScore >= 10) level = 'low';
  else level = 'veryLow';

  return {
    totalScore,
    level,
    levelLabel: getLevelLabel(level),
    interpretation: getInterpretation(level)
  };
}
```

## License

✅ **パブリックドメイン (Public Domain)**

**使用条件**:
- 無料で使用可能
- 商用利用可能
- 改変可能
- クレジット表記のみ必要

**必須のクレジット**:
```
Diener, E., Emmons, R.A., Larsen, R.J., & Griffin, S. (1985).
The Satisfaction with Life Scale.
Journal of Personality Assessment, 49, 71-75.

日本語版:
角野善司（1994）. 人生に対する満足尺度（SWLS）日本版作成の試み.
日本教育心理学会第36回総会発表論文集, 192.

参考: 慶應義塾大学前野研究室
https://lab.sdm.keio.ac.jp/maenolab/questionnaire_about_happiness.htm
```

## Validation Recommendations

SWLSは世界的に検証された尺度ですが、実装サイトで独自に信頼性を確認する場合：

### パイロットテスト

**最小サンプル**: n ≥ 100
**測定項目**:
- Cronbach's α（目標: ≥ 0.80）
- 項目-全体相関（目標: r ≥ 0.40）
- 因子分析（単一因子構造の確認）

### 妥当性検証

**収束的妥当性**（以下と正の相関が期待される）:
- ポジティブ感情
- 主観的幸福感
- 自尊心

**弁別的妥当性**（以下と負の相関が期待される）:
- うつ病（PHQ-9）
- 不安（GAD-7）
- ネガティブ感情

---

**Next Step**: Proceed to Phase 4 (Interpretation Content Generation) - 7段階レベルの詳細な解釈コンテンツを生成します。
