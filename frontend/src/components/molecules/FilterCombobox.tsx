import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterComboboxProps {
  label: string;
  placeholder: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  allValue?: string;
  allLabel?: string;
  searchable?: boolean;
}

export function FilterCombobox({
  label,
  placeholder,
  options,
  value,
  onChange,
  allValue = "all",
  allLabel = "Все",
  searchable = true,
}: FilterComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const displayLabel = value === allValue ? allLabel : (selected?.label ?? placeholder);

  const allOptions: FilterOption[] = [{ value: allValue, label: allLabel }, ...options];

  return (
    <div>
      <h3 className="font-heading text-[13px] uppercase tracking-wide leading-snug mb-3">{label}</h3>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            className="w-full h-10 px-3 bg-input border border-border rounded text-sm flex items-center justify-between gap-2 hover:border-accent/50 transition-colors"
          >
            <span className={cn("truncate", value === allValue && "text-muted-foreground")}>
              {displayLabel}
            </span>
            <ChevronsUpDown size={14} className="shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-[90]" align="start">
          <Command>
            {searchable && <CommandInput placeholder="Поиск..." />}
            <CommandList>
              <CommandEmpty>Ничего не найдено</CommandEmpty>
              <CommandGroup>
                {allOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      size={14}
                      className={cn(
                        "shrink-0",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
