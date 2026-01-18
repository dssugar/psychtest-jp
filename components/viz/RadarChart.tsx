"use client";

import { useEffect, useState } from "react";

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
  const [animatedValues, setAnimatedValues] = useState<number[]>(
    dimensions.map(() => 0)
  );

  const sizeConfig = {
    sm: { diameter: 260, fontSize: 10, radius: 80, labelOffset: 100 },
    md: { diameter: 320, fontSize: 11, radius: 100, labelOffset: 125 },
    lg: { diameter: 380, fontSize: 12, radius: 120, labelOffset: 150 },
  };

  const colorMap = {
    blue: "#0066ff",
    pink: "#ff3366",
    green: "#00cc88",
    orange: "#ff9900",
  };

  const config = sizeConfig[size];
  const chartColor = dimensions[0]?.color || "blue";
  const center = config.diameter / 2;
  const numDimensions = dimensions.length;

  // Calculate points for polygon
  const getPoint = (index: number, value: number, radius: number) => {
    const angle = (Math.PI * 2 * index) / numDimensions - Math.PI / 2;
    const r = (radius * value) / 100;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Create polygon points string for data
  const polygonPoints = animatedValues
    .map((value, i) => {
      const point = getPoint(i, value, config.radius);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  // Create pentagon grid points (50%, 100%)
  const getPentagonPoints = (percentage: number) => {
    return Array.from({ length: numDimensions }, (_, i) => {
      const point = getPoint(i, percentage, config.radius);
      return `${point.x},${point.y}`;
    }).join(" ");
  };

  const gridPentagon50 = getPentagonPoints(50);
  const gridPentagon100 = getPentagonPoints(100);

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues(dimensions.map((d) => d.value));
    }, 100);
    return () => clearTimeout(timer);
  }, [dimensions]);

  // Calculate actual content bounds for tighter viewBox
  const padding = 20; // Padding for text
  const minY = center - config.labelOffset - padding; // Top label position
  const maxY = center + config.labelOffset * 0.85 + padding; // Bottom labels (pentagon doesn't extend as far down)
  const viewBoxHeight = maxY - minY;
  const viewBoxY = minY;

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: config.diameter, height: viewBoxHeight }}
    >
      <svg
        width={config.diameter}
        height={viewBoxHeight}
        viewBox={`0 ${viewBoxY} ${config.diameter} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid pentagons (50%, 100%) */}
        <polygon
          points={gridPentagon50}
          fill="none"
          stroke="#d4d4d4"
          strokeWidth={2}
        />
        <polygon
          points={gridPentagon100}
          fill="none"
          stroke="#d4d4d4"
          strokeWidth={2}
        />

        {/* Axis lines */}
        {dimensions.map((_, index) => {
          const endPoint = getPoint(index, 100, config.radius);
          return (
            <line
              key={`axis-${index}`}
              x1={center}
              y1={center}
              x2={endPoint.x}
              y2={endPoint.y}
              stroke="#000000"
              strokeWidth={3}
            />
          );
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill={colorMap[chartColor]}
          fillOpacity={0.3}
          stroke={colorMap[chartColor]}
          strokeWidth={4}
          className="transition-all duration-1000 ease-out"
        />

        {/* Labels */}
        {dimensions.map((dim, index) => {
          const angle = (Math.PI * 2 * index) / numDimensions - Math.PI / 2;
          const labelX = center + config.labelOffset * Math.cos(angle);
          let labelY = center + config.labelOffset * Math.sin(angle);

          // Adjust top label (index 0) slightly down
          if (index === 0) {
            labelY += 8;
          }

          return (
            <text
              key={`label-${index}`}
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#171717"
              fontSize={config.fontSize}
              fontWeight={600}
              fontFamily="Inter, sans-serif"
            >
              {dim.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
