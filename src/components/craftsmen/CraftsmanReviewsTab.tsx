
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { formatDistance } from "date-fns";
import { ar } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  client: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

interface CraftsmanReviewsTabProps {
  craftsmanId: string;
}

export const CraftsmanReviewsTab = ({ craftsmanId }: CraftsmanReviewsTabProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_craftsman_reviews', { craftsman_id: craftsmanId })
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setReviews(data as unknown as Review[]);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (craftsmanId) {
      fetchReviews();
    }
  }, [craftsmanId]);

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <h3 className="text-xl font-medium text-gray-700 mb-2">
          لا توجد تقييمات بعد
        </h3>
        <p className="text-gray-500">
          سيظهر هنا تقييمات العملاء بمجرد أن يقوموا بتقييم هذا الصنايعي.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.client.avatar_url || ""} />
              <AvatarFallback>
                {review.client.first_name?.[0]}
                {review.client.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="font-medium">
                  {review.client.first_name} {review.client.last_name}
                </h4>
                <span className="text-sm text-gray-500">
                  {formatDistance(new Date(review.created_at), new Date(), {
                    addSuffix: true,
                    locale: ar,
                  })}
                </span>
              </div>
              <div className="flex mb-2">{renderStars(review.rating)}</div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Also export as default for backwards compatibility
export default CraftsmanReviewsTab;
