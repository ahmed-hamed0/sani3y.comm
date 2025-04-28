
import { useState } from 'react';
import { uploadAvatar } from '@/lib/profile';
import { toast } from '@/components/ui/sonner';

export const useAvatarUpload = (userId: string | undefined, onSuccess: (url: string) => void) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !userId) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast("حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
      return;
    }

    setIsUploading(true);
    try {
      const { success, url, error } = await uploadAvatar(userId, file);
      if (success && url) {
        onSuccess(url);
        toast("تم تحديث الصورة الشخصية بنجاح");
      } else if (error) {
        toast("خطأ في تحميل الصورة: " + error.message, {
          style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
        });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast("خطأ في تحميل الصورة: حدث خطأ غير متوقع أثناء تحميل الصورة", {
        style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
      });
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, handleAvatarUpload };
};
