import { compactControlClass } from "../../lib/formStyles";

export const filterControlClass = compactControlClass;

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
}

export function FilterSelect({
  value,
  onChange,
  ariaLabel,
  children,
  className = "",
}: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className={`${filterControlClass} ${className}`.trim()}
    >
      {children}
    </select>
  );
}
