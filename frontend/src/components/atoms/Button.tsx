import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  children: React.ReactNode;
}

export function Button({ variant = "primary", children, className = "", ...props }: ButtonProps) {
  const baseStyles =
    "h-[46px] px-6 rounded font-heading text-sm uppercase tracking-wider transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-accent text-accent-foreground hover:bg-accent/90 disabled:hover:bg-accent",
    ghost: "bg-transparent border border-accent text-accent hover:bg-accent hover:text-accent-foreground disabled:hover:bg-transparent",
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
