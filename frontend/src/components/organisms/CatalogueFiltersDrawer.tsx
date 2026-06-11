import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../atoms/Button";
import { CatalogueFiltersPanel } from "./CatalogueFiltersPanel";
import type { AttributeFilterState } from "./AttributeFilters";
import type { Category, CategoryFilters } from "../../lib/api";

interface CatalogueFiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  totalItems: number;
  categories: Category[];
  brands: string[];
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
  priceRange: number[];
  priceBounds: [number, number];
  onPriceRangeChange: (range: number[]) => void;
  categoryFilters: CategoryFilters | null;
  attributeFilters: AttributeFilterState;
  onAttributeFiltersChange: (values: AttributeFilterState) => void;
}

export function CatalogueFiltersDrawer({
  isOpen,
  onClose,
  totalItems,
  categories,
  brands,
  selectedCategory,
  onCategoryChange,
  selectedBrands,
  onBrandsChange,
  priceRange,
  priceBounds,
  onPriceRangeChange,
  categoryFilters,
  attributeFilters,
  onAttributeFiltersChange,
}: CatalogueFiltersDrawerProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Фильтры каталога"
        >
          <motion.button
            type="button"
            aria-label="Закрыть фильтры"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-background/90 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="absolute bottom-0 left-0 right-0 max-h-[88vh] bg-card border-t border-card-border rounded-t-2xl flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="font-heading text-lg uppercase tracking-wider">Фильтры</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Закрыть"
                className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6 flex-1">
              <CatalogueFiltersPanel
                categories={categories}
                brands={brands}
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
                selectedBrands={selectedBrands}
                onBrandsChange={onBrandsChange}
                priceRange={priceRange}
                priceBounds={priceBounds}
                onPriceRangeChange={onPriceRangeChange}
                categoryFilters={categoryFilters}
                attributeFilters={attributeFilters}
                onAttributeFiltersChange={onAttributeFiltersChange}
              />
            </div>

            <div className="px-6 py-4 border-t border-border shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button variant="primary" className="w-full" onClick={onClose}>
                Показать {totalItems} товаров
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
