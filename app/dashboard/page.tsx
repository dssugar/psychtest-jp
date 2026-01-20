"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfile, getCompletedTests, type TestType } from "@/lib/storage";
import { DataBadge } from "@/components/viz/DataBadge";
import { StatCard } from "@/components/viz/StatCard";
import { Card } from "@/components/ui/Card";
import { ProfileOverview } from "@/components/dashboard/ProfileOverview";
import { IntegratedAnalysis } from "@/components/dashboard/IntegratedAnalysis";
import { ResultSummaryCard } from "@/components/results/ResultSummaryCard";
import { SocialShareButtons } from "@/components/share/SocialShareButtons";
import { OG_COLORS, DIMENSION_NAMES, DIMENSION_ORDER } from "@/lib/og-design/constants";
import type { DimensionData } from "@/lib/og-design/types";
import { testRegistry } from "@/lib/tests/test-registry";

// テスト情報の定義
const testInfo: Record<
  TestType,
  {
    name: string;
    nameJa: string;
    color: "blue" | "pink" | "green" | "orange" | "yellow" | "black" | "cyan";
    path: string;
    dimension: string;
    available: boolean;
  }
> = {
  selfconcept: {
    name: "SCC",
    nameJa: "自己概念の明確さ",
    color: "blue",
    path: "/selfconcept",
    dimension: "状態",
    available: true,
  },
  rosenberg: {
    name: "RSES",
    nameJa: "ローゼンバーグ自尊心",
    color: "pink",
    path: "/rosenberg",
    dimension: "自己認識",
    available: true,
  },
  bigfive: {
    name: "Big Five",
    nameJa: "ビッグファイブ性格特性",
    color: "green",
    path: "/bigfive",
    dimension: "性格特性",
    available: true,
  },
  ecrr: {
    name: "ECR-R",
    nameJa: "愛着スタイル",
    color: "orange",
    path: "/ecrr",
    dimension: "対人スタイル",
    available: false,
  },
  phq9: {
    name: "PHQ-9",
    nameJa: "うつ病スクリーニング",
    color: "orange",
    path: "/phq9",
    dimension: "メンタル状態",
    available: true,
  },
  gad7: {
    name: "GAD-7",
    nameJa: "不安症スクリーニング",
    color: "yellow",
    path: "/gad7",
    dimension: "メンタル状態",
    available: false,
  },
  pss: {
    name: "PSS",
    nameJa: "知覚されたストレス",
    color: "blue",
    path: "/pss",
    dimension: "メンタル状態",
    available: false,
  },
  swls: {
    name: "SWLS",
    nameJa: "人生満足度",
    color: "blue",
    path: "/swls",
    dimension: "ウェルビーイング",
    available: true,
  },
  k6: {
    name: "K6",
    nameJa: "心理的苦痛スクリーニング",
    color: "cyan",
    path: "/k6",
    dimension: "メンタル状態",
    available: true,
  },
  industriousness: {
    name: "IND",
    nameJa: "勤勉性",
    color: "green",
    path: "/industriousness",
    dimension: "性格特性",
    available: true,
  },
};

export default function DashboardPage() {
  const [completedTests, setCompletedTests] = useState<TestType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const completed = getCompletedTests();
    setCompletedTests(completed);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-brutal-gray-800 font-mono">Loading...</div>
      </main>
    );
  }

  const profile = getProfile();
  const availableTests = Object.entries(testInfo).filter(
    ([_, info]) => info.available
  );
  const notCompletedTests = availableTests.filter(
    ([testType]) => !completedTests.includes(testType as TestType)
  );

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="max-w-[1200px] mx-auto mb-12 text-center">
          <DataBadge color="green" size="lg">
            DASHBOARD
          </DataBadge>
          <h1 className="text-4xl md:text-5xl lg:text-7xl text-brutal-black mt-6 mb-4 animate-slide-in-up" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 900 }}>
            マイダッシュボード
          </h1>
          <p className="text-lg md:text-xl text-brutal-gray-800 font-mono animate-slide-in-up">
            診断結果の一覧と統合分析
          </p>
        </div>

        {/* Profile Overview */}
        {completedTests.length > 0 && profile && (
          <div className="max-w-[1200px] mx-auto mb-16">
            <ProfileOverview
              completedCount={completedTests.length}
              totalAvailable={availableTests.length}
              completedTests={completedTests}
              profile={profile}
            />
          </div>
        )}

        {/* Completed Tests - ResultSummaryCard Style */}
        {completedTests.length > 0 ? (
          <div className="max-w-[1200px] mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl text-brutal-black mb-8" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
              完了した診断
            </h2>

            <div className="space-y-8">
              {completedTests.map((testType) => {
                const info = testInfo[testType];
                const testResult = profile?.tests[testType];
                if (!info || !testResult || !('result' in testResult)) return null;

                const config = testRegistry[testType as keyof typeof testRegistry];
                if (!config) return null;
                const ogImage = config.ogImage;

                // Color mapping
                const colorMap: Record<string, string> = {
                  pink: '#ec4899', orange: '#f97316', cyan: '#06b6d4',
                  yellow: '#eab308', purple: '#a855f7', green: '#10b981', blue: '#3b82f6',
                };

                // 次元データの生成（テストタイプ別）
                let dimensions: DimensionData[] = [];

                if (testType === 'bigfive') {
                  // Big Five: 5次元
                  const result = testResult.result as any;
                  dimensions = DIMENSION_ORDER.map((key) => ({
                    key,
                    label: DIMENSION_NAMES[key],
                    score: result[key],
                    percentage: ((result[key] - 24) / 96) * 100,
                    color: OG_COLORS.dimensions[key],
                  }));
                } else if (testType === 'industriousness') {
                  // Industriousness: 2次元
                  const result = testResult.result as any;
                  const c4 = result?.c4_achievement ?? 30;
                  const c5 = result?.c5_discipline ?? 30;
                  dimensions = [
                    {
                      key: 'c4',
                      label: '達成動機 (C4)',
                      score: c4,
                      percentage: ((c4 - 10) / 40) * 100,
                      color: '#3b82f6',
                    },
                    {
                      key: 'c5',
                      label: '自己統制 (C5)',
                      score: c5,
                      percentage: ((c5 - 10) / 40) * 100,
                      color: '#10b981',
                    },
                  ];
                } else if (ogImage) {
                  // 単一スコアテスト
                  const result = testResult.result as any;
                  const min = ogImage.scoreDisplay?.min || 0;
                  const max = ogImage.scoreDisplay?.max || 100;
                  const rawScore = result?.rawScore ?? min;
                  const percentage = result?.percentageScore ?? ((rawScore - min) / (max - min)) * 100;

                  dimensions = [{
                    key: 'score',
                    label: 'Total Score',
                    score: rawScore,
                    percentage: percentage,
                    color: colorMap[info.color] || '#3b82f6',
                  }];
                }

                // ogImageとdimensionsがあればResultSummaryCard表示
                if (ogImage && dimensions.length > 0) {
                  const params = ogImage.scoreToParams?.(testResult.result) || {};
                  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/og/${testType}?${new URLSearchParams(params).toString()}`;

                  return (
                    <div key={testType} className="space-y-4">
                      <ResultSummaryCard
                        dimensions={dimensions}
                        titleEn={ogImage.titleEn}
                        category={ogImage.category}
                        description={ogImage.description}
                      />
                      <div className="max-w-[1200px] mx-auto space-y-4">
                        {/* アクションボタン */}
                        <div className="flex gap-3">
                          <Link
                            href={`/results/${testType}`}
                            className="btn-brutal flex-1 bg-brutal-black text-brutal-white px-6 py-3 text-sm text-center"
                          >
                            詳細な結果を見る
                          </Link>
                          <Link
                            href={`/test/${testType}`}
                            className="btn-brutal flex-1 bg-brutal-white text-brutal-black px-6 py-3 text-sm text-center"
                          >
                            再受験する
                          </Link>
                        </div>
                        {/* シェアボタン */}
                        <Card variant="white" padding="sm">
                          <div className="text-xs font-semibold uppercase tracking-wide text-brutal-gray-600 mb-2">
                            結果をシェア
                          </div>
                          <SocialShareButtons shareUrl={shareUrl} text={`${info.nameJa}の結果`} />
                        </Card>
                      </div>
                    </div>
                  );
                }

                // フォールバック: ogImageがないテスト用汎用Card
                const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/results/${testType}`;
                return (
                  <div key={testType}>
                    <Card variant="white" padding="md">
                      <div className="flex items-start justify-between mb-4">
                        <DataBadge color={info.color} size="md">{info.name}</DataBadge>
                        <div className="text-xs font-mono text-brutal-gray-800">
                          {new Date(testResult.completedAt).toLocaleDateString("ja-JP", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </div>
                      </div>
                      <h3 className="text-xl md:text-2xl text-brutal-black mb-2" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                        {info.nameJa}
                      </h3>
                      <div className="flex gap-3">
                        <Link href={`/results/${testType}`} className="btn-brutal flex-1 bg-brutal-black text-brutal-white px-6 py-3 text-sm text-center">
                          結果を見る
                        </Link>
                        <Link href={`/test/${testType}`} className="btn-brutal flex-1 bg-brutal-white text-brutal-black px-6 py-3 text-sm text-center">
                          再受験する
                        </Link>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-[1200px] mx-auto mb-16">
            <Card variant="white" padding="lg" className="bg-brutal-gray-50 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl md:text-3xl text-brutal-black mb-4" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                まだ診断を受けていません
              </h2>
              <p className="text-brutal-gray-800 mb-6">
                下記から診断を始めてみましょう
              </p>
            </Card>
          </div>
        )}

        {/* Integrated Analysis */}
        {completedTests.length >= 2 && profile && (
          <div className="max-w-[1200px] mx-auto mb-16">
            <IntegratedAnalysis profile={profile} completedTests={completedTests} />
          </div>
        )}

        {/* Available Tests */}
        {notCompletedTests.length > 0 && (
          <div className="max-w-[1200px] mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl text-brutal-black mb-8" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
              {completedTests.length > 0
                ? "未受験の診断"
                : "利用可能な診断"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notCompletedTests.map(([testType, info]) => (
                <Card
                  key={testType}
                  variant="white" padding="md"
                >
                  <DataBadge color={info.color} size="md">
                    {info.name}
                  </DataBadge>

                  <h3 className="text-xl md:text-2xl text-brutal-black mt-4 mb-2" style={{ fontFamily: 'var(--font-display-ja)', fontWeight: 700 }}>
                    {info.nameJa}
                  </h3>

                  <div className="text-sm text-brutal-gray-800 mb-6">
                    {info.dimension}
                  </div>

                  <Link
                    href={info.path}
                    className="btn-brutal block bg-brutal-black text-brutal-white px-6 py-3 text-sm text-center min-h-[44px]"
                  >
                    診断を始める
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stats - ProfileOverviewに統合したため削除 */}

        {/* Back to Home */}
        <div className="max-w-[1200px] mx-auto text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-brutal-gray-800 hover:text-brutal-black font-semibold uppercase tracking-wide text-sm min-h-[44px]"
          >
            <span>←</span>
            <span>トップページに戻る</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
