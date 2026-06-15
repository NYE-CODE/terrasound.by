import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

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

function restartMarqueeAnimation(track: HTMLElement) {
  track.classList.remove("announcement-marquee-animate");
  void track.getBoundingClientRect();
  track.classList.add("announcement-marquee-animate");
}

export function AnnouncementBar({ text, scrollDurationSeconds }: AnnouncementBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const lastShiftRef = useRef<number | null>(null);
  const lastViewportWidthRef = useRef(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );
  const syncFrameRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [trackStyle, setTrackStyle] = useState<CSSProperties>({});

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

      if (!shiftChanged && !forceRestart) return;

      lastShiftRef.current = shiftPx;

      setTrackStyle({
        ["--marquee-shift" as string]: `${shiftPx}px`,
        animationDuration: `${scrollDurationSeconds}s`,
      });
      setReady(true);

      if (shiftChanged || forceRestart) {
        restartMarqueeAnimation(track);
      }
    },
    [scrollDurationSeconds],
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
    setReady(false);
  }, [text, scrollDurationSeconds]);

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
    };
  }, [scheduleMarqueeSync, text, scrollDurationSeconds]);

  return (
    <div
      className="announcement-marquee-viewport h-[var(--site-announcement-bar-height)] bg-accent text-accent-foreground border-b border-border"
      role="region"
      aria-label="Объявление"
    >
      <div
        ref={trackRef}
        className={`announcement-marquee-track flex h-full items-center${ready ? " announcement-marquee-animate" : ""}`}
        style={trackStyle}
      >
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
