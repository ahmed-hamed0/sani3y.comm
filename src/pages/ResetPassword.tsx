
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have the access token in URL
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) {
      setError('لم يتم العثور على رمز إعادة تعيين كلمة المرور.');
      return;
    }
    
    setIsResetting(true);
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password validation
    if (newPassword.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        setError(error.message);
        return;
      }
      
      toast("تم تغيير كلمة المرور بنجاح");
      
      // Sign out the user after password reset
      await supabase.auth.signOut();
      
      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        navigate('/sign-in', { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Error resetting password:", error);
      setError('حدث خطأ أثناء إعادة تعيين كلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">إعادة تعيين كلمة المرور</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
              {error}
            </div>
          )}
          
          {!isResetting ? (
            <div className="text-center">
              <p className="mb-4">رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.</p>
              <Button onClick={() => navigate('/sign-in')}>العودة إلى صفحة تسجيل الدخول</Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  disabled={isLoading}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="ml-2" />
                    جاري إعادة تعيين كلمة المرور...
                  </>
                ) : (
                  "تغيير كلمة المرور"
                )}
              </Button>
              
              <div className="text-center mt-4">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate('/sign-in')}
                  disabled={isLoading}
                >
                  العودة إلى تسجيل الدخول
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ResetPassword;
