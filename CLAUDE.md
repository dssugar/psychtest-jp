# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

心理テストサイト「スペクトル診断」- 学術的に裏付けのある心理テストを集めたWebサイト。
複数の診断を組み合わせて、その人の全体像（自己認識、価値観、性格特性、対人スタイル、メンタル状態、適職）を多面的に捉える。
全ての波長で心を解析し、科学的根拠に基づいた信頼性の高い診断を提供。

### Tech Stack

- **Frontend**: Static site (HTML/JS/CSS)
- **Hosting**: Cloudflare Pages (free tier)
- **Domain**: psychtest.jp
- **Data Storage**: localStorage (no backend/database in Phase 1)
- **UI Framework**: Tailwind CSS for modern UI
- **No API costs**: Fully static

### Monetization Strategy

- Google AdSense
- Amazon/Rakuten affiliate links
- Future: AI companion app (subscription) on separate domain to avoid AdSense policy conflicts

## Commands

This is a new project - commands will be added as the build system is established.

## Architecture

### Data Model - Trait-State-Outcome-Skill Framework

心理学では、心理測定を4つの層で理解します：

#### 【Trait - 特性】比較的安定した個人差

| Category | Measures | Scales Used |
|----------|----------|-------------|
| 性格特性 (Personality) | How you behave | Big Five (IPIP-NEO) |
| 愛着スタイル (Attachment) | How you relate | ECR-R |
| 価値観・強み (Values/Strengths) | What you value | VIA Character Strengths |

#### 【State - 状態】現在の心理状態（変化しうる）

| Category | Measures | Scales Used |
|----------|----------|-------------|
| メンタルヘルス (Mental Health) | Current symptoms | PHQ-9, GAD-7, PSS |
| 自己認識 (Self-Concept) | Self-understanding clarity | SCCS |

#### 【Outcome - 成果】特性と状態の結果

| Category | Measures | Scales Used |
|----------|----------|-------------|
| 自尊心 (Self-Esteem) | Self-worth evaluation | Rosenberg Self-Esteem |
| キャリア適合 (Career Fit) | Job-person match | RIASEC |

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

**Tier S (Gold Standard)**: Big Five, PHQ-9, GAD-7, Rosenberg Self-Esteem
**Tier A (Strong Support)**: Self-Concept Clarity, ECR-R, VIA, PSS, RIASEC
**Tier C (Not Recommended)**: MBTI/16Personalities (low retest reliability r=0.50), animal-type quizzes

### Key Scales Reference

#### Self-Concept Clarity Scale (SCCS)
- Campbell et al. (1996), JPSP, 70(1), 141-156
- 12 items, 5-point Likert
- Cronbach's α = 0.86, retest r = 0.79 (4 months)
- Many reverse-scored items

#### Rosenberg Self-Esteem Scale
- Rosenberg (1965), 10 items, 4-point Likert
- Cronbach's α = 0.77-0.88, retest r = 0.82-0.85
- 50,000+ citations

#### IPIP-NEO (Big Five)
- **Public Domain** (completely free)
- Versions: 300-item (research), 120-item (standard), 60-item (short), 20-item Mini-IPIP (ultra-short)
- Measures: Extraversion, Agreeableness, Conscientiousness, Neuroticism, Openness
- Resource: https://ipip.ori.org/

#### ECR-R (Attachment)
- Fraley et al. (2000), 36 items (12-18 for short), 7-point Likert
- Two axes: Anxiety, Avoidance
- Four types: Secure, Preoccupied, Dismissive, Fearful

#### PHQ-9 (Depression Screening)
- Kroenke et al. (2001), 9 items, 4-point (0-3)
- Cronbach's α = 0.86-0.89
- Scores: 0-4 (none), 5-9 (mild), 10-14 (moderate), 15-19 (mod-severe), 20-27 (severe)
- **Free to use (Pfizer-provided)**

#### GAD-7 (Anxiety Screening)
- Spitzer et al. (2006), 7 items, 4-point (0-3)
- Scores: 0-4 (minimal), 5-9 (mild), 10-14 (moderate), 15-21 (severe)
- **Free to use**

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

**Note**: For detailed implementation roadmap, sprint planning, and future features, see [ROADMAP.md](./ROADMAP.md).
