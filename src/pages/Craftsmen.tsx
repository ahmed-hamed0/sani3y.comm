
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import CraftsmanCard from '@/components/craftsmen/CraftsmanCard';
import { CraftsmenFilters } from '@/components/craftsmen/CraftsmenFilters';
import { Spinner } from '@/components/ui/spinner';
import { CRAFTSMEN } from '@/data/mockData';

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
    rating: 0,
    onlineOnly: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [craftsmen, setCraftsmen] = useState(CRAFTSMEN);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter craftsmen
  useEffect(() => {
    const filtered = CRAFTSMEN.filter((craftsman) => {
      // Filter by specialty
      if (filters.specialty !== 'all' && craftsman.specialty !== filters.specialty) {
        return false;
      }
      
      // Filter by governorate
      if (filters.governorate !== 'all' && craftsman.location.governorate !== filters.governorate) {
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
    
    setCraftsmen(filtered);
  }, [filters, searchTerm]);
  
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
            ) : craftsmen.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold">لا يوجد صنايعية مطابقين للفلاتر</h3>
                <p className="text-muted-foreground mt-2">يرجى تعديل خيارات الفلتر للحصول على نتائج</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {craftsmen.map((craftsman) => (
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
