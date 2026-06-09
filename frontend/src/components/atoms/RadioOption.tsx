import { InputHTMLAttributes } from "react";
import { Price } from "./Price";

export interface RadioOptionProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  name: string;
  value: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  description?: string;
  price?: number;
  variant?: "default" | "inline";
}

export function RadioOption({
  name,
  value,
  checked,
  onChange,
  label,
  description,
  price,
  variant = "default",
  className,
  ...props
}: RadioOptionProps) {
  if (variant === "inline") {
    return (
      <label className={`flex items-center gap-2 cursor-pointer ${className ?? ""}`.trim()}>
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="accent-accent"
          {...props}
        />
        <span className="text-sm">{label}</span>
      </label>
    );
  }

  return (
    <label className={`flex items-start gap-3 cursor-pointer ${className ?? ""}`.trim()}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-1 accent-accent"
        {...props}
      />
      <div>
        <div className="font-heading mb-1">{label}</div>
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
        {price !== undefined && (
          <Price amount={price} size="md" className="mt-1" />
        )}
      </div>
    </label>
  );
}
