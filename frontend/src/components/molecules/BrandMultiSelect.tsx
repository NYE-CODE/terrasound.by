import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "../ui/utils";

interface BrandMultiSelectProps {
  brands: string[];
  selected: string[];
  onChange: (brands: string[]) => void;
}

function triggerLabel(selected: string[]): string {
  if (selected.length === 0) return "Все бренды";
  if (selected.length === 1) return selected[0];
  if (selected.length === 2) return selected.join(", ");
  return `${selected[0]} +${selected.length - 1}`;
}

export function BrandMultiSelect({ brands, selected, onChange }: BrandMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const sortedBrands = useMemo(() => [...brands].sort((a, b) => a.localeCompare(b)), [brands]);

  const toggleBrand = (brand: string) => {
    if (selected.includes(brand)) {
      onChange(selected.filter((item) => item !== brand));
    } else {
      onChange([...selected, brand]);
    }
  };

  const removeBrand = (brand: string) => {
    onChange(selected.filter((item) => item !== brand));
  };

  return (
    <div>
      <h3 className="font-heading text-[13px] uppercase tracking-wide leading-snug mb-3">Бренд</h3>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full min-h-10 px-3 py-2 bg-input border border-border rounded text-sm flex items-center justify-between gap-2 hover:border-accent/50 transition-colors cursor-pointer",
              selected.length > 0 && "border-accent/40",
            )}
          >
            <span className={cn("truncate text-left", selected.length === 0 && "text-muted-foreground")}>
              {triggerLabel(selected)}
            </span>
            <ChevronsUpDown size={14} className="shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-[90]" align="start">
          <Command>
            <CommandInput placeholder="Поиск бренда..." />
            <CommandList>
              <CommandEmpty>Бренд не найден</CommandEmpty>
              <CommandGroup>
                {sortedBrands.map((brand) => {
                  const isSelected = selected.includes(brand);
                  return (
                    <CommandItem
                      key={brand}
                      value={brand}
                      onSelect={() => toggleBrand(brand)}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                          isSelected
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border",
                        )}
                      >
                        {isSelected && <Check size={10} />}
                      </span>
                      <span className="truncate">{brand}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {selected.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => removeBrand(brand)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-accent/30 bg-accent/10 text-xs text-foreground hover:bg-accent/20 transition-colors"
            >
              <span className="max-w-[120px] truncate">{brand}</span>
              <X size={12} className="shrink-0 text-muted-foreground" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-muted-foreground hover:text-foreground px-1 transition-colors"
          >
            Сбросить
          </button>
        </div>
      )}
    </div>
  );
}
