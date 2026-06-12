import { Link } from "react-router-dom";
import { Copy, Pencil, Trash2 } from "lucide-react";

const iconButtonClass =
  "p-2 rounded text-[var(--muted-foreground)] hover:bg-[#222] transition-colors";

interface RowActionsProps {
  editTo: string;
  onDelete: () => void;
  onDuplicate?: () => void;
  duplicating?: boolean;
}

export function RowActions({ editTo, onDelete, onDuplicate, duplicating }: RowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Link
        to={editTo}
        title="Изменить"
        aria-label="Изменить"
        className={`${iconButtonClass} hover:text-[var(--accent)]`}
      >
        <Pencil size={16} />
      </Link>
      {onDuplicate && (
        <button
          type="button"
          title="Дублировать"
          aria-label="Дублировать"
          onClick={onDuplicate}
          disabled={duplicating}
          className={`${iconButtonClass} hover:text-[var(--accent)] disabled:opacity-40`}
        >
          <Copy size={16} />
        </button>
      )}
      <button
        type="button"
        title="Удалить"
        aria-label="Удалить"
        onClick={onDelete}
        className={`${iconButtonClass} hover:text-[var(--destructive)]`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
