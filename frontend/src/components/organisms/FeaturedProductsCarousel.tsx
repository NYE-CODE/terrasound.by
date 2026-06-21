import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ProductCard as ProductCardData } from "../../lib/api";
import { ProductCard } from "./ProductCard";

export interface FeaturedProductsCarouselProps {
  products: ProductCardData[];
}

/** Горизонтальный слайдер популярных товаров: ~1 карточка на мобиле, 4–5 на десктопе. */
export function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
    setCanScrollPrev(scroller.scrollLeft > 1);
    setCanScrollNext(scroller.scrollLeft < maxScrollLeft - 1);
  }, []);

  const scrollByPage = useCallback((direction: "prev" | "next") => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollBy({
      left: direction === "prev" ? -scroller.clientWidth * 0.85 : scroller.clientWidth * 0.85,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, []);

  useEffect(() => {
    updateScrollState();
  });

  useEffect(() => {
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        role="region"
        aria-label="Горизонтальная лента популярных товаров"
        tabIndex={0}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 md:px-12"
        onScroll={updateScrollState}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="min-w-0 shrink-0 grow-0 basis-[82%] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(25%-0.75rem)] xl:basis-[calc(20%-0.8rem)]"
          >
            <ProductCard {...product} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByPage("prev")}
        disabled={!canScrollPrev}
        className="absolute inset-y-0 left-0 z-10 hidden w-10 items-center justify-center rounded border border-border bg-background/90 text-accent shadow-lg backdrop-blur transition-opacity hover:bg-background disabled:pointer-events-none disabled:opacity-0 md:flex"
        aria-label="Показать предыдущие популярные товары"
      >
        <ArrowLeft size={22} />
      </button>
      <button
        type="button"
        onClick={() => scrollByPage("next")}
        disabled={!canScrollNext}
        className="absolute inset-y-0 right-0 z-10 hidden w-10 items-center justify-center rounded border border-border bg-background/90 text-accent shadow-lg backdrop-blur transition-opacity hover:bg-background disabled:pointer-events-none disabled:opacity-0 md:flex"
        aria-label="Показать следующие популярные товары"
      >
        <ArrowRight size={22} />
      </button>
    </div>
  );
}
