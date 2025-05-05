import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { egyptianGovernorates } from '@/data/egyptianGovernorates';
import { CraftsmenSearchForm } from './CraftsmenSearchForm';

interface CraftsmenFiltersProps {
  onFilterChange: (filters: any) => void;
  filters: any;
  specialties: string[];
  onSearch: (term: string) => void;
}

export const CraftsmenFilters = ({ onFilterChange, filters, specialties, onSearch }: CraftsmenFiltersProps) => {
  const [governorates, setGovernorates] = useState<string[]>([]);
  
  useEffect(() => {
    const governorateNames = egyptianGovernorates.map((gov) => gov.name);
    setGovernorates(governorateNames);
  }, []);
  
  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, specialty: e.target.value });
  };
  
  const handleGovernorateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, governorate: e.target.value });
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
        
        {/* Rating Filter */}
        <div>
          <Label>التقييم</Label>
          <Slider
            defaultValue={[filters.rating]}
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
