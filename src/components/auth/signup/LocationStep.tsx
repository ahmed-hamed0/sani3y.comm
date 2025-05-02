
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { governorates, cities } from "@/data/egyptianCities";

const locationSchema = z.object({
  governorate: z.string().min(1, { message: "يجب اختيار المحافظة" }),
  city: z.string().min(1, { message: "يجب اختيار المدينة" }),
  address: z.string().optional(),
  phone: z.string().min(11, { message: "يجب إدخال رقم هاتف صحيح" }).max(11),
});

interface LocationStepProps {
  onPrevStep: () => void;
  onNextStep: () => void;
  formData: any;
  updateFormData: (data: any) => void;
}

export const LocationStep = ({
  onPrevStep,
  onNextStep,
  formData,
  updateFormData,
}: LocationStepProps) => {
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  const form = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      governorate: formData.governorate || "",
      city: formData.city || "",
      address: formData.address || "",
      phone: formData.phone || "",
    },
  });

  const { watch } = form;
  const selectedGovernorate = watch("governorate");

  useEffect(() => {
    if (selectedGovernorate && cities[selectedGovernorate]) {
      setAvailableCities([...cities[selectedGovernorate]]);
    } else {
      setAvailableCities([]);
    }
    
    // Reset city when governorate changes
    if (selectedGovernorate !== formData.governorate) {
      form.setValue("city", "");
    }
  }, [selectedGovernorate, formData.governorate, form]);

  const onSubmit = (data: z.infer<typeof locationSchema>) => {
    updateFormData(data);
    onNextStep();
  };

  return (
    <div className="space-y-6 py-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">تحديد الموقع</h2>
        <p className="text-muted-foreground">يرجى إدخال بيانات الموقع الخاص بك</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="governorate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المحافظة</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المحافظة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {governorates.map((gov) => (
                      <SelectItem key={gov} value={gov}>
                        {gov}
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
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!selectedGovernorate}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المدينة" />
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
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>العنوان التفصيلي (اختياري)</FormLabel>
                <FormControl>
                  <Input placeholder="العنوان التفصيلي" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الهاتف</FormLabel>
                <FormControl>
                  <Input placeholder="ادخل رقم الهاتف" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onPrevStep}>
              السابق
            </Button>
            <Button type="submit">التالي</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
