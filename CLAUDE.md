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

### Academic Scale Tiers

**Tier S (Gold Standard)**: Big Five, Industriousness (IPIP-300 C4+C5), PHQ-9, K6, Rosenberg Self-Esteem, SWLS
**Tier A (Strong Support)**: Self-Concept Clarity, ECR-R, VIA, PSS, RIASEC
**Tier C (Not Recommended)**: MBTI/16Personalities (low retest reliability r=0.50), animal-type quizzes

### Key Scales Reference

#### IPIP-NEO (Big Five) ✅ **Implemented**
- **Public Domain** (completely free)
- Goldberg (1992), International Personality Item Pool
- Versions: 300-item (research), 120-item (standard), 60-item (short), 20-item Mini-IPIP (ultra-short)
- **Current implementation**: 120-item version (30 facets)
- Measures: Extraversion, Agreeableness, Conscientiousness, Neuroticism, Openness
- Each domain has 6 facets (4 items per facet)
- Resource: https://ipip.ori.org/

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
- 12 items, 5-point Likert
- Cronbach's α = 0.86, retest r = 0.79 (4 months)
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

### Phase 6: Core Code Generation (3 files)
- [ ] `data/{scale}-questions.ts` - Question data, scale info, scale labels
- [ ] `lib/scoring/{scale}.ts` - Scoring logic, interpretation function
- [ ] `lib/tests/configs/{scale}.ts` - Test configuration (TestConfig)

### Phase 7: Page Generation (3 files)
- [ ] `app/{scale}/page.tsx` - Landing page with scale description
- [ ] `app/{scale}/test/page.tsx` - Test interface with questions
- [ ] `app/results/{scale}/page.tsx` - Results display page

### Phase 8: Integration (4 files)
- [ ] `lib/tests/test-registry.ts` - Add import and register config
- [ ] `lib/storage.ts` - Add to TestType union, add TestResult type, add to UserProfile.tests
- [ ] `app/page.tsx` - Add to LAYER I/II/III/IV list (✅) AND add test card
- [ ] `app/dashboard/page.tsx` - Add to testInfo Record with available: true

### Documentation Updates (3 files + total count)
- [ ] `CLAUDE.md` - Update:
  - [ ] Trait/State/Outcome/Skill framework table (add row with ✅ status)
  - [ ] Academic Scale Tiers (add to Tier S/A/B)
  - [ ] Key Scales Reference (add detailed section)
  - [ ] Total question count (calculate: previous + new items)
- [ ] `README.md` - Update:
  - [ ] Project structure (add `app/{scale}/` directory)
  - [ ] Project structure (add `lib/scoring/{scale}.ts`)
  - [ ] Project structure (add `data/{scale}-questions.ts`)
  - [ ] Implemented features list (add new test with ✅)
  - [ ] Total question count (same as CLAUDE.md)
  - [ ] License & Academic References section (add citation)
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
- Self-Concept: 12 items
= 182 items total

After adding GAD-7 (7 items):
New Total = 182 + 7 = 189 items
```

**⚠️ CRITICAL**: Always update the total question count in CLAUDE.md, README.md, and ROADMAP.md simultaneously to avoid inconsistencies.

---

**Note**: For detailed implementation roadmap, sprint planning, and future features, see [ROADMAP.md](./ROADMAP.md).
