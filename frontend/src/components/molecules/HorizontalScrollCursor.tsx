import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "../../utils/cn";

type ScrollDirection = "prev" | "next";

interface CursorState {
  x: number;
  y: number;
  direction: ScrollDirection | null;
}

export interface HorizontalScrollCursorProps {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
}

function resolveDirection(
  preferredDirection: ScrollDirection,
  canScrollPrev: boolean,
  canScrollNext: boolean,
): ScrollDirection | null {
  if (preferredDirection === "prev" && canScrollPrev) return "prev";
  if (preferredDirection === "next" && canScrollNext) return "next";
  if (canScrollPrev) return "prev";
  if (canScrollNext) return "next";
  return null;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(
    target.closest("a, button, input, textarea, select, label, [role='button'], [data-scroll-cursor-ignore]"),
  );
}

export function HorizontalScrollCursor({
  ariaLabel,
  children,
  className,
}: HorizontalScrollCursorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [isDesktopPointer, setIsDesktopPointer] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [cursor, setCursor] = useState<CursorState | null>(null);

  const updateScrollState = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
    setCanScrollPrev(scroller.scrollLeft > 1);
    setCanScrollNext(scroller.scrollLeft < maxScrollLeft - 1);
  }, []);

  const updateCursor = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDesktopPointer || isInteractiveTarget(event.target)) {
      setCursor(null);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const preferredDirection = event.clientX - rect.left < rect.width / 2 ? "prev" : "next";
    const direction = resolveDirection(preferredDirection, canScrollPrev, canScrollNext);

    setCursor({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      direction,
    });
  }, [canScrollNext, canScrollPrev, isDesktopPointer]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!cursor?.direction || isInteractiveTarget(event.target)) return;

    const scroller = scrollerRef.current;
    if (!scroller) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollBy({
      left: cursor.direction === "prev" ? -scroller.clientWidth * 0.85 : scroller.clientWidth * 0.85,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [cursor?.direction]);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const handlePointerQueryChange = () => setIsDesktopPointer(pointerQuery.matches);

    handlePointerQueryChange();
    pointerQuery.addEventListener("change", handlePointerQueryChange);
    return () => pointerQuery.removeEventListener("change", handlePointerQueryChange);
  }, []);

  useEffect(() => {
    updateScrollState();
  });

  useEffect(() => {
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState]);

  useEffect(() => {
    if (!cursor) return;

    setCursor((current) => {
      if (!current) return current;
      const direction = resolveDirection(current.direction ?? "next", canScrollPrev, canScrollNext);
      if (current.direction === direction) return current;

      return {
        ...current,
        direction,
      };
    });
  }, [canScrollNext, canScrollPrev]);

  const hasScrollableContent = canScrollPrev || canScrollNext;

  return (
    <div
      ref={containerRef}
      className={cn("relative", isDesktopPointer && hasScrollableContent && "md:cursor-none")}
      onPointerMove={updateCursor}
      onPointerLeave={() => setCursor(null)}
      onClick={handleClick}
    >
      <div
        ref={scrollerRef}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        className={cn("overflow-x-auto scrollbar-hide", className)}
        onScroll={updateScrollState}
      >
        {children}
      </div>

      {isDesktopPointer && cursor?.direction && (
        <div
          className="pointer-events-none absolute z-20 hidden md:flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/40 bg-background/90 text-accent shadow-lg backdrop-blur"
          style={{ left: cursor.x, top: cursor.y }}
          aria-hidden="true"
        >
          {cursor.direction === "prev" ? <ArrowLeft size={24} /> : <ArrowRight size={24} />}
        </div>
      )}
    </div>
  );
}
