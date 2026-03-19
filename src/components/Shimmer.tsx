import React from "react";

interface ShimmerProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: "text" | "card" | "circle" | "stat";
}

export default function Shimmer({ width, height, className = "", variant = "text" }: ShimmerProps) {
  const styles: React.CSSProperties = {
    width: width || (variant === "text" ? "100%" : undefined),
    height: height || (variant === "text" ? "1em" : undefined),
  };

  return (
    <div 
      className={`shimmer shimmer-${variant} ${className}`} 
      style={styles}
    />
  );
}
