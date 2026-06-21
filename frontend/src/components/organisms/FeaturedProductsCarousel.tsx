import type { ProductCard as ProductCardData } from "../../lib/api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { ProductCard } from "./ProductCard";

export interface FeaturedProductsCarouselProps {
  products: ProductCardData[];
}

/** Горизонтальный слайдер популярных товаров: ~1 карточка на мобиле, 4–5 на десктопе. */
export function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
  return (
    <Carousel
      opts={{
        align: "start",
        containScroll: "trimSnaps",
      }}
      className="w-full"
    >
      <CarouselContent>
        {products.map((product) => (
          <CarouselItem
            key={product.id}
            className="basis-[82%] sm:basis-1/2 lg:basis-1/4 xl:basis-1/5"
          >
            <ProductCard {...product} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious
        variant="outline"
        className="hidden md:inline-flex left-2 top-1/2 -translate-y-1/2 border-border bg-background/95 hover:bg-background"
      />
      <CarouselNext
        variant="outline"
        className="hidden md:inline-flex right-2 top-1/2 -translate-y-1/2 border-border bg-background/95 hover:bg-background"
      />
    </Carousel>
  );
}
