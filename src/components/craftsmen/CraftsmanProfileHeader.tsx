import { Phone, MapPin, Star, Calendar, CheckCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Craftsman } from '@/types';
import { formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface CraftsmanProfileHeaderProps {
  craftsman: Craftsman;
}

export function CraftsmanProfileHeader({ craftsman }: CraftsmanProfileHeaderProps) {
  const formattedDate = formatDate(craftsman.createdAt);
  
  const handleWhatsAppClick = () => {
    if (craftsman.phone) {
      const phoneNumber = craftsman.phone.startsWith('+') ? craftsman.phone.substring(1) : craftsman.phone;
      const whatsappUrl = `https://wa.me/${phoneNumber}`;
      window.open(whatsappUrl, '_blank');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative">
            <img
              src={craftsman.avatar || '/placeholder-avatar.png'}
              alt={craftsman.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary"
            />
            {craftsman.availability && (
              <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
        </div>
        
        {/* Info */}
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{craftsman.name}</h1>
              <p className="text-primary text-lg">{craftsman.specialty}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to={`/post-job?craftsman=${craftsman.id}`}>طلب خدمة</Link>
              </Button>
              <Button 
                variant="outline" 
                className="whatsapp-btn profile-btn"
                onClick={handleWhatsAppClick}
                disabled={!craftsman.phone}
              >
                <MessageCircle className="ml-1 h-4 w-4" />
                واتساب
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 mt-4">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 ml-2 text-muted-foreground" />
              <span>
                {craftsman.location.city}، {craftsman.location.governorate}
              </span>
            </div>
            
            <div className="flex items-center">
              <Star className="h-4 w-4 ml-2 text-yellow-500 fill-yellow-500" />
              <span className="ml-1">{craftsman.rating}</span>
              <span className="text-muted-foreground">
                ({craftsman.completedJobs} مهمة مكتملة)
              </span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-4 w-4 ml-2 text-muted-foreground" />
              <span>عضو منذ {formattedDate}</span>
            </div>
            
            <div className="flex items-center">
              <Phone className="h-4 w-4 ml-2 text-muted-foreground" />
              <span>{craftsman.phone || 'غير متاح'}</span>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {craftsman.skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
