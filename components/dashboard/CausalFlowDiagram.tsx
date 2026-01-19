"use client";

import type { UserProfile, TestType } from "@/lib/storage";
import { Card } from "@/components/ui/Card";
import { DataBadge } from "@/components/viz/DataBadge";
import { getTestConfig } from "@/lib/tests/test-registry";
import { extractTestScore, isScoreSupported } from "@/lib/utils/test-score";

interface CausalFlowDiagramProps {
  profile: UserProfile;
  completedTests: TestType[];
}

type Layer = "trait" | "state" | "outcome" | "skill";

interface LayerNode {
  layer: Layer;
  labelJa: string;
  color: "green" | "blue" | "pink" | "orange";
  tests: {
    name: string;
    percentage: number;
  }[];
  avgScore: number | null;
}

export function CausalFlowDiagram({
  profile,
  completedTests,
}: CausalFlowDiagramProps) {
  // 各レイヤーのデータを集計
  const layerNodes: Record<Layer, LayerNode> = {
    trait: {
      layer: "trait",
      labelJa: "特性 (TRAIT)",
      color: "green",
      tests: [],
      avgScore: null,
    },
    state: {
      layer: "state",
      labelJa: "状態 (STATE)",
      color: "blue",
      tests: [],
      avgScore: null,
    },
    outcome: {
      layer: "outcome",
      labelJa: "成果 (OUTCOME)",
      color: "pink",
      tests: [],
      avgScore: null,
    },
    skill: {
      layer: "skill",
      labelJa: "スキル (SKILL)",
      color: "orange",
      tests: [],
      avgScore: null,
    },
  };

  // テストをレイヤーごとに分類してスコアを集計
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
    const { percentage } = extractTestScore(testType, testData, config);

    layerNodes[layer].tests.push({
      name: config.scaleInfo.abbreviation,
      percentage,
    });
  });

  // 各レイヤーの平均スコアを計算
  Object.values(layerNodes).forEach((node) => {
    if (node.tests.length > 0) {
      node.avgScore =
        node.tests.reduce((sum, test) => sum + test.percentage, 0) /
        node.tests.length;
    }
  });

  // フローに含めるレイヤー（データがあるものだけ）
  const flowLayers: LayerNode[] = [
    layerNodes.trait,
    layerNodes.state,
    layerNodes.outcome,
    layerNodes.skill,
  ].filter((node) => node.avgScore !== null);

  if (flowLayers.length === 0) {
    return null;
  }

  return (
    <Card variant="white" padding="lg">
      <div className="mb-6">
        <h3 className="text-2xl md:text-3xl font-display text-brutal-black mb-2">
          因果関係フロー
        </h3>
        <p className="text-sm text-brutal-gray-800">
          Trait → State → Outcome → Skill の心理的因果関係
        </p>
      </div>

      {/* フロー図 */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-center justify-center gap-4 min-w-max px-4">
          {flowLayers.map((node, index) => (
            <div key={node.layer} className="flex items-center">
              {/* ノード */}
              <div className="flex flex-col items-center">
                <Card
                  variant="white"
                  padding="md"
                  className={`border-brutal-thick border-viz-${node.color} min-w-[180px]`}
                >
                  <div className="mb-3">
                    <DataBadge color={node.color} size="sm">
                      {node.labelJa.split(" ")[1].replace(/[()]/g, "")}
                    </DataBadge>
                  </div>

                  <div className="text-center mb-3">
                    <div className="text-3xl font-mono font-bold data-number">
                      {Math.round(node.avgScore!)}%
                    </div>
                    <div className="text-xs text-brutal-gray-600 mt-1">
                      平均スコア
                    </div>
                  </div>

                  <div className="space-y-1">
                    {node.tests.map((test) => (
                      <Card
                        key={test.name}
                        variant="white"
                        padding="sm"
                        className="text-xs bg-brutal-gray-50"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{test.name}</span>
                          <span className="font-mono">
                            {Math.round(test.percentage)}%
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </div>

              {/* 矢印 */}
              {index < flowLayers.length - 1 && (
                <div className="flex flex-col items-center mx-2">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    className="text-brutal-black"
                  >
                    <path
                      d="M 5 20 L 30 20 L 25 15 M 30 20 L 25 25"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="square"
                    />
                  </svg>
                  <div className="text-xs text-brutal-gray-600 font-mono mt-1">
                    影響
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 説明 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="white" padding="sm" className="bg-brutal-gray-50">
          <h4 className="font-bold text-sm uppercase tracking-wide text-brutal-gray-800 mb-2">
            💡 因果関係の解釈
          </h4>
          <ul className="text-xs text-brutal-gray-800 space-y-2">
            <li>
              <strong>TRAIT → STATE:</strong> あなたの性格特性が、現在の心理状態に影響を与えます
            </li>
            <li>
              <strong>STATE → OUTCOME:</strong> 心理状態が、自尊心などの成果に反映されます
            </li>
            <li>
              <strong>OUTCOME → SKILL:</strong> 現在の状態が、スキル育成の土台となります
            </li>
          </ul>
        </Card>

        <Card variant="white" padding="sm" className="bg-brutal-blue-50 border-brutal border-viz-blue">
          <h4 className="font-bold text-sm uppercase tracking-wide text-brutal-gray-800 mb-2">
            📊 モデルの意義
          </h4>
          <p className="text-xs text-brutal-gray-800 leading-relaxed">
            このフローは、心理学の<strong>Trait-State-Outcomeモデル</strong>
            に基づいています。各層は独立していますが、左から右へ影響を及ぼします。
            STATEとSKILLは変化させやすく、介入の対象となります。
          </p>
        </Card>
      </div>
    </Card>
  );
}
