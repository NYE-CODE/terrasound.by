import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "../ui/utils";

export const CATALOGUE_SORT_OPTIONS = [
  { value: "popularity", label: "По названию", compactLabel: "По названию" },
  { value: "rating", label: "По рейтингу", compactLabel: "По рейтингу" },
  { value: "price-low", label: "Цена: по возрастанию", compactLabel: "Цена ↑" },
  { value: "price-high", label: "Цена: по убыванию", compactLabel: "Цена ↓" },
  { value: "new", label: "Новинки", compactLabel: "Новинки" },
] as const;

export type CatalogueSortValue = (typeof CATALOGUE_SORT_OPTIONS)[number]["value"];

interface CatalogueSortSelectProps {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
  className?: string;
}

export function CatalogueSortSelect({
  value,
  onChange,
  compact = false,
  className,
}: CatalogueSortSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        size={compact ? "lg" : "default"}
        className={cn(
          "w-full bg-input border-border rounded text-sm font-normal shadow-none focus-visible:ring-0 focus-visible:border-accent dark:bg-input dark:hover:bg-input",
          compact ? "h-11" : "h-10",
          className,
        )}
      >
        <SelectValue placeholder="Сортировка" />
      </SelectTrigger>
      <SelectContent className="z-[90]">
        {CATALOGUE_SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {compact ? option.compactLabel : option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
