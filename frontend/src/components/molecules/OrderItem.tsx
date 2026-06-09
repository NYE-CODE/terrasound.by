import { Trash2, Plus, Minus } from "lucide-react";
import { ProductImage } from "../atoms/ProductImage";
import { Price } from "../atoms/Price";

export interface OrderItemProps {
  brand: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  variant?: "summary" | "cart";
  onDecrease?: () => void;
  onIncrease?: () => void;
  onRemove?: () => void;
}

export function OrderItem({
  brand,
  name,
  image,
  quantity,
  unitPrice,
  variant = "summary",
  onDecrease,
  onIncrease,
  onRemove,
}: OrderItemProps) {
  if (variant === "cart") {
    return (
      <>
        <div className="w-24 h-24 flex-shrink-0 bg-secondary/30 rounded overflow-hidden">
          <ProductImage src={image} alt={name} />
        </div>

        <div className="flex-1">
          <div className="text-xs text-accent font-heading uppercase tracking-wider mb-1">
            {brand}
          </div>
          <h3 className="font-heading text-lg mb-4">{name}</h3>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onDecrease}
                className="w-8 h-8 bg-secondary border border-border rounded flex items-center justify-center hover:border-accent transition-all duration-300"
              >
                <Minus size={14} />
              </button>
              <span className="w-12 text-center font-heading">{quantity}</span>
              <button
                type="button"
                onClick={onIncrease}
                className="w-8 h-8 bg-secondary border border-border rounded flex items-center justify-center hover:border-accent transition-all duration-300"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8">
              <Price amount={unitPrice * quantity} size="md" />
              <button
                type="button"
                onClick={onRemove}
                className="text-muted-foreground hover:text-destructive transition-colors duration-300"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="w-16 h-16 bg-secondary/30 rounded overflow-hidden flex-shrink-0">
        <ProductImage src={image} alt={name} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-accent font-heading uppercase tracking-wider mb-1">
          {brand}
        </div>
        <div className="text-sm truncate mb-1">{name}</div>
        <div className="text-sm">
          <span className="text-muted-foreground">{quantity} ×</span>{" "}
          <Price amount={unitPrice} variant="summary" />
        </div>
      </div>
    </div>
  );
}
