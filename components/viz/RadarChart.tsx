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
    sm: { diameter: 200, fontSize: 10, radius: 80, labelOffset: 100 },
    md: { diameter: 280, fontSize: 11, radius: 110, labelOffset: 140 },
    lg: { diameter: 320, fontSize: 12, radius: 130, labelOffset: 160 },
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

  // Create polygon points string
  const polygonPoints = animatedValues
    .map((value, i) => {
      const point = getPoint(i, value, config.radius);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues(dimensions.map((d) => d.value));
    }, 100);
    return () => clearTimeout(timer);
  }, [dimensions]);

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: config.diameter, height: config.diameter }}
    >
      <svg width={config.diameter} height={config.diameter}>
        {/* Grid circles (50%, 100%) */}
        <circle
          cx={center}
          cy={center}
          r={config.radius * 0.5}
          fill="none"
          stroke="#d4d4d4"
          strokeWidth={2}
        />
        <circle
          cx={center}
          cy={center}
          r={config.radius}
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
          const labelY = center + config.labelOffset * Math.sin(angle);

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
