
import { useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface JobApplicationParams {
  proposal: string;
  budget?: number;
}

export const useJobApplication = (jobId: string, onSuccess?: () => void, onClose?: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const checkExistingApplication = async () => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('craftsman_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking application:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in checkExistingApplication:', error);
      return false;
    }
  };

  const submitApplication = async ({ proposal, budget }: JobApplicationParams) => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول",
        description: "يجب عليك تسجيل الدخول للتقديم على المهمة",
        variant: "destructive"
      });
      return { success: false };
    }

    setIsSubmitting(true);

    try {
      // Check if user has already applied to this job
      const alreadyApplied = await checkExistingApplication();
      
      if (alreadyApplied) {
        toast({
          title: "لقد قمت بالتقديم مسبقاً",
          description: "لقد قمت بالتقديم على هذه المهمة من قبل",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return { success: false };
      }

      // Check application limits using the RPC with correct parameter typing
      const params = { p_craftsman_id: user.id };
      
      const { data: checkResult, error: checkError } = await supabase.rpc(
        'check_job_application',
        params
      );

      if (checkError) {
        throw checkError;
      }

      // Add null checks for checkResult
      if (!checkResult) {
        throw new Error('Failed to check application limits');
      }

      const canApply = checkResult.can_apply;

      if (!canApply && !checkResult.is_premium) {
        toast({
          title: "تم تجاوز الحد المسموح",
          description: "لقد تجاوزت الحد المسموح للتقديم المجاني. قم بترقية حسابك للحصول على تقديمات غير محدودة",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return { success: false };
      }

      // Apply for the job
      const { error: applyError } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          craftsman_id: user.id,
          proposal,
          budget: budget || null
        });

      if (applyError) {
        throw applyError;
      }

      // Update application count if not premium
      if (checkResult && !checkResult.is_premium) {
        const { error: updateError } = await supabase.rpc(
          'create_user_applications_count',
          params
        );

        if (updateError) {
          console.error('Error updating application count:', updateError);
        }
      }

      setHasApplied(true);
      
      toast({
        title: "تم التقديم بنجاح",
        description: "تم إرسال طلبك بنجاح وسيتم إشعارك عند الرد عليه",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error submitting application:', error);
      
      toast({
        title: "فشل التقديم",
        description: "حدث خطأ أثناء التقديم على المهمة. يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
      
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitApplication,
    isSubmitting,
    hasApplied,
    checkExistingApplication
  };
};
