
import { Spinner } from '@/components/ui/spinner';
import { Review } from './Review';
import { Review as ReviewType } from './types';

interface ReviewsListProps {
  reviews: ReviewType[];
  loading: boolean;
}

export const ReviewsList = ({ reviews, loading }: ReviewsListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        لا توجد تقييمات بعد
      </div>
    );
  }

  return (
    <div>
      {reviews.map((review) => (
        <Review key={review.id} review={review} />
      ))}
    </div>
  );
};
