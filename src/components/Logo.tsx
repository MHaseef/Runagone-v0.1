import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { Zap } from "lucide-react";

interface LogoProps {
  className?: string;
  to?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
};

export const Logo = ({ className, to = "/", size = "md" }: LogoProps) => {
  const inner = (
    <div className={cn("flex items-center gap-2 font-display font-black italic tracking-tighter text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]", sizes[size], className)}>
      <Zap className="fill-current" />
      <span>RUNAGON</span>
    </div>
  );
  if (to) return <Link to={to} className="inline-flex items-center">{inner}</Link>;
  return inner;
};
