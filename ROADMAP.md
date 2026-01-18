# スペクトル診断 - 実装ロードマップ

## 📍 現在地（2026-01-18）

### ✅ 完了
- **Phase 1 (一部)**: SCCS（自己概念の明確さ）12問 実装済み
- **デザインシステム**: ネオブルータリズム × データビジュアライゼーション
- **レスポンシブ対応**: モバイルファースト設計完了
- **ブランディング**: サイト名「スペクトル診断」、6色スペクトル背景
- **技術基盤**: Next.js 16 App Router、Tailwind CSS v4、TypeScript

### 🎯 目標
Trait-State-Outcome-Skill フレームワークに基づく包括的な心理診断を提供し、科学的根拠に基づいた「測れる診断」を実現

#### 【Trait - 特性】比較的安定した個人差

| Category | 測定内容 | 使用尺度 | 状態 |
|----------|----------|----------|------|
| 性格特性 (Personality) | 行動パターン | Big Five (IPIP-NEO) | Big Five✅ |
| 愛着スタイル (Attachment) | 関係性の傾向 | ECR-R | 未実装 |
| 価値観・強み (Values/Strengths) | 価値観と強み | VIA | 未実装 |

#### 【State - 状態】現在の心理状態

| Category | 測定内容 | 使用尺度 | 状態 |
|----------|----------|----------|------|
| 自己認識 (Self-Concept) | 自己理解の明確さ | SCCS | SCCS✅ |
| メンタルヘルス (Mental Health) | 現在の症状 | PHQ-9, GAD-7, PSS | 未実装 |

#### 【Outcome - 成果】特性と状態の結果

| Category | 測定内容 | 使用尺度 | 状態 |
|----------|----------|----------|------|
| 自尊心 (Self-Esteem) | 自己価値の評価 | Rosenberg | Rosenberg✅ |
| キャリア適合 (Career Fit) | 職業適性 | RIASEC | 未実装 |

#### 【Skill - スキル】育成可能な力（Phase 3以降）

| Category | 測定内容 | 使用尺度 | 状態 |
|----------|----------|----------|------|
| レジリエンス (Resilience) | ストレス回復力 | CD-RISC | 未実装 |
| マインドフルネス (Mindfulness) | 今への気づき | MAAS | 未実装 |
| 対処スタイル (Coping) | ストレス対処 | Brief COPE | 未実装 |

---

## 🚀 Phase 2: コアパッケージ完成（優先度：高）

**目標**: 50-60問、10-15分の診断パッケージ完成

### 2.1 診断の追加

#### 次の実装候補（優先順）

**1. Rosenberg Self-Esteem Scale（次に実装推奨）**
- **問題数**: 10問
- **次元**: 自己認識
- **難易度**: 低
- **信頼性**: Cronbach's α = 0.77-0.88, retest r = 0.82-0.85
- **引用数**: 50,000+
- **実装時間**: 2-3時間
- **特徴**:
  - 逆転項目あり（5問）
  - 4点リッカート尺度
  - SCCSと相性が良い（同じ自己認識次元）

**2. Mini-IPIP (Big Five 短縮版)**
- **問題数**: 20問（5次元 × 4問）
- **次元**: 性格特性
- **難易度**: 中
- **信頼性**: Tier S (Gold Standard)
- **実装時間**: 4-5時間
- **特徴**:
  - Public Domain（完全無料）
  - 5次元: Extraversion, Agreeableness, Conscientiousness, Neuroticism, Openness
  - 知名度が高く、ユーザー価値大

**3. ECR-R Short Form (Attachment Style)**
- **問題数**: 12問
- **次元**: 対人スタイル
- **難易度**: 中
- **実装時間**: 3-4時間
- **特徴**:
  - 2軸（不安・回避）で4タイプに分類
  - Secure, Preoccupied, Dismissive, Fearful
  - 7点リッカート尺度

---

### 2.2 データ永続化強化

#### 現在のストレージ構造
```typescript
// lib/storage.ts (現状)
export interface SccsResult {
  rawScore: number;
  percentageScore: number;
  level: SccsLevel;
  timestamp: string;
}
```

#### 拡張後のストレージ構造
```typescript
// lib/storage.ts (拡張版)
export interface UserProfile {
  userId?: string; // 将来的なOAuth対応用
  tests: {
    sccs?: TestResult<SccsResult>;
    rosenberg?: TestResult<RosenbergResult>;
    bigFive?: TestResult<BigFiveResult>;
    ecrR?: TestResult<EcrRResult>;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string; // データスキーマバージョン
  };
}

interface TestResult<T> {
  result: T;
  completedAt: string;
  retakeCount: number; // 再受験回数
}

// 汎用API
export const profileStorage = {
  saveTestResult<T>(testType: TestType, result: T): void;
  getProfile(): UserProfile | null;
  getTestResult<T>(testType: TestType): TestResult<T> | null;
  clearProfile(): void;
  exportProfile(): string; // JSON export
  importProfile(data: string): boolean; // JSON import
};
```

**実装タスク**:
- [ ] UserProfile型定義
- [ ] 汎用ストレージAPI作成
- [ ] マイグレーション機能（既存SCCSデータ → 新構造）
- [ ] エクスポート/インポート機能

**所要時間**: 2-3時間

---

### 2.3 統合ダッシュボード

#### `/dashboard` ページ

**機能**:
1. **全テスト結果サマリー**
   - 各テストのスコアをカード表示
   - 完了日時、再受験回数
   - 「再受験する」ボタン

2. **6次元レーダーチャート**
   - 各次元の正規化スコア（0-100）をプロット
   - インタラクティブ（ホバーで詳細表示）

3. **未受験診断の推奨**
   - 「次に受けるべき診断」を提案
   - Phase 3でLLMベースの推奨に進化

**技術スタック**:
- **チャート**: Recharts（Next.js互換、軽量）
- **レイアウト**: 既存のブルータリズムデザイン維持

**実装タスク**:
- [ ] /dashboard ページ作成
- [ ] レーダーチャートコンポーネント
- [ ] テストカードコンポーネント
- [ ] データ正規化ロジック（各テストの異なるスケールを0-100に変換）

**所要時間**: 4-5時間

---

## 🏥 Phase 3: メンタルヘルス診断（優先度：高）

**注意**: PHQ-9/GAD-7は医療スクリーニングツールのため、慎重な実装が必要

**目標**: Phase 2完了後、ここで**正式公開**（7診断、80問前後、6次元中4次元カバー）

### 3.1 追加診断

**PHQ-9 (Depression Screening)**
- 9問、4点尺度（0-3）
- スコア: 0-4 (none), 5-9 (mild), 10-14 (moderate), 15-19 (mod-severe), 20-27 (severe)
- **無料利用可（Pfizer提供）**

**GAD-7 (Anxiety Screening)**
- 7問、4点尺度（0-3）
- スコア: 0-4 (minimal), 5-9 (mild), 10-14 (moderate), 15-21 (severe)
- **無料利用可**

**PSS (Perceived Stress Scale)**
- 10問、5点尺度
- ストレス認知レベルを測定

---

### 3.2 必須の免責事項強化

**全結果ページに表示**:
```
⚠️ この診断は医療診断ではありません

このテストはスクリーニング目的の心理尺度です。
深刻な症状がある場合は、必ず医療専門家にご相談ください。

【相談窓口】
- こころの健康相談統一ダイヤル: 0570-064-556
- いのちの電話: 0570-783-556
```

**PHQ-9/GAD-7 特有の注意**:
- 高スコア（PHQ-9 ≥ 15, GAD-7 ≥ 15）の場合、結果ページで専門家受診を強く促す
- 自殺念慮項目（PHQ-9 Q9）で高スコアの場合、緊急窓口を表示

---

### 3.3 実装タスク

- [ ] PHQ-9 実装（3-4h）
  - [ ] 質問データ作成
  - [ ] スコアリングロジック
  - [ ] 結果ページ（重症度判定）
- [ ] GAD-7 実装（2-3h）
  - [ ] 質問データ作成
  - [ ] スコアリングロジック
  - [ ] 結果ページ
- [ ] PSS 実装（2-3h）
- [ ] 免責事項コンポーネント作成（1h）
- [ ] 高スコア警告システム（2h）

**所要時間**: 10-12時間

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

### Sprint 1: データ基盤 + Rosenberg（2-3日）
**目標**: 2つの診断 + 統合ビュー

- [ ] ストレージ層拡張（2-3h）
- [ ] Rosenberg自尊心テスト実装（3-4h）
  - [ ] 質問データ作成
  - [ ] スコアリングロジック
  - [ ] 結果ページ
- [ ] 簡易ダッシュボード作成（3-4h）
  - [ ] テスト結果カード
  - [ ] 未受験診断リンク

**完了基準**:
- SCCS + Rosenberg の2つを受験できる
- /dashboard で両方の結果が見える

---

### Sprint 2: Big Five + レーダーチャート（3-4日）
**目標**: 3診断 + 統合可視化

- [ ] Mini-IPIP（Big Five）実装（5-6h）
  - [ ] 20問の質問データ
  - [ ] 5次元スコアリング
  - [ ] レーダーチャート用の結果ページ
- [ ] レーダーチャート実装（3-4h）
  - [ ] Recharts導入
  - [ ] 6次元データ正規化
  - [ ] インタラクティブ機能
- [ ] ダッシュボード強化（2h）

**完了基準**:
- 3つの診断を受験できる
- ダッシュボードにレーダーチャート表示

---

### Sprint 3: メンタルヘルス診断（4-5日）
**目標**: 医療スクリーニング実装 → **正式公開**

- [ ] PHQ-9実装（3-4h）
  - [ ] 9問の質問データ
  - [ ] スコアリングロジック
  - [ ] 重症度判定結果ページ
- [ ] GAD-7実装（2-3h）
  - [ ] 7問の質問データ
  - [ ] スコアリングロジック
  - [ ] 重症度判定結果ページ
- [ ] PSS実装（2-3h）
  - [ ] 10問の質問データ
  - [ ] ストレススコアリング
- [ ] 免責事項システム（2h）
  - [ ] 医療診断ではない旨の警告
  - [ ] 高スコア時の専門家受診案内
  - [ ] 相談窓口情報表示

**完了基準**:
- 6つの診断を受験可能（SCCS, Rosenberg, Big Five, PHQ-9, GAD-7, PSS）
- 高スコア時に適切な警告が表示される
- **→ ここで正式公開**

---

### Sprint 4: ECR-R + AI基盤（3-4日）
**目標**: コアパッケージ完成 + AI機能開始

- [ ] ECR-R短縮版実装（4-5h）
  - [ ] 12問の質問データ
  - [ ] 2軸スコアリング（不安・回避）
  - [ ] 4タイプ分類結果
- [ ] BYOK Chat実装（5-6h）
  - [ ] /chat ページ
  - [ ] Vercel AI SDK統合
  - [ ] システムプロンプト生成
- [ ] 複数エージェント実装（3-4h）
  - [ ] カウンセラー
  - [ ] キャリアコーチ
  - [ ] メンタルヘルス案内
- [ ] おすすめ診断機能（2-3h）
  - [ ] ルールベース推奨
  - [ ] LLMベース推奨（オプション）

**完了基準**:
- 7つの診断完了（ECR-R追加でコアパッケージ完成）
- AIと診断結果について対話できる
- 3種類のエージェントが動作
- 未受験診断を推奨してくれる

---

## 🎓 学術的根拠リファレンス

### Tier S (Gold Standard)
- **Big Five**: 最も研究されている性格モデル、数万の研究
- **PHQ-9**: うつスクリーニングの国際標準
- **GAD-7**: 不安スクリーニングの国際標準
- **Rosenberg Self-Esteem**: 50,000+引用、最も使われる自尊心尺度

### Tier A (Strong Support)
- **Self-Concept Clarity (SCCS)**: α=0.86, retest r=0.79、2,000+引用
- **ECR-R**: 愛着理論の標準尺度
- **VIA Character Strengths**: ポジティブ心理学の主要尺度
- **PSS**: ストレス研究で広く使用
- **RIASEC**: Holland理論、キャリアカウンセリングの基礎

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

**Phase 2 完了**:
- [ ] 4つ以上の診断を受験可能（SCCS, Rosenberg, Big Five, ECR-R）
- [ ] ダッシュボードで統合レーダーチャート表示
- [ ] 全データがlocalStorageに永続化
- [ ] E2Eテストカバレッジ 80%+

**Phase 3 完了 → 🚀 正式公開**:
- [ ] PHQ-9/GAD-7/PSS実装
- [ ] 高スコア時の専門家受診案内表示
- [ ] 免責事項を全ページに表示
- [ ] 6次元中4次元をカバー（自己認識、性格特性、メンタル状態、対人スタイル）

**Phase 4 完了**:
- [ ] BYOK Chatで診断結果を元に対話可能
- [ ] 3種類以上のエージェントが動作
- [ ] おすすめ診断機能が動作
- [ ] APIキー設定がlocalStorageに保存

---

## 🔄 次のアクション

**最優先（今すぐ開始可能）**:
1. Rosenberg Self-Esteem Scale 実装
2. ストレージ層拡張
3. 簡易ダッシュボード作成

**推奨開始順序**:
```bash
# 1. ストレージ拡張（土台）
# 2. Rosenberg実装（2つ目の診断）
# 3. ダッシュボード（統合ビュー）
```

---

**最終更新**: 2026-01-18
**次回レビュー**: Sprint 1完了後
