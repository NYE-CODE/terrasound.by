import { Link } from "react-router-dom";

interface FormActionsProps {
  cancelTo: string;
  submitLabel: string;
  isSubmitting?: boolean;
}

export function FormActions({ cancelTo, submitLabel, isSubmitting }: FormActionsProps) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 px-6 bg-[var(--accent)] text-[#0e0e0f] font-medium rounded disabled:opacity-60"
      >
        {submitLabel}
      </button>
      <Link
        to={cancelTo}
        className="h-11 px-6 border border-[var(--border)] rounded inline-flex items-center hover:bg-[#222] transition-colors"
      >
        Отмена
      </Link>
    </div>
  );
}
