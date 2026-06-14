import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

export type FloatingAlign = "left" | "right";

export const FILTER_DROPDOWN_ESTIMATED_WIDTH = 184;
export const DATE_RANGE_POPOVER_ESTIMATED_WIDTH = 728;

interface UseFloatingPositionOptions {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  floatingRef: RefObject<HTMLElement | null>;
  align?: FloatingAlign;
  gap?: number;
  zIndex?: number;
  estimatedWidth?: number;
  deps?: readonly unknown[];
}

function clampLeft(left: number, width: number): number {
  return Math.max(8, Math.min(left, window.innerWidth - width - 8));
}

export function useFloatingPosition({
  open,
  triggerRef,
  floatingRef,
  align = "left",
  gap = 6,
  zIndex = 300,
  estimatedWidth,
  deps = [],
}: UseFloatingPositionOptions): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({});

  const updatePosition = useCallback(
    (showWhenMeasured = false) => {
      const trigger = triggerRef.current;
      if (!trigger) return false;

      const triggerRect = trigger.getBoundingClientRect();
      const floatingRect = floatingRef.current?.getBoundingClientRect();
      const measured = floatingRect && floatingRect.width > 0;
      const width = measured ? floatingRect.width : (estimatedWidth ?? triggerRect.width);
      const top = triggerRect.bottom + gap;
      const rawLeft = align === "right" ? triggerRect.right - width : triggerRect.left;

      setStyle({
        position: "fixed",
        top,
        left: clampLeft(rawLeft, width),
        zIndex,
        visibility: showWhenMeasured && measured ? "visible" : "hidden",
      });

      return Boolean(measured);
    },
    [triggerRef, floatingRef, align, gap, zIndex, estimatedWidth],
  );

  useLayoutEffect(() => {
    if (!open) {
      setStyle({});
      return;
    }

    updatePosition(false);

    if (updatePosition(true)) return;

    let rafId = 0;
    const retry = () => {
      if (updatePosition(true)) return;
      rafId = requestAnimationFrame(retry);
    };
    rafId = requestAnimationFrame(retry);

    return () => cancelAnimationFrame(rafId);
  }, [open, updatePosition, ...deps]);

  useEffect(() => {
    if (!open) return;

    const reposition = () => {
      updatePosition(true);
    };

    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);

    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, updatePosition]);

  return style;
}
