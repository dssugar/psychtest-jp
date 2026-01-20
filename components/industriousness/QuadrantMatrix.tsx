/**
 * Industriousness 2×2象限マトリクス
 *
 * C4（目標達成意欲）とC5（自己統制力）の2軸で4つの象限を表示
 */

'use client';

import type { IndustriousnessQuadrant } from '@/lib/tests/industriousness';

interface QuadrantMatrixProps {
  c4_percentile: number; // 0-100%
  c5_percentile: number; // 0-100%
  quadrant: IndustriousnessQuadrant;
  quadrantLabel: string;
}

export function QuadrantMatrix({
  c4_percentile,
  c5_percentile,
  quadrant,
  quadrantLabel,
}: QuadrantMatrixProps) {
  // プロット位置を計算（0-100% → 0-100%座標系）
  const plotX = c4_percentile;
  const plotY = 100 - c5_percentile; // Y軸は上が高いので反転

  // 各象限のラベルとスタイル
  const quadrants = [
    {
      id: 'achiever',
      label: '実行者型',
      desc: '高目標×高統制',
      x: 'right-0 top-0',
      bgActive: 'bg-brutal-black text-white',
      bgInactive: 'bg-white text-brutal-gray-700',
    },
    {
      id: 'visionary',
      label: '構想家型',
      desc: '高目標×低統制',
      x: 'right-0 bottom-0',
      bgActive: 'bg-[#3b82f6] text-white',
      bgInactive: 'bg-white text-brutal-gray-700',
    },
    {
      id: 'steady',
      label: '着実型',
      desc: '低目標×高統制',
      x: 'left-0 top-0',
      bgActive: 'bg-[#10b981] text-white',
      bgInactive: 'bg-white text-brutal-gray-700',
    },
    {
      id: 'relaxed',
      label: 'マイペース型',
      desc: '低目標×低統制',
      x: 'left-0 bottom-0',
      bgActive: 'bg-brutal-gray-600 text-white',
      bgInactive: 'bg-white text-brutal-gray-700',
    },
  ];

  return (
    <div className="card-brutal p-8 bg-white">
      <h3 className="text-2xl md:text-3xl font-bold text-brutal-black mb-6">
        あなたの位置：{quadrantLabel}
      </h3>

      <div className="relative" style={{ aspectRatio: '1 / 1', maxWidth: '500px', margin: '0 auto' }}>
        {/* グリッド背景 */}
        <div className="absolute inset-0 border-4 border-brutal-black">
          {/* 中央の十字線 */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-brutal-gray-300 -ml-[1px]" />
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-brutal-gray-300 -mt-[1px]" />

          {/* 4象限のラベル */}
          {quadrants.map((q) => (
            <div
              key={q.id}
              className={`absolute w-1/2 h-1/2 ${q.x} flex flex-col items-center justify-center p-4 text-center border border-brutal-gray-200 ${
                q.id === quadrant ? q.bgActive : q.bgInactive
              }`}
            >
              <div className="font-bold text-lg mb-1">{q.label}</div>
              <div className="text-xs opacity-70">{q.desc}</div>
            </div>
          ))}

          {/* あなたの位置（ドット） */}
          <div
            className="absolute w-6 h-6 rounded-full bg-brutal-black border-4 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              left: `${plotX}%`,
              top: `${plotY}%`,
            }}
            title={`C4: ${c4_percentile.toFixed(1)}%, C5: ${c5_percentile.toFixed(1)}%`}
          />
        </div>

        {/* 軸ラベル */}
        <div className="absolute -bottom-8 left-0 right-0 text-center text-sm font-bold text-brutal-gray-700">
          目標達成意欲 →
        </div>
        <div
          className="absolute -left-12 top-0 bottom-0 flex items-center text-sm font-bold text-brutal-gray-700"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          自己統制力 →
        </div>
      </div>

      {/* 凡例 */}
      <div className="mt-12 text-sm text-brutal-gray-700">
        <p className="mb-2">
          <strong>あなたのスコア：</strong>
        </p>
        <ul className="space-y-1 ml-4">
          <li>• 目標達成意欲: {c4_percentile.toFixed(1)}%</li>
          <li>• 自己統制力: {c5_percentile.toFixed(1)}%</li>
        </ul>
        <p className="mt-4 text-xs text-brutal-gray-600">
          ※ パーセンタイルは10-50点のスコア範囲を0-100%に正規化した値です。
        </p>
      </div>
    </div>
  );
}
