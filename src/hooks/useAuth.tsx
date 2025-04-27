
import { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@/types';

// Modify UserData type to properly extend SupabaseUser
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
    // تعيين مستمع لتغييرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        
        if (currentUser) {
          // Create a UserData object that satisfies the type
          const userData = currentUser as UserData;
          userData.role = null; // Initialize with null, will be updated if profile exists
          setUser(userData);
          
          // إذا كان هناك مستخدم حالي، استعلم عن دوره
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentUser.id)
            .single();
            
          if (data) {
            const userRole = data.role as UserRole;
            setRole(userRole);
            setUser(prevUser => {
              if (prevUser) {
                return {
                  ...prevUser,
                  role: userRole
                };
              }
              return null;
            });
          }
        } else {
          setUser(null);
          setRole(null);
        }
        
        setLoading(false);
      }
    );

    // التحقق من وجود جلسة حالية
    const checkCurrentUser = async () => {
      const { user: currentUser } = await getCurrentUser();
      
      if (currentUser) {
        // Cast properly to UserData type
        const userData = currentUser as UserData;
        userData.role = null; // Initialize with null
        setUser(userData);
        
        // استعلام عن دور المستخدم
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();
          
        if (data) {
          const userRole = data.role as UserRole;
          setRole(userRole);
          setUser(prevUser => {
            if (prevUser) {
              return {
                ...prevUser,
                role: userRole
              };
            }
            return null;
          });
        }
      }
      
      setLoading(false);
    };
    
    checkCurrentUser();

    // تنظيف المستمع عند إلغاء تحميل المكون
    return () => {
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
