# 心理テストサイト構想 - Claude Code 引き継ぎドキュメント

## プロジェクト概要

学術的に裏付けのある心理テストを集めたWebサイトを構築し、広告収入（AdSense/Amazon/楽天）で収益化を目指す。

### 技術スタック（想定）
- **フロントエンド**: 静的サイト（HTML/JS/CSS のみ）
- **ホスティング**: Cloudflare Pages（無料）
- ドメイン: psychtest.jp
- リポジトリ: psychtest-jp（仮）
- **データベース**: なし（localStorage で結果保存、将来的にログイン機能追加検討）
- **API/維持費**: 不要

---

## コンセプト：「丸裸診断」

複数の診断を組み合わせて、その人の全体像が浮かび上がる設計。

### 多面的に捉える6つの軸

| 軸 | 測定内容 | 対応尺度 |
|----|----------|----------|
| 自己認識 | 自分をどう見ているか | Self-Concept Clarity, Self-Esteem |
| 価値観・強み | 何を大事にしているか | VIA強み診断 |
| 性格特性 | どう振る舞うか | Big Five (IPIP-NEO) |
| 対人スタイル | 人とどう関わるか | 愛着スタイル(ECR-R) |
| メンタル状態 | 今どんな状態か | PHQ-9, GAD-7, PSS |
| 適職・興味 | 何に向いているか | RIASEC |

---

## 実装優先順位

### Phase 1: Core Package（約50-60問、10-15分）

| 尺度 | 問数 | 概要 | 学術的根拠 |
|------|------|------|-----------|
| **Self-Concept Clarity Scale (SCCS)** | 12問 | 自己概念の明確さ | Campbell et al. 1996, α=0.86 |
| **Rosenberg Self-Esteem Scale** | 10問 | 自己肯定感 | Rosenberg 1965, 引用5万超 |
| **Big Five 短縮版** | 20-25問 | 基本的性格特性 | IPIP, α=0.79-0.87 |
| **ECR-R 短縮版** | 12問 | 愛着スタイル | Fraley et al. 2000 |

### Phase 2: メンタルヘルス編

| 尺度 | 問数 | 概要 | 学術的根拠 |
|------|------|------|-----------|
| **PHQ-9** | 9問 | うつ傾向スクリーニング | Kroenke et al. 2001, α=0.86-0.89 |
| **GAD-7** | 7問 | 不安傾向 | Spitzer et al. 2006 |
| **PSS** | 10問 | 知覚されたストレス | Cohen et al. 1983 |

### Phase 3: キャリア・強み編

| 尺度 | 問数 | 概要 |
|------|------|------|
| **RIASEC** | 48問程度 | 職業興味（Holland理論） |
| **VIA短縮版** | 48-96問 | 24の強み |

---

## 学術尺度の評価基準（参考）

### Tier S: ゴールドスタンダード
- Big Five (NEO-PI-R, IPIP-NEO)
- PHQ-9, GAD-7
- Rosenberg Self-Esteem Scale
- Beck Depression Inventory (BDI)

### Tier A: 十分な学術的支持
- Self-Concept Clarity Scale
- ECR-R (愛着スタイル)
- VIA Character Strengths
- PSS (Perceived Stress Scale)
- RIASEC (Holland)

### Tier B: 使えるが限定的
- エゴグラム（日本では人気だが国際的追試少ない）
- エニアグラム（学術研究限定的）
- ストレングスファインダー（商業製品）

### Tier C: エンタメ寄り（非推奨）
- MBTI / 16Personalities（再テスト信頼性が低い r=0.50）
- 動物占い系

---

## 主要尺度の詳細

### 1. Self-Concept Clarity Scale (SCCS)

```
開発: Campbell, J. D., et al. (1996)
論文: "Self-concept clarity: Measurement, personality correlates, 
      and cultural boundaries." JPSP, 70(1), 141-156
問数: 12問
形式: 5点リッカート尺度
信頼性: Cronbach's α = 0.86
再テスト信頼性: r = 0.79 (4ヶ月)

測定内容:
- 自己概念がどれだけ明確で一貫しているか
- 「自分がわからない」「自己理解」の需要に対応

サンプル項目（逆転項目多い）:
- "My beliefs about myself often conflict with one another"
- "I spend a lot of time wondering about what kind of person I really am"
```

### 2. Rosenberg Self-Esteem Scale

```
開発: Rosenberg, M. (1965)
問数: 10問
形式: 4点リッカート尺度
信頼性: Cronbach's α = 0.77-0.88
再テスト信頼性: r = 0.82-0.85
引用数: 50,000+

測定内容:
- 全般的な自己価値感
- 自己に対する肯定的/否定的態度
```

### 3. IPIP-NEO (Big Five)

```
開発: Goldberg et al. (International Personality Item Pool)
ライセンス: パブリックドメイン（完全無料）
バージョン:
- IPIP-NEO-300: 300問（研究用）
- IPIP-NEO-120: 120問（標準）
- IPIP-NEO-60: 60問（短縮版）
- Mini-IPIP: 20問（超短縮版）

5因子:
- Extraversion（外向性）
- Agreeableness（協調性）
- Conscientiousness（誠実性）
- Neuroticism（神経症傾向）
- Openness（開放性）

リソース: https://ipip.ori.org/
```

### 4. ECR-R (Experiences in Close Relationships-Revised)

```
開発: Fraley, R. C., et al. (2000)
問数: 36問（短縮版は12-18問）
形式: 7点リッカート尺度

2軸:
- Attachment Anxiety（愛着不安）
- Attachment Avoidance（愛着回避）

4タイプ:
- 安定型（低不安・低回避）
- とらわれ型（高不安・低回避）
- 拒絶型（低不安・高回避）
- 恐れ型（高不安・高回避）
```

### 5. PHQ-9 (Patient Health Questionnaire-9)

```
開発: Kroenke, K., et al. (2001)
問数: 9問
形式: 4点リッカート（0-3）
信頼性: Cronbach's α = 0.86-0.89

スコア解釈:
- 0-4: なし/最小
- 5-9: 軽度
- 10-14: 中等度
- 15-19: 中等度〜重度
- 20-27: 重度

注意: 医療診断ではなくスクリーニング目的
```

### 6. GAD-7 (Generalized Anxiety Disorder-7)

```
開発: Spitzer, R. L., et al. (2006)
問数: 7問
形式: 4点リッカート（0-3）

スコア解釈:
- 0-4: 最小
- 5-9: 軽度
- 10-14: 中等度
- 15-21: 重度
```

---

## 競合分析

### 主要プレイヤー

| サイト | 特徴 | 学術性 | マネタイズ |
|--------|------|--------|-----------|
| 16Personalities | MBTIベース、圧倒的知名度 | △ | 有料レポート |
| mgram | 8性格タグ、SNS映え | △ | 有料詳細レポート |
| VIA Character | 24の強み、本家 | ◎ | 有料レポート$29 |
| commutest.com | 日本語、30種類以上 | ○ | 講座・カウンセリング導線 |

### commutest.com の特徴
- 運営: ダイレクトコミュニケーション株式会社
- 広告なし（診断は集客ツール、本業は講座・カウンセリング）
- 専門家監修だが「統計的な信頼性・妥当性チェックを行っていません」と明示
- UI/UX はシンプルで参考になる

### 差別化ポイント
```
当サイトの強み:
✅ 全ての尺度が学術論文で検証済み
✅ 信頼性係数（α）を明示
✅ 原著論文へのリンク
✅ 「エンタメ」ではなく「科学」
✅ 複数尺度を組み合わせた統合分析

メッセージング:
「当たる診断」ではなく「測れる診断」
「専門家の経験」ではなく「数千本の論文」
```

---

## データ保存戦略

### Phase 1（今）
- localStorage のみで十分
- 診断コンテンツの充実が最優先
- ログイン機能は後回し

### Phase 2（PV増加後）
- OAuth ログイン追加（Google/LINE）
- Supabase/Firebase 無料枠でクラウド同期
- localStorage → クラウド移行の導線

### ハイブリッド方式（推奨）
```
基本: localStorage で即使える
任意: ログインしたら同期される
→ 「まず使う → 気に入ったらログイン」の導線
```

---

## 将来構想

### AI Agent Squad（サブスク向け）
診断結果を蓄積 → 「あなたを知っている」人格群との対話

```
診断サイト（広告収益）
shindan.example.com
├── 無料で診断受け放題
├── AdSense
└── SEOで集客
        │
        │ 「もっと深く知りたい？」
        ▼
コンパニオンアプリ（サブスク）
app.example.com（別ドメイン）
├── 月額 ¥300-500
├── パーソナライズAI
└── 広告なし
```

ドメイン分離で AdSense ポリシー問題を回避

---

## 結果表示のイメージ

```
┌─────────────────────────────────────────────────────┐
│            あなたの心理プロファイル                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  【自己認識】                                       │
│  ┌──────────────────────────┐                      │
│  │ 自己概念の明確さ: ████████░░ 78%              │
│  │ 自己肯定感:       ██████░░░░ 62%              │
│  └──────────────────────────┘                      │
│                                                     │
│  【性格特性】Big Five                               │
│  外向性:     ████░░░░░░ 42%                        │
│  協調性:     ████████░░ 81%                        │
│  誠実性:     ██████░░░░ 65%                        │
│  神経症傾向: ██████████ 89%  ⚠️                    │
│  開放性:     ███████░░░ 73%                        │
│                                                     │
│  【対人スタイル】愛着                               │
│  ┌─────────────────────┐                           │
│  │        不安 高                                  │
│  │   とらわれ │ 恐れ型                             │
│  │     型    │  ●←あなた                         │
│  │  ─────────┼─────────  回避                     │
│  │   安定型  │ 拒絶型      高                      │
│  │        不安 低                                  │
│  └─────────────────────┘                           │
│                                                     │
│  【総合インサイト】                                 │
│  あなたは自分のことをよく理解しており...           │
└─────────────────────────────────────────────────────┘
```

---

## 各尺度に表示する情報（差別化）

```
┌─────────────────────────────────────────────────┐
│  Self-Concept Clarity Scale                     │
│  ─────────────────────────────────────          │
│  📊 学術的信頼性: ★★★★★                        │
│                                                 │
│  開発: Campbell et al. (1996)                   │
│  信頼性: Cronbach's α = 0.86                   │
│  再テスト信頼性: r = 0.79 (4ヶ月)              │
│  引用論文数: 2,000+                             │
│                                                 │
│  📖 原著論文:                                   │
│  Campbell, J. D., et al. (1996). Self-concept  │
│  clarity: Measurement, personality correlates,  │
│  and cultural boundaries. JPSP, 70(1), 141-156 │
└─────────────────────────────────────────────────┘
```

---

## 実装時の注意点

### 日本語版について
- 多くの尺度は日本語版が検証済み
- 未翻訳のものはバックトランスレーション必要
- 日本語版の信頼性係数も確認すること

### ライセンス
- IPIP: パブリックドメイン（完全自由）
- PHQ-9, GAD-7: 無料使用可（Pfizer提供）
- VIA: 公式サイト経由が推奨（無料版あり）
- 一部尺度は商用利用に許諾が必要な場合あり

### 免責事項
- 医療診断ではないことを明示
- 深刻な症状がある場合は専門家への相談を促す
- PHQ-9等は「スクリーニング目的」と記載

---

## 参考リソース

### 尺度・質問項目
- IPIP: https://ipip.ori.org/
- PHQ-9/GAD-7: https://www.phqscreeners.com/
- VIA: https://www.viacharacter.org/

### 競合参考
- commutest.com（日本語、UI参考）
- 16personalities.com（UX参考）

### 学術論文検索
- Google Scholar
- PubMed
- PsycINFO

---

## 最初の実装タスク

1. **プロジェクト構造の作成**
   - Cloudflare Pages 用の静的サイト構成
   - Tailwind CSS でモダンなUI

2. **Self-Concept Clarity Scale (12問) の実装**
   - 質問表示 → 回答収集 → スコア計算 → 結果表示
   - localStorage に結果保存

3. **Rosenberg Self-Esteem Scale (10問) の追加**
   - 同様のフロー
   - 2つの結果を組み合わせた表示

4. **Big Five 短縮版 (20問) の追加**
   - Mini-IPIP を使用
   - 5因子のレーダーチャート表示

5. **結果の統合ダッシュボード**
   - 複数診断の結果を一覧表示
   - 「丸裸プロファイル」の可視化
