"use client";

import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

interface DimensionData {
  label: string;
  value: number; // 0-100 percentage
  color: "blue" | "pink" | "green" | "orange";
}

interface RadarChartProps {
  dimensions: DimensionData[];
  size?: "sm" | "md" | "lg";
}

export function RadarChart({ dimensions, size = "md" }: RadarChartProps) {
  const sizeConfig = {
    sm: { diameter: 200, fontSize: 10 },
    md: { diameter: 280, fontSize: 11 },
    lg: { diameter: 320, fontSize: 12 },
  };

  const colorMap = {
    blue: "#0066ff",
    pink: "#ff3366",
    green: "#00cc88",
    orange: "#ff9900",
  };

  const config = sizeConfig[size];

  // Recharts用にデータ変換
  // 全次元のcolorが同じと仮定（Big Fiveは1つのチャート）
  const chartColor = dimensions[0]?.color || "blue";

  const data = dimensions.map((dim) => ({
    dimension: dim.label,
    value: dim.value,
    fullMark: 100,
  }));

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: config.diameter, height: config.diameter }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data}>
          {/* グリッド線（50%, 100%円） */}
          <PolarGrid stroke="#d4d4d4" strokeWidth={2} />

          {/* 軸ラベル（次元名） */}
          <PolarAngleAxis
            dataKey="dimension"
            tick={{
              fill: "#171717",
              fontFamily: "Inter, sans-serif",
              fontSize: config.fontSize,
              fontWeight: 600,
            }}
            stroke="#000000"
            strokeWidth={3}
          />

          {/* データポリゴン */}
          <Radar
            dataKey="value"
            stroke={colorMap[chartColor]}
            strokeWidth={4}
            fill={colorMap[chartColor]}
            fillOpacity={0.3}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
