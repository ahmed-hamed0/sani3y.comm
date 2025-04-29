
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types';

// Helper function to format date
const formatDate = (date: Date) => {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'اليوم';
  } else if (diffInDays === 1) {
    return 'الأمس';
  } else if (diffInDays < 7) {
    return `منذ ${diffInDays} أيام`;
  } else {
    return date.toLocaleDateString('ar-EG');
  }
};

const Jobs = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'open'>('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching jobs:', error);
          return;
        }

        if (data) {
          const formattedJobs: Job[] = data.map(job => ({
            id: job.id,
            title: job.title,
            description: job.description,
            category: job.category,
            location: {
              governorate: job.governorate,
              city: job.city,
              address: job.address,
            },
            budget: job.budget_min && job.budget_max 
              ? { min: job.budget_min, max: job.budget_max } 
              : undefined,
            clientId: job.client_id,
            status: job.status as 'open' | 'assigned' | 'completed',
            postedAt: new Date(job.created_at),
            applications: []
          }));
          setJobs(formattedJobs);
        }
      } catch (error) {
        console.error('Error in fetchJobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);
  
  const filteredJobs = activeFilter === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === 'open');

  return (
    <MainLayout>
      <div className="container-custom py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4 sm:mb-0">المهام المتاحة</h1>
          <Button asChild>
            <Link to="/post-job">نشر مهمة جديدة</Link>
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex space-x-2 space-x-reverse">
            <Button
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('all')}
              size="sm"
            >
              جميع المهام
            </Button>
            <Button
              variant={activeFilter === 'open' ? 'default' : 'outline'}
              onClick={() => setActiveFilter('open')}
              size="sm"
            >
              المهام المتاحة
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                  <div 
                    key={job.id} 
                    className={`
                      bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow
                      ${job.status !== 'open' ? 'opacity-75' : ''}
                    `}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold">{job.title}</h2>
                        <span className={`
                          px-3 py-1 rounded-full text-sm
                          ${job.status === 'open' ? 'bg-green-100 text-green-800' : 
                            job.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'}
                        `}>
                          {job.status === 'open' ? 'متاح' : 
                          job.status === 'assigned' ? 'قيد التنفيذ' : 
                          'مكتمل'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between mb-3">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                          {job.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                      
                      <div className="flex items-center text-gray-500 mb-2">
                        <MapPin className="h-4 w-4 ml-2" />
                        <span className="text-sm">{job.location.city}، {job.location.governorate}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-500 mb-4">
                        <Clock className="h-4 w-4 ml-2" />
                        <span className="text-sm">{formatDate(job.postedAt)}</span>
                      </div>
                      
                      {job.budget && (
                        <div className="bg-gray-50 px-4 py-2 rounded-md mb-4">
                          <span className="font-semibold">الميزانية: </span>
                          <span>{job.budget.min} - {job.budget.max} ج.م</span>
                        </div>
                      )}
                      
                      <Button asChild className="w-full">
                        <Link to={`/job/${job.id}`}>
                          {job.status === 'open' ? 'تقدم للمهمة' : 'عرض التفاصيل'}
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h2 className="text-xl font-bold mb-2">لا توجد مهام متاحة</h2>
                <p className="text-gray-600 mb-6">
                  لا توجد مهام متاحة حالياً، يمكنك نشر مهمة جديدة
                </p>
                <Button asChild>
                  <Link to="/post-job">نشر مهمة جديدة</Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Jobs;
