
import { useEffect, useState } from "react";
import { Star, User, ThumbsUp } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  reviewer: {
    id: string;
    name: string;
    avatar?: string;
  };
}

const CraftsmanReviewsTab = ({ craftsmanId }: { craftsmanId: string }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        // Create a custom function to fetch reviews with reviewer information
        const { data, error } = await supabase.rpc('get_craftsman_reviews', {
          p_craftsman_id: craftsmanId
        });
        
        if (error) {
          console.error("Error fetching reviews:", error);
          setError("حدث خطأ أثناء تحميل التقييمات");
          return;
        }
        
        if (data) {
          // Map the data to our Review interface
          const formattedReviews = data.map((review: any) => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment || '',
            createdAt: new Date(review.created_at),
            reviewer: {
              id: review.reviewer_id,
              name: review.reviewer_name || 'مستخدم غير معروف',
              avatar: review.reviewer_avatar
            }
          }));
          
          setReviews(formattedReviews);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error("Error in fetchReviews:", err);
        setError("حدث خطأ غير متوقع");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [craftsmanId]);
  
  // Calculate average rating
  const averageRating = reviews.length 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  
  // Generate stars based on rating
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-16">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">
              {averageRating.toFixed(1)}
            </div>
            <div>
              <div className="flex mb-1">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-sm text-gray-500">
                بناءً على {reviews.length} تقييم
              </p>
            </div>
          </div>
          <Button>أضف تقييم</Button>
        </div>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  {review.reviewer.avatar ? (
                    <img 
                      src={review.reviewer.avatar} 
                      alt={review.reviewer.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{review.reviewer.name}</h3>
                    <div className="flex mt-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </div>
              </div>
              
              {review.comment && (
                <div className="mt-4">
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              )}
              
              <div className="mt-4 flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  مفيد
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">لا يوجد تقييمات حتى الآن</p>
        </div>
      )}
    </div>
  );
};

export default CraftsmanReviewsTab;
