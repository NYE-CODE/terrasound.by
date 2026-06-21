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
      <div className="mb-4 hidden md:flex justify-end gap-2">
        <CarouselPrevious
          variant="outline"
          className="static size-10 translate-x-0 translate-y-0 border-border bg-background/95 hover:bg-background"
        />
        <CarouselNext
          variant="outline"
          className="static size-10 translate-x-0 translate-y-0 border-border bg-background/95 hover:bg-background"
        />
      </div>
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
    </Carousel>
  );
}
