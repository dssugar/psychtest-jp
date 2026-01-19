"use client";

import { DataBadge } from "@/components/viz/DataBadge";
import { BrutalProgressBar } from "@/components/viz/BrutalProgressBar";
import { mbtiTypeDescriptions, confidenceLevelDescriptions } from "@/lib/scoring/mbti-estimation";
import type { MBTIEstimation } from "@/lib/scoring/bigfive";

interface MBTIEstimationCardProps {
  estimation: MBTIEstimation;
}

export function MBTIEstimationCard({ estimation }: MBTIEstimationCardProps) {
  const typeInfo = mbtiTypeDescriptions[estimation.type] || {
    name: estimation.type,
    description: "16タイプ性格分類",
  };

  const confidenceInfo = confidenceLevelDescriptions[estimation.overallConfidence];

  // 軸ごとの信頼度を色分け
  const getConfidenceColor = (confidence: number): "green" | "yellow" | "orange" => {
    if (confidence > 0.6) return "green";
    if (confidence > 0.3) return "yellow";
    return "orange";
  };

  return (
    <div className="card-brutal p-8 bg-brutal-white">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl md:text-3xl font-display text-brutal-black">
            16タイプ性格推定 (MBTI形式)
          </h2>
          <DataBadge
            color={confidenceInfo.color as "green" | "yellow" | "orange"}
          >
            {confidenceInfo.label}
          </DataBadge>
        </div>
        <p className="text-sm text-brutal-gray-800">
          ビッグファイブ性格特性との学術的相関に基づく推定
        </p>
      </div>

      {/* Type Display */}
      <div className="card-brutal p-6 bg-viz-blue mb-6">
        <div className="text-center">
          <div className="text-5xl md:text-7xl font-display font-bold text-brutal-black mb-3">
            {estimation.type}
          </div>
          <div className="text-xl md:text-2xl font-bold text-brutal-black mb-2">
            {typeInfo.name}
          </div>
          <p className="text-brutal-gray-900">
            {typeInfo.description}
          </p>
        </div>
      </div>

      {/* Axes Breakdown */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-bold text-brutal-black">
          4軸の詳細
        </h3>

        {/* E/I */}
        <div className="border-l-4 border-brutal-black pl-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-bold">
                {estimation.axes.EI.preference === 'E' ? '外向型 (E)' : '内向型 (I)'}
              </span>
              <span className="text-sm text-brutal-gray-800 ml-2">
                ← Extraversion 相関: r = -0.74
              </span>
            </div>
            <DataBadge color={getConfidenceColor(estimation.axes.EI.confidence)} size="sm">
              信頼度 {(estimation.axes.EI.confidence * 100).toFixed(0)}%
            </DataBadge>
          </div>
          <BrutalProgressBar
            value={estimation.axes.EI.score}
            color="blue"
            label=""
            height="sm"
          />
          <div className="flex justify-between text-xs font-mono text-brutal-gray-800 mt-1">
            <span>I (内向型)</span>
            <span>E (外向型)</span>
          </div>
        </div>

        {/* S/N */}
        <div className="border-l-4 border-brutal-black pl-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-bold">
                {estimation.axes.SN.preference === 'S' ? '感覚型 (S)' : '直観型 (N)'}
              </span>
              <span className="text-sm text-brutal-gray-800 ml-2">
                ← Openness 相関: r = 0.72
              </span>
            </div>
            <DataBadge color={getConfidenceColor(estimation.axes.SN.confidence)} size="sm">
              信頼度 {(estimation.axes.SN.confidence * 100).toFixed(0)}%
            </DataBadge>
          </div>
          <BrutalProgressBar
            value={estimation.axes.SN.score}
            color="pink"
            label=""
            height="sm"
          />
          <div className="flex justify-between text-xs font-mono text-brutal-gray-800 mt-1">
            <span>S (感覚型)</span>
            <span>N (直観型)</span>
          </div>
        </div>

        {/* T/F */}
        <div className="border-l-4 border-brutal-black pl-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-bold">
                {estimation.axes.TF.preference === 'T' ? '思考型 (T)' : '感情型 (F)'}
              </span>
              <span className="text-sm text-brutal-gray-800 ml-2">
                ← Agreeableness 相関: r = 0.44
              </span>
            </div>
            <DataBadge color={getConfidenceColor(estimation.axes.TF.confidence)} size="sm">
              信頼度 {(estimation.axes.TF.confidence * 100).toFixed(0)}%
            </DataBadge>
          </div>
          <BrutalProgressBar
            value={estimation.axes.TF.score}
            color="green"
            label=""
            height="sm"
          />
          <div className="flex justify-between text-xs font-mono text-brutal-gray-800 mt-1">
            <span>T (思考型)</span>
            <span>F (感情型)</span>
          </div>
        </div>

        {/* J/P */}
        <div className="border-l-4 border-brutal-black pl-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-bold">
                {estimation.axes.JP.preference === 'J' ? '判断型 (J)' : '知覚型 (P)'}
              </span>
              <span className="text-sm text-brutal-gray-800 ml-2">
                ← Conscientiousness 相関: r = 0.49
              </span>
            </div>
            <DataBadge color={getConfidenceColor(estimation.axes.JP.confidence)} size="sm">
              信頼度 {(estimation.axes.JP.confidence * 100).toFixed(0)}%
            </DataBadge>
          </div>
          <BrutalProgressBar
            value={estimation.axes.JP.score}
            color="orange"
            label=""
            height="sm"
          />
          <div className="flex justify-between text-xs font-mono text-brutal-gray-800 mt-1">
            <span>P (知覚型)</span>
            <span>J (判断型)</span>
          </div>
        </div>
      </div>

      {/* Academic Reference */}
      <div className="card-brutal p-4 bg-brutal-gray-50 mb-4">
        <div className="text-xs font-mono text-brutal-gray-900">
          <div className="font-bold mb-1">学術的根拠:</div>
          {estimation.academicReference}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card-brutal p-4 bg-viz-yellow border-brutal-black">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <div className="font-bold text-brutal-black mb-1 uppercase tracking-wide text-xs">
              商標に関する注意
            </div>
            <div className="text-sm text-brutal-black">
              {estimation.disclaimer}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
