
import MainLayout from '@/components/layouts/MainLayout';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/auth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';

const Subscription = () => {
  const { user, loading: authLoading } = useAuth();
  const { isSubscribed, remainingFreeApplications, loading: subLoading } = useSubscription();
  
  const loading = authLoading || subLoading;
  
  return (
    <MainLayout>
      <div className="container-custom py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" />
          </div>
        ) : !user ? (
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">تسجيل الدخول مطلوب</h1>
            <p className="mb-6 text-muted-foreground">
              يرجى تسجيل الدخول أو إنشاء حساب للاشتراك في خدماتنا المميزة
            </p>
            <Button asChild>
              <Link to="/sign-in">تسجيل الدخول</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-muted rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-2">حالة اشتراكك</h2>
              <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div>
                  {isSubscribed ? (
                    <p className="text-lg">أنت مشترك حالياً في خدماتنا المميزة. يمكنك الاستفادة من جميع المميزات بلا قيود.</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-lg">أنت تستخدم النسخة المجانية. باقي لديك <span className="font-bold text-primary">{remainingFreeApplications} طلبات مجانية</span>.</p>
                      <p>اشترك الآن للحصول على طلبات غير محدودة ومميزات حصرية!</p>
                    </div>
                  )}
                </div>
                {!isSubscribed && (
                  <Button asChild className="whitespace-nowrap">
                    <a href="#plans">عرض خطط الاشتراك</a>
                  </Button>
                )}
              </div>
            </div>
            
            <div id="plans">
              <SubscriptionPlans />
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Subscription;
