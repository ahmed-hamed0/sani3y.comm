
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { ApplicationFormValues } from "@/components/jobs/application/ApplicationForm";
import { assertRPCResponse } from '@/utils/supabaseTypes';

interface JobData {
  id: string;
  title: string;
  client_id?: string;
}

interface ApplicationCheckResult {
  exists: boolean;
}

export const useJobApplication = (jobId: string, onSuccess: () => void, onClose: () => void) => {
  const { user, isCraftsman } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobData, setJobData] = useState<JobData | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (jobId) {
        try {
          const { data, error } = await supabase
            .from("jobs")
            .select("id, title, client_id")
            .eq("id", jobId)
            .single();

          if (error) throw error;
          if (data) {
            setJobData({
              id: data.id,
              title: data.title,
              client_id: data.client_id
            });
          }
        } catch (error) {
          console.error("Error fetching job details:", error);
        }
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const submitApplication = async (values: ApplicationFormValues) => {
    if (!user || !user.id || !isCraftsman) {
      toast({
        title: "خطأ",
        description: "يجب أن تكون صنايعي وتسجل الدخول لتقديم عرض",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Use params directly without assertStringParam
      const { data: rpcData, error: checkError } = await supabase.rpc(
        'check_job_application',
        {
          p_craftsman_id: user.id,
          p_job_id: jobId
        }
      );

      if (checkError) throw checkError;

      // Use properly typed response with assertion
      const response = assertRPCResponse<ApplicationCheckResult>(rpcData);
      
      if (response.data && response.data.exists) {
        toast({
          title: "لا يمكن التقديم",
          description: "لقد قدمت عرضاً بالفعل على هذه المهمة",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // إنشاء طلب جديد
      const { error: applicationError } = await supabase
        .from("job_applications")
        .insert({
          job_id: jobId,
          craftsman_id: user.id,
          proposal: values.proposal,
          budget: values.budget,
          status: "pending",
        });

      if (applicationError) throw applicationError;

      // إرسال إشعار للعميل
      if (jobData && jobData.client_id) {
        await supabase
          .from("notifications")
          .insert({
            user_id: jobData.client_id,
            title: "عرض جديد على مهمتك",
            message: `تلقيت عرضاً جديداً على مهمة "${jobData.title}"`,
            link: `/job/${jobId}`,
            read: false,
          });
      }

      toast({
        title: "تم التقديم بنجاح",
        description: "تم إرسال عرضك إلى العميل وسيتم إعلامك في حالة القبول",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تقديم العرض. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, submitApplication };
};
