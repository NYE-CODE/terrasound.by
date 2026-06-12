import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { PAGE_SIZE } from "../hooks/usePagination";
import { reportActionError, reportLoadError} from "../lib/formError";
import { api, type ServiceReview } from "../lib/api";

export function ServiceReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const load = () => {
    if (!token) return;
    const offset = (page - 1) * PAGE_SIZE;
    api
      .serviceReviews(token, { limit: PAGE_SIZE, offset })
      .then((result) => {
        setReviews(result.data);
        setTotalItems(result.meta.total);
      })
      .catch(reportLoadError);
  };

  useEffect(load, [token, page]);

  const togglePublished = async (review: ServiceReview) => {
    if (!token) return;
    try {
      await api.updateServiceReview(token, review.id, { published: !review.published });
      load();
    } catch (error) {
      reportActionError(error, "Не удалось изменить статус публикации.");
    }
  };

  const remove = async (reviewId: string) => {
    if (!token || !confirm("Удалить отзыв?")) return;
    try {
      await api.deleteServiceReview(token, reviewId);
      load();
    } catch (error) {
      reportActionError(error);
    }
  };

  return (
    <div>
      <PageHeader title="Отзывы о магазине" createTo="/reviews/service/new" createLabel="Добавить отзыв" />

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-[var(--card)] border border-[var(--card-border)] rounded-lg p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="font-heading">{review.author}</div>
                {review.car && <div className="text-sm text-[var(--muted-foreground)]">{review.car}</div>}
              </div>
              <div className="flex gap-3">
                <button onClick={() => togglePublished(review)} className="text-sm text-[var(--accent)] hover:underline">
                  {review.published ? "Скрыть" : "Показать"}
                </button>
                <button
                  type="button"
                  title="Удалить"
                  aria-label="Удалить"
                  onClick={() => remove(review.id)}
                  className="p-2 rounded text-[var(--muted-foreground)] hover:bg-[#222] hover:text-[var(--destructive)] transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-sm">{"★".repeat(review.rating)}</p>
            <p className="text-sm mt-2">{review.text}</p>
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
