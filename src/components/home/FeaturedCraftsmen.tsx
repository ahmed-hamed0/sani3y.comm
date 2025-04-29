
import { Link } from 'react-router-dom';
import { Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CraftsmanData {
  id: string;
  name: string;
  specialty: string;
  avatar: string | undefined;
  rating: number;
  location: {
    governorate: string;
    city: string;
  };
  completedJobs: number;
  availability: boolean;
  isOnline: boolean;
}

interface FeaturedCraftsmenProps {
  craftsmen: CraftsmanData[];
}

const FeaturedCraftsmen = ({ craftsmen }: FeaturedCraftsmenProps) => {
  // Use craftsmen passed from props or CRAFTSMEN from mock data if none
  const topCraftsmen = craftsmen || [];

  return (
    <section className="py-16 bg-neutral">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">أفضل الصنايعية</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            نخبة من الصنايعية المحترفين الحاصلين على أعلى التقييمات من عملائنا
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topCraftsmen.length > 0 ? (
            topCraftsmen.map((craftsman) => (
              <div key={craftsman.id} className="bg-white rounded-lg overflow-hidden shadow-md card-hover">
                <div className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <img
                        src={craftsman.avatar || '/placeholder.svg'}
                        alt={craftsman.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-primary"
                      />
                      {craftsman.availability && (
                        <span className="absolute bottom-0 left-0 bg-green-500 p-1 rounded-full">
                          <Check className="h-4 w-4 text-white" />
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-center mb-1">{craftsman.name}</h3>
                  <p className="text-primary text-center mb-2">{craftsman.specialty}</p>
                  
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-lg font-semibold mx-1">{craftsman.rating}</span>
                    </div>
                    <span className="text-gray-500 text-sm">({craftsman.completedJobs} مهمة)</span>
                  </div>
                  
                  <div className="text-center text-sm text-gray-600 mb-4">
                    <p>{craftsman.location.city}، {craftsman.location.governorate}</p>
                  </div>
                  
                  <div className="text-center">
                    <Button asChild className="w-full">
                      <Link to={`/craftsman/${craftsman.id}`}>عرض الملف الشخصي</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">لا يوجد صنايعية متاحين حاليًا</p>
            </div>
          )}
        </div>
        
        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg">
            <Link to="/craftsmen">عرض كل الصنايعية</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCraftsmen;
