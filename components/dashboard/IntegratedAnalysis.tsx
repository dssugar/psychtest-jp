"use client";

import type { UserProfile, TestType } from "@/lib/storage";
import { Card } from "@/components/ui/Card";
import { CorrelationGrid } from "@/components/viz/CorrelationGrid";
import { RadarChart } from "@/components/viz/RadarChart";
import { PsychologicalLayerView } from "./PsychologicalLayerView";
import {
  generateSelfAwarenessInsight,
  extractTopFacets,
  generateMultiTestSynthesis,
  bigFiveToPercentage,
} from "@/lib/analysis/synthesis";
import { dimensionNames } from "@/lib/scoring/bigfive";

interface IntegratedAnalysisProps {
  profile: UserProfile;
  completedTests: TestType[];
}

export function IntegratedAnalysis({
  profile,
  completedTests,
}: IntegratedAnalysisProps) {
  // 2テスト未満の場合は表示しない
  if (completedTests.length < 2) {
    return null;
  }

  const hasSelfAwareness =
    profile.tests.selfconcept && profile.tests.rosenberg;
  const hasBigFive = profile.tests.bigfive;

  return (
    <div className="space-y-8">
      {/* セクションヘッダー */}
      <Card variant="white" padding="md" className="shadow-brutal-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-8 bg-viz-blue" />
          <h2 className="text-2xl font-bold uppercase tracking-tight">
            統合分析
          </h2>
        </div>
        <p className="text-brutal-gray-700 text-sm">
          複数のテスト結果を統合し、あなたの心理プロファイルを多角的に分析します。
        </p>
      </Card>

      {/* 心理測定の4層構造（統合ビュー） */}
      <PsychologicalLayerView profile={profile} completedTests={completedTests} />

      {/* 自己認識相関分析（SCCS + Rosenberg） */}
      {hasSelfAwareness && (
        <Card variant="white" padding="sm" className="shadow-brutal-sm">
          <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">
            自己認識マップ
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* 相関グリッド */}
            <div className="flex justify-center">
              <CorrelationGrid
                xValue={profile.tests.selfconcept!.result.percentageScore}
                yValue={profile.tests.rosenberg!.result.percentageScore}
                xLabel="自己概念の明確さ (SCC)"
                yLabel="自尊心 (Rosenberg)"
                color="blue"
              />
            </div>

            {/* インサイト */}
            <div className="space-y-4">
              <Card variant="white" padding="sm" className="bg-brutal-gray-50 border-brutal-gray-300">
                <div className="font-semibold text-sm uppercase tracking-wide text-brutal-gray-600 mb-3">
                  📊 あなたの位置
                </div>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="font-semibold">自己概念の明確さ:</span>{" "}
                    {Math.round(profile.tests.selfconcept!.result.percentageScore)}%
                  </li>
                  <li>
                    <span className="font-semibold">自尊心:</span>{" "}
                    {Math.round(profile.tests.rosenberg!.result.percentageScore)}%
                  </li>
                </ul>
              </Card>

              <Card variant="white" padding="sm" className="bg-brutal-blue-50 border-viz-blue">
                <div className="font-semibold text-sm uppercase tracking-wide text-brutal-gray-800 mb-3">
                  💡 インサイト
                </div>
                <p className="text-sm leading-relaxed">
                  {generateSelfAwarenessInsight(
                    profile.tests.selfconcept!.result.percentageScore,
                    profile.tests.rosenberg!.result.percentageScore
                  )}
                </p>
              </Card>
            </div>
          </div>
        </Card>
      )}

      {/* 性格プロファイル（Big Five） */}
      {hasBigFive && (
        <Card variant="white" padding="sm" className="shadow-brutal-sm">
          <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">
            性格特性プロファイル
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* レーダーチャート */}
            <div className="flex justify-center">
              <RadarChart
                dimensions={[
                  {
                    label: dimensionNames.extraversion,
                    value: bigFiveToPercentage(profile.tests.bigfive!.result.extraversion),
                    color: "green",
                  },
                  {
                    label: dimensionNames.agreeableness,
                    value: bigFiveToPercentage(profile.tests.bigfive!.result.agreeableness),
                    color: "green",
                  },
                  {
                    label: dimensionNames.conscientiousness,
                    value: bigFiveToPercentage(profile.tests.bigfive!.result.conscientiousness),
                    color: "green",
                  },
                  {
                    label: dimensionNames.neuroticism,
                    value: bigFiveToPercentage(profile.tests.bigfive!.result.neuroticism),
                    color: "green",
                  },
                  {
                    label: dimensionNames.openness,
                    value: bigFiveToPercentage(profile.tests.bigfive!.result.openness),
                    color: "green",
                  },
                ]}
                size="lg"
              />
            </div>

            {/* トップファセット */}
            <div className="space-y-4">
              {profile.tests.bigfive!.result.facets && (
                <Card variant="white" padding="sm" className="bg-brutal-gray-50 border-brutal-gray-300">
                  <div className="font-semibold text-sm uppercase tracking-wide text-brutal-gray-600 mb-3">
                    🏆 トップ5ファセット
                  </div>
                  <ul className="space-y-2">
                    {extractTopFacets(profile.tests.bigfive!.result.facets).map((facet, index) => (
                      <li key={facet.facet} className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-viz-green text-white font-bold border-brutal border-brutal-black shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">{facet.facetJa}</div>
                          <div className="text-xs text-brutal-gray-600">
                            {Math.round(facet.percentageScore)}%
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 統合インサイト（3テスト以上） */}
      {completedTests.length >= 3 && (
        <Card variant="white" padding="md" className="shadow-brutal-sm">
          <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">
            統合インサイト
          </h3>
          <Card variant="white" padding="md" className="bg-brutal-pink-50 border-viz-pink">
            <p className="text-base leading-relaxed">
              {generateMultiTestSynthesis(profile, completedTests)}
            </p>
          </Card>
        </Card>
      )}
    </div>
  );
}
