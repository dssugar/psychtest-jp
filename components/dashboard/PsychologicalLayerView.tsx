"use client";

import type { UserProfile, TestType } from "@/lib/storage";
import { Card } from "@/components/ui/Card";
import { DataBadge } from "@/components/viz/DataBadge";
import { getTestConfig } from "@/lib/tests/test-registry";
import { extractTestScore, isScoreSupported } from "@/lib/utils/test-score";
import Link from "next/link";

interface PsychologicalLayerViewProps {
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
  academicBasis: string;
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

export function PsychologicalLayerView({
  profile,
  completedTests,
}: PsychologicalLayerViewProps) {
  // 各テストを4層に分類
  const layerMap: Record<Layer, LayerData> = {
    trait: {
      layer: "trait",
      labelJa: "特性",
      labelEn: "TRAIT",
      color: "green",
      description: "安定した個人差（遺伝性・一貫性が高い）",
      academicBasis: "LST理論のTrait成分 + McAdams Layer I",
      tests: [],
    },
    skill: {
      layer: "skill",
      labelJa: "スキル",
      labelEn: "SKILL",
      color: "orange",
      description: "訓練可能な心理的能力",
      academicBasis: "McAdams Layer II - Characteristic Adaptations",
      tests: [],
    },
    state: {
      layer: "state",
      labelJa: "状態",
      labelEn: "STATE",
      color: "blue",
      description: "一時的な心理的機能の発現",
      academicBasis: "LST理論のState成分（状況特殊性）",
      tests: [],
    },
    outcome: {
      layer: "outcome",
      labelJa: "成果・症状",
      labelEn: "OUTCOME",
      color: "pink",
      description: "相互作用の結果としての臨床的重症度",
      academicBasis: "Patient-Reported Outcomes（治療効果判定）",
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

  // フローに含めるレイヤー（データがあるものだけ）
  const flowLayers: LayerData[] = [
    layerMap.trait,
    layerMap.skill,
    layerMap.state,
    layerMap.outcome,
  ].filter((data) => data.tests.length > 0);

  if (flowLayers.length === 0) {
    return null;
  }

  return (
    <Card variant="white" padding="lg">
      <div className="mb-6">
        <h3 className="text-2xl md:text-3xl font-display text-brutal-black mb-2">
          心理測定の4層構造
        </h3>
        <p className="text-sm text-brutal-gray-800">
          Trait-Skill-State-Outcomeモデルによる統合的理解
        </p>
      </div>

      {/* 4層グリッド + 因果関係フロー */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-start justify-center gap-3 min-w-max px-4">
          {flowLayers.map((data, index) => (
            <div key={data.layer} className="flex items-center">
              {/* レイヤーカード */}
              <div className="flex flex-col items-center w-[200px] md:w-[220px]">
                <Card
                  variant="white"
                  padding="md"
                  className={`border-l-brutal-thick border-l-viz-${data.color} w-full`}
                >
                  {/* レイヤーヘッダー */}
                  <div className="mb-4">
                    <DataBadge color={data.color} size="md">
                      {data.labelEn}
                    </DataBadge>
                    <h4 className="text-lg font-display text-brutal-black mt-2 mb-1">
                      {data.labelJa}
                    </h4>
                    <p className="text-xs text-brutal-gray-700 leading-tight">
                      {data.description}
                    </p>
                  </div>

                  {/* テスト一覧 */}
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

                  {/* 学術的根拠 */}
                  <div className="mt-3 pt-3 border-t-2 border-brutal-gray-200">
                    <p className="text-xs text-brutal-gray-600 leading-tight">
                      <strong>理論:</strong> {data.academicBasis}
                    </p>
                  </div>
                </Card>
              </div>

              {/* 因果関係の矢印 */}
              {index < flowLayers.length - 1 && (
                <div className="flex flex-col items-center mx-1 mb-16">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    className="text-brutal-black"
                  >
                    <path
                      d="M 4 16 L 24 16 L 20 12 M 24 16 L 20 20"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="square"
                    />
                  </svg>
                  <div className="text-xs text-brutal-gray-600 font-semibold mt-1">
                    影響
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 学術的説明 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="white" padding="sm" className="bg-brutal-gray-50">
          <h4 className="font-bold text-sm uppercase tracking-wide text-brutal-gray-800 mb-2">
            💡 因果関係の解釈
          </h4>
          <ul className="text-xs text-brutal-gray-800 space-y-2 leading-relaxed">
            <li>
              <strong>TRAIT → SKILL:</strong> 性格特性が、スキル習得の容易さに影響
            </li>
            <li>
              <strong>SKILL → STATE:</strong> 心理的スキルが、ストレス状態を緩和
            </li>
            <li>
              <strong>STATE → OUTCOME:</strong> 一時的な状態が、臨床症状の重症度として測定される
            </li>
          </ul>
        </Card>

        <Card variant="white" padding="sm" className="bg-brutal-blue-50 border-brutal border-viz-blue">
          <h4 className="font-bold text-sm uppercase tracking-wide text-brutal-gray-800 mb-2">
            📚 学術的根拠
          </h4>
          <p className="text-xs text-brutal-gray-800 leading-relaxed">
            この4層構造は、<strong>Latent State-Trait (LST) 理論</strong>（Steyer et al., 1999）と
            <strong>McAdamsの3層モデル</strong>を統合したものです。
            TRAITとSTATEは心理測定の数学的分解、SKILLは訓練可能な適応、
            OUTCOMEは特性・スキル・状態の相互作用の結果として生じる臨床症状や生活機能を表します（治療効果判定の指標）。
          </p>
        </Card>
      </div>
    </Card>
  );
}
