import { useEffect } from "react";
import { SITE_NAME, SITE_ORIGIN, SITE_ICONS } from "../lib/site";

interface PageMetaOptions {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "product";
  /** По умолчанию true. false — noindex для корзины, оформления и т.п. */
  indexable?: boolean;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let element = document.querySelector(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export function usePageMeta({
  title,
  description,
  path = "",
  image,
  type = "website",
  indexable = true,
}: PageMetaOptions) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const url = `${SITE_ORIGIN}${path}`;
    const ogImage = image
      ? image.startsWith("http")
        ? image
        : `${SITE_ORIGIN}${image.startsWith("/") ? image : `/${image}`}`
      : `${SITE_ORIGIN}${SITE_ICONS.ogImage}`;
    const robots = indexable ? "index, follow" : "noindex, nofollow";

    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", robots);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", ogImage);

    if (indexable) {
      upsertLink("canonical", url);
    }
  }, [title, description, path, image, type, indexable]);
}
