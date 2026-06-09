import { Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  backTo?: string;
  backLabel?: string;
  createTo?: string;
  createLabel?: string;
}

export function PageHeader({ title, backTo, backLabel = "Назад к списку", createTo, createLabel }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        {backTo && (
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-3 transition-colors"
          >
            <ArrowLeft size={16} />
            {backLabel}
          </Link>
        )}
        <h1 className="font-heading text-3xl">{title}</h1>
      </div>
      {createTo && createLabel && (
        <Link
          to={createTo}
          className="inline-flex items-center gap-2 h-11 px-4 bg-[var(--accent)] text-[#0e0e0f] font-medium rounded text-sm shrink-0"
        >
          <Plus size={16} />
          {createLabel}
        </Link>
      )}
    </div>
  );
}
