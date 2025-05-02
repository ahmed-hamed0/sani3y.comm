
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { governorates, cities } from "@/data/egyptianCities";

const categories = [
  "سباكة", "كهرباء", "دهان", "نجارة", "حدادة", "تبريد وتكييف", 
  "ألوميتال", "محارة", "بلاط", "نقاشة", "جبس", "زجاج", "أخرى"
];

const PostJobForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    governorate: "",
    city: "",
    address: "",
    budget_min: "",
    budget_max: "",
  });

  // Set available cities when governorate changes
  useEffect(() => {
    if (formData.governorate && cities[formData.governorate]) {
      setAvailableCities([...cities[formData.governorate]]);
    } else {
      setAvailableCities([]);
    }

    // Clear city when governorate changes
    if (formData.city && !cities[formData.governorate]?.includes(formData.city)) {
      setFormData(prev => ({ ...prev, city: "" }));
    }
  }, [formData.governorate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast("يجب تسجيل الدخول أولاً", { 
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' } 
      });
      return;
    }
    
    // Validate required fields
    const requiredFields = ['title', 'category', 'description', 'governorate', 'city'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast("يرجى ملء جميع الحقول المطلوبة", { 
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' } 
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const jobData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        governorate: formData.governorate,
        city: formData.city,
        address: formData.address || null,
        budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
        client_id: user.id,
        status: 'open'
      };
      
      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select('id')
        .single();
      
      if (error) {
        throw error;
      }
      
      toast("تم إنشاء المهمة بنجاح");
      navigate(`/job/${data.id}`);
      
    } catch (error) {
      console.error('Error posting job:', error);
      toast("حدث خطأ أثناء إنشاء المهمة", { 
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' } 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">نشر مهمة جديدة</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان المهمة</Label>
            <Input
              id="title"
              name="title"
              placeholder="أدخل عنوان المهمة"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">التصنيف</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="اختر تصنيف المهمة" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
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
              placeholder="أدخل وصفاً تفصيلياً للمهمة"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="governorate">المحافظة</Label>
            <Select
              value={formData.governorate}
              onValueChange={(value) => handleSelectChange("governorate", value)}
            >
              <SelectTrigger id="governorate">
                <SelectValue placeholder="اختر المحافظة" />
              </SelectTrigger>
              <SelectContent>
                {governorates.map((governorate) => (
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
              onValueChange={(value) => handleSelectChange("city", value)}
              disabled={!formData.governorate}
            >
              <SelectTrigger id="city">
                <SelectValue placeholder="اختر المدينة" />
              </SelectTrigger>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="address">العنوان التفصيلي (اختياري)</Label>
            <Input
              id="address"
              name="address"
              placeholder="أدخل العنوان التفصيلي"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget_min">الميزانية (من)</Label>
              <Input
                id="budget_min"
                name="budget_min"
                type="number"
                placeholder="الحد الأدنى"
                value={formData.budget_min}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <Label htmlFor="budget_max">الميزانية (إلى)</Label>
              <Input
                id="budget_max"
                name="budget_max"
                type="number"
                placeholder="الحد الأقصى"
                value={formData.budget_max}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "جاري النشر..." : "نشر المهمة"}
        </Button>
      </form>
    </Card>
  );
};

export default PostJobForm;
