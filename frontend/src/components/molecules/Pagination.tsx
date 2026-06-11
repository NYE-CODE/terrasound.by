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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border">
      <div className="text-sm text-muted-foreground">
        {from}–{to} из {totalItems}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-10 px-4 rounded border border-border text-sm font-heading uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent hover:text-accent transition-colors cursor-pointer"
        >
          Назад
        </button>
        <span className="text-sm text-muted-foreground min-w-[4rem] text-center">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-10 px-4 rounded border border-border text-sm font-heading uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent hover:text-accent transition-colors cursor-pointer"
        >
          Вперёд
        </button>
      </div>
    </div>
  );
}
