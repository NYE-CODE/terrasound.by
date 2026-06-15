import { useCallback, useLayoutEffect, useRef } from "react";

interface AnnouncementBarProps {
  text: string;
  scrollDurationSeconds: number;
}

/** Сегментов в одном блоке: цикл анимации = сдвиг на ширину блока. */
const SEGMENTS_PER_BLOCK = 4;
const SHIFT_EPSILON_PX = 1;

function AnnouncementSegment({ text }: { text: string }) {
  return (
    <>
      <span className="px-8 shrink-0 whitespace-nowrap">{text}</span>
      <span className="px-8 shrink-0 whitespace-nowrap" aria-hidden="true">
        •
      </span>
    </>
  );
}

function AnnouncementBlock({ text }: { text: string }) {
  return (
    <>
      {Array.from({ length: SEGMENTS_PER_BLOCK }, (_, index) => (
        <AnnouncementSegment key={index} text={text} />
      ))}
    </>
  );
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function startMarqueeAnimation(
  track: HTMLElement,
  shiftPx: number,
  durationSeconds: number,
): Animation | null {
  track.style.transform = "";

  if (prefersReducedMotion()) {
    return null;
  }

  return track.animate(
    [
      { transform: "translate3d(0, 0, 0)" },
      { transform: `translate3d(-${shiftPx}px, 0, 0)` },
    ],
    {
      duration: durationSeconds * 1000,
      iterations: Infinity,
      easing: "linear",
    },
  );
}

export function AnnouncementBar({ text, scrollDurationSeconds }: AnnouncementBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const lastShiftRef = useRef<number | null>(null);
  const lastDurationRef = useRef(scrollDurationSeconds);
  const lastViewportWidthRef = useRef(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );
  const syncFrameRef = useRef<number | null>(null);

  const stopMarqueeAnimation = useCallback(() => {
    animationRef.current?.cancel();
    animationRef.current = null;
  }, []);

  const applyMarqueeMetrics = useCallback(
    (forceRestart = false) => {
      const block = blockRef.current;
      const track = trackRef.current;
      if (!block || !track) return;

      const shiftPx = block.getBoundingClientRect().width;
      if (shiftPx <= 0) return;

      const previousShift = lastShiftRef.current;
      const shiftChanged =
        previousShift === null || Math.abs(shiftPx - previousShift) > SHIFT_EPSILON_PX;
      const durationChanged = lastDurationRef.current !== scrollDurationSeconds;

      if (!shiftChanged && !durationChanged && !forceRestart) return;

      lastShiftRef.current = shiftPx;
      lastDurationRef.current = scrollDurationSeconds;

      stopMarqueeAnimation();
      animationRef.current = startMarqueeAnimation(track, shiftPx, scrollDurationSeconds);
    },
    [scrollDurationSeconds, stopMarqueeAnimation],
  );

  const scheduleMarqueeSync = useCallback(
    (forceRestart = false) => {
      if (syncFrameRef.current !== null) {
        cancelAnimationFrame(syncFrameRef.current);
      }
      syncFrameRef.current = requestAnimationFrame(() => {
        syncFrameRef.current = null;
        applyMarqueeMetrics(forceRestart);
      });
    },
    [applyMarqueeMetrics],
  );

  useLayoutEffect(() => {
    lastShiftRef.current = null;
    stopMarqueeAnimation();
  }, [text, scrollDurationSeconds, stopMarqueeAnimation]);

  useLayoutEffect(() => {
    scheduleMarqueeSync(true);

    const block = blockRef.current;
    if (!block) return;

    const resizeObserver = new ResizeObserver(() => {
      scheduleMarqueeSync(false);
    });
    resizeObserver.observe(block);

    const onWindowResize = () => {
      const nextWidth = window.innerWidth;
      if (Math.abs(nextWidth - lastViewportWidthRef.current) <= SHIFT_EPSILON_PX) {
        return;
      }
      lastViewportWidthRef.current = nextWidth;
      scheduleMarqueeSync(false);
    };

    const onOrientationChange = () => {
      lastViewportWidthRef.current = window.innerWidth;
      scheduleMarqueeSync(true);
    };

    window.addEventListener("resize", onWindowResize);
    window.addEventListener("orientationchange", onOrientationChange);
    document.fonts?.ready.then(() => scheduleMarqueeSync(false)).catch(() => undefined);

    return () => {
      if (syncFrameRef.current !== null) {
        cancelAnimationFrame(syncFrameRef.current);
      }
      resizeObserver.disconnect();
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("orientationchange", onOrientationChange);
      stopMarqueeAnimation();
    };
  }, [scheduleMarqueeSync, stopMarqueeAnimation, text, scrollDurationSeconds]);

  return (
    <div
      className="announcement-marquee-viewport h-[var(--site-announcement-bar-height)] bg-accent text-accent-foreground border-b border-border"
      role="region"
      aria-label="Объявление"
    >
      <div ref={trackRef} className="announcement-marquee-track flex h-full items-center">
        <div ref={blockRef} className="flex shrink-0 items-center">
          <AnnouncementBlock text={text} />
        </div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          <AnnouncementBlock text={text} />
        </div>
      </div>
    </div>
  );
}
