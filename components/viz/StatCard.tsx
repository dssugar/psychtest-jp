interface StatCardProps {
  icon?: string;
  label: string;
  value: string;
  description?: string;
  color?: "blue" | "pink" | "green" | "orange" | "yellow";
}

export function StatCard({
  icon,
  label,
  value,
  description,
  color = "blue",
}: StatCardProps) {
  const colorConfig = {
    blue: "border-l-viz-blue",
    pink: "border-l-viz-pink",
    green: "border-l-viz-green",
    orange: "border-l-viz-orange",
    yellow: "border-l-viz-yellow",
  };

  return (
    <div className={`card-brutal p-3 md:p-4 border-l-brutal-thick ${colorConfig[color]} animate-slide-in-left`}>
      <div className="flex items-start gap-3">
        {icon && <div className="text-xl md:text-2xl">{icon}</div>}
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-brutal-gray-800 mb-1">
            {label}
          </div>
          <div className="text-lg md:text-xl font-bold font-mono data-number mb-1">
            {value}
          </div>
          {description && (
            <div className="text-xs text-brutal-gray-800">
              {description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
