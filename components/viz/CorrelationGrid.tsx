"use client";

import { useEffect, useState } from "react";

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
  const [animatedX, setAnimatedX] = useState(50);
  const [animatedY, setAnimatedY] = useState(50);
  const [showTooltip, setShowTooltip] = useState(false);

  const colorMap = {
    blue: "#0066ff",
    pink: "#ff3366",
    green: "#00cc88",
    orange: "#ff9900",
  };

  const margin = { top: 20, right: 20, bottom: 60, left: 80 };
  const width = 600;
  const height = 400;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // Convert data value (0-100) to SVG coordinate
  const xScale = (val: number) => margin.left + (val / 100) * plotWidth;
  const yScale = (val: number) => margin.top + plotHeight - (val / 100) * plotHeight;

  const pointX = xScale(animatedX);
  const pointY = yScale(animatedY);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedX(xValue);
      setAnimatedY(yValue);
    }, 100);
    return () => clearTimeout(timer);
  }, [xValue, yValue]);

  return (
    <div className="w-full relative" style={{ height: 400 }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        {/* Quadrant backgrounds */}
        <rect
          x={margin.left}
          y={margin.top}
          width={plotWidth / 2}
          height={plotHeight / 2}
          fill="#e5e5e5"
          fillOpacity={0.1}
        />
        <rect
          x={margin.left + plotWidth / 2}
          y={margin.top}
          width={plotWidth / 2}
          height={plotHeight / 2}
          fill="#e5e5e5"
          fillOpacity={0.1}
        />
        <rect
          x={margin.left}
          y={margin.top + plotHeight / 2}
          width={plotWidth / 2}
          height={plotHeight / 2}
          fill="#e5e5e5"
          fillOpacity={0.1}
        />
        <rect
          x={margin.left + plotWidth / 2}
          y={margin.top + plotHeight / 2}
          width={plotWidth / 2}
          height={plotHeight / 2}
          fill="#e5e5e5"
          fillOpacity={0.1}
        />

        {/* Grid lines (vertical) */}
        {[0, 25, 50, 75, 100].map((val) => (
          <line
            key={`vgrid-${val}`}
            x1={xScale(val)}
            y1={margin.top}
            x2={xScale(val)}
            y2={margin.top + plotHeight}
            stroke="#d4d4d4"
            strokeWidth={1}
          />
        ))}

        {/* Grid lines (horizontal) */}
        {[0, 25, 50, 75, 100].map((val) => (
          <line
            key={`hgrid-${val}`}
            x1={margin.left}
            y1={yScale(val)}
            x2={margin.left + plotWidth}
            y2={yScale(val)}
            stroke="#d4d4d4"
            strokeWidth={1}
          />
        ))}

        {/* Center reference lines */}
        <line
          x1={xScale(50)}
          y1={margin.top}
          x2={xScale(50)}
          y2={margin.top + plotHeight}
          stroke="#000"
          strokeWidth={2}
        />
        <line
          x1={margin.left}
          y1={yScale(50)}
          x2={margin.left + plotWidth}
          y2={yScale(50)}
          stroke="#000"
          strokeWidth={2}
        />

        {/* X-axis */}
        <line
          x1={margin.left}
          y1={margin.top + plotHeight}
          x2={margin.left + plotWidth}
          y2={margin.top + plotHeight}
          stroke="#000"
          strokeWidth={3}
        />

        {/* Y-axis */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={margin.top + plotHeight}
          stroke="#000"
          strokeWidth={3}
        />

        {/* X-axis ticks */}
        {[0, 25, 50, 75, 100].map((val) => (
          <g key={`xtick-${val}`}>
            <line
              x1={xScale(val)}
              y1={margin.top + plotHeight}
              x2={xScale(val)}
              y2={margin.top + plotHeight + 6}
              stroke="#000"
              strokeWidth={2}
            />
            <text
              x={xScale(val)}
              y={margin.top + plotHeight + 20}
              textAnchor="middle"
              fill="#171717"
              fontWeight={600}
              fontSize={12}
            >
              {val}
            </text>
          </g>
        ))}

        {/* Y-axis ticks */}
        {[0, 25, 50, 75, 100].map((val) => (
          <g key={`ytick-${val}`}>
            <line
              x1={margin.left - 6}
              y1={yScale(val)}
              x2={margin.left}
              y2={yScale(val)}
              stroke="#000"
              strokeWidth={2}
            />
            <text
              x={margin.left - 12}
              y={yScale(val)}
              textAnchor="end"
              dominantBaseline="middle"
              fill="#171717"
              fontWeight={600}
              fontSize={12}
            >
              {val}
            </text>
          </g>
        ))}

        {/* X-axis label */}
        <text
          x={margin.left + plotWidth / 2}
          y={height - 10}
          textAnchor="middle"
          fill="#171717"
          fontWeight="bold"
          fontSize={14}
        >
          {xLabel}
        </text>

        {/* Y-axis label */}
        <text
          x={15}
          y={margin.top + plotHeight / 2}
          textAnchor="middle"
          fill="#171717"
          fontWeight="bold"
          fontSize={14}
          transform={`rotate(-90, 15, ${margin.top + plotHeight / 2})`}
        >
          {yLabel}
        </text>

        {/* Data point */}
        <circle
          cx={pointX}
          cy={pointY}
          r={10}
          fill={colorMap[color]}
          stroke="#000"
          strokeWidth={3}
          className="transition-all duration-1000 ease-out cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        />
      </svg>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute bg-white border-brutal border-brutal-black p-3 shadow-brutal-sm pointer-events-none"
          style={{
            left: `${(pointX / width) * 100}%`,
            top: `${(pointY / height) * 100 - 15}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="font-bold mb-1">あなた</div>
          <div className="text-sm">
            {xLabel}: {Math.round(animatedX)}%
          </div>
          <div className="text-sm">
            {yLabel}: {Math.round(animatedY)}%
          </div>
        </div>
      )}
    </div>
  );
}
