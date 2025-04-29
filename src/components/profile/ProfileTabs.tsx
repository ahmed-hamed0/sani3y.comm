
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ProfileForm from '@/components/profile/ProfileForm';
import CraftsmanProfileForm from '@/components/profile/CraftsmanProfileForm';
import GallerySection from '@/components/profile/GallerySection';
import MessagesSection from '@/components/profile/MessagesSection';
import ReviewsSection from '@/components/profile/ReviewsSection';

interface ProfileTabsProps {
  profile: any;
}

export const ProfileTabs = ({ profile }: ProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState<string>("personal");

  return (
    <Tabs defaultValue="personal" onValueChange={setActiveTab} value={activeTab}>
      <TabsList className="mb-6 w-full justify-start">
        <TabsTrigger value="personal">المعلومات الشخصية</TabsTrigger>
        {profile.role === 'craftsman' && (
          <>
            <TabsTrigger value="craftsman">معلومات الصنايعي</TabsTrigger>
            <TabsTrigger value="gallery">معرض الأعمال</TabsTrigger>
          </>
        )}
        <TabsTrigger value="messages">الرسائل</TabsTrigger>
        <TabsTrigger value="reviews">التقييمات</TabsTrigger>
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
        <>
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
          
          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle>معرض الأعمال</CardTitle>
              </CardHeader>
              <CardContent>
                <GallerySection profile={profile} />
              </CardContent>
            </Card>
          </TabsContent>
        </>
      )}
      
      <TabsContent value="messages">
        <Card>
          <CardHeader>
            <CardTitle>الرسائل</CardTitle>
          </CardHeader>
          <CardContent>
            <MessagesSection profile={profile} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="reviews">
        <Card>
          <CardHeader>
            <CardTitle>التقييمات</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewsSection profile={profile} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
