import type { ProductReview, ServiceReview } from "@terrasound/shared";
import { StarRating } from "../atoms/StarRating";
import { formatReviewDate } from "../../utils/formatReviewDate";

export type ReviewCardProps =
  | { variant: "product"; review: ProductReview }
  | { variant: "service"; review: ServiceReview };

export function ReviewCard(props: ReviewCardProps) {
  if (props.variant === "product") {
    const { review } = props;

    return (
      <div className="bg-card border border-card-border rounded p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <StarRating rating={review.rating} size={14} />
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {review.published === false && (
              <span className="text-xs uppercase tracking-wider text-accent">На модерации</span>
            )}
            <span>{formatReviewDate(review.createdAt)}</span>
          </div>
        </div>
        <p className="mb-4">{review.text}</p>
        <div className="font-heading text-sm text-accent">{review.author}</div>
      </div>
    );
  }

  const { review } = props;

  return (
    <div className="bg-card border border-card-border rounded p-6">
      <StarRating rating={review.rating} size={16} />
      <p className="my-6 text-foreground">{review.text}</p>
      <div className="text-sm">
        <div className="font-heading text-accent">{review.author}</div>
        {review.car && <div className="text-muted-foreground">{review.car}</div>}
      </div>
    </div>
  );
}
