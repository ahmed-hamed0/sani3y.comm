import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Phone, MapPin, User, Circle, Calendar, Award, MessageSquare, CheckCircle } from 'lucide-react';
import { BsWhatsapp } from 'react-icons/bs';
import { CRAFTSMEN } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from 'react';

const CraftsmanProfile = () => {
  const { id } = useParams<{ id: string }>();
  const craftsman = CRAFTSMEN.find(c => c.id === id);
  const [showMessages, setShowMessages] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
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

  const handleCall = () => {
    window.location.href = `tel:${craftsman.phone}`;
  };

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/${craftsman.phone.replace(/\D/g, '')}`;
    window.open(whatsappUrl, '_blank');
  };
  
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
            <span className={`absolute bottom-2 left-2 p-1 rounded-full ${craftsman.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}>
              <Circle className="h-5 w-5 text-white" fill={craftsman.isOnline ? "currentColor" : "none"} />
            </span>
          </div>
          
          <div className="flex-1 text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{craftsman.name}</h1>
            <p className="text-primary text-xl mb-3">{craftsman.specialty}</p>
            
            <div className="flex flex-wrap justify-center md:justify-end gap-4 mb-4">
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
            
            <div className="flex flex-wrap justify-center md:justify-end gap-3 mb-6">
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
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2"
              onClick={handleCall}
            >
              <Phone className="h-4 w-4" />
              <span>اتصال</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2"
              onClick={() => setShowMessages(!showMessages)}
            >
              <MessageSquare className="h-4 w-4" />
              <span>رسالة</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 bg-green-500 text-white hover:bg-green-600"
              onClick={handleWhatsApp}
            >
              <BsWhatsapp className="h-4 w-4" />
              <span>واتساب</span>
            </Button>
          </div>
        </div>
        
        {showMessages && (
          <div className="mt-6 p-4 bg-neutral rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-right">المحادثة</h3>
            <div className="text-center text-gray-500">
              قم بتسجيل الدخول للتواصل مع الصنايعي
            </div>
          </div>
        )}
      </div>
      
      {/* Profile Content */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="about">نبذة</TabsTrigger>
          <TabsTrigger value="gallery">معرض الأعمال</TabsTrigger>
          <TabsTrigger value="reviews">التقييمات</TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TabsContent value="about" className="bg-white rounded-lg shadow-md p-6 text-right">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">نبذة عن الصنايعي</h2>
              <p className="text-gray-700">{craftsman.bio}</p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-3">الخبرات والمهارات</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-primary ml-2" />
                  <span>خبرة {craftsman.experience} سنوات</span>
                </div>
                
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary ml-2" />
                  <span>{craftsman.completedJobs} مهمة مكتملة</span>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">المهارات:</h3>
                <ul className="list-disc list-inside space-y-1 text-right" dir="rtl">
                  {craftsman.skills.map((skill, index) => (
                    <li key={index} className="flex items-center gap-2 justify-end">
                      {skill}
                      <span className="text-primary">•</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="gallery" className="md:col-span-1 bg-white rounded-lg shadow-md p-6">
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
          
          <TabsContent value="reviews" className="md:col-span-1 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-6">تقييمات العملاء السابقين</h2>
            
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Star className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">لا توجد تقييمات حتى الآن</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default CraftsmanProfile;
