import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { RowActions } from "../components/RowActions";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { usePagination } from "../hooks/usePagination";
import { api, type AdminProduct, type CategoryAdmin } from "../lib/api";

export function ProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});
  const { paginatedItems, page, totalPages, setPage, totalItems, pageSize } = usePagination(products);

  const load = () => {
    if (!token) return;
    api.products(token).then(setProducts).catch(console.error);
  };

  useEffect(load, [token]);

  useEffect(() => {
    if (!token) return;
    api.categories(token).then((items) => {
      setCategoryNames(Object.fromEntries(items.map((c: CategoryAdmin) => [c.id, c.name])));
    }).catch(console.error);
  }, [token]);

  const remove = async (productId: string) => {
    if (!token || !confirm("Удалить товар?")) return;
    await api.deleteProduct(token, productId);
    load();
  };

  return (
    <div>
      <PageHeader title="Товары" createTo="/products/new" createLabel="Добавить товар" />

      <div className="space-y-3">
        {paginatedItems.map((product) => (
          <div key={product.id} className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-heading">{product.brand} {product.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                    product.inStock
                      ? "bg-[#22c55e22] text-[#86efac]"
                      : "bg-[#d4621a22] text-[#ffb07a]"
                  }`}
                >
                  {product.inStock ? "В наличии" : "Под заказ"}
                </span>
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">
                {product.salePrice != null && product.salePrice < product.price ? (
                  <>
                    <span className="text-[var(--accent)]">{product.salePrice} BYN</span>
                    <span className="line-through ml-2">{product.price} BYN</span>
                  </>
                ) : (
                  <>{product.price} BYN</>
                )}
                {" · "}
                {categoryNames[product.category] ?? product.category}
              </div>
            </div>
            <RowActions editTo={`/products/${product.id}/edit`} onDelete={() => remove(product.id)} />
          </div>
        ))}
        {products.length === 0 && (
          <p className="text-[var(--muted-foreground)]">Товаров пока нет</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={pageSize} onPageChange={setPage} />
    </div>
  );
}
