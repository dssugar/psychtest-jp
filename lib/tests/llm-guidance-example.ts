/**
 * LLMガイダンスの型定義と実装例
 *
 * 各心理テストの結果に基づいて、LLMアシスタントへの推奨スタイルを提供
 */

import type { BigFiveResult } from "./bigfive";
import type { RosenbergResult } from "./rosenberg";

// ============================================================================
// 型定義
// ============================================================================

/**
 * LLMガイダンスの構造
 */
export interface LLMGuidance<TResult> {
  /**
   * 結果からLLM向けの推奨テキストを生成
   * @param result - テスト結果
   * @param language - 出力言語
   * @returns LLM向けガイダンステキスト
   */
  generateGuidance: (result: TResult, language: 'ja' | 'en') => string;

  /**
   * スコアレベルごとの推奨スタイル（オプショナル）
   * Big Fiveの場合は次元ごと、単一スコアの場合はレベルごと
   */
  styleRecommendations?: Record<string, {
    ja: string;
    en: string;
  }>;
}

// ============================================================================
// Big Five用のLLMガイダンス
// ============================================================================

export const bigFiveLLMGuidance: LLMGuidance<BigFiveResult> = {
  generateGuidance: (result: BigFiveResult, language: 'ja' | 'en'): string => {
    const recommendations: string[] = [];

    // 開放性（Openness）
    if (result.openness > 84) {
      recommendations.push(
        language === 'ja'
          ? '- **開放性が高い**: 新しいアイデアや抽象的な概念を好むため、理論的な説明や創造的なアプローチを提供してください。'
          : '- **High Openness**: Prefers theoretical explanations and creative approaches. Use abstract concepts freely.'
      );
    } else if (result.openness < 60) {
      recommendations.push(
        language === 'ja'
          ? '- **開放性が低い**: 実用的で具体的な説明を好むため、実例やステップバイステップのガイドを重視してください。'
          : '- **Low Openness**: Prefers practical, concrete explanations with step-by-step guidance.'
      );
    }

    // 誠実性（Conscientiousness）
    if (result.conscientiousness > 84) {
      recommendations.push(
        language === 'ja'
          ? '- **誠実性が高い**: 詳細で構造化された情報、正確性、論理的整合性を重視します。'
          : '- **High Conscientiousness**: Values detailed, structured information with accuracy and logical consistency.'
      );
    }

    // 外向性（Extraversion）
    if (result.extraversion < 60) {
      recommendations.push(
        language === 'ja'
          ? '- **内向的傾向**: 簡潔で要点を絞った対話を好みます。過度に社交的なトーンは避けてください。'
          : '- **Introverted tendency**: Prefers concise, focused communication. Avoid overly social tone.'
      );
    } else if (result.extraversion > 84) {
      recommendations.push(
        language === 'ja'
          ? '- **外向的傾向**: エネルギッシュで対話的なトーンを好みます。アイデアの探索やブレインストーミングを歓迎します。'
          : '- **Extraverted tendency**: Prefers energetic, interactive tone. Welcomes brainstorming and idea exploration.'
      );
    }

    // 協調性（Agreeableness）
    if (result.agreeableness > 84) {
      recommendations.push(
        language === 'ja'
          ? '- **協調性が高い**: 共感的で支援的なトーンを好みます。対立的な議論よりも協力的なアプローチを重視します。'
          : '- **High Agreeableness**: Prefers empathetic, supportive tone. Values collaborative approach over confrontation.'
      );
    }

    // 神経症傾向（Neuroticism）
    if (result.neuroticism > 84) {
      recommendations.push(
        language === 'ja'
          ? '- **神経症傾向が高い**: 不安や心配を感じやすい傾向があります。安心感を与える表現を使い、否定的なフィードバックは慎重に伝えてください。'
          : '- **High Neuroticism**: Prone to anxiety. Use reassuring language and deliver negative feedback carefully.'
      );
    }

    return recommendations.join('\n');
  },

  styleRecommendations: {
    'openness-high': {
      ja: '抽象的・理論的な説明を好む。創造的なアプローチを歓迎。',
      en: 'Prefers abstract, theoretical explanations. Welcomes creative approaches.',
    },
    'openness-low': {
      ja: '実用的・具体的な説明を好む。ステップバイステップのガイドを重視。',
      en: 'Prefers practical, concrete explanations with step-by-step guidance.',
    },
    'conscientiousness-high': {
      ja: '詳細で構造化された情報を重視。正確性と論理的整合性を求める。',
      en: 'Values detailed, structured information with accuracy and consistency.',
    },
    'extraversion-low': {
      ja: '簡潔で要点を絞った対話を好む。内省的なスタイル。',
      en: 'Prefers concise, focused communication. Reflective style.',
    },
    'extraversion-high': {
      ja: 'エネルギッシュで対話的なトーンを好む。ブレインストーミングを歓迎。',
      en: 'Prefers energetic, interactive tone. Welcomes brainstorming.',
    },
    'agreeableness-high': {
      ja: '共感的で支援的なトーンを好む。協力的なアプローチを重視。',
      en: 'Prefers empathetic, supportive tone. Values collaborative approach.',
    },
    'neuroticism-high': {
      ja: '不安を感じやすい。安心感を与える表現を使用。',
      en: 'Prone to anxiety. Use reassuring language.',
    },
  },
};

// ============================================================================
// Rosenberg用のLLMガイダンス
// ============================================================================

export const rosenbergLLMGuidance: LLMGuidance<RosenbergResult> = {
  generateGuidance: (result: RosenbergResult, language: 'ja' | 'en'): string => {
    const recommendations: string[] = [];

    if (result.level === 'low') {
      recommendations.push(
        language === 'ja'
          ? '- **自尊心が低め**: 自己批判的になりやすい傾向があります。肯定的で励ましのあるトーンを心がけ、批判的なフィードバックは慎重に伝えてください。小さな成功や進歩を積極的に認めることが重要です。'
          : '- **Low Self-Esteem**: Prone to self-criticism. Use positive, encouraging tone. Acknowledge small successes.'
      );
    } else if (result.level === 'high') {
      recommendations.push(
        language === 'ja'
          ? '- **自尊心が高め**: 自己価値感が安定しています。建設的なフィードバックを率直に提供しても受け入れやすい傾向があります。'
          : '- **High Self-Esteem**: Stable self-worth. Can receive constructive feedback openly.'
      );
    } else {
      recommendations.push(
        language === 'ja'
          ? '- **自尊心が平均的**: バランスの取れた対話スタイルが適しています。肯定的なフィードバックと建設的な提案の両方を提供してください。'
          : '- **Average Self-Esteem**: Balanced communication style is appropriate. Provide both positive and constructive feedback.'
      );
    }

    return recommendations.join('\n');
  },

  styleRecommendations: {
    'low': {
      ja: '肯定的で励ましのあるトーン。批判は慎重に。小さな成功を認める。',
      en: 'Positive, encouraging tone. Careful with criticism. Acknowledge small wins.',
    },
    'medium': {
      ja: 'バランスの取れた対話スタイル。肯定と建設的提案の両方。',
      en: 'Balanced communication. Both positive and constructive feedback.',
    },
    'high': {
      ja: '建設的なフィードバックを率直に提供可能。',
      en: 'Can provide constructive feedback openly.',
    },
  },
};

// ============================================================================
// 使用例
// ============================================================================

/**
 * 使用例：Big Fiveの結果からLLMガイダンスを生成
 */
export function exampleUsageBigFive() {
  const result: BigFiveResult = {
    openness: 95,
    conscientiousness: 105,
    extraversion: 42,
    agreeableness: 78,
    neuroticism: 88,
    facets: {} as any, // 省略
    mbtiEstimation: undefined,
    enneagramEstimation: undefined,
  };

  const guidance = bigFiveLLMGuidance.generateGuidance(result, 'ja');
  console.log(guidance);
  /*
  出力例:
  - **開放性が高い**: 新しいアイデアや抽象的な概念を好むため、理論的な説明や創造的なアプローチを提供してください。
  - **誠実性が高い**: 詳細で構造化された情報、正確性、論理的整合性を重視します。
  - **内向的傾向**: 簡潔で要点を絞った対話を好みます。過度に社交的なトーンは避けてください。
  - **神経症傾向が高い**: 不安や心配を感じやすい傾向があります。安心感を与える表現を使い、否定的なフィードバックは慎重に伝えてください。
  */
}
