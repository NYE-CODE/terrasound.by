import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ProductCard as ProductCardData } from "../../lib/api";
import { cn } from "../../utils/cn";
import { ProductCard } from "./ProductCard";

export interface FeaturedProductsCarouselProps {
  products: ProductCardData[];
}

const navButtonClass =
  "flex h-28 w-8 items-center justify-center rounded-sm border border-border/30 bg-muted/25 text-muted-foreground/50 opacity-70 transition-[opacity,background-color,color,border-color] hover:border-border/50 hover:bg-muted/45 hover:text-muted-foreground hover:opacity-100 disabled:cursor-default";

const navOutsideLeftClass =
  "left-[max(0.5rem,calc((100%-min(100%,1400px))/2-2.5rem))]";
const navOutsideRightClass =
  "right-[max(0.5rem,calc((100%-min(100%,1400px))/2-2.5rem))]";

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
    <div className="relative w-full">
      <div className="max-w-[1400px] mx-auto px-6">
        <div
          ref={scrollRef}
          role="region"
          aria-label="Горизонтальная лента популярных товаров"
          tabIndex={0}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
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
      </div>

      <button
        type="button"
        onClick={() => scrollByPage("prev")}
        disabled={!canScrollPrev}
        className={cn(
          navButtonClass,
          "absolute top-1/2 z-10 hidden -translate-y-1/2 md:flex",
          navOutsideLeftClass,
          !canScrollPrev && "pointer-events-none opacity-0",
        )}
        aria-label="Показать предыдущие популярные товары"
      >
        <ArrowLeft size={18} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={() => scrollByPage("next")}
        disabled={!canScrollNext}
        className={cn(
          navButtonClass,
          "absolute top-1/2 z-10 hidden -translate-y-1/2 md:flex",
          navOutsideRightClass,
          !canScrollNext && "pointer-events-none opacity-0",
        )}
        aria-label="Показать следующие популярные товары"
      >
        <ArrowRight size={18} strokeWidth={1.75} />
      </button>
    </div>
  );
}
