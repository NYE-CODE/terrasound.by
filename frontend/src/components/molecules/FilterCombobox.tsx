import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { sitePopoverMenuContentClass, siteSelectTriggerClass } from "../../lib/selectControlStyles";
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
            className={siteSelectTriggerClass("sm")}
          >
            <span className={cn("truncate", value === allValue && "text-muted-foreground")}>
              {displayLabel}
            </span>
            <ChevronDown aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(sitePopoverMenuContentClass, "w-[var(--radix-popover-trigger-width)]")}
          align="start"
        >
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
