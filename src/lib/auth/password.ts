
import { supabase } from "@/integrations/supabase/client";

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
