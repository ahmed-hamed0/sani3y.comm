
import { Button } from "@/components/ui/button";
import {
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const applicantSchema = z.object({
  budget: z.number().min(1, { message: "يجب تحديد تكلفة مناسبة" }),
  proposal: z.string().min(10, {
    message: "يجب أن يكون العرض 10 أحرف على الأقل",
  }),
});

export type ApplicationFormValues = z.infer<typeof applicantSchema>;

interface ApplicationFormProps {
  onSubmit: (values: ApplicationFormValues) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
}

export const ApplicationForm = ({ onSubmit, onClose, isSubmitting }: ApplicationFormProps) => {
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicantSchema),
    defaultValues: {
      budget: 0,
      proposal: "",
    },
  });

  const handleSubmit = async (values: ApplicationFormValues) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>التكلفة المقترحة (جنيه مصري)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="أدخل القيمة المناسبة"
                  {...field}
                  onChange={(e) => field.onChange(+e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="proposal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تفاصيل العرض</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="اكتب تفاصيل عرضك وخبرتك في مثل هذا النوع من المهام..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            إلغاء
          </Button>
          <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
            إرسال العرض
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
