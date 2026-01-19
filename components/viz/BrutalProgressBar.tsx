"use client";

import { useEffect, useState } from "react";

interface BrutalProgressBarProps {
  value: number; // 0-100
  color?: "blue" | "pink" | "green" | "orange" | "black" | "cyan";
  label?: string;
  showValue?: boolean;
  height?: "sm" | "md" | "lg";
}

export function BrutalProgressBar({
  value,
  color = "blue",
  label,
  showValue = true,
  height = "md",
}: BrutalProgressBarProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  const heightConfig = {
    sm: "h-3",
    md: "h-6",
    lg: "h-10",
  };

  const colorConfig = {
    blue: "bg-viz-blue",
    pink: "bg-viz-pink",
    green: "bg-viz-green",
    orange: "bg-viz-orange",
    cyan: "bg-viz-cyan",
    black: "bg-brutal-black",
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <div className="font-semibold text-sm uppercase tracking-wide text-brutal-gray-900">
              {label}
            </div>
          )}
          {showValue && (
            <div className="font-mono font-bold text-sm data-number">
              {Math.round(animatedValue)}%
            </div>
          )}
        </div>
      )}

      <div className={`w-full ${heightConfig[height]} border-brutal border-brutal-black bg-brutal-gray-100 relative overflow-hidden`}>
        <div
          className={`${heightConfig[height]} ${colorConfig[color]} transition-all duration-1000 ease-out`}
          style={{ width: `${animatedValue}%` }}
        />
      </div>
    </div>
  );
}
