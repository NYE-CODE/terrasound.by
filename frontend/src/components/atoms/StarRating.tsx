import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  showValue?: boolean;
  className?: string;
}

export function StarRating({ rating, max = 5, size = 14, showValue = false, className = "" }: StarRatingProps) {
  const safeRating = Number.isFinite(rating) ? Math.min(max, Math.max(0, rating)) : 0;
  const filledStars = Math.round(safeRating);

  return (
    <div className={`flex items-center gap-1 ${className}`.trim()}>
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, index) => (
          <Star
            key={index}
            size={size}
            fill={index < filledStars ? "var(--accent)" : "transparent"}
            stroke="var(--accent)"
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs text-muted-foreground">{safeRating.toFixed(1)}</span>
      )}
    </div>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const star = index + 1;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5 text-accent hover:scale-110 transition-transform"
            aria-label={`Оценка ${star}`}
          >
            <Star
              size={22}
              fill={star <= value ? "var(--accent)" : "transparent"}
              stroke="var(--accent)"
            />
          </button>
        );
      })}
    </div>
  );
}
