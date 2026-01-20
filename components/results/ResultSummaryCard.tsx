/**
 * 診断結果サマリーカード（1200×630px）
 *
 * デザインコンセプト: Dense & Bold（高密度・高コントラスト）
 * OG画像と完全に同じビジュアルで表示されるカードコンポーネント。
 * 結果ページの最初に配置され、SNSシェア時のプレビューとしても機能。
 */

import { OG_SIZE } from '@/lib/og-design/constants';
import type { ResultSummaryProps } from '@/lib/og-design/types';

export function ResultSummaryCard({
  dimensions,
  testName,
  siteName,
}: ResultSummaryProps) {
  // ランダムID（装飾用）
  const reportId = Math.floor(Math.random() * 90000) + 10000;

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
            PSYCHOMETRIC LAB
          </div>

          <div className="text-6xl md:text-7xl lg:text-[100px] font-black leading-[0.85] tracking-tight flex flex-col">
            <span>BIG</span>
            <span className="text-[#E5E7EB]">FIVE</span>
          </div>
        </div>

        {/* 下部：装飾・メタ情報 */}
        <div className="flex flex-col">
          <div className="text-2xl md:text-[32px] font-bold mb-3">
            性格特性診断
          </div>

          {/* 説明文の復活 */}
          <div className="text-sm md:text-base text-[#9CA3AF] leading-relaxed mb-6">
            科学的根拠に基づいた<br />
            5つの主要特性スコアレポート
          </div>

          <div className="flex items-center bg-[#333333] px-5 py-3 rounded-lg">
            <div className="text-xl md:text-2xl mr-2.5">ID</div>
            <div className="text-2xl md:text-[32px] font-black font-mono tabular-nums">{reportId}</div>
          </div>
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
            <div className="w-[130px] md:w-[150px] lg:w-[170px] text-2xl md:text-3xl lg:text-[32px] font-bold text-[#111111]">
              {dim.label}
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

            {/* スコア数値（等幅フォント） */}
            <div className="w-[70px] md:w-[80px] lg:w-[90px] text-right text-4xl md:text-5xl lg:text-[56px] font-black font-mono text-[#111111] leading-none tabular-nums">
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
