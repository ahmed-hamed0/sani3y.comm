
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

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
