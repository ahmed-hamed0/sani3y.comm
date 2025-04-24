
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CATEGORIES, GOVERNORATES } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const SignUp = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'craftsman' ? 'craftsman' : 'client';
  const [role, setRole] = useState<'client' | 'craftsman'>(defaultRole as 'client' | 'craftsman');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('');
  const [step, setStep] = useState<number>(1);
  const { toast } = useToast();

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    governorate: '',
    city: '',
    specialty: '',
    bio: '',
    agreeTerms: false
  });

  // Get cities based on selected governorate
  const cities = GOVERNORATES.find(g => g.name === selectedGovernorate)?.cities || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, agreeTerms: checked }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      // Validate step 1 fields
      if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى ملء جميع الحقول المطلوبة",
          variant: "destructive"
        });
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "خطأ في كلمة المرور",
          description: "كلمة المرور وتأكيدها غير متطابقين",
          variant: "destructive"
        });
        return;
      }
      
      setStep(2);
      return;
    }
    
    // Handle form submission
    if (step === 2) {
      // Validate step 2 fields
      if (!formData.governorate || !formData.city || (role === 'craftsman' && !formData.specialty)) {
        toast({
          title: "خطأ في البيانات",
          description: "يرجى ملء جميع الحقول المطلوبة",
          variant: "destructive"
        });
        return;
      }
      
      if (!formData.agreeTerms) {
        toast({
          title: "الشروط والأحكام",
          description: "يجب الموافقة على الشروط والأحكام للمتابعة",
          variant: "destructive"
        });
        return;
      }

      // Process signup (just a mock for now)
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "مرحباً بك في صنايعي.كوم، ستتم إعادة توجيهك للصفحة الرئيسية",
      });
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">إنشاء حساب جديد</h1>
      
      {/* Role Selection */}
      <div className="mb-6">
        <Label>نوع الحساب</Label>
        <RadioGroup 
          value={role} 
          onValueChange={(value: 'client' | 'craftsman') => setRole(value)}
          className="flex justify-center gap-8 mt-3"
        >
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="client" id="client" />
            <Label htmlFor="client" className="cursor-pointer">عميل</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="craftsman" id="craftsman" />
            <Label htmlFor="craftsman" className="cursor-pointer">صنايعي</Label>
          </div>
        </RadioGroup>
      </div>
      
      <form onSubmit={handleNextStep}>
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={formData.phone}
                onChange={handleChange}
                required 
              />
            </div>
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                value={formData.password}
                onChange={handleChange}
                required 
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                value={formData.confirmPassword}
                onChange={handleChange}
                required 
              />
            </div>
          </div>
        )}
        
        {/* Step 2: Additional Information */}
        {step === 2 && (
          <div className="space-y-4">
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
            
            {/* Craftsman specific fields */}
            {role === 'craftsman' && (
              <>
                <div>
                  <Label htmlFor="specialty">التخصص</Label>
                  <Select
                    value={formData.specialty}
                    onValueChange={(value) => handleSelectChange('specialty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التخصص" />
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
                  <Label htmlFor="bio">نبذة مختصرة عنك</Label>
                  <Input 
                    id="bio" 
                    name="bio" 
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="اكتب نبذة عن خبراتك ومهاراتك"
                  />
                </div>
              </>
            )}
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id="terms" 
                checked={formData.agreeTerms}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="terms" className="text-sm">
                أوافق على <Link to="/terms" className="text-primary hover:underline">الشروط والأحكام</Link>
              </Label>
            </div>
          </div>
        )}
        
        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          {step === 2 && (
            <Button 
              type="button"
              variant="outline"
              onClick={handlePrevStep}
            >
              السابق
            </Button>
          )}
          <Button 
            type="submit"
            className={step === 1 ? "w-full" : ""}
          >
            {step === 1 ? "التالي" : "إنشاء الحساب"}
          </Button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p>
          لديك حساب بالفعل؟{" "}
          <Link to="/sign-in" className="text-primary hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
