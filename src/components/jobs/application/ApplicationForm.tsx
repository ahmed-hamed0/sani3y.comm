
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const formSchema = z.object({
  proposal: z.string().min(30, {
    message: 'يجب أن يحتوي العرض على 30 حرفًا على الأقل',
  }),
  budget: z.coerce.number().int().positive({
    message: 'يجب أن تكون القيمة رقمًا موجبًا',
  }),
});

export type ApplicationFormValues = z.infer<typeof formSchema>;

interface ApplicationFormProps {
  onSubmit: (values: ApplicationFormValues) => void;
  onClose: () => void;
  isSubmitting: boolean;
  remainingFreeApplications?: number;
}

export const ApplicationForm = ({
  onSubmit,
  onClose,
  isSubmitting,
  remainingFreeApplications
}: ApplicationFormProps) => {
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proposal: '',
      budget: 0,
    },
  });

  const handleSubmit = (values: ApplicationFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {remainingFreeApplications !== undefined && (
          <Alert className="bg-muted">
            <InfoIcon className="h-4 w-4 ml-2" />
            <AlertDescription>
              متبقي لديك <span className="font-bold">{remainingFreeApplications}</span> {remainingFreeApplications === 1 ? 'طلب مجاني' : 'طلبات مجانية'}
            </AlertDescription>
          </Alert>
        )}
        
        <FormField
          control={form.control}
          name="proposal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>العرض المقدم</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="اكتب تفاصيل عرضك هنا..."
                  {...field}
                  rows={5}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>السعر المقترح (جنيه مصري)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 space-x-reverse">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            تقديم العرض
          </Button>
        </div>
      </form>
    </Form>
  );
};
