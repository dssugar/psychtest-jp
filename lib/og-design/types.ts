/**
 * OG画像とResultSummaryCardで共有する型定義
 */

import { DIMENSION_ORDER } from './constants';

/**
 * Big Five 次元キー
 */
export type DimensionKey = typeof DIMENSION_ORDER[number];

/**
 * 次元データ（表示用）
 */
export interface DimensionData {
  key: DimensionKey;
  label: string;      // 日本語名（例: "外向性"）
  score: number;      // 生スコア（24-120）
  percentage: number; // パーセンテージ（0-100）
  color: string;      // カラーコード（例: "#3b82f6"）
}

/**
 * Big Five スコアセット
 */
export interface BigFiveScores {
  extraversion: number;
  agreeableness: number;
  conscientiousness: number;
  neuroticism: number;
  openness: number;
}

/**
 * ResultSummaryCard / OG画像共通Props
 */
export interface ResultSummaryProps {
  /**
   * 次元データ配列（表示順）
   */
  dimensions: DimensionData[];

  /**
   * テスト名（例: "Big Five性格診断"）
   */
  testName: string;

  /**
   * サイト名（例: "心理測定ラボ"）
   */
  siteName: string;
}

/**
 * スコアを0-100%に変換するヘルパー型
 */
export type ScoreToPercentage = (score: number, min: number, max: number) => number;
