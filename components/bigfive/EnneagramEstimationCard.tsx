"use client";

import { DataBadge } from "@/components/viz/DataBadge";
import { BrutalProgressBar } from "@/components/viz/BrutalProgressBar";
import { enneagramTypeDescriptions } from "@/lib/scoring/enneagram-estimation";
import type { EnneagramEstimation } from "@/lib/scoring/bigfive";

interface EnneagramEstimationCardProps {
  estimation: EnneagramEstimation;
}

export function EnneagramEstimationCard({ estimation }: EnneagramEstimationCardProps) {
  const typeInfo = enneagramTypeDescriptions[estimation.primaryType];

  // 信頼度は常にlow/medium
  const confidenceColor = estimation.confidence === 'medium' ? 'yellow' : 'orange';
  const confidenceLabel = estimation.confidence === 'medium' ? '中信頼度' : '低信頼度';

  // スコアを降順でソート
  const sortedTypes = Object.entries(estimation.typeScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3); // トップ3のみ表示

  return (
    <div className="card-brutal p-8 bg-brutal-white">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl md:text-3xl font-display text-brutal-black">
            エニアグラム推定
          </h2>
          <DataBadge color={confidenceColor}>
            {confidenceLabel}
          </DataBadge>
        </div>
        <p className="text-sm text-brutal-gray-800">
          ビッグファイブ性格特性との相関に基づく推定（学術的相関は弱い: r=0.2-0.4）
        </p>
      </div>

      {/* Primary Type Display */}
      <div className="card-brutal p-6 bg-viz-pink mb-6">
        <div className="text-center">
          <div className="text-5xl md:text-7xl font-display font-bold text-brutal-black mb-3">
            タイプ {estimation.primaryType}
          </div>
          <div className="text-xl md:text-2xl font-bold text-brutal-black mb-2">
            {typeInfo.name}
          </div>
          <p className="text-brutal-gray-900 mb-4">
            {typeInfo.description}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <div className="font-bold text-brutal-black">核となる特性</div>
              <div className="text-brutal-gray-900">{typeInfo.coreTrait}</div>
            </div>
            <div>
              <div className="font-bold text-brutal-black">基本的欲求</div>
              <div className="text-brutal-gray-900">{typeInfo.coreDesire}</div>
            </div>
            <div>
              <div className="font-bold text-brutal-black">基本的恐れ</div>
              <div className="text-brutal-gray-900">{typeInfo.coreFear}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Types */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-brutal-black mb-4">
          上位3タイプのスコア
        </h3>
        <div className="space-y-3">
          {sortedTypes.map(([type, score], index) => {
            const typeNum = Number(type) as 1|2|3|4|5|6|7|8|9;
            const typeDesc = enneagramTypeDescriptions[typeNum];
            const percentage = score;

            return (
              <div key={type} className="border-l-4 border-brutal-black pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-bold">
                      {index === 0 && "🥇 "}
                      {index === 1 && "🥈 "}
                      {index === 2 && "🥉 "}
                      タイプ{type}: {typeDesc.name}
                    </span>
                  </div>
                  <DataBadge color="pink" size="sm">
                    {percentage.toFixed(0)}点
                  </DataBadge>
                </div>
                <BrutalProgressBar
                  value={percentage}
                  color="pink"
                  label=""
                  height="sm"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* All 9 Types Radar (Simple List) */}
      <details className="mb-6">
        <summary className="cursor-pointer font-bold text-brutal-black mb-3">
          全9タイプのスコアを表示 ▼
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          {Object.entries(estimation.typeScores)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([type, score]) => {
              const typeNum = Number(type) as 1|2|3|4|5|6|7|8|9;
              const typeDesc = enneagramTypeDescriptions[typeNum];
              return (
                <div key={type} className="flex justify-between border-b border-brutal-gray-300 pb-1">
                  <span>タイプ{type}: {typeDesc.name.split(' ')[0]}</span>
                  <span className="font-mono">{score.toFixed(0)}</span>
                </div>
              );
            })}
        </div>
      </details>

      {/* Academic Reference */}
      <div className="card-brutal p-4 bg-brutal-gray-50 mb-4">
        <div className="text-xs font-mono text-brutal-gray-900">
          <div className="font-bold mb-1">学術的根拠:</div>
          {estimation.academicReference}
        </div>
      </div>

      {/* Strong Disclaimer */}
      <div className="card-brutal p-4 bg-viz-orange border-brutal-black">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <div className="font-bold text-brutal-black mb-1 uppercase tracking-wide text-xs">
              学術的信頼性に関する注意
            </div>
            <div className="text-sm text-brutal-black">
              {estimation.disclaimer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
