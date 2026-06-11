import { InputHTMLAttributes } from "react";
import { formControlClass } from "../../lib/formControlStyles";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error = false, className = "", ...props }: InputProps) {
  const borderStyles = error ? "border-destructive" : "";

  return <input className={`${formControlClass} ${borderStyles} ${className}`.trim()} {...props} />;
}
