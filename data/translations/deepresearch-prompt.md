# DeepResearch Task: Japanese Translations of Psychological Assessment Scales

## Objective

Find and extract **academically validated Japanese translations** of psychological assessment scales for the psychtest.jp project. For each scale, locate the complete item list with English-Japanese correspondence.

## Target Scales (Priority Order)

### Tier 1: Critical for MVP (Trait-State-Outcome Framework)

#### Mental Health Screening (State)
1. **PHQ-9** (Patient Health Questionnaire-9)
   - 9 items, depression screening
   - Known source: Muramatsu et al. (2018), 村松公美子
   - URL hint: https://www.cocoro.chiba-u.jp/recruit/tubuanDB/files/PHQ-9.pdf

2. **GAD-7** (Generalized Anxiety Disorder-7)
   - 7 items, anxiety screening
   - Known source: Muramatsu et al. (2018), 村松公美子
   - URL hint: https://www.cocoro.chiba-u.jp/recruit/tubuanDB/files/GAD-7.pdf

#### Self-Awareness (State)
3. **SCCS** (Self-Concept Clarity Scale)
   - 12 items, self-understanding clarity
   - Known source: 徳永侑子・堀内孝 (Tokunaga & Horiuchi, 2012)
   - URL hint: https://www.jstage.jst.go.jp/article/personality/20/3/20_193/_article/-char/ja/

#### Stress Assessment (State)
4. **PSS** (Perceived Stress Scale)
   - 10 or 14 items
   - Known source: 角田ら (Sumida et al., 2006)
   - URL hint: https://www.jstage.jst.go.jp/article/jahp/19/2/19_44/_article/-char/ja/

### Tier 2: Enhanced Assessment (Trait Framework)

#### Attachment Style (Trait)
5. **ECR-R** (Experiences in Close Relationships - Revised)
   - 36 items (full) or 9 items (ECR-RS short form)
   - Known source: 小村ら (Komura et al., 2016)
   - Measures: Anxiety and Avoidance dimensions

#### Character Strengths (Trait)
6. **VIA Character Strengths** (Values in Action Inventory)
   - 24 character strengths, 240 items (full) or 120 items (short)
   - Search for: VIA-IS 日本語版, VIA-120-J
   - Alternative: Look for individual strength scales

### Tier 3: Skill/Capacity Measures

#### Mindfulness (Skill)
7. **MAAS** (Mindful Attention Awareness Scale)
   - 15 items
   - Known source: 藤野正寛ら (Fujino et al., 2015)
   - URL hint: https://www.jstage.jst.go.jp/article/personality/24/1/24_61/_article/-char/ja/

#### Resilience (Skill)
8. **CD-RISC** (Connor-Davidson Resilience Scale)
   - 25 items (full) or 10 items (CD-RISC-10)
   - Search for: CD-RISC 日本語版

#### Gratitude (Skill)
9. **GQ-6** (Gratitude Questionnaire-6)
   - 6 items
   - Search for: 感謝尺度 日本語版

### Tier 4: Career/Outcome Measures

#### Career Interest (Outcome)
10. **RIASEC** (Holland's Vocational Personality Types)
    - 6 dimensions: Realistic, Investigative, Artistic, Social, Enterprising, Conventional
    - Search for: 職業興味検査 日本語版, Holland 6角形モデル

#### Well-being (Outcome)
11. **PERMA** Profiler (Positive Psychology Well-being)
    - 23 items, 5 dimensions
    - Search for: PERMA 日本語版

## Information to Extract for Each Scale

### Required Information
1. ✅ **Complete item list** with English-Japanese correspondence
2. ✅ **Item count** (verify matches expected)
3. ✅ **Response format** (e.g., 5-point Likert, 4-point scale)
4. ✅ **Scoring method** (if available)
5. ✅ **Reverse-scored items** (if any)

### Validation Metadata
6. ✅ **Original publication** (English version)
7. ✅ **Japanese validation study** (citation)
8. ✅ **Reliability coefficient** (Cronbach's α)
9. ✅ **Test-retest reliability** (if available)
10. ✅ **Sample size** used in validation

### Licensing
11. ✅ **Usage permission** (free/commercial/academic only)
12. ✅ **Citation requirements**
13. ✅ **Official website** or resource page

## Search Strategy

### Primary Sources (Japanese Academic Databases)
- J-STAGE (https://www.jstage.jst.go.jp/)
- CiNii Research (https://cir.nii.ac.jp/)
- University repositories (機関リポジトリ)
- Japanese Psychological Association publications

### Search Queries
Use combinations like:
- `[Scale abbreviation] 日本語版`
- `[Scale name] Japanese version validation`
- `[Concept in Japanese] 尺度 信頼性 妥当性`
- `[Author name Japanese] + [scale abbreviation]`

### Document Types to Check
1. **PDF articles** - Full text may contain appendix with items
2. **Supplementary materials** - Often includes full questionnaires
3. **Research method sections** - May list all items
4. **Scale validation papers** - Primary source for Japanese versions
5. **Measurement manuals** - 尺度使用マニュアル

## Quality Standards

Only include scales that meet these criteria:
- ✅ Published in peer-reviewed journal OR validated by academic institution
- ✅ Reliability coefficient (α) reported and acceptable (α ≥ 0.70)
- ✅ Back-translation methodology used
- ✅ Full item list available (not just sample items)

## Output Format

For each scale found, provide:

```markdown
### [Scale Name] ([Abbreviation])

**Status**: ✅ Complete | ⚠️ Partial | ❌ Not Found

**Items**: [number] items

**Source**:
- Original: [English citation]
- Japanese: [Japanese validation citation]

**Reliability**: Cronbach's α = [value]

**License**: [Free/Academic/Requires permission]

**Items**:
| # | English | Japanese | Reverse? |
|---|---------|----------|----------|
| 1 | [text] | [text] | [Yes/No] |
| ... | ... | ... | ... |

**Notes**: [Any important information about usage, scoring, etc.]

**References**:
- [Link to PDF/webpage]
- [DOI if available]
```

## CSV Format Requirement

If complete item list is found, also provide in CSV format:

```csv
item_number,english,japanese,reverse_scored,subscale
1,"Item text in English","日本語の質問文",FALSE,subscale_name
```

## Special Instructions

1. **For PDF-only sources**: If items are in PDF that cannot be extracted automatically, manually transcribe them
2. **For partial matches**: If only some items are available, note which ones and continue searching
3. **For paywalled content**: Note the paywall but provide as much free metadata as possible
4. **For scales with multiple versions**: Prioritize the most widely used/validated version
5. **Cultural adaptations**: Note if Japanese version modified items for cultural relevance

## Success Criteria

Ideal outcome for each scale:
- ✅ All items extracted in both English and Japanese
- ✅ Validation study identified and cited
- ✅ Reliability data confirmed
- ✅ Usage permission clarified
- ✅ CSV file ready for immediate use

Minimum acceptable outcome:
- ⚠️ Japanese validation study found
- ⚠️ At least 50% of items extracted
- ⚠️ Reliability coefficient reported
- ⚠️ Clear path to obtaining full item list (e.g., contact author, purchase manual)

## Priority Targets

**Focus most effort on:**
1. PHQ-9 (critical for mental health screening)
2. GAD-7 (critical for mental health screening)
3. SCCS (already implemented, need translation)
4. ECR-R (attachment is core to Trait framework)
5. MAAS (mindfulness is popular request)

**Lower priority but still valuable:**
- VIA Character Strengths (large scale, may need partial extraction)
- CD-RISC (resilience is important but less urgent)
- RIASEC (career assessment, nice-to-have)

## Expected Deliverables

1. **Research report** (Markdown) with all findings for each scale
2. **CSV files** for scales with complete item lists
3. **Bibliography** of all Japanese validation studies found
4. **Recommendations** on which scales are ready to implement vs. need further work

## Context

This research supports the **psychtest.jp** project, which aims to provide academically rigorous psychological assessments in Japanese. We already have:
- IPIP Big Five (50, 100, 300 items) ✅
- Rosenberg Self-Esteem (10 items) ✅
- SWLS (5 items) ✅

Total current few-shot examples: **465 items**

The goal is to expand to comprehensive Trait-State-Outcome-Skill assessment framework covering:
- **Trait**: Stable personality characteristics (Big Five, Attachment, Values)
- **State**: Current psychological state (Depression, Anxiety, Stress, Self-concept)
- **Outcome**: Life results (Self-esteem, Life satisfaction, Career fit)
- **Skill**: Developable capacities (Mindfulness, Resilience, Gratitude)

---

**Time estimate**: This is a comprehensive research task. Prioritize Tier 1 scales first, then expand to Tier 2-4 as time permits.

**Questions?**: If any scale abbreviations or concepts are unclear, search for the full name in both English and Japanese before proceeding.
