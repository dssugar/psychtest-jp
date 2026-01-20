'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

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
  const searchParams = useSearchParams();

  // OG画像URLを生成（友人のスコアを表示するため）
  const ogImageUrl = useMemo(() => {
    const params = new URLSearchParams();

    // サーバーから注入されたパラメータまたはURLパラメータを使用
    const injectedParams = typeof window !== 'undefined' && (window as any).__SHARE_PARAMS__;

    if (injectedParams) {
      Object.entries(injectedParams).forEach(([key, value]) => {
        params.set(key, String(value));
      });
    } else {
      // フォールバック：URLから直接取得
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.forEach((value, key) => {
          params.set(key, value);
        });
      }
    }

    const queryString = params.toString();
    return queryString ? `/og/${test}?${queryString}` : `/og/${test}`;
  }, [test]);

  return (
    <main className="min-h-screen bg-brutal-cream py-8 px-4">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* 友人のスコア画像表示（OG画像） */}
        <div className="w-full">
          <img
            src={ogImageUrl}
            alt={`${scaleInfo.nameJa}の診断結果`}
            className="w-full h-auto border-brutal-thick border-brutal-black shadow-brutal"
            style={{
              aspectRatio: '1200 / 630',
            }}
          />
        </div>

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
