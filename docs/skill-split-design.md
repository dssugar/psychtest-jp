# Skill Split Design - Academic Psychtest Builder

## Problem Statement

PHQ-9の実装で以下の課題が判明:
1. Phase 1-5のドキュメントが長く、コンテキスト圧縮で失われる可能性
2. ページファイル (page.tsx, test/page.tsx, results/page.tsx) が手動生成
3. ルートページ (app/page.tsx) の手動更新
4. ダッシュボード (app/dashboard/page.tsx) の手動更新
5. test-registry.ts, storage.ts の手動更新

## Solution: Two-Skill Architecture

### Skill 1: academic-psychtest-research

**Purpose**: Phase 1-5のリサーチとドキュメント生成

**Input**:
- Category (例: メンタルヘルス、性格特性)
- Psychological Layer (Trait/State/Outcome/Skill)
- Scale name (例: "GAD-7", "Resilience Scale")

**Workflow**:
1. **Phase 1**: Original paper research → `docs/scales/{scale}/phase1-research.md`
2. **Phase 2**: Japanese version research → `docs/scales/{scale}/phase2-japanese-version.md`
3. **Phase 3**: Item extraction → `docs/scales/{scale}/phase3-items.md`
4. **Phase 4**: Interpretation generation → `docs/scales/{scale}/phase4-interpretations.md`
5. **Phase 5**: Explanation content → `docs/scales/{scale}/phase5-explanation.md`

**Output**:
- 5つのMarkdownファイル (各Phase 1つずつ)
- Phase 3からはJSONデータも含む (questions, scaleLabels, scoring)

**User Confirmation Points**:
- Phase 1完了時: Tier判定、採用可否
- Phase 2完了時: 日本語版 or 独自翻訳
- Phase 5完了時: 実装スキルへ進むか確認

---

### Skill 2: academic-psychtest-implement

**Purpose**: Phase 6-8の実装 (コード、ページ、統合)

**Input**:
- Scale name (例: "gad7")
- Color theme (例: "orange")
- `docs/scales/{scale}/` のドキュメントファイル群

**Workflow**:

#### Phase 6: Core Code Generation
1. Read Phase 3 data (questions, scaleLabels, scoring)
2. Read Phase 4 interpretations
3. Generate files:
   - `data/{scale}-questions.ts`
   - `lib/scoring/{scale}.ts`
   - `lib/tests/configs/{scale}.ts`
4. TypeScript compilation check

#### Phase 7: Page Generation
1. Read Phase 5 explanation content
2. Generate pages:
   - `app/{scale}/page.tsx` (landing page)
   - `app/{scale}/test/page.tsx` (test page)
   - `app/results/{scale}/page.tsx` (results page)

#### Phase 8: Integration
1. Update `lib/tests/test-registry.ts` (add {scale}Config)
2. Update `lib/storage.ts` (add TestType, {Scale}TestResult)
3. Update `app/page.tsx` (add test card)
4. Update `app/dashboard/page.tsx` (add to testInfo)
5. TypeScript compilation check

**Output**:
- 3つのコアファイル (questions.ts, scoring.ts, config.ts)
- 3つのページファイル (page.tsx × 3)
- 4つの統合ファイル更新

**Final Check**:
- `npx tsc --noEmit` が成功
- すべてのファイルが既存パターンと一貫
- ユーザーに実装完了を報告

---

## Data Flow Between Skills

### From Research to Implementation

**Research Skill Output** (`docs/scales/{scale}/`):
```
phase1-research.md          → Scale metadata (tier, alpha, citations, developer)
phase2-japanese-version.md  → Translation info
phase3-items.md             → JSON: questions[], scaleLabels[], scoring{}
phase4-interpretations.md   → 5 levels × ~1,500 chars each
phase5-explanation.md       → Landing page content
```

**Implementation Skill Input**:
- Read all phase*.md files from `docs/scales/{scale}/`
- Parse JSON data from Phase 3
- Extract interpretation text from Phase 4
- Extract explanation content from Phase 5

---

## Template Requirements

### 1. Page Templates

#### Landing Page Template (`templates/page-landing.tsx`)
```typescript
// Placeholders:
// {SCALE} → "gad7" (lowercase)
// {SCALE_ABBR} → "GAD-7"
// {COLOR} → "orange"
// {SCALE_NAME_JA} → "不安症スクリーニング"
// {EXPLANATION_CONTENT} → Phase 5 content
```

#### Test Page Template (`templates/page-test.tsx`)
```typescript
// Placeholders:
// {SCALE} → "gad7"
// {SCALE_ABBR} → "GAD-7"
// {COLOR} → "orange"
// {QUESTION_COUNT} → 7
// {HAS_SPECIAL_WARNING} → true/false (for suicide risk, etc.)
```

#### Results Page Template (`templates/page-results.tsx`)
```typescript
// Placeholders:
// {SCALE} → "gad7"
// {SCALE_ABBR} → "GAD-7"
// {COLOR} → "orange"
// {HAS_EMERGENCY_WARNING} → true/false (clinical scales)
// {HAS_URGENT_CARE_WARNING} → true/false
```

### 2. Integration Templates

#### Root Page Update Template
- Identify the test card section
- Add new card with appropriate Layer
- Update Layer checklist (✅ if implemented)

#### Dashboard Update Template
- Add to `testInfo` object
- Set `available: true`
- Set appropriate color and dimension

---

## File Structure

```
/home/user/.claude/skills/
├── academic-psychtest-research/
│   ├── SKILL.md (Phase 1-5 workflow)
│   └── references/ (shared with both skills)
│       ├── scale-tiers.md
│       ├── interpretation-guide.md
│       └── search-queries.md
│
└── academic-psychtest-implement/
    ├── SKILL.md (Phase 6-8 workflow)
    ├── references/ (symlink to research/references)
    └── templates/
        ├── questions-template.ts
        ├── scoring-template.ts
        ├── config-template.ts
        ├── page-landing.tsx
        ├── page-test.tsx
        └── page-results.tsx
```

---

## Usage Flow

### Example: Implementing GAD-7

**Step 1: Research**
```
User: "GAD-7を実装したい"
→ Invoke: academic-psychtest-research
→ Output: docs/scales/gad7/phase1-5.md
→ User confirms: "実装に進んで"
```

**Step 2: Implementation**
```
User: "GAD-7の実装を進めて、カラーはorangeで"
→ Invoke: academic-psychtest-implement
→ Reads: docs/scales/gad7/*.md
→ Generates: code + pages + integration
→ Output: "GAD-7実装完了、TypeScriptコンパイル成功"
```

---

## Benefits

### Separation of Concerns
- リサーチフェーズと実装フェーズを独立して実行
- リサーチだけ先に行い、レビュー後に実装可能

### Context Preservation
- 各Phaseの結果をファイルに保存
- コンテキスト圧縮の影響を受けない

### Full Automation
- ページ生成
- 統合ファイル更新
- TypeScriptコンパイルチェック

### Quality Assurance
- 既存パターンと一貫したコード
- すべてのファイルがテンプレートベース
- チェックリストによる品質保証

---

## Migration Plan

1. ✅ Design document (this file)
2. ✅ Create page templates (3 files)
3. ✅ Create academic-psychtest-research skill (658 lines)
4. ✅ Create academic-psychtest-implement skill (748 lines)
5. ⏳ Test with GAD-7 implementation
6. ⏳ Archive old academic-psychtest-builder skill (keep as reference)

---

## Notes

- 既存の `academic-psychtest-builder` は削除せず、参照用に保持
- GAD-7でテスト後、PHQ-9のドキュメントを使って実装スキル単体のテストも可能
- テンプレートは既存実装 (PHQ-9, Self-Concept) を基に作成
