"use client";

import { useEffect, useState } from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

interface ScoreCircleProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  color?: "blue" | "pink" | "green" | "orange";
  label?: string;
}

export function ScoreCircle({
  score,
  size = "lg",
  color = "blue",
  label,
}: ScoreCircleProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  const sizeConfig = {
    sm: { diameter: 120, strokeWidth: 8, fontSize: "text-2xl" },
    md: { diameter: 180, strokeWidth: 12, fontSize: "text-4xl" },
    lg: { diameter: 240, strokeWidth: 16, fontSize: "text-6xl" },
  };

  const colorMap = {
    blue: "#0066ff",
    pink: "#ff3366",
    green: "#00cc88",
    orange: "#ff9900",
  };

  const config = sizeConfig[size];

  // Recharts data format
  const data = [
    {
      name: "score",
      value: animatedScore,
      fill: colorMap[color],
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: config.diameter, height: config.diameter }}>
        <RadialBarChart
          width={config.diameter}
          height={config.diameter}
          cx={config.diameter / 2}
          cy={config.diameter / 2}
          innerRadius="70%"
          outerRadius="100%"
          barSize={config.strokeWidth}
          startAngle={90}
          endAngle={-270}
          data={data}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: "#e5e5e5" }}
            dataKey="value"
            maxBarSize={config.strokeWidth}
            cornerRadius={config.strokeWidth / 2}
            animationDuration={1000}
          />
        </RadialBarChart>

        {/* Score Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className={`${config.fontSize} font-mono font-bold data-number animate-number-pop`}>
            {Math.round(animatedScore)}
          </div>
          <div className="text-sm font-semibold text-brutal-gray-800">%</div>
        </div>
      </div>

      {label && (
        <div className="text-center font-semibold text-brutal-gray-900 uppercase tracking-wide text-sm">
          {label}
        </div>
      )}
    </div>
  );
}
