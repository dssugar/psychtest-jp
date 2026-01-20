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
import type { ResultSummaryProps } from '@/lib/og-design/types';

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
}: ResultSummaryProps) {
  // タイトルを行分割（改行または空白で分割）
  const titleLines = titleEn
    ? titleEn.includes('\n') || titleEn.includes('\\n')
      ? titleEn.split(/\\n|\n/)
      : titleEn.split(' ')
    : ['TEST'];

  return (
    <div
      className="w-full max-w-[1200px] mx-auto bg-white border-[12px] border-[#111111] flex"
      style={{
        aspectRatio: `${OG_SIZE.width} / ${OG_SIZE.height}`,
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

        {/* ウォーターマーク */}
        <div className="absolute bottom-5 right-5 text-base font-bold text-[#111111] opacity-20">
          psychtest.jp
        </div>
      </div>
    </div>
  );
}
