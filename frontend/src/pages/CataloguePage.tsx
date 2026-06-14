import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { ProductCard } from "../components/organisms/ProductCard";
import { CatalogueFiltersDrawer } from "../components/organisms/CatalogueFiltersDrawer";
import {
  CatalogueFiltersPanel,
  appendPriceQueryParams,
  availabilityToQuery,
  countActiveFilters,
  type AvailabilityOption,
} from "../components/organisms/CatalogueFiltersPanel";
import { buildAttributeQuery, type AttributeFilterState } from "../components/organisms/AttributeFilters";
import { Pagination } from "../components/molecules/Pagination";
import { CatalogueSortSelect } from "../components/molecules/CatalogueSortSelect";
import { SlidersHorizontal } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import { api, type CategoryFilters, type ProductCard as ProductCardData } from "../lib/api";
import { useCategories } from "../context/CategoriesContext";
import { reportLoadError } from "../lib/loadError";
import { pageContentPy, pageTopOffsetClass, stickyBelowHeaderClass } from "../lib/pageLayout";

const PAGE_SIZE = 9;

export function CataloguePage() {
  const categories = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get("category") ?? "";

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const selectedCategory = categorySlug || "all";
  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, 0]);
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilters | null>(null);
  const [categoryFiltersReady, setCategoryFiltersReady] = useState(true);
  const [attributeFilters, setAttributeFilters] = useState<AttributeFilterState>({});
  const [availability, setAvailability] = useState<AvailabilityOption[]>([]);
  const [sortBy, setSortBy] = useState("popularity");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const activeCategoryName = categories.find((c) => c.id === selectedCategory)?.name;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const showPriceFilter = priceBounds[1] > priceBounds[0];
  const productsLoading = selectedCategory !== "all" && !categoryFiltersReady;

  usePageMeta({
    title: activeCategoryName ?? "Каталог",
    description: activeCategoryName
      ? `${activeCategoryName} — премиальное автозвуковое оборудование в Гродно. TerraSound.`
      : "Каталог премиального автозвукового оборудования в Гродно. Акустика, сабвуферы, усилители, установка.",
    path: selectedCategory !== "all" ? `/catalogue?category=${selectedCategory}` : "/catalogue",
  });

  useEffect(() => {
    api.getProductBrands().then(setBrands).catch(reportLoadError);
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setCategoryFilters(null);
      setAttributeFilters({});
      setCategoryFiltersReady(true);

      api
        .getCatalogPriceBounds()
        .then(({ priceMin, priceMax }) => {
          const nextBounds: [number, number] = [priceMin, priceMax];
          setPriceBounds(nextBounds);
          setPriceRange(nextBounds);
        })
        .catch(reportLoadError);
      return;
    }

    setCategoryFiltersReady(false);
    setCategoryFilters(null);
    setAttributeFilters({});
    setProducts([]);
    setTotalItems(0);

    api
      .getCategoryFilters(selectedCategory)
      .then((config) => {
        setCategoryFilters(config);
        const nextBounds: [number, number] = [config.priceMin, config.priceMax];
        setPriceBounds(nextBounds);
        setPriceRange(nextBounds);
      })
      .catch(reportLoadError)
      .finally(() => setCategoryFiltersReady(true));
  }, [selectedCategory]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedBrands, availability, priceRange, sortBy, attributeFilters]);

  useEffect(() => {
    if (!categoryFiltersReady) return;

    const inStock = availabilityToQuery(availability);
    const params: Parameters<typeof api.getProducts>[0] = {
      sort: sortBy,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      attrQuery: buildAttributeQuery(attributeFilters),
    };
    appendPriceQueryParams(params, priceRange, priceBounds);
    if (inStock) params.inStock = inStock;
    if (selectedCategory !== "all") params.category = selectedCategory;
    if (selectedBrands.length > 0) params.brands = selectedBrands;

    api
      .getProducts(params)
      .then(({ data, meta }) => {
        setProducts(data);
        setTotalItems(meta.total);
      })
      .catch(reportLoadError);
  }, [
    selectedCategory,
    selectedBrands,
    availability,
    priceRange,
    priceBounds,
    sortBy,
    page,
    attributeFilters,
    categoryFiltersReady,
  ]);

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilterCount = countActiveFilters(
    selectedCategory,
    selectedBrands,
    availability,
    priceRange,
    priceBounds[1],
    attributeFilters,
    priceBounds[0],
  );

  const selectCategory = (id: string) => {
    if (id === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: id });
    }
  };

  const filterPanelProps = {
    categories,
    brands,
    selectedCategory,
    onCategoryChange: selectCategory,
    selectedBrands,
    onBrandsChange: setSelectedBrands,
    availability,
    onAvailabilityChange: setAvailability,
    priceRange,
    priceBounds,
    onPriceRangeChange: setPriceRange,
    categoryFilters,
    attributeFilters,
    onAttributeFiltersChange: setAttributeFilters,
    showPriceFilter,
  };

  return (
    <div className={`${pageTopOffsetClass} min-h-screen`}>
      <div className={`max-w-[1400px] mx-auto px-6 ${pageContentPy}`}>
        <div className="mb-6 lg:mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl mb-4">
            {activeCategoryName ?? "Каталог"}
          </h1>
          <p className="text-muted-foreground">Премиальное автозвуковое оборудование для энтузиастов</p>
        </div>

        {!filtersOpen && (
          <div className={`lg:hidden sticky ${stickyBelowHeaderClass} z-50 -mx-6 px-6 py-3 mb-3 bg-background border-b border-border`}>
            <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="h-11 px-4 bg-input border border-border rounded flex items-center justify-center gap-2 text-sm font-heading uppercase tracking-wider transition-colors duration-300 hover:border-accent/50"
            >
              <SlidersHorizontal size={16} />
              Фильтры
              {activeFilterCount > 0 && (
                <span className="min-w-5 h-5 px-1.5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <CatalogueSortSelect value={sortBy} onChange={setSortBy} compact className="w-full" />
            </div>
          </div>
        )}

        <CatalogueFiltersDrawer
          isOpen={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          totalItems={totalItems}
          {...filterPanelProps}
        />

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-card border border-card-border rounded p-6 sticky top-32">
              <CatalogueFiltersPanel {...filterPanelProps} />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="hidden lg:flex items-center justify-between gap-4 mb-6">
              <div className="text-muted-foreground">{totalItems} товаров</div>
              <div className="shrink-0">
                <CatalogueSortSelect value={sortBy} onChange={setSortBy} />
              </div>
            </div>

            <div className="lg:hidden text-muted-foreground text-sm mb-4">
              {totalItems} товаров
            </div>

            {productsLoading ? (
              <div className="text-center py-16 text-muted-foreground">Загрузка...</div>
            ) : totalItems === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                Товары не найдены
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}

            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
