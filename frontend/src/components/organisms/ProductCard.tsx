import { Link } from "react-router";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { toastAddedToCart } from "../../lib/cartToast";
import { Badge } from "../atoms/Badge";
import { Price } from "../atoms/Price";
import { ProductImage } from "../atoms/ProductImage";
import { StarRating } from "../atoms/StarRating";
import { getEffectivePrice } from "../../lib/price";

export interface ProductCardProps {
  id: string;
  image: string;
  brand: string;
  name: string;
  specs: string;
  price: number;
  salePrice?: number | null;
  inStock?: boolean;
  ratingAvg?: number | null;
  reviewCount?: number;
}

export function ProductCard({
  id,
  image,
  brand,
  name,
  specs,
  price,
  salePrice,
  inStock = true,
  ratingAvg,
  reviewCount,
}: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, brand, name, price: getEffectivePrice(price, salePrice), image, inStock });
    toastAddedToCart();
  };

  return (
    <Link to={`/product/${id}`} className="group block h-full">
      <div className="surface-card-interactive p-4 h-full flex flex-col relative">
        <div className="aspect-square bg-secondary/30 rounded mb-4 overflow-hidden relative">
          <ProductImage src={image} alt={name} />
          {!inStock && (
            <div className="absolute top-3 left-3 z-10">
              <Badge text="Под заказ" variant="preorder" />
            </div>
          )}
          <button
            type="button"
            data-scroll-cursor-ignore
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 lg:opacity-0 lg:group-hover:opacity-100 flex cursor-pointer items-center gap-2 px-3 py-2 bg-background/95 border border-border rounded text-xs font-heading uppercase tracking-wider text-accent hover:text-foreground transition-all"
            aria-label="Добавить в корзину"
          >
            <ShoppingCart size={14} />
            <span className="hidden sm:inline">В корзину</span>
          </button>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="text-xs text-accent font-heading uppercase tracking-wider mb-2">
            {brand}
          </div>
          <h3 className="font-heading text-base mb-2">{name}</h3>
          {ratingAvg != null && ratingAvg > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={ratingAvg} size={12} showValue />
              {reviewCount != null && reviewCount > 0 && (
                <span className="text-xs text-muted-foreground">({reviewCount})</span>
              )}
            </div>
          )}
          <div className="text-xs text-muted-foreground mb-3">{specs}</div>
          <Price amount={price} saleAmount={salePrice} className="mt-auto" />
        </div>
      </div>
    </Link>
  );
}
