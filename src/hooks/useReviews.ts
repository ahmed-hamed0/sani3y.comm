
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Review } from '@/components/reviews/types';
import { assertRPCResponse } from '@/utils/supabaseTypes';

export const useReviews = (craftsmanId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  
  const fetchReviews = async () => {
    try {
      // Define the parameters properly for TypeScript
      const params = { p_craftsman_id: craftsmanId };
      
      const { data, error } = await supabase.rpc(
        'get_craftsman_reviews', 
        params
      );
      
      if (error) {
        throw error;
      }
      
      // Properly assert the response type
      const typedData = assertRPCResponse<Review[]>(data);
      
      setReviews(typedData.data || []);
      setReviewsCount(typedData.data.length);
      
      if (typedData.data.length > 0) {
        const sum = typedData.data.reduce((acc, review) => acc + review.rating, 0);
        setAverageRating(sum / typedData.data.length);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReviews();
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
