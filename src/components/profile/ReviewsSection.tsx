
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/sonner';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReviewsSectionProps {
  profile: any;
}

interface Review {
  id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name?: string;
}

const ReviewsSection = ({ profile }: ReviewsSectionProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  // Load reviews for this profile
  useEffect(() => {
    const loadReviews = async () => {
      if (!profile.id) return;
      
      try {
        // First, fetch the reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('reviewed_id', profile.id)
          .order('created_at', { ascending: false });

        if (reviewsError) {
          console.error('Error loading reviews:', reviewsError);
          return;
        }

        if (!reviewsData) {
          setReviews([]);
          return;
        }

        // Then, for each review, fetch the reviewer's name
        const reviewsWithNames = await Promise.all(
          reviewsData.map(async (review) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', review.reviewer_id)
              .single();

            return {
              ...review,
              reviewer_name: profileData?.full_name || 'مستخدم'
            };
          })
        );
        
        setReviews(reviewsWithNames);
        
        // Calculate average rating
        if (reviewsWithNames.length > 0) {
          const sum = reviewsWithNames.reduce((acc, review) => acc + review.rating, 0);
          setAverageRating(parseFloat((sum / reviewsWithNames.length).toFixed(1)));
        }
        
        // Check if current user has already submitted a review
        if (user?.id) {
          const userExistingReview = reviewsWithNames.find(r => r.reviewer_id === user.id);
          if (userExistingReview) {
            setUserReview(userExistingReview);
            setComment(userExistingReview.comment || '');
            setRating(userExistingReview.rating);
          }
        }
      } catch (error) {
        console.error('Error in loadReviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReviews();
  }, [profile.id, user?.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !profile.id || rating < 1 || rating > 5) return;
    if (user.id === profile.id) {
      toast("لا يمكنك تقييم نفسك", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reviewData = {
        reviewer_id: user.id,
        reviewed_id: profile.id,
        rating,
        comment: comment.trim() || null
      };
      
      let result;
      
      if (userReview) {
        // Update existing review
        result = await supabase
          .from('reviews')
          .update({
            rating,
            comment: comment.trim() || null
          })
          .eq('id', userReview.id);
      } else {
        // Create new review
        result = await supabase
          .from('reviews')
          .insert(reviewData);
      }
      
      if (result.error) {
        toast("فشل في " + (userReview ? "تحديث" : "إنشاء") + " التقييم: " + result.error.message, {
          style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
        });
        return;
      }
      
      toast((userReview ? "تم تحديث" : "تم إنشاء") + " التقييم بنجاح");
      
      // Reload reviews to reflect the changes
      const { data: updatedReviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewed_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (updatedReviewsData) {
        // Then, for each review, fetch the reviewer's name
        const reviewsWithNames = await Promise.all(
          updatedReviewsData.map(async (review) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', review.reviewer_id)
              .single();

            return {
              ...review,
              reviewer_name: profileData?.full_name || 'مستخدم'
            };
          })
        );
        
        setReviews(reviewsWithNames);
        
        // Update average rating
        if (reviewsWithNames.length > 0) {
          const sum = reviewsWithNames.reduce((acc, review) => acc + review.rating, 0);
          setAverageRating(parseFloat((sum / reviewsWithNames.length).toFixed(1)));
        }
        
        // Update user's review in state
        const updatedUserReview = reviewsWithNames.find(r => r.reviewer_id === user.id);
        if (updatedUserReview) {
          setUserReview(updatedUserReview);
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast("فشل في " + (userReview ? "تحديث" : "إنشاء") + " التقييم: حدث خطأ غير متوقع", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Average rating display */}
      <div className="bg-neutral rounded-lg p-4 mb-6 text-center">
        <h3 className="font-bold text-xl mb-2">متوسط التقييم</h3>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-3xl font-bold">{averageRating}</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 ${
                  star <= averageRating
                    ? 'text-yellow-500 fill-yellow-500'
                    : star - 0.5 <= averageRating
                    ? 'text-yellow-500 fill-yellow-500 opacity-50'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {reviews.length} {reviews.length === 1 ? 'تقييم' : 'تقييمات'}
        </p>
      </div>

      {/* Review submission form for logged-in users */}
      {user?.id && user.id !== profile.id && (
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-4">
            {userReview ? 'تعديل تقييمك' : 'أضف تقييمك'}
          </h3>
          
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block mb-2">التقييم</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="comment" className="block mb-2">
                التعليق (اختياري)
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اكتب تعليقك هنا..."
                rows={3}
              />
            </div>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Spinner size="sm" className="ml-2" />
              ) : userReview ? (
                'تحديث التقييم'
              ) : (
                'إرسال التقييم'
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 bg-neutral rounded-lg">
          <p className="text-gray-500">لا توجد تقييمات حتى الآن</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">{review.reviewer_name}</div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {review.comment && (
                <p className="text-gray-700">{review.comment}</p>
              )}
              
              <div className="mt-2 text-xs text-gray-500">
                {new Date(review.created_at).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
