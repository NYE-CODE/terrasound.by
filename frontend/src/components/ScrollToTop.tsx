import { useEffect } from "react";
import { useLocation } from "react-router";
import { scrollToHash } from "../lib/scrollToHash";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    return scrollToHash(hash);
  }, [pathname, hash]);

  return null;
}
