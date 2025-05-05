
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { egyptianGovernorates } from '@/data/egyptianGovernorates';
import { CraftsmenSearchForm } from './CraftsmenSearchForm';

interface FiltersProps {
  onFilterChange: (filters: any) => void;
  filters: {
    specialty: string;
    governorate: string;
    rating: number;
    onlineOnly: boolean;
  };
  specialties: string[];
  onSearch: (term: string) => void;
}

export const CraftsmenFilters = ({ onFilterChange, filters, specialties, onSearch }: FiltersProps) => {
  const handleFilterChange = (key: string, value: string | number | boolean) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="mb-5">
          <h3 className="font-semibold mb-2">البحث</h3>
          <CraftsmenSearchForm onSearch={onSearch} />
        </div>
        
        <Separator className="my-4" />
        
        <div className="mb-5">
          <h3 className="font-semibold mb-2">التخصص</h3>
          <Select
            value={filters.specialty}
            onValueChange={(value) => handleFilterChange('specialty', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="جميع التخصصات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التخصصات</SelectItem>
              {specialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-5">
          <h3 className="font-semibold mb-2">المحافظة</h3>
          <Select
            value={filters.governorate}
            onValueChange={(value) => handleFilterChange('governorate', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="كل المحافظات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المحافظات</SelectItem>
              {egyptianGovernorates.map((governorate) => (
                <SelectItem key={governorate} value={governorate}>
                  {governorate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-5">
          <h3 className="font-semibold mb-2">التقييم ({filters.rating} وما فوق)</h3>
          <Slider
            defaultValue={[filters.rating]}
            min={0}
            max={5}
            step={0.5}
            className="py-4"
            onValueChange={(value) => handleFilterChange('rating', value[0])}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="online-only" className="font-semibold">
            المتاحون الآن فقط
          </Label>
          <Switch
            id="online-only"
            checked={filters.onlineOnly}
            onCheckedChange={(checked) => handleFilterChange('onlineOnly', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
