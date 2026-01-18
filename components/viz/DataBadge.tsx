interface DataBadgeProps {
  children: React.ReactNode;
  color?: "blue" | "pink" | "green" | "orange" | "yellow" | "black";
  size?: "sm" | "md" | "lg";
}

export function DataBadge({ children, color = "black", size = "md" }: DataBadgeProps) {
  const colorConfig = {
    blue: "bg-viz-blue text-brutal-white",
    pink: "bg-viz-pink text-brutal-white",
    green: "bg-viz-green text-brutal-white",
    orange: "bg-viz-orange text-brutal-white",
    yellow: "bg-viz-yellow text-brutal-black",
    black: "bg-brutal-black text-brutal-white",
  };

  const sizeConfig = {
    sm: "text-xs px-2 py-1",
    md: "text-xs md:text-sm px-2 py-1 md:px-3 md:py-1.5",
    lg: "text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2",
  };

  return (
    <div
      className={`
        inline-block font-mono font-bold uppercase tracking-wide
        border-brutal border-brutal-black
        ${colorConfig[color]}
        ${sizeConfig[size]}
      `}
    >
      {children}
    </div>
  );
}
