import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/integrations/supabase/client';

// Define Egyptian governorates
const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "القليوبية", "الدقهلية", "الشرقية", "الغربية", 
  "المنوفية", "البحيرة", "كفر الشيخ", "دمياط", "بورسعيد", "الإسماعيلية", "السويس", 
  "الفيوم", "بني سويف", "المنيا", "أسيوط", "سوهاج", "قنا", "الأقصر", "أسوان", 
  "البحر الأحمر", "الوادي الجديد", "مطروح", "شمال سيناء", "جنوب سيناء"
];

// Define cities for each governorate
const CITIES = {
  "القاهرة": [
    "وسط البلد", "المعادي", "مدينة نصر", "مصر الجديدة", "العباسية", "حلوان", "شبرا", 
    "عين شمس", "التجمع الخامس", "الزمالك", "المرج", "السيدة زينب", "المطرية", "الوايلي", 
    "المنيل", "الخانكة", "العبور", "القاهرة الجديدة", "الشيخ زايد", "بدر", "15 مايو", 
    "المقطم", "النزهة", "الزيتون", "الزاوية الحمراء", "السلام", "طرة", "دار السلام", 
    "البساتين", "حدائق القبة", "الماظة", "مصر القديمة", "منشأة ناصر", "غرب القاهرة", 
    "شرق القاهرة"
  ],
  "الجيزة": [
    "6 أكتوبر", "بولاق الدكرور", "الدقي", "العجوزة", "الهرم", "البدرشين", "كرداسة", 
    "أطفيح", "الصف", "العياط", "الواحات البحرية", "منشأة القناطر", "أوسيم", "كفر حكيم", 
    "أبو النمرس", "الوراق", "المنيب", "إمبابة", "المناشي", "العمرانية", "الطالبية", 
    "أبو رواش", "كفر غطاطي"
  ],
  // ... keep all other governorate cities
} as const;

const PostJobForm = () => {
  const [searchParams] = useSearchParams();
  const preselectedCraftsman = searchParams.get('craftsman');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isClient } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (selectedGovernorate) {
      setCities(CITIES[selectedGovernorate as keyof typeof CITIES] || []);
      if (formData.city && !CITIES[selectedGovernorate as keyof typeof CITIES]?.includes(formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    } else {
      setCities([]);
    }
  }, [selectedGovernorate, formData.city]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'governorate') {
      setSelectedGovernorate(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !isClient) {
      toast({
        title: "غير مصرح",
        description: "يجب أن تكون عميل مسجل لنشر مهمة جديدة",
        variant: "destructive"
      });
      return;
    }
    
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

    setIsSubmitting(true);
    
    try {
      // Prepare job data for Supabase
      const jobData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        governorate: formData.governorate,
        city: formData.city,
        address: formData.address || null,
        budget_min: formData.budgetMin ? Number(formData.budgetMin) : null,
        budget_max: formData.budgetMax ? Number(formData.budgetMax) : null,
        client_id: user.id,
        status: 'open',
        craftsman_id: preselectedCraftsman || null,
      };
      
      // Insert the job into the database
      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "تم نشر المهمة بنجاح",
        description: "سيتم إشعار الصنايعية المتخصصين بمهمتك الجديدة",
      });
      
      // Redirect to jobs page
      navigate('/jobs');
    } catch (error: any) {
      console.error("Error posting job:", error);
      toast({
        title: "خطأ في النظام",
        description: error.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">نشر مهمة جديدة</h2>
      
      {!isClient && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-6">
          <p className="text-yellow-800">فقط العملاء يمكنهم نشر مهام جديدة. إذا كنت صنايعي، يمكنك البحث عن المهام المتاحة والتقدم لها.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">عنوان المهمة</Label>
          <Input
            id="title"
            name="title"
            placeholder="مثال: تصليح تسريب مياه في المطبخ"
            value={formData.title}
            onChange={handleChange}
            disabled={isSubmitting || !isClient}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="category">التصنيف</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange('category', value)}
            disabled={isSubmitting || !isClient}
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
            disabled={isSubmitting || !isClient}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="governorate">المحافظة</Label>
            <Select
              value={formData.governorate}
              onValueChange={(value) => handleSelectChange('governorate', value)}
              disabled={isSubmitting || !isClient}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المحافظة" />
              </SelectTrigger>
              <SelectContent>
                {GOVERNORATES.map(governorate => (
                  <SelectItem key={governorate} value={governorate}>
                    {governorate}
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
              disabled={isSubmitting || !isClient || !selectedGovernorate}
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
            disabled={isSubmitting || !isClient}
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
                disabled={isSubmitting || !isClient}
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
                disabled={isSubmitting || !isClient}
              />
            </div>
          </div>
        </div>
        
        {preselectedCraftsman && (
          <div className="bg-primary/5 p-4 rounded-lg">
            <p className="text-sm text-gray-600">سيتم إرسال هذه المهمة إلى صنايعي محدد</p>
          </div>
        )}
        
        <Button type="submit" className="w-full" disabled={isSubmitting || !isClient}>
          {isSubmitting ? (
            <>
              <Spinner size="sm" className="mr-2" /> جارِ النشر...
            </>
          ) : (
            "نشر المهمة"
          )}
        </Button>
      </form>
    </div>
  );
};

export default PostJobForm;
