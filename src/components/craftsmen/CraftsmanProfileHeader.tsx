
import { Star, MapPin, Calendar, Phone, MessageSquare, Circle } from 'lucide-react';
import { BsWhatsapp } from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Craftsman } from '@/types/craftsman';
import { useToast } from '@/hooks/use-toast';

interface CraftsmanProfileHeaderProps {
  craftsman: Craftsman;
}

export const CraftsmanProfileHeader = ({ craftsman }: CraftsmanProfileHeaderProps) => {
  const [showMessages, setShowMessages] = useState(false);
  const { toast } = useToast();

  const handleCall = () => {
    if (!craftsman?.phone) {
      toast({
        title: "رقم الهاتف غير متاح",
        description: "لم يتم توفير رقم هاتف لهذا الصنايعي",
        variant: "destructive"
      });
      return;
    }
    
    window.location.href = `tel:${craftsman.phone}`;
  };

  const handleWhatsApp = () => {
    if (!craftsman?.phone) {
      toast({
        title: "رقم الهاتف غير متاح",
        description: "لم يتم توفير رقم هاتف لهذا الصنايعي",
        variant: "destructive"
      });
      return;
    }
    
    const whatsappUrl = `https://wa.me/${craftsman.phone.replace(/\D/g, '')}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
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
        
        <div className="flex-1 text-center md:text-right">
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
            className="flex items-center justify-center gap-2 hover:bg-gray-100"
            onClick={handleCall}
          >
            <Phone className="h-4 w-4" />
            <span>اتصال</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2 hover:bg-gray-100"
            onClick={() => setShowMessages(!showMessages)}
          >
            <MessageSquare className="h-4 w-4" />
            <span>رسالة</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center justify-center gap-2 bg-white text-green-500 border-green-500 hover:bg-green-50"
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
  );
};
