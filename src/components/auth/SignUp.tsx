
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CATEGORIES, GOVERNORATES } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { signUp, RegisterFormValues, registerSchema } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from 'lucide-react';

const countryCodesData = [
  { code: '+20', country: 'مصر', flag: '🇪🇬' },
  { code: '+966', country: 'السعودية', flag: '🇸🇦' },
  { code: '+971', country: 'الإمارات', flag: '🇦🇪' },
];

const SignUp = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'craftsman' ? 'craftsman' : 'client';
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      countryCode: '+20',
      password: '',
      confirmPassword: '',
      governorate: '',
      city: '',
      role: defaultRole as 'client' | 'craftsman',
      specialty: '',
      bio: '',
      agreeTerms: false
    }
  });

  const role = form.watch('role');
  const selectedGovernorate = form.watch('governorate');
  const cities = GOVERNORATES.find(g => g.name === selectedGovernorate)?.cities || [];

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صحة بيانات الخطوة الأولى
    const step1Fields = ['name', 'email', 'phone', 'password', 'confirmPassword'];
    const step1Result = await form.trigger(step1Fields as any);
    
    if (step1Result) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      const { success, error } = await signUp(values);
      
      if (!success && error) {
        let errorMessage = error.message;
        
        // ترجمة رسائل الخطأ الشائعة
        if (error.message.includes("User already registered")) {
          errorMessage = "البريد الإلكتروني مسجل بالفعل";
        }
        
        toast({
          title: "خطأ في إنشاء الحساب",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "مرحباً بك في صنايعي.كوم",
      });
      
      // الانتقال إلى الصفحة الرئيسية بعد التسجيل بنجاح
      navigate('/');
    } catch (error) {
      toast({
        title: "خطأ في النظام",
        description: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">إنشاء حساب جديد</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mb-6">
            <Label>نوع الحساب</Label>
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup 
                      value={field.value} 
                      onValueChange={field.onChange}
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {step === 1 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <FormControl>
                      <Input id="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <FormControl>
                      <Input id="email" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <div className="flex gap-2">
                      <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field: countryField }) => (
                          <Select
                            value={countryField.value}
                            onValueChange={countryField.onChange}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {countryCodesData.map((country) => (
                                <SelectItem key={country.code} value={country.code}>
                                  <span className="flex items-center gap-2">
                                    <span>{country.flag}</span>
                                    <span>{country.code}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FormControl>
                        <Input 
                          id="phone" 
                          type="tel"
                          value={field.value}
                          onChange={(e) => {
                            // تنظيف الإدخال ليحتوي فقط على الأرقام
                            const cleaned = e.target.value.replace(/[^\d]/g, '');
                            field.onChange(cleaned);
                          }}
                          className="flex-1 text-left"
                          dir="ltr"
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="password">كلمة المرور</Label>
                    <FormControl>
                      <Input id="password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <FormControl>
                      <Input id="confirmPassword" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-6">
                <Button 
                  type="button"
                  onClick={handleNextStep}
                  className="w-full"
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
          
          {step === 2 && (
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
                  onClick={handlePrevStep}
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
          )}
        </form>
      </Form>
      
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
