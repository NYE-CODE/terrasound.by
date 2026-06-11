const RETRY_DELAYS_MS = [0, 50, 150, 300, 500, 800, 1200, 2000];

export function scrollToHash(
  hash: string,
  options: ScrollIntoViewOptions = { behavior: "smooth", block: "start" },
): () => void {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) return () => {};

  const tryScroll = () => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView(options);
      return true;
    }
    return false;
  };

  tryScroll();

  const timers = RETRY_DELAYS_MS.map((delay) =>
    window.setTimeout(() => {
      tryScroll();
    }, delay),
  );

  return () => {
    timers.forEach((timer) => window.clearTimeout(timer));
  };
}
