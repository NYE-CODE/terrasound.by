export type PrerenderSnapshot = {
  prerender: string;
  html: string;
};

let snapshot: PrerenderSnapshot | null = null;

export function capturePrerenderSnapshot(root: ParentNode): PrerenderSnapshot | null {
  if (snapshot) return snapshot;

  const element = root.querySelector("main#ssg-prerender");
  if (!element) return null;

  snapshot = {
    prerender: element.getAttribute("data-prerender") ?? "page",
    html: element.innerHTML,
  };
  return snapshot;
}

export function getPrerenderSnapshot(): PrerenderSnapshot | null {
  return snapshot;
}
