
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Spinner } from '@/components/ui/spinner';

// Interface for the CraftsmanReviewsTab props
export interface CraftsmanReviewsTabProps {
  craftsmanId: string;
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_id: string;
  reviewer_name?: string;
  reviewer_avatar?: string;
}

export function CraftsmanReviewsTab({ craftsmanId }: CraftsmanReviewsTabProps) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // إصلاح: استخدام as any كنوع وسيط ثم تحويله إلى النوع المعروف
        const { data, error } = await supabase
          .rpc('get_craftsman_reviews', { p_craftsman_id: craftsmanId })
          .order('created_at', { ascending: false }) as { 
            data: ReviewData[] | null; 
            error: any 
          };
        
        if (error) throw error;
        setReviews(Array.isArray(data) ? data : []);
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!reviews.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">لا توجد تقييمات حتى الآن لهذا الصنايعي.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <Card key={review.id} className="overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={review.reviewer_avatar || ""} />
                  <AvatarFallback>
                    {review.reviewer_name?.[0] || "R"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{review.reviewer_name || "عميل"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {review.created_at ? formatDistanceToNow(parseISO(review.created_at), { 
                      addSuffix: true, 
                      locale: ar 
                    }) : ''}
                  </p>
                </div>
              </div>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg 
                    key={i}
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill={i < review.rating ? "#FFD700" : "none"}
                    stroke="#FFD700" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="ml-1"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="text-gray-700">
              {review.comment}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default CraftsmanReviewsTab;
