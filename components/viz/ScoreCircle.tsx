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
    sm: { diameter: 120, strokeWidth: 8, fontSize: "text-2xl", radius: 52 },
    md: { diameter: 180, strokeWidth: 12, fontSize: "text-4xl", radius: 78 },
    lg: { diameter: 240, strokeWidth: 16, fontSize: "text-6xl", radius: 104 },
  };

  const colorMap = {
    blue: "#0066ff",
    pink: "#ff3366",
    green: "#00cc88",
    orange: "#ff9900",
  };

  const config = sizeConfig[size];
  const radius = config.radius;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: config.diameter, height: config.diameter }}>
        <svg
          width={config.diameter}
          height={config.diameter}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            fill="none"
            stroke="#e5e5e5"
            strokeWidth={config.strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            fill="none"
            stroke={colorMap[color]}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

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
