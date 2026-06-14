import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type ProductHighlights } from "../lib/api";
import { reportLoadError } from "../lib/loadError";

const DEFAULT_PRODUCT_HIGHLIGHTS: ProductHighlights = {
  highlights: [
    "Бесплатная консультация перед покупкой",
    "Гарантия 2 года на всё оборудование",
    "Доступна профессиональная установка",
  ],
};

const ProductHighlightsContext = createContext<ProductHighlights>(DEFAULT_PRODUCT_HIGHLIGHTS);

export function ProductHighlightsProvider({ children }: { children: ReactNode }) {
  const [highlights, setHighlights] = useState<ProductHighlights>(DEFAULT_PRODUCT_HIGHLIGHTS);

  useEffect(() => {
    api.getProductHighlights().then(setHighlights).catch(reportLoadError);
  }, []);

  return (
    <ProductHighlightsContext.Provider value={highlights}>{children}</ProductHighlightsContext.Provider>
  );
}

export function useProductHighlights(): string[] {
  return useContext(ProductHighlightsContext).highlights;
}
