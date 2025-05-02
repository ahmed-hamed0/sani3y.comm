
import { supabase } from "@/integrations/supabase/client";
import { RegisterFormValues } from "./schemas";
import { UserRole } from "@/types";

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
  
  // تحسين التعامل مع رقم الهاتف
  let fullPhone = phone;
  if (!phone.startsWith(countryCode)) {
    fullPhone = `${countryCode}${phone}`;
  }
  
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
