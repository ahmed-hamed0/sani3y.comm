import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserProfile, uploadAvatar } from '@/lib/profile';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import ProfileForm from '@/components/profile/ProfileForm';
import CraftsmanProfileForm from '@/components/profile/CraftsmanProfileForm';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast: hookToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("Fetching profile for user:", user.id);
        setError(null);
        
        // Try up to 3 times to fetch the profile
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
          
          // Wait before retrying
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
          
          toast({
            description: "خطأ في تحميل الملف الشخصي: " + (profileError.message || "لم يتم العثور على الملف الشخصي"),
            variant: "destructive"
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast({
        description: "خطأ في تحميل الصورة: حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const { success, url, error } = await uploadAvatar(user.id, file);
      if (success && url) {
        setProfile((prev: any) => ({ ...prev, avatar_url: url }));
        toast({
          description: "تم تحديث الصورة الشخصية بنجاح"
        });
      } else if (error) {
        toast({
          description: "خطأ في تحميل الصورة: " + error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        description: "خطأ في تحميل الصورة: حدث خطأ غير متوقع أثناء تحميل الصورة",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const refreshProfileData = async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    try {
      // First refresh the auth context profile
      await refreshProfile();
      
      // Then fetch the profile data again
      setIsLoading(true);
      setError(null);
      const { success, data, error: profileError } = await getUserProfile(user.id);
      
      if (success && data) {
        setProfile(data);
        toast({
          description: "تم تحديث الملف الشخصي بنجاح"
        });
      } else if (profileError) {
        setError(profileError.message || "لم يتم العثور على الملف الشخصي");
        toast({
          description: "خطأ في التحديث: " + (profileError.message || "لم يتم العثور على الملف الشخصي"),
          variant: "destructive"
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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <div className="flex justify-center items-center h-60">
            <Spinner size="lg" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>خطأ في تحميل الملف الشخصي</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="flex justify-center mt-6">
            <Button 
              variant="outline" 
              onClick={refreshProfileData} 
              className="mr-4"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Spinner size="sm" className="ml-2" /> جاري التحديث...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 ml-2" /> إعادة المحاولة
                </>
              )}
            </Button>
            <Button onClick={() => navigate('/')}>العودة إلى الصفحة الرئيسية</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="container-custom py-12">
          <Alert variant="default" className="mb-6 bg-yellow-50 border-yellow-200 text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>الملف الشخصي غير موجود</AlertTitle>
            <AlertDescription>لم يتم العثور على بيانات الملف الشخصي الخاص بك</AlertDescription>
          </Alert>
          
          <div className="flex justify-center mt-6">
            <Button 
              variant="outline" 
              onClick={refreshProfileData} 
              className="mr-4"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Spinner size="sm" className="ml-2" /> جاري التحديث...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 ml-2" /> إعادة المحاولة
                </>
              )}
            </Button>
            <Button onClick={() => navigate('/')}>العودة إلى الصفحة الرئيسية</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">الملف الشخصي</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar className="w-32 h-32">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.full_name}
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-primary text-primary-foreground w-full h-full flex items-center justify-center text-3xl">
                          {profile.full_name?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-full bg-background"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? <Spinner size="sm" /> : "📷"}
                      </Button>
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarUpload}
                      />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold">{profile.full_name}</h2>
                  <p className="text-muted-foreground">
                    {profile.role === 'craftsman' ? 'صنايعي' : 'عميل'}
                    {profile.specialty && ` - ${profile.specialty}`}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.governorate && profile.city && `${profile.governorate}، ${profile.city}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Tabs defaultValue="personal">
              <TabsList className="mb-6 w-full justify-start">
                <TabsTrigger value="personal">المعلومات الشخصية</TabsTrigger>
                {profile.role === 'craftsman' && (
                  <TabsTrigger value="craftsman">معلومات الصنايعي</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>المعلومات الشخصية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProfileForm profile={profile} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {profile.role === 'craftsman' && (
                <TabsContent value="craftsman">
                  <Card>
                    <CardHeader>
                      <CardTitle>معلومات الصنايعي</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CraftsmanProfileForm profile={profile} />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
