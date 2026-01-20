/**
 * LLMカスタムインストラクション生成
 *
 * 心理テスト結果から、ChatGPT/Claude等のLLMアシスタント用の
 * カスタムインストラクションテキストを生成します。
 *
 * 既存の解釈文（getInterpretation等）を再利用し、
 * データの重複を避けています（DRY原則）。
 */

import type { UserProfile } from "@/lib/storage";
import { getTestConfig } from "@/lib/tests/test-registry";
import { getInterpretation as getBigFiveInterpretation } from "@/lib/tests/bigfive";
import { getInterpretation as getRosenbergInterpretation } from "@/lib/tests/rosenberg";
import { getInterpretation as getSelfConceptInterpretation } from "@/lib/tests/selfconcept";
import { getInterpretation as getSwlsInterpretation } from "@/lib/tests/swls";
import type { BigFiveResult } from "@/lib/tests/bigfive";
import type { RosenbergResult } from "@/lib/tests/rosenberg";
import type { IndustriousnessResult } from "@/lib/tests/industriousness";
import { facetNames, facetsByDomain } from "@/data/facet-names";

// ============================================================================
// 型定義
// ============================================================================

export interface ExportOptions {
  /** 出力フォーマット */
  format: 'chatgpt' | 'claude' | 'markdown';
  /** Big Five特性を含める */
  includeBigFive: boolean;
  /** メンタルヘルス情報を含める（PHQ-9, K6） */
  includeMentalHealth: boolean;
  /** 対話スタイル推奨を含める */
  includeCommunicationStyle: boolean;
  /** 出力言語 */
  language: 'ja' | 'en';
}

// ============================================================================
// メイン生成関数
// ============================================================================

/**
 * ユーザープロファイルからLLMカスタムインストラクションを生成
 */
export function generateCustomInstructions(
  profile: UserProfile,
  options: ExportOptions
): string {
  const sections: string[] = [];

  // ヘッダー
  sections.push(getHeader(options));

  // Big Five（性格特性）
  if (options.includeBigFive && profile.tests.bigfive) {
    sections.push(generateBigFiveSection(profile.tests.bigfive.result, options.language));
  }

  // Industriousness（やり抜く力）
  if (options.includeBigFive && profile.tests.industriousness) {
    sections.push(generateIndustriousnessSection(profile.tests.industriousness.result, options.language));
  }

  // Self-Concept（自己認識）
  if (profile.tests.selfconcept) {
    sections.push(generateSelfConceptSection(profile.tests.selfconcept.result, options.language));
  }

  // Rosenberg（自尊心）
  if (profile.tests.rosenberg) {
    sections.push(generateRosenbergSection(profile.tests.rosenberg.result, options.language));
  }

  // SWLS（人生満足度）
  if (profile.tests.swls) {
    sections.push(generateSwlsSection(profile.tests.swls.result, options.language));
  }

  // PHQ-9/K6（メンタルヘルス）※デフォルトOFF
  if (options.includeMentalHealth) {
    if (profile.tests.phq9) {
      sections.push(generatePhq9Section(profile.tests.phq9.result, options.language));
    }
    if (profile.tests.k6) {
      sections.push(generateK6Section(profile.tests.k6.result, options.language));
    }
  }

  // 対話スタイル推奨（Big Fiveとメンタルヘルスから推論）
  if (options.includeCommunicationStyle) {
    sections.push(generateCommunicationStyleSection(profile, options.language));
  }

  // フッター
  sections.push(getFooter(options));

  return sections.join('\n\n');
}

// ============================================================================
// ファセット英語名（IPIP-NEO公式名称）
// ============================================================================

const facetNamesEn: Record<string, string> = {
  // Neuroticism
  n1_anxiety: "Anxiety",
  n2_anger: "Anger",
  n3_depression: "Depression",
  n4_selfConsciousness: "Self-Consciousness",
  n5_immoderation: "Immoderation",
  n6_vulnerability: "Vulnerability",
  // Extraversion
  e1_friendliness: "Friendliness",
  e2_gregariousness: "Gregariousness",
  e3_assertiveness: "Assertiveness",
  e4_activityLevel: "Activity Level",
  e5_excitementSeeking: "Excitement Seeking",
  e6_cheerfulness: "Cheerfulness",
  // Openness
  o1_imagination: "Imagination",
  o2_artisticInterests: "Artistic Interests",
  o3_emotionality: "Emotionality",
  o4_adventurousness: "Adventurousness",
  o5_intellect: "Intellect",
  o6_liberalism: "Liberalism",
  // Agreeableness
  a1_trust: "Trust",
  a2_morality: "Morality",
  a3_altruism: "Altruism",
  a4_cooperation: "Cooperation",
  a5_modesty: "Modesty",
  a6_sympathy: "Sympathy",
  // Conscientiousness
  c1_selfEfficacy: "Self-Efficacy",
  c2_orderliness: "Orderliness",
  c3_dutifulness: "Dutifulness",
  c4_achievementStriving: "Achievement Striving",
  c5_selfDiscipline: "Self-Discipline",
  c6_cautiousness: "Cautiousness",
};

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * ファセットスコアのレベル判定（4-20点）
 */
function getFacetLevel(score: number): 'low' | 'medium' | 'high' {
  if (score <= 12) return 'low';
  if (score >= 17) return 'high';
  return 'medium';
}

/**
 * ファセットレベルの日本語ラベル
 */
function getFacetLevelJa(level: 'low' | 'medium' | 'high'): string {
  const labels = { low: '低', medium: '中', high: '高' };
  return labels[level];
}

/**
 * ファセットレベルの英語ラベル
 */
function getFacetLevelEn(level: 'low' | 'medium' | 'high'): string {
  const labels = { low: 'Low', medium: 'Medium', high: 'High' };
  return labels[level];
}

// ============================================================================
// セクション生成関数（既存の getInterpretation を活用）
// ============================================================================

function generateBigFiveSection(result: BigFiveResult, language: 'ja' | 'en'): string {
  const sections: string[] = [];

  // ファセットデータがない場合は基本情報のみ返す
  if (!result.facets) {
    if (language === 'en') {
      return [
        '## Personality Traits (Big Five)',
        '',
        `- **Openness**: ${result.openness}/120 (${getScoreLevelEn(result.openness)})`,
        `- **Conscientiousness**: ${result.conscientiousness}/120 (${getScoreLevelEn(result.conscientiousness)})`,
        `- **Extraversion**: ${result.extraversion}/120 (${getScoreLevelEn(result.extraversion)})`,
        `- **Agreeableness**: ${result.agreeableness}/120 (${getScoreLevelEn(result.agreeableness)})`,
        `- **Neuroticism**: ${result.neuroticism}/120 (${getScoreLevelEn(result.neuroticism)})`,
        '',
        '**Interpretation**: ' + getBigFiveInterpretation({
          openness: result.openness,
          conscientiousness: result.conscientiousness,
          extraversion: result.extraversion,
          agreeableness: result.agreeableness,
          neuroticism: result.neuroticism,
        }),
      ].join('\n');
    }
    return [
      '## 性格特性（Big Five）',
      '',
      `- **開放性 (Openness)**: ${result.openness}/120 (${getScoreLevelJa(result.openness)})`,
      '  新しいアイデアや経験に対する開放性、知的好奇心',
      `- **誠実性 (Conscientiousness)**: ${result.conscientiousness}/120 (${getScoreLevelJa(result.conscientiousness)})`,
      '  計画性、勤勉性、自己規律',
      `- **外向性 (Extraversion)**: ${result.extraversion}/120 (${getScoreLevelJa(result.extraversion)})`,
      '  社交性、活動性、ポジティブ感情',
      `- **協調性 (Agreeableness)**: ${result.agreeableness}/120 (${getScoreLevelJa(result.agreeableness)})`,
      '  利他性、共感性、協力性',
      `- **神経症傾向 (Neuroticism)**: ${result.neuroticism}/120 (${getScoreLevelJa(result.neuroticism)})`,
      '  感情の安定性、ストレス反応',
      '',
      '**総合解釈**: ' + getBigFiveInterpretation({
        openness: result.openness,
        conscientiousness: result.conscientiousness,
        extraversion: result.extraversion,
        agreeableness: result.agreeableness,
        neuroticism: result.neuroticism,
      }),
    ].join('\n');
  }

  if (language === 'en') {
    // 5次元スコア
    sections.push('## Personality Traits (Big Five)');
    sections.push('');
    sections.push(`- **Openness**: ${result.openness}/120 (${getScoreLevelEn(result.openness)})`);
    sections.push(`- **Conscientiousness**: ${result.conscientiousness}/120 (${getScoreLevelEn(result.conscientiousness)})`);
    sections.push(`- **Extraversion**: ${result.extraversion}/120 (${getScoreLevelEn(result.extraversion)})`);
    sections.push(`- **Agreeableness**: ${result.agreeableness}/120 (${getScoreLevelEn(result.agreeableness)})`);
    sections.push(`- **Neuroticism**: ${result.neuroticism}/120 (${getScoreLevelEn(result.neuroticism)})`);
    sections.push('');
    sections.push('**Interpretation**: ' + getBigFiveInterpretation({
      openness: result.openness,
      conscientiousness: result.conscientiousness,
      extraversion: result.extraversion,
      agreeableness: result.agreeableness,
      neuroticism: result.neuroticism,
    }));

    // 30ファセット詳細
    sections.push('');
    sections.push('### Facet Details (30 Sub-scales)');
    sections.push('');

    // Neuroticism facets
    sections.push('**Neuroticism**');
    for (const facetKey of facetsByDomain.neuroticism) {
      const score = result.facets[facetKey];
      const level = getFacetLevel(score);
      sections.push(`- ${facetNamesEn[facetKey]}: ${score}/20 (${getFacetLevelEn(level)})`);
    }
    sections.push('');

    // Extraversion facets
    sections.push('**Extraversion**');
    for (const facetKey of facetsByDomain.extraversion) {
      const score = result.facets[facetKey];
      const level = getFacetLevel(score);
      sections.push(`- ${facetNamesEn[facetKey]}: ${score}/20 (${getFacetLevelEn(level)})`);
    }
    sections.push('');

    // Openness facets
    sections.push('**Openness**');
    for (const facetKey of facetsByDomain.openness) {
      const score = result.facets[facetKey];
      const level = getFacetLevel(score);
      sections.push(`- ${facetNamesEn[facetKey]}: ${score}/20 (${getFacetLevelEn(level)})`);
    }
    sections.push('');

    // Agreeableness facets
    sections.push('**Agreeableness**');
    for (const facetKey of facetsByDomain.agreeableness) {
      const score = result.facets[facetKey];
      const level = getFacetLevel(score);
      sections.push(`- ${facetNamesEn[facetKey]}: ${score}/20 (${getFacetLevelEn(level)})`);
    }
    sections.push('');

    // Conscientiousness facets
    sections.push('**Conscientiousness**');
    for (const facetKey of facetsByDomain.conscientiousness) {
      const score = result.facets[facetKey];
      const level = getFacetLevel(score);
      sections.push(`- ${facetNamesEn[facetKey]}: ${score}/20 (${getFacetLevelEn(level)})`);
    }

    return sections.join('\n');
  }

  // 日本語版
  // 5次元スコア
  sections.push('## 性格特性（Big Five）');
  sections.push('');
  sections.push(`- **開放性 (Openness)**: ${result.openness}/120 (${getScoreLevelJa(result.openness)})`);
  sections.push('  新しいアイデアや経験に対する開放性、知的好奇心');
  sections.push(`- **誠実性 (Conscientiousness)**: ${result.conscientiousness}/120 (${getScoreLevelJa(result.conscientiousness)})`);
  sections.push('  計画性、勤勉性、自己規律');
  sections.push(`- **外向性 (Extraversion)**: ${result.extraversion}/120 (${getScoreLevelJa(result.extraversion)})`);
  sections.push('  社交性、活動性、ポジティブ感情');
  sections.push(`- **協調性 (Agreeableness)**: ${result.agreeableness}/120 (${getScoreLevelJa(result.agreeableness)})`);
  sections.push('  利他性、共感性、協力性');
  sections.push(`- **神経症傾向 (Neuroticism)**: ${result.neuroticism}/120 (${getScoreLevelJa(result.neuroticism)})`);
  sections.push('  感情の安定性、ストレス反応');
  sections.push('');
  sections.push('**総合解釈**: ' + getBigFiveInterpretation({
    openness: result.openness,
    conscientiousness: result.conscientiousness,
    extraversion: result.extraversion,
    agreeableness: result.agreeableness,
    neuroticism: result.neuroticism,
  }));

  // 30ファセット詳細
  sections.push('');
  sections.push('### ファセット詳細（30の下位尺度）');
  sections.push('');

  // 神経症傾向ファセット
  sections.push('**神経症傾向 (Neuroticism)**');
  for (const facetKey of facetsByDomain.neuroticism) {
    const score = result.facets[facetKey];
    const level = getFacetLevel(score);
    sections.push(`- ${facetNames[facetKey]}: ${score}/20 (${getFacetLevelJa(level)})`);
  }
  sections.push('');

  // 外向性ファセット
  sections.push('**外向性 (Extraversion)**');
  for (const facetKey of facetsByDomain.extraversion) {
    const score = result.facets[facetKey];
    const level = getFacetLevel(score);
    sections.push(`- ${facetNames[facetKey]}: ${score}/20 (${getFacetLevelJa(level)})`);
  }
  sections.push('');

  // 開放性ファセット
  sections.push('**開放性 (Openness)**');
  for (const facetKey of facetsByDomain.openness) {
    const score = result.facets[facetKey];
    const level = getFacetLevel(score);
    sections.push(`- ${facetNames[facetKey]}: ${score}/20 (${getFacetLevelJa(level)})`);
  }
  sections.push('');

  // 協調性ファセット
  sections.push('**協調性 (Agreeableness)**');
  for (const facetKey of facetsByDomain.agreeableness) {
    const score = result.facets[facetKey];
    const level = getFacetLevel(score);
    sections.push(`- ${facetNames[facetKey]}: ${score}/20 (${getFacetLevelJa(level)})`);
  }
  sections.push('');

  // 誠実性ファセット
  sections.push('**誠実性 (Conscientiousness)**');
  for (const facetKey of facetsByDomain.conscientiousness) {
    const score = result.facets[facetKey];
    const level = getFacetLevel(score);
    sections.push(`- ${facetNames[facetKey]}: ${score}/20 (${getFacetLevelJa(level)})`);
  }

  return sections.join('\n');
}

function generateIndustriousnessSection(result: IndustriousnessResult, language: 'ja' | 'en'): string {
  if (language === 'en') {
    return [
      '## Industriousness / Grit',
      '',
      `- **Achievement Striving**: ${result.c4_achievement}/50 (${Math.round(result.c4_percentile)}th percentile)`,
      `- **Self-Discipline**: ${result.c5_discipline}/50 (${Math.round(result.c5_percentile)}th percentile)`,
      `- **Type**: ${result.quadrant}`,
    ].join('\n');
  }

  return [
    '## やり抜く力 (Industriousness / Grit)',
    '',
    `- **達成志向 (Achievement Striving)**: ${result.c4_achievement}/50 (上位${Math.round(result.c4_percentile)}%)`,
    `  高い目標を設定し、達成に向けて努力する傾向`,
    `- **自己規律 (Self-Discipline)**: ${result.c5_discipline}/50 (上位${Math.round(result.c5_percentile)}%)`,
    `  規律正しく、誘惑に強い傾向`,
    `- **タイプ**: ${getQuadrantLabelJa(result.quadrant)}`,
  ].join('\n');
}

function generateSelfConceptSection(result: any, language: 'ja' | 'en'): string {
  if (language === 'en') {
    return [
      '## Self-Concept Clarity',
      '',
      `**Score**: ${result.rawScore}/40`,
      `**Interpretation**: ${getSelfConceptInterpretation(result.level)}`,
    ].join('\n');
  }

  return [
    '## 自己認識の明確さ (Self-Concept Clarity)',
    '',
    `**スコア**: ${result.rawScore}/40点`,
    `**解釈**: ${getSelfConceptInterpretation(result.level)}`,
  ].join('\n');
}

function generateRosenbergSection(result: RosenbergResult, language: 'ja' | 'en'): string {
  const interpretation = getRosenbergInterpretation(result.level, result.rawScore, result.percentageScore);

  if (language === 'en') {
    return [
      '## Self-Esteem',
      '',
      `**Score**: ${result.rawScore}/40`,
      `**Interpretation**: ${interpretation}`,
    ].join('\n');
  }

  return [
    '## 自尊心 (Self-Esteem)',
    '',
    `**スコア**: ${result.rawScore}/40点`,
    `**解釈**: ${interpretation}`,
  ].join('\n');
}

function generateSwlsSection(result: any, language: 'ja' | 'en'): string {
  const interpretation = getSwlsInterpretation(result.level);

  if (language === 'en') {
    return [
      '## Life Satisfaction',
      '',
      `**Score**: ${result.rawScore}/35`,
      `**Interpretation**: ${interpretation}`,
    ].join('\n');
  }

  return [
    '## 人生満足度 (Life Satisfaction)',
    '',
    `**スコア**: ${result.rawScore}/35点`,
    `**解釈**: ${interpretation}`,
  ].join('\n');
}

function generatePhq9Section(result: any, language: 'ja' | 'en'): string {
  if (language === 'en') {
    return [
      '## Mental Health (PHQ-9 Depression Screening)',
      '',
      `**Score**: ${result.rawScore}/27`,
      `**Level**: ${result.level}`,
      '',
      '⚠️ This is sensitive information. Only share with trusted AI environments.',
    ].join('\n');
  }

  return [
    '## メンタルヘルス（PHQ-9 うつ病スクリーニング）',
    '',
    `**スコア**: ${result.rawScore}/27点`,
    `**レベル**: ${result.level}`,
    '',
    '⚠️ センシティブな情報です。信頼できるAI環境でのみ共有してください。',
  ].join('\n');
}

function generateK6Section(result: any, language: 'ja' | 'en'): string {
  if (language === 'en') {
    return [
      '## Mental Health (K6 Psychological Distress)',
      '',
      `**Score**: ${result.rawScore}/24`,
      `**Level**: ${result.level}`,
      '',
      '⚠️ This is sensitive information. Only share with trusted AI environments.',
    ].join('\n');
  }

  return [
    '## メンタルヘルス（K6 心理的苦痛）',
    '',
    `**スコア**: ${result.rawScore}/24点`,
    `**レベル**: ${result.level}`,
    '',
    '⚠️ センシティブな情報です。信頼できるAI環境でのみ共有してください。',
  ].join('\n');
}

function generateCommunicationStyleSection(profile: UserProfile, language: 'ja' | 'en'): string {
  const recommendations: string[] = [];
  const bigfive = profile.tests.bigfive?.result;
  const rosenberg = profile.tests.rosenberg?.result;

  if (language === 'en') {
    recommendations.push('## Recommended Communication Style');
    recommendations.push('');

    if (bigfive) {
      if (bigfive.openness > 84) {
        recommendations.push('- **High Openness**: Prefer abstract, theoretical explanations. Welcome creative approaches.');
      } else if (bigfive.openness < 60) {
        recommendations.push('- **Low Openness**: Prefer practical, concrete explanations with step-by-step guidance.');
      }

      if (bigfive.conscientiousness > 84) {
        recommendations.push('- **High Conscientiousness**: Value detailed, structured information with accuracy and logical consistency.');
      }

      if (bigfive.extraversion < 60) {
        recommendations.push('- **Introverted**: Prefer concise, focused communication. Avoid overly social tone.');
      } else if (bigfive.extraversion > 84) {
        recommendations.push('- **Extraverted**: Prefer energetic, interactive tone. Welcome brainstorming and idea exploration.');
      }

      if (bigfive.agreeableness > 84) {
        recommendations.push('- **High Agreeableness**: Prefer empathetic, supportive tone. Value collaborative approach over confrontation.');
      }

      if (bigfive.neuroticism > 84) {
        recommendations.push('- **High Neuroticism**: Prone to anxiety. Use reassuring language and deliver negative feedback carefully.');
      }
    }

    if (rosenberg) {
      if (rosenberg.level === 'low') {
        recommendations.push('- **Low Self-Esteem**: Use positive, encouraging tone. Acknowledge small successes.');
      }
    }

    return recommendations.join('\n');
  }

  // 日本語
  recommendations.push('## 対話スタイルの推奨');
  recommendations.push('');

  if (bigfive) {
    if (bigfive.openness > 84) {
      recommendations.push('- **開放性が高い**: 抽象的・理論的な説明を好みます。創造的なアプローチを歓迎します。');
    } else if (bigfive.openness < 60) {
      recommendations.push('- **開放性が低い**: 実用的・具体的な説明を好みます。ステップバイステップのガイドを重視してください。');
    }

    if (bigfive.conscientiousness > 84) {
      recommendations.push('- **誠実性が高い**: 詳細で構造化された情報、正確性、論理的整合性を重視します。');
    }

    if (bigfive.extraversion < 60) {
      recommendations.push('- **内向的傾向**: 簡潔で要点を絞った対話を好みます。過度に社交的なトーンは避けてください。');
    } else if (bigfive.extraversion > 84) {
      recommendations.push('- **外向的傾向**: エネルギッシュで対話的なトーンを好みます。アイデアの探索やブレインストーミングを歓迎します。');
    }

    if (bigfive.agreeableness > 84) {
      recommendations.push('- **協調性が高い**: 共感的で支援的なトーンを好みます。対立的な議論よりも協力的なアプローチを重視します。');
    }

    if (bigfive.neuroticism > 84) {
      recommendations.push('- **神経症傾向が高い**: 不安や心配を感じやすい傾向があります。安心感を与える表現を使い、否定的なフィードバックは慎重に伝えてください。');
    }
  }

  if (rosenberg) {
    if (rosenberg.level === 'low') {
      recommendations.push('- **自尊心が低め**: 肯定的で励ましのあるトーンを心がけてください。小さな成功や進歩を積極的に認めることが重要です。');
    }
  }

  return recommendations.join('\n');
}

// ============================================================================
// ヘッダー・フッター
// ============================================================================

function getHeader(options: ExportOptions): string {
  if (options.language === 'en') {
    return [
      '# My Psychological Profile',
      '',
      'This profile is based on academically validated psychological scales from psychtest.jp.',
      'Please use this information to personalize our conversations.',
    ].join('\n');
  }

  return [
    '# 私の心理プロファイル',
    '',
    'このプロファイルは psychtest.jp で生成された学術的に検証済みの心理尺度に基づいています。',
    'この情報を活用して、私に合わせた対話をお願いします。',
  ].join('\n');
}

function getFooter(options: ExportOptions): string {
  if (options.language === 'en') {
    return [
      '---',
      '',
      '**Source**: psychtest.jp - Academic psychological assessments',
      '**Date**: ' + new Date().toLocaleDateString('ja-JP'),
      '',
      '⚠️ **Privacy Notice**: This profile contains personal psychological information. Please respect my privacy and do not share this information with others.',
    ].join('\n');
  }

  return [
    '---',
    '',
    '**出典**: psychtest.jp - 学術的心理診断',
    '**生成日**: ' + new Date().toLocaleDateString('ja-JP'),
    '',
    '⚠️ **プライバシーについて**: このプロファイルは個人的な心理情報を含みます。プライバシーを尊重し、第三者と共有しないでください。',
  ].join('\n');
}

// ============================================================================
// ヘルパー関数
// ============================================================================

function getScoreLevelJa(score: number): string {
  if (score <= 60) return '低';
  if (score >= 84) return '高';
  return '中';
}

function getScoreLevelEn(score: number): string {
  if (score <= 60) return 'Low';
  if (score >= 84) return 'High';
  return 'Medium';
}

function getQuadrantLabelJa(quadrant: string): string {
  const labels: Record<string, string> = {
    'Diligent Achiever': '勤勉な達成者',
    'Ambitious Visionary': '野心的なビジョナリー',
    'Steady Worker': '着実な実行者',
    'Flexible Explorer': '柔軟な探求者',
  };
  return labels[quadrant] || quadrant;
}

// ============================================================================
// フォーマット別の調整（将来の拡張用）
// ============================================================================

/**
 * ChatGPT向けに最適化（1500文字制限を考慮）
 */
export function formatForChatGPT(text: string): string {
  // 将来的に文字数制限への対応が必要な場合はここで調整
  if (text.length > 1500) {
    // 簡略化ロジック（要約など）
    console.warn('ChatGPT custom instructions may exceed 1500 character limit');
  }
  return text;
}

/**
 * Claude向けに最適化（制限が緩いため、より詳細に）
 */
export function formatForClaude(text: string): string {
  // Claudeは制限が緩いので、そのまま返す
  return text;
}

/**
 * 汎用Markdown（完全版）
 */
export function formatForMarkdown(text: string): string {
  return text;
}
