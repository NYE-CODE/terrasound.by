import { ReactNode } from "react";
import { Info } from "lucide-react";
import { Button } from "../atoms/Button";
import { Price } from "../atoms/Price";
import { OrderItem } from "../molecules/OrderItem";
import { hasPreorderItems, PREORDER_NOTICE } from "../../lib/preorder";

export interface OrderSummaryItem {
  id: string;
  brand: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  inStock: boolean;
}

export interface OrderSummaryProps {
  title: string;
  items: OrderSummaryItem[];
  subtotal: number;
  total: number;
  variant: "checkout" | "cart";
  submitLabel?: string;
  isSubmitting?: boolean;
  actions?: ReactNode;
  footer?: ReactNode;
}

export function OrderSummary({
  title,
  items,
  subtotal,
  total,
  variant,
  submitLabel = "Отправить заказ",
  isSubmitting = false,
  actions,
  footer,
}: OrderSummaryProps) {
  const showPreorderNotice = hasPreorderItems(items);

  return (
    <div className="bg-card border border-card-border rounded p-4 sm:p-6 min-w-0 w-full lg:sticky lg:top-32">
      <h2 className="font-heading text-xl mb-6">{title}</h2>

      {variant === "checkout" && (
        <div className="space-y-4 mb-6 pb-6 border-b border-border">
          {items.map((item) => (
            <OrderItem
              key={item.id}
              brand={item.brand}
              name={item.name}
              image={item.image}
              quantity={item.quantity}
              unitPrice={item.price}
              inStock={item.inStock}
              variant="summary"
            />
          ))}
        </div>
      )}

      <div
        className={`${variant === "checkout" ? "space-y-3" : "space-y-4"} mb-6 pb-6 border-b border-border`}
      >
        {variant === "checkout" ? (
          <div className="flex justify-between gap-3 min-w-0 text-sm">
            <span className="text-muted-foreground shrink-0">Товары</span>
            <Price amount={subtotal} variant="summary" className="text-right" />
          </div>
        ) : (
          <div className="flex justify-between gap-3 min-w-0 text-sm">
            <span className="text-muted-foreground shrink-0">Подытог</span>
            <Price amount={subtotal} size="base" className="text-right" />
          </div>
        )}
      </div>

      <div className="flex justify-between gap-3 min-w-0 mb-8">
        <span className="font-heading text-lg shrink-0">Итого</span>
        <Price amount={total} size="lg" className="text-right" />
      </div>

      {variant === "checkout" && (
        <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Отправка..." : submitLabel}
        </Button>
      )}

      {showPreorderNotice && (
        <div
          className={`${
            variant === "checkout" ? "mt-6" : "mb-4"
          } flex items-start gap-2 rounded border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100/90`}
        >
          <Info size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <span>{PREORDER_NOTICE}</span>
        </div>
      )}

      {variant === "cart" && actions}

      {variant === "checkout" && !footer && (
        <div className="mt-6 pt-6 border-t border-border flex items-start gap-2 text-sm text-muted-foreground">
          <Info size={16} className="text-accent mt-0.5 flex-shrink-0" />
          <span>Мы свяжемся с вами в течение 24 часов для подтверждения</span>
        </div>
      )}

      {footer}
    </div>
  );
}
