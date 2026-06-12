import { siteSelectTriggerClass } from "./selectControlStyles";

/** Общие стили полей форм на публичном сайте (input). */
export const formControlClass =
  "w-full h-12 px-4 bg-input border border-border rounded text-foreground transition-all duration-300 focus:border-accent focus:outline-none focus-visible:outline-none hover:border-accent/50";

/** Триггер Select в формах — тот же вид, что и у input. */
export const formSelectTriggerClass = siteSelectTriggerClass("lg");
