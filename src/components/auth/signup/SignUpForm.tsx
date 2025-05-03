import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterFormValues, registerSchema, signUp } from '@/lib/auth';
import BasicInfoStep from './BasicInfoStep';
import LocationStep from './LocationStep';
import CraftsmanDetailsStep from './CraftsmanDetailsStep';
import { Spinner } from '@/components/ui/spinner';

interface SignUpFormProps {
  initialRole?: 'client' | 'craftsman';
}

const SignUpForm = ({ initialRole = 'client' }: SignUpFormProps) => {
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
      role: initialRole,
      specialty: '',
      bio: '',
      agreeTerms: false
    }
  });

  const role = form.watch('role');
  const countryCode = form.watch('countryCode');
  const phone = form.watch('phone');

  // إضافة مراقبة لرقم الهاتف للتحقق من صحته عند اختيار مصر
  if (countryCode === '+20' && phone) {
    const isValid = phone.startsWith('1') && phone.length === 10 && /^\d+$/.test(phone);
    if (!isValid && phone.length > 0) {
      form.setError('phone', {
        type: 'manual',
        message: 'رقم الهاتف المصري يجب أن يكون 10 أرقام تبدأ برقم 1'
      });
    }
  }

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    const step1Fields = ['name', 'email', 'phone', 'password', 'confirmPassword'];
    const step1Result = await form.trigger(step1Fields as any);
    
    if (step1Result) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };
  
  // Fixed: Changed function signature to match expected prop type
  const goToCraftsmanDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const step2Fields = ['governorate', 'city', 'agreeTerms'];
    form.trigger(step2Fields as any).then(step2Result => {
      if (step2Result) {
        setStep(3);
      }
    });
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
      // إضافة تأخير 1 ثانية لتجنب قيود الأمان
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { success, error } = await signUp(values);
      
      if (!success && error) {
        let errorMessage = error.message;
        
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
        description: "يمكنك الآن تسجيل الدخول",
      });
      
      // التوجيه إلى صفحة تسجيل الدخول بعد نجاح التسجيل
      navigate('/sign-in');
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-10">
        <Spinner size="lg" />
        <p className="mt-4 text-center text-muted-foreground">جاري إنشاء الحساب...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {step === 1 ? (
          <BasicInfoStep
            form={form}
            onNextStep={handleNextStep}
          />
        ) : step === 2 ? (
          <LocationStep
            form={form}
            role={role}
            isLoading={isLoading}
            onPrevStep={handlePrevStep}
            onNextStep={role === 'craftsman' ? goToCraftsmanDetails : undefined}
          />
        ) : (
          <CraftsmanDetailsStep
            form={form}
            isLoading={isLoading}
            onPrevStep={handlePrevStep}
          />
        )}
      </form>
    </Form>
  );
};

export default SignUpForm;
