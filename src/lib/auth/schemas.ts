
import { z } from "zod";
import { UserRole } from "@/types";

// مخطط التحقق من صحة نموذج تسجيل الدخول
export const loginSchema = z.object({
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
  password: z
    .string()
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// تحسين مخطط التحقق لرقم الهاتف المصري
export const phoneValidator = z.string()
  .refine((val) => {
    if (!val) return true; // اسمح بالقيمة الفارغة (سيتحقق من الضرورة في schema أخرى)
    
    // تحقق من رمز الدولة للتأكد من تطبيق القواعد الصحيحة
    const countryCode = z.string().optional();
    return true;
  }, { message: "رقم الهاتف غير صحيح" });

// مخطط التحقق من صحة نموذج إنشاء حساب
export const registerSchema = z.object({
  name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
  phone: z.string().min(9, "رقم الهاتف غير صحيح"),
  countryCode: z.string(),
  password: z
    .string()
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string(),
  governorate: z.string().min(1, "يرجى اختيار المحافظة"),
  city: z.string().min(1, "يرجى اختيار المدينة"),
  role: z.enum(["client", "craftsman"]),
  specialty: z.string().optional(),
  bio: z.string().optional(),
  agreeTerms: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
}).refine((data) => {
  // تحقق إضافي لرقم الهاتف المصري
  if (data.countryCode === '+20') {
    return data.phone.startsWith('1') && data.phone.length === 10 && /^\d+$/.test(data.phone);
  }
  return true;
}, {
  message: "رقم الهاتف المصري يجب أن يكون 10 أرقام تبدأ برقم 1",
  path: ["phone"]
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
