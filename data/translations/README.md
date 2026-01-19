# Validated Japanese Translations of Psychological Scales

This directory contains academically validated English-Japanese translations of psychological assessment scales. These translations serve as **few-shot reference data** for LLM-based translation of remaining items.

## Translation Quality Standards

All translations in this directory meet the following criteria:
- ✅ Published in peer-reviewed journals or validated by academic institutions
- ✅ Back-translation methodology used
- ✅ Reliability coefficients (Cronbach's α) verified
- ✅ Used in multiple research studies

## Available Complete Translations

### IPIP Big Five Personality Scales

| File | Items | Source | Notes |
|------|-------|--------|-------|
| `ipip-50-items-ja.csv` | 50 | [IPIP.org](https://ipip.ori.org/JapaneseBig-FiveFactorMarkers.htm) | Dr. Minoru Nakayama, Tokyo Tech |
| `ipip-100-items-ja.csv` | 100 | [IPIP.org](https://ipip.ori.org/Japanese100-ItemIPIP-NEODomains.htm) | Prof. Omar Karlin, Tokai University |
| `ipip-neo-300-items-ja.csv` | 300 | [IPIP.org](https://ipip.ori.org/JapaneseIPIP-NEOFacets.htm) | Prof. Omar Karlin, 30 facets × 10 items |

**License**: Public domain (no permission required)

**Note**: The 300-item version includes detailed facet-level measurement (6 facets per Big Five domain), providing comprehensive personality assessment with high granularity.

### Rosenberg Self-Esteem Scale

| File | Items | Source | Notes |
|------|-------|--------|-------|
| `rosenberg-self-esteem-ja.csv` | 10 | Mimura & Griffiths (2007) | Most widely used Japanese version |

**Citation**: Mimura, C., & Griffiths, P. (2007). A Japanese version of the Rosenberg Self-Esteem Scale: Translation and equivalence assessment. Journal of Psychosomatic Research, 62(5), 589-594.

### Satisfaction with Life Scale (SWLS)

| File | Items | Source | Notes |
|------|-------|--------|-------|
| `swls-ja.csv` | 5 | 角野善司 (Sumino, 1994) | 7-point Likert scale |

**Citation**: 角野善司 (1994). 人生に対する満足尺度(the Satisfaction With Life Scale [SWLS])日本版作成の試み. 日本心理学会第58回大会発表論文集.

## Partially Available Translations

The following scales have validated Japanese versions, but full item lists were not accessible via web scraping:

### PHQ-9 (Patient Health Questionnaire-9)

- **Items**: 9 (depression screening)
- **Source**: Muramatsu et al., 村松公美子 (2018)
- **License**: Free to use (Pfizer)
- **Status**: ⚠️ PDF available but text extraction failed
- **Reference**: https://www.cocoro.chiba-u.jp/recruit/tubuanDB/files/PHQ-9.pdf

### GAD-7 (Generalized Anxiety Disorder-7)

- **Items**: 7 (anxiety screening)
- **Source**: Muramatsu et al., 村松公美子 (2018)
- **License**: Free to use
- **Status**: ⚠️ PDF available but text extraction failed
- **Reference**: https://www.cocoro.chiba-u.jp/recruit/tubuanDB/files/GAD-7.pdf

### Self-Concept Clarity Scale (SCCS)

- **Items**: 12
- **Source**: 徳永侑子・堀内孝 (Tokunaga & Horiuchi, 2012)
- **Status**: ⚠️ Requires PDF download from J-STAGE
- **Reference**: https://www.jstage.jst.go.jp/article/personality/20/3/20_193/_article/-char/ja/

### MAAS (Mindful Attention Awareness Scale)

- **Items**: 15
- **Source**: 藤野正寛ら (Fujino et al., 2015)
- **Status**: ⚠️ Requires access to full paper
- **Reference**: https://www.jstage.jst.go.jp/article/personality/24/1/24_61/_article/-char/ja/

### ECR-R (Experiences in Close Relationships - Revised)

- **Items**: 36 (full version) or 9 (short version ECR-RS)
- **Source**: 小村ら (Komura et al., 2016)
- **Status**: ⚠️ Requires access to full paper
- **Reference**: Fraley et al. (2011) translated by Komura, Murakami, & Toda (2016)

### PSS (Perceived Stress Scale)

- **Items**: 10 or 14
- **Source**: 角田ら (Sumida et al., 2006)
- **Status**: ⚠️ Requires access to full paper
- **Reference**: https://www.jstage.jst.go.jp/article/jahp/19/2/19_44/_article/-char/ja/

## Usage as Few-Shot Data

### For LLM Translation Prompts

Use the complete translations as few-shot examples when translating new psychological assessment items:

```typescript
// Example prompt structure
const fewShotExamples = [
  // From IPIP-NEO-300 (with facet information)
  { en: "Worry about things", ja: "心配性である", domain: "N", facet: "Anxiety" },
  { en: "Make friends easily", ja: "友達を作りやすい", domain: "E", facet: "Friendliness" },
  { en: "Like to solve complex problems", ja: "難しい問題を解くのが好きだ", domain: "O", facet: "Intellect" },
  // From Rosenberg
  { en: "I feel that I'm a person of worth", ja: "私は、自分自身にだいたい満足している。" },
  // From SWLS
  { en: "I am satisfied with my life.", ja: "私は自分の人生に満足している" },
  // Add more examples...
];
```

**Total available few-shot examples: 465 items** (300 IPIP-NEO + 100 IPIP-100 + 50 IPIP-50 + 10 Rosenberg + 5 SWLS)

### Translation Style Guidelines (Learned from Data)

1. **Formality**: Use です/ます form for statements, だ/である for personality traits
2. **Naturalness**: Prioritize natural Japanese over literal translation
3. **Cultural adaptation**: Some items may need cultural contextualization
4. **Reverse items**: Maintain negative phrasing structure in Japanese

## Next Steps

1. **Extract remaining translations**: Download PDFs and extract text manually if needed
2. **Validate LLM translations**: Use few-shot data to generate translations, then validate against published versions
3. **Build translation pipeline**: Create automated translation workflow with human validation

## Sources and Citations

All sources are documented in this README. When using these translations in academic or commercial contexts:

- **IPIP scales**: No citation required (public domain), but attribution appreciated
- **Other scales**: Cite original validation studies listed above
- **Commercial use**: Verify permissions for each scale (most are free for non-commercial use)

## Contributing

To add new validated translations:

1. Verify academic validation (published study with reliability data)
2. Add CSV file with columns: `item_number`, `english`, `japanese`, (optional: `reverse_scored`, `factor`)
3. Update this README with source citation
4. Include license/permission information

---

**Last updated**: 2026-01-19
**Contact**: psychtest.jp project team
