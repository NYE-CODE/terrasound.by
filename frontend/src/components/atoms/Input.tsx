import { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error = false, className = "", ...props }: InputProps) {
  const baseStyles =
    "w-full h-12 px-4 bg-input border rounded text-foreground focus:border-accent focus:outline-none transition-all duration-300";
  const borderStyles = error ? "border-destructive" : "border-border";

  return <input className={`${baseStyles} ${borderStyles} ${className}`.trim()} {...props} />;
}
