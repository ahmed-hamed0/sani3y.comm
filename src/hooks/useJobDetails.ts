
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth';
import { assertRPCResponse, assertStringParam } from '@/utils/supabaseTypes';

type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

interface JobDetails {
  id: string;
  title: string;
  description: string;
  status: JobStatus;
  client_id: string;
  craftsman_id?: string;
  budget?: number;
  governorate: string;
  city?: string;
  created_at: string;
  client: any;
  assigned_craftsman?: any;
}

interface ApplicationCheckResult {
  exists: boolean;
}

export const useJobDetails = (jobId?: string) => {
  const { user, isCraftsman, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAssignedCraftsman, setIsAssignedCraftsman] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;
      
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            client:profiles!jobs_client_id_fkey(*), 
            assigned_craftsman:profiles!jobs_craftsman_id_fkey(*)
          `)
          .eq('id', jobId)
          .single();
        
        if (error) throw error;
        setJob(data as JobDetails);
        
        if (user && data) {
          // Check if the current user is the assigned craftsman
          if (data.craftsman_id === user.id) {
            setIsAssignedCraftsman(true);
          }
          
          // Check if the user has already applied
          if (isCraftsman) {
            const { data: rpcData, error: appError } = await supabase
              .rpc("check_job_application", { 
                p_craftsman_id: assertStringParam(user.id),
                p_job_id: assertStringParam(jobId)
              });
            
            if (appError) throw appError;
            
            const response = assertRPCResponse<ApplicationCheckResult>(rpcData);
            setHasApplied(response.data && response.data.exists);
          }
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        toast({
          title: 'خطأ',
          description: 'تعذر تحميل تفاصيل المهمة',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchJobDetails();
    }
  }, [jobId, user, authLoading, isCraftsman, refreshTrigger, toast]);

  const refreshJobDetails = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleMarkComplete = async () => {
    if (!job || !user || !isAssignedCraftsman) return;
    
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'completed' })
        .eq('id', job.id);
      
      if (error) throw error;
      
      // Send notification to client
      await supabase
        .from('notifications')
        .insert({
          user_id: job.client_id,
          title: 'تم اكتمال المهمة',
          message: `تم الانتهاء من المهمة "${job.title}" ويمكنك الآن مراجعتها وتقييم الصنايعي`,
          link: `/job/${job.id}`
        });
      
      toast({
        title: 'تم تحديث الحالة',
        description: 'تم تحديد المهمة كمكتملة بنجاح'
      });
      
      refreshJobDetails();
    } catch (error) {
      console.error('Error updating job:', error);
      toast({
        title: 'خطأ',
        description: 'تعذر تحديث حالة المهمة',
        variant: 'destructive'
      });
    }
  };

  return {
    job,
    loading,
    isAssignedCraftsman,
    hasApplied,
    refreshJobDetails,
    handleMarkComplete
  };
};
