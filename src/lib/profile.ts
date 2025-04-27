
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";

// الحصول على الملف الشخصي
export async function getUserProfile(userId: string) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();  // استخدام maybeSingle بدلاً من single لتجنب الأخطاء
    
    if (error) {
      console.error("Error fetching profile:", error);
      return { success: false, error: { message: error.message } };
    }
    
    // إذا لم يكن هناك ملف شخصي، قم بإنشاء ملف شخصي جديد
    if (!profile) {
      console.log("No profile found, creating a new one for user:", userId);
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData && userData.user) {
        // إنشاء ملف شخصي افتراضي
        const defaultRole: UserRole = 'client'; // الدور الافتراضي هو عميل
        
        const { data: newProfile, error: createError } = await createUserProfile({
          id: userId,
          full_name: userData.user.email?.split('@')[0] || 'مستخدم جديد',
          role: defaultRole,
          phone: '',
          governorate: '',
          city: '',
        });
        
        if (createError) {
          console.error("Error creating new profile:", createError);
          return { 
            success: false, 
            error: { message: "فشل في إنشاء ملف شخصي جديد" } 
          };
        }
        
        console.log("New profile created successfully:", newProfile);
        return { success: true, data: newProfile };
      }
      
      return { 
        success: false, 
        error: { message: "لم يتم العثور على الملف الشخصي" } 
      };
    }

    // إذا كان الملف الشخصي لصنايعي، احصل على تفاصيل إضافية
    if (profile.role === 'craftsman') {
      const { data: craftsmanDetails, error: detailsError } = await supabase
        .from('craftsman_details')
        .select('*')
        .eq('id', userId)
        .maybeSingle();  // استخدام maybeSingle هنا أيضًا
      
      if (!detailsError && craftsmanDetails) {
        return { 
          success: true, 
          data: { ...profile, ...craftsmanDetails } 
        };
      }
    }

    return { success: true, data: profile };
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return { 
      success: false, 
      error: { message: "فشل في الحصول على الملف الشخصي" } 
    };
  }
}

// وظيفة إنشاء ملف شخصي
export async function createUserProfile(profileData: {
  id: string;
  full_name: string;
  role: UserRole;
  phone: string;
  governorate: string;
  city: string;
  avatar_url?: string;
}) {
  try {
    console.log("Creating new user profile with data:", profileData);
    const { error } = await supabase
      .from('profiles')
      .insert([profileData]);
    
    if (error) {
      console.error("Error creating profile:", error);
      return { success: false, error: { message: error.message } };
    }

    // إنشاء تفاصيل الصنايعي إذا كان الدور هو صنايعي
    if (profileData.role === 'craftsman') {
      const { error: craftsmanError } = await supabase
        .from('craftsman_details')
        .insert([{
          id: profileData.id,
          specialty: 'عام', // تخصص افتراضي
          bio: '',
          skills: [],
          is_available: true
        }]);
      
      if (craftsmanError) {
        console.error("Error creating craftsman details:", craftsmanError);
        // لا نريد أن نفشل العملية بالكامل إذا فشل إنشاء تفاصيل الصنايعي
      }
    }

    return { 
      success: true, 
      data: profileData 
    };
  } catch (error) {
    console.error("Error in createUserProfile:", error);
    return { 
      success: false, 
      error: { message: "فشل في إنشاء الملف الشخصي" } 
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
