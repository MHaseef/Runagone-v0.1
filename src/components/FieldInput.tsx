import React from "react";

interface FieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const FieldInput = ({ icon, className, ...rest }: any) => (
  <div className="relative group w-full">
    {icon && (
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/70 group-focus-within:text-primary transition-colors z-10">
        {icon}
      </span>
    )}
    <input
      {...rest}
      className={
        `w-full h-12 rounded-lg bg-input/60 border border-primary/30 px-4 ` +
        `${icon ? "pl-11 " : ""} ` +
        `text-foreground placeholder:text-muted-foreground/70 ` +
        `focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all ` +
        `${className ?? ""}`
      }
    />
  </div>
);
