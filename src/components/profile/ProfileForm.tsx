
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/lib/profile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/sonner';

// تعريف مخطط التحقق للنموذج
const profileSchema = z.object({
  full_name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  phone: z.string().min(9, 'رقم الهاتف غير صحيح'),
  governorate: z.string().min(1, 'يرجى إدخال المحافظة'),
  city: z.string().min(1, 'يرجى إدخال المدينة'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: any;
}

const ProfileForm = ({ profile }: ProfileFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast: hookToast } = useToast();
  const { user } = useAuth();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      phone: profile?.phone?.replace(/^\+\d+/, '') || '',
      governorate: profile?.governorate || '',
      city: profile?.city || '',
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { success, error } = await updateUserProfile(user.id, values);
      
      if (success) {
        toast("تم تحديث المعلومات الشخصية بنجاح");
      } else if (error) {
        toast("خطأ في التحديث: " + error.message, {
          style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast("خطأ في النظام: حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
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
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم الكامل</FormLabel>
              <FormControl>
                <Input disabled={isLoading} {...field} />
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
                <div className="flex">
                  <div className="bg-muted px-3 py-2 border border-input rounded-r-md">
                    {profile?.phone?.match(/^\+\d+/)?.[0] || '+20'}
                  </div>
                  <Input 
                    className="rounded-r-none flex-1" 
                    disabled={isLoading} 
                    {...field} 
                    dir="ltr"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="governorate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>المحافظة</FormLabel>
                <FormControl>
                  <Input disabled={isLoading} {...field} />
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
                  <Input disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'جارِ الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
