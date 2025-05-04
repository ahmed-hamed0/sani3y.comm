
export interface Review {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer_id: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
}

export interface ReviewsSummary {
  averageRating: number | null;
  reviewsCount: number;
}
