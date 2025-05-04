
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from '@/components/ui/spinner';
import { CraftsmanProfileHeader } from './CraftsmanProfileHeader';
import { CraftsmanAboutTab } from './CraftsmanAboutTab';
import { CraftsmanGalleryTab } from './CraftsmanGalleryTab';
import CraftsmanReviewsTab from './CraftsmanReviewsTab';
import { useCraftsmanProfile } from '@/hooks/useCraftsmanProfile';
import { useEffect } from 'react';

const CraftsmanProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { craftsman, loading, error } = useCraftsmanProfile(id);
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle request service button
  const handleRequestService = () => {
    if (craftsman?.id) {
      navigate(`/post-job?craftsman=${craftsman.id}`);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (error || !craftsman) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">لم يتم العثور على الصنايعي</h2>
        <p className="text-gray-600 mb-6">{error || 'الصنايعي الذي تبحث عنه غير موجود أو تم حذفه'}</p>
        <Button asChild>
          <Link to="/craftsmen">العودة إلى قائمة الصنايعية</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-8">
      {/* Profile Header */}
      <CraftsmanProfileHeader craftsman={craftsman} />
      
      {/* Profile Content */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="about">نبذة</TabsTrigger>
          <TabsTrigger value="gallery">معرض الأعمال</TabsTrigger>
          <TabsTrigger value="reviews">التقييمات</TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TabsContent value="about" className="md:col-span-3">
            <CraftsmanAboutTab craftsman={craftsman} />
          </TabsContent>
          
          <TabsContent value="gallery" className="md:col-span-3">
            <CraftsmanGalleryTab craftsman={craftsman} />
          </TabsContent>
          
          <TabsContent value="reviews" className="md:col-span-3">
            <CraftsmanReviewsTab craftsmanId={craftsman.id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default CraftsmanProfile;
