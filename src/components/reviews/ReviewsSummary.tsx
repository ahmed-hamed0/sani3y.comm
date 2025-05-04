
import { ReviewsSummary as ReviewsSummaryType } from './types';

interface ReviewsSummaryProps {
  summary: ReviewsSummaryType;
}

export const ReviewsSummary = ({ summary }: ReviewsSummaryProps) => {
  const { averageRating, reviewsCount } = summary;
  
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center mb-2">
        <div className="text-3xl font-bold ml-2">
          {averageRating !== null ? averageRating.toFixed(1) : '-'}
        </div>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={`text-xl ${averageRating !== null && i < Math.floor(averageRating) ? 'text-yellow-500' : 'text-gray-300'}`}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <div className="text-sm text-gray-600">
        {reviewsCount} {reviewsCount === 1 ? 'تقييم' : 'تقييمات'}
      </div>
    </div>
  );
};
