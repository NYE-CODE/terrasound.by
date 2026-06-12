import { cn } from "../components/ui/utils";

export type SiteSelectSize = "sm" | "md" | "lg";

/** Визуальные стили триггера дропдауна на публичном сайте (Select, Popover-комбобоксы). */
export const siteSelectTriggerBaseClass =
  "w-full flex items-center justify-between gap-2 bg-input border border-border rounded text-sm text-foreground shadow-none transition-colors duration-300 outline-none cursor-pointer hover:border-accent/50 data-[state=open]:border-accent focus-visible:ring-0 focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground dark:bg-input dark:hover:bg-input [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg]:text-muted-foreground [&_svg]:opacity-50";

export const siteSelectTriggerSizeClass: Record<SiteSelectSize, string> = {
  sm: "h-10 px-3",
  md: "h-11 px-3",
  lg: "h-12 px-4 text-base",
};

export function siteSelectTriggerClass(size: SiteSelectSize = "sm", className?: string) {
  return cn(siteSelectTriggerBaseClass, siteSelectTriggerSizeClass[size], className);
}

/** Стили выпадающего списка (SelectContent, Popover с пунктами). */
export const siteSelectContentClass =
  "z-[90] bg-popover text-popover-foreground border border-border rounded shadow-md";

/** Popover-списки без внутренних отступов (Command внутри). */
export const sitePopoverMenuContentClass = cn(siteSelectContentClass, "p-0");

/** Рамка триггера, когда есть выбранные значения (мультиселект). */
export const siteSelectTriggerFilledClass = "border-accent/40";
