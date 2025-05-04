
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

interface JobStatusCardProps {
  status: JobStatus;
  canApply: boolean;
  isAssignedCraftsman: boolean;
  isInProgressJob: boolean;
  onApplyClick?: () => void;
  onMarkComplete?: () => void;
}

export const JobStatusCard = ({ 
  status, 
  canApply, 
  isAssignedCraftsman,
  isInProgressJob,
  onApplyClick,
  onMarkComplete
}: JobStatusCardProps) => {
  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'open':
        return <Clock className="w-12 h-12 text-blue-500" />;
      case 'in_progress':
        return <AlertCircle className="w-12 h-12 text-amber-500" />;
      case 'completed':
        return <CheckCircle2 className="w-12 h-12 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-12 h-12 text-red-500" />;
      default:
        return <AlertCircle className="w-12 h-12 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>حالة المهمة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center text-center">
          {getStatusIcon(status)}
          <h3 className="mt-2 mb-1 font-semibold">
            {
              status === 'open' ? 'متاحة للتقديم' :
              status === 'in_progress' ? 'قيد التنفيذ' :
              status === 'completed' ? 'تم الانتهاء' :
              'تم إلغاؤها'
            }
          </h3>
          <p className="text-sm text-muted-foreground">
            {
              status === 'open' ? 'هذه المهمة متاحة حالياً للتقديم من الصنايعية' :
              status === 'in_progress' ? 'هذه المهمة قيد التنفيذ حالياً' :
              status === 'completed' ? 'تم الانتهاء من هذه المهمة بنجاح' :
              'تم إلغاء هذه المهمة'
            }
          </p>
        </div>
      </CardContent>
      {status === 'open' && canApply && onApplyClick && (
        <CardFooter>
          <Button 
            className="w-full"
            onClick={onApplyClick}
          >
            تقديم عرض
          </Button>
        </CardFooter>
      )}
      {isAssignedCraftsman && isInProgressJob && onMarkComplete && (
        <CardFooter>
          <Button 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={onMarkComplete}
          >
            <CheckCircle2 className="ml-1 h-4 w-4" />
            تم الانتهاء من المهمة
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
