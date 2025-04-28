import { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile, createUserProfile } from '@/lib/profile';
import { UserRole } from '@/types';

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
    let profileCreationAttempted = false;
    
    const checkCurrentUser = async () => {
      try {
        console.log('Checking current user...');
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!mounted) return;
            
            console.log('Auth state changed:', event, session?.user?.email);
            
            if (session?.user) {
              const userData = session.user as UserData;
              userData.role = null;
              setUser(userData);
              
              setTimeout(async () => {
                if (!mounted) return;
                try {
                  await loadUserProfile(userData);
                } catch (error) {
                  console.error("Error loading profile in event listener:", error);
                  setLoading(false);
                }
              }, 500);
            } else {
              if (mounted) {
                setUser(null);
                setRole(null);
                setLoading(false);
              }
            }
          }
        );
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          console.log('Session found, user:', session.user.email);
          const userData = session.user as UserData;
          userData.role = null;
          setUser(userData);
          
          await loadUserProfile(userData);
        } else {
          console.log('No active session found');
          if (mounted) {
            setUser(null);
            setRole(null);
            setLoading(false);
          }
        }
        
        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error checking current user:', error);
        if (mounted) setLoading(false);
      }
    };
    
    const loadUserProfile = async (userData: UserData) => {
      try {
        console.log('Loading profile for user:', userData.id);
        const { success, data, error: profileError } = await getUserProfile(userData.id);
        
        if (success && data && mounted) {
          console.log('Profile found:', data);
          const userRole = data.role as UserRole;
          setRole(userRole);
          userData.role = userRole;
          setUser({ ...userData });
        } else {
          console.log('No profile found or error:', profileError);
          
          if (!profileCreationAttempted) {
            profileCreationAttempted = true;
            
            try {
              console.log('Creating profile for user:', userData.id);
              const defaultRole: UserRole = 'client';
              
              const { data: userMetadata } = await supabase.auth.getUser();
              const metadata = userMetadata?.user?.user_metadata || {};
              
              const { success: createSuccess, data: newProfile } = await createUserProfile({
                id: userData.id,
                full_name: metadata.full_name || userData.email?.split('@')[0] || 'مستخدم جديد',
                role: defaultRole,
                phone: metadata.phone || '',
                governorate: metadata.governorate || '',
                city: metadata.city || '',
              });
              
              if (createSuccess && newProfile && mounted) {
                console.log('New profile created successfully:', newProfile);
                const userRole = newProfile.role as UserRole;
                setRole(userRole);
                userData.role = userRole;
                setUser({ ...userData });
              }
            } catch (createError) {
              console.error('Error creating profile:', createError);
            }
          }
        }
        
        if (mounted) setLoading(false);
      } catch (error) {
        console.error('Error loading user profile:', error);
        if (mounted) setLoading(false);
      }
    };
    
    checkCurrentUser();
    
    return () => {
      mounted = false;
    };
  }, []);

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
