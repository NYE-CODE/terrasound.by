import { getPrerenderSnapshot } from "../lib/prerenderSnapshot";

/**
 * Показывает prerender-разметку, пока lazy-страница грузится.
 */
export function SsgRouteFallback() {
  const snapshot = getPrerenderSnapshot();

  if (!snapshot) {
    return null;
  }

  return (
    <main
      id="ssg-prerender"
      data-prerender={snapshot.prerender}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: snapshot.html }}
    />
  );
}
