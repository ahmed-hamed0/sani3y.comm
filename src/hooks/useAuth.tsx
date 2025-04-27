
import { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile, createUserProfile } from '@/lib/profile';
import { UserRole } from '@/types';

// تعديل نوع UserData ليمتد بشكل صحيح من SupabaseUser
type UserData = SupabaseUser & {
  role?: UserRole | null;
};

type AuthContextType = {
  user: UserData | null;
  loading: boolean;
  role: UserRole | null;
  isClient: boolean;
  isCraftsman: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  isClient: false,
  isCraftsman: false
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole | null>(null);
  
  useEffect(() => {
    let mounted = true;
    
    // تحقق من وجود جلسة حالية أولاً
    const checkCurrentUser = async () => {
      try {
        console.log('Checking current user...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          console.log('Session found, user:', session.user.email);
          const userData = session.user as UserData;
          userData.role = null;
          setUser(userData);
          
          // استعلام عن دور المستخدم والتأكد من وجود ملف شخصي
          const { success, data, error: profileError } = await getUserProfile(userData.id);
          
          if (success && data && mounted) {
            console.log('Profile found:', data);
            const userRole = data.role as UserRole;
            setRole(userRole);
            userData.role = userRole;
            setUser({ ...userData });
          } else {
            console.log('No profile found or error:', profileError);
          }
        } else {
          console.log('No active session found');
        }
        
        if (mounted) setLoading(false);
      } catch (error) {
        console.error('Error checking current user:', error);
        if (mounted) setLoading(false);
      }
    };
    
    // تعيين مستمع لتغييرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, 'Session:', session?.user?.email);
        
        if (session?.user) {
          const userData = session.user as UserData;
          userData.role = null;
          setUser(userData);
          
          // تأخير قليل قبل استعلام الملف الشخصي لتجنب مشاكل التزامن
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              console.log('Fetching user profile for', userData.id);
              const { success, data, error } = await getUserProfile(userData.id);
                
              if (success && data && mounted) {
                console.log('Profile loaded in onAuthStateChange:', data);
                const userRole = data.role as UserRole;
                setRole(userRole);
                userData.role = userRole;
                setUser({ ...userData });
              } else {
                console.error('Error loading profile:', error);
              }
              
              if (mounted) setLoading(false);
            } catch (error) {
              console.error('Error fetching user role:', error);
              if (mounted) setLoading(false);
            }
          }, 100); // تأخير أكبر للتأكد من اكتمال عملية التسجيل
        } else {
          if (mounted) {
            setUser(null);
            setRole(null);
            setLoading(false);
          }
        }
      }
    );
    
    checkCurrentUser();
    
    // تنظيف المستمع عند إلغاء تحميل المكون
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // تحديد نوع المستخدم (عميل أو صنايعي)
  const isClient = role === 'client';
  const isCraftsman = role === 'craftsman';

  return (
    <AuthContext.Provider value={{ user, loading, role, isClient, isCraftsman }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/sign-in', { replace: true });
    }
  }, [navigate, user, loading]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
  }

  return user ? <>{children}</> : null;
}

export function RequireClient({ children }: { children: React.ReactNode }) {
  const { user, loading, isClient } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/sign-in', { replace: true });
      } else if (!isClient) {
        navigate('/', { replace: true });
      }
    }
  }, [navigate, user, loading, isClient]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
  }

  return (user && isClient) ? <>{children}</> : null;
}

export function RequireCraftsman({ children }: { children: React.ReactNode }) {
  const { user, loading, isCraftsman } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/sign-in', { replace: true });
      } else if (!isCraftsman) {
        navigate('/', { replace: true });
      }
    }
  }, [navigate, user, loading, isCraftsman]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">جاري التحميل...</div>;
  }

  return (user && isCraftsman) ? <>{children}</> : null;
}
