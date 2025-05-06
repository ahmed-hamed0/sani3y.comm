
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useJobApplication } from "@/hooks/useJobApplication";
import { useSubscription } from "@/hooks/useSubscription";
import { ApplicationForm } from "./application/ApplicationForm";
import { LoadingState } from "./application/LoadingState";
import { useState } from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

export interface JobApplicationProps {
  jobId: string;
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => void;
}

export function JobApplication({
  jobId, 
  isOpen,
  onClose,
  onSuccess
}: JobApplicationProps) {
  const { isSubmitting, submitApplication } = useJobApplication(jobId, onSuccess);
  const { isSubscribed, remainingFreeApplications, useApplication } = useSubscription();
  const [showSubscriptionPrompt, setShowSubscriptionPrompt] = useState(false);

  const handleSubmit = async (values: any) => {
    // إذا كان المستخدم مشترك أو لديه طلبات مجانية متبقية
    if (isSubscribed || remainingFreeApplications > 0) {
      const canProceed = await useApplication();
      if (canProceed) {
        await submitApplication(values);
      }
    } else {
      // إظهار نافذة الاشتراك إذا لم يكن هناك طلبات مجانية متبقية
      setShowSubscriptionPrompt(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">تقديم عرض على المهمة</DialogTitle>
        </DialogHeader>

        {isSubmitting ? (
          <LoadingState />
        ) : showSubscriptionPrompt ? (
          <div className="py-4 text-center space-y-4">
            <h3 className="text-lg font-medium">انتهت الطلبات المجانية</h3>
            <p className="text-muted-foreground">
              لقد استخدمت جميع طلباتك المجانية. اشترك الآن للحصول على طلبات غير محدودة!
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Button asChild variant="default">
                <Link to="/subscription">اشترك الآن</Link>
              </Button>
              <Button variant="outline" onClick={onClose}>
                إلغاء
              </Button>
            </div>
          </div>
        ) : (
          <ApplicationForm 
            onSubmit={handleSubmit} 
            onClose={onClose}
            isSubmitting={isSubmitting}
            remainingFreeApplications={!isSubscribed ? remainingFreeApplications : undefined}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default JobApplication;
