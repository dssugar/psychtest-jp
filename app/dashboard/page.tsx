"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProfile, getCompletedTests, type TestType } from "@/lib/storage";
import { DataBadge } from "@/components/viz/DataBadge";
import { StatCard } from "@/components/viz/StatCard";

// テスト情報の定義
const testInfo: Record<
  TestType,
  {
    name: string;
    nameJa: string;
    color: "blue" | "pink" | "green" | "orange" | "yellow" | "black";
    path: string;
    dimension: string;
    available: boolean;
  }
> = {
  sccs: {
    name: "SCCS",
    nameJa: "自己概念の明確さ",
    color: "blue",
    path: "/sccs",
    dimension: "自己認識",
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
    available: false,
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
    color: "blue",
    path: "/phq9",
    dimension: "メンタル状態",
    available: false,
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
        <div className="max-w-6xl mx-auto mb-12 text-center">
          <DataBadge color="green" size="lg">
            DASHBOARD
          </DataBadge>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-display text-brutal-black mt-6 mb-4 animate-slide-in-up">
            マイダッシュボード
          </h1>
          <p className="text-lg md:text-xl text-brutal-gray-800 font-mono animate-slide-in-up">
            診断結果の一覧
          </p>
        </div>

        {/* Completed Tests */}
        {completedTests.length > 0 ? (
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-display text-brutal-black mb-8">
              完了した診断
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedTests.map((testType) => {
                const info = testInfo[testType];
                const testResult = profile?.tests[testType];

                if (!testResult) return null;

                return (
                  <div
                    key={testType}
                    className="card-brutal p-6 md:p-8 bg-brutal-white"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <DataBadge color={info.color} size="md">
                        {info.name}
                      </DataBadge>
                      <div className="text-xs font-mono text-brutal-gray-800">
                        {new Date(testResult.completedAt).toLocaleDateString(
                          "ja-JP",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-display text-brutal-black mb-2">
                      {info.nameJa}
                    </h3>

                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-sm text-brutal-gray-800">
                        {info.dimension}
                      </span>
                      {testResult.retakeCount > 0 && (
                        <DataBadge color="black" size="sm">
                          再受験 {testResult.retakeCount}回
                        </DataBadge>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/results/${testType}`}
                        className="btn-brutal flex-1 bg-brutal-black text-brutal-white px-6 py-3 text-sm text-center min-h-[44px]"
                      >
                        結果を見る
                      </Link>
                      <Link
                        href={`${info.path}/test`}
                        className="btn-brutal flex-1 bg-brutal-white text-brutal-black px-6 py-3 text-sm text-center min-h-[44px]"
                      >
                        再受験する
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto mb-16">
            <div className="card-brutal p-8 md:p-12 bg-brutal-gray-50 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl md:text-3xl font-display text-brutal-black mb-4">
                まだ診断を受けていません
              </h2>
              <p className="text-brutal-gray-800 mb-6">
                下記から診断を始めてみましょう
              </p>
            </div>
          </div>
        )}

        {/* Available Tests */}
        {notCompletedTests.length > 0 && (
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-display text-brutal-black mb-8">
              {completedTests.length > 0
                ? "未受験の診断"
                : "利用可能な診断"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notCompletedTests.map(([testType, info]) => (
                <div
                  key={testType}
                  className="card-brutal p-6 md:p-8 bg-brutal-white"
                >
                  <DataBadge color={info.color} size="md">
                    {info.name}
                  </DataBadge>

                  <h3 className="text-xl md:text-2xl font-display text-brutal-black mt-4 mb-2">
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {completedTests.length > 0 && profile && (
          <div className="max-w-6xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-display text-brutal-black mb-8">
              統計情報
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                icon="✅"
                label="完了した診断"
                value={`${completedTests.length}`}
                description={`/ ${availableTests.length} 診断`}
                color="green"
              />
              <StatCard
                icon="📅"
                label="最初の診断日"
                value={new Date(profile.metadata.createdAt).toLocaleDateString(
                  "ja-JP",
                  { month: "short", day: "numeric" }
                )}
                description={new Date(profile.metadata.createdAt).getFullYear().toString()}
                color="blue"
              />
              <StatCard
                icon="🔄"
                label="最終更新"
                value={new Date(profile.metadata.updatedAt).toLocaleDateString(
                  "ja-JP",
                  { month: "short", day: "numeric" }
                )}
                description={new Date(profile.metadata.updatedAt).getFullYear().toString()}
                color="pink"
              />
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="max-w-6xl mx-auto text-center">
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
