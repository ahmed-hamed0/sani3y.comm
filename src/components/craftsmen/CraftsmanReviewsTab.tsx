
import { Star } from 'lucide-react';
import { Craftsman } from '@/types/craftsman';

interface CraftsmanReviewsTabProps {
  craftsman: Craftsman;
}

export const CraftsmanReviewsTab = ({ craftsman }: CraftsmanReviewsTabProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">تقييمات العملاء السابقين</h2>
      
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Star className="h-12 w-12 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500">لا توجد تقييمات حتى الآن</p>
      </div>
    </div>
  );
};
