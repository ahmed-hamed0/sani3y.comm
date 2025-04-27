
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
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

// تعريف مخطط التحقق للنموذج
const craftsmanSchema = z.object({
  specialty: z.string().min(1, 'يرجى إدخال التخصص'),
  bio: z.string().optional(),
  is_available: z.boolean().default(true),
  skills: z.array(z.string()).default([]),
});

type CraftsmanFormValues = z.infer<typeof craftsmanSchema>;

interface CraftsmanProfileFormProps {
  profile: any;
}

const CraftsmanProfileForm = ({ profile }: CraftsmanProfileFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<CraftsmanFormValues>({
    resolver: zodResolver(craftsmanSchema),
    defaultValues: {
      specialty: profile?.specialty || '',
      bio: profile?.bio || '',
      is_available: profile?.is_available !== false, // إذا كانت القيمة undefined تكون true
      skills: profile?.skills || [],
    },
  });

  const { setValue, watch } = form;
  const currentSkills = watch('skills');

  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    // تجنب تكرار المهارات
    if (!currentSkills.includes(newSkill.trim())) {
      setValue('skills', [...currentSkills, newSkill.trim()]);
    }
    
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    setValue('skills', currentSkills.filter(skill => skill !== skillToRemove));
  };

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
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
        
        <div>
          <FormLabel>المهارات</FormLabel>
          <div className="flex gap-2 mb-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="أضف مهارة جديدة"
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={addSkill}
              disabled={isLoading || !newSkill.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {currentSkills.length > 0 ? (
              currentSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="pl-3 pr-2 py-1.5">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:text-destructive focus:outline-none"
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">أضف مهاراتك هنا</p>
            )}
          </div>
        </div>

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
          {isLoading ? (
            <>
              <Spinner size="sm" className="mr-2" /> جارِ الحفظ...
            </>
          ) : (
            'حفظ التغييرات'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default CraftsmanProfileForm;
