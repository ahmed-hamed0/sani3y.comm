
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useJobDetails = (jobId: string | undefined) => {
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isAssignedCraftsman, setIsAssignedCraftsman] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const fetchJobDetails = async () => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      
      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          client:client_id (
            id,
            full_name,
            avatar_url,
            rating,
            governorate,
            city
          ),
          assigned_craftsman:craftsman_id (
            id,
            full_name,
            avatar_url,
            rating,
            governorate,
            city,
            craftsman_details (
              specialty,
              completed_jobs
            )
          )
        `)
        .eq('id', jobId)
        .single();
      
      if (jobError) {
        throw jobError;
      }
      
      setJob(jobData);
      
      // Check if the current user is the assigned craftsman
      if (user && jobData.craftsman_id === user.id) {
        setIsAssignedCraftsman(true);
      }
      
      // Check if craftsman has already applied
      if (user && user.id) {
        const { data: applicationData, error: applicationError } = await supabase
          .from('job_applications')
          .select('id')
          .eq('job_id', jobId)
          .eq('craftsman_id', user.id)
          .single();
          
        if (!applicationError && applicationData) {
          setHasApplied(true);
        }
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch job details when job ID changes
  useEffect(() => {
    fetchJobDetails();
  }, [jobId, user]);
  
  // Mark job as complete
  const handleMarkComplete = async () => {
    if (!job || !user) return;
    
    try {
      // Use properly typed parameters
      const params = { p_job_id: jobId };
      
      const { error } = await supabase.rpc(
        'mark_job_complete',
        params
      );
      
      if (error) throw error;
      
      // Refresh job details
      fetchJobDetails();
      
      toast({
        title: "تم إتمام المهمة",
        description: "تم تحديث حالة المهمة بنجاح"
      });
    } catch (error) {
      console.error('Error marking job as complete:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة المهمة",
        variant: "destructive"
      });
    }
  };
  
  const refreshJobDetails = () => {
    fetchJobDetails();
  };

  return {
    job,
    loading,
    hasApplied,
    isAssignedCraftsman,
    refreshJobDetails,
    handleMarkComplete
  };
};
