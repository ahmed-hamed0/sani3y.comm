
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface JobApplicationProps {
  jobId: string;
  onSuccess?: () => void;
}

export const JobApplication = ({ jobId, onSuccess }: JobApplicationProps) => {
  const { user } = useAuth();
  const [price, setPrice] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast("يجب تسجيل الدخول كصنايعي أولاً", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
      return;
    }
    
    if (!price || !details) {
      toast("يرجى ملء جميع الحقول المطلوبة", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // First check if the user already applied for this job
      const { data: checkResult, error: checkError } = await supabase
        .rpc('check_job_application', { 
          job_id_param: jobId,
          craftsman_id_param: user.id
        });
        
      if (checkError) throw checkError;
      
      if (checkResult && checkResult === true) {
        toast("لقد قمت بالتقديم على هذه المهمة بالفعل", {
          style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
        });
        return;
      }
      
      // Insert the application
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          craftsman_id: user.id,
          price: parseFloat(price),
          details: details,
          status: 'pending'
        });
        
      if (error) throw error;

      // Get job information to send notification
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('title, client_id')
        .eq('id', jobId)
        .single();
        
      if (jobError) throw jobError;
      
      // Create notification for the client
      await supabase
        .from('notifications')
        .insert({
          user_id: jobData.client_id,
          title: 'لديك عرض جديد',
          content: `لديك عرض جديد على مهمتك "${jobData.title}"`,
          type: 'application',
          related_id: jobId,
          read: false,
        });
      
      toast("تم إرسال عرضك بنجاح", {
        style: { backgroundColor: 'rgb(22, 163, 74)', color: 'white' }
      });
      
      setPrice('');
      setDetails('');
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Error submitting application:', error);
      toast("حدث خطأ أثناء إرسال العرض", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border">
      <h3 className="text-xl font-bold mb-4">قدم عرض سعر</h3>
      
      <div>
        <Label htmlFor="price">السعر المقترح (بالجنيه)</Label>
        <Input
          id="price"
          type="number"
          placeholder="أدخل السعر المقترح"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="details">تفاصيل العرض</Label>
        <Textarea
          id="details"
          placeholder="اكتب تفاصيل العرض والخدمات المقدمة..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={5}
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "جاري الإرسال..." : "إرسال العرض"}
      </Button>
    </form>
  );
};

export default JobApplication;
