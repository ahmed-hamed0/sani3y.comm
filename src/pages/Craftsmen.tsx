
import { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import CraftsmenFilters from '@/components/craftsmen/CraftsmenFilters';
import CraftsmanCard from '@/components/craftsmen/CraftsmanCard';
import { CRAFTSMEN } from '@/data/mockData';
import { Craftsman } from '@/types';

const Craftsmen = () => {
  const [filteredCraftsmen, setFilteredCraftsmen] = useState<Craftsman[]>(CRAFTSMEN);
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: '',
    governorate: '',
    city: '',
    minRating: 1,
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    
    // Apply filters
    let result = [...CRAFTSMEN];
    
    if (newFilters.searchTerm) {
      const searchTerm = newFilters.searchTerm.toLowerCase();
      result = result.filter(craftsman => 
        craftsman.name.toLowerCase().includes(searchTerm) || 
        craftsman.specialty.toLowerCase().includes(searchTerm)
      );
    }
    
    if (newFilters.category) {
      result = result.filter(craftsman => 
        craftsman.specialty === newFilters.category
      );
    }
    
    if (newFilters.governorate) {
      result = result.filter(craftsman => 
        craftsman.location.governorate === newFilters.governorate
      );
    }
    
    if (newFilters.city) {
      result = result.filter(craftsman => 
        craftsman.location.city === newFilters.city
      );
    }
    
    if (newFilters.minRating) {
      result = result.filter(craftsman => 
        craftsman.rating >= newFilters.minRating
      );
    }
    
    // Sort by rating (highest first)
    result.sort((a, b) => b.rating - a.rating);
    
    setFilteredCraftsmen(result);
  };

  return (
    <MainLayout>
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold mb-6">الصنايعية</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters - sidebar on desktop, dropdown on mobile */}
          <div className="lg:col-span-1">
            <CraftsmenFilters onFilterChange={handleFilterChange} />
          </div>
          
          {/* Craftsmen listing */}
          <div className="lg:col-span-3">
            {filteredCraftsmen.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCraftsmen.map(craftsman => (
                  <CraftsmanCard key={craftsman.id} craftsman={craftsman} />
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
