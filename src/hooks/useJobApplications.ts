import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { assertRPCResponse } from "@/utils/supabaseTypes";
import { JobApplication } from "@/components/jobs/ApplicationCard";

interface JobData {
  id: string;
  title: string;
  client_id: string;
}

export function useJobApplications(jobId: string, isMyJob: boolean, onRefreshNeeded?: () => void) {
  const { toast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobData, setJobData] = useState<JobData | null>(null);

  const fetchApplications = async () => {
    try {
      const { data: jobInfo, error: jobError } = await supabase
        .from("jobs")
        .select("id, title, client_id")
        .eq("id", jobId)
        .single();
      
      if (jobError) throw jobError;
      if (jobInfo) {
        setJobData({
          id: jobInfo.id,
          title: jobInfo.title,
          client_id: jobInfo.client_id
        });
      }

      // Fix: Use assertStringParam for RPC parameter
      const { data: rpcData, error } = await supabase
        .rpc("get_job_applications", { 
          job_id_param: assertStringParam(jobId)
        })
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const response = assertRPCResponse<JobApplication[]>(rpcData);
      setApplications(response.data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "خطأ",
        description: "تعذر تحميل طلبات التقديم",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId, toast]);

  const handleAccept = async (applicationId: string, craftsmanId: string, craftsmanName: string) => {
    if (!isMyJob) return;
    
    try {
      // تحديث حالة الطلب إلى مقبول
      const { error: updateError } = await supabase
        .from("job_applications")
        .update({ status: "accepted" })
        .eq("id", applicationId);
      
      if (updateError) throw updateError;
      
      // تحديث حالة الوظيفة إلى قيد التنفيذ
      const { error: jobUpdateError } = await supabase
        .from("jobs")
        .update({ status: "in_progress", craftsman_id: craftsmanId })
        .eq("id", jobId);
      
      if (jobUpdateError) throw jobUpdateError;
      
      // رفض جميع الطلبات الأخرى
      const { error: rejectError } = await supabase
        .from("job_applications")
        .update({ status: "rejected" })
        .eq("job_id", jobId)
        .neq("id", applicationId);
      
      if (rejectError) throw rejectError;

      // إرسال إشعار للصنايعي
      if (jobData) {
        await supabase
          .from("notifications")
          .insert({
            user_id: craftsmanId,
            title: "تم قبول عرضك",
            message: `تم قبول عرضك على مهمة "${jobData.title}"`,
            link: `/job/${jobId}`,
            read: false,
          });
      }
      
      toast({
        title: "تم قبول العرض",
        description: `تم قبول عرض ${craftsmanName} وإسناد المهمة له`,
      });
      
      // تحديث البيانات
      if (onRefreshNeeded) {
        onRefreshNeeded();
      }
      
      // تحديث قائمة الطلبات
      setApplications(prevApps => 
        prevApps.map(app => ({
          ...app,
          status: app.id === applicationId ? "accepted" : "rejected"
        }))
      );
    } catch (error) {
      console.error("Error accepting application:", error);
      toast({
        title: "خطأ",
        description: "تعذر قبول العرض. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (applicationId: string, craftsmanId: string, craftsmanName: string) => {
    if (!isMyJob) return;
    
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status: "rejected" })
        .eq("id", applicationId);
      
      if (error) throw error;
      
      // إرسال إشعار للصنايعي
      if (jobData) {
        await supabase
          .from("notifications")
          .insert({
            user_id: craftsmanId,
            title: "تم رفض عرضك",
            message: `تم رفض عرضك على مهمة "${jobData.title}"`,
            link: `/job/${jobId}`,
            read: false,
          });
      }
      
      toast({
        title: "تم رفض العرض",
        description: `تم رفض عرض ${craftsmanName} بنجاح`,
      });
      
      // تحديث قائمة الطلبات
      setApplications(prevApps => 
        prevApps.map(app => 
          app.id === applicationId ? { ...app, status: "rejected" } : app
        )
      );
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast({
        title: "خطأ",
        description: "تعذر رفض العرض. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  return { applications, loading, handleAccept, handleReject };
}
