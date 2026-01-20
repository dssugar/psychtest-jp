'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ResultSummaryCard } from '@/components/results/ResultSummaryCard';
import { Card } from '@/components/ui/Card';
import type { DimensionData } from '@/lib/og-design/types';

interface SharePageClientProps {
  test: string;
  basePath: string;
  ogImageConfig: any;
  scaleInfo: any;
}

export function SharePageClient({
  test,
  basePath,
  ogImageConfig,
  scaleInfo,
}: SharePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // クエリパラメータからスコアを復元（手動実装）
  const rawScores = useMemo(() => {
    const scores: Record<string, number> = {};

    // Big Five型の場合
    if (ogImageConfig.layoutType === 'bar') {
      searchParams.forEach((value, key) => {
        const numValue = parseInt(value);
        if (!isNaN(numValue)) {
          // Big Fiveの場合: e→extraversion, a→agreeableness など
          const keyMap: Record<string, string> = {
            e: 'extraversion',
            a: 'agreeableness',
            c: 'conscientiousness',
            n: 'neuroticism',
            o: 'openness',
          };
          const fullKey = keyMap[key] || key;
          scores[fullKey] = numValue;
        }
      });
    }

    // 単一スコア型の場合
    if (ogImageConfig.layoutType === 'single') {
      const total = searchParams.get('total');
      if (total) {
        scores.total = parseInt(total);
      }
    }

    return scores;
  }, [searchParams, ogImageConfig.layoutType]);

  // DimensionData配列を生成
  const dimensions = useMemo((): DimensionData[] => {
    if (!ogImageConfig) return [];

    switch (ogImageConfig.layoutType) {
      case 'bar':
        // Big Five型（複数次元）
        return Object.entries(rawScores).map(([key, score]) => {
          const label = ogImageConfig.dimensionLabels?.[key] || key;
          const color = ogImageConfig.colors?.[key] || '#3b82f6';
          const percentage = ogImageConfig.scoreDisplay
            ? Math.round(((score as number - (ogImageConfig.scoreDisplay.min || 0)) / ((ogImageConfig.scoreDisplay.max || 100) - (ogImageConfig.scoreDisplay.min || 0))) * 100)
            : 0;

          return {
            key,
            label,
            score: score as number,
            percentage,
            color,
          };
        });

      case 'single':
        // 単一スコア型（PHQ-9, K6等）
        const totalScore = rawScores.total || 0;
        return [
          {
            key: 'total',
            label: '総合スコア',
            score: totalScore as number,
            percentage: 0,
            color: '#3b82f6',
          },
        ];

      default:
        return [];
    }
  }, [ogImageConfig, rawScores]);

  return (
    <main className="min-h-screen bg-brutal-cream py-8 px-4">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* スコアカード表示 */}
        <ResultSummaryCard
          dimensions={dimensions}
          titleEn={ogImageConfig.titleEn}
          category={ogImageConfig.category}
          description={ogImageConfig.description}
        />

        {/* CTA Section (Pattern B: ソーシャルプルーフ) */}
        <Card padding="xl" className="text-center">
          <h2
            className="text-3xl md:text-4xl text-brutal-black mb-4"
            style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}
          >
            友達の結果を見ましたか？
            <br />
            あなたも診断してみませんか？
          </h2>
          <p className="text-lg md:text-xl text-brutal-gray-700 mb-8 leading-relaxed">
            {scaleInfo.nameJa}で、あなたの特性を科学的に測定できます。
            <br />
            友達と結果を比較して、お互いをもっと理解しましょう！
          </p>

          <Link
            href={basePath}
            className="inline-block bg-brutal-black text-brutal-white text-xl font-black px-12 py-5 border-[3px] border-brutal-black shadow-brutal hover:shadow-brutal-lg transition-all hover:-translate-y-1"
          >
            無料で診断する（所要時間: 約{scaleInfo.stats.minutes}分）
          </Link>

          <div className="flex justify-center gap-8 mt-8 flex-wrap text-sm text-brutal-gray-600 font-semibold">
            <div>✓ 完全無料</div>
            <div>✓ 会員登録不要</div>
            <div>✓ {scaleInfo.stats.questions}問</div>
          </div>
        </Card>

        {/* About Test Section (Pattern C: 詳細説明) */}
        <Card padding="lg">
          <h3
            className="text-2xl md:text-3xl text-brutal-black mb-4 pb-2 border-b-[3px] border-brutal-black"
            style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}
          >
            この診断について
          </h3>
          <p className="text-base md:text-lg text-brutal-gray-700 leading-relaxed mb-6">
            {scaleInfo.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-brutal-gray-50 p-4 border-2 border-brutal-black">
              <strong className="block text-sm font-bold text-brutal-black mb-2">
                開発者
              </strong>
              <span className="text-sm text-brutal-gray-700">
                {scaleInfo.developer}
              </span>
            </div>
            <div className="bg-brutal-gray-50 p-4 border-2 border-brutal-black">
              <strong className="block text-sm font-bold text-brutal-black mb-2">
                信頼性
              </strong>
              <span className="text-sm text-brutal-gray-700">
                Cronbach's α = {scaleInfo.reliability.cronbachAlpha}
              </span>
            </div>
            <div className="bg-brutal-gray-50 p-4 border-2 border-brutal-black">
              <strong className="block text-sm font-bold text-brutal-black mb-2">
                再テスト信頼性
              </strong>
              <span className="text-sm text-brutal-gray-700">
                {scaleInfo.reliability.testRetest}
              </span>
            </div>
            <div className="bg-brutal-gray-50 p-4 border-2 border-brutal-black">
              <strong className="block text-sm font-bold text-brutal-black mb-2">
                学術的信頼性
              </strong>
              <span className="text-sm text-brutal-gray-700">
                {scaleInfo.tier} (引用論文数: {scaleInfo.citations})
              </span>
            </div>
          </div>
        </Card>

        {/* CTA Again (念押し) */}
        <Card padding="xl" className="text-center">
          <h2
            className="text-2xl md:text-3xl text-brutal-black mb-4"
            style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}
          >
            今すぐ診断してみましょう
          </h2>
          <p className="text-base md:text-lg text-brutal-gray-700 mb-6">
            科学的根拠に基づいた信頼性の高い診断です。
          </p>
          <Link
            href={basePath}
            className="inline-block bg-brutal-black text-brutal-white text-xl font-black px-12 py-5 border-[3px] border-brutal-black shadow-brutal hover:shadow-brutal-lg transition-all hover:-translate-y-1"
          >
            診断スタート
          </Link>
        </Card>

        {/* 免責事項 */}
        {ogImageConfig.disclaimer && (
          <Card padding="lg" className="bg-[#fff3cd] border-brutal-black">
            <p className="text-sm font-semibold leading-relaxed">{ogImageConfig.disclaimer}</p>
          </Card>
        )}
      </div>
    </main>
  );
}
