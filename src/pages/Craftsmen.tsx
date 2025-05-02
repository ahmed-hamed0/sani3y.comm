
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import CraftsmenFilters from '@/components/craftsmen/CraftsmenFilters';
import CraftsmanCard from '@/components/craftsmen/CraftsmanCard';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/auth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

interface Craftsman {
  id: string;
  full_name: string;
  avatar_url: string | null;
  specialty: string;
  governorate: string;
  city: string;
  rating: number;
  bio: string | null;
  completed_jobs: number;
  skills: string[];
  created_at: string;
  experience_years: number;
  is_available: boolean;
  role: string;
  email: string;
}

const Craftsmen = () => {
  const { user } = useAuth();
  const [craftsmen, setCraftsmen] = useState<Craftsman[]>([]);
  const [filteredCraftsmen, setFilteredCraftsmen] = useState<Craftsman[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: '',
    governorate: '',
    city: '',
    minRating: 1,
  });

  useEffect(() => {
    const loadCraftsmen = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            avatar_url,
            governorate,
            city,
            rating,
            created_at,
            role,
            craftsman_details (
              specialty,
              bio,
              completed_jobs,
              skills,
              experience_years,
              is_available
            )
          `)
          .eq('role', 'craftsman');

        if (error) {
          console.error('Error loading craftsmen:', error);
          setError('حدث خطأ أثناء تحميل بيانات الصنايعية');
          return;
        }

        if (data) {
          const formattedData = data
            .filter(item => item.craftsman_details)
            .map(item => ({
              id: item.id,
              full_name: item.full_name,
              avatar_url: item.avatar_url,
              specialty: item.craftsman_details?.specialty || 'غير محدد',
              governorate: item.governorate,
              city: item.city,
              rating: item.rating || 0,
              bio: item.craftsman_details?.bio || null,
              completed_jobs: item.craftsman_details?.completed_jobs || 0,
              skills: item.craftsman_details?.skills || [],
              created_at: item.created_at,
              experience_years: item.craftsman_details?.experience_years || 0,
              is_available: item.craftsman_details?.is_available || false,
              role: 'craftsman',
              email: ''
            }));
          
          setCraftsmen(formattedData);
          setFilteredCraftsmen(formattedData);
        }
      } catch (err) {
        console.error('Error in loadCraftsmen:', err);
        setError('حدث خطأ غير متوقع');
      } finally {
        setIsLoading(false);
      }
    };

    loadCraftsmen();
  }, []);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    
    let result = [...craftsmen];
    
    if (newFilters.searchTerm) {
      const searchTerm = newFilters.searchTerm.toLowerCase();
      result = result.filter(craftsman => 
        craftsman.full_name.toLowerCase().includes(searchTerm) || 
        craftsman.specialty.toLowerCase().includes(searchTerm) ||
        (craftsman.bio && craftsman.bio.toLowerCase().includes(searchTerm)) ||
        craftsman.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm))
      );
    }
    
    if (newFilters.category) {
      result = result.filter(craftsman => 
        craftsman.specialty === newFilters.category
      );
    }
    
    if (newFilters.governorate) {
      result = result.filter(craftsman => 
        craftsman.governorate === newFilters.governorate
      );
    }
    
    if (newFilters.city) {
      result = result.filter(craftsman => 
        craftsman.city === newFilters.city
      );
    }
    
    if (newFilters.minRating) {
      result = result.filter(craftsman => 
        craftsman.rating >= newFilters.minRating
      );
    }
    
    result.sort((a, b) => b.rating - a.rating);
    
    setFilteredCraftsmen(result);
  };

  if (isLoading) {
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

  if (error) {
    return (
      <MainLayout>
        <div className="container-custom py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="container-custom py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-bold mb-2">يجب تسجيل الدخول</h2>
            <p className="text-gray-600 mb-4">
              يجب عليك تسجيل الدخول أولاً لعرض قائمة الصنايعية
            </p>
            <Button asChild>
              <Link to="/sign-in">تسجيل الدخول</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold mb-6">الصنايعية</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <CraftsmenFilters onFilterChange={handleFilterChange} />
          </div>
          
          <div className="lg:col-span-3">
            {filteredCraftsmen.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCraftsmen.map(craftsman => (
                  <CraftsmanCard 
                    key={craftsman.id} 
                    craftsman={{
                      id: craftsman.id,
                      name: craftsman.full_name,
                      specialty: craftsman.specialty,
                      avatar: craftsman.avatar_url || undefined,
                      rating: craftsman.rating,
                      location: {
                        governorate: craftsman.governorate,
                        city: craftsman.city
                      },
                      completedJobs: craftsman.completed_jobs,
                      experience: craftsman.experience_years,
                      isOnline: craftsman.is_available,
                      bio: craftsman.bio || '',
                      gallery: [],
                      skills: craftsman.skills,
                      availability: craftsman.is_available,
                      createdAt: new Date(craftsman.created_at),
                      phone: '',
                      role: 'craftsman',
                      email: ''
                    }} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h2 className="text-xl font-bold mb-2">لم يتم العثور على نتائج</h2>
                <p className="text-gray-600">
                  لا يوجد صنايعية مطابقين لمعايير البحث الحالية، يرجى تعديل الفلاتر والمحاولة مرة أخرى
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Craftsmen;
