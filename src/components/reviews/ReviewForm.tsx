
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { assertStringParam } from '@/utils/supabaseTypes';

interface ReviewFormProps {
  craftsmanId: string;
  onReviewSubmit: () => void;
}

export const ReviewForm = ({ craftsmanId, onReviewSubmit }: ReviewFormProps) => {
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

      // Fix: Use assertStringParam for craftsmanId
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            reviewed_id: assertStringParam(craftsmanId),
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
