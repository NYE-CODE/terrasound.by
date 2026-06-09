interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) {
  if (totalItems === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-[var(--border)]">
      <div className="text-sm text-[var(--muted-foreground)]">
        {from}–{to} из {totalItems}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-9 px-3 rounded border border-[var(--border)] text-sm disabled:opacity-40 hover:bg-[#222] transition-colors"
        >
          Назад
        </button>
        <span className="text-sm text-[var(--muted-foreground)] min-w-[4rem] text-center">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-9 px-3 rounded border border-[var(--border)] text-sm disabled:opacity-40 hover:bg-[#222] transition-colors"
        >
          Вперёд
        </button>
      </div>
    </div>
  );
}
