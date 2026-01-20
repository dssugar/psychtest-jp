/**
 * シェアページ（SNS経由の閲覧者向けランディングページ）
 * サーバーコンポーネント: 静的生成 + クライアントコンポーネントに委譲
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { testRegistry } from '@/lib/tests/test-registry';
import { SharePageClient } from './SharePageClient';

interface SharePageProps {
  params: Promise<{ test: string }>;
}

/**
 * 静的エクスポート用のパス生成
 */
export function generateStaticParams() {
  return Object.keys(testRegistry).map((test) => ({
    test,
  }));
}

export default async function SharePage({ params }: SharePageProps) {
  const { test } = await params;

  // テスト設定取得
  if (!(test in testRegistry)) {
    notFound();
  }

  const testConfig = testRegistry[test as keyof typeof testRegistry];

  // OG画像設定がない場合
  if (!testConfig.ogImage) {
    notFound();
  }

  const { titleEn, category, description, disclaimer, layoutType, colors, dimensionLabels, scoreDisplay, paramsToScore } = testConfig.ogImage;

  // シリアライズ可能なデータのみ抽出
  const ogImageConfig = {
    layoutType,
    titleEn,
    category,
    description,
    disclaimer,
    colors,
    dimensionLabels,
    scoreDisplay,
  };

  const scaleInfo = {
    nameJa: testConfig.scaleInfo.nameJa,
    description: testConfig.scaleInfo.description,
    developer: testConfig.scaleInfo.developer,
    reliability: testConfig.scaleInfo.reliability,
    tier: testConfig.scaleInfo.tier,
    citations: testConfig.scaleInfo.citations,
    stats: testConfig.scaleInfo.stats,
  };

  // クライアントコンポーネントに委譲（useSearchParams使用）
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-brutal-cream py-8 px-4 flex items-center justify-center">
          <div className="text-brutal-gray-800 font-mono">Loading...</div>
        </main>
      }
    >
      <SharePageClient
        test={test}
        basePath={testConfig.basePath}
        ogImageConfig={ogImageConfig}
        scaleInfo={scaleInfo}
      />
    </Suspense>
  );
}

/**
 * OG metaタグ生成
 * 注: クエリパラメータはビルド時に不明なため、デフォルト値を使用
 */
export async function generateMetadata({ params }: SharePageProps) {
  const { test } = await params;

  if (!(test in testRegistry)) {
    return {};
  }

  const testConfig = testRegistry[test as keyof typeof testRegistry];
  if (!testConfig.ogImage) {
    return {};
  }

  // デフォルトのOG画像URL（パラメータなし）
  const ogImageUrl = `/og/${test}`;

  return {
    title: `${testConfig.scaleInfo.nameJa}結果 | 心理測定ラボ`,
    description: testConfig.scaleInfo.description,
    openGraph: {
      title: `${testConfig.scaleInfo.nameJa}結果`,
      description: testConfig.scaleInfo.description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${testConfig.scaleInfo.nameJa}結果`,
      description: testConfig.scaleInfo.description,
      images: [ogImageUrl],
    },
  };
}
