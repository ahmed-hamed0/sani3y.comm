
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_FREE_APPLICATIONS = 5;

export function useSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [remainingFreeApplications, setRemainingFreeApplications] = useState(DEFAULT_FREE_APPLICATIONS);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!user) {
        setIsSubscribed(false);
        setRemainingFreeApplications(DEFAULT_FREE_APPLICATIONS);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // في التطبيق الفعلي، يمكننا الاستعلام عن حالة الاشتراك من قاعدة البيانات
        // هنا نضع تطبيق تجريبي بسيط لإدارة عدد الطلبات المجانية
        
        const { data, error } = await supabase
          .from('user_applications_count')
          .select('free_applications_used')
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // No results error
          throw error;
        }
        
        // إذا كان المستخدم موجود في الجدول، نحسب العدد المتبقي من الطلبات المجانية
        if (data) {
          const used = data.free_applications_used || 0;
          const remaining = Math.max(0, DEFAULT_FREE_APPLICATIONS - used);
          setRemainingFreeApplications(remaining);
        } else {
          // إذا كان المستخدم جديد، نضع العدد الافتراضي
          setRemainingFreeApplications(DEFAULT_FREE_APPLICATIONS);
        }
        
        // في تطبيق حقيقي، سنتحقق من وجود اشتراك فعال
        setIsSubscribed(false);
      } catch (error) {
        console.error('Error fetching subscription status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptionStatus();
  }, [user, refreshTrigger]);
  
  const useApplication = async () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "يرجى تسجيل الدخول لتقديم عرض على المهمة",
        variant: "destructive",
      });
      return false;
    }
    
    if (isSubscribed) {
      // إذا كان المستخدم مشترك، فيمكنه استخدام التطبيق بلا حدود
      return true;
    }
    
    if (remainingFreeApplications <= 0) {
      toast({
        title: "انتهت الطلبات المجانية",
        description: "لقد استخدمت جميع طلباتك المجانية. يرجى الاشتراك للحصول على طلبات غير محدودة.",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      // تحديث عدد الطلبات المستخدمة في قاعدة البيانات
      const { error } = await supabase
        .from('user_applications_count')
        .upsert(
          { 
            user_id: user.id, 
            free_applications_used: DEFAULT_FREE_APPLICATIONS - remainingFreeApplications + 1 
          },
          { onConflict: 'user_id' }
        );
        
      if (error) throw error;
      
      // تحديث العدد المتبقي محلياً
      setRemainingFreeApplications(prev => prev - 1);
      
      return true;
    } catch (error) {
      console.error('Error updating application count:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث عدد الطلبات. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const refreshSubscription = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return {
    isSubscribed,
    remainingFreeApplications,
    loading,
    useApplication,
    refreshSubscription,
  };
}
