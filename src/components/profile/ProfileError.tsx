
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';

interface ProfileErrorProps {
  error: string;
  isRefreshing: boolean;
  onRetry: () => void;
}

export const ProfileError = ({ error, isRefreshing, onRetry }: ProfileErrorProps) => {
  const navigate = useNavigate();

  return (
    <div className="container-custom py-12">
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ في تحميل الملف الشخصي</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      
      <div className="flex justify-center mt-6">
        <Button 
          variant="outline" 
          onClick={onRetry} 
          className="mr-4"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <Spinner size="sm" className="ml-2" /> جاري التحديث...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 ml-2" /> إعادة المحاولة
            </>
          )}
        </Button>
        <Button onClick={() => navigate('/')}>العودة إلى الصفحة الرئيسية</Button>
      </div>
    </div>
  );
};
