# スペクトル診断 - 実装ロードマップ

## 📍 現在地（2026-01-20）

### ✅ 完了
- **Phase 1**: 7つの心理尺度実装完了
  - Big Five (IPIP-NEO-120) - 性格特性5次元・30ファセット（120問）
  - Industriousness / Grit (IPIP-300 C4+C5) - 勤勉性・やり抜く力（20問）
  - Rosenberg Self-Esteem - 自尊心（10問）
  - PHQ-9 - うつ病スクリーニング（9問）
  - K6 - 心理的苦痛スクリーニング（6問）
  - SWLS - 人生満足度尺度（5問）
  - Self-Concept Clarity - 自己概念の明確さ（12問）
- **統合ダッシュボード**: Trait-State-Outcome-Skill フレームワークに基づく統合分析
- **デザインシステム**: ネオブルータリズム × データビジュアライゼーション
- **レスポンシブ対応**: モバイルファースト設計完了
- **技術基盤**: Next.js 16 App Router、Tailwind CSS v4、TypeScript
- **E2Eテスト**: Playwright導入

### 🎯 フレームワーク実装状況

#### 【Trait - 特性】比較的安定した個人差

| Category | 測定内容 | 使用尺度 | 状態 |
|----------|----------|----------|------|
| 性格特性 (Personality) | 行動パターン | Big Five (IPIP-NEO) | ✅ **完了** |
| 勤勉性 / やり抜く力 (Industriousness / Grit) | 達成動機と自己鍛錬 | IPIP-300 C4+C5 | ✅ **完了** |
| 愛着スタイル (Attachment) | 関係性の傾向 | ECR-R | 未実装 |
| 価値観・強み (Values/Strengths) | 価値観と強み | VIA | 未実装 |

#### 【State - 状態】現在の心理状態

| Category | 測定内容 | 使用尺度 | 状態 |
|----------|----------|----------|------|
| 自己認識 (Self-Concept) | 自己理解の明確さ | Self-Concept Clarity Scale | ✅ **完了** |
| メンタルヘルス (Mental Health) | 現在の症状 | PHQ-9, K6, PSS | ✅ **PHQ-9, K6完了** |

#### 【Outcome - 成果】特性と状態の結果

| Category | 測定内容 | 使用尺度 | 状態 |
|----------|----------|----------|------|
| 自尊心 (Self-Esteem) | 自己価値の評価 | Rosenberg Self-Esteem | ✅ **完了** |
| 主観的幸福感 (Subjective Well-being) | 人生満足度 | SWLS | ✅ **完了** |
| キャリア適合 (Career Fit) | 職業適性 | RIASEC | 未実装 |

#### 【Skill - スキル】育成可能な力（Phase 3以降）

| Category | 測定内容 | 使用尺度 | 状態 |
|----------|----------|----------|------|
| レジリエンス (Resilience) | ストレス回復力 | CD-RISC | 未実装 |
| マインドフルネス (Mindfulness) | 今への気づき | MAAS | 未実装 |
| 対処スタイル (Coping) | ストレス対処 | Brief COPE | 未実装 |

**進捗**: 182問実装完了（Big Five 120問 + Industriousness 20問 + Rosenberg 10問 + PHQ-9 9問 + K6 6問 + SWLS 5問 + Self-Concept 12問）

---

## 🚀 Phase 2: 診断拡充（優先度：高）

**目標**: メンタルヘルス診断・愛着スタイル診断の追加で、フレームワークの網羅性を向上

### 2.1 メンタルヘルス診断の追加

#### ✅ 完了済み

**K6 (Kessler Psychological Distress Scale)** ✅
- 6問、5点リッカート尺度（0-4）
- Tier A（国民生活基礎調査で使用）
- 著作権フリー・非商用利用完全自由
- うつ・不安の非特異的スクリーニング（PHQ-9と補完的）

#### 次の実装候補（優先順）

**1. PSS (Perceived Stress Scale)**
- **問題数**: 10問
- **次元**: State（メンタルヘルス）
- **難易度**: 低
- **実装時間**: 2-3時間
- **特徴**:
  - 5点リッカート尺度
  - ストレス認知レベルを測定
  - 逆転項目あり

---

### 2.2 愛着スタイル診断

**ECR-R Short Form (Attachment Style)**
- **問題数**: 12問
- **次元**: Trait（愛着スタイル）
- **難易度**: 中
- **実装時間**: 3-4時間
- **特徴**:
  - 2軸（不安・回避）で4タイプに分類
  - Secure, Preoccupied, Dismissive, Fearful
  - 7点リッカート尺度
  - 2D散布図での可視化が効果的

---

## 🧠 Phase 3: キャリア・価値観診断（優先度：中）

**目標**: Outcome層・Trait層の完全カバー

### 3.1 キャリア診断

**RIASEC (Holland Code)**
- **問題数**: 48問（6タイプ × 8問）
- **次元**: Outcome（キャリア適合）
- **特徴**:
  - Realistic, Investigative, Artistic, Social, Enterprising, Conventional
  - 6次元レーダーチャートで可視化
  - 具体的な職業提案が可能

### 3.2 価値観・強み診断

**VIA Character Strengths**
- **問題数**: 96問（24強み × 4問）または 120問
- **次元**: Trait（価値観・強み）
- **特徴**:
  - ポジティブ心理学の主要尺度
  - 公式サイト統合も検討
  - **無料版あり**

### 3.3 マインドフルネス診断

**MAAS (Mindful Attention Awareness Scale)**
- **問題数**: 15問
- **次元**: Skill（マインドフルネス）
- **特徴**:
  - 今この瞬間への気づき
  - 逆転項目のみ
  - α = 0.80-0.87

---

## 🧠 Phase 4: AI機能統合（優先度：中）

**目標**: 診断結果を活用した対話型AI機能で差別化・収益化準備

### 4.1 BYOK (Bring Your Own Key) Chat

**目標**: ユーザーのAPIキーでLLMと対話

#### 機能設計

**`/chat` ページ**:
1. **APIキー設定**
   - Claude API Key または OpenAI API Key
   - localStorage保存（暗号化なし、注意書き表示）
   - キー検証機能

2. **診断結果を文脈として提供**
```typescript
const systemPrompt = `
あなたは心理カウンセラーです。以下のユーザーの診断結果を参照してください：

- SCCS: ${sccsScore}/60 (${sccsLevel})
- Rosenberg自尊心: ${rosenbergScore}/40
- Big Five: 外向性${e}, 協調性${a}, 誠実性${c}, 神経症傾向${n}, 開放性${o}

ユーザーの質問に、診断結果を踏まえて回答してください。
`;
```

3. **ストリーミング表示**
   - Vercel AI SDK使用
   - タイプライター効果

**技術スタック**:
- Vercel AI SDK（ai パッケージ）
- クライアントサイド実装（完全無料運用）
- localStorage（APIキー保管）

**セキュリティ考慮**:
- ⚠️ APIキーはlocalStorageに平文保存（ユーザーに注意喚起）
- サーバーに送信しない（完全クライアント処理）
- Chrome拡張でキーが読まれるリスクあり → 注意書き必須

**実装タスク**:
- [ ] /chat ページ作成
- [ ] APIキー設定UI
- [ ] Vercel AI SDK統合
- [ ] システムプロンプト生成ロジック
- [ ] 会話履歴表示

**所要時間**: 5-6時間

---

### 4.2 エージェント機能

**複数のペルソナを持つAI**

#### エージェント種類

**1. カウンセラーエージェント**
- **役割**: 診断結果に基づいた心理的サポート
- **システムプロンプト**: 共感的、傾聴、アドバイス控えめ
- **使用場面**: 低スコアで悩んでいるユーザー

**2. キャリアコーチ**
- **役割**: Big Five + RIASEC から適職提案
- **システムプロンプト**: 実践的、具体的なキャリアパス提示
- **使用場面**: 就職・転職を考えているユーザー

**3. セルフコーチング支援**
- **役割**: 目標設定、習慣形成のサポート
- **システムプロンプト**: やる気を引き出す、SMART目標設定支援
- **使用場面**: 自己改善を目指すユーザー

**4. メンタルヘルス案内**
- **役割**: PHQ-9/GAD-7が高い場合に専門家受診を促す
- **システムプロンプト**: 医療行為は行わない、リソース紹介のみ
- **免責事項**: 必須

**実装**:
```typescript
const agents = {
  counselor: {
    name: "カウンセラー",
    icon: "🧑‍⚕️",
    systemPrompt: "あなたは共感的な心理カウンセラーです...",
  },
  career: {
    name: "キャリアコーチ",
    icon: "💼",
    systemPrompt: "あなたは実践的なキャリアアドバイザーです...",
  },
  // ...
};
```

**所要時間**: 3-4時間

---

### 4.3 LLMによるおすすめ診断

**機能**: 既存の診断結果から次に受けるべき診断を提案

#### ロジック

**パターン1: ルールベース（Phase 4.0）**
```typescript
function recommendNextTest(profile: UserProfile): TestType {
  if (!profile.tests.rosenberg && profile.tests.sccs) {
    return 'rosenberg'; // SCCSだけ受けたなら、Rosenbergを推奨
  }
  if (profile.tests.sccs?.result.level === 'low') {
    return 'rosenberg'; // 自己概念が低いなら自尊心も測る
  }
  // ...
}
```

**パターン2: LLMベース（Phase 4.1）**
```typescript
const prompt = `
ユーザーは以下の診断を完了しています：
${completedTests.map(t => `- ${t.name}: ${t.score}`).join('\n')}

未受験の診断：
${remainingTests.map(t => `- ${t.name}: ${t.description}`).join('\n')}

次に受けるべき診断を1つ推奨し、理由を説明してください。
`;
```

**所要時間**: 2-3時間

---

## 💰 Phase 5: 収益化（将来）

### 5.1 無料版（psychtest.jp）
- 全診断無料
- Google AdSense
- Amazon/Rakuten アフィリエイト（心理学書籍）

### 5.2 有料版（app.psychtest.jp）
- AI エージェント無制限利用（サブスク ¥300-500/月）
- 診断結果の長期保存・分析
- プレミアムエージェント（専門家監修）
- 広告なし

**ドメイン分離理由**: AdSenseポリシー違反回避（AIチャットは広告と併用不可）

---

## 📅 Sprint計画

### Sprint 1: メンタルヘルス診断拡充（2-3日）
**目標**: PHQ-9に加えK6・PSSを実装し、メンタルヘルス診断を完成

- [ ] K6実装（2-3h）
  - [ ] 6問の質問データ作成（日本語版）
  - [ ] スコアリングロジック（0-24点）
  - [ ] 重症度判定結果ページ
  - [ ] 高スコア警告システム（13点以上）
  - [ ] 著作権表記（Copyright © Ronald C. Kessler）
- [ ] PSS実装（2-3h）
  - [ ] 10問の質問データ
  - [ ] ストレススコアリング
  - [ ] 結果ページ
- [ ] ダッシュボード拡張（2h）
  - [ ] メンタルヘルス指標の統合表示
  - [ ] トレンド可視化

**完了基準**:
- メンタルヘルス3診断完了（PHQ-9, K6, PSS）
- ダッシュボードで統合分析可能
- K6は国民生活基礎調査と同じ尺度を使用

---

### Sprint 2: 愛着スタイル診断（3-4日）
**目標**: Trait層に愛着スタイル診断を追加

- [ ] ECR-R短縮版実装（4-5h）
  - [ ] 12問の質問データ（日本語版）
  - [ ] 2軸スコアリング（不安・回避）
  - [ ] 4タイプ分類ロジック
  - [ ] 2D散布図での結果ページ
- [ ] 愛着スタイル解釈コンテンツ（2h）
  - [ ] 各タイプの説明
  - [ ] 対人関係パターンの洞察
- [ ] ダッシュボード拡張（2h）
  - [ ] 愛着スタイル可視化

**完了基準**:
- ECR-R実装完了
- 4タイプに分類可能
- 2D散布図で自分の位置を確認可能

---

### Sprint 3: AI機能基盤（3-4日）
**目標**: BYOK Chat実装 → **AI機能リリース**

- [ ] BYOK Chat実装（5-6h）
  - [ ] /chat ページ
  - [ ] Vercel AI SDK統合
  - [ ] APIキー設定UI
  - [ ] システムプロンプト生成
- [ ] 複数エージェント実装（3-4h）
  - [ ] カウンセラーエージェント
  - [ ] キャリアコーチエージェント
  - [ ] メンタルヘルス案内エージェント
- [ ] おすすめ診断機能（2-3h）
  - [ ] ルールベース推奨
  - [ ] LLMベース推奨（オプション）

**完了基準**:
- AIと診断結果について対話可能
- 3種類のエージェントが動作
- 未受験診断を推奨してくれる
- **→ AI機能リリース**

---

### Sprint 4: キャリア・価値観診断（5-7日）
**目標**: Outcome層・Trait層を完全カバー

- [ ] RIASEC実装（6-8h）
  - [ ] 48問の質問データ
  - [ ] 6次元スコアリング
  - [ ] レーダーチャート結果ページ
  - [ ] 職業提案機能
- [ ] MAAS実装（3-4h）
  - [ ] 15問の質問データ
  - [ ] スコアリングロジック
  - [ ] マインドフルネス解釈
- [ ] ダッシュボード完成（3h）
  - [ ] 全診断の統合可視化
  - [ ] フレームワーク全体像の表示

**完了基準**:
- RIASEC・MAAS実装完了
- フレームワークの主要カテゴリをカバー
- **→ 正式公開準備完了**

---

## 🎓 学術的根拠リファレンス

### Tier S (Gold Standard)
- **Big Five**: 最も研究されている性格モデル、数万の研究
- **PHQ-9**: うつスクリーニングの国際標準
- **Rosenberg Self-Esteem**: 50,000+引用、最も使われる自尊心尺度

### Tier A (Strong Support)
- **K6**: 国民生活基礎調査採用、心理的苦痛スクリーニング（Kessler et al., 2002）
- **Self-Concept Clarity (SCCS)**: α=0.86, retest r=0.79、2,000+引用
- **ECR-R**: 愛着理論の標準尺度
- **VIA Character Strengths**: ポジティブ心理学の主要尺度
- **PSS**: ストレス研究で広く使用
- **RIASEC**: Holland理論、キャリアカウンセリングの基礎
- **SWLS**: 人生満足度の標準尺度（Diener et al., 1985）

### Tier C (非推奨)
- **MBTI/16Personalities**: 再テスト信頼性 r=0.50（低い）、学術的支持弱い
- **動物診断系**: 科学的根拠なし

---

## 📚 リソース

### 心理尺度データベース
- IPIP: https://ipip.ori.org/ (Public Domain)
- PHQ/GAD: https://www.phqscreeners.com/ (Free)
- VIA: https://www.viacharacter.org/ (Free version available)

### 技術スタック
- Next.js 16: https://nextjs.org/
- Vercel AI SDK: https://sdk.vercel.ai/
- Recharts: https://recharts.org/
- Tailwind CSS v4: https://tailwindcss.com/

### 競合分析
- 16Personalities: UXフロー参考（学術性は低い）
- commutest.com: 日本語UI参考（信頼性チェックなしと明記）

---

## ✅ 定義完了（Definition of Done）

各フェーズの完了基準：

**Phase 1 完了 ✅**:
- [x] 5つの診断を受験可能（Big Five, Rosenberg, PHQ-9, SWLS, Self-Concept）
- [x] ダッシュボードで統合分析表示
- [x] 全データがlocalStorageに永続化
- [x] Trait-State-Outcome フレームワークの可視化
- [x] E2Eテスト導入

**Phase 2 完了**:
- [ ] K6/PSS実装（メンタルヘルス診断完成）
- [ ] ECR-R実装（愛着スタイル診断）
- [ ] 高スコア時の専門家受診案内表示
- [ ] フレームワーク主要カテゴリの80%カバー

**Phase 3 完了 → 🚀 正式公開**:
- [ ] RIASEC実装（キャリア診断）
- [ ] MAAS実装（マインドフルネス）
- [ ] フレームワーク全体の可視化完成
- [ ] 100問超の診断パッケージ完成

**Phase 4 完了**:
- [ ] BYOK Chatで診断結果を元に対話可能
- [ ] 3種類以上のエージェントが動作
- [ ] おすすめ診断機能が動作
- [ ] APIキー設定がlocalStorageに保存

---

## 🔄 次のアクション

**最優先（今すぐ開始可能）**:
1. K6 実装（心理的苦痛スクリーニング）
2. PSS 実装（ストレス認知尺度）
3. ECR-R 実装（愛着スタイル診断）

**推奨開始順序**:
```bash
# 1. K6実装（国民生活基礎調査と同じ心理的苦痛スクリーニング）
# 2. PSS実装（メンタルヘルス診断完成）
# 3. ECR-R実装（対人関係の傾向を測定）
# 4. AI機能（BYOK Chat）
```

**中長期タスク**:
- RIASEC実装（キャリア診断）
- MAAS実装（マインドフルネス）
- VIA Character Strengths統合
- 収益化準備（AdSense設定、アフィリエイト）

---

**最終更新**: 2026-01-19
**次回レビュー**: Sprint 1完了後
