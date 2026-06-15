import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

interface AnnouncementBarProps {
  text: string;
  scrollDurationSeconds: number;
}

/** Сегментов в одном блоке: цикл анимации = сдвиг на ширину блока (как translateX(-50%) при 8 копиях). */
const SEGMENTS_PER_BLOCK = 4;

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
  const [ready, setReady] = useState(false);
  const [trackStyle, setTrackStyle] = useState<CSSProperties>({});

  const syncMarquee = useCallback(() => {
    const block = blockRef.current;
    const track = trackRef.current;
    if (!block || !track) return;

    const shiftPx = block.getBoundingClientRect().width;
    if (shiftPx <= 0) return;

    setTrackStyle({
      ["--marquee-shift" as string]: `${shiftPx}px`,
      animationDuration: `${scrollDurationSeconds}s`,
    });
    setReady(true);
    restartMarqueeAnimation(track);
  }, [scrollDurationSeconds]);

  useLayoutEffect(() => {
    setReady(false);
  }, [text, scrollDurationSeconds]);

  useLayoutEffect(() => {
    syncMarquee();

    const block = blockRef.current;
    if (!block) return;

    const resizeObserver = new ResizeObserver(() => {
      syncMarquee();
    });
    resizeObserver.observe(block);

    const onViewportChange = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(syncMarquee);
      });
    };

    window.addEventListener("resize", onViewportChange);
    window.addEventListener("orientationchange", onViewportChange);
    window.visualViewport?.addEventListener("resize", onViewportChange);
    document.fonts?.ready.then(syncMarquee).catch(() => undefined);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("orientationchange", onViewportChange);
      window.visualViewport?.removeEventListener("resize", onViewportChange);
    };
  }, [syncMarquee]);

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
