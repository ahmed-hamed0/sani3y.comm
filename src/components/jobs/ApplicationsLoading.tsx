
import { Spinner } from "@/components/ui/spinner";

export const ApplicationsLoading = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <Spinner size="lg" />
    </div>
  );
};
