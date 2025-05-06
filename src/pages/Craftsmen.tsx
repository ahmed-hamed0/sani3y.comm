
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import CraftsmanCard from '@/components/craftsmen/CraftsmanCard';
import { CraftsmenFilters } from '@/components/craftsmen/CraftsmenFilters';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/integrations/supabase/client';
import { egyptianGovernorates } from '@/data/egyptianGovernorates';
import { egyptianCities } from '@/data/egyptianCities';

const specialties = [
  'سباك',
  'كهربائي',
  'نجار',
  'نقاش',
  'تكييفات',
  'بناء',
  'حداد',
  'طباخ',
  'توصيل',
  'تنظيف',
];

const Craftsmen = () => {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialty: 'all',
    governorate: 'all',
    city: 'all',
    rating: 0,
    onlineOnly: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [craftsmen, setCraftsmen] = useState<any[]>([]);
  const [filteredCraftsmen, setFilteredCraftsmen] = useState<any[]>([]);
  
  // Fetch craftsmen from Supabase
  useEffect(() => {
    const fetchCraftsmen = async () => {
      setLoading(true);
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select(`
            *,
            craftsman_details(*)
          `)
          .eq('role', 'craftsman');
        
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
            bio: profile.craftsman_details?.bio || '',
            location: {
              governorate: profile.governorate,
              city: profile.city,
            },
            completedJobs: profile.craftsman_details?.completed_jobs || 0,
            skills: profile.craftsman_details?.skills || [],
            gallery: profile.craftsman_details?.gallery || [],
            experience: profile.craftsman_details?.experience_years || 0,
            isOnline: true, // We'll assume they're online for now
            availability: profile.craftsman_details?.is_available || false,
            phone: profile.phone,
            createdAt: new Date(profile.created_at)
          }));
          
          setCraftsmen(transformedData);
          setFilteredCraftsmen(transformedData);
        }
      } catch (error) {
        console.error('Error fetching craftsmen:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCraftsmen();
  }, []);
  
  // Filter craftsmen
  useEffect(() => {
    const filtered = craftsmen.filter((craftsman) => {
      // Filter by specialty
      if (filters.specialty !== 'all' && craftsman.specialty !== filters.specialty) {
        return false;
      }
      
      // Filter by governorate
      if (filters.governorate !== 'all' && craftsman.location.governorate !== filters.governorate) {
        return false;
      }
      
      // Filter by city if governorate is selected
      if (filters.governorate !== 'all' && filters.city !== 'all' && craftsman.location.city !== filters.city) {
        return false;
      }
      
      // Filter by rating
      if (craftsman.rating < filters.rating) {
        return false;
      }
      
      // Filter by online status
      if (filters.onlineOnly && !craftsman.isOnline) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm && !craftsman.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !craftsman.specialty.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
    
    setFilteredCraftsmen(filtered);
  }, [filters, searchTerm, craftsmen]);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  return (
    <MainLayout>
      <section className="container-custom py-8">
        <h1 className="text-3xl font-bold text-center mb-8">ابحث عن صنايعي</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <div className="lg:col-span-1">
            <CraftsmenFilters 
              onFilterChange={setFilters} 
              filters={filters} 
              specialties={specialties}
              onSearch={handleSearch}
            />
          </div>
          
          {/* Craftsmen List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-16">
                <Spinner size="lg" />
              </div>
            ) : filteredCraftsmen.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold">لا يوجد صنايعية مطابقين للفلاتر</h3>
                <p className="text-muted-foreground mt-2">يرجى تعديل خيارات الفلتر للحصول على نتائج</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCraftsmen.map((craftsman) => (
                  <CraftsmanCard key={craftsman.id} craftsman={craftsman} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Craftsmen;
