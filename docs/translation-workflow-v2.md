# Multi-LLM Translation Workflow with Academic Japanese Trait Terms

学術的に検証された日本語対人特性語を活用した、高品質な心理尺度翻訳ワークフロー

## Overview

橋本(2017)の研究により、**938語の日本語対人特性語**が辞書的アプローチで抽出・検証されています。これらの語彙を翻訳の制約条件として使用することで、学術的に妥当で自然な日本語翻訳を生成できます。

## Key Resources

### 1. IPIP-NEO-300 Translation Data (Few-shot Examples)
- **300項目**の英日対応データ
- パブリックドメイン、商用利用可
- ファセット情報付き

### 2. Japanese Interpersonal Trait Terms (Terminology Constraints)
- **938語**の対人特性語（橋本, 2017）
- 辞書的アプローチで抽出
- 大学生による適切率検証済み
- Source: `/docs/辞書的アプローチによる対人特性語の選定.pdf`

**適切率60%以上の語（他者評定）**: 268語
- 名詞: 143語 (53.4%)
- 形容詞: 48語 (17.9%)
- 動詞・複合語: 59語 (22.0%)
- 副詞: 18語 (6.7%)

---

## Translation Workflow: Multi-LLM with Judge

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Input: English psychological assessment items           │
└───────────────────┬─────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
┌─────────┐   ┌─────────┐   ┌─────────────────┐
│ LLM 1   │   │ LLM 2   │   │ Terminology     │
│ Claude  │   │ GPT-4   │   │ Dictionary      │
│ Opus 4  │   │         │   │ (938 terms)     │
└────┬────┘   └────┬────┘   └────────┬────────┘
     │             │                  │
     │             │                  │
     └─────┬───────┴──────────────────┘
           │
           ▼
     ┌───────────────────────┐
     │  Judge LLM            │
     │  (Claude Opus 4)      │
     │                       │
     │  Evaluates:           │
     │  1. Semantic accuracy │
     │  2. Naturalness       │
     │  3. Term consistency  │
     │  4. Cultural fit      │
     └───────────┬───────────┘
                 │
                 ▼
     ┌───────────────────────┐
     │  Final Translation    │
     │  + Confidence Score   │
     └───────────────────────┘
```

### Step-by-Step Process

#### Step 1: Prepare Few-Shot Examples

```typescript
interface FewShotExample {
  en: string;
  ja: string;
  domain: 'N' | 'E' | 'O' | 'A' | 'C';
  facet: string;
  notes?: string;
}

// IPIP-NEO-300から代表例を選定
const fewShotExamples: FewShotExample[] = [
  {
    en: "Worry about things",
    ja: "心配性である",
    domain: "N",
    facet: "Anxiety",
    notes: "Use である form for trait descriptions"
  },
  {
    en: "Make friends easily",
    ja: "友達を作りやすい",
    domain: "E",
    facet: "Friendliness",
    notes: "Natural positive phrasing"
  },
  // ... 50-100 examples selected strategically
];
```

**選定基準**:
- 各Big Five因子から10-20例
- 短文・長文を均等に
- 肯定文・否定文（逆転項目）を含む
- 異なる文体（である、だ、です/ます）

#### Step 2: Load Japanese Trait Term Dictionary

```typescript
interface TraitTerm {
  term: string;
  partOfSpeech: '名詞' | '形容詞' | '動詞' | '副詞';
  appropriatenessOther: number;  // 他者評定の適切率
  appropriatenessSelf: number;   // 自己評定の適切率
  category?: string;
}

// Table 1から抽出（適切率60%以上の268語を優先）
const traitTerms: TraitTerm[] = [
  { term: "遠慮", partOfSpeech: "名詞", appropriatenessOther: 0.93, appropriatenessSelf: 0.86 },
  { term: "愛", partOfSpeech: "名詞", appropriatenessOther: 0.90, appropriatenessSelf: 0.76 },
  { term: "誠実", partOfSpeech: "名詞", appropriatenessOther: 0.93, appropriatenessSelf: 0.84 },
  { term: "親切", partOfSpeech: "名詞", appropriatenessOther: 0.96, appropriatenessSelf: 0.92 },
  { term: "正直", partOfSpeech: "形容詞", appropriatenessOther: 1.00, appropriatenessSelf: 0.88 },
  { term: "優しい", partOfSpeech: "形容詞", appropriatenessOther: 0.89, appropriatenessSelf: 0.88 },
  // ... 938語（優先度順にソート）
];
```

#### Step 3: Parallel Translation with Two LLMs

```typescript
async function generateTranslations(
  items: string[],
  fewShot: FewShotExample[],
  traitTerms: TraitTerm[]
) {
  const prompt = createTranslationPrompt(items, fewShot, traitTerms);

  // 並列実行
  const [translation1, translation2] = await Promise.all([
    claudeOpus4.translate(prompt),
    gpt4.translate(prompt)
  ]);

  return { translation1, translation2 };
}

function createTranslationPrompt(
  items: string[],
  fewShot: FewShotExample[],
  traitTerms: TraitTerm[]
): string {
  return `
# Task: Translate Psychological Assessment Items

You are translating items from a validated psychological scale.
Prioritize semantic accuracy and natural Japanese expression.

## Translation Guidelines

1. **Semantic Accuracy**: Preserve the exact psychological construct
2. **Natural Japanese**: Use fluent, contemporary Japanese
3. **Terminology Consistency**:
   - Prefer terms from the Academic Trait Term Dictionary
   - Use consistent translations for the same English words
4. **Cultural Appropriateness**: Adapt idioms when necessary
5. **Formality**: Match the formality level of few-shot examples

## Few-Shot Examples (from IPIP-NEO-300)

${fewShot.map(ex =>
  \`EN: "\${ex.en}"
JA: "\${ex.ja}"
Domain: \${ex.domain}, Facet: \${ex.facet}
\${ex.notes ? 'Notes: ' + ex.notes : ''}
\`
).join('\n')}

## Academic Trait Term Dictionary (PRIORITIZE THESE)

Use these academically validated Japanese trait terms when applicable:

High Priority (Appropriateness > 90%):
${traitTerms
  .filter(t => t.appropriatenessOther >= 0.90)
  .slice(0, 50)
  .map(t => `- ${t.term} (${t.partOfSpeech})`)
  .join('\n')}

Medium Priority (Appropriateness 80-90%):
${traitTerms
  .filter(t => t.appropriatenessOther >= 0.80 && t.appropriatenessOther < 0.90)
  .slice(0, 30)
  .map(t => `- ${t.term} (${t.partOfSpeech})`)
  .join('\n')}

## Items to Translate

${items.map((item, i) => `${i + 1}. "${item}"`).join('\n')}

## Output Format

Return JSON array:
[
  {
    "item_number": 1,
    "english": "...",
    "japanese": "...",
    "terms_used": ["遠慮", "配慮"],
    "rationale": "Used '遠慮' from dictionary (appropriateness: 0.93)"
  },
  ...
]
`;
}
```

#### Step 4: Judge LLM Evaluation

```typescript
interface Translation {
  item_number: number;
  english: string;
  japanese: string;
  terms_used?: string[];
  rationale?: string;
}

interface JudgementResult {
  item_number: number;
  english: string;
  final_japanese: string;
  llm1_translation: string;
  llm2_translation: string;
  decision: 'llm1' | 'llm2' | 'hybrid' | 'custom';
  confidence: number;
  reasoning: string;
  issues?: string[];
}

async function judgeTranslations(
  original: string[],
  llm1: Translation[],
  llm2: Translation[],
  fewShot: FewShotExample[],
  traitTerms: TraitTerm[]
): Promise<JudgementResult[]> {

  const judgePrompt = `
# Task: Evaluate and Select Best Translation

You are an expert judge evaluating two translations of psychological assessment items.

## Evaluation Criteria (in order of importance)

1. **Semantic Accuracy** (40%): Does it preserve the exact meaning?
2. **Naturalness** (25%): Is it fluent, contemporary Japanese?
3. **Dictionary Alignment** (20%): Does it use validated trait terms?
4. **Consistency** (15%): Is terminology consistent across items?

## Academic Trait Term Dictionary

Prefer translations that use these terms:
${traitTerms.filter(t => t.appropriatenessOther >= 0.80).map(t => t.term).join(', ')}

## Few-Shot Style Reference

${fewShot.slice(0, 10).map(ex => \`"\${ex.en}" → "\${ex.ja}"\`).join('\n')}

## Translations to Judge

${original.map((orig, i) => \`
Item ${i + 1}: "${orig}"

LLM1 Translation: "${llm1[i].japanese}"
${llm1[i].terms_used ? 'Terms used: ' + llm1[i].terms_used.join(', ') : ''}
${llm1[i].rationale || ''}

LLM2 Translation: "${llm2[i].japanese}"
${llm2[i].terms_used ? 'Terms used: ' + llm2[i].terms_used.join(', ') : ''}
${llm2[i].rationale || ''}
\`).join('\n---\n')}

## Output Format

For each item, provide:
{
  "item_number": 1,
  "english": "...",
  "final_japanese": "...",  // Your selected or improved translation
  "llm1_translation": "...",
  "llm2_translation": "...",
  "decision": "llm1" | "llm2" | "hybrid" | "custom",
  "confidence": 0.95,  // 0-1 scale
  "reasoning": "Selected LLM1 because it uses validated term '誠実' (appropriateness: 0.93) and matches few-shot style better",
  "issues": []  // Any concerns or notes
}
`;

  const judgement = await claudeOpus4.judge(judgePrompt);
  return judgement;
}
```

#### Step 5: Quality Assurance Checks

```typescript
interface QualityCheck {
  passed: boolean;
  issues: string[];
  warnings: string[];
}

function qualityAssurance(
  results: JudgementResult[],
  traitTerms: TraitTerm[]
): QualityCheck {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check 1: Low confidence translations
  const lowConfidence = results.filter(r => r.confidence < 0.7);
  if (lowConfidence.length > 0) {
    warnings.push(
      `${lowConfidence.length} translations have confidence < 0.7: ` +
      lowConfidence.map(r => `#${r.item_number}`).join(', ')
    );
  }

  // Check 2: Terminology consistency
  const termUsage = new Map<string, string[]>();
  results.forEach(r => {
    const enWords = extractKeyWords(r.english);
    enWords.forEach(en => {
      if (!termUsage.has(en)) termUsage.set(en, []);
      termUsage.get(en)!.push(r.final_japanese);
    });
  });

  termUsage.forEach((jaTerms, enWord) => {
    const unique = new Set(jaTerms);
    if (unique.size > 1) {
      warnings.push(
        `Inconsistent translation for "${enWord}": ${Array.from(unique).join(' vs ')}`
      );
    }
  });

  // Check 3: Dictionary term usage rate
  const totalItems = results.length;
  const usedDictTerms = results.filter(r => {
    const usedTerms = extractTraitTerms(r.final_japanese, traitTerms);
    return usedTerms.length > 0;
  }).length;

  const usageRate = usedDictTerms / totalItems;
  if (usageRate < 0.3) {
    warnings.push(
      `Low dictionary term usage: ${(usageRate * 100).toFixed(1)}% ` +
      `(expected >30% for personality scales)`
    );
  }

  // Check 4: Length sanity check
  results.forEach(r => {
    const ratio = r.final_japanese.length / r.english.length;
    if (ratio < 0.3 || ratio > 3.0) {
      warnings.push(
        `Item #${r.item_number}: unusual length ratio ${ratio.toFixed(2)} ` +
        `(EN: ${r.english.length} chars, JA: ${r.final_japanese.length} chars)`
      );
    }
  });

  return {
    passed: issues.length === 0,
    issues,
    warnings
  };
}
```

#### Step 6: Human Review Interface

```typescript
interface ReviewTask {
  item: JudgementResult;
  status: 'pending' | 'approved' | 'needs_revision';
  reviewer_notes?: string;
  revised_translation?: string;
}

function generateReviewSheet(
  results: JudgementResult[],
  qa: QualityCheck
): string {
  return `
# Translation Review Sheet

## Summary
- Total items: ${results.length}
- Average confidence: ${(results.reduce((sum, r) => sum + r.confidence, 0) / results.length).toFixed(2)}
- Low confidence items (<0.7): ${results.filter(r => r.confidence < 0.7).length}
- QA Issues: ${qa.issues.length}
- QA Warnings: ${qa.warnings.length}

## Quality Assurance

### Issues (MUST FIX)
${qa.issues.map(issue => `- ❌ ${issue}`).join('\n') || 'None'}

### Warnings (REVIEW RECOMMENDED)
${qa.warnings.map(warn => `- ⚠️ ${warn}`).join('\n') || 'None'}

## Items Requiring Review

${results
  .filter(r => r.confidence < 0.8 || r.issues && r.issues.length > 0)
  .map(r => `
### Item #${r.item_number} (Confidence: ${r.confidence})

**English**: ${r.english}

**LLM1**: ${r.llm1_translation}
**LLM2**: ${r.llm2_translation}
**Final**: ${r.final_japanese}

**Decision**: ${r.decision}
**Reasoning**: ${r.reasoning}
${r.issues ? '**Issues**: ' + r.issues.join(', ') : ''}

**Reviewer Action**: [ ] Approve  [ ] Revise
**Notes**: _____________________________
**Revised**: _____________________________

`).join('\n---\n')}

## All Items (for final verification)

| # | English | Japanese | Conf. | Status |
|---|---------|----------|-------|--------|
${results.map(r =>
  `| ${r.item_number} | ${r.english} | ${r.final_japanese} | ${r.confidence.toFixed(2)} | ${r.confidence >= 0.8 ? '✓' : '⚠️'} |`
).join('\n')}
`;
}
```

---

## Complete Workflow Example

```typescript
async function translateScale(
  scaleName: string,
  englishItems: string[]
): Promise<JudgementResult[]> {

  console.log(`Starting translation for ${scaleName}...`);

  // Step 1: Load resources
  const fewShot = await loadFewShotExamples('ipip-neo-300-items-ja.csv');
  const traitTerms = await loadTraitTermDictionary('japanese-trait-terms.json');

  // Step 2: Generate translations in parallel
  console.log('Generating translations with LLM1 and LLM2...');
  const { translation1, translation2 } = await generateTranslations(
    englishItems,
    fewShot,
    traitTerms
  );

  // Step 3: Judge translations
  console.log('Judging translations...');
  const results = await judgeTranslations(
    englishItems,
    translation1,
    translation2,
    fewShot,
    traitTerms
  );

  // Step 4: Quality assurance
  console.log('Running quality checks...');
  const qa = qualityAssurance(results, traitTerms);

  // Step 5: Generate review sheet
  const reviewSheet = generateReviewSheet(results, qa);
  await fs.writeFile(`reviews/${scaleName}-review.md`, reviewSheet);

  console.log(`✓ Translation complete. Review sheet: reviews/${scaleName}-review.md`);

  // Step 6: Export results
  const csv = exportToCSV(results);
  await fs.writeFile(`translations/${scaleName}-translated.csv`, csv);

  return results;
}

// Example usage
const phq9Items = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  // ... all 9 items
];

const results = await translateScale('PHQ-9', phq9Items);
```

---

## Advantages of This Approach

### 1. Academic Rigor
- ✅ Uses **938 validated Japanese trait terms**
- ✅ Based on lexical research (橋本, 2017)
- ✅ Terms tested with Japanese university students

### 2. Translation Quality
- ✅ **Consensus from 2 LLMs** reduces individual model bias
- ✅ Judge LLM provides objective evaluation
- ✅ Confidence scores identify items needing human review

### 3. Consistency
- ✅ Terminology dictionary enforces consistent translations
- ✅ Automated consistency checks across items
- ✅ Few-shot examples guide style uniformity

### 4. Efficiency
- ✅ Parallel LLM calls save time
- ✅ Automated QA reduces manual review burden
- ✅ Review sheet focuses human attention on low-confidence items

### 5. Traceability
- ✅ Full decision trail (LLM1, LLM2, Judge reasoning)
- ✅ Confidence scores for each translation
- ✅ Clear rationale for term selection

---

## Cost & Performance Estimates

### Per Scale (e.g., PHQ-9 with 9 items)

| Step | Model | Tokens (approx) | Cost | Time |
|------|-------|-----------------|------|------|
| LLM1 Translation | Claude Opus 4 | 5k input + 2k output | $0.08 | 5s |
| LLM2 Translation | GPT-4 | 5k input + 2k output | $0.10 | 5s |
| Judge Evaluation | Claude Opus 4 | 8k input + 3k output | $0.14 | 8s |
| **Total** | | **~25k tokens** | **$0.32** | **~15s** |

### For Full Test Battery (10 scales, 100 items total)

- **Cost**: ~$3.50
- **Time**: ~3 minutes (automated)
- **Human Review**: 1-2 hours (focus on low-confidence items only)

---

## Next Steps

1. ✅ Extract 938 trait terms from PDF Table 1 → JSON
2. ✅ Implement multi-LLM translation pipeline
3. ✅ Build judge LLM evaluator
4. ✅ Create QA automation
5. ⚠️ Test with PHQ-9/GAD-7 (priority scales)
6. ⚠️ Validate against existing Japanese versions (if available)
7. ⚠️ Run pilot study to confirm reliability

---

## References

- 橋本泰央 (2017). 辞書的アプローチによる対人特性語の選定. *早稲田大学教育学研究科紀要 別冊*, 24(2), 39-54.
- IPIP-NEO Japanese translations: https://ipip.ori.org/JapaneseIPIP-NEOFacets.htm
