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

function buildStyle(
  triggerRect: DOMRect,
  width: number,
  align: FloatingAlign,
  gap: number,
  zIndex: number,
  visible: boolean,
): CSSProperties {
  const top = triggerRect.bottom + gap;
  const rawLeft = align === "right" ? triggerRect.right - width : triggerRect.left;

  return {
    position: "fixed",
    top,
    left: clampLeft(rawLeft, width),
    zIndex,
    visibility: visible ? "visible" : "hidden",
  };
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

  const positionMenu = useCallback(
    (visible: boolean) => {
      const trigger = triggerRef.current;
      const floating = floatingRef.current;
      if (!trigger || !floating) return false;

      const triggerRect = trigger.getBoundingClientRect();
      const fallbackWidth = estimatedWidth ?? triggerRect.width;
      const draftStyle = buildStyle(triggerRect, fallbackWidth, align, gap, zIndex, false);

      Object.assign(floating.style, {
        position: "fixed",
        top: `${draftStyle.top}px`,
        left: `${draftStyle.left}px`,
        zIndex: String(zIndex),
        visibility: "hidden",
      });

      const measuredWidth = floating.getBoundingClientRect().width;
      const width = measuredWidth > 0 ? measuredWidth : fallbackWidth;
      const nextStyle = buildStyle(triggerRect, width, align, gap, zIndex, visible);

      setStyle(nextStyle);
      return true;
    },
    [triggerRef, floatingRef, align, gap, zIndex, estimatedWidth],
  );

  useLayoutEffect(() => {
    if (!open) {
      setStyle({});
      return;
    }

    if (positionMenu(true)) return;

    let rafId = 0;
    const retry = () => {
      if (positionMenu(true)) return;
      rafId = requestAnimationFrame(retry);
    };
    rafId = requestAnimationFrame(retry);

    return () => cancelAnimationFrame(rafId);
  }, [open, positionMenu, ...deps]);

  useEffect(() => {
    if (!open) return;

    const reposition = () => positionMenu(true);

    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);

    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, positionMenu]);

  return style;
}
