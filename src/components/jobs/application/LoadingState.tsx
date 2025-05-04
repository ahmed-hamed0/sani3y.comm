
import { Spinner } from "@/components/ui/spinner";

export const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Spinner size="lg" />
      <p className="mt-4 text-center text-muted-foreground">
        جاري إرسال العرض...
      </p>
    </div>
  );
};
