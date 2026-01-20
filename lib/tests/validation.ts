import type { ValidationResult } from "./types";

/**
 * 共通バリデーションロジック
 *
 * 設計ノート:
 * - 以前は各テストファイル（rosenberg.ts, phq9.ts等）に同じバリデーション関数が重複していた
 * - DRY原則に従い、このファイルに共通ロジックを抽出（2026-01-20）
 * - テスト固有の要件（質問数、範囲、許容値）は設定で表現
 */

/**
 * 回答パターンバリデーション設定
 */
export interface ValidationConfig {
  /** 期待される質問数 */
  expectedLength: number;
  /** 回答の最小値 */
  minValue: number;
  /** 最大値 */
  maxValue: number;
  /** 全て同じ回答でも許容する値（オプション）例: PHQ-9で全て0は正常 */
  allowedUniformValue?: number;
  /** メッセージタイプ（warning: 警告、message: エラー） */
  messageType?: "warning" | "message";
}

/**
 * 共通バリデーションロジック
 *
 * @param answers - ユーザーの回答配列
 * @param config - バリデーション設定
 * @returns バリデーション結果
 *
 * @example
 * // PHQ-9: 9問、0-3の範囲、全て0は許容
 * validateAnswerPattern(answers, {
 *   expectedLength: 9,
 *   minValue: 0,
 *   maxValue: 3,
 *   allowedUniformValue: 0,
 *   messageType: "message"
 * });
 *
 * @example
 * // Rosenberg: 10問、1-4の範囲、単純な警告のみ
 * validateAnswerPattern(answers, {
 *   expectedLength: 10,
 *   minValue: 1,
 *   maxValue: 4,
 *   messageType: "warning"
 * });
 */
export function validateAnswerPattern(
  answers: number[],
  config: ValidationConfig
): ValidationResult {
  const {
    expectedLength,
    minValue,
    maxValue,
    allowedUniformValue,
    messageType = "message",
  } = config;

  // 質問数チェック
  if (answers.length !== expectedLength) {
    return {
      valid: false,
      [messageType]: `回答数が不正です（${expectedLength}問必要）`,
    };
  }

  // 範囲チェック
  if (answers.some((answer) => answer < minValue || answer > maxValue)) {
    return {
      valid: false,
      [messageType]: `回答は${minValue}-${maxValue}の範囲で入力してください`,
    };
  }

  // すべて同じ回答のチェック
  const uniqueAnswers = new Set(answers);
  if (uniqueAnswers.size === 1) {
    const uniformValue = answers[0];

    // 許容される一様値の場合はOK（例: PHQ-9で全て0）
    if (allowedUniformValue !== undefined && uniformValue === allowedUniformValue) {
      return { valid: true };
    }

    // それ以外は警告/エラー
    return {
      valid: false,
      [messageType]:
        messageType === "warning"
          ? "すべて同じ回答が選択されています。正確な結果を得るため、各質問を注意深くお読みください。"
          : "すべての質問に同じ回答をしています。もう一度、各質問について考えてみてください。",
    };
  }

  // 回答バリエーションが少ない場合の警告（オプション）
  if (uniqueAnswers.size === 2 && messageType === "warning") {
    return {
      valid: true,
      warning:
        "回答パターンが単調です。より正確な結果を得るため、各質問に対して率直に答えることをお勧めします。",
    };
  }

  return { valid: true };
}

/**
 * SWLS特有のバリデーション
 * 中立点（4）を全て選択している場合の特別扱い
 */
export function validateSwlsAnswerPattern(answers: number[]): ValidationResult {
  const uniqueAnswers = new Set(answers);

  // 基本バリデーション
  const baseValidation = validateAnswerPattern(answers, {
    expectedLength: 5,
    minValue: 1,
    maxValue: 7,
    messageType: "message",
  });

  // すべて4（中立点）の場合は許容
  if (!baseValidation.valid && uniqueAnswers.size === 1 && answers[0] === 4) {
    return { valid: true };
  }

  return baseValidation;
}
