# Phase 3 Data Sheet: PHQ-9

## Question Items (Japanese Version)

**こころとからだの質問票（PHQ-9）**

**質問文の前置き**: 「この2週間、次のような問題にどのくらい頻繁に悩まされていますか？」

| ID | 日本語項目 | English Reference |
|----|-----------|-------------------|
| 1 | 物事に対してほとんど興味がない、または楽しめない | Little interest or pleasure in doing things |
| 2 | 気分が落ち込む、憂うつになる、または絶望的な気持ちになる | Feeling down, depressed, or hopeless |
| 3 | 寝つきが悪い、途中で目が覚める、または逆に眠りすぎる | Trouble falling or staying asleep, or sleeping too much |
| 4 | 疲れた感じがする、または気力がない | Feeling tired or having little energy |
| 5 | あまり食欲がない、または食べ過ぎる | Poor appetite or overeating |
| 6 | 自分を責める、または自分には価値がない、家族を失望させていると感じる | Feeling bad about yourself - or that you are a failure or have let yourself or your family down |
| 7 | 新聞を読む、またはテレビを見ることなどに集中することが難しい | Trouble concentrating on things, such as reading the newspaper or watching television |
| 8 | 他人が気づくほど動きや話し方が遅い、またはその反対にそわそわしたり落ち着かず、普段よりも動き回ることがある | Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual |
| 9 | 死んだ方がましだ、または何らかの方法で自分を傷つけようと思ったことがある | Thoughts that you would be better off dead, or of hurting yourself |

## Response Scale

**回答形式**: 4点リッカート尺度（0-3点）

| 点数 | 日本語ラベル | English Label |
|------|-------------|---------------|
| 0 | 全くない | Not at all |
| 1 | 数日 | Several days |
| 2 | 半分以上 | More than half the days |
| 3 | ほとんど毎日 | Nearly every day |

## Scoring Information

```json
{
  "scale": "phq9",
  "fullName": "Patient Health Questionnaire-9",
  "japaneseName": "こころとからだの質問票",
  "abbreviation": "PHQ-9",
  "itemCount": 9,
  "scoring": {
    "min": 0,
    "max": 27,
    "reverseItems": [],
    "method": "sum",
    "severityLevels": {
      "minimal": { "range": [0, 4], "label": "正常（minimal depression）" },
      "mild": { "range": [5, 9], "label": "軽度（mild depression）" },
      "moderate": { "range": [10, 14], "label": "中等度（moderate depression）" },
      "moderatelySevere": { "range": [15, 19], "label": "やや重度（moderately severe depression）" },
      "severe": { "range": [20, 27], "label": "重度（severe depression）" }
    }
  },
  "psychologicalLayer": "State",
  "category": "Mental Health",
  "license": "Free to use (Pfizer-provided)",
  "specialConsiderations": {
    "clinical": true,
    "requiresDisclaimer": true,
    "highScoreThreshold": 15,
    "suicideRiskItem": 9
  }
}
```

## Special Note: Item 9 (Suicide Risk)

**重要**: 項目9（「死んだ方がましだ、または何らかの方法で自分を傷つけようと思ったことがある」）は自殺念慮のスクリーニング項目です。

**アクション**:
- 項目9のスコアが **2点以上（半分以上 / ほとんど毎日）** の場合、結果ページで緊急リソースを表示
- 総スコアが **15点以上（やや重度以上）** の場合、専門家への受診を強く推奨

## Disclaimer Template (必須)

```markdown
⚠️ この診断は医療診断ではありません

このテストはスクリーニング目的の心理尺度です。
深刻な症状がある場合は、必ず医療専門家にご相談ください。

【緊急時の連絡先】
- いのちの電話: 0570-783-556（24時間対応）
- こころの健康相談統一ダイヤル: 0570-064-556
- 最寄りの精神科・心療内科への受診をご検討ください

PHQ-9スコアが15点以上の場合、専門家への相談を強く推奨します。
```

---

**Sources**:
- [PHQ-9 日本語版（千葉大学）](https://www.cocoro.chiba-u.jp/recruit/tubuanDB/files/PHQ-9.pdf)
- [PHQ-9.org - Official Test](https://phq-9.org/)
- [Progress In Mind Japan - PHQ-9解説](https://japan.progress.im/ja/content/phq-9（patient-health-questionnaire-9）)

**Generated**: 2026-01-19
