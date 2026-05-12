import React from "react";
import { cn } from "@/src/lib/utils";

interface HexIconProps {
  className?: string;
  filled?: boolean;
  size?: number;
  children?: React.ReactNode;
}

export const HexIcon = ({ className, filled = false, size = 20, children }: HexIconProps) => {
  return (
    <span className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size} height={size} className="absolute inset-0">
        <polygon
          points="12,2 22,7 22,17 12,22 2,17 2,7"
          fill={filled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {children && <span className="relative z-10 text-[10px] font-bold">{children}</span>}
    </span>
  );
};
