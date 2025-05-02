
import { supabase } from "@/integrations/supabase/client";

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
