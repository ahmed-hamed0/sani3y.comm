import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { assertRPCResponse, assertStringParam } from '@/utils/supabaseTypes';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/hooks/auth';

// Review component
const Review = ({ review }: { review: any }) => {
  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
            {review.reviewer_name ? review.reviewer_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="ml-2">
            <p className="font-semibold">{review.reviewer_name || 'مستخدم مجهول'}</p>
            <p className="text-sm text-gray-500">
              {review.created_at ? new Date(review.created_at).toLocaleDateString('ar-EG') : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={`text-lg ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <p className="text-gray-700">{review.comment || 'لا يوجد تعليق'}</p>
    </Card>
  );
};

// Review form component
const ReviewForm = ({ craftsmanId, onReviewSubmit }: { craftsmanId: string; onReviewSubmit: () => void }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast("يرجى إضافة تقييم", { 
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' } 
      });
      return;
    }

    if (!user) {
      toast("يجب تسجيل الدخول أولاً لإضافة تقييم", { 
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' } 
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Fix: Update the field names to match the expected schema
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            reviewed_id: craftsmanId,
            reviewer_id: user.id,
            rating,
            comment,
          },
        ]);

      if (error) throw error;

      toast("تم إضافة التقييم بنجاح");
      setRating(0);
      setComment('');
      onReviewSubmit();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast("حدث خطأ أثناء إضافة التقييم", { 
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' } 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3">أضف تقييمك</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex items-center">
            <p className="ml-2">التقييم:</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className="text-2xl focus:outline-none"
                  onClick={() => setRating(i + 1)}
                >
                  <span className={i < rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="comment" className="block mb-1">التعليق (اختياري):</label>
          <textarea
            id="comment"
            className="w-full p-2 border border-gray-300 rounded"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <div className="text-left">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="mr-2" size="sm" /> : null}
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

const CraftsmanReviewsTab = ({ craftsmanId }: { craftsmanId: string }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewsCount, setReviewsCount] = useState(0);
  const { user } = useAuth();

  const loadReviews = async () => {
    try {
      setLoading(true);
      
      // Use the RPC function to get reviews - Fixed: Use type assertion for string parameter
      const { data, error } = await supabase
        .rpc('get_craftsman_reviews', { 
          craftsman_id: craftsmanId as string
        });
      
      if (error) throw error;
      
      // Apply type assertion to handle the response
      const response = assertRPCResponse<any[]>(data);
      
      if (response.data) {
        setReviews(response.data);
        
        // Calculate average rating
        if (response.data.length > 0) {
          const totalRating = response.data.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(totalRating / response.data.length);
          setReviewsCount(response.data.length);
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [craftsmanId]);

  return (
    <div>
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

      {user && <ReviewForm craftsmanId={craftsmanId} onReviewSubmit={loadReviews} />}

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : reviews.length > 0 ? (
        reviews.map((review) => <Review key={review.id} review={review} />)
      ) : (
        <div className="text-center py-8 text-gray-500">
          لا توجد تقييمات بعد
        </div>
      )}
    </div>
  );
};

export default CraftsmanReviewsTab;
