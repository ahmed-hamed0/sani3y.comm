
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionPlan } from './types';
import { supabase } from '@/integrations/supabase/client';

const plans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'الاشتراك الشهري',
    description: 'اشتراك شهري بسعر مناسب',
    price: 14,
    period: 'monthly',
    features: [
      'تقدم على عدد غير محدود من المهام',
      'إضافة عدد غير محدود من المهام',
      'إمكانية التواصل مع العملاء',
      'الظهور في نتائج البحث المميزة',
      'دعم فني على مدار الساعة',
    ],
  },
  {
    id: 'yearly',
    name: 'الاشتراك السنوي',
    description: 'وفر أكثر مع الاشتراك السنوي',
    price: 149,
    period: 'yearly',
    features: [
      'كل مميزات الاشتراك الشهري',
      'خصم 30% على السعر السنوي',
      'شارة مميزة على الملف الشخصي',
      'أولوية في ظهور العروض للعملاء',
      'تقارير إحصائية متقدمة',
    ],
    popular: true,
  }
];

interface SubscriptionButtonProps {
  plan: SubscriptionPlan;
  loading: boolean;
  onSubscribe: (planId: string) => void;
}

const SubscriptionButton = ({ plan, loading, onSubscribe }: SubscriptionButtonProps) => (
  <Button 
    className="w-full" 
    onClick={() => onSubscribe(plan.id)} 
    disabled={loading}
  >
    {loading ? 'جاري المعالجة...' : `اشترك الآن - ${plan.price} ج.م`}
  </Button>
);

export function SubscriptionPlans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  
  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "يرجى تسجيل الدخول للاشتراك في إحدى الخطط",
        variant: "destructive",
      });
      return;
    }
    
    setLoadingPlanId(planId);
    
    try {
      // هنا سيتم إضافة المنطق الخاص بالاشتراك والدفع
      // يمكن استخدام خدمات مثل Stripe لمعالجة الدفع
      
      toast({
        title: "تم إرسال طلب الاشتراك",
        description: "سيتم تفعيل اشتراكك بعد اكتمال عملية الدفع",
      });
      
      // محاكاة لعملية الاشتراك - في التطبيق الفعلي يجب استخدام بوابة دفع
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "تم تفعيل الاشتراك بنجاح",
        description: "يمكنك الآن الاستفادة من جميع مميزات الاشتراك",
      });
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "خطأ في الاشتراك",
        description: "حدث خطأ أثناء معالجة طلب الاشتراك. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3">خطط الاشتراك</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          اختر الخطة المناسبة لاحتياجاتك. يمكنك تقديم 5 عروض مجانية أو إضافة 5 مهام مجانية قبل الحاجة للاشتراك.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`flex flex-col ${plan.popular ? 'border-primary border-2 shadow-lg' : ''}`}
          >
            {plan.popular && (
              <div className="bg-primary text-primary-foreground text-center py-1 font-medium text-sm">
                الأكثر توفيراً
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground mr-2">
                  ج.م / {plan.period === 'monthly' ? 'شهرياً' : 'سنوياً'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="bg-primary/20 p-1 rounded-full">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <SubscriptionButton 
                plan={plan} 
                loading={loadingPlanId === plan.id} 
                onSubscribe={handleSubscribe} 
              />
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">لماذا الاشتراك المدفوع؟</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">فرص أكبر</h4>
            <p className="text-muted-foreground">فرص غير محدودة للتقديم على المهام وزيادة دخلك</p>
          </div>
          <div className="p-6 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">ظهور مميز</h4>
            <p className="text-muted-foreground">أولوية الظهور في نتائج البحث للحصول على عملاء أكثر</p>
          </div>
          <div className="p-6 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">دعم متميز</h4>
            <p className="text-muted-foreground">دعم فني متميز على مدار الساعة لمساعدتك في أي وقت</p>
          </div>
        </div>
      </div>
    </div>
  );
}
