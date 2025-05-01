
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { Clock, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget_min: number | null;
  budget_max: number | null;
  location: {
    governorate: string;
    city: string;
    address?: string;
  };
  client: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: 'open' | 'assigned' | 'completed';
  postedAt: Date;
}

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchJobDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);

        // Fetch job data and client profile in separate queries
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            id,
            title,
            description,
            category,
            budget_min,
            budget_max,
            governorate,
            city,
            address,
            status,
            created_at,
            client_id
          `)
          .eq('id', id)
          .single();

        if (jobError) {
          console.error('Error fetching job details:', jobError);
          setError('حدث خطأ أثناء تحميل بيانات المهمة');
          return;
        }

        if (!jobData) {
          setError('لم يتم العثور على المهمة');
          return;
        }

        // Fetch client profile data separately
        const { data: clientData, error: clientError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', jobData.client_id)
          .single();

        if (clientError) {
          console.error('Error fetching client profile:', clientError);
          // Continue with job data even if client data is missing
        }

        const formattedJob: Job = {
          id: jobData.id,
          title: jobData.title,
          description: jobData.description,
          category: jobData.category,
          budget_min: jobData.budget_min,
          budget_max: jobData.budget_max,
          location: {
            governorate: jobData.governorate,
            city: jobData.city,
            address: jobData.address
          },
          client: {
            id: clientData?.id || jobData.client_id,
            name: clientData?.full_name || 'مستخدم غير معروف',
            avatar: clientData?.avatar_url
          },
          status: jobData.status as 'open' | 'assigned' | 'completed',
          postedAt: new Date(jobData.created_at)
        };

        setJob(formattedJob);
      } catch (err) {
        console.error('Error in fetchJobDetails:', err);
        setError('حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  // Helper function to format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container-custom py-8">
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !job) {
    return (
      <MainLayout>
        <div className="container-custom py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">لم يتم العثور على المهمة</h2>
            <p className="text-gray-600 mb-6">{error || 'المهمة التي تبحث عنها غير موجودة أو تم حذفها'}</p>
            <Button asChild>
              <Link to="/jobs">العودة إلى قائمة المهام</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isMine = user?.id === job.client.id;
  const isOpen = job.status === 'open';

  return (
    <MainLayout>
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">{job.title}</h1>
                
                <div className="flex gap-3">
                  <span className={`
                    px-4 py-1 rounded-full text-sm
                    ${job.status === 'open' ? 'bg-green-100 text-green-800' : 
                     job.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 
                     'bg-gray-100 text-gray-800'}
                  `}>
                    {job.status === 'open' ? 'متاح' : 
                     job.status === 'assigned' ? 'قيد التنفيذ' : 
                     'مكتمل'}
                  </span>
                  
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    {job.category}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 ml-2" />
                  <span>تاريخ النشر: {formatDate(job.postedAt)}</span>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 ml-2" />
                  <span>{job.location.city}، {job.location.governorate}</span>
                </div>
              </div>
              
              {job.budget_min && job.budget_max && (
                <div className="bg-gray-50 rounded-md p-4 mb-6">
                  <h2 className="font-semibold mb-2">الميزانية المتوقعة</h2>
                  <p className="text-primary text-lg font-semibold">
                    {job.budget_min} - {job.budget_max} ج.م
                  </p>
                </div>
              )}
              
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">تفاصيل المهمة</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                </div>
              </div>
              
              {job.location.address && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-3">العنوان</h2>
                  <p className="text-gray-700">{job.location.address}</p>
                </div>
              )}
              
              {isMine ? (
                <div className="flex flex-wrap gap-3 justify-end">
                  <Button variant="outline">تعديل المهمة</Button>
                  {isOpen && <Button variant="destructive">إلغاء المهمة</Button>}
                </div>
              ) : (
                <div className="flex justify-center mt-6">
                  {isOpen ? (
                    <Button className="min-w-[200px]">تقدم للمهمة</Button>
                  ) : (
                    <Button disabled>تم إغلاق المهمة</Button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Client Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">العميل</h2>
              
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={job.client.avatar || '/placeholder.svg'} 
                  alt={job.client.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{job.client.name}</h3>
                  <p className="text-gray-500 text-sm">عميل</p>
                </div>
              </div>
              
              {!isMine && (
                <div className="flex flex-col gap-3">
                  <Button asChild>
                    <Link to={`/profile/${job.client.id}`}>عرض الملف الشخصي</Link>
                  </Button>
                  <Button variant="outline">إرسال رسالة</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobDetails;
