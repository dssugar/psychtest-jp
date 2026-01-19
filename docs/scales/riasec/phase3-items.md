# Phase 3: O*NET Interest Profiler 60-Item Extraction

## Overview

This document describes the O*NET Interest Profiler Short Form (60-item version) structure and provides guidance for obtaining the complete item list.

## Response Format

- **Type**: 5-point Likert scale
- **Labels**:
  1. Strongly Dislike
  2. Dislike
  3. Unsure
  4. Like
  5. Strongly Like

**Note**: A 3-point version exists for self-scoring paper forms ("Like" / "Unsure" / "Dislike"), but the digital version uses 5-point scale.

## Item Structure

- **Total Items**: 60
- **Items per RIASEC Dimension**: 10 per dimension
- **Dimensions**:
  - **R (Realistic)**: 10 items
  - **I (Investigative)**: 10 items
  - **A (Artistic)**: 10 items
  - **S (Social)**: 10 items
  - **E (Enterprising)**: 10 items
  - **C (Conventional)**: 10 items

## Sample Items

### Realistic (R)
1. Build kitchen cabinets
2. Lay brick or tile
3. Repair household appliances

### Investigative (I)
4. Study ways to reduce water pollution
5. Develop a new medicine
6. Study space travel

### Artistic (A)
7. Write books or plays
8. Play a musical instrument
9. Compose or arrange music

### Social (S)
10. Teach an individual an exercise routine
11. Help people with personal or emotional problems
12. Teach children how to read

### Enterprising (E)
13. Buy and sell stocks and bonds
14. Manage a retail store
15. Operate a beauty salon or barber shop

### Conventional (C)
16. Develop a spreadsheet using computer software
17. Proofread records or forms
18. Operate a calculator

**Source**: Sample items from [O*NET Interest Profiler API Reference](https://services.onetcenter.org/reference/mnm/ip/ip_questions) and [ResearchGate publications](https://www.researchgate.net/publication/255573886_ONET_Interest_Profiler_Reliability_Validity_and_Self-Scoring)

## How to Obtain Complete 60-Item List

### Method 1: Download Official PDF

**File**: O*NET Interest Profiler Short Form Paper-and-Pencil Version
**URL**: https://www.onetcenter.org/dl_files/IPSF_PP.pdf

**Steps**:
1. Download PDF from O*NET Resource Center
2. Extract all 60 work activity statements
3. Map each item to its RIASEC dimension (items are grouped by dimension)

### Method 2: Use O*NET API

**Endpoint**: `/mnm/interestprofiler/questions`
**Base URL**: https://services.onetcenter.org/
**Documentation**: https://services.onetcenter.org/reference/mnm/ip/ip_questions

**Example API Call**:
```bash
curl "https://services.onetcenter.org/ws/mnm/interestprofiler/questions?start=1&end=60"
```

**Response Structure**:
```json
{
  "question": [
    {
      "index": 1,
      "area": "realistic",
      "text": "Build kitchen cabinets"
    },
    {
      "index": 2,
      "area": "realistic",
      "text": "Lay brick or tile"
    }
    // ... up to 60 questions
  ]
}
```

### Method 3: Access Interactive Assessment

**URL**: https://onetinterestprofiler.org/

**Steps**:
1. Complete the interactive assessment (requires JavaScript)
2. Manually record all 60 questions during the test
3. Categorize by RIASEC dimension

**Note**: This method is time-consuming but ensures you see the exact wording used in the current version.

## Scoring

### Raw Score Calculation

For each RIASEC dimension:
```
Raw Score = Sum of responses (1-5) for 10 items
Range: 10 (all "Strongly Dislike") to 50 (all "Strongly Like")
```

### Holland Code Determination

1. Calculate raw scores for all 6 dimensions
2. Rank dimensions from highest to lowest
3. Top 3 dimensions form the Holland Code (e.g., "SAI" = Social-Artistic-Investigative)

### Example:
```
R: 25
I: 42 → 2nd highest
A: 45 → 1st highest
S: 38 → 3rd highest
E: 30
C: 28

Holland Code: AIS
```

## Reverse Items

✅ **No reverse-scored items**

All items are scored directly (higher score = higher interest).

## Data Structure (JSON Template)

```json
{
  "scale": "riasec",
  "version": "O*NET Interest Profiler Short Form",
  "questions": [
    {
      "id": 1,
      "text": "Build kitchen cabinets",
      "dimension": "realistic",
      "reverse": false
    },
    {
      "id": 2,
      "text": "Lay brick or tile",
      "dimension": "realistic",
      "reverse": false
    },
    {
      "id": 3,
      "text": "Repair household appliances",
      "dimension": "realistic",
      "reverse": false
    },
    // ... continue for all 60 items
    {
      "id": 60,
      "text": "[Last item text]",
      "dimension": "conventional",
      "reverse": false
    }
  ],
  "scaleLabels": [
    "Strongly Dislike",
    "Dislike",
    "Unsure",
    "Like",
    "Strongly Like"
  ],
  "scoring": {
    "dimensions": {
      "realistic": {
        "label": "Realistic",
        "label_ja": "現実的",
        "description": "Hands-on, practical, mechanical work",
        "items": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      },
      "investigative": {
        "label": "Investigative",
        "label_ja": "研究的",
        "description": "Research, analysis, problem-solving",
        "items": [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
      },
      "artistic": {
        "label": "Artistic",
        "label_ja": "芸術的",
        "description": "Creative, expressive, innovative work",
        "items": [21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
      },
      "social": {
        "label": "Social",
        "label_ja": "社会的",
        "description": "Helping, teaching, supporting others",
        "items": [31, 32, 33, 34, 35, 36, 37, 38, 39, 40]
      },
      "enterprising": {
        "label": "Enterprising",
        "label_ja": "企業的",
        "description": "Leading, persuading, business ventures",
        "items": [41, 42, 43, 44, 45, 46, 47, 48, 49, 50]
      },
      "conventional": {
        "label": "Conventional",
        "label_ja": "慣習的",
        "description": "Organizing, data management, structured tasks",
        "items": [51, 52, 53, 54, 55, 56, 57, 58, 59, 60]
      }
    },
    "min": 10,
    "max": 50,
    "perDimension": true
  },
  "license": "Public Domain - U.S. Department of Labor, O*NET",
  "attribution": "O*NET Interest Profiler Short Form developed by the U.S. Department of Labor, Employment and Training Administration"
}
```

## Implementation Notes

### For MVP/Prototype

**English Version**:
1. Download official PDF from O*NET
2. Extract all 60 items manually
3. Implement exactly as provided (no translation)
4. Use for testing flow and results display
5. Add disclaimer: "English language assessment"

### For Japanese Version

**Translation Process** (see Phase 2 Report):
1. Extract 60 English items from official PDF
2. Hire professional translator (psychology background)
3. Conduct back-translation validation
4. Expert panel review (2-3 career counselors)
5. Pilot test (n ≥ 50) to verify α ≥ 0.75 per dimension

**Timeline**: 6-10 weeks
**Budget**: ¥200,000-350,000

## License & Attribution

✅ **Public Domain**

**Usage Terms**:
- Free to use, modify, and redistribute
- Attribution required: "Based on O*NET Interest Profiler developed by the U.S. Department of Labor"
- Translations are derivative works under open license

**Source**: [O*NET Interest Profiler](https://www.onetcenter.org/IP.html)

## Hexagonal Model Visualization

Holland's hexagonal model shows relationships between RIASEC dimensions:

```
        R -------- I
       / \        / \
      /   \      /   \
     C     \    /     A
      \     \  /     /
       \     \/     /
        \    /\    /
         \  /  \  /
          E ---- S
```

**Adjacent dimensions** (closer relationship):
- R-I, I-A, A-S, S-E, E-C, C-R

**Opposite dimensions** (least similar):
- R-S, I-E, A-C

**Use for interpretation**: People with adjacent high scores (e.g., R-I) have coherent interest patterns.

## Next Steps

1. ✅ Choose implementation strategy:
   - **Option A**: English version first (immediate implementation)
   - **Option B**: Japanese translation (6-10 weeks)
   - **Option C**: Investigate job tag licensing

2. Extract complete 60-item list using Method 1 or Method 2

3. Proceed to Phase 4: Interpretation Content Generation

---

**Status**: ⚠️ **Items must be extracted manually from official O*NET sources**

**Recommendation**: Use Method 1 (download PDF) for most reliable item extraction. Method 2 (API) is also viable for automated retrieval.
