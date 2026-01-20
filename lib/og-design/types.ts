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
 * 汎用的な型。Big Five以外のテストでも使用可能。
 */
export interface DimensionData {
  key: string;        // 次元キー（例: "extraversion", "total"）
  label: string;      // 日本語名（例: "外向性", "総合スコア"）
  score: number;      // 生スコア（テスト依存）
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
   * 英語タイトル（例: "BIG FIVE"）
   * 改行または空白で分割して2行表示
   */
  titleEn?: string;

  /**
   * カテゴリ（例: "性格特性診断"）
   */
  category: string;

  /**
   * 説明文（例: "科学的根拠に基づいた\n5つの主要特性スコアレポート"）
   * \nで改行
   */
  description?: string;

  /**
   * サイト名（例: "PSYCHOMETRIC LAB"）
   * デフォルト: "PSYCHOMETRIC LAB"
   */
  siteName?: string;

  /** @deprecated Use titleEn instead */
  testName?: string;
}

/**
 * スコアを0-100%に変換するヘルパー型
 */
export type ScoreToPercentage = (score: number, min: number, max: number) => number;

/**
 * OG画像レイアウトタイプ
 */
export type OGLayoutType = 'bar' | 'single' | 'radar' | 'category';

/**
 * スコア表示タイプ
 */
export type ScoreDisplayType = 'raw' | 'percentage' | 'category' | 'range';

/**
 * OG画像設定（TestConfigに統合）
 */
export interface OGImageConfig {
  /** レイアウトタイプ */
  layoutType: OGLayoutType;
  /** 英語タイトル（例: "BIG FIVE"） */
  titleEn?: string;
  /** カテゴリ（例: "性格特性診断"） */
  category: string;
  /** 説明文（左カラム下部） */
  description?: string;
  /** 次元別カラー（barレイアウト用） */
  colors?: Record<string, string>;
  /** 次元の日本語ラベル（barレイアウト用） */
  dimensionLabels?: Record<string, string>;
  /** 免責事項 */
  disclaimer?: string;

  /** スコア表示設定 */
  scoreDisplay?: {
    /** 表示タイプ */
    type: ScoreDisplayType;
    /** 最小値 */
    min?: number;
    /** 最大値 */
    max?: number;
    /** 単位（例: "点"） */
    unit?: string;
  };

  /**
   * スコアからクエリパラメータへの変換関数
   * 例: { extraversion: 72, agreeableness: 80 } => { e: "72", a: "80" }
   */
  scoreToParams?: (result: any) => Record<string, string>;

  /**
   * クエリパラメータからスコアへの変換関数
   * 例: { e: "72", a: "80" } => { extraversion: 72, agreeableness: 80 }
   */
  paramsToScore?: (params: URLSearchParams) => Record<string, number>;
}
