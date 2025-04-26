
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";

// الحصول على الملف الشخصي
export async function getUserProfile(userId: string) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      return { success: false, error: { message: error.message } };
    }

    // إذا كان الملف الشخصي لصنايعي، احصل على تفاصيل إضافية
    if (profile.role === 'craftsman') {
      const { data: craftsmanDetails, error: detailsError } = await supabase
        .from('craftsman_details')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!detailsError && craftsmanDetails) {
        return { 
          success: true, 
          data: { ...profile, ...craftsmanDetails } 
        };
      }
    }

    return { success: true, data: profile };
  } catch (error) {
    return { 
      success: false, 
      error: { message: "فشل في الحصول على الملف الشخصي" } 
    };
  }
}

// تحديث الملف الشخصي
export async function updateUserProfile(
  userId: string, 
  profileData: {
    full_name?: string;
    phone?: string;
    governorate?: string;
    city?: string;
  }
) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);
    
    if (error) {
      return { success: false, error: { message: error.message } };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: { message: "فشل في تحديث الملف الشخصي" } 
    };
  }
}

// تحديث تفاصيل الصنايعي
export async function updateCraftsmanDetails(
  userId: string,
  data: {
    specialty?: string;
    bio?: string;
    skills?: string[];
    is_available?: boolean;
  }
) {
  try {
    const { error } = await supabase
      .from('craftsman_details')
      .update(data)
      .eq('id', userId);
    
    if (error) {
      return { success: false, error: { message: error.message } };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: { message: "فشل في تحديث تفاصيل الصنايعي" } 
    };
  }
}

// تحميل صورة شخصية
export async function uploadAvatar(userId: string, file: File) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      return { success: false, error: { message: uploadError.message } };
    }

    const { data: publicURL } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicURL.publicUrl })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: { message: updateError.message } };
    }

    return { success: true, url: publicURL.publicUrl };
  } catch (error) {
    return { 
      success: false, 
      error: { message: "فشل في تحميل الصورة" } 
    };
  }
}

// تحميل صور لمعرض الأعمال
export async function uploadGalleryImage(userId: string, file: File) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase
      .storage
      .from('gallery')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      return { success: false, error: { message: uploadError.message } };
    }

    const { data: publicURL } = supabase
      .storage
      .from('gallery')
      .getPublicUrl(filePath);

    // إضافة الصورة إلى مصفوفة معرض الأعمال
    const { data: craftsmanData, error: getError } = await supabase
      .from('craftsman_details')
      .select('gallery')
      .eq('id', userId)
      .single();

    if (getError || !craftsmanData) {
      return { success: false, error: { message: getError?.message || "فشل في تحديث المعرض" } };
    }

    const updatedGallery = [...(craftsmanData.gallery || []), publicURL.publicUrl];

    const { error: updateError } = await supabase
      .from('craftsman_details')
      .update({ gallery: updatedGallery })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: { message: updateError.message } };
    }

    return { success: true, url: publicURL.publicUrl };
  } catch (error) {
    return { 
      success: false, 
      error: { message: "فشل في تحميل الصورة للمعرض" } 
    };
  }
}

// حذف صورة من معرض الأعمال
export async function removeGalleryImage(userId: string, imageUrl: string) {
  try {
    // الحصول على المعرض الحالي
    const { data: craftsmanData, error: getError } = await supabase
      .from('craftsman_details')
      .select('gallery')
      .eq('id', userId)
      .single();

    if (getError || !craftsmanData) {
      return { success: false, error: { message: getError?.message || "فشل في تحديث المعرض" } };
    }

    // إزالة الصورة من المصفوفة
    const updatedGallery = (craftsmanData.gallery || []).filter(url => url !== imageUrl);

    // تحديث معرض الأعمال
    const { error: updateError } = await supabase
      .from('craftsman_details')
      .update({ gallery: updatedGallery })
      .eq('id', userId);

    if (updateError) {
      return { success: false, error: { message: updateError.message } };
    }

    // محاولة حذف الملف من التخزين
    // استخراج المسار من URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const filePath = `${userId}/${fileName}`;

    await supabase
      .storage
      .from('gallery')
      .remove([filePath]);

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: { message: "فشل في حذف الصورة من المعرض" } 
    };
  }
}
