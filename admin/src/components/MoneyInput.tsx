import type { InputHTMLAttributes } from "react";
import { inputClass } from "../lib/formStyles";
import { parseMoneyInput, roundMoney } from "../lib/money";

type MoneyInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "step" | "value" | "onChange"> & {
  value: number | null | undefined;
  onValueChange: (value: number) => void;
};

/** Поле цены: step 0.01, без изменения колёсиком мыши при фокусе. */
export function MoneyInput({ value, onValueChange, className, onWheel, ...props }: MoneyInputProps) {
  const display =
    value == null || !Number.isFinite(value) ? "" : String(roundMoney(value));

  return (
    <input
      {...props}
      type="number"
      step="0.01"
      min={0}
      value={display}
      onChange={(e) => onValueChange(parseMoneyInput(e.target.value))}
      onWheel={(e) => {
        e.currentTarget.blur();
        onWheel?.(e);
      }}
      className={className ?? inputClass}
    />
  );
}
