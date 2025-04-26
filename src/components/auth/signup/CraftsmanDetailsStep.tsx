
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormValues } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";

interface CraftsmanDetailsStepProps {
  form: UseFormReturn<RegisterFormValues>;
  isLoading: boolean;
  onPrevStep: () => void;
}

const CraftsmanDetailsStep = ({
  form,
  isLoading,
  onPrevStep,
}: CraftsmanDetailsStepProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">معلومات الصنايعي</h2>
      
      <FormField
        control={form.control}
        name="specialty"
        render={({ field }) => (
          <FormItem>
            <FormLabel>التخصص</FormLabel>
            <FormControl>
              <Input disabled={isLoading} placeholder="مثال: سباكة، كهرباء، نجارة" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>نبذة عنك</FormLabel>
            <FormControl>
              <Textarea 
                disabled={isLoading} 
                placeholder="اكتب نبذة قصيرة عن خبراتك ومهاراتك..." 
                {...field} 
                className="min-h-[120px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevStep}
          disabled={isLoading}
        >
          رجوع
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner size="sm" className="mr-2" /> جارٍ التسجيل...
            </>
          ) : (
            "إنشاء الحساب"
          )}
        </Button>
      </div>
    </div>
  );
};

export default CraftsmanDetailsStep;
