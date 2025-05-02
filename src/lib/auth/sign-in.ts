
import { supabase } from "@/integrations/supabase/client";
import { LoginFormValues } from "./schemas";

// تسجيل الدخول
export async function signIn({ email, password, rememberMe }: LoginFormValues) {
  try {
    // تحديد خيارات حفظ الجلسة بناءً على حالة "تذكرني"
    const options = {
      persistSession: rememberMe ? true : false
    };

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options
    } as any);

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
