
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { signIn, LoginFormValues } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';
import { getUserProfile, createUserProfile } from '@/lib/profile';
import { toast } from '@/components/ui/sonner';
import { UserRole } from '@/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from '@/integrations/supabase/client';

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetSent, setIsResetSent] = useState(false);
  const { toast: hookToast } = useToast();
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      toast("الرجاء إدخال بريد إلكتروني صحيح", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) {
        toast("خطأ في إرسال رسالة إعادة تعيين كلمة المرور: " + error.message, {
          style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
        });
      } else {
        setIsResetSent(true);
        toast("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
      }
    } catch (error) {
      console.error("Error in password reset:", error);
      toast("حدث خطأ غير متوقع أثناء محاولة إعادة تعيين كلمة المرور", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting to sign in user:", values.email);
      const { success, error, data } = await signIn(values);
      
      if (!success && error) {
        let errorMessage = error.message;
        
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "بيانات تسجيل الدخول غير صحيحة";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "لم يتم تأكيد البريد الإلكتروني بعد";
        }
        
        toast("خطأ في تسجيل الدخول: " + errorMessage, {
          style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
        });
        
        setIsLoading(false);
        return;
      }
      
      toast("تم تسجيل الدخول بنجاح. مرحباً بعودتك إلى صنايعي.كوم");
      
      // تعيين حالة التوجيه إلى true عندما نبدأ في التوجيه
      setIsRedirecting(true);
      
      if (data?.user) {
        // إذا كان المستخدم يريد تذكر تسجيل الدخول
        if (values.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
        
        try {
          console.log("Checking profile for user:", data.user.id);
          
          // تأكد من وجود ملف شخصي للمستخدم أو إنشاء ملف جديد
          const { success: profileSuccess, data: profileData } = await getUserProfile(data.user.id);
          
          // إذا لم يتم العثور على ملف شخصي، قم بإنشاء ملف جديد
          if (!profileSuccess || !profileData) {
            console.log("No profile found, creating new profile for user:", data.user.id);
            
            const metadata = data.user.user_metadata || {};
            
            // إنشاء ملف شخصي مع بيانات افتراضية إذا لم تتوفر البيانات
            const createProfileData = {
              id: data.user.id,
              full_name: metadata.full_name || data.user.email?.split('@')[0] || 'مستخدم جديد',
              role: 'client' as UserRole,
              phone: metadata.phone || '+201000000000', // رقم افتراضي لتجنب مشكلات التحقق
              governorate: metadata.governorate || 'القاهرة', // قيمة افتراضية
              city: metadata.city || 'القاهرة', // قيمة افتراضية
            };
            
            console.log("Creating new profile with data:", createProfileData);
            const { success: createSuccess, data: newProfile, error: createError } = await createUserProfile(createProfileData);
            
            if (!createSuccess || createError) {
              console.error("Error creating profile:", createError);
              // عرض رسالة خطأ ولكن مواصلة عملية تسجيل الدخول
              toast("تم تسجيل الدخول ولكن قد تكون هناك مشكلة في إنشاء الملف الشخصي", {
                style: { backgroundColor: '#f59e0b', color: 'white' }
              });
            } else {
              console.log("Profile created successfully:", newProfile);
            }
          } else {
            console.log("Profile found:", profileData);
          }
          
          // تحقق يدوي من الجلسة للتأكد من بقائها نشطة
          const { data: sessionCheck } = await supabase.auth.getSession();
          console.log("Current session after profile check:", sessionCheck?.session?.user?.id);
          
          if (!sessionCheck?.session) {
            console.error("Session lost after profile check!");
            toast("خطأ في الجلسة: تم فقدان جلسة المستخدم، يرجى المحاولة مرة أخرى", {
              style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
            });
            setIsLoading(false);
            setIsRedirecting(false);
            return;
          }
        } catch (profileError) {
          console.error("Error checking/creating profile:", profileError);
          // لا نريد إيقاف عملية تسجيل الدخول بسبب خطأ في الملف الشخصي
        }
      }
      
      // زيادة وقت التأخير لضمان اكتمال عمليات المصادقة وتحميل الملف الشخصي
      setTimeout(() => {
        // تحقق نهائي من الجلسة قبل التوجيه
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            console.log("Session confirmed before redirect:", session.user.id);
            navigate('/profile');
          } else {
            console.error("No session found before redirect!");
            toast("خطأ في الجلسة: تم فقدان جلسة المستخدم، يرجى المحاولة مرة أخرى", {
              style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
            });
          }
          setIsLoading(false);
          setIsRedirecting(false);
        });
      }, 3000);
    } catch (error) {
      console.error("Error in sign in process:", error);
      toast("خطأ في النظام: حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
      setIsLoading(false);
    }
  };

  if (showResetPassword) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">إعادة تعيين كلمة المرور</h1>
        
        {isResetSent ? (
          <div className="text-center">
            <p className="mb-4">تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.</p>
            <p className="mb-6">يرجى التحقق من بريدك الإلكتروني واتباع التعليمات.</p>
            <Button 
              onClick={() => {
                setShowResetPassword(false);
                setIsResetSent(false);
                setResetEmail('');
              }}
            >
              العودة إلى تسجيل الدخول
            </Button>
          </div>
        ) : (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">البريد الإلكتروني</Label>
              <Input 
                id="reset-email" 
                type="email" 
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
                disabled={isLoading}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner size="sm" className="ml-2" />
                  جاري الإرسال...
                </>
              ) : (
                "إرسال رابط إعادة التعيين"
              )}
            </Button>
            
            <Button
              type="button" 
              variant="ghost" 
              className="w-full mt-2"
              onClick={() => setShowResetPassword(false)}
              disabled={isLoading}
            >
              العودة إلى تسجيل الدخول
            </Button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">تسجيل الدخول</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <FormControl>
                  <Input id="email" type="email" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Button 
                    type="button"
                    variant="link" 
                    className="p-0 h-auto text-sm"
                    onClick={() => setShowResetPassword(true)}
                  >
                    نسيت كلمة المرور؟
                  </Button>
                </div>
                <FormControl>
                  <Input id="password" type="password" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-x-reverse">
                <FormControl>
                  <Checkbox 
                    id="remember" 
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <Label htmlFor="remember">تذكرني</Label>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading || isRedirecting}>
            {isLoading ? (
              <>
                <Spinner size="sm" className="ml-2" />
                {isRedirecting ? "جاري التوجيه..." : "جاري تسجيل الدخول..."}
              </>
            ) : (
              "تسجيل الدخول"
            )}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center">
        <p>
          ليس لديك حساب؟{" "}
          <Link to="/sign-up" className="text-primary hover:underline">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
