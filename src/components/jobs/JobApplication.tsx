
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';

interface JobApplicationProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const JobApplication = ({ jobId, isOpen, onClose, onSuccess }: JobApplicationProps) => {
  const { user } = useAuth();
  const [proposal, setProposal] = useState('');
  const [budget, setBudget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('يجب تسجيل الدخول للتقديم على المهمة');
      return;
    }

    if (!proposal.trim()) {
      toast.error('يرجى كتابة مقترح للمهمة');
      return;
    }

    try {
      setIsSubmitting(true);

      // Check if user already applied to this job using raw SQL query
      const { data: existingApplications, error: checkError } = await supabase
        .rpc('check_job_application', {
          p_job_id: jobId,
          p_craftsman_id: user.id
        })
        .single();

      const existingApplication = existingApplications?.exists || false;

      if (existingApplication) {
        toast.error('لقد قمت بالتقديم على هذه المهمة من قبل');
        onClose();
        return;
      }

      // Submit application
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          craftsman_id: user.id,
          proposal,
          budget: budget ? parseInt(budget) : null,
          status: 'pending',
          submitted_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error submitting application:', error);
        toast.error('حدث خطأ أثناء التقديم للمهمة');
        return;
      }

      toast.success('تم تقديم طلبك بنجاح');
      setProposal('');
      setBudget('');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>التقديم للمهمة</DialogTitle>
          <DialogDescription>
            قدم عرضك للقيام بهذه المهمة. وضح خبرتك وكيفية تنفيذك للمهمة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="proposal">مقترحك للمهمة</Label>
            <Textarea
              id="proposal"
              placeholder="اشرح كيف يمكنك تنفيذ المهمة، وخبرتك في هذا المجال..."
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">السعر المقترح (اختياري)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="أدخل السعر المقترح بالجنيه المصري"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !proposal.trim()}>
            {isSubmitting ? <Spinner size="sm" /> : 'تقديم العرض'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobApplication;
