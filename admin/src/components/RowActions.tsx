import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

const iconButtonClass =
  "p-2 rounded text-[var(--muted-foreground)] hover:bg-[#222] transition-colors";

interface RowActionsProps {
  editTo: string;
  onDelete: () => void;
}

export function RowActions({ editTo, onDelete }: RowActionsProps) {
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
