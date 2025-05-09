
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";

// الحصول على الملف الشخصي
export async function getUserProfile(userId: string) {
  if (!userId) {
    console.error("getUserProfile called without userId");
    return { 
      success: false, 
      error: { message: "معرف المستخدم غير متوفر" } 
    };
  }

  try {
    console.log("Getting profile for user ID:", userId);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching profile:", error);
      return { success: false, error: { message: error.message } };
    }
    
    // إذا لم يكن هناك ملف شخصي، قم بإنشاء ملف شخصي جديد
    if (!profile) {
      console.log("No profile found, attempting to create a new one for user:", userId);
      
      try {
        // الحصول على بيانات المستخدم من نظام المصادقة
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData && userData.user) {
          // إنشاء ملف شخصي افتراضي
          const defaultRole: UserRole = 'client'; // الدور الافتراضي هو عميل
          const userEmail = userData.user.email;
          const metadata = userData.user.user_metadata || {};
          const fullName = metadata.full_name || userEmail?.split('@')[0] || 'مستخدم جديد';
          
          const newProfileData = {
            id: userId,
            full_name: fullName,
            role: defaultRole,
            phone: metadata.phone || '+201000000000', // رقم افتراضي لتجنب مشكلات التحقق
            governorate: metadata.governorate || 'القاهرة', // قيمة افتراضية
            city: metadata.city || 'القاهرة', // قيمة افتراضية
          };
          
          console.log("Creating profile with data:", newProfileData);
          
          // تحقق مما إذا كان الملف الشخصي موجود قبل محاولة الإنشاء (لتفادي الخطأ)
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .maybeSingle();
            
          if (existingProfile) {
            console.log("Profile already exists, fetching it again");
            const { data: refetchedProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();
              
            return { success: true, data: refetchedProfile };
          }
          
          // محاولة إنشاء الملف الشخصي
          try {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([newProfileData])
              .select()
              .maybeSingle();
            
            if (createError) {
              console.error("Error creating profile in getUserProfile:", createError);
              return { 
                success: false, 
                error: { message: "فشل في إنشاء ملف شخصي جديد: " + createError.message } 
              };
            }
            
            if (newProfile) {
              console.log("New profile created successfully:", newProfile);
              
              // إنشاء تفاصيل الصنايعي إذا كان الدور هو صنايعي
              if (newProfile.role === 'craftsman') {
                const { error: craftsmanError } = await supabase
                  .from('craftsman_details')
                  .insert([{
                    id: userId,
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
              
              return { success: true, data: newProfile };
            }
          } catch (insertError) {
            console.error("Exception creating profile:", insertError);
            return { 
              success: false, 
              error: { message: "خطأ في إنشاء الملف الشخصي" } 
            };
          }
        }
      } catch (error) {
        console.error("Error during profile creation in getUserProfile:", error);
      }
      
      return { 
        success: false, 
        error: { message: "لم يتم العثور على الملف الشخصي ولم يتمكن من إنشاء ملف جديد" } 
      };
    }

    // إذا كان الملف الشخصي لصنايعي، احصل على تفاصيل إضافية
    if (profile.role === 'craftsman') {
      const { data: craftsmanDetails, error: detailsError } = await supabase
        .from('craftsman_details')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
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
  if (!profileData.id) {
    return { 
      success: false, 
      error: { message: "معرف المستخدم مطلوب" } 
    };
  }

  try {
    console.log("Creating new user profile with data:", profileData);
    
    // التحقق من عدم وجود ملف شخصي مسبق
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', profileData.id)
      .maybeSingle();
      
    if (existingProfile) {
      console.log("Profile already exists, returning it:", existingProfile);
      const { data: fullProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileData.id)
        .single();
        
      return { success: true, data: fullProfile };
    }
    
    // إنشاء ملف شخصي جديد مع محاولات متكررة
    let attempts = 0;
    let success = false;
    let error = null;
    let newProfile = null;
    
    while (attempts < 3 && !success) {
      attempts++;
      console.log(`Creating profile attempt ${attempts}`);
      
      try {
        const result = await supabase
          .from('profiles')
          .insert([profileData])
          .select()
          .maybeSingle();
          
        error = result.error;
        newProfile = result.data;
        
        if (!error && newProfile) {
          success = true;
          console.log("Profile created successfully on attempt", attempts);
        } else {
          console.error("Error on attempt", attempts, error);
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (e) {
        console.error("Exception during profile creation attempt", attempts, e);
      }
    }
    
    if (!success) {
      return { 
        success: false, 
        error: { message: error ? error.message : "فشل في إنشاء الملف الشخصي بعد عدة محاولات" } 
      };
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
      data: newProfile || profileData 
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
