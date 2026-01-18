"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface CorrelationGridProps {
  xValue: number; // 0-100 (SCCS)
  yValue: number; // 0-100 (Rosenberg)
  xLabel: string;
  yLabel: string;
  color?: "blue" | "pink" | "green" | "orange";
}

export function CorrelationGrid({
  xValue,
  yValue,
  xLabel,
  yLabel,
  color = "blue",
}: CorrelationGridProps) {
  const colorMap = {
    blue: "#0066ff",
    pink: "#ff3366",
    green: "#00cc88",
    orange: "#ff9900",
  };

  // データポイント（ユーザーの位置）
  const data = [{ x: xValue, y: yValue, name: "あなた" }];

  // カスタムドットレンダリング（大きめの円、太枠）
  const CustomDot = (props: any) => {
    const { cx, cy } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={10}
        fill={colorMap[color]}
        stroke="#000"
        strokeWidth={3}
      />
    );
  };

  return (
    <div className="w-full" style={{ height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 80 }}>
          {/* 象限背景（薄いグレー塗り） */}
          <ReferenceArea x1={0} x2={50} y1={0} y2={50} fill="#e5e5e5" fillOpacity={0.1} />
          <ReferenceArea x1={50} x2={100} y1={0} y2={50} fill="#e5e5e5" fillOpacity={0.1} />
          <ReferenceArea x1={0} x2={50} y1={50} y2={100} fill="#e5e5e5" fillOpacity={0.1} />
          <ReferenceArea x1={50} x2={100} y1={50} y2={100} fill="#e5e5e5" fillOpacity={0.1} />

          {/* グリッド線 */}
          <CartesianGrid
            strokeDasharray="0"
            stroke="#d4d4d4"
            strokeWidth={1}
          />

          {/* 中心線（50%ライン） */}
          <ReferenceLine x={50} stroke="#000" strokeWidth={2} />
          <ReferenceLine y={50} stroke="#000" strokeWidth={2} />

          {/* X軸 */}
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 100]}
            label={{
              value: xLabel,
              position: "bottom",
              offset: 40,
              style: {
                fontWeight: "bold",
                fontSize: 14,
                fill: "#171717",
              },
            }}
            stroke="#000"
            strokeWidth={3}
            tick={{ fill: "#171717", fontWeight: 600 }}
          />

          {/* Y軸 */}
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, 100]}
            label={{
              value: yLabel,
              angle: -90,
              position: "left",
              offset: 60,
              style: {
                fontWeight: "bold",
                fontSize: 14,
                fill: "#171717",
              },
            }}
            stroke="#000"
            strokeWidth={3}
            tick={{ fill: "#171717", fontWeight: 600 }}
          />

          {/* ツールチップ */}
          <Tooltip
            content={({ payload }) => {
              if (!payload || !payload[0]) return null;
              const point = payload[0].payload;
              return (
                <div className="bg-white border-brutal border-brutal-black p-3 shadow-brutal-sm">
                  <div className="font-bold mb-1">{point.name}</div>
                  <div className="text-sm">
                    {xLabel}: {Math.round(point.x)}%
                  </div>
                  <div className="text-sm">
                    {yLabel}: {Math.round(point.y)}%
                  </div>
                </div>
              );
            }}
          />

          {/* データポイント */}
          <Scatter
            data={data}
            fill={colorMap[color]}
            shape={<CustomDot />}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
