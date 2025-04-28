
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ProfileForm from '@/components/profile/ProfileForm';
import CraftsmanProfileForm from '@/components/profile/CraftsmanProfileForm';

interface ProfileTabsProps {
  profile: any;
}

export const ProfileTabs = ({ profile }: ProfileTabsProps) => {
  return (
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
  );
};
