"use client";

import type { UserProfile, TestType } from "@/lib/storage";
import { Card } from "@/components/ui/Card";
import { CorrelationGrid } from "@/components/viz/CorrelationGrid";
import { RadarChart } from "@/components/viz/RadarChart";
import {
  generateSelfAwarenessInsight,
  extractTopTraits,
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
    profile.tests.sccs && profile.tests.rosenberg;
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

      {/* 自己認識相関分析（SCCS + Rosenberg） */}
      {hasSelfAwareness && (
        <Card variant="white" padding="md" className="shadow-brutal-sm">
          <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">
            自己認識マップ
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* 相関グリッド */}
            <div className="flex justify-center">
              <CorrelationGrid
                xValue={profile.tests.sccs!.result.percentageScore}
                yValue={profile.tests.rosenberg!.result.percentageScore}
                xLabel="自己概念の明確さ (SCCS)"
                yLabel="自尊心 (Rosenberg)"
                color="blue"
              />
            </div>

            {/* インサイト */}
            <div className="space-y-4">
              <div className="bg-brutal-gray-50 border-brutal border-brutal-gray-300 p-5">
                <div className="font-semibold text-sm uppercase tracking-wide text-brutal-gray-600 mb-3">
                  📊 あなたの位置
                </div>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="font-semibold">自己概念の明確さ:</span>{" "}
                    {Math.round(profile.tests.sccs!.result.percentageScore)}%
                  </li>
                  <li>
                    <span className="font-semibold">自尊心:</span>{" "}
                    {Math.round(profile.tests.rosenberg!.result.percentageScore)}%
                  </li>
                </ul>
              </div>

              <div className="bg-brutal-blue-50 border-brutal border-viz-blue p-5">
                <div className="font-semibold text-sm uppercase tracking-wide text-brutal-gray-800 mb-3">
                  💡 インサイト
                </div>
                <p className="text-sm leading-relaxed">
                  {generateSelfAwarenessInsight(
                    profile.tests.sccs!.result.percentageScore,
                    profile.tests.rosenberg!.result.percentageScore
                  )}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 性格プロファイル（Big Five） */}
      {hasBigFive && (
        <Card variant="white" padding="md" className="shadow-brutal-sm">
          <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">
            性格特性プロファイル
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
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

            {/* トップ特性 */}
            <div className="space-y-4">
              <div className="bg-brutal-gray-50 border-brutal border-brutal-gray-300 p-5">
                <div className="font-semibold text-sm uppercase tracking-wide text-brutal-gray-600 mb-3">
                  🏆 トップ3特性
                </div>
                <ul className="space-y-2">
                  {extractTopTraits(profile.tests.bigfive!.result).map((trait, index) => (
                    <li key={trait.trait} className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-viz-green text-white font-bold border-brutal border-brutal-black">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{trait.traitJa}</div>
                        <div className="text-xs text-brutal-gray-600">
                          スコア: {trait.score}/20
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
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
          <div className="bg-brutal-pink-50 border-brutal border-viz-pink p-6">
            <p className="text-base leading-relaxed">
              {generateMultiTestSynthesis(profile, completedTests)}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
