
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface ProfileHeaderProps {
  profile: any;
  isUploading: boolean;
  onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileHeader = ({ profile, isUploading, onAvatarUpload }: ProfileHeaderProps) => {
  return (
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
                onChange={onAvatarUpload}
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
  );
};
