
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, GOVERNORATES } from '@/data/mockData';

interface CraftsmenFiltersProps {
  onFilterChange: (filters: any) => void;
}

const CraftsmenFilters = ({ onFilterChange }: CraftsmenFiltersProps) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [rating, setRating] = useState([0]); // Changed from 1 to 0
  
  // Get cities based on selected governorate
  const cities = GOVERNORATES.find(g => g.name === governorate)?.cities || [];
  
  const handleApplyFilters = () => {
    onFilterChange({
      searchTerm,
      category,
      governorate,
      city,
      minRating: rating[0],
    });
    setShowMobileFilters(false);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setCategory('');
    setGovernorate('');
    setCity('');
    setRating([0]); // Changed from 1 to 0
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">البحث والفلترة</h2>
        <Button
          variant="outline"
          size="sm"
          className="md:hidden"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <Filter className="h-4 w-4 ml-2" />
          الفلاتر
        </Button>
      </div>

      {/* Search Input - Always visible */}
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="ابحث عن اسم أو تخصص..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Filters - togglable on mobile */}
      <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block space-y-4`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">التخصص</Label>
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="جميع التخصصات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التخصصات</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="governorate">المحافظة</Label>
            <Select
              value={governorate}
              onValueChange={(val) => {
                setGovernorate(val);
                setCity(''); // Reset city when governorate changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="جميع المحافظات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المحافظات</SelectItem>
                {GOVERNORATES.map(gov => (
                  <SelectItem key={gov.id} value={gov.name}>
                    {gov.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="city">المدينة</Label>
            <Select
              value={city}
              onValueChange={setCity}
              disabled={!governorate}
            >
              <SelectTrigger>
                <SelectValue placeholder={!governorate ? "اختر المحافظة أولاً" : "جميع المدن"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المدن</SelectItem>
                {cities.map(c => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="rating" className="mb-6 block">الحد الأدنى للتقييم: {rating[0]}</Label>
            <Slider
              id="rating"
              min={0} // Changed from 1 to 0
              max={5}
              step={1}
              value={rating}
              onValueChange={setRating}
              className="mt-6"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button onClick={handleApplyFilters} className="flex-1">
            تطبيق الفلاتر
          </Button>
          <Button onClick={handleClearFilters} variant="outline" className="flex-1">
            إعادة ضبط
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CraftsmenFilters;
