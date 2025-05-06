
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/components/reviews/types';
import { CraftsmanReview } from '@/utils/supabaseTypes';

export const useReviews = (craftsmanId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  
  const fetchReviews = async () => {
    try {
      // Define the parameters properly for TypeScript
      const params = { p_craftsman_id: craftsmanId };
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer_id,
          profiles!reviews_reviewer_id_fkey(full_name, avatar_url)
        `)
        .eq('reviewed_id', craftsmanId);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Transform the data to match our Review interface
        const transformedReviews: Review[] = data.map(review => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment || '',
          created_at: review.created_at,
          reviewer_id: review.reviewer_id,
          reviewer_name: review.profiles?.full_name || 'مستخدم مجهول',
          reviewer_avatar: review.profiles?.avatar_url || undefined
        }));
        
        setReviews(transformedReviews);
        setReviewsCount(transformedReviews.length);
        
        if (transformedReviews.length > 0) {
          const sum = transformedReviews.reduce((acc, review) => acc + review.rating, 0);
          setAverageRating(sum / transformedReviews.length);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (craftsmanId) {
      fetchReviews();
    }
  }, [craftsmanId]);
  
  const refreshReviews = () => {
    setLoading(true);
    fetchReviews();
  };

  return {
    reviews,
    loading,
    averageRating,
    reviewsCount,
    refreshReviews
  };
};
