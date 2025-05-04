
import { useAuth } from '@/hooks/auth';
import { useReviews } from '@/hooks/useReviews';
import { Review } from '@/components/reviews/Review';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewsSummary } from '@/components/reviews/ReviewsSummary';
import { ReviewsList } from '@/components/reviews/ReviewsList';

const CraftsmanReviewsTab = ({ craftsmanId }: { craftsmanId: string }) => {
  const { user } = useAuth();
  const { reviews, loading, averageRating, reviewsCount, refreshReviews } = useReviews(craftsmanId);

  const summary = {
    averageRating,
    reviewsCount
  };

  return (
    <div>
      <ReviewsSummary summary={summary} />
      {user && <ReviewForm craftsmanId={craftsmanId} onReviewSubmit={refreshReviews} />}
      <ReviewsList reviews={reviews} loading={loading} />
    </div>
  );
};

export default CraftsmanReviewsTab;
