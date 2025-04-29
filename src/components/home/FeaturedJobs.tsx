
import { Link } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface JobData {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    governorate: string;
    city: string;
  };
  budget?: {
    min: number;
    max: number;
  };
  clientId: string;
  status: 'open' | 'assigned' | 'completed';
  postedAt: Date;
}

interface FeaturedJobsProps {
  jobs: JobData[];
}

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

const FeaturedJobs = ({ jobs }: FeaturedJobsProps) => {
  // Use the jobs passed from props or JOBS from mock data if none
  const latestJobs = jobs || [];

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">أحدث المهام</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            تصفح أحدث المهام المتاحة وتقدم عليها الآن، أو انشر مهمتك الخاصة وسنوصلك بالصنايعية المناسبين
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestJobs.length > 0 ? (
            latestJobs.map((job) => (
              <div key={job.id} className="bg-neutral rounded-lg p-6 shadow-sm card-hover">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{job.title}</h3>
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                    {job.category}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                
                <div className="flex items-center text-gray-500 mb-3">
                  <MapPin className="h-4 w-4 ml-2" />
                  <span className="text-sm">{job.location.city}، {job.location.governorate}</span>
                </div>
                
                <div className="flex items-center text-gray-500 mb-4">
                  <Clock className="h-4 w-4 ml-2" />
                  <span className="text-sm">{formatDate(job.postedAt)}</span>
                </div>
                
                {job.budget && (
                  <div className="bg-gray-100 px-4 py-2 rounded-md mb-4">
                    <span className="font-semibold">الميزانية: </span>
                    <span>{job.budget.min} - {job.budget.max} ج.م</span>
                  </div>
                )}
                
                <Button asChild className="w-full">
                  <Link to={`/job/${job.id}`}>عرض التفاصيل</Link>
                </Button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 bg-neutral rounded-lg">
              <p className="text-gray-500">لا توجد مهام متاحة حاليًا</p>
            </div>
          )}
        </div>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default" size="lg">
            <Link to="/post-job">نشر مهمة جديدة</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/jobs">عرض كل المهام</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;
