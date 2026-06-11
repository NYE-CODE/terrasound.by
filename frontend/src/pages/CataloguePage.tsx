import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { ProductCard } from "../components/organisms/ProductCard";
import { CatalogueFiltersDrawer } from "../components/organisms/CatalogueFiltersDrawer";
import { CatalogueFiltersPanel, availabilityToQuery, countActiveFilters, type AvailabilityOption } from "../components/organisms/CatalogueFiltersPanel";
import { buildAttributeQuery, type AttributeFilterState } from "../components/organisms/AttributeFilters";
import { Pagination } from "../components/molecules/Pagination";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta";
import { api, type Category, type CategoryFilters, type ProductCard as ProductCardData } from "../lib/api";

const PAGE_SIZE = 9;
const DEFAULT_PRICE_MAX = 5000;

export function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get("category") ?? "";

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const selectedCategory = categorySlug || "all";
  const [priceBounds, setPriceBounds] = useState<[number, number]>([0, DEFAULT_PRICE_MAX]);
  const [priceRange, setPriceRange] = useState([0, DEFAULT_PRICE_MAX]);
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilters | null>(null);
  const [attributeFilters, setAttributeFilters] = useState<AttributeFilterState>({});
  const [availability, setAvailability] = useState<AvailabilityOption[]>([]);
  const [sortBy, setSortBy] = useState("popularity");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const activeCategoryName = categories.find((c) => c.id === selectedCategory)?.name;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  usePageMeta({
    title: activeCategoryName ?? "Каталог",
    description: activeCategoryName
      ? `${activeCategoryName} — премиальное автозвуковое оборудование в Гродно. TerraSound.`
      : "Каталог премиального автозвукового оборудования в Гродно. Акустика, сабвуферы, усилители, установка.",
    path: selectedCategory !== "all" ? `/catalogue?category=${selectedCategory}` : "/catalogue",
  });

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
    api.getProductBrands().then(setBrands).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setCategoryFilters(null);
      setAttributeFilters({});
      setPriceBounds([0, DEFAULT_PRICE_MAX]);
      setPriceRange([0, DEFAULT_PRICE_MAX]);
      return;
    }

    api
      .getCategoryFilters(selectedCategory)
      .then((config) => {
        setCategoryFilters(config);
        setAttributeFilters({});
        const nextBounds: [number, number] = [config.priceMin, config.priceMax];
        setPriceBounds(nextBounds);
        setPriceRange(nextBounds);
      })
      .catch(console.error);
  }, [selectedCategory]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedBrands, availability, priceRange, sortBy, attributeFilters]);

  useEffect(() => {
    const inStock = availabilityToQuery(availability);
    const params: Parameters<typeof api.getProducts>[0] = {
      priceMin: priceRange[0],
      priceMax: priceRange[1],
      sort: sortBy,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      attrQuery: buildAttributeQuery(attributeFilters),
    };
    if (inStock) params.inStock = inStock;
    if (selectedCategory !== "all") params.category = selectedCategory;
    if (selectedBrands.length > 0) params.brands = selectedBrands;

    api
      .getProducts(params)
      .then(({ items, total }) => {
        setProducts(items);
        setTotalItems(total);
      })
      .catch(console.error);
  }, [selectedCategory, selectedBrands, availability, priceRange, sortBy, page, attributeFilters]);

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
  };

  return (
    <div className="pt-[var(--site-header-height)] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="mb-6 lg:mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl mb-4">
            {activeCategoryName ?? "Каталог"}
          </h1>
          <p className="text-muted-foreground">Премиальное автозвуковое оборудование для энтузиастов</p>
        </div>

        {!filtersOpen && (
          <div className="lg:hidden sticky top-[var(--site-header-height)] z-[60] -mx-6 px-6 py-3 mb-3 bg-background border-b border-border">
            <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex-1 h-11 px-4 bg-card border border-card-border rounded flex items-center justify-center gap-2 text-sm font-heading uppercase tracking-wider"
            >
              <SlidersHorizontal size={16} />
              Фильтры
              {activeFilterCount > 0 && (
                <span className="min-w-5 h-5 px-1.5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div className="relative flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-11 px-4 bg-input border border-border rounded text-sm appearance-none cursor-pointer pr-10"
              >
                <option value="popularity">По названию</option>
                <option value="rating">По рейтингу</option>
                <option value="price-low">Цена ↑</option>
                <option value="price-high">Цена ↓</option>
                <option value="new">Новинки</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} />
            </div>
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
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 px-4 bg-input border border-border rounded text-sm appearance-none cursor-pointer pr-10"
                >
                  <option value="popularity">По названию</option>
                  <option value="rating">По рейтингу</option>
                  <option value="price-low">Цена: по возрастанию</option>
                  <option value="price-high">Цена: по убыванию</option>
                  <option value="new">Новинки</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="lg:hidden text-muted-foreground text-sm mb-4">
              {totalItems} товаров
            </div>

            {totalItems === 0 ? (
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
