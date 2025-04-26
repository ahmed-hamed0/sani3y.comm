
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

const SignUpForm = () => {
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
      role: 'client',
      specialty: '',
      bio: '',
      agreeTerms: false
    }
  });

  const role = form.watch('role');

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
  
  const goToCraftsmanDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const step2Fields = ['governorate', 'city', 'agreeTerms'];
    const step2Result = await form.trigger(step2Fields as any);
    
    if (step2Result) {
      setStep(3);
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    
    try {
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
        description: "مرحباً بك في صنايعي.كوم",
      });
      
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
