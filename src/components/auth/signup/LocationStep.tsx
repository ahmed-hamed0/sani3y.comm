
import { Button } from "@/components/ui/button";
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
import { egyptianGovernorates } from "@/data/egyptianGovernorates";
import { egyptianCities } from "@/data/egyptianCities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";

interface LocationStepProps {
  form: UseFormReturn<RegisterFormValues>;
  role: "client" | "craftsman";
  isLoading: boolean;
  onPrevStep: () => void;
  // Fix: Change onNextStep to accept a React.FormEvent parameter
  onNextStep?: (e: React.FormEvent) => void;
}

const LocationStep = ({
  form,
  role,
  isLoading,
  onPrevStep,
  onNextStep,
}: LocationStepProps) => {
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const selectedGovernorate = form.watch("governorate");

  useEffect(() => {
    if (selectedGovernorate) {
      const cities = egyptianCities[selectedGovernorate] || [];
      setAvailableCities(cities);

      // إذا كانت المدينة المحددة حاليًا غير متاحة في المحافظة الجديدة، قم بمسحها
      const currentCity = form.getValues("city");
      if (currentCity && !cities.includes(currentCity)) {
        form.setValue("city", "");
      }
    }
  }, [selectedGovernorate, form]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">
        {role === "client" ? "معلومات العميل" : "معلومات الصنايعي"}
      </h2>

      <FormField
        control={form.control}
        name="governorate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>المحافظة</FormLabel>
            <Select
              disabled={isLoading}
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المحافظة" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {egyptianGovernorates.map((governorate) => (
                  <SelectItem key={governorate} value={governorate}>
                    {governorate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select
              disabled={isLoading || !selectedGovernorate}
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedGovernorate
                        ? "اختر المحافظة أولاً"
                        : "اختر المدينة"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="agreeTerms"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-x-reverse space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                disabled={isLoading}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                أوافق على{" "}
                <a
                  href="/terms"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  الشروط والأحكام
                </a>{" "}
                و{" "}
                <a
                  href="/privacy"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  سياسة الخصوصية
                </a>
              </FormLabel>
              <FormMessage />
            </div>
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
        {role === "craftsman" && onNextStep ? (
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
