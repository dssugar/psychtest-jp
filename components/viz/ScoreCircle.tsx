"use client";

import { useEffect, useState } from "react";

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

  const colorConfig = {
    blue: "viz-blue",
    pink: "viz-pink",
    green: "viz-green",
    orange: "viz-orange",
  };

  const config = sizeConfig[size];
  const radius = (config.diameter - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: config.diameter, height: config.diameter }}>
        {/* Background Circle */}
        <svg
          width={config.diameter}
          height={config.diameter}
          className="transform -rotate-90"
        >
          {/* Gray background track */}
          <circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--color-gray-200))"
            strokeWidth={config.strokeWidth}
          />

          {/* Animated progress circle */}
          <circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            fill="none"
            stroke={`hsl(var(--color-viz-${color}))`}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
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
