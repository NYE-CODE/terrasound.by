import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminListToolbar } from "../components/molecules/AdminListToolbar";
import { BrandFilter, CategoryFilter, StockFilter, type StockFilterValue } from "../components/molecules/ProductFilters";
import { PageHeader } from "../components/PageHeader";
import { RowActions } from "../components/RowActions";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { PAGE_SIZE } from "../hooks/usePagination";
import { reportActionError, reportLoadError } from "../lib/formError";
import { api, type AdminProduct, type Brand, type CategoryAdmin } from "../lib/api";

const emptyFilters = {
  search: "",
  category: "",
  brand: "",
  inStock: "" as StockFilterValue,
};

export function ProductsPage() {
  const navigate = useNavigate();
  const { status } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<CategoryAdmin[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState(emptyFilters.search);
  const [category, setCategory] = useState(emptyFilters.category);
  const [brand, setBrand] = useState(emptyFilters.brand);
  const [inStock, setInStock] = useState<StockFilterValue>(emptyFilters.inStock);
  const debouncedSearch = useDebouncedValue(search);
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const filterSignature = [debouncedSearch, category, brand, inStock].join("\0");
  const prevFilterSignature = useRef(filterSignature);

  const listParams = {
    q: debouncedSearch || undefined,
    category: category || undefined,
    brand: brand || undefined,
    inStock: inStock === "" ? undefined : inStock === "true",
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    Promise.all([api.categories(), api.brands()])
      .then(([categoryItems, brandItems]) => {
        setCategories(categoryItems);
        setBrands(brandItems);
      })
      .catch(reportLoadError);
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;

    if (prevFilterSignature.current !== filterSignature) {
      prevFilterSignature.current = filterSignature;
      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    const offset = (page - 1) * PAGE_SIZE;
    api
      .products({ limit: PAGE_SIZE, offset, ...listParams })
      .then((result) => {
        setProducts(result.data);
        setTotalItems(result.meta.total);
      })
      .catch(reportLoadError);
  }, [status, page, filterSignature]);

  const remove = async (productId: string) => {
    if (status !== "authenticated" || !confirm("Удалить товар?")) return;
    try {
      await api.deleteProduct(productId);
      const offset = (page - 1) * PAGE_SIZE;
      const result = await api.products({ limit: PAGE_SIZE, offset, ...listParams });
      setProducts(result.data);
      setTotalItems(result.meta.total);
      if (result.data.length === 0 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      reportActionError(error);
    }
  };

  const duplicate = async (productId: string) => {
    if (status !== "authenticated") return;
    setDuplicatingId(productId);
    try {
      const copy = await api.duplicateProduct(productId);
      navigate(`/products/${copy.id}/edit`);
    } catch (error) {
      reportActionError(error);
    } finally {
      setDuplicatingId(null);
    }
  };

  const resetFilters = () => {
    setSearch(emptyFilters.search);
    setCategory(emptyFilters.category);
    setBrand(emptyFilters.brand);
    setInStock(emptyFilters.inStock);
  };

  const exportCsv = async () => {
    if (status !== "authenticated") return;
    setExporting(true);
    try {
      await api.exportProducts(listParams);
    } catch (error) {
      reportActionError(error, "Не удалось экспортировать товары.");
    } finally {
      setExporting(false);
    }
  };

  const categoryNames = Object.fromEntries(categories.map((item) => [item.id, item.name]));

  return (
    <div>
      <PageHeader title="Товары" createTo="/products/new" createLabel="Добавить товар" />

      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Название, бренд, ID, характеристики…"
        onReset={resetFilters}
        totalItems={totalItems}
        totalLabel="Найдено товаров"
        showDateRange={false}
        onExport={exportCsv}
        exporting={exporting}
      >
        <CategoryFilter value={category} onChange={setCategory} categories={categories} />
        <BrandFilter value={brand} onChange={setBrand} brands={brands} />
        <StockFilter value={inStock} onChange={setInStock} />
      </AdminListToolbar>

      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-heading">{product.brand} {product.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                    product.inStock
                      ? "bg-[#22c55e22] text-[#86efac]"
                      : "bg-[#E4AF0022] text-[#ffb07a]"
                  }`}
                >
                  {product.inStock ? "В наличии" : "Под заказ"}
                </span>
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">
                {product.salePrice != null && product.salePrice < product.price ? (
                  <>
                    <span className="text-[var(--accent)]">{product.salePrice} BYN</span>
                    <span className="text-xs ml-1">(со скидкой)</span>
                    <span className="line-through ml-2">{product.price} BYN</span>
                    <span className="text-xs ml-1">(обычная)</span>
                  </>
                ) : (
                  <>{product.price} BYN</>
                )}
                {" · "}
                {categoryNames[product.category] ?? product.category}
              </div>
            </div>
            <RowActions
              editTo={`/products/${product.id}/edit`}
              onDuplicate={() => duplicate(product.id)}
              duplicating={duplicatingId === product.id}
              onDelete={() => remove(product.id)}
            />
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-[var(--muted-foreground)]">Товары не найдены</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </div>
  );
}
