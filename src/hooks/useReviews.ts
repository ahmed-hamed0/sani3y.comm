
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { assertRPCResponse, assertStringParam } from '@/utils/supabaseTypes';
import { Review, ReviewsSummary } from '@/components/reviews/types';

export const useReviews = (craftsmanId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewsCount, setReviewsCount] = useState(0);

  const fetchReviews = async () => {
    if (!craftsmanId) return;
    
    setLoading(true);
    try {
      const { data: rawData, error } = await supabase
        .rpc('get_craftsman_reviews', { 
          craftsman_id_param: assertStringParam(craftsmanId)
        })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const response = assertRPCResponse<Review[]>(rawData);
      setReviews(response.data || []);

      // Calculate average rating
      if (response.data.length > 0) {
        const totalRating = response.data.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating(totalRating / response.data.length);
        setReviewsCount(response.data.length);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [craftsmanId]);

  return { reviews, loading, averageRating, reviewsCount, refreshReviews: fetchReviews };
};
