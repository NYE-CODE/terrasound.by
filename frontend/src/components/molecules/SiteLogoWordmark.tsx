import { useLayoutEffect, useRef, useState } from "react";

/** Минимальная разрядка +25 (Adobe tracking) в em. */
const LOGO_TRACKING_BASE_EM = 0.025;
const LOGO_TRACKING_MAX_EM = 0.6;

function measureTextWidth(element: HTMLElement): number {
  return element.getBoundingClientRect().width;
}

function fitTitleToWidth(
  element: HTMLElement,
  targetWidth: number,
  baseEm: number,
): number {
  element.style.letterSpacing = `${baseEm}em`;

  if (measureTextWidth(element) >= targetWidth - 0.5) {
    return baseEm;
  }

  let low = baseEm;
  let high = LOGO_TRACKING_MAX_EM;

  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    element.style.letterSpacing = `${mid}em`;
    if (measureTextWidth(element) < targetWidth) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return high;
}

interface SiteLogoWordmarkProps {
  title: string;
  tagline: string;
}

export function SiteLogoWordmark({ title, tagline }: SiteLogoWordmarkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLSpanElement>(null);
  const [titleTracking, setTitleTracking] = useState(LOGO_TRACKING_BASE_EM);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const titleEl = titleRef.current;
    const taglineEl = taglineRef.current;
    if (!container || !titleEl || !taglineEl) return;

    const sync = () => {
      if (window.matchMedia("(max-width: 767px)").matches) return;

      taglineEl.style.letterSpacing = `${LOGO_TRACKING_BASE_EM}em`;
      titleEl.style.letterSpacing = `${LOGO_TRACKING_BASE_EM}em`;

      const targetWidth = measureTextWidth(taglineEl);
      if (targetWidth <= 0) return;

      const nextTitleTracking = fitTitleToWidth(titleEl, targetWidth, LOGO_TRACKING_BASE_EM);

      setTitleTracking((prev) =>
        Math.abs(prev - nextTitleTracking) < 0.0001 ? prev : nextTitleTracking,
      );
    };

    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(container);

    const desktopQuery = window.matchMedia("(min-width: 768px)");
    desktopQuery.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    document.fonts?.ready.then(sync).catch(() => undefined);

    return () => {
      observer.disconnect();
      desktopQuery.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, [title, tagline]);

  return (
    <div ref={containerRef} className="site-logo-wordmark hidden md:flex md:flex-col md:items-start leading-tight">
      <span
        ref={titleRef}
        className="site-logo-title site-logo-line text-sm sm:text-base uppercase"
        style={{ letterSpacing: `${titleTracking}em` }}
      >
        {title}
      </span>
      <span
        ref={taglineRef}
        className="site-logo-tagline site-logo-line text-[10px] sm:text-xs uppercase text-muted-foreground"
        style={{ letterSpacing: `${LOGO_TRACKING_BASE_EM}em` }}
      >
        {tagline}
      </span>
    </div>
  );
}
