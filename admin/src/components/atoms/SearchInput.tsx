import { Search } from "lucide-react";
import { inputClass } from "../../lib/formStyles";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Поиск…",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative min-w-0 ${className}`.trim()}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} w-full min-w-0 pl-9`}
      />
    </div>
  );
}
