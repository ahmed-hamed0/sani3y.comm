
import { supabase } from "@/integrations/supabase/client";

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
