
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/auth';
import { Spinner } from '@/components/ui/spinner';
import { useState } from 'react';
import { JobApplication } from '@/components/jobs/JobApplication';
import { JobApplicationsList } from '@/components/jobs/JobApplicationsList';
import { JobHeader } from '@/components/job-details/JobHeader';
import { JobDescription } from '@/components/job-details/JobDescription';
import { JobStatusCard } from '@/components/job-details/JobStatusCard';
import { ClientInfoCard } from '@/components/job-details/ClientInfoCard';
import { CraftsmanInfoCard } from '@/components/job-details/CraftsmanInfoCard';
import { SecurityNoteCard } from '@/components/job-details/SecurityNoteCard';
import { JobBreadcrumb } from '@/components/job-details/JobBreadcrumb';
import { useJobDetails } from '@/hooks/useJobDetails';

type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

const getStatusBadge = (status: JobStatus) => {
  switch (status) {
    case 'open':
      return <Badge className="bg-blue-500">متاح</Badge>;
    case 'in_progress':
      return <Badge className="bg-amber-500">قيد التنفيذ</Badge>;
    case 'completed':
      return <Badge className="bg-green-500">مكتمل</Badge>;
    case 'cancelled':
      return <Badge variant="destructive">ملغي</Badge>;
    default:
      return <Badge variant="outline">غير معروف</Badge>;
  }
};

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isCraftsman, loading: authLoading } = useAuth();
  const { 
    job, 
    loading, 
    isAssignedCraftsman, 
    hasApplied,
    refreshJobDetails,
    handleMarkComplete
  } = useJobDetails(id);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleApplyClick = () => {
    setIsDialogOpen(true);
  };
  
  if (loading || authLoading) {
    return (
      <MainLayout>
        <div className="container-custom py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <Spinner size="lg" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="container-custom py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">المهمة غير موجودة</h1>
            <p className="mb-6 text-muted-foreground">
              لا يمكن العثور على المهمة المطلوبة. قد تكون تم حذفها أو ربما أدخلت رابطاً خاطئاً.
            </p>
            <Button asChild>
              <Link to="/jobs">العودة إلى قائمة المهام</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  const isMyJob = user && job.client_id === user.id;
  const isOpenJob = job.status === 'open';
  const isInProgressJob = job.status === 'in_progress';
  const canApply = isCraftsman && isOpenJob && !hasApplied && !isMyJob;

  return (
    <MainLayout>
      <div className="container-custom py-8">
        <JobBreadcrumb title={job.title} />
        
        <JobHeader 
          job={job} 
          statusBadge={getStatusBadge(job.status)} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <JobDescription description={job.description} />
            
            {/* Applications Section (visible to job owner) */}
            {isMyJob && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">العروض المقدمة</h2>
                <JobApplicationsList 
                  jobId={job.id} 
                  isMyJob={isMyJob} 
                  onRefreshNeeded={refreshJobDetails}
                />
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <JobStatusCard 
              status={job.status}
              canApply={canApply}
              isAssignedCraftsman={isAssignedCraftsman}
              isInProgressJob={isInProgressJob}
              onApplyClick={handleApplyClick}
              onMarkComplete={handleMarkComplete}
            />
            
            <ClientInfoCard client={job.client} />
            
            {job.craftsman_id && <CraftsmanInfoCard craftsman={job.assigned_craftsman} />}
            
            <SecurityNoteCard />
          </div>
        </div>
      </div>
      
      {/* Apply Dialog */}
      <JobApplication
        jobId={job.id}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => {
          refreshJobDetails();
        }}
      />
    </MainLayout>
  );
};

export default JobDetails;
