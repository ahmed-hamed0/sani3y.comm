
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { RegisterFormValues } from '@/lib/auth';

interface BasicInfoStepProps {
  form: UseFormReturn<RegisterFormValues>;
  onNextStep: (e: React.FormEvent) => void;
}

const BasicInfoStep = ({ form, onNextStep }: BasicInfoStepProps) => {
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <Label>نوع الحساب</Label>
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup 
                  value={field.value} 
                  onValueChange={field.onChange}
                  className="flex justify-center gap-8 mt-3"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="client" id="client" />
                    <Label htmlFor="client" className="cursor-pointer">عميل</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="craftsman" id="craftsman" />
                    <Label htmlFor="craftsman" className="cursor-pointer">صنايعي</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="name">الاسم الكامل</Label>
            <FormControl>
              <Input id="name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <FormControl>
              <Input id="email" type="email" {...field} />
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
            <Label htmlFor="phone">رقم الهاتف</Label>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field: countryField }) => (
                  <Select
                    value={countryField.value}
                    onValueChange={countryField.onChange}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+20">🇪🇬 +20</SelectItem>
                      <SelectItem value="+966">🇸🇦 +966</SelectItem>
                      <SelectItem value="+971">🇦🇪 +971</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FormControl>
                <Input 
                  id="phone" 
                  type="tel"
                  value={field.value}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^\d]/g, '');
                    field.onChange(cleaned);
                  }}
                  className="flex-1 text-left"
                  dir="ltr"
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="password">كلمة المرور</Label>
            <FormControl>
              <Input id="password" type="password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
            <FormControl>
              <Input id="confirmPassword" type="password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="mt-6">
        <Button 
          type="button"
          onClick={onNextStep}
          className="w-full"
        >
          التالي
        </Button>
      </div>
    </div>
  );
};

export default BasicInfoStep;
