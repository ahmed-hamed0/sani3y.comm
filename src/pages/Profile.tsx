
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { useAuth } from '@/hooks/auth';
import { getUserProfile } from '@/lib/profile';
import { ProfileLoading } from '@/components/profile/ProfileLoading';
import { ProfileError } from '@/components/profile/ProfileError';
import { ProfileNotFound } from '@/components/profile/ProfileNotFound';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { toast } from '@/components/ui/sonner';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { isUploading, handleAvatarUpload } = useAvatarUpload(
    user?.id, 
    (url) => setProfile((prev: any) => ({ ...prev, avatar_url: url }))
  );

  const refreshProfileData = async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    try {
      await refreshProfile();
      
      setIsLoading(true);
      setError(null);
      const { success, data, error: profileError } = await getUserProfile(user.id);
      
      if (success && data) {
        setProfile(data);
        toast("تم تحديث الملف الشخصي بنجاح");
      } else if (profileError) {
        setError(profileError.message || "لم يتم العثور على الملف الشخصي");
        toast("خطأ في التحديث: " + (profileError.message || "لم يتم العثور على الملف الشخصي"), {
          style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
        });
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
      setError("حدث خطأ غير متوقع أثناء تحديث الملف الشخصي");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("Fetching profile for user:", user.id);
        setError(null);
        
        let attempts = 0;
        let success = false;
        let profileData = null;
        let profileError = null;
        
        while (attempts < 3 && !success) {
          attempts++;
          console.log(`Attempt ${attempts} to fetch profile`);
          
          const result = await getUserProfile(user.id);
          success = result.success;
          profileData = result.data;
          profileError = result.error;
          
          if (success && profileData) {
            break;
          }
          
          if (!success && attempts < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (success && profileData) {
          console.log("Profile loaded successfully:", profileData);
          setProfile(profileData);
        } else if (profileError) {
          console.error("Error loading profile after multiple attempts:", profileError);
          setError(profileError.message || "لم يتم العثور على الملف الشخصي");
          
          toast("خطأ في تحميل الملف الشخصي: " + (profileError.message || "لم يتم العثور على الملف الشخصي"), {
            style: { backgroundColor: 'rgb(220, 38, 38)', color: 'white' }
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("حدث خطأ غير متوقع أثناء تحميل الملف الشخصي");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (isLoading) {
    return (
      <MainLayout>
        <ProfileLoading />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <ProfileError 
          error={error} 
          isRefreshing={isRefreshing} 
          onRetry={refreshProfileData} 
        />
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <ProfileNotFound 
          isRefreshing={isRefreshing} 
          onRetry={refreshProfileData} 
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">الملف الشخصي</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <ProfileHeader 
              profile={profile} 
              isUploading={isUploading} 
              onAvatarUpload={handleAvatarUpload} 
            />
          </div>

          <div className="lg:col-span-3">
            <ProfileTabs 
              profile={profile}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
