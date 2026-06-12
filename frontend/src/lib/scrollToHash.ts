const RETRY_DELAYS_MS = [0, 50, 150, 300, 500, 800, 1200, 2000];

export function scrollToHash(
  hash: string,
  options: ScrollIntoViewOptions = { behavior: "smooth", block: "start" },
): () => void {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) return () => {};

  let cancelled = false;
  const timers: number[] = [];

  const cancel = () => {
    cancelled = true;
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.length = 0;
    window.removeEventListener("wheel", cancelOnUserScroll);
    window.removeEventListener("touchstart", cancelOnUserScroll);
  };

  const cancelOnUserScroll = () => {
    cancel();
  };

  const tryScroll = (): boolean => {
    if (cancelled) return false;
    const element = document.getElementById(id);
    if (!element) return false;

    element.scrollIntoView(options);
    cancel();
    return true;
  };

  window.addEventListener("wheel", cancelOnUserScroll, { passive: true });
  window.addEventListener("touchstart", cancelOnUserScroll, { passive: true });

  RETRY_DELAYS_MS.forEach((delay, index) => {
    timers.push(
      window.setTimeout(() => {
        tryScroll();
        if (!cancelled && index === RETRY_DELAYS_MS.length - 1) {
          cancel();
        }
      }, delay),
    );
  });

  return cancel;
}
