import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { RowActions } from "../components/RowActions";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { PAGE_SIZE } from "../hooks/usePagination";
import { reportActionError, reportLoadError} from "../lib/formError";
import { api, type AdminProduct, type CategoryAdmin } from "../lib/api";

export function ProductsPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const load = () => {
    if (!token) return;
    const offset = (page - 1) * PAGE_SIZE;
    api
      .products(token, { limit: PAGE_SIZE, offset })
      .then((result) => {
        setProducts(result.data);
        setTotalItems(result.meta.total);
      })
      .catch(reportLoadError);
  };

  useEffect(load, [token, page]);

  useEffect(() => {
    if (!token) return;
    api.categories(token).then((items) => {
      setCategoryNames(Object.fromEntries(items.map((c: CategoryAdmin) => [c.id, c.name])));
    }).catch(reportLoadError);
  }, [token]);

  const remove = async (productId: string) => {
    if (!token || !confirm("Удалить товар?")) return;
    try {
      await api.deleteProduct(token, productId);
      load();
    } catch (error) {
      reportActionError(error);
    }
  };

  const duplicate = async (productId: string) => {
    if (!token) return;
    setDuplicatingId(productId);
    try {
      const copy = await api.duplicateProduct(token, productId);
      navigate(`/products/${copy.id}/edit`);
    } catch (error) {
      reportActionError(error);
    } finally {
      setDuplicatingId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Товары" createTo="/products/new" createLabel="Добавить товар" />

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
          <p className="text-[var(--muted-foreground)]">Товаров пока нет</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </div>
  );
}
