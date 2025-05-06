import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useReviews } from '@/hooks/useReviews';

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

interface FeaturedCraftsmanProps {
  craftsman: CraftsmanData;
}

const FeaturedCraftsman = ({ craftsman }: FeaturedCraftsmanProps) => {
  const { reviews, averageRating, reviewsCount } = useReviews(craftsman.id);
  const [displayRating, setDisplayRating] = useState(craftsman.rating);
  
  useEffect(() => {
    // Use the average rating from reviews if available, otherwise use craftsman.rating
    if (reviewsCount > 0) {
      setDisplayRating(averageRating);
    }
  }, [averageRating, reviewsCount, craftsman.rating]);
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md card-hover">
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
            <span className="text-lg font-semibold mx-1">{displayRating.toFixed(1)}</span>
          </div>
          <span className="text-gray-500 text-sm">
            ({reviewsCount > 0 ? reviewsCount : craftsman.completedJobs} {reviewsCount > 0 ? 'تقييم' : 'مهمة'})
          </span>
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
  );
};

interface FeaturedCraftsmenProps {
  craftsmen?: CraftsmanData[];
}

const FeaturedCraftsmen = ({ craftsmen: propsCraftsmen }: FeaturedCraftsmenProps) => {
  const [craftsmen, setCraftsmen] = useState<CraftsmanData[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // If craftsmen are passed as props, use them
    if (propsCraftsmen && propsCraftsmen.length > 0) {
      setCraftsmen(propsCraftsmen);
      return;
    }
    
    // Otherwise fetch from Supabase
    const fetchTopCraftsmen = async () => {
      setLoading(true);
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select(`
            *,
            craftsman_details(*)
          `)
          .eq('role', 'craftsman')
          .order('rating', { ascending: false })
          .limit(4);
        
        if (error) {
          throw error;
        }
        
        if (profiles) {
          // Transform the data to match our Craftsman interface
          const transformedData = profiles.map(profile => ({
            id: profile.id,
            name: profile.full_name,
            specialty: profile.craftsman_details?.specialty || 'غير محدد',
            avatar: profile.avatar_url,
            rating: profile.rating || 0,
            location: {
              governorate: profile.governorate,
              city: profile.city,
            },
            completedJobs: profile.craftsman_details?.completed_jobs || 0,
            availability: profile.craftsman_details?.is_available || false,
            isOnline: true, // We'll assume they're online for now
          }));
          
          setCraftsmen(transformedData);
        }
      } catch (error) {
        console.error('Error fetching top craftsmen:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopCraftsmen();
  }, [propsCraftsmen]);

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
          {craftsmen.length > 0 ? (
            craftsmen.map((craftsman) => (
              <FeaturedCraftsman key={craftsman.id} craftsman={craftsman} />
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
