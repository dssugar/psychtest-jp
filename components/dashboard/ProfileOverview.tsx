"use client";

import { ScoreCircle } from "@/components/viz/ScoreCircle";
import { Card } from "@/components/ui/Card";
import type { UserProfile, TestType } from "@/lib/storage";
import { calculateProfileCompleteness } from "@/lib/analysis/synthesis";

interface ProfileOverviewProps {
  completedCount: number;
  totalAvailable: number;
  completedTests: TestType[];
  profile: UserProfile;
}

export function ProfileOverview({
  completedCount,
  totalAvailable,
  completedTests,
  profile,
}: ProfileOverviewProps) {
  const completionPercentage = (completedCount / totalAvailable) * 100;

  // カラーマッピング（Tailwind purge対策）
  const colorClassMap = {
    blue: "text-viz-blue",
    green: "text-viz-green",
    orange: "text-viz-orange",
    pink: "text-viz-pink",
  };

  // 統計データ
  const stats = [
    {
      label: "完了テスト",
      value: `${completedCount} / ${totalAvailable}`,
      color: "blue" as const,
    },
    {
      label: "次元カバー率",
      value: `${Math.round(completionPercentage)}%`,
      color: "green" as const,
    },
    {
      label: "最終更新",
      value: new Date(profile.metadata.updatedAt).toLocaleDateString("ja-JP"),
      color: "orange" as const,
    },
  ];

  return (
    <Card variant="white" padding="lg" className="shadow-brutal-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-center">
        {/* 完了率サークル */}
        <div className="flex justify-center">
          <ScoreCircle
            score={completionPercentage}
            size="md"
            color="blue"
            label="完了率"
          />
        </div>

        {/* 統計グリッド */}
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="text-center animate-fadeIn"
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
          >
            <div className="text-sm font-semibold uppercase tracking-wide text-brutal-gray-600 mb-2">
              {stat.label}
            </div>
            <div className={`text-3xl font-bold font-mono data-number ${colorClassMap[stat.color]}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
