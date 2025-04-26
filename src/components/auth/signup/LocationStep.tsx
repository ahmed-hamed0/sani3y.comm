
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormValues } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";

interface LocationStepProps {
  form: UseFormReturn<RegisterFormValues>;
  role: string;
  isLoading: boolean;
  onPrevStep: () => void;
  onNextStep?: (e: React.FormEvent) => void;
}

const LocationStep = ({
  form,
  role,
  isLoading,
  onPrevStep,
  onNextStep,
}: LocationStepProps) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">معلومات الموقع</h2>
      
      <FormField
        control={form.control}
        name="governorate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>المحافظة</FormLabel>
            <FormControl>
              <Input disabled={isLoading} placeholder="المحافظة" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>المدينة</FormLabel>
            <FormControl>
              <Input disabled={isLoading} placeholder="المدينة" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="agreeTerms"
        render={({ field }) => (
          <FormItem className="flex items-start space-x-3 space-x-reverse space-y-0 rounded-md">
            <FormControl>
              <Checkbox 
                checked={field.value} 
                onCheckedChange={field.onChange}
                disabled={isLoading} 
              />
            </FormControl>
            <FormLabel className="font-normal">
              أوافق على <a href="/terms" className="text-primary hover:underline">شروط الخدمة</a> و <a href="/privacy" className="text-primary hover:underline">سياسة الخصوصية</a>
            </FormLabel>
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
        {role === 'craftsman' && onNextStep ? (
          <Button
            type="button"
            onClick={onNextStep}
            disabled={isLoading}
          >
            التالي
          </Button>
        ) : (
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" /> جارٍ التسجيل...
              </>
            ) : (
              "إنشاء الحساب"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default LocationStep;
