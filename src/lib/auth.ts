
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";
import { z } from "zod";

export type AuthError = {
  message: string;
};

// مخطط التحقق من صحة نموذج تسجيل الدخول
export const loginSchema = z.object({
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
  password: z
    .string()
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

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
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

// تسجيل الدخول
export async function signIn({ email, password, rememberMe }: LoginFormValues) {
  try {
    // تحديد خيارات حفظ الجلسة بناءً على حالة "تذكرني"
    const options = rememberMe ? {
      persistSession: true
    } : {
      persistSession: false
    };

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options
    });

    if (error) {
      return { success: false, error: { message: error.message } };
    }

    // إذا كان المستخدم يريد تذكره، قم بتخزين ذلك في localStorage
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }

    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: { message: "حدث خطأ أثناء تسجيل الدخول" } 
    };
  }
}

// إعادة تعيين كلمة المرور
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });

    if (error) {
      return { success: false, error: { message: error.message } };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { message: "حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور" }
    };
  }
}

// تغيير كلمة المرور
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { success: false, error: { message: error.message } };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: { message: "حدث خطأ أثناء تغيير كلمة المرور" }
    };
  }
}

// تسجيل حساب جديد
export async function signUp(values: RegisterFormValues) {
  const { 
    email, 
    password, 
    name, 
    phone, 
    countryCode, 
    governorate, 
    city, 
    role, 
    specialty, 
    bio 
  } = values;
  
  const fullPhone = `${countryCode}${phone}`;
  
  try {
    // 1. إنشاء حساب في نظام المصادقة
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: fullPhone,
          role: role,
          governorate: governorate,
          city: city
        }
      }
    });

    if (authError) {
      return { success: false, error: { message: authError.message } };
    }

    if (!authData.user) {
      return { success: false, error: { message: "فشل إنشاء الحساب" } };
    }

    // إضافة تأخير 1 ثانية لمنع مشاكل تسجيل المستخدم الجديد
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. إنشاء ملف شخصي للمستخدم باستخدام اتصال آخر
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: name,
        phone: fullPhone,
        governorate,
        city,
        role: role as UserRole,
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // لا نريد إرجاع خطأ هنا لأن المستخدم قد تم إنشاؤه بنجاح
      // سيتم إنشاء الملف الشخصي تلقائيًا عند تسجيل الدخول لأول مرة
    }

    // 3. إذا كان المستخدم صنايعي، قم بإنشاء سجل تفاصيل الصنايعي
    if (role === 'craftsman' && specialty) {
      const { error: craftsmanError } = await supabase
        .from('craftsman_details')
        .insert({
          id: authData.user.id,
          specialty,
          bio: bio || '',
        });

      if (craftsmanError) {
        console.error("Craftsman details creation error:", craftsmanError);
        // لا نريد أن نفشل العملية بالكامل إذا فشل إنشاء تفاصيل الصنايعي
        // سيقوم المستخدم بإدخال تفاصيل الصنايعي لاحقًا في صفحة الملف الشخصي
      }
    }

    return { success: true, data: authData };
  } catch (error) {
    console.error("Registration error:", error);
    return { 
      success: false, 
      error: { message: "حدث خطأ أثناء إنشاء الحساب" } 
    };
  }
}

// تسجيل الخروج
export async function signOut() {
  try {
    // إزالة حالة "تذكرني" عند تسجيل الخروج
    localStorage.removeItem('rememberMe');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: { message: error.message } };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: { message: "حدث خطأ أثناء تسجيل الخروج" } 
    };
  }
}

// الحصول على المستخدم الحالي
export async function getCurrentUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { user: null };

    const { data: { user } } = await supabase.auth.getUser();
    return { user };
  } catch (error) {
    return { user: null };
  }
}
