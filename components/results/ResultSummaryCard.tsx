/**
 * 診断結果サマリーカード（1200×630px）
 *
 * デザインコンセプト: Dense & Bold（高密度・高コントラスト）
 * OG画像と完全に同じビジュアルで表示されるカードコンポーネント。
 * 結果ページの最初に配置され、SNSシェア時のプレビューとしても機能。
 *
 * 汎用化版：全てのテストに対応
 */

'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { OG_SIZE } from '@/lib/og-design/constants';
import type { ResultSummaryProps, ScoreRange } from '@/lib/og-design/types';

/**
 * 個別ラベルの自動フィットコンポーネント（右カラムのグラフラベル用）
 */
function AutoFitLabel({ label }: { label: string }) {
  const labelRef = useRef<HTMLDivElement>(null);
  const [scaleX, setScaleX] = useState(1);

  useLayoutEffect(() => {
    if (labelRef.current) {
      const container = labelRef.current.parentElement;
      if (!container) return;

      // 一時的にscaleをリセットして実際の幅を測定
      labelRef.current.style.transform = 'none';
      const textWidth = labelRef.current.scrollWidth;
      const containerWidth = container.offsetWidth;

      if (textWidth > containerWidth) {
        // はみ出る場合は縮小率を計算（余裕を持たせるため0.95倍）
        const newScale = (containerWidth / textWidth) * 0.95;
        setScaleX(newScale);
      } else {
        setScaleX(1);
      }
    }
  }, [label]);

  return (
    <div
      ref={labelRef}
      className="text-2xl md:text-3xl lg:text-[32px] font-bold text-[#111111] whitespace-nowrap"
      style={{
        transform: `scaleX(${scaleX})`,
        transformOrigin: 'left center',
      }}
    >
      {label}
    </div>
  );
}

/**
 * タイトル行の自動フィットコンポーネント（左カラムの大タイトル用）
 */
function AutoFitTitleLine({ children, isFirstLine }: { children: string; isFirstLine: boolean }) {
  const titleRef = useRef<HTMLSpanElement>(null);
  const [scaleX, setScaleX] = useState(1);

  useLayoutEffect(() => {
    if (titleRef.current) {
      const container = titleRef.current.parentElement;
      if (!container) return;

      // 一時的にscaleをリセットして実際の幅を測定
      titleRef.current.style.transform = 'none';
      const textWidth = titleRef.current.scrollWidth;
      const containerWidth = container.offsetWidth;

      if (textWidth > containerWidth) {
        // はみ出る場合は縮小率を計算（余裕を持たせるため0.98倍）
        const newScale = (containerWidth / textWidth) * 0.98;
        setScaleX(newScale);
      } else {
        setScaleX(1);
      }
    }
  }, [children]);

  return (
    <span
      ref={titleRef}
      className={isFirstLine ? '' : 'text-[#E5E7EB]'}
      style={{
        display: 'block',
        transform: `scaleX(${scaleX})`,
        transformOrigin: 'left center',
      }}
    >
      {children}
    </span>
  );
}

export function ResultSummaryCard({
  dimensions,
  titleEn,
  category,
  description,
  siteName = 'PSYCHOMETRIC LAB',
  levelLabel: providedLevelLabel,
  shortInterpretation: providedShortInterpretation,
  scaleMarkers: providedScaleMarkers,
  config,
  testResult,
}: ResultSummaryProps) {
  // 1200×630pxで固定描画し、画面幅に応じてscaleで縮小
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = Math.min(containerWidth / OG_SIZE.width, 1);
        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);
  // タイトルを行分割（改行または空白で分割）
  const titleLines = titleEn
    ? titleEn.includes('\n') || titleEn.includes('\\n')
      ? titleEn.split(/\\n|\n/)
      : titleEn.split(' ')
    : ['TEST'];

  // 単一スコアかどうかを判定
  const isSingleScore = dimensions.length === 1;

  // 単一スコア専用データを取得
  // オプション1: 直接渡された場合はそれを使用
  // オプション2: configとtestResultが渡された場合は内部で計算
  const levelLabel = providedLevelLabel ||
    (isSingleScore && config?.ogImage?.getLevelLabel && testResult
      ? config.ogImage.getLevelLabel(testResult)
      : undefined);

  const shortInterpretation = providedShortInterpretation ||
    (isSingleScore && config?.ogImage?.getShortInterpretation && testResult
      ? config.ogImage.getShortInterpretation(testResult)
      : undefined);

  const scaleMarkers = providedScaleMarkers ||
    (isSingleScore && config?.ogImage?.scaleMarkers
      ? config.ogImage.scaleMarkers
      : undefined);

  const scoreRanges = isSingleScore && config?.ogImage?.scoreRanges
    ? config.ogImage.scoreRanges
    : undefined;

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden"
      style={{
        height: `${OG_SIZE.height * scale}px`,
      }}
    >
      <div
        className="bg-white border-[12px] border-[#111111] flex"
        style={{
          width: `${OG_SIZE.width}px`,
          height: `${OG_SIZE.height}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
      {/* 左カラム：タイトルとブランド情報（黒背景・白文字） */}
      <div className="w-[400px] bg-[#111111] text-white px-10 py-12 flex flex-col justify-between border-r-8 border-[#111111]">
        {/* 上部：タイトルエリア */}
        <div className="flex flex-col">
          <div className="text-lg md:text-xl font-bold text-[#F9FAFB] tracking-[0.15em] mb-5 border-b-2 border-[#333] pb-2.5 w-fit">
            {siteName}
          </div>

          <div className="text-6xl md:text-7xl lg:text-[100px] font-black leading-[0.85] tracking-tight flex flex-col">
            {titleLines.map((line, i) => (
              <AutoFitTitleLine key={i} isFirstLine={i === 0}>
                {line}
              </AutoFitTitleLine>
            ))}
          </div>
        </div>

        {/* 下部：装飾・メタ情報 */}
        <div className="flex flex-col">
          <div className="text-2xl md:text-[32px] font-bold mb-3">
            {category}
          </div>

          {description && (
            <div className="text-sm md:text-base text-[#9CA3AF] leading-relaxed mb-6">
              {description.split(/\\n|\n/).map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 右カラム：データエリア（グラフ最大化） */}
      <div
        className="flex-1 bg-[#F9FAFB] px-8 md:px-[40px] py-4 md:py-[20px] flex flex-col justify-center relative"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(206, 206, 206, 0.4) 2px, transparent 2.5px)',
          backgroundSize: '30px 30px',
        }}
      >
        {/* 単一スコアの場合：3段レイアウト */}
        {isSingleScore && levelLabel ? (
          <>
            {/* 上段：判定ラベル */}
            <div className="flex flex-col items-center mb-6">
              <div className="text-5xl md:text-6xl lg:text-[72px] font-black text-[#111111] text-center leading-tight">
                {levelLabel}
              </div>
            </div>

            {/* 中段：スコア + バー + 境界線ラベル */}
            <div className="flex flex-col mb-6">
              {/* スコア数値（バーの上、中央配置） */}
              <div className="flex justify-center mb-4">
                <div
                  className="text-6xl md:text-7xl lg:text-[96px] font-black font-mono text-[#111111] leading-none tabular-nums"
                  style={{
                    fontFeatureSettings: '"tnum" 1',
                  }}
                >
                  {dimensions[0].score}
                </div>
              </div>

              {/* バーエリア（境界線とラベルを含む） */}
              <div className="relative">
                <div
                  className="w-full h-[48px] md:h-[58px] lg:h-[68px] bg-white border-[3px] border-[#111111] overflow-hidden relative"
                  style={{
                    boxShadow: '4px 4px 0px 0px #111111',
                  }}
                >
                  {/* 進捗バー */}
                  <div
                    className="h-full border-r-[3px] border-[#111111]"
                    style={{
                      width: `${dimensions[0].percentage}%`,
                      backgroundColor: dimensions[0].color,
                    }}
                  />

                  {/* 区分境界線（バーの中） */}
                  {scoreRanges && scoreRanges.length > 0 && (() => {
                    const minScore = Math.min(...scoreRanges.map((r: ScoreRange) => r.min));
                    const maxScore = Math.max(...scoreRanges.map((r: ScoreRange) => r.max));
                    const totalRange = maxScore - minScore;

                    return scoreRanges.map((range: ScoreRange, index: number) => {
                      if (index === 0) return null; // 最初の境界線はスキップ
                      const leftPercent = ((range.min - minScore) / totalRange) * 100;
                      return (
                        <div
                          key={index}
                          className="absolute top-0 bottom-0 w-[2px] bg-[#111111] opacity-40"
                          style={{
                            left: `${leftPercent}%`,
                          }}
                        />
                      );
                    });
                  })()}
                </div>

                {/* ラベル（バーの下） */}
                {scoreRanges && scoreRanges.length > 0 && (
                  <div className="relative w-full h-6 mt-2">
                    {(() => {
                      const minScore = Math.min(...scoreRanges.map((r: ScoreRange) => r.min));
                      const maxScore = Math.max(...scoreRanges.map((r: ScoreRange) => r.max));
                      const totalRange = maxScore - minScore;

                      // 境界線の位置を配列化（例: [10, 20, 30, 40]）
                      const boundaries = [minScore, ...scoreRanges.slice(1).map((r: ScoreRange) => r.min), maxScore];

                      return scoreRanges.map((range: ScoreRange, index: number) => {
                        // 区間の開始と終了位置
                        const rangeStart = boundaries[index];
                        const rangeEnd = boundaries[index + 1];
                        // 区間の中央値
                        const centerValue = (rangeStart + rangeEnd) / 2;
                        // 中央値の位置（%）
                        const centerPercent = ((centerValue - minScore) / totalRange) * 100;

                        return (
                          <div
                            key={index}
                            className="absolute text-base md:text-lg font-bold text-[#111111] transform -translate-x-1/2"
                            style={{
                              left: `${centerPercent}%`,
                            }}
                          >
                            {range.label}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* 下段：解説文 */}
            {shortInterpretation && (
              <div className="bg-[#F3F4F6] p-6 border-[3px] border-[#111111]">
                <div className="text-xl md:text-2xl lg:text-[28px] font-bold text-[#111111] leading-relaxed">
                  {shortInterpretation.split('\n').map((line: string, i: number) => (
                    <span key={i}>
                      {line}
                      {i < shortInterpretation.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          // 複数スコアの場合：既存のバーレイアウト
          <>
            {dimensions.map((dim, index) => (
              <div
                key={dim.key}
                className="flex items-center"
                style={{
                  marginBottom: index === dimensions.length - 1 ? '0' : '32px',
                }}
              >
                {/* 項目名 */}
                <div className="w-[130px] md:w-[150px] lg:w-[170px]">
                  <AutoFitLabel label={dim.label} />
                </div>

                {/* バーエリア（極太化 + 密集） */}
                <div
                  className="flex-1 h-[48px] md:h-[58px] lg:h-[68px] bg-white border-[3px] border-[#111111] mr-6 overflow-hidden relative"
                  style={{
                    boxShadow: '4px 4px 0px 0px #111111',
                  }}
                >
                  <div
                    className="h-full border-r-[3px] border-[#111111]"
                    style={{
                      width: `${dim.percentage}%`,
                      backgroundColor: dim.color,
                    }}
                  />
                </div>

                {/* スコア数値（等幅フォント、固定幅で右揃え） */}
                <div
                  className="text-4xl md:text-5xl lg:text-[56px] font-black font-mono text-[#111111] leading-none tabular-nums"
                  style={{
                    width: '100px',
                    textAlign: 'right',
                    fontFeatureSettings: '"tnum" 1',
                  }}
                >
                  {dim.score}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ウォーターマーク */}
        <div className="absolute bottom-5 right-5 text-base font-bold text-[#111111] opacity-20">
          psychtest.jp
        </div>
      </div>
      </div>
    </div>
  );
}
