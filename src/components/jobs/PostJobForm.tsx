
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, GOVERNORATES } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const PostJobForm = () => {
  const [searchParams] = useSearchParams();
  const preselectedCraftsman = searchParams.get('craftsman');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    governorate: '',
    city: '',
    address: '',
    budgetMin: '',
    budgetMax: '',
  });

  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('');

  // Get cities based on selected governorate
  const cities = GOVERNORATES.find(g => g.name === selectedGovernorate)?.cities || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'governorate') {
      setSelectedGovernorate(value);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.category || !formData.description || !formData.governorate || !formData.city) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    // Additional validation on budget
    if ((formData.budgetMin && !formData.budgetMax) || (!formData.budgetMin && formData.budgetMax)) {
      toast({
        title: "خطأ في الميزانية",
        description: "يرجى تحديد الحد الأدنى والأقصى للميزانية",
        variant: "destructive"
      });
      return;
    }

    if (formData.budgetMin && formData.budgetMax && Number(formData.budgetMin) > Number(formData.budgetMax)) {
      toast({
        title: "خطأ في الميزانية",
        description: "الحد الأدنى للميزانية يجب أن يكون أقل من الحد الأقصى",
        variant: "destructive"
      });
      return;
    }
    
    // Process form submission
    toast({
      title: "تم نشر المهمة بنجاح",
      description: "سيتم إشعار الصنايعية المتخصصين بمهمتك الجديدة",
    });
    
    // Reset form data
    setFormData({
      title: '',
      category: '',
      description: '',
      governorate: '',
      city: '',
      address: '',
      budgetMin: '',
      budgetMax: '',
    });
    setSelectedGovernorate('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">نشر مهمة جديدة</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">عنوان المهمة</Label>
          <Input
            id="title"
            name="title"
            placeholder="مثال: تصليح تسريب مياه في المطبخ"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="category">التصنيف</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر تصنيف المهمة" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(category => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="description">وصف المهمة</Label>
          <Textarea
            id="description"
            name="description"
            rows={5}
            placeholder="اشرح بالتفصيل المهمة المطلوبة وأي متطلبات خاصة..."
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="governorate">المحافظة</Label>
            <Select
              value={formData.governorate}
              onValueChange={(value) => handleSelectChange('governorate', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المحافظة" />
              </SelectTrigger>
              <SelectContent>
                {GOVERNORATES.map(governorate => (
                  <SelectItem key={governorate.id} value={governorate.name}>
                    {governorate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="city">المدينة</Label>
            <Select
              value={formData.city}
              onValueChange={(value) => handleSelectChange('city', value)}
              disabled={!selectedGovernorate}
            >
              <SelectTrigger>
                <SelectValue placeholder={!selectedGovernorate ? "اختر المحافظة أولاً" : "اختر المدينة"} />
              </SelectTrigger>
              <SelectContent>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="address">العنوان التفصيلي (اختياري)</Label>
          <Input
            id="address"
            name="address"
            placeholder="العنوان التفصيلي للموقع"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Label>الميزانية (اختياري)</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budgetMin">الحد الأدنى (ج.م)</Label>
              <Input
                id="budgetMin"
                name="budgetMin"
                type="number"
                placeholder="0"
                value={formData.budgetMin}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="budgetMax">الحد الأقصى (ج.م)</Label>
              <Input
                id="budgetMax"
                name="budgetMax"
                type="number"
                placeholder="1000"
                value={formData.budgetMax}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        
        {preselectedCraftsman && (
          <div className="bg-primary/5 p-4 rounded-lg">
            <p className="text-sm text-gray-600">سيتم إرسال هذه المهمة إلى صنايعي محدد</p>
          </div>
        )}
        
        <Button type="submit" className="w-full">
          نشر المهمة
        </Button>
      </form>
    </div>
  );
};

export default PostJobForm;
