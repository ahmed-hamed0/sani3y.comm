
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
import { getUserProfile } from '@/lib/profile';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); // حالة للتتبع عملية التوجيه
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting to sign in user:", values.email);
      const { success, error, data } = await signIn(values);
      
      if (!success && error) {
        let errorMessage = error.message;
        
        // ترجمة رسائل الخطأ الشائعة
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "بيانات تسجيل الدخول غير صحيحة";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "لم يتم تأكيد البريد الإلكتروني بعد";
        }
        
        toast({
          title: "خطأ في تسجيل الدخول",
          description: errorMessage,
          variant: "destructive"
        });
        
        setIsLoading(false);
        return;
      }
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بعودتك إلى صنايعي.كوم",
      });
      
      // تعيين حالة التوجيه إلى true عندما نبدأ في التوجيه
      setIsRedirecting(true);
      
      // زيادة وقت التأخير لضمان اكتمال عمليات المصادقة وتحميل الملف الشخصي
      setTimeout(async () => {
        try {
          // انتظار تحميل المزيد من البيانات وإنشاء الملف الشخصي إذا لزم الأمر
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // توجيه المستخدم إلى صفحة الملف الشخصي
          navigate('/profile');
        } catch (error) {
          console.error("Error during redirect:", error);
        } finally {
          setIsLoading(false);
          setIsRedirecting(false);
        }
      }, 3000); // زيادة التأخير لـ 3 ثوان
    } catch (error) {
      console.error("Error in sign in process:", error);
      toast({
        title: "خطأ في النظام",
        description: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

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
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    نسيت كلمة المرور؟
                  </Link>
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
