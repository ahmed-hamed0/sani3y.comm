
import { useParams, Link } from 'react-router-dom';
import { Star, Phone, Mail, MapPin, User, Check, Calendar, Award } from 'lucide-react';
import { CRAFTSMEN } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CraftsmanProfile = () => {
  const { id } = useParams<{ id: string }>();
  
  // Find the craftsman with the matching ID
  const craftsman = CRAFTSMEN.find(c => c.id === id);
  
  // Handle the case when no matching craftsman is found
  if (!craftsman) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">لم يتم العثور على الصنايعي</h2>
        <p className="text-gray-600 mb-6">الصنايعي الذي تبحث عنه غير موجود أو تم حذفه</p>
        <Button asChild>
          <Link to="/craftsmen">العودة إلى قائمة الصنايعية</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative">
            <img
              src={craftsman.avatar || '/placeholder.svg'}
              alt={craftsman.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-primary"
            />
            {craftsman.availability && (
              <span className="absolute bottom-2 left-2 bg-green-500 p-1 rounded-full">
                <Check className="h-5 w-5 text-white" />
              </span>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-right">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{craftsman.name}</h1>
            <p className="text-primary text-xl mb-3">{craftsman.specialty}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 ml-1" />
                <span className="font-semibold">{craftsman.rating}</span>
                <span className="text-gray-500 text-sm mr-1">({craftsman.completedJobs} تقييم)</span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-500 ml-1" />
                <span>{craftsman.location.city}، {craftsman.location.governorate}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 ml-1" />
                <span>عضو منذ {new Date(craftsman.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
              {craftsman.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-3 min-w-[150px]">
            <Button asChild>
              <Link to={`/post-job?craftsman=${craftsman.id}`}>طلب خدمة</Link>
            </Button>
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" />
              <span>اتصال</span>
            </Button>
            <Button variant="outline" className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              <span>رسالة</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Profile Content */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="about">نبذة</TabsTrigger>
          <TabsTrigger value="gallery">معرض الأعمال</TabsTrigger>
          <TabsTrigger value="reviews">التقييمات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about" className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3">نبذة عن الصنايعي</h2>
            <p className="text-gray-700">{craftsman.bio}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3">الخبرات والمهارات</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Award className="h-5 w-5 text-primary ml-2" />
                <span>خبرة {craftsman.experience} سنوات</span>
              </div>
              
              <div className="flex items-center">
                <Check className="h-5 w-5 text-primary ml-2" />
                <span>{craftsman.completedJobs} مهمة مكتملة</span>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">المهارات:</h3>
              <ul className="list-disc list-inside space-y-1">
                {craftsman.skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold mb-3">معلومات التواصل</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-500 ml-2" />
                <span>{craftsman.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-500 ml-2" />
                <span>{craftsman.email}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-500 ml-2" />
                <span>{craftsman.location.city}، {craftsman.location.governorate}</span>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="gallery" className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">معرض الأعمال السابقة</h2>
          
          {craftsman.gallery.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {craftsman.gallery.map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-md">
                  <img
                    src={image}
                    alt={`عمل سابق ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <User className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">لا توجد صور لأعمال سابقة</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reviews" className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">تقييمات العملاء السابقين</h2>
          
          {/* For now, we'll show a placeholder since we don't have real reviews */}
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Star className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">لا توجد تقييمات حتى الآن</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CraftsmanProfile;
