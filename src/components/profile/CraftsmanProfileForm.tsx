
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { updateCraftsmanDetails } from '@/lib/profile';
import { useAuth } from '@/hooks/useAuth';

// تعريف مخطط التحقق للنموذج
const craftsmanSchema = z.object({
  specialty: z.string().min(1, 'يرجى إدخال التخصص'),
  bio: z.string().optional(),
  is_available: z.boolean().default(true),
});

type CraftsmanFormValues = z.infer<typeof craftsmanSchema>;

interface CraftsmanProfileFormProps {
  profile: any;
}

const CraftsmanProfileForm = ({ profile }: CraftsmanProfileFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<CraftsmanFormValues>({
    resolver: zodResolver(craftsmanSchema),
    defaultValues: {
      specialty: profile?.specialty || '',
      bio: profile?.bio || '',
      is_available: profile?.is_available !== false, // إذا كانت القيمة undefined تكون true
    },
  });

  const onSubmit = async (values: CraftsmanFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { success, error } = await updateCraftsmanDetails(user.id, values);
      
      if (success) {
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث معلومات الصنايعي بنجاح',
        });
      } else if (error) {
        toast({
          title: 'خطأ في التحديث',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating craftsman details:', error);
      toast({
        title: 'خطأ في النظام',
        description: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="specialty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>التخصص</FormLabel>
              <FormControl>
                <Input 
                  disabled={isLoading} 
                  placeholder="مثال: سباكة، كهرباء، نجارة" 
                  {...field} 
                />
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
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_available"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">متاح للعمل</FormLabel>
                <FormMessage />
              </div>
              <FormControl>
                <Switch 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'جارِ الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </form>
    </Form>
  );
};

export default CraftsmanProfileForm;
