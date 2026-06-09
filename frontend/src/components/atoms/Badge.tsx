import { ReactNode } from "react";

export interface BadgeProps {
  text: string;
  variant?: "accent" | "success" | "muted";
  size?: "sm" | "md";
  icon?: ReactNode;
  className?: string;
}

export function Badge({ text, variant = "accent", size = "sm", icon, className = "" }: BadgeProps) {
  const variantStyles = {
    accent: "bg-accent/10 text-accent",
    success: "bg-emerald-500/10 text-emerald-400",
    muted: "bg-secondary text-muted-foreground border border-border",
  };

  const sizeStyles = {
    sm: "text-xs px-2 py-1 rounded inline-block",
    md: "flex items-center gap-2 px-4 py-2 rounded",
  };

  if (size === "md") {
    return (
      <div className={`${variantStyles[variant]} ${sizeStyles.md} ${className}`.trim()}>
        {icon}
        <span className="text-sm">{text}</span>
      </div>
    );
  }

  return (
    <div className={`${variantStyles[variant]} ${sizeStyles.sm} ${className}`.trim()}>
      {text}
    </div>
  );
}
