import { isOnSale } from "../../lib/price";

export interface PriceProps {
  amount: number;
  saleAmount?: number | null;
  currency?: string;
  size?: "sm" | "base" | "md" | "lg" | "xl";
  variant?: "default" | "summary";
  className?: string;
}

export function Price({
  amount,
  saleAmount,
  currency = "BYN",
  size = "sm",
  variant = "default",
  className = "",
}: PriceProps) {
  const onSale = isOnSale(amount, saleAmount);
  const displayAmount = onSale ? saleAmount! : amount;
  const formattedAmount = displayAmount.toFixed(2);
  const formattedOriginal = amount.toFixed(2);

  const saleStrike = onSale ? (
    <span className="text-muted-foreground line-through decoration-muted-foreground/60">
      {formattedOriginal}
    </span>
  ) : null;

  if (variant === "summary") {
    return (
      <span className={`font-heading inline-flex items-baseline gap-2 ${className}`.trim()}>
        <span>
          <span className="text-xs text-muted-foreground">{currency}</span> {formattedAmount}
        </span>
        {saleStrike}
      </span>
    );
  }

  if (size === "xl") {
    return (
      <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${className}`.trim()}>
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-muted-foreground align-baseline">{currency}</span>
          <span className={`font-heading text-5xl ${onSale ? "text-accent" : ""}`}>
            {formattedAmount}
          </span>
        </div>
        {saleStrike && <span className="text-lg line-through text-muted-foreground">{formattedOriginal}</span>}
      </div>
    );
  }

  if (size === "lg") {
    return (
      <span className={`font-heading text-2xl inline-flex items-baseline gap-2 ${className}`.trim()}>
        <span>
          <span className="text-xs text-muted-foreground align-baseline">{currency}</span>{" "}
          <span className={onSale ? "text-accent" : ""}>{formattedAmount}</span>
        </span>
        {saleStrike}
      </span>
    );
  }

  if (size === "base") {
    return (
      <span className={`font-heading inline-flex items-baseline gap-2 ${className}`.trim()}>
        <span>
          <span className="text-xs text-muted-foreground align-baseline">{currency}</span>{" "}
          <span className={onSale ? "text-accent" : ""}>{formattedAmount}</span>
        </span>
        {saleStrike}
      </span>
    );
  }

  if (size === "md") {
    return (
      <span className={`font-heading text-xl inline-flex items-baseline gap-2 ${className}`.trim()}>
        <span>
          <span className="text-xs text-muted-foreground align-baseline">{currency}</span>{" "}
          <span className={onSale ? "text-accent" : ""}>{formattedAmount}</span>
        </span>
        {saleStrike}
      </span>
    );
  }

  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`.trim()}>
      <div className="flex items-baseline gap-1">
        <span className="text-xs text-muted-foreground align-baseline">{currency}</span>
        <span className={`font-heading text-xl ${onSale ? "text-accent" : ""}`}>{formattedAmount}</span>
      </div>
      {saleStrike && <span className="text-sm">{saleStrike}</span>}
    </div>
  );
}
