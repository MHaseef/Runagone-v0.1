import React from "react";
import { cn } from "@/src/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ title, subtitle, actions, className }: PageHeaderProps) => (
  <div className={cn("flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6", className)}>
    <div>
      <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-wider uppercase text-glow">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-sm sm:text-base text-muted-foreground font-tactical uppercase tracking-widest">
          {subtitle}
        </p>
      )}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);
