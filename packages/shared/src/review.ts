export interface ProductReview {
  id: string;
  productId: string;
  author: string;
  email?: string;
  text: string;
  rating: number;
  createdAt: string;
  published?: boolean;
}

export interface ServiceReview {
  id: string;
  author: string;
  car?: string;
  rating: number;
  text: string;
  createdAt: string;
  published: boolean;
}

export function getPublishedReviews<T extends { published: boolean }>(reviews: T[]): T[] {
  return reviews.filter((review) => review.published);
}
