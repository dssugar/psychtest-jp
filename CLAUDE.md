# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

心理テストサイト「スペクトル診断」- 学術的に裏付けのある心理テストを集めたWebサイト。
複数の診断を組み合わせて、その人の全体像（自己認識、価値観、性格特性、対人スタイル、メンタル状態、適職）を多面的に捉える。
全ての波長で心を解析し、科学的根拠に基づいた信頼性の高い診断を提供。

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Hosting**: Cloudflare Pages (static export)
- **Domain**: psychtest.jp
- **Data Storage**: localStorage (no backend/database in current phase)
- **No API costs**: Fully static

### Monetization Strategy

- Google AdSense
- Amazon/Rakuten affiliate links
- Future: AI companion app (subscription) on separate domain to avoid AdSense policy conflicts

## Commands

```bash
# Development
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run type-check   # TypeScript type checking

# Build & Deploy
npm run build        # Build static site (output: out/)
npx serve out        # Preview built site locally

# Testing
npm run test:e2e     # Run E2E tests (Playwright)
npm run test:e2e:ui  # E2E tests with UI mode
```

## Architecture

### Data Model - Trait-State-Outcome-Skill Framework

心理学では、心理測定を4つの層で理解します：

#### 【Trait - 特性】比較的安定した個人差

| Category | Measures | Scales Used | Status |
|----------|----------|-------------|--------|
| 性格特性 (Personality) | How you behave | Big Five (IPIP-NEO) | ✅ **Implemented** |
| 勤勉性 / やり抜く力 (Industriousness / Grit) | Achievement & perseverance | IPIP-300 C4+C5 | ✅ **Implemented** |
| 愛着スタイル (Attachment) | How you relate | ECR-R | Planned |
| 価値観・強み (Values/Strengths) | What you value | VIA Character Strengths | Planned |

#### 【State - 状態】現在の心理状態（変化しうる）

| Category | Measures | Scales Used | Status |
|----------|----------|-------------|--------|
| メンタルヘルス (Mental Health) | Current symptoms | PHQ-9, K6, PSS | ✅ **PHQ-9, K6 Implemented** |
| 自己認識 (Self-Concept) | Self-understanding clarity | Self-Concept Clarity Scale | ✅ **Implemented** |

#### 【Outcome - 成果】特性と状態の結果

| Category | Measures | Scales Used | Status |
|----------|----------|-------------|--------|
| 自尊心 (Self-Esteem) | Self-worth evaluation | Rosenberg Self-Esteem | ✅ **Implemented** |
| 主観的幸福感 (Subjective Well-being) | Life satisfaction | SWLS | ✅ **Implemented** |
| キャリア適合 (Career Fit) | Job-person match | RIASEC | Planned |

#### 【Skill/Capacity - スキル・能力】育成可能な力（将来的に追加予定）

| Category | Measures | Scales Used |
|----------|----------|-------------|
| レジリエンス (Resilience) | Stress recovery capacity | CD-RISC (planned) |
| マインドフルネス (Mindfulness) | Present-moment awareness | MAAS (planned) |
| 対処スタイル (Coping) | Stress coping strategies | Brief COPE (planned) |

**学術的根拠**: Trait-State-Outcome モデル ([Steyer et al., 1999](https://psycnet.apa.org/record/1999-05160-001))

**拡張性**: このフレームワークは拡張可能で、新しい心理尺度を体系的に追加できます。

### Implementation Plan

**詳細な実装計画は [ROADMAP.md](./ROADMAP.md) を参照してください。**

---

## Architecture & Design Patterns

### Core Design Principles

このプロジェクトは以下の設計原則に基づいています：

1. **Configuration-Driven Architecture**: 各テストを`TestConfig`インターフェースで統一
2. **Type-Safe Registry Pattern**: すべてのテストを`testRegistry`で一元管理
3. **Separation of Concerns**: データ、スコアリング、UI、分析を明確に分離
4. **Academic Metadata First**: 学術的信頼性情報を設定に組み込み
5. **Framework-Based Organization**: Trait-State-Outcome-Skill層で体系化

### Data Flow Architecture

```
1. データ層 (data/*-questions.ts)
   ├─ 質問データ
   ├─ 尺度情報 (ScaleInfo)
   └─ 選択肢定義 (ScaleOption)

2. ロジック層 (lib/tests/*.ts)
   ├─ スコアリング関数 (calculateScore)
   ├─ バリデーション関数 (validateAnswers)
   ├─ 解釈文生成 (interpretation)
   └─ テスト設定 (TestConfig)

3. レジストリ層 (lib/tests/test-registry.ts)
   └─ 全テストの統一管理

4. ストレージ層 (lib/storage.ts)
   ├─ localStorage抽象化
   ├─ UserProfile型定義
   └─ テスト結果の永続化

5. 分析層 (lib/analysis/synthesis.ts)
   ├─ 複数テスト統合分析
   ├─ 象限分析 (2D quadrant)
   └─ トップ特性抽出

6. UI層 (app/*/page.tsx, components/*)
   ├─ テストページ (質問表示)
   ├─ 結果ページ (スコア可視化)
   └─ ダッシュボード (統合表示)
```

### Key Design Patterns

#### 1. TestConfig Pattern (統一テスト設定)

全テストを統一インターフェースで管理することで、拡張性と保守性を確保：

```typescript
interface TestConfig<TResult> {
  id: TestType;
  color: "blue" | "pink" | "green" | ...;
  basePath: string;
  questions: TQuestion[];
  scaleOptions: ScaleOption[];
  calculateScore: (answers: number[]) => TResult;
  validateAnswers?: (answers: number[]) => ValidationResult;
  scaleInfo: ScaleInfo;  // 学術的メタデータ
  scoreDisplay?: ScoreDisplayConfig;
  resultAlerts?: AlertConfig[];  // PHQ-9/K6の高スコア警告
  ogImage?: OGImageConfig;       // SNSシェア画像設定
}
```

**メリット**:
- 新規テスト追加が容易（3ファイル + レジストリ登録のみ）
- 型安全性が高い（TypeScriptの恩恵を最大化）
- 設定の一元管理（散在しない）

#### 2. Registry Pattern (テストレジストリ)

全テストを`testRegistry`オブジェクトで一元管理：

```typescript
export const testRegistry = {
  rosenberg: rosenbergConfig,
  bigfive: bigFiveConfig,
  selfconcept: selfConceptConfig,
  phq9: phq9Config,
  swls: swlsConfig,
  k6: k6Config,
  industriousness: industriousnessConfig,
} as const;
```

**使用例**:
```typescript
// 型安全なテスト設定取得
const config = getTestConfig("bigfive");
const questions = config.questions;
const result = config.calculateScore(answers);
```

#### 3. Psychological Layer Architecture (心理層アーキテクチャ)

`ScaleInfo`に`psychologicalLayer`フィールドを持たせ、フレームワークベースの体系化：

```typescript
interface ScaleInfo {
  psychologicalLayer: "trait" | "state" | "outcome" | "skill";
  category: string;  // 性格特性、自己認識、メンタルヘルスなど
  // ...
}
```

**活用例**:
- 層間の関係性分析 (Trait → State → Outcome)

#### 4. Synthesis Pattern (統合分析)

複数テスト結果を統合解析する専用モジュール (`lib/analysis/synthesis.ts`):

```typescript
// 2次元象限分析
function getQuadrant(x: number, y: number): QuadrantType
function generateSelfAwarenessInsight(sccs, rosenberg): string

// トップ特性抽出
function extractTopTraits(bigFive): TopTraits[]
function extractTopFacets(facets): TopFacets[]

// 統合インサイト生成
function generateMultiTestSynthesis(profile, completedTests): string
```

**使用場面**:
- 自己認識マトリクス (Self-Concept × Rosenberg)
- Big Fiveトップ3特性のハイライト
- 複数テスト結果の統合メッセージ

#### 5. OG Image Generation (動的OG画像)

Cloudflare Pages Functions + `@vercel/og` でSNSシェア用画像を動的生成：

```typescript
// functions/og/[test].tsx
export const onRequest: PagesFunction = async (context) => {
  const { test } = context.params;
  const url = new URL(context.request.url);

  // URLパラメータからスコア復元
  const scores = paramsToScore(url.searchParams);

  // 画像レンダリング
  return new ImageResponse(<OGTemplate scores={scores} />);
};
```

**実装ステータス**:
- ✅ Big Five: 5次元バー表示（`layoutType: "bar"`）
- 📋 Rosenberg/PHQ-9: single scoreレイアウト（計画中）

### Component Architecture

```
components/
├── dashboard/          # ダッシュボード専用コンポーネント
│   ├── ProfileOverview.tsx          # プロファイル概要
│   └── IntegratedAnalysis.tsx       # 統合分析
├── viz/                # データビジュアライゼーション
│   ├── RadarChart.tsx               # レーダーチャート
│   ├── DataBadge.tsx                # データバッジ
│   └── StatCard.tsx                 # 統計カード
├── results/            # 結果表示コンポーネント
│   └── ResultSummaryCard.tsx        # 結果サマリーカード
├── bigfive/            # Big Five専用コンポーネント
│   ├── FacetDetails.tsx             # ファセット詳細
│   ├── MBTIEstimation.tsx           # MBTI推定
│   └── EnneagramEstimation.tsx      # エニアグラム推定
└── share/              # SNSシェアコンポーネント
    └── SocialShareButtons.tsx       # シェアボタン
```

**設計方針**:
- テスト固有UIは専用ディレクトリに分離 (`components/bigfive/`)
- 再利用可能なビジュアライゼーションは`viz/`に集約
- ダッシュボード機能は`dashboard/`に集約

### File Organization Strategy (Locality of Behavior)

**原則**: 関連するコードは近くに配置（凝集度優先）

```
lib/tests/rosenberg.ts
├─ RosenbergResult型定義
├─ calculateRosenbergScore()
├─ getInterpretation()
├─ validateAnswerPattern()
└─ rosenbergConfig (TestConfig)

data/rosenberg-questions.ts
├─ rosenbergQuestions配列
├─ scaleOptions配列
└─ scaleInfo (ScaleInfo)
```

**メリット**:
- 1つのテストに関わるコードが1-2ファイルに集約
- 変更時の影響範囲が明確
- コードレビューが容易

### Type Safety & Validation

**型定義の階層**:
```typescript
// 1. ストレージ型 (lib/storage.ts)
type TestType = "rosenberg" | "bigfive" | ...
type RosenbergTestResult = TestResult<RosenbergResult>

// 2. 結果型 (lib/tests/rosenberg.ts)
interface RosenbergResult {
  rawScore: number;
  percentageScore: number;
  level: "very_low" | "low" | "medium" | "high" | "very_high";
  interpretation: string;
}

// 3. バリデーション型 (lib/tests/types.ts)
interface ValidationResult {
  valid: boolean;
  warning?: string;
  message?: string;
}
```

**バリデーション戦略**:
- 全テストで回答パターンの妥当性をチェック
- 単調な回答（全て同じ値）を警告
- PHQ-9/K6で高スコア時に専門家受診を推奨

### Next Steps for Architecture

**Phase 2**:
- ECR-R追加時に2D散布図コンポーネントを実装 (`AttachmentPlot.tsx`)
- RIASECで6次元レーダーチャートを追加

**Phase 3**:
- AI機能実装時にBYOK Chat設定管理を追加
- エージェントシステムの設定ファイル化

---

### Academic Scale Tiers

**Tier S (Gold Standard)**: Big Five, Industriousness (IPIP-300 C4+C5), PHQ-9, K6, Rosenberg Self-Esteem, SWLS
**Tier A (Strong Support)**: Self-Concept Clarity, ECR-R, VIA, PSS, RIASEC
**Tier C (Not Recommended)**: MBTI/16Personalities (low retest reliability r=0.50), animal-type quizzes

### Key Scales Reference

#### IPIP-NEO (Big Five) ✅ **Implemented**
- **Public Domain** (completely free)
- **Developer**: Goldberg (1992) [IPIP]; Johnson (2014) [IPIP-NEO-120]
- **Journal**: Journal of Research in Personality, 48, 76-88
- **Tier S (Gold Standard)**: 最高レベルの学術的信頼性
  - **Cronbach's α**: 0.81-0.90 (5次元), 0.63-0.88 (30ファセット)
  - **Test-Retest**: r = 0.83-0.91 (2年間) ※NEO-PI-R同等
  - **Citations**: 500+ (IPIP-120), 数万件 (Big Five理論全体)
- **Versions**: 300-item (研究用), 120-item (標準), 60-item (短縮), 20-item Mini-IPIP (超短縮)
- **Current implementation**: 120-item version (30 facets)
- **Measures**: 5次元 × 30ファセット
  - **Neuroticism (神経症傾向)**: 感情の安定性、ストレス反応
  - **Extraversion (外向性)**: 社交性、活動性、ポジティブ感情
  - **Openness (開放性)**: 知的好奇心、創造性、新しい経験への開放性
  - **Agreeableness (協調性)**: 利他性、共感性、協力性
  - **Conscientiousness (誠実性)**: 計画性、勤勉性、自己規律
- **Scoring**:
  - 5-point Likert scale (1-5)
  - Dimension scores: 24-120 points (Low: 24-60, Medium: 61-83, High: 84-120)
  - Facet scores: 4-20 points
  - 55 reverse-scored items (45.8%)
- **商用版との比較**: NEO-PI-R ($300-400 USD) と同等の測定精度を無料で提供
- **Academic Superiority**: MBTI/16Personalitiesと異なり、再テスト信頼性が高く(r > .80)、学術的に検証済み
- **Resource**: https://ipip.ori.org/

#### Industriousness / Grit ✅ **Implemented**
- **Public Domain** (IPIP-300)
- DeYoung, Quilty, & Peterson (2007), Big Five Aspect Scale
- 20 items, 5-point Likert (C4: Achievement Striving + C5: Self-Discipline)
- Cronbach's α = 0.82 (combined), C4: 0.79, C5: 0.85
- 2×2 matrix visualization with 4 quadrant types
- **Alternative to Grit Scale** (Duckworth et al., 2007) - r > .75 correlation
- Grit concept overlaps with Conscientiousness facets (Credé et al., 2017)

#### Rosenberg Self-Esteem Scale ✅ **Implemented**
- Rosenberg (1965), 10 items, 4-point Likert
- Cronbach's α = 0.77-0.88, retest r = 0.82-0.85
- 50,000+ citations
- 5 reverse-scored items

#### PHQ-9 (Depression Screening) ✅ **Implemented**
- Kroenke et al. (2001), 9 items, 4-point (0-3)
- Cronbach's α = 0.86-0.89
- Scores: 0-4 (none), 5-9 (mild), 10-14 (moderate), 15-19 (mod-severe), 20-27 (severe)
- **Free to use (Pfizer-provided)**

#### SWLS (Satisfaction With Life Scale) ✅ **Implemented**
- Diener et al. (1985), 5 items, 7-point Likert
- Cronbach's α = 0.87, retest r = 0.82
- Scores: 5-9 (extremely dissatisfied), 10-14 (dissatisfied), 15-19 (slightly dissatisfied), 20 (neutral), 21-25 (slightly satisfied), 26-30 (satisfied), 31-35 (extremely satisfied)
- **Permission from Ed Diener**

#### Self-Concept Clarity Scale ✅ **Implemented**
- Campbell et al. (1996), JPSP, 70(1), 141-156
- **Implementation**: IPIP Self-Consciousness Facet (8 items, public domain alternative)
- Original SCCS: 12 items, α = 0.86, construct validity r > .70 with original scale
- 5-point Likert scale
- Many reverse-scored items

#### K6 (Kessler Psychological Distress Scale) ✅ **Implemented**
- Kessler et al. (2002), 6 items, 5-point (0-4)
- Scores: 0-4 (no distress), 5-9 (mild), 10-12 (moderate), 13+ (severe)
- Cronbach's α = 0.89
- **Copyright-free for non-commercial use**
- Used in Japan's National Livelihood Survey (国民生活基礎調査)
- Japanese version: Furukawa et al. (2003)
- Copyright © Ronald C. Kessler (attribution required)

#### ECR-R (Attachment) - Planned
- Fraley et al. (2000), 36 items (12-18 for short), 7-point Likert
- Two axes: Anxiety, Avoidance
- Four types: Secure, Preoccupied, Dismissive, Fearful

## Critical Implementation Requirements

### Licensing & Legal

- **IPIP scales**: Public domain, completely free
- **PHQ-9/GAD-7**: Free for use (Pfizer-provided), no permission needed
- **VIA**: Use official site integration (free version available)
- Some scales may require permission for commercial use - verify before implementation

### Disclaimers (MANDATORY)

ALL result pages MUST include:
```
⚠️ この診断は医療診断ではありません
このテストはスクリーニング目的の心理尺度です。
深刻な症状がある場合は、必ず医療専門家にご相談ください。
```

For PHQ-9/GAD-7 specifically, emphasize "スクリーニング目的" (screening purpose only).

### Japanese Translation

- Many scales have validated Japanese versions - use these
- For untranslated scales, use back-translation methodology
- Verify reliability coefficients (Cronbach's α) for Japanese versions

### Data Display - Differentiation Strategy

Each scale result MUST show academic credibility:
```
📊 学術的信頼性: ★★★★★
開発: Campbell et al. (1996)
信頼性: Cronbach's α = 0.86
再テスト信頼性: r = 0.79 (4ヶ月)
引用論文数: 2,000+

📖 原著論文: [Full citation with link]
```

**Messaging**: 「当たる診断」ではなく「測れる診断」
"Not 'accurate fortune-telling' but 'scientific measurement'"

### Result Integration - "丸裸プロファイル" (Complete Profile)

Combine multiple assessments into unified dashboard showing:
- Self-awareness metrics (SCCS, Rosenberg)
- Big Five radar chart
- Attachment style 2D plot (Anxiety × Avoidance axes)
- Mental health indicators (if applicable)
- Overall insights paragraph synthesizing results

### Competitive Differentiation

vs. 16Personalities/mgram:
- ✅ ALL scales academically validated
- ✅ Reliability coefficients (α) disclosed
- ✅ Links to original research papers
- ✅ "Science" not "entertainment"
- ✅ Multi-scale integrated analysis

vs. commutest.com:
- They explicitly state "統計的な信頼性・妥当性チェックを行っていません" (no reliability/validity checks)
- We validate everything

## Resources

### Scale Repositories
- IPIP: https://ipip.ori.org/
- PHQ-9/GAD-7: https://www.phqscreeners.com/
- VIA: https://www.viacharacter.org/

### Competitor Analysis (for UI/UX reference only)
- commutest.com (Japanese, simple UI)
- 16personalities.com (UX flow)

### Academic Search
- Google Scholar
- PubMed
- PsycINFO

---

## 🔄 New Test Implementation Checklist

When adding a new psychological test/scale, **ALWAYS** update the following files:

### Phase 6: Core Code Generation (2 files)
- [ ] `data/{scale}-questions.ts` - Question data, scale info, scale labels
- [ ] `lib/tests/{scale}.ts` - Scoring logic, interpretation function, TestConfig

### Phase 7: Page Generation (0 files - 動的ルート使用)
- **動的ルート使用**: `app/[testType]/page.tsx`, `app/test/[testType]/page.tsx`, `app/results/[testType]/page.tsx` が自動的に新規テストに対応
- 新規ファイル作成は**不要**（レジストリ登録のみで自動生成）
- **例外**: 特殊な結果表示が必要な場合のみ `app/results/{scale}/page.tsx` を個別作成（例: Big Five のファセット詳細）

### Phase 8: Integration (4 files)
- [ ] `lib/tests/test-registry.ts` - Add import and register config
- [ ] `lib/storage.ts` - Add to TestType union, add TestResult type, add to UserProfile.tests
- [ ] `app/page.tsx` - Add to LAYER I/II/III/IV list (✅) AND add test card (StatCardコンポーネント使用)
- [ ] `app/dashboard/page.tsx` - Add to testInfo Record with available: true

### Documentation Updates (3 files + total count)
- [ ] `CLAUDE.md` - Update:
  - [ ] Trait/State/Outcome/Skill framework table (add row with ✅ status)
  - [ ] Academic Scale Tiers (add to Tier S/A/B)
  - [ ] Key Scales Reference (add detailed section)
  - [ ] Total question count (calculate: previous + new items)
- [ ] `README.md` - Update:
  - [ ] Implemented features list (add new test with ✅)
  - [ ] Total question count (same as CLAUDE.md)
  - [ ] License & Academic References section (add citation)
  - **注**: プロジェクト構造は動的ルート使用のため更新不要
- [ ] `ROADMAP.md` - Update:
  - [ ] Current status date (e.g., 2026-01-20)
  - [ ] Phase 1 completed tests list (add new test)
  - [ ] Framework implementation status table (update Trait/State/Outcome/Skill row)
  - [ ] Progress total question count (calculate: previous + new items)
  - [ ] Move from "Next candidates" to "Completed" if applicable

### Optional Updates (if applicable)
- [ ] `app/about/page.tsx` - Add to appropriate LAYER section with ✅
- [ ] `app/references/page.tsx` - Add academic reference card (if using alternative scale)

### Validation
- [ ] Run `npx tsc --noEmit` - No TypeScript errors
- [ ] Test in browser - All pages load correctly
- [ ] Check dashboard - Test appears in available/completed tests
- [ ] Verify localStorage - Results save/load correctly

### Example Calculation: Total Question Count
```
Current Total = Sum of all test items:
- Big Five (IPIP-120): 120 items
- Industriousness: 20 items
- Rosenberg: 10 items
- PHQ-9: 9 items
- K6: 6 items
- SWLS: 5 items
- Self-Concept: 8 items
= 178 items total

After adding GAD-7 (7 items):
New Total = 178 + 7 = 185 items
```

**⚠️ CRITICAL**: Always update the total question count in CLAUDE.md, README.md, and ROADMAP.md simultaneously to avoid inconsistencies.

---

**Note**: For detailed implementation roadmap, sprint planning, and future features, see [ROADMAP.md](./ROADMAP.md).
