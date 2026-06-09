import { InputHTMLAttributes, ReactNode } from "react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  inputClassName?: string;
  className?: string;
}

export function Checkbox({
  label,
  inputClassName = "mt-1 w-5 h-5 accent-accent",
  className = "",
  ...props
}: CheckboxProps) {
  const input = (
    <input
      type="checkbox"
      className={inputClassName}
      {...props}
    />
  );

  if (label) {
    return (
      <label className={`flex items-start gap-4 cursor-pointer ${className}`.trim()}>
        {input}
        <div className="flex-1">{label}</div>
      </label>
    );
  }

  return input;
}
