
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDistance } from "date-fns";
import { ar } from "date-fns/locale";
import { Check, X, Star } from "lucide-react";

interface JobApplicationsListProps {
  jobId: string;
  clientId: string;
  currentUserId?: string;
}

interface JobApplication {
  id: string;
  price: number;
  details: string;
  status: string;
  created_at: string;
  craftsman: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    rating: number | null;
    specialty: string | null;
  };
}

export const JobApplicationsList = ({ 
  jobId, 
  clientId, 
  currentUserId 
}: JobApplicationsListProps) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const isOwner = currentUserId === clientId;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_job_applications', { job_id_param: jobId })
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setApplications(data as JobApplication[]);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast("حدث خطأ أثناء جلب العروض", {
          style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [jobId]);

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: 'accepted' })
        .eq('id', applicationId);
        
      if (error) throw error;
      
      // Update other applications to rejected
      await supabase
        .from('job_applications')
        .update({ status: 'rejected' })
        .eq('job_id', jobId)
        .neq('id', applicationId);
        
      // Update job status
      await supabase
        .from('jobs')
        .update({ status: 'in_progress' })
        .eq('id', jobId);
      
      // Find the accepted application to get craftsman info
      const acceptedApp = applications.find(app => app.id === applicationId);
      
      if (acceptedApp) {
        // Create notification for the craftsman
        await supabase
          .from('notifications')
          .insert({
            user_id: acceptedApp.craftsman.id,
            title: 'تم قبول عرضك',
            content: `تم قبول عرضك على المهمة!`,
            type: 'application_accepted',
            related_id: jobId,
            read: false,
          });
      }
      
      // Update local state
      setApplications(
        applications.map((app) => ({
          ...app,
          status: app.id === applicationId ? 'accepted' : 'rejected',
        }))
      );
      
      toast("تم قبول العرض بنجاح", {
        style: { backgroundColor: 'rgb(22, 163, 74)', color: 'white' }
      });
      
    } catch (error) {
      console.error('Error accepting application:', error);
      toast("حدث خطأ أثناء قبول العرض", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId);
        
      if (error) throw error;
      
      // Get the rejected application
      const rejectedApp = applications.find(app => app.id === applicationId);
      
      if (rejectedApp) {
        // Create notification for the craftsman
        await supabase
          .from('notifications')
          .insert({
            user_id: rejectedApp.craftsman.id,
            title: 'تم رفض عرضك',
            content: `للأسف، تم رفض عرضك على المهمة.`,
            type: 'application_rejected',
            related_id: jobId,
            read: false,
          });
      }
      
      // Update local state
      setApplications(
        applications.map((app) => ({
          ...app,
          status: app.id === applicationId ? 'rejected' : app.status,
        }))
      );
      
      toast("تم رفض العرض بنجاح", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
      
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast("حدث خطأ أثناء رفض العرض", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        <span className="text-xs text-gray-500 mr-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'accepted':
        return "bg-green-500";
      case 'rejected':
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return "تم القبول";
      case 'rejected':
        return "مرفوض";
      default:
        return "قيد الانتظار";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">لا توجد عروض على هذه المهمة حتى الآن.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id} className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center">
              <Avatar className="h-12 w-12">
                <AvatarImage src={application.craftsman.avatar_url || ""} />
                <AvatarFallback>
                  {application.craftsman.first_name?.[0]}
                  {application.craftsman.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {application.craftsman.first_name} {application.craftsman.last_name}
                    </h3>
                    <Badge variant="outline">{application.craftsman.specialty}</Badge>
                  </div>
                  {renderStars(application.craftsman.rating)}
                </div>

                <Badge className={getBadgeStyle(application.status)}>
                  {getStatusText(application.status)}
                </Badge>
              </div>

              <p className="text-gray-700 mb-2">{application.details}</p>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
                <div>
                  <span className="font-bold text-xl text-primary">
                    {application.price} جنيه
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>
                    {formatDistance(new Date(application.created_at), new Date(), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </span>
                </div>
              </div>

              {isOwner && application.status === 'pending' && (
                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleRejectApplication(application.id)}
                  >
                    <X className="ml-1 h-4 w-4" />
                    رفض
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => handleAcceptApplication(application.id)}
                  >
                    <Check className="ml-1 h-4 w-4" />
                    قبول
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default JobApplicationsList;
