
import { Link } from 'react-router-dom';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { CATEGORIES, GOVERNORATES } from '@/data/mockData';
import { RegisterFormValues } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface LocationStepProps {
  form: UseFormReturn<RegisterFormValues>;
  role: 'client' | 'craftsman';
  isLoading: boolean;
  onPrevStep: () => void;
}

const LocationStep = ({ form, role, isLoading, onPrevStep }: LocationStepProps) => {
  const selectedGovernorate = form.watch('governorate');
  const cities = GOVERNORATES.find(g => g.name === selectedGovernorate)?.cities || [];

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="governorate"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="governorate">المحافظة</Label>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المحافظة" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {GOVERNORATES.map(governorate => (
                  <SelectItem key={governorate.id} value={governorate.name}>
                    {governorate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="city">المدينة</Label>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!selectedGovernorate}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={!selectedGovernorate ? "اختر المحافظة أولاً" : "اختر المدينة"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {role === 'craftsman' && (
        <>
          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="specialty">التخصص</Label>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التخصص" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="bio">نبذة مختصرة عنك</Label>
                <FormControl>
                  <Input 
                    id="bio"
                    {...field}
                    placeholder="اكتب نبذة عن خبراتك ومهاراتك"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      
      <FormField
        control={form.control}
        name="agreeTerms"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2 space-x-reverse">
            <FormControl>
              <Checkbox 
                id="terms" 
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <Label htmlFor="terms" className="text-sm">
              أوافق على <Link to="/terms" className="text-primary hover:underline">الشروط والأحكام</Link>
            </Label>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="mt-6 flex justify-between">
        <Button 
          type="button"
          variant="outline"
          onClick={onPrevStep}
        >
          السابق
        </Button>
        <Button 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري إنشاء الحساب...
            </>
          ) : (
            "إنشاء الحساب"
          )}
        </Button>
      </div>
    </div>
  );
};

export default LocationStep;
