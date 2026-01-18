import { type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "white" | "blue" | "pink" | "green" | "orange" | "yellow" | "black";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  as?: "div" | "section" | "article" | "a";
  href?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export function Card({
  children,
  className,
  variant = "white",
  padding = "lg",
  as: Component = "div",
  href,
  hover = false,
  onClick,
  style,
}: CardProps) {
  const variantClasses = {
    white: "bg-brutal-white border-brutal-black",
    blue: "bg-viz-blue text-brutal-white border-brutal-black",
    pink: "bg-viz-pink text-brutal-white border-brutal-black",
    green: "bg-viz-green text-brutal-white border-brutal-black",
    orange: "bg-viz-orange text-brutal-white border-brutal-black",
    yellow: "bg-viz-yellow border-brutal-black",
    black: "bg-brutal-black text-brutal-white border-brutal-black",
  };

  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6 md:p-8",
    lg: "p-8 md:p-12",
    xl: "p-10 md:p-16",
  };

  const hoverClasses = hover
    ? "cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
    : "";

  const combinedClassName = cn(
    "card-brutal",
    variantClasses[variant],
    paddingClasses[padding],
    hoverClasses,
    className
  );

  if (Component === "a" && href) {
    return (
      <a href={href} className={combinedClassName} style={style}>
        {children}
      </a>
    );
  }

  return (
    <Component className={combinedClassName} onClick={onClick} style={style}>
      {children}
    </Component>
  );
}
