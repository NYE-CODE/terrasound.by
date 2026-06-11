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

export interface CheckboxMultiSelectOption {
  value: string;
  label: string;
}

interface CheckboxMultiSelectDropdownProps {
  options: CheckboxMultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  showSearch?: boolean;
}

function triggerLabel(selected: string[], options: CheckboxMultiSelectOption[], placeholder: string): string {
  if (selected.length === 0) return placeholder;
  const labels = selected
    .map((value) => options.find((opt) => opt.value === value)?.label ?? value)
    .filter(Boolean);
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return labels.join(", ");
  return `${labels[0]} +${labels.length - 1}`;
}

export function CheckboxMultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = "Все",
  searchPlaceholder = "Поиск...",
  emptyLabel = "Ничего не найдено",
  showSearch = true,
}: CheckboxMultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const sortedOptions = useMemo(
    () => [...options].sort((a, b) => a.label.localeCompare(b.label, "ru")),
    [options],
  );

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const remove = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  const labelByValue = (value: string) =>
    options.find((opt) => opt.value === value)?.label ?? value;

  return (
    <div>
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
              {triggerLabel(selected, options, placeholder)}
            </span>
            <ChevronsUpDown size={14} className="shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-[90]" align="start">
          <Command>
            {showSearch && <CommandInput placeholder={searchPlaceholder} />}
            <CommandList>
              <CommandEmpty>{emptyLabel}</CommandEmpty>
              <CommandGroup>
                {sortedOptions.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => toggle(option.value)}
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
                      <span className="truncate">{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => remove(value)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-accent/30 bg-accent/10 text-xs text-foreground hover:bg-accent/20 transition-colors"
            >
              <span className="max-w-[140px] truncate">{labelByValue(value)}</span>
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
