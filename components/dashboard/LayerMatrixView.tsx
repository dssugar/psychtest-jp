"use client";

import type { UserProfile, TestType } from "@/lib/storage";
import { Card } from "@/components/ui/Card";
import { DataBadge } from "@/components/viz/DataBadge";
import { getTestConfig } from "@/lib/tests/test-registry";
import { extractTestScore, isScoreSupported } from "@/lib/utils/test-score";
import Link from "next/link";

interface LayerMatrixViewProps {
  profile: UserProfile;
  completedTests: TestType[];
}

type Layer = "trait" | "state" | "outcome" | "skill";

interface LayerData {
  layer: Layer;
  labelJa: string;
  labelEn: string;
  color: "green" | "blue" | "pink" | "orange";
  description: string;
  tests: {
    testType: TestType;
    name: string;
    nameJa: string;
    score: number;
    maxScore: number;
    percentage: number;
    color: "blue" | "pink" | "green" | "orange" | "yellow" | "black" | "cyan";
  }[];
}

export function LayerMatrixView({
  profile,
  completedTests,
}: LayerMatrixViewProps) {
  // 各テストを4層に分類
  const layerMap: Record<Layer, LayerData> = {
    trait: {
      layer: "trait",
      labelJa: "特性",
      labelEn: "TRAIT",
      color: "green",
      description: "比較的安定した個人差",
      tests: [],
    },
    state: {
      layer: "state",
      labelJa: "状態",
      labelEn: "STATE",
      color: "blue",
      description: "現在の心理状態（変化しうる）",
      tests: [],
    },
    outcome: {
      layer: "outcome",
      labelJa: "成果",
      labelEn: "OUTCOME",
      color: "pink",
      description: "特性と状態の結果",
      tests: [],
    },
    skill: {
      layer: "skill",
      labelJa: "スキル",
      labelEn: "SKILL",
      color: "orange",
      description: "育成可能な能力",
      tests: [],
    },
  };

  // テストをレイヤーごとに分類
  completedTests.forEach((testType) => {
    const testData = profile.tests[testType];
    if (!testData) return;

    // スコア抽出に対応したテストのみ処理
    if (!isScoreSupported(testType)) {
      return;
    }

    const config = getTestConfig(testType);
    const layer = config.scaleInfo.psychologicalLayer;

    // 共通関数でスコアを抽出
    const { score, maxScore, percentage } = extractTestScore(testType, testData, config);

    layerMap[layer].tests.push({
      testType,
      name: config.scaleInfo.abbreviation,
      nameJa: config.scaleInfo.nameJa,
      score,
      maxScore,
      percentage,
      color: config.color,
    });
  });

  // レイヤーごとの平均スコアを計算
  const layerAverages: Record<Layer, number | null> = {
    trait: null,
    state: null,
    outcome: null,
    skill: null,
  };

  Object.entries(layerMap).forEach(([layer, data]) => {
    if (data.tests.length > 0) {
      const avg =
        data.tests.reduce((sum, test) => sum + test.percentage, 0) /
        data.tests.length;
      layerAverages[layer as Layer] = avg;
    }
  });

  return (
    <Card variant="white" padding="lg">
      <div className="mb-6">
        <h3 className="text-2xl md:text-3xl font-display text-brutal-black mb-2">
          4層心理マトリクス
        </h3>
        <p className="text-sm text-brutal-gray-800">
          Trait-State-Outcome-Skillモデルに基づく分類表示
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(layerMap) as [Layer, LayerData][]).map(([layer, data]) => {
          const hasTests = data.tests.length > 0;
          const avgScore = layerAverages[layer];

          return (
            <Card
              key={layer}
              variant="white"
              padding="md"
              className={`border-l-brutal-thick border-l-viz-${data.color} ${
                hasTests ? "" : "opacity-50"
              }`}
            >
              {/* レイヤーヘッダー */}
              <div className="mb-4">
                <DataBadge color={data.color} size="md">
                  {data.labelEn}
                </DataBadge>
                <h4 className="text-xl font-display text-brutal-black mt-2 mb-1">
                  {data.labelJa}
                </h4>
                <p className="text-xs text-brutal-gray-800">{data.description}</p>
              </div>

              {/* 平均スコア */}
              {avgScore !== null && (
                <Card variant="white" padding="sm" className="mb-4 bg-brutal-gray-50">
                  <div className="text-xs font-bold uppercase tracking-wide text-brutal-gray-600 mb-1">
                    Average Score
                  </div>
                  <div className="text-2xl font-mono font-bold data-number">
                    {Math.round(avgScore)}%
                  </div>
                </Card>
              )}

              {/* テスト一覧 */}
              {hasTests ? (
                <div className="space-y-2">
                  {data.tests.map((test) => (
                    <Link
                      key={test.testType}
                      href={`/results/${test.testType}`}
                      className="block p-3 bg-brutal-white card-brutal transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wide">
                          {test.name}
                        </span>
                        <span className="text-xs font-mono font-bold">
                          {Math.round(test.percentage)}%
                        </span>
                      </div>
                      <div className="text-xs text-brutal-gray-800 truncate">
                        {test.nameJa}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-xs text-brutal-gray-600">未受験</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* 学術的説明 */}
      <Card variant="white" padding="sm" className="mt-6 bg-brutal-gray-50">
        <p className="text-xs text-brutal-gray-800 leading-relaxed">
          <strong>学術的根拠:</strong> このマトリクスは心理学のTrait-State-Outcomeモデル
          （Steyer et al., 1999）に基づいています。
          TraitとStateが相互作用してOutcomeを生み、Skillは訓練可能な領域です。
        </p>
      </Card>
    </Card>
  );
}
