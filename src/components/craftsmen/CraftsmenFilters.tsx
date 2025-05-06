
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { egyptianGovernorates } from '@/data/egyptianGovernorates';
import { egyptianCities } from '@/data/egyptianCities';
import { CraftsmenSearchForm } from './CraftsmenSearchForm';

interface CraftsmenFiltersProps {
  onFilterChange: (filters: any) => void;
  filters: any;
  specialties: string[];
  onSearch: (term: string) => void;
}

export const CraftsmenFilters = ({ onFilterChange, filters, specialties, onSearch }: CraftsmenFiltersProps) => {
  const [governorates, setGovernorates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  
  useEffect(() => {
    setGovernorates(egyptianGovernorates);
  }, []);
  
  // Update cities when governorate changes
  useEffect(() => {
    if (filters.governorate === 'all') {
      setCities([]);
      return;
    }
    
    // Find cities for the selected governorate
    const governorateCities = egyptianCities[filters.governorate] || [];
    setCities(governorateCities);
    
    // Reset city selection when governorate changes
    if (filters.city !== 'all') {
      onFilterChange({ ...filters, city: 'all' });
    }
  }, [filters.governorate]);
  
  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, specialty: e.target.value });
  };
  
  const handleGovernorateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, governorate: e.target.value, city: 'all' });
  };
  
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, city: e.target.value });
  };
  
  const handleRatingChange = (value: number[]) => {
    onFilterChange({ ...filters, rating: value[0] });
  };
  
  const handleOnlineOnlyChange = (checked: boolean) => {
    onFilterChange({ ...filters, onlineOnly: checked });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <CraftsmenSearchForm onSearch={onSearch} />
      
      <Separator className="my-4" />
      
      <div className="space-y-4">
        {/* Specialty Filter */}
        <div>
          <Label htmlFor="specialty">التخصص</Label>
          <select
            id="specialty"
            className="w-full mt-1 p-2 border rounded"
            value={filters.specialty}
            onChange={handleSpecialtyChange}
          >
            <option value="all">الكل</option>
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>
        
        {/* Governorate Filter */}
        <div>
          <Label htmlFor="governorate">المحافظة</Label>
          <select
            id="governorate"
            className="w-full mt-1 p-2 border rounded"
            value={filters.governorate}
            onChange={handleGovernorateChange}
          >
            <option value="all">الكل</option>
            {governorates.map((governorate) => (
              <option key={governorate} value={governorate}>
                {governorate}
              </option>
            ))}
          </select>
        </div>
        
        {/* City Filter - Only show when governorate is selected */}
        {filters.governorate !== 'all' && cities.length > 0 && (
          <div>
            <Label htmlFor="city">المدينة</Label>
            <select
              id="city"
              className="w-full mt-1 p-2 border rounded"
              value={filters.city}
              onChange={handleCityChange}
            >
              <option value="all">الكل</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Rating Filter */}
        <div>
          <Label>التقييم</Label>
          <div className="flex items-center justify-between mt-2 mb-1">
            <span className="text-sm">{filters.rating}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`text-lg ${i < filters.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <Slider
            defaultValue={[filters.rating]}
            value={[filters.rating]}
            max={5}
            step={1}
            onValueChange={handleRatingChange}
          />
        </div>
        
        {/* Online Only Filter */}
        <div className="flex items-center justify-between">
          <Label htmlFor="onlineOnly">متاحين الآن فقط</Label>
          <Switch
            id="onlineOnly"
            checked={filters.onlineOnly}
            onCheckedChange={handleOnlineOnlyChange}
          />
        </div>
      </div>
    </div>
  );
};
