import type { ProductCard as ProductCardData } from "../../lib/api";
import { HorizontalScrollCursor } from "../molecules/HorizontalScrollCursor";
import { ProductCard } from "./ProductCard";

export interface FeaturedProductsCarouselProps {
  products: ProductCardData[];
}

/** Горизонтальный слайдер популярных товаров: ~1 карточка на мобиле, 4–5 на десктопе. */
export function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
  return (
    <HorizontalScrollCursor
      ariaLabel="Горизонтальная лента популярных товаров"
      className="flex gap-4 pb-4"
    >
      {products.map((product) => (
        <div
          key={product.id}
          className="min-w-0 shrink-0 grow-0 basis-[82%] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(25%-0.75rem)] xl:basis-[calc(20%-0.8rem)]"
        >
          <ProductCard {...product} />
        </div>
      ))}
    </HorizontalScrollCursor>
  );
}
