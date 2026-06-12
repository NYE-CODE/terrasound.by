import { useState } from "react";
import { formCardClass, inputClass } from "../lib/formStyles";
import { reportActionError } from "../lib/formError";
import { api, type CategoryAdmin } from "../lib/api";

interface CategoryDeleteDialogProps {
  category: CategoryAdmin;
  otherCategories: CategoryAdmin[];
  token: string;
  onClose: () => void;
  onDeleted: () => void;
}

export function CategoryDeleteDialog({
  category,
  otherCategories,
  token,
  onClose,
  onDeleted,
}: CategoryDeleteDialogProps) {
  const [moveToCategoryId, setMoveToCategoryId] = useState(otherCategories[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);

  const hasProducts = category.productCount > 0;
  const canMove = otherCategories.length > 0;

  const runDelete = async (strategy: "default" | "cascade" | "move") => {
    setSubmitting(true);
    try {
      if (strategy === "cascade") {
        const ok = confirm(
          `Удалить категорию «${category.name}» и все ${category.productCount} товар(ов)? Это действие нельзя отменить.`,
        );
        if (!ok) return;
      }
      if (strategy === "move") {
        if (!moveToCategoryId) {
          alert("Выберите категорию для переноса товаров.");
          return;
        }
        const target = otherCategories.find((item) => item.id === moveToCategoryId);
        const ok = confirm(
          `Перенести ${category.productCount} товар(ов) в «${target?.name ?? moveToCategoryId}» и удалить категорию «${category.name}»?`,
        );
        if (!ok) return;
      }

      await api.deleteCategory(token, category.id, {
        strategy: strategy === "default" ? undefined : strategy,
        moveToCategoryId: strategy === "move" ? moveToCategoryId : undefined,
      });
      onDeleted();
      onClose();
    } catch (error) {
      reportActionError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className={`${formCardClass} w-full max-w-lg space-y-4`} role="dialog" aria-modal="true">
        <h2 className="font-heading text-xl">Удалить категорию</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Категория: <span className="text-[var(--foreground)]">{category.name}</span>
          {hasProducts && (
            <>
              {" "}
              · в ней <span className="text-[var(--foreground)]">{category.productCount}</span> товар(ов)
            </>
          )}
        </p>

        {!hasProducts ? (
          <p className="text-sm">Категория пустая — товары не затронуты.</p>
        ) : (
          <div className="space-y-4">
            {canMove && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">Перенести товары в категорию</label>
                <select
                  value={moveToCategoryId}
                  onChange={(e) => setMoveToCategoryId(e.target.value)}
                  className={inputClass}
                  disabled={submitting}
                >
                  {otherCategories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={submitting || !moveToCategoryId}
                  onClick={() => runDelete("move")}
                  className="w-full h-11 rounded bg-[var(--accent)] text-[var(--accent-foreground)] font-heading text-sm uppercase tracking-wider disabled:opacity-50"
                >
                  Перенести и удалить категорию
                </button>
              </div>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={() => runDelete("cascade")}
              className="w-full h-11 rounded border border-[var(--destructive)] text-[var(--destructive)] font-heading text-sm uppercase tracking-wider hover:bg-[var(--destructive)]/10 disabled:opacity-50"
            >
              Удалить категорию и все товары
            </button>

            {!canMove && (
              <p className="text-xs text-[var(--muted-foreground)]">
                Других категорий нет — доступно только удаление вместе с товарами.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="h-11 px-5 rounded border border-[var(--border)] text-sm hover:bg-[#222] disabled:opacity-50"
          >
            Отмена
          </button>
          {!hasProducts && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => runDelete("default")}
              className="h-11 px-5 rounded bg-[var(--destructive)] text-white text-sm font-heading uppercase tracking-wider disabled:opacity-50"
            >
              Удалить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
