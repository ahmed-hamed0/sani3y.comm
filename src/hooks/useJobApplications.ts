
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Application {
  id: string;
  craftsman_id: string;
  job_id: string;
  proposal: string;
  budget: number | null;
  status: 'pending' | 'accepted' | 'rejected';
  submitted_at: string;
  craftsman_name: string;
  craftsman_avatar: string | null;
  craftsman_specialty: string;
  craftsman_rating: number;
}

export function useJobApplications(
  jobId: string,
  isOwner: boolean,
  onRefreshNeeded?: () => void
) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchApplications = async () => {
    if (!isOwner) return;
    
    try {
      setLoading(true);
      // Use correctly typed parameters
      const params = { p_job_id: jobId };
      
      const { data, error } = await supabase.rpc(
        'get_job_applications',
        params
      );
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOwner) {
      fetchApplications();
    }
  }, [jobId, isOwner]);
  
  const handleAccept = async (applicationId: string) => {
    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('job_applications')
        .update({ status: 'accepted' })
        .eq('id', applicationId)
        .select('job_id, craftsman_id')
        .single();
      
      if (updateError) {
        throw updateError;
      }
      
      // Refresh the list
      fetchApplications();
      
      if (onRefreshNeeded) {
        onRefreshNeeded();
      }
      
      toast({
        title: "تم قبول العرض",
        description: "تم قبول العرض بنجاح"
      });
    } catch (error) {
      console.error('Error accepting application:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء قبول العرض",
        variant: "destructive"
      });
    }
  };
  
  const handleReject = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);
      
      if (error) {
        throw error;
      }
      
      // Refresh the list
      fetchApplications();
      
      toast({
        title: "تم رفض العرض",
        description: "تم رفض العرض بنجاح"
      });
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء رفض العرض",
        variant: "destructive"
      });
    }
  };

  return {
    applications,
    loading,
    handleAccept,
    handleReject
  };
}
