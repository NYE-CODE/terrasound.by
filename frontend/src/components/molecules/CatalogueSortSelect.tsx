import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { siteSelectContentClass, siteSelectTriggerClass } from "../../lib/selectControlStyles";
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
  const desktopMenuWidth = "w-[15rem]";

  const heightClass = compact
    ? "!h-11 !min-h-11 !max-h-11"
    : "!h-10 !min-h-10 !max-h-10";

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        size={compact ? "lg" : "default"}
        className={siteSelectTriggerClass(
          compact ? "md" : "sm",
          cn(heightClass, "!py-0", !compact && desktopMenuWidth, "shrink-0", className),
        )}
      >
        <SelectValue placeholder="Сортировка" />
      </SelectTrigger>
      <SelectContent className={cn(siteSelectContentClass, !compact && desktopMenuWidth)}>
        {CATALOGUE_SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {compact ? option.compactLabel : option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
