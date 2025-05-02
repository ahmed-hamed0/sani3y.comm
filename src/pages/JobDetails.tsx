
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, Breadcrumb, BreadcrumbList } from '@/components/ui/breadcrumb';
import { MapPin, CalendarClock, User, DollarSign, Clock, CheckCircle2, XCircle, AlertCircle, Home, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { JobApplication } from '@/components/jobs/JobApplication';
import { JobApplicationsList } from '@/components/jobs/JobApplicationsList';

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

const getStatusIcon = (status: JobStatus) => {
  switch (status) {
    case 'open':
      return <Clock className="w-12 h-12 text-blue-500" />;
    case 'in_progress':
      return <AlertCircle className="w-12 h-12 text-amber-500" />;
    case 'completed':
      return <CheckCircle2 className="w-12 h-12 text-green-500" />;
    case 'cancelled':
      return <XCircle className="w-12 h-12 text-red-500" />;
    default:
      return <AlertCircle className="w-12 h-12 text-gray-500" />;
  }
};

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isClient, isCraftsman, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignedCraftsman, setIsAssignedCraftsman] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            client:profiles!jobs_client_id_fkey(*), 
            assigned_craftsman:profiles!jobs_assigned_to_fkey(*)
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        setJob(data);
        
        if (user && data) {
          // Check if the current user is the assigned craftsman
          if (data.assigned_to === user.id) {
            setIsAssignedCraftsman(true);
          }
          
          // Check if the user has already applied
          if (isCraftsman) {
            const { data: appData, error: appError } = await supabase
              .rpc('check_job_application', { 
                craftsman_id_param: user.id,
                job_id_param: id
              });
            
            if (appError) throw appError;
            setHasApplied(appData && appData.length > 0);
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
  }, [id, user, authLoading, isCraftsman, refreshTrigger, toast]);

  const refreshJobDetails = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleApplyClick = () => {
    if (!user) {
      toast({
        title: 'تسجيل الدخول مطلوب',
        description: 'يجب تسجيل الدخول للتقدم لهذه المهمة',
        variant: 'destructive'
      });
      return;
    }
    
    if (!isCraftsman) {
      toast({
        title: 'غير مسموح',
        description: 'فقط الصنايعية يمكنهم التقدم للمهام',
        variant: 'destructive'
      });
      return;
    }
    
    setIsDialogOpen(true);
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
  const isCompletedJob = job.status === 'completed';
  const isClient = user && job.client_id === user.id;
  const canApply = isCraftsman && isOpenJob && !hasApplied && !isMyJob;

  return (
    <MainLayout>
      <div className="container-custom py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/"><Home className="w-4 h-4" /></Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/jobs">المهام</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{job.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Job Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
              <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="w-4 h-4 ml-1" />
                  <span>{job.governorate}{job.city ? ` - ${job.city}` : ''}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <CalendarClock className="w-4 h-4 ml-1" />
                  <span>
                    {job.created_at ? formatDistanceToNow(parseISO(job.created_at), { 
                      addSuffix: true, 
                      locale: ar 
                    }) : ''}
                  </span>
                </div>
                {job.budget > 0 && (
                  <div className="flex items-center text-primary font-medium">
                    <DollarSign className="w-4 h-4 ml-1" />
                    <span>{job.budget} جنيه</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end">
              {getStatusBadge(job.status as JobStatus)}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>وصف المهمة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {job.description.split('\n').map((paragraph: string, i: number) => (
                    <p key={i} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
            
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
            {/* Status Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>حالة المهمة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center">
                  {getStatusIcon(job.status as JobStatus)}
                  <h3 className="mt-2 mb-1 font-semibold">
                    {
                      job.status === 'open' ? 'متاحة للتقديم' :
                      job.status === 'in_progress' ? 'قيد التنفيذ' :
                      job.status === 'completed' ? 'تم الانتهاء' :
                      'تم إلغاؤها'
                    }
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {
                      job.status === 'open' ? 'هذه المهمة متاحة حالياً للتقديم من الصنايعية' :
                      job.status === 'in_progress' ? 'هذه المهمة قيد التنفيذ حالياً' :
                      job.status === 'completed' ? 'تم الانتهاء من هذه المهمة بنجاح' :
                      'تم إلغاء هذه المهمة'
                    }
                  </p>
                </div>
              </CardContent>
              {job.status === 'open' && canApply && (
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={handleApplyClick}
                  >
                    تقديم عرض
                  </Button>
                </CardFooter>
              )}
              {isAssignedCraftsman && isInProgressJob && (
                <CardFooter>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleMarkComplete}
                  >
                    <CheckCircle2 className="ml-1 h-4 w-4" />
                    تم الانتهاء من المهمة
                  </Button>
                </CardFooter>
              )}
            </Card>
            
            {/* Client Info Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>معلومات العميل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Avatar>
                    <AvatarImage src={job.client?.avatar_url || ""} />
                    <AvatarFallback>
                      {job.client?.full_name ? job.client.full_name[0] : "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{job.client?.full_name || "عميل"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.client?.governorate && job.client?.city ? 
                        `${job.client.governorate} - ${job.client.city}` : 
                        job.client?.governorate || "غير محدد"}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="w-full flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">عضو منذ</span>
                  <span className="text-sm">
                    {job.client?.created_at ? 
                      formatDistanceToNow(parseISO(job.client.created_at), { 
                        addSuffix: false, 
                        locale: ar 
                      }) : "غير معروف"}
                  </span>
                </div>
              </CardFooter>
            </Card>
            
            {/* Assigned Craftsman Card (if in progress) */}
            {job.assigned_to && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>الصنايعي المكلف</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <Avatar>
                      <AvatarImage src={job.assigned_craftsman?.avatar_url || ""} />
                      <AvatarFallback>
                        {job.assigned_craftsman?.full_name ? 
                          job.assigned_craftsman.full_name[0] : "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{job.assigned_craftsman?.full_name || "صنايعي"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {job.assigned_craftsman?.specialty || "غير محدد"}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-center">
                  <Button 
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link to={`/craftsman/${job.assigned_to}`} className="flex items-center">
                      <User className="ml-1 h-4 w-4" />
                      عرض الملف الشخصي
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {/* Security Note */}
            <Card className="bg-gray-50">
              <CardContent className="pt-6">
                <div className="flex items-center text-amber-700 mb-2">
                  <ShieldCheck className="ml-2 w-5 h-5" />
                  <CardTitle className="text-base">نصائح الأمان</CardTitle>
                </div>
                <CardDescription className="text-gray-600 text-xs">
                  <ul className="list-disc pr-4 space-y-1">
                    <li>قم بالتواصل مع الصنايعية عبر المنصة فقط</li>
                    <li>لا تقم بالدفع قبل اكتمال العمل والتأكد من جودته</li>
                    <li>احرص على مراجعة تقييمات الصنايعية قبل قبول العروض</li>
                  </ul>
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Apply Dialog */}
      <JobApplication
        jobId={job.id}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={() => {
          setHasApplied(true);
          refreshJobDetails();
        }}
      />
    </MainLayout>
  );
};

export default JobDetails;
