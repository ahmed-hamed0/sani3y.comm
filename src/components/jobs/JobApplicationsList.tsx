import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Check, X } from "lucide-react";

export interface JobApplicationsListProps {
  jobId: string;
  isMyJob: boolean;
  onRefreshNeeded?: () => void;
}

interface JobApplication {
  id: string;
  status: string;
  created_at: string;
  budget: number;
  proposal: string;
  craftsman: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    specialty?: string;
  };
}

interface JobData {
  id: string;
  title: string;
  client_id: string;
}

export function JobApplicationsList({ jobId, isMyJob, onRefreshNeeded }: JobApplicationsListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobData, setJobData] = useState<JobData | null>(null);

  useEffect(() => {
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

        // Fix: Remove generic parameter and add type assertion
        const { data, error } = await supabase
          .rpc("get_job_applications", { job_id_param: jobId })
          .order("created_at", { ascending: false });

        if (error) throw error;
        setApplications((data as JobApplication[]) || []);
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

    fetchApplications();
  }, [jobId, toast]);

  const handleAccept = async (applicationId: string, craftsmanId: string, craftsmanName: string) => {
    if (!isMyJob || !user) return;
    
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
      await supabase
        .from("notifications")
        .insert({
          user_id: craftsmanId,
          title: "تم قبول عرضك",
          message: `تم قبول عرضك على مهمة "${jobData?.title}"`,
          link: `/job/${jobId}`,
          read: false,
        });
      
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
    if (!isMyJob || !user) return;
    
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status: "rejected" })
        .eq("id", applicationId);
      
      if (error) throw error;
      
      // إرسال إشعار للصنايعي
      await supabase
        .from("notifications")
        .insert({
          user_id: craftsmanId,
          title: "تم رفض عرضك",
          message: `تم رفض عرضك على مهمة "${jobData?.title}"`,
          link: `/job/${jobId}`,
          read: false,
        });
      
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500">تم القبول</Badge>;
      case "rejected":
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="outline">قيد الانتظار</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">لا توجد طلبات تقديم على هذه المهمة حتى الآن.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={application.craftsman?.avatar_url || ""} />
                  <AvatarFallback>
                    {application.craftsman?.full_name?.[0] || "C"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {application.craftsman?.full_name || "صنايعي"}
                  </CardTitle>
                  <CardDescription>
                    {application.craftsman?.specialty || "متخصص"}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {getStatusBadge(application.status)}
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(application.created_at), { addSuffix: true, locale: ar })}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="mb-2">
              <span className="font-medium">السعر المقترح: </span>
              <span className="text-primary">{application.budget} جنيه</span>
            </div>
            <p className="text-gray-700">{application.proposal}</p>
          </CardContent>
          {isMyJob && application.status === "pending" && (
            <CardFooter className="border-t pt-3 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleReject(application.id, application.craftsman?.id, application.craftsman?.full_name || "")}
              >
                <X className="mr-1 h-4 w-4" />
                رفض
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleAccept(application.id, application.craftsman?.id, application.craftsman?.full_name || "")}
              >
                <Check className="mr-1 h-4 w-4" />
                قبول
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}

export default JobApplicationsList;
