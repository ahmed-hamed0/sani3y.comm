
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useJobApplication } from "@/hooks/useJobApplication";
import { ApplicationForm } from "./application/ApplicationForm";
import { LoadingState } from "./application/LoadingState";

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
  const { isSubmitting, submitApplication } = useJobApplication(jobId, onSuccess, onClose);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">تقديم عرض على المهمة</DialogTitle>
        </DialogHeader>

        {isSubmitting ? (
          <LoadingState />
        ) : (
          <ApplicationForm 
            onSubmit={submitApplication} 
            onClose={onClose}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default JobApplication;
