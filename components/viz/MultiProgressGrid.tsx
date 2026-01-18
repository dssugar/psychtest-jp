"use client";

import { BrutalProgressBar } from "./BrutalProgressBar";

interface ProgressItem {
  label: string;
  value: number; // 0-100
  color: "blue" | "pink" | "green" | "orange";
}

interface MultiProgressGridProps {
  items: ProgressItem[];
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
}

export function MultiProgressGrid({
  items,
  columns = { sm: 1, md: 2, lg: 3 },
}: MultiProgressGridProps) {
  // Tailwindの動的クラス生成を避けるため、明示的にマッピング
  const getGridClass = () => {
    const sm = columns.sm || 1;
    const md = columns.md || 2;
    const lg = columns.lg || 3;

    // 明示的なクラス名（Tailwindがpurge時に保持）
    const smClass = sm === 1 ? "grid-cols-1" : sm === 2 ? "grid-cols-2" : "grid-cols-3";
    const mdClass = md === 1 ? "md:grid-cols-1" : md === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
    const lgClass = lg === 1 ? "lg:grid-cols-1" : lg === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3";

    return `${smClass} ${mdClass} ${lgClass}`;
  };

  return (
    <div className={`grid ${getGridClass()} gap-6`}>
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
          <BrutalProgressBar
            value={item.value}
            color={item.color}
            label={item.label}
            showValue={true}
            height="md"
          />
        </div>
      ))}
    </div>
  );
}
