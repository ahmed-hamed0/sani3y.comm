
import { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { Craftsman } from '@/types/craftsman';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  reviewer: {
    name: string;
    avatar?: string;
  };
}

interface CraftsmanReviewsTabProps {
  craftsman: Craftsman;
}

export const CraftsmanReviewsTab = ({ craftsman }: CraftsmanReviewsTabProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            rating,
            comment,
            created_at,
            reviewer_id,
            profiles:profiles!reviewer_id(
              full_name,
              avatar_url
            )
          `)
          .eq('reviewed_id', craftsman.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching reviews:', error);
          return;
        }
        
        if (data && data.length > 0) {
          const formattedReviews = data.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            createdAt: new Date(review.created_at),
            reviewer: {
              name: review.profiles?.full_name || 'مستخدم غير معروف',
              avatar: review.profiles?.avatar_url
            }
          }));
          
          setReviews(formattedReviews);
        }
      } catch (err) {
        console.error('Error in fetchReviews:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [craftsman.id]);

  // Helper function to generate stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  // Helper function to format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">تقييمات العملاء السابقين</h2>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="md" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map(review => (
            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
              <div className="flex items-start gap-4">
                <img
                  src={review.reviewer.avatar || '/placeholder.svg'}
                  alt={review.reviewer.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{review.reviewer.name}</h3>
                    <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                  </div>
                  
                  <div className="flex mb-2">
                    {renderStars(review.rating)}
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">لا توجد تقييمات حتى الآن</p>
        </div>
      )}
    </div>
  );
};
