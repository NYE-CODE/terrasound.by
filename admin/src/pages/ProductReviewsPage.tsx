import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { PAGE_SIZE } from "../hooks/usePagination";
import { reportActionError, reportLoadError} from "../lib/formError";
import { api, type ProductReview } from "../lib/api";
import { maskEmail } from "../lib/maskEmail";

export function ProductReviewsPage() {
  const { status } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [revealedEmails, setRevealedEmails] = useState<Record<string, boolean>>({});
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const load = () => {
    if (status !== "authenticated") return;
    const offset = (page - 1) * PAGE_SIZE;
    api
      .productReviews({ limit: PAGE_SIZE, offset })
      .then((result) => {
        setReviews(result.data);
        setTotalItems(result.meta.total);
      })
      .catch(reportLoadError);
  };

  useEffect(load, [status, page]);

  const togglePublished = async (review: ProductReview) => {
    if (status !== "authenticated") return;
    try {
      await api.updateProductReview(review.id, !review.published);
      load();
    } catch (error) {
      reportActionError(error, "Не удалось изменить статус публикации.");
    }
  };

  return (
    <div>
      <PageHeader title="Отзывы о товарах" />

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="font-heading">{review.author}</div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  Товар #{review.productId}
                  {review.email && (
                    <>
                      {" · "}
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedEmails((prev) => ({
                            ...prev,
                            [review.id]: !prev[review.id],
                          }))
                        }
                        className="hover:text-[var(--accent)] transition-colors"
                      >
                        {revealedEmails[review.id] ? review.email : maskEmail(review.email)}
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    review.published
                      ? "bg-[#22c55e33] text-[#86efac]"
                      : "bg-[#E4AF0033] text-[#ffb07a]"
                  }`}
                >
                  {review.published ? "Опубликован" : "На модерации"}
                </span>
                <button
                  onClick={() => togglePublished(review)}
                  className="text-sm text-[var(--accent)] hover:underline"
                >
                  {review.published ? "Снять с публикации" : "Опубликовать"}
                </button>
              </div>
            </div>
            <div className="text-sm text-[var(--accent)] mb-2">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
            <p className="text-sm mb-2">{review.text}</p>
            <div className="text-xs text-[var(--muted-foreground)]">
              {new Date(review.createdAt).toLocaleString("ru-RU")}
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-[var(--muted-foreground)]">Отзывов пока нет</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </div>
  );
}
